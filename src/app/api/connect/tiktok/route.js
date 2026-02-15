import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/auth';

export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    // Ensure we have a base URL even if env is missing (fallback for dev)
    const BASE_URL = process.env.NEXTAUTH_URL?.replace(/\/$/, '') || 'http://localhost:3000';

    // Callback URL for the connection flow
    const redirectUri = `${BASE_URL}/api/connect/callback/tiktok`;

    // Scopes for TikTok API V2
    // user.info.basic: get display name, avatar
    // video.list: read videos
    // video.upload: upload videos
    const scopes = [
        'user.info.basic',
        'video.list',
        'video.upload'
    ];

    // State to act as CSRF protection and carry user context
    const state = JSON.stringify({
        user_email: session.user.email,
        nonce: Math.random().toString(36).substring(7)
    });

    const csrfState = Math.random().toString(36).substring(2);

    // TikTok OAuth URL
    const authUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${process.env.TIKTOK_CLIENT_KEY}&response_type=code&scope=${scopes.join(',')}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}`;

    return NextResponse.redirect(authUrl);
}
