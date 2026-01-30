const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const cleanEnv = (val) => {
    if (!val) return val;
    let v = val.trim();
    if (v.startsWith("'") && v.endsWith("'")) v = v.slice(1, -1);
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    return v;
};

const getDbConfig = () => {
    return {
        host: process.env.MYSQL_HOST || 'localhost',
        user: process.env.MYSQL_USER,
        password: cleanEnv(process.env.MYSQL_PASSWORD),
        database: process.env.MYSQL_DATABASE,
        ssl: { rejectUnauthorized: false }
    };
};

const getUrlConfig = () => {
    if (!process.env.DATABASE_URL) return null;
    try {
        // format: mysql://user:pass@host:port/db
        const url = new URL(process.env.DATABASE_URL);
        return {
            host: url.hostname,
            user: url.username,
            password: decodeURIComponent(url.password),
            database: url.pathname.replace('/', ''),
            port: url.port,
            ssl: { rejectUnauthorized: false }
        };
    } catch (e) {
        return null;
    }
};

async function connect(config) {
    if (!config) throw new Error("No config");
    console.log(`🔌 Trying to connect to ${config.host} as ${config.user}...`);
    return await mysql.createConnection(config);
}

async function main() {
    let connection;

    // Strategy 1: Standard Env Vars
    try {
        const config = getDbConfig();
        connection = await connect(config);
    } catch (err) {
        console.warn(`⚠️ Method 1 failed: ${err.message}`);

        // Strategy 2: Standard Env Vars but 127.0.0.1
        try {
            const config = getDbConfig();
            if (config.host === 'localhost') {
                config.host = '127.0.0.1';
                connection = await connect(config);
            } else {
                throw err;
            }
        } catch (err2) {
            console.warn(`⚠️ Method 2 failed: ${err2.message}`);

            // Strategy 3: DATABASE_URL
            try {
                const config = getUrlConfig();
                if (config) {
                    connection = await connect(config);
                } else {
                    throw new Error("No DATABASE_URL found");
                }
            } catch (err3) {
                console.error('❌ All connection methods failed.');
                process.exit(1);
            }
        }
    }

    console.log('✅ Connected.');

    try {
        // 1. Check existing columns
        const [columns] = await connection.query(`SHOW COLUMNS FROM users`);
        const existingColumns = columns.map(c => c.Field);

        const queries = [];

        // 2. Prepare Alter statements
        if (!existingColumns.includes('adminId')) {
            // Check ID type
            const idCol = columns.find(c => c.Field === 'id');
            const idType = idCol.Type.includes('char') ? 'VARCHAR(255)' : 'INT';
            queries.push(`ADD COLUMN adminId ${idType} NULL AFTER id`);
        }

        if (!existingColumns.includes('role')) {
            queries.push(`ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'admin'`);
        }

        if (!existingColumns.includes('invite_token')) {
            queries.push(`ADD COLUMN invite_token VARCHAR(255) NULL UNIQUE`);
        }

        if (!existingColumns.includes('status')) {
            queries.push(`ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'Active'`);
        }

        if (queries.length > 0) {
            const alterQuery = `ALTER TABLE users ${queries.join(', ')}`;
            console.log(`🛠️ Running migration: ${alterQuery}`);
            await connection.query(alterQuery);
            console.log('✅ Users table updated successfully.');
        } else {
            console.log('ℹ️ Users table already has all required columns.');
        }

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        if (connection) await connection.end();
    }
}

main();
