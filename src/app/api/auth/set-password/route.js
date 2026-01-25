import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req) {
    try {
        const { token, password } = await req.json();

        if (!token || !password) {
            return NextResponse.json({ message: 'Missing token or password' }, { status: 400 });
        }

        // 1. Find user by token
        const [users] = await db.query(
            'SELECT * FROM users WHERE reset_token = ?',
            [token]
        );

        if (users.length === 0) {
            return NextResponse.json({ message: 'Invalid or expired token.' }, { status: 400 });
        }

        const user = users[0];

        // 2. Check Expiry
        if (user.reset_expiry && new Date(user.reset_expiry) < new Date()) {
            return NextResponse.json({ message: 'Token has expired.' }, { status: 400 });
        }

        // 3. Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Update User
        await db.query(
            `UPDATE users SET 
                password_hash = ?, 
                reset_token = NULL, 
                reset_expiry = NULL,
                emailVerified = NOW() -- Ensure they are verified
             WHERE id = ?`,
            [hashedPassword, user.id]
        );

        return NextResponse.json({ message: 'Password set successfully.' }, { status: 200 });

    } catch (error) {
        console.error('Set Password Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
