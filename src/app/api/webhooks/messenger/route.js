
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// 1. VERIFICATION
export async function GET(req) {
    const mode = req.nextUrl.searchParams.get("hub.mode");
    const token = req.nextUrl.searchParams.get("hub.verify_token");
    const challenge = req.nextUrl.searchParams.get("hub.challenge");

    if (mode === "subscribe" && token === process.env.MESSENGER_VERIFY_TOKEN) {
        return new NextResponse(challenge);
    }
    return new NextResponse("Forbidden", { status: 403 });
}

// 2. RECEIVE MESSAGES
export async function POST(req) {
    const rawBody = await req.text();
    if (!rawBody) return NextResponse.json({ status: 'empty' });

    let body;
    try {
        body = JSON.parse(rawBody);
    } catch (e) {
        return NextResponse.json({ status: 'invalid_json' }, { status: 400 });
    }

    try {
        if (body.object === 'page') {
            for (const entry of body.entry) {
                const pageId = entry.id;
                const webhookEvent = entry.messaging?.[0];
                if (!webhookEvent || !webhookEvent.message) continue;

                const senderPsid = webhookEvent.sender.id;
                const text = webhookEvent.message.text || '[Attachment/Sticker]';

                const [users] = await db.query(
                    `SELECT user_email FROM social_connect WHERE page_id = ? AND platform = 'facebook'`,
                    [pageId]
                );

                if (!users || !users.length) {
                    console.error(`ERROR: No user found for FB Page ID [${pageId}]`);
                    continue;
                }

                const ownerEmail = users[0].user_email;

                let [conv] = await db.query(
                    `SELECT id FROM crm_conversations 
                     WHERE user_email = ? AND platform = 'facebook' AND external_id = ?`,
                    [ownerEmail, senderPsid]
                );

                let conversationId;

                if (conv && conv.length > 0) {
                    conversationId = conv[0].id;
                    await db.query(
                        `UPDATE crm_conversations 
                         SET last_message = ?, updated_at = NOW(), unread_count = unread_count + 1, status = 'open' 
                         WHERE id = ?`,
                        [text, conversationId]
                    );
                } else {
                    const [newConv] = await db.query(
                        `INSERT INTO crm_conversations 
                         (user_email, platform, external_id, contact_name, last_message, unread_count, updated_at)
                         VALUES (?, 'facebook', ?, 'Facebook Guest', ?, 1, NOW())`,
                        [ownerEmail, senderPsid, text]
                    );
                    conversationId = newConv.insertId;
                }

                await db.query(
                    `INSERT INTO crm_messages (conversation_id, direction, content, created_at)
                     VALUES (?, 'inbound', ?, NOW())`,
                    [conversationId, text]
                );
            }

            return NextResponse.json({ status: 'EVENT_RECEIVED' });
        }
        
        return NextResponse.json({ status: 'ignored_not_page' }, { status: 404 });

    } catch (error) {
        console.error("Messenger Webhook Error:", error);
        return NextResponse.json({ status: 'error' }, { status: 500 });
    }
}
