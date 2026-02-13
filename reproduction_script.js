
const { db } = require('./src/lib/db');

async function checkUser() {
    try {
        // Mock a user email that likely exists or use a dummy one if we can't find one easily.
        // For now, let's just query any user with a subscription id to see the keys.
        const [rows] = await db.query('SELECT stripe_subscription_id FROM sites WHERE stripe_subscription_id IS NOT NULL LIMIT 1');
        if (rows.length > 0) {
            console.log('Result keys:', Object.keys(rows[0]));
            console.log('Result sample:', rows[0]);
        } else {
            console.log('No users with subscription found to test.');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

checkUser();
