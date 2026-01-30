const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
};

async function checkColumns() {
    let connection;
    try {
        console.log('Connecting to database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to ' + dbConfig.database);

        const [rows] = await connection.query(`SHOW COLUMNS FROM users`);
        console.log('\nColumns in users table:');
        const columns = rows.map(r => r.Field);
        console.log(columns.join(', '));

        const hasResetToken = columns.includes('reset_token');
        const hasResetTokenExpiry = columns.includes('reset_token_expiry');

        if (hasResetToken && hasResetTokenExpiry) {
            console.log('\n✅ reset_token columns exist.');
        } else {
            console.log('\n❌ MISSING reset_token columns!');
            if (!hasResetToken) console.log('   - reset_token is missing');
            if (!hasResetTokenExpiry) console.log('   - reset_token_expiry is missing');
        }

    } catch (error) {
        console.error('Database Error:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}

checkColumns();
