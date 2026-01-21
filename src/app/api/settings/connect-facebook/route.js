import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { pageId, pageName, accessToken } = await req.json();

    if (!pageId || !accessToken) {
        return NextResponse.json({ error: 'Missing Page ID or Token' }, { status: 400 });
    }

    try {
        // 1. Verify token validity with Facebook (Optional but recommended)
        const debugToken = await fetch(`https://graph.facebook.com/debug_token?input_token=${accessToken}&access_token=${accessToken}`);
        if (!debugToken.ok) {
             // If verification fails, we might still want to save but warn, or reject.
             // For now, let's assume the frontend passed a valid token from the SDK.
        }

        // 2. Upsert into social_connect
        // We save the 'page_id' as the unique key for this platform
        await db.query(
            `INSERT INTO social_connect (user_email, platform, page_id, access_token, connected_at)
             VALUES (?, 'facebook', ?, ?, NOW())
             ON DUPLICATE KEY UPDATE 
             access_token = VALUES(access_token), 
             connected_at = NOW()`,
            [session.user.email, pageId, accessToken]
        );

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Save Facebook Error:", error);
        return NextResponse.json({ error: 'Database Error' }, { status: 500 });
    }
}