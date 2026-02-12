import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { encrypt } from '@/lib/crypto';
import { getUserSubscription } from "@/lib/userSubscription";
import { getPlanDetails } from "@/lib/plans";
import axios from 'axios';

export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const userEmail = session.user.email;
    const redirectUrl = process.env.NEXTAUTH_URL + '/settings/social-connections';

    if (!code) {
        return NextResponse.redirect(`${redirectUrl}?error=tiktok_denied`);
    }

    try {
        // Exchange code for access token
        const tokenUrl = 'https://open.tiktokapis.com/v2/oauth/token/';
        const params = new URLSearchParams();
        params.append('client_key', process.env.TIKTOK_CLIENT_KEY);
        params.append('client_secret', process.env.TIKTOK_CLIENT_SECRET);
        params.append('code', code);
        params.append('grant_type', 'authorization_code');
        params.append('redirect_uri', `${process.env.NEXTAUTH_URL}/api/connect/callback/tiktok`);

        const tokenRes = await axios.post(tokenUrl, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const data = tokenRes.data;

        if (data.error) {
            throw new Error(data.error_description || 'Failed to retrieve access token from TikTok');
        }

        const { access_token, refresh_token, open_id, expires_in, refresh_expires_in } = data;

        // --- START PLAN LIMIT CHECK ---
        try {
            // 1. Fetch User's Plan Details
            const subscription = await getUserSubscription(userEmail);
            const userPlan = getPlanDetails(subscription?.stripePriceId);
            const maxConnections = userPlan?.limits?.maxSocialConnections ?? 0;

            // 2. Fetch Current Active Connections Count
            const [countRows] = await db.query(
                `SELECT COUNT(*) as count
                 FROM social_connect
                 WHERE user_email = ?
                   AND platform IN ('facebook', 'pinterest', 'instagram', 'x', 'google', 'youtube', 'tiktok')
                   AND is_active = TRUE`,
                [userEmail]
            );
            const currentConnections = countRows[0]?.count ?? 0;

            // 3. Check if this specific platform connection already exists currently
            const [existingConnection] = await db.query(
                `SELECT 1 FROM social_connect WHERE user_email = ? AND platform = 'tiktok' AND is_active = TRUE LIMIT 1`,
                [userEmail]
            );

            // 4. Enforce Limit
            if (existingConnection.length === 0 && currentConnections >= maxConnections) {
                console.warn(`LIMIT REACHED: User ${userEmail} tried to connect TikTok. Limit: ${maxConnections}, Current: ${currentConnections}.`);
                return NextResponse.redirect(`${redirectUrl}?error=limit_reached`);
            }

        } catch (checkError) {
            console.error("Error during plan limit check:", checkError);
            return NextResponse.redirect(`${redirectUrl}?error=check_failed`);
        }
        // --- END PLAN LIMIT CHECK ---

        // Save tokens to DB
        const expiresAt = new Date(Date.now() + expires_in * 1000);

        await db.query(
            `INSERT INTO social_connect (user_email, platform, access_token_encrypted, refresh_token_encrypted, expires_at, is_active)
             VALUES (?, 'tiktok', ?, ?, ?, TRUE)
             ON DUPLICATE KEY UPDATE 
                access_token_encrypted = VALUES(access_token_encrypted),
                refresh_token_encrypted = VALUES(refresh_token_encrypted),
                expires_at = VALUES(expires_at),
                is_active = TRUE`,
            [userEmail, encrypt(access_token), encrypt(refresh_token), expiresAt]
        );

        return NextResponse.redirect(`${redirectUrl}?success=tiktok_connected`);

    } catch (error) {
        console.error('[TIKTOK CALLBACK] Error:', error.response?.data || error.message);
        return NextResponse.redirect(`${redirectUrl}?error=${encodeURIComponent(error.message)}`);
    }
}
