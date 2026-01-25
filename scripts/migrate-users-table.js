const mysql = require('mysql2/promise');

async function migrate() {
    // Trying password from DATABASE_URL: {Y/+9qG5?{Z0nfDq
    const connection = await mysql.createConnection({
        host: '127.0.0.1',
        user: 'admin_cortexcart',
        password: '{Y/+9qG5?{Z0nfDq',
        database: 'admin_cortexcart',
    });

    try {
        console.log('Connected to database. Checking columns...');

        const [columns] = await connection.query(`SHOW COLUMNS FROM users LIKE 'reset_token'`);

        if (columns.length === 0) {
            console.log('Adding reset_token and reset_expiry columns...');
            await connection.query(`
                ALTER TABLE users 
                ADD COLUMN reset_token VARCHAR(255) NULL,
                ADD COLUMN reset_expiry DATETIME NULL
            `);
            console.log('✅ Columns added successfully.');
        } else {
            console.log('ℹ️ Columns already exist. Skipping.');
        }

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await connection.end();
    }
}

migrate();
