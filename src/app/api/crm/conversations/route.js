import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const platform = searchParams.get('platform') || 'whatsapp'; 

    try {
        let conversations;
        if (platform === 'facebook') {
            [conversations] = await db.query(
                `SELECT * FROM crm_conversations 
                 WHERE user_email = ? AND (platform = 'facebook' OR platform = 'messenger')
                 ORDER BY updated_at DESC`,
                [session.user.email]
            );
        } else {
            [conversations] = await db.query(
                `SELECT * FROM crm_conversations 
                 WHERE user_email = ? AND platform = ? 
                 ORDER BY updated_at DESC`,
                [session.user.email, platform]
            );
        }

        return NextResponse.json(conversations);

    } catch (error) {
        return NextResponse.json({ error: 'Database Error' }, { status: 500 });
    }
}
