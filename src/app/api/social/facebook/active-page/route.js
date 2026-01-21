import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        // Fetch the currently active page ID
        const [rows] = await db.query(
            `SELECT page_id FROM social_connect WHERE user_email = ? AND platform = 'facebook'`,
            [session.user.email]
        );

        if (rows.length > 0 && rows[0].page_id) {
            return NextResponse.json({ pageId: rows[0].page_id });
        }
        return NextResponse.json(null);

    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { pageId, accessToken } = await req.json();

    if (!pageId || !accessToken) {
        return NextResponse.json({ error: 'Page ID and Token required' }, { status: 400 });
    }

    try {
        // 1. Try to update the existing row
        const [updateResult] = await db.query(
            `UPDATE social_connect 
             SET page_id = ?, page_access_token_encrypted = ?, updated_at = NOW() 
             WHERE user_email = ? AND platform = 'facebook'`,
            [pageId, accessToken, session.user.email]
        );

        // 2. If no row existed, insert a new one
        if (updateResult.affectedRows === 0) {
            await db.query(
                `INSERT INTO social_connect 
                (user_email, platform, page_id, page_access_token_encrypted, created_at, updated_at) 
                VALUES (?, 'facebook', ?, ?, NOW(), NOW())`,
                [session.user.email, pageId, accessToken]
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error setting active page:", error);
        return NextResponse.json({ error: 'Database error: ' + error.message }, { status: 500 });
    }
}