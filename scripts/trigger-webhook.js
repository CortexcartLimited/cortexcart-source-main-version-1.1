require('dotenv').config({ path: '.env.production' });
const fetch = require('node-fetch'); // Ensure node-fetch is available or use native fetch in Node 18+
const crypto = require('crypto');

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const url = 'http://localhost:3000/api/stripe/webhook'; // Adjust port if needed

const payload = JSON.stringify({
    id: 'evt_test_webhook',
    object: 'event',
    type: 'checkout.session.completed',
    data: {
        object: {
            id: 'cs_test_session',
            object: 'checkout.session',
            mode: 'subscription',
            customer: 'cus_test_customer_123',
            subscription: 'sub_test_subscription_123',
            customer_details: {
                email: 'test_new_user@example.com',
                name: 'Test Simulator'
            }
        }
    }
});

const timestamp = Math.floor(Date.now() / 1000);
const signatureString = `${timestamp}.${payload}`;
const signature = crypto
    .createHmac('sha256', webhookSecret)
    .update(signatureString)
    .digest('hex');

const stripeSignature = `t=${timestamp},v1=${signature}`;

console.log(`🚀 Sending mock webhook to ${url}...`);

(async () => {
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'stripe-signature': stripeSignature
            },
            body: payload
        });

        const text = await res.text();
        console.log(`Response Status: ${res.status}`);
        console.log(`Response Body: ${text}`);
    } catch (err) {
        console.error('❌ Request failed:', err);
    }
})();
