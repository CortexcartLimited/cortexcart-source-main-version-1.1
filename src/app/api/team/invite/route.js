import { db } from '@/lib/db';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendTeamInviteEmail } from '@/lib/email';
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

        // 1. Check if user already exists
        const [existing] = await db.query('SELECT id, adminId, role FROM users WHERE email = ?', [email]);

        if (existing.length > 0) {
            const user = existing[0];
            // If they are an Admin (role is not 'viewer' AND adminId is NULL), reject.
            if (user.role === 'admin' && !user.adminId) {
                return new Response(JSON.stringify({ error: 'This user already has their own subscription.' }), { status: 400 });
            }
            // If they are already a viewer (invited), maybe re-invite?
            // For now, let's say "User already registered" to keep it simple, or "Already on a team".
            return new Response(JSON.stringify({ error: 'User is already registered.' }), { status: 400 });
        }

        // 2. Generate Reset Token (instead of invite_token)
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

        const dummyHash = '$2b$10$dummyhashwaitingforactivation000000000000000000000';

        // 3. Insert new user 
        // We use 'reset_token' and 'reset_expiry' columns if they exist. (Assuming they are part of standard auth schema)
        // If not, we might need to adjust. The prompt asks for `reset_token`.
        // Let's check schema/task again. The user said: "adminId: [current_user_id], reset_token: [crypto_token], reset_expiry: [24_hours_from_now]"
        // We might need to make sure these columns exist. standard password reset flows usually have them.

        await db.query(`
            INSERT INTO users (email, password_hash, name, role, adminId, reset_token, reset_token_expires, status, created_at)
            VALUES (?, ?, ?, 'viewer', ?, ?, ?, 'Pending', NOW())
        `, [
            email,
            dummyHash,
            'Invited Member',
            session.user.id,
            resetToken,
            resetExpiry
        ]);

        // 4. Send Email
        const inviteUrl = `${process.env.NEXTAUTH_URL}/auth/set-password?token=${resetToken}`;

        await sendTeamInviteEmail({
            to: email,
            adminName: session.user.name,
            inviteUrl
        });

        return new Response(JSON.stringify({ message: 'Invitation sent successfully.' }), { status: 200 });

    } catch (error) {
        console.error('Invite Error:', error);
        return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), { status: 500 });
    }
}
