import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { decrypt } from '@/lib/crypto';
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
            `SELECT access_token_encrypted FROM social_connect WHERE user_email = ? AND platform = 'tiktok' AND is_active = TRUE`,
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

        const accessToken = decrypt(rows[0].access_token_encrypted);

        // 2. Fetch Videos from TikTok API
        // https://developers.tiktok.com/doc/tiktok-api-v2-video-list/
        // Fields: id, title, cover_image_url, create_time, like_count, comment_count, share_count, view_count
        const url = 'https://open.tiktokapis.com/v2/video/list/';
        const body = {
            max_count: 20, // Sync last 20 videos
            fields: ['id', 'title', 'cover_image_url', 'create_time', 'like_count', 'comment_count', 'share_count', 'view_count']
        };

        const response = await axios.post(url, body, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

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
            console.warn(`TikTok Auth Error (${status}): Deactivating connection for ${userEmail}`);
            // TEMPORARILY DISABLED DEACTIVATION FOR DEBUGGING
            /*
            try {
                // Use global db to ensure this runs outside the failed transaction
                await db.query(`UPDATE social_connect SET is_active = 0 WHERE user_email = ? AND platform = 'tiktok'`, [userEmail]);
            } catch (dbErr) {
                console.error("Failed to deactivate TikTok connection:", dbErr);
            }
            */
            // return NextResponse.json({ message: 'TikTok authorization failed. Please reconnect your account.' }, { status: 401 });
            // Fallthrough to show the actual error to the user
        }

        return NextResponse.json({ message: error.message || 'Failed to sync with TikTok' }, { status: 500 });
    } finally {
        if (connection) connection.release();
    }
}
