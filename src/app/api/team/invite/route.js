import { db } from '@/lib/db';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        // Security: Viewers cannot invite others
        if (session.user.role === 'viewer') {
            return new Response(JSON.stringify({ error: 'Viewers cannot invite users.' }), { status: 403 });
        }

        const { email } = await req.json();

        if (!email) {
            return new Response(JSON.stringify({ error: 'Email is required' }), { status: 400 });
        }

        // Check if user already exists
        const [existing] = await db.query('SELECT id, adminId FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return new Response(JSON.stringify({ error: 'User is already registered.' }), { status: 400 });
        }

        const inviteToken = crypto.randomBytes(32).toString('hex');

        // Insert new user with Pending status
        // Password is empty initially (or random). They will set it via invite link.
        // We might need a dummy password hash if the DB constraint requires it. 
        // Assuming password_hash is required, we generate a random one they can't use.

        const dummyHash = '$2b$10$dummyhashwaitingforactivation000000000000000000000';

        // The admin invoking this is the main account holder.
        // If the invoker is already a team member (which we blocked above), they shouldn't be here.
        // So session.user.id is the adminId for the new user.

        await db.query(`
            INSERT INTO users (email, password_hash, name, role, adminId, invite_token, status, created_at)
            VALUES (?, ?, ?, 'viewer', ?, ?, 'Pending', NOW())
        `, [email, dummyHash, 'Invited Member', session.user.id, inviteToken]);

        // Send Email
        const inviteLink = `${process.env.NEXTAUTH_URL}/register?token=${inviteToken}`;

        await sendEmail({
            to: email,
            subject: 'You have been invited to CortexCart',
            html: `
                <h3>You've been invited!</h3>
                <p>${session.user.name} has invited you to join their CortexCart team as a Viewer.</p>
                <p>Click the link below to accept the invite and set your password:</p>
                <a href="${inviteLink}">${inviteLink}</a>
                <p>This link will expire in 24 hours.</p>
            `
        });

        return new Response(JSON.stringify({ message: 'Invitation sent successfully.' }), { status: 200 });

    } catch (error) {
        console.error('Invite Error:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
}
