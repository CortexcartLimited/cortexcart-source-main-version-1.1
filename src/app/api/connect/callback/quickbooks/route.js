// src/app/api/connect/callback/quickbooks/route.js

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { encrypt } from '@/lib/crypto';
// New Import: Use the official client for secure token exchange
import OAuthClient from 'intuit-oauth'; 

export async function GET(request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.redirect('/?error=NotAuthenticated');
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const realmId = searchParams.get('realmId');

    if (!code || !realmId) {
        return NextResponse.redirect(`${baseUrl}/?error=QuickBooksAuthFailed`);
    }

    try {
        // --- NEW: Use the intuit-oauth client for token exchange ---
        const oauthClient = new OAuthClient({
            clientId: process.env.QUICKBOOKS_CLIENT_ID,
            clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET,
            // Match the environment used in the financial-summary route
            environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox', 
            redirectUri: process.env.QUICKBOOKS_REDIRECT_URI,
        });

        // Exchange the authorization code for tokens
        const authResponse = await oauthClient.createToken(request.url);
        
        // The authResponse object contains the tokens securely
        const tokenData = authResponse.getJson();

        if (!tokenData.access_token) {
            throw new Error('Token exchange failed: No access token received.');
        }

        const accessTokenEncrypted = encrypt(tokenData.access_token);
        const refreshTokenEncrypted = encrypt(tokenData.refresh_token);

        // Database insertion (remains correct)
        await db.query(
            `
            INSERT INTO social_connect (user_email, platform, access_token_encrypted, refresh_token_encrypted, realm_id, is_active)
            VALUES (?, 'quickbooks', ?, ?, ?, 1)
            ON DUPLICATE KEY UPDATE
            access_token_encrypted = VALUES(access_token_encrypted),
            refresh_token_encrypted = VALUES(refresh_token_encrypted),
            realm_id = VALUES(realm_id),
            is_active = 1;
            `,
            [session.user.email, accessTokenEncrypted, refreshTokenEncrypted, realmId]
        );

        return NextResponse.redirect(`${baseUrl}/settings#platforms?success=QuickBooksConnected`);

    } catch (error) {
        console.error('--- [QB Callback] CRITICAL ERROR in try-catch block:', error);
        return NextResponse.redirect(`${baseUrl}/?error=${encodeURIComponent(error.message)}`);
    }
}