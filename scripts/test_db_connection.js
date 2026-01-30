const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const tryConnect = async (label, config) => {
    let conn;
    try {
        console.log(`\n--- Trying ${label} ---`);
        console.log(`Host: ${config.host}, User: ${config.user}, PwLen: ${config.password.length}`);
        // Log first/last char of password (masked)
        if (config.password.length > 0) {
            console.log(`Pw Start: ${config.password[0]}, End: ${config.password[config.password.length - 1]}`);
        }
        conn = await mysql.createConnection(config);
        console.log('✅ SUCCESS!');
        await conn.end();
        return true;
    } catch (err) {
        console.log(`❌ FAILED: ${err.message}`);
        return false;
    }
};

async function main() {
    const baseConfig = {
        host: process.env.MYSQL_HOST || 'localhost',
        user: process.env.MYSQL_USER,
        database: process.env.MYSQL_DATABASE,
        ssl: { rejectUnauthorized: false }
    };

    const pws = [];
    const rawPw = process.env.MYSQL_PASSWORD || '';

    // 1. Raw
    pws.push({ label: 'Raw Env Password', val: rawPw });

    // 2. Cleaned (if quotes exist)
    let cleaned = rawPw.trim();
    if ((cleaned.startsWith("'") && cleaned.endsWith("'")) || (cleaned.startsWith('"') && cleaned.endsWith('"'))) {
        cleaned = cleaned.slice(1, -1);
        pws.push({ label: 'Cleaned Env Password', val: cleaned });
    }

    // 3. Forced Quotes (maybe it needs them?)
    pws.push({ label: 'Forced Single Quotes', val: `'${rawPw}'` });
    pws.push({ label: 'Forced Double Quotes', val: `"${rawPw}"` });

    // 4. DATABASE_URL
    if (process.env.DATABASE_URL) {
        try {
            // password from url
            const url = new URL(process.env.DATABASE_URL);
            pws.push({ label: 'DATABASE_URL Password', val: decodeURIComponent(url.password) });
        } catch (e) { }
    }

    for (const pw of pws) {
        const config = { ...baseConfig, password: pw.val };
        // Try localhost
        if (await tryConnect(`${pw.label} @ localhost`, config)) break;

        // Try 127.0.0.1
        const configIP = { ...config, host: '127.0.0.1' };
        if (await tryConnect(`${pw.label} @ 127.0.0.1`, configIP)) break;
    }
}

main();
