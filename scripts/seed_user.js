
require('dotenv').config({ path: '.env' });
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function seedUser() {
    let connection;
    // Common local development credentials
    const credentialsToTry = [
        // 1. Try environment variables first
        { host: process.env.MYSQL_HOST || 'localhost', user: process.env.MYSQL_USER, password: process.env.MYSQL_PASSWORD },
        // 2. Try 127.0.0.1 variants (TCP)
        { host: '127.0.0.1', user: process.env.MYSQL_USER, password: process.env.MYSQL_PASSWORD },
        { host: '127.0.0.1', user: 'root', password: '' },
        { host: '127.0.0.1', user: 'root', password: 'password' },
        { host: '127.0.0.1', user: 'root', password: 'root' },
        // 3. Try localhost variants (Socket)
        { host: 'localhost', user: 'root', password: '' },
        { host: 'localhost', user: 'root', password: 'password' },
        { host: 'localhost', user: 'root', password: 'root' },
        // 4. Default XAMPP/MAMP
        { host: 'localhost', user: 'root', password: 'mysql' },
        { host: '127.0.0.1', user: 'root', password: 'mysql' }
    ];

    console.log('--- Database Connection Attempt ---');

    for (const cred of credentialsToTry) {
        if (!cred.user) continue; // Skip if env vars are missing
        try {
            console.log(`Trying: ${cred.user}@${cred.host} (pass: ${cred.password ? 'YES' : 'NO'})...`);
            connection = await mysql.createConnection({
                host: cred.host,
                user: cred.user,
                password: cred.password,
                database: process.env.MYSQL_DATABASE || 'admin_cortexcart' // Fallback DB name
            });
            console.log('✅ Connected successfully!');
            // Log which one worked (obscuring password)
            console.log(`Successful config: Host=${cred.host}, User=${cred.user}`);
            break;
        } catch (err) {
            console.log(`❌ Failed: ${err.message}`);
        }
    }

    if (!connection) {
        console.error('⛔ All connection attempts failed. Cannot seed user.');
        return;
    }

    try {
        const email = 'test@example.com';
        const password = 'password123';
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        const name = 'Test User';

        // Check if user exists
        const [rows] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);

        if (rows.length > 0) {
            console.log('Test user already exists. Updating password...');
            await connection.execute('UPDATE users SET password_hash = ? WHERE email = ?', [hash, email]);
            await connection.execute('UPDATE users SET emailVerified = ? WHERE email = ?', [new Date(), email]);
        } else {
            console.log('Creating test user...');
            await connection.execute(
                'INSERT INTO users (email, password_hash, name, emailVerified, created_at) VALUES (?, ?, ?, ?, NOW())',
                [email, hash, name, new Date()]
            );
        }

        // Ensure site exists
        const [siteRows] = await connection.execute('SELECT * FROM sites WHERE user_email = ?', [email]);
        if (siteRows.length === 0) {
            console.log('Creating site for test user...');
            await connection.execute('INSERT INTO sites (user_email, site_name, site_url) VALUES (?, ?, ?)', [email, 'Test Site', 'example.com']);
        } else {
            if (!siteRows[0].site_url) {
                await connection.execute('UPDATE sites SET site_url = ? WHERE user_email = ?', ['example.com', email]);
            }
        }

        // Ensure AI usage
        await connection.execute('INSERT IGNORE INTO ai_usage (user_email, tokens_used) VALUES (?, 0)', [email]);

        console.log('🎉 Seed completed successfully.');
        console.log(`Credentials: ${email} / ${password}`);

    } catch (error) {
        console.error('Seed Logic failed:', error);
    } finally {
        await connection.end();
    }
}

seedUser();
