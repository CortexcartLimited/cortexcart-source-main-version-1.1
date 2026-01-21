module.exports = {
  apps: [
    {
      name: 'cortexcart-tracker',
      script: 'npm',
      args: 'start',
      env_production: {
        // --- General & Database ---
        NODE_ENV: 'production',
        NEXTAUTH_URL: 'https://tracker.cortexcart.com',
        NEXTAUTH_SECRET: '/W/QQf0pfOw7e2W0NDrYS/Gk0rBesDrLet9FxNBAdQw=',
        DATABASE_URL: 'mysql://admin_cortexcart:%7BY%2F%2B9qG5%3F%7BZ0nfDq@localhost:3306/admin_cortexcart',
        MYSQL_HOST: 'localhost',
        MYSQL_USER: 'admin_cortexcart',
        MYSQL_PASSWORD: '{Y/+9qG5?{Z0nfDq',
        MYSQL_DATABASE: 'admin_cortexcart',
	...require('dotenv').config({ path: './.env.production' }).parsed,
        // --- API Keys ---
        GOOGLE_CLIENT_ID: '880479014994-6a1m7b5dq9cllg3gvplfkcuh2u1i0vm4.apps.googleusercontent.com',
        GOOGLE_CLIENT_SECRET: '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',
        GEMINI_API_KEY: 'AIzaSyAiUCW26bZG6F5P0GvFQeXJP2ulP0ERQ3I',
        PAGESPEED_API_KEY: 'AIzaSyDHXexIGASqMZ8ix5osu0rzDe21GYmUlPg',
	STRIPE_WEBHOOK_SECRET: 'whsec_19b06b1cd451e21188b8fa9db2ea300de322186008df87017444d565dd6851c9',
	STRIPE_SECRET_KEY: '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',
	STRIPE_PUBLISHABLE_KEY: 'pk_live_WYJzenOkJZzqDr0BmsGnlddg',
        SHOPIFY_API_KEY: '14737a69383c014957b87b17a3c50345',
        SHOPIFY_API_SECRET: '1eb710968f974670758e5f3931ba229c',
        FACEBOOK_CLIENT_ID: '24645462538390665',
        FACEBOOK_CLIENT_SECRET: '413ba8b31c5d23d11e43a6d5c60da9d4',
        X_CLIENT_ID: 'a2NpM21wY21Zb09yMUFtSzNpeks6MTpjaQ',
        X_CLIENT_SECRET: '6cC7h5FQ30Ljo-bfUq0T_0m2eiJLc3Yp47GuOnWOjbots59LBG',
        PINTEREST_APP_ID: '1525372',
        PINTEREST_APP_SECRET: 'dd11c2f9c187fdb13410a8999cc23245a61c38e2',
        YOUTUBE_CLIENT_ID: '880479014994-6a1m7b5dq9cllg3gvplfkcuh2u1i0vm4.apps.googleusercontent.com',
        YOUTUBE_CLIENT_SECRET: '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',
        MAILCHIMP_API_KEY: '65e4354a710b66f586136ec423aa9fe6-us10',
        MAILCHIMP_CLIENT_ID: '698469553352',
        MAILCHIMP_CLIENT_SECRET: '5c182cf467b59adb36b763a7d11b1f9df204b804ac26f64026',
       	// Meta messenger api key
	MESSENGER_VERIFY_TOKEN: 'cortex_secure_token_messenger_123',
	// Quickbooks api keys
        QUICKBOOKS_CLIENT_ID: 'AB0RRYpYP3lTvcGlwjPKtyZoCHWgrHjD9P5ibsrqqlDssMV6CG',
        QUICKBOOKS_CLIENT_SECRET: '1fJGWPYLjRpff66hJt5yMxzGnGxznwT1KzzRUPsM',
        QUICKBOOKS_REDIRECT_URI: 'https://tracker.cortexcart.com/api/connect/callback/quickbooks',
        // --- Application & Security ---
        ENCRYPTION_KEY: 'c6f660949671610bc13ca9ea73546e24cd45118e63fb75872aac9e9c35c16230',
        SESSION_PASSWORD: 'wHfeKXO7yig0iRWV4/LC6g0tou/q1UaC',
        JWT_ADMIN_SECRET: '7c9671359acdbda35117b9d2667e0d53',
        NEXT_PUBLIC_APP_VERSION: '1.1', // This controls your version number
	NEXT_PUBLIC_APP_URL: 'https://tracker.cortexcart.com',
        CRON_SECRET: 'VlV9Ezn4Ja0C4NzFmMJhI9IcARX',
	INTERNAL_API_SECRET: '9nZ8oRAJ8BMraNqQwlFK6tYIemtWWjZT',
      }
    }
  ]
};
