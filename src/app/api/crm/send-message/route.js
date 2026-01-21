import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { conversationId, text } = await req.json();

    if (!conversationId || !text) {
        return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    try {
        // 1. Get Conversation Details
        const [convs] = await db.query(
            `SELECT * FROM crm_conversations WHERE id = ? AND user_email = ?`,
            [conversationId, session.user.email]
        );

        if (!convs.length) {
            return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
        }

        const conversation = convs[0];
        const { platform, external_id } = conversation;

        const credsPlatform = (platform === 'messenger') ? 'facebook' : platform;

        // 2. Get API Keys
        const [creds] = await db.query(
            `SELECT page_id, page_access_token_encrypted as access_token FROM social_connect 
             WHERE user_email = ? AND platform = ? 
             LIMIT 1`,
            [session.user.email, credsPlatform]
        );

        if (!creds.length || !creds[0].access_token) {
            return NextResponse.json({ error: `No connected ${credsPlatform} account found for sending messages.` }, { status: 400 });
        }

        const { page_id, access_token } = creds[0];
        let result;

        // 3. SEND based on Platform
        if (platform === 'whatsapp') {
            const res = await fetch(`https://graph.facebook.com/v19.0/${page_id}/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    to: external_id,
                    text: { body: text }
                })
            });
            result = await res.json();
            if (!res.ok) throw new Error(result.error?.message || 'WhatsApp Send Failed');

        } else if (platform === 'messenger' || platform === 'facebook') { // Handle both
            const res = await fetch(`https://graph.facebook.com/v19.0/me/messages?access_token=${access_token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipient: { id: external_id },
                    messaging_type: 'RESPONSE',
                    message: { text: text }
                })
            });
            result = await res.json();
            if (!res.ok) throw new Error(result.error?.message || 'Messenger Send Failed');
        }

        // 4. Save to Database
        await db.query(
            `INSERT INTO crm_messages (conversation_id, direction, content, created_at)
             VALUES (?, 'outbound', ?, NOW())`,
            [conversationId, text]
        );

        // 5. Update Conversation
        await db.query(
            `UPDATE crm_conversations 
             SET last_message = ?, updated_at = NOW(), unread_count = 0
             WHERE id = ?`,
            ["You: " + text, conversationId]
        );

        return NextResponse.json({ success: true, result });

    } catch (error) {
        console.error("Send Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
