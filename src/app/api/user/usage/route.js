import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    let connection;
    try {
        connection = await db.getConnection();
        const [rows] = await connection.query(
            'SELECT gemini_tokens_used, gemini_token_limit FROM sites WHERE user_email = ? LIMIT 1',
            [session.user.email]
        );

        if (rows.length === 0) {
            return NextResponse.json({ used: 0, limit: 0, error: 'User site not found' }, { status: 404 });
        }

        const { gemini_tokens_used, gemini_token_limit } = rows[0];

        return NextResponse.json({
            used: gemini_tokens_used || 0,
            limit: gemini_token_limit || 0
        });

    } catch (error) {
        console.error('Error fetching token usage:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    } finally {
        if (connection) connection.release();
    }
}
