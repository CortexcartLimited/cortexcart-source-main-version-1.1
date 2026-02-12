require('dotenv').config({ path: '.env' });
const mysql = require('mysql2/promise');

async function debugSchema() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
        });

        console.log("Connected to DB");

        const [usersSchema] = await connection.query('DESCRIBE users');
        console.log("\nSchema of users:", usersSchema);

        const [socialSchema] = await connection.query('DESCRIBE social_connect');
        console.log("\nSchema of social_connect:", socialSchema);

        const [sitesSchema] = await connection.query('DESCRIBE sites');
        console.log("\nSchema of sites:", sitesSchema);

        // Check for FK constraints
        const [constraints] = await connection.query(`
            SELECT 
                TABLE_NAME, 
                COLUMN_NAME, 
                CONSTRAINT_NAME, 
                REFERENCED_TABLE_NAME, 
                REFERENCED_COLUMN_NAME
            FROM
                INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE
                REFERENCED_TABLE_SCHEMA = '${process.env.MYSQL_DATABASE}' 
                AND TABLE_NAME IN ('social_connect', 'sites');
        `);
        console.log("\nConstraints:", constraints);

        await connection.end();
    } catch (err) {
        console.error("Error:", err);
    }
}

debugSchema();
