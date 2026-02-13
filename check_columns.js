
const { db } = require('./src/lib/db');

async function checkSchema() {
    try {
        const [rows] = await db.query('SHOW COLUMNS FROM sites');
        console.log('Columns in sites table:', rows.map(r => r.Field));
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

checkSchema();
