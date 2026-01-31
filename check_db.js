
require('dotenv').config({ path: '.env' });
const mysql = require('mysql2/promise');

async function checkSchema() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
        });

        console.log("Connected to DB");

        const [rows] = await connection.query('DESCRIBE sites');
        console.log("Schema of sites:", rows);

        const [tables] = await connection.query('SHOW TABLES');
        console.log("Tables:", tables);

        await connection.end();
    } catch (err) {
        console.error("Error:", err);
    }
}

checkSchema();
