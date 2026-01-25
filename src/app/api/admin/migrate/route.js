import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    try {
        console.log('Using app db connection to migrate...');
        const [columns] = await db.query(`SHOW COLUMNS FROM users LIKE 'reset_token'`);

        if (columns.length === 0) {
            console.log('Adding columns...');
            await db.query(`
                ALTER TABLE users 
                ADD COLUMN reset_token VARCHAR(255) NULL,
                ADD COLUMN reset_expiry DATETIME NULL
            `);
            return NextResponse.json({ message: 'Migration successful' });
        } else {
            return NextResponse.json({ message: 'Columns already exist' });
        }
    } catch (error) {
        console.error('Migration error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
