import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { decrypt, encrypt } from '@/lib/crypto';
import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req) {
    console.log("TikTok Sync: Request received");
    const session = await getServerSession(authOptions);
    console.log("TikTok Sync: Session Result:", JSON.stringify(session, null, 2));

    if (!session?.user?.email) {
        console.error("TikTok Sync: No session or email found. Returning 401.");
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const userEmail = session.user.email;
    console.log("TikTok Sync: Authenticated as", userEmail);
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // DEBUG: Check what rows exist for this user
        const [allRows] = await connection.query(
            `SELECT id, platform, is_active, user_email FROM social_connect WHERE user_email = ?`,
            [userEmail]
        );
        console.log(`TikTok Sync DEBUG: Found ${allRows.length} rows for ${userEmail}:`, JSON.stringify(allRows, null, 2));

        // 1. Get TikTok Access Token
        const [rows] = await connection.query(
            `SELECT access_token_encrypted, refresh_token_encrypted FROM social_connect WHERE user_email = ? AND platform = 'tiktok' AND is_active = TRUE`,
            [userEmail]
        );

        if (rows.length === 0 || !rows[0].access_token_encrypted) {
            // Check for inactive connection to give better error
            const [inactive] = await connection.query(
                `SELECT id FROM social_connect WHERE user_email = ? AND platform = 'tiktok'`,
                [userEmail]
            );
            if (inactive.length > 0) {
                throw new Error('TikTok connection is inactive. Please reconnect your account.');
            }
            throw new Error('TikTok account not found. Please connect your account.');
        }

        let accessToken = decrypt(rows[0].access_token_encrypted);
        const refreshToken = rows[0].refresh_token_encrypted ? decrypt(rows[0].refresh_token_encrypted) : null;

        // Helper to fetch videos
        const fetchVideos = async (token) => {
            const url = 'https://open.tiktokapis.com/v2/video/list/';
            const body = {
                max_count: 20,
                fields: ['id', 'title', 'cover_image_url', 'create_time', 'like_count', 'comment_count', 'share_count', 'view_count']
            };
            return await axios.post(url, body, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
        };

        let response;
        try {
            response = await fetchVideos(accessToken);
        } catch (initialError) {
            // If 401 and we have a refresh token, try to refresh
            if (initialError.response?.status === 401 && refreshToken) {
                console.log("TikTok Sync: 401 received. Attempting token refresh...");
                try {
                    const refreshUrl = 'https://open.tiktokapis.com/v2/oauth/token/';
                    const refreshParams = new URLSearchParams({
                        client_key: process.env.TIKTOK_CLIENT_KEY,
                        client_secret: process.env.TIKTOK_CLIENT_SECRET,
                        grant_type: 'refresh_token',
                        refresh_token: refreshToken
                    });

                    const refreshRes = await axios.post(refreshUrl, refreshParams, {
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                    });

                    const newData = refreshRes.data.data || refreshRes.data; // TikTok response variance
                    if (newData.access_token) {
                        accessToken = newData.access_token;
                        const newRefreshToken = newData.refresh_token || refreshToken;

                        // Update DB with new tokens
                        const expiresAt = new Date(Date.now() + (newData.expires_in * 1000));
                        await connection.query(
                            `UPDATE social_connect SET access_token_encrypted = ?, refresh_token_encrypted = ?, expires_at = ? WHERE user_email = ? AND platform = 'tiktok'`,
                            [encrypt(accessToken), encrypt(newRefreshToken), expiresAt, userEmail]
                        );
                        console.log("TikTok Sync: Token refreshed and saved. Retrying fetch...");

                        // Retry fetch with new token
                        response = await fetchVideos(accessToken);
                    } else {
                        throw initialError; // Refresh failed to give token
                    }
                } catch (refreshErr) {
                    console.error("TikTok Token Refresh Failed:", refreshErr.response?.data || refreshErr.message);
                    throw initialError; // Throw original error to trigger failure handling
                }
            } else {
                throw initialError;
            }
        }

        if (response.data.error && response.data.error.code !== 0) {
            throw new Error(`TikTok API Error: ${response.data.error.message}`);
        }

        const videos = response.data.data?.videos || [];

        if (videos.length === 0) {
            console.log("TikTok Sync: No videos found.");
            await connection.commit();
            return NextResponse.json({ message: 'Sync complete. No posts found on TikTok account.' });
        }

        let postsUpserted = 0;

        for (const video of videos) {
            const postedAt = new Date(video.create_time * 1000); // create_time is unix timestamp in seconds

            await connection.query(
                `INSERT INTO historical_social_posts (user_email, platform, platform_post_id, content, likes, shares, impressions, posted_at, updated_at)
                 VALUES (?, 'tiktok', ?, ?, ?, ?, ?, ?, NOW())
                 ON DUPLICATE KEY UPDATE
                 likes = VALUES(likes), shares = VALUES(shares), impressions = VALUES(impressions), updated_at = NOW();`,
                [
                    userEmail,
                    video.id,
                    video.title || '',
                    video.like_count || 0,
                    video.share_count || 0,
                    video.view_count || 0, // impressions mapped to view_count
                    postedAt
                ]
            );
            postsUpserted++;
        }

        // 3. Log Sync
        await connection.query(`INSERT INTO analysis_reports (user_email, report_type) VALUES (?, 'tiktok_sync')`, [userEmail]);

        await connection.commit();

        return NextResponse.json({ message: `Sync complete. ${postsUpserted} videos from TikTok were updated.` });

    } catch (error) {
        if (connection) await connection.rollback();
        const errorDetail = error.response?.data || error.message;
        console.error("Error syncing TikTok posts:", JSON.stringify(errorDetail, null, 2));

        // Check for Auth/Scope Errors
        const status = error.response?.status;
        const errorMsg = JSON.stringify(error.response?.data || error.message || '');

        if (status === 401 || errorMsg.includes('scope_not_authorized') || errorMsg.includes('invalid_grant')) {
            console.warn(`TikTok Auth Error (${status}): ${errorMsg}`);

            // SPECIAL HANDLING: If scope is missing (e.g. video.list), don't fail, just warn.
            if (errorMsg.includes('scope_not_authorized')) {
                // We commit because the connection is technically "valid" for posting (assuming video.upload works)
                // even if we can't sync history.
                await connection.commit();
                console.log("TikTok Sync: Scope error ignored for 'Posting Only' mode.");
                return NextResponse.json({
                    message: 'TikTok connected (Posting Only). History sync requires "video.list" scope.'
                });
            }

            // Re-enable deactivation if desired, or keep it off for debugging.
            // For now, we return a specific error code the UI can recognize.
            return NextResponse.json({
                error: true,
                code: 'TIKTOK_AUTH_ERROR',
                message: 'TikTok access denied. The token may be expired or scopes are missing. Please reconnect.',
                details: error.response?.data || error.message
            }, { status: 401 });
        }

        return NextResponse.json({
            error: true,
            message: `TikTok Sync Failed: ${error.message}`,
            details: error.response?.data
        }, { status: 500 });
    } finally {
        if (connection) connection.release();
    }
}
