import { db } from '@/lib/db';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        // Only admins can see the list (or maybe viewers can see who else is on the team? Let's restrict to admin for now)
        if (session.user.role === 'viewer') {
            // Maybe allow them to see simply so the page doesn't crash, but return empty?
            // Or return list but disable actions.
            // Let's return list but frontend handles "no delete button"
        }

        // List users where adminId matches current user ID
        const [members] = await db.query(`
            SELECT id, email, name, role, status, created_at 
            FROM users 
            WHERE adminId = ?
        `, [session.user.id]);

        return new Response(JSON.stringify({ members }), { status: 200 });

    } catch (error) {
        console.error('Fetch Members Error:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role === 'viewer') {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return new Response(JSON.stringify({ error: 'User ID required' }), { status: 400 });
        }

        // Security: Ensure the user being deleted actually belongs to this admin
        const [check] = await db.query('SELECT id FROM users WHERE id = ? AND adminId = ?', [userId, session.user.id]);

        if (check.length === 0) {
            return new Response(JSON.stringify({ error: 'User not found or not in your team.' }), { status: 404 });
        }

        await db.query('DELETE FROM users WHERE id = ?', [userId]);

        return new Response(JSON.stringify({ message: 'User removed.' }), { status: 200 });

    } catch (error) {
        console.error('Delete Member Error:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
}
