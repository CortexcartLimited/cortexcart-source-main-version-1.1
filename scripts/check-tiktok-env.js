const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env and .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

console.log("--- Checking TikTok Environment Variables ---");
console.log("TIKTOK_CLIENT_KEY exists:", !!process.env.TIKTOK_CLIENT_KEY);
if (process.env.TIKTOK_CLIENT_KEY) {
    console.log("TIKTOK_CLIENT_KEY length:", process.env.TIKTOK_CLIENT_KEY.length);
    console.log("TIKTOK_CLIENT_KEY first 3 chars:", process.env.TIKTOK_CLIENT_KEY.substring(0, 3));
} else {
    console.error("❌ TIKTOK_CLIENT_KEY is MISSING from environment!");
}

console.log("TIKTOK_CLIENT_SECRET exists:", !!process.env.TIKTOK_CLIENT_SECRET);
if (process.env.TIKTOK_CLIENT_SECRET) {
    console.log("TIKTOK_CLIENT_SECRET length:", process.env.TIKTOK_CLIENT_SECRET.length);
} else {
    console.error("❌ TIKTOK_CLIENT_SECRET is MISSING from environment!");
}
console.log("---------------------------------------------");
