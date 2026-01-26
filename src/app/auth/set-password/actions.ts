'use server';

import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';

export async function resetPassword(prevState: any, formData: FormData) {
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    const token = formData.get('token') as string;

    if (!password || !confirmPassword || !token) {
        return { error: 'All fields are required.' };
    }

    if (password !== confirmPassword) {
        return { error: 'Passwords do not match.' };
    }

    // Regex validation: 8-16 chars, 1 Upper, 1 Lower, 1 Digit, 1 Special
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;
    if (!passwordRegex.test(password)) {
        return {
            error:
                'Password must be 8-16 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.',
        };
    }

    try {
        // 1. Verify Token
        const [rows] = await db.query(
            'SELECT id, email FROM users WHERE reset_token = ? AND reset_expiry > NOW()',
            [token]
        );

        if ((rows as any[]).length === 0) {
            return { error: 'Invalid or expired token. Please request a new password reset.' };
        }

        const userId = (rows as any[])[0].id;
        const userEmail = (rows as any[])[0].email; // Fetch email

        // 2. Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Update User
        await db.query(
            'UPDATE users SET password_hash = ?, reset_token = NULL, reset_expiry = NULL WHERE id = ?',
            [hashedPassword, userId]
        );

        return { success: true, email: userEmail };

    } catch (error) {
        console.error('Error resetting password:', error);
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}
