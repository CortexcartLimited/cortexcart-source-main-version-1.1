// src/lib/auth.js main auth file updated
import GoogleProvider from 'next-auth/providers/google';
import TwitterProvider from 'next-auth/providers/twitter';
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from '@/lib/db';
import { encrypt } from '@/lib/crypto';
import bcrypt from 'bcryptjs';
import crypto from 'crypto'; // <--- NEW IMPORT
import { getUserSubscription } from '@/lib/userSubscription'; // <--- NEW IMPORT

// Automatically determine if we should use secure cookies.
const useSecureCookies = process.env.NEXTAUTH_URL?.startsWith("https");

/** @type {import('next-auth').AuthOptions} */
export const authOptions = {
    debug: true, // Enable debug logs to investigate TikTok issues
    pages: {
        signIn: '/login',
    },
    useSecureCookies: useSecureCookies,
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    cookies: {
        sessionToken: {
            name: `${useSecureCookies ? '__Secure-' : ''}next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: useSecureCookies,
            },
        },
        callbackUrl: {
            name: `${useSecureCookies ? '__Secure-' : ''}next-auth.callback-url`,
            options: {
                sameSite: 'lax',
                path: '/',
                secure: useSecureCookies,
            },
        },
        csrfToken: {
            name: `${useSecureCookies ? '__Host-' : ''}next-auth.csrf-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: useSecureCookies,
            },
        },
    },
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;
                try {
                    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [credentials.email]);
                    if (rows.length === 0) return null;
                    const user = rows[0];

                    // --- NEW SECURITY CHECK ---
                    if (!user.emailVerified) {
                        throw new Error("Please verify your email address first.");
                    }
                    // --------------------------

                    // --------------------------

                    if (!user.password_hash) return null; // Handle OAuth-only users

                    const passwordMatch = await bcrypt.compare(credentials.password, user.password_hash);
                    if (!passwordMatch) return null;
                    return { id: user.id, email: user.email, name: user.name };
                } catch (error) {
                    console.error("Credentials auth error:", error);
                    // NextAuth often swallows errors, so returning null is safer, 
                    // but throwing an error allows you to show specific messages if configured.
                    throw new Error(error.message || "Login failed");
                }
            }
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
                params: {
                    scope: 'openid email profile https://www.googleapis.com/auth/youtube.upload',
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code"
                }
            }
        }),
        TwitterProvider({
            id: "x",
            clientId: process.env.X_CLIENT_ID,
            clientSecret: process.env.X_CLIENT_SECRET,
            version: "2.0",
            authorization: {
                params: {
                    scope: "tweet.read tweet.write users.read offline.access"
                }
            }
        }),
        {
            id: "tiktok",
            name: "TikTok",
            type: "oauth",
            version: "2.0",
            clientId: process.env.TIKTOK_CLIENT_KEY,
            clientSecret: process.env.TIKTOK_CLIENT_SECRET,
            authorization: {
                url: "https://www.tiktok.com/v2/auth/authorize/",
                params: {
                    client_key: process.env.TIKTOK_CLIENT_KEY,
                    scope: "user.info.basic,video.upload,user.info.stats", // Removed video.list per user request (Sandbox issue)
                    response_type: "code",
                    redirect_uri: process.env.NEXTAUTH_URL + "/api/auth/callback/tiktok",
                },
            },
            // Log warning if keys are missing
            ...((!process.env.TIKTOK_CLIENT_KEY || !process.env.TIKTOK_CLIENT_SECRET) && {
                _log: console.warn("⚠️ TikTok Provider: TIKTOK_CLIENT_KEY or TIKTOK_CLIENT_SECRET is missing. Login will fail.")
            }),
            // Custom token request to handle TikTok's nested response structure
            token: {
                url: "https://open.tiktokapis.com/v2/oauth/token/",
                async request({ client, params, checks, provider }) {
                    console.log("TikTok Token Request Callback URL:", provider.callbackUrl);
                    const response = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: new URLSearchParams({
                            client_key: provider.clientId,
                            client_secret: provider.clientSecret,
                            code: params.code,
                            grant_type: 'authorization_code',
                            redirect_uri: provider.callbackUrl,
                        }),
                    });
                    const data = await response.json();

                    console.log('TikTok Token Response:', JSON.stringify(data, null, 2));

                    // TikTok responses can be nested in `data` or flat, handling both cases
                    const tokens = data.data || data;

                    if (!response.ok || data.error_code || !tokens.access_token) {
                        throw new Error(`TikTok Token Error: ${JSON.stringify(data)}`);
                    }

                    return {
                        tokens: {
                            access_token: tokens.access_token,
                            expires_at: Math.floor(Date.now() / 1000) + tokens.expires_in,
                            refresh_token: tokens.refresh_token,
                            scope: tokens.scope,
                            token_type: 'Bearer',
                        }
                    };
                }
            },
            userinfo: "https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name",
            profile(profile) {
                console.log("🟢 TikTok Profile Callback Received:", JSON.stringify(profile, null, 2)); // DEBUG LOG

                // Safety check for expected structure
                const userData = profile?.data?.user || {};

                return {
                    id: userData.open_id || "tiktok_unknown_id",
                    name: userData.display_name || "TikTok User",
                    email: null, // TikTok doesn't provide email by default
                    image: userData.avatar_url,
                }
            },
            checks: ["state"],
        },
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            console.log(`🔵 SignIn Callback for ${account.provider}`, { user, account, profile }); // DEBUG LOG
            let { email, name } = user;
            if (account.provider === 'twitter' && !email) {
                email = `${user.id}@users.twitter.com`;
            }
            if (account.provider === 'tiktok' && !email) {
                email = `${user.id}@users.tiktok.com`;
            }
            if (!email) {
                console.error(`Sign-in denied for provider ${account.provider}: email not available.`);
                return false;
            }
            try {
                // 1. Ensure User Exists in 'users' table (Vital for Foreign Keys)
                const [existingUser] = await db.query('SELECT id FROM users WHERE email = ?', [email]);

                if (existingUser.length === 0) {
                    console.log(`Creating new user for ${account.provider} login:`, email);
                    const newUserId = crypto.randomUUID();
                    // Insert new user. 
                    // Note: password_hash is NULL for OAuth. verified is NOW() because OAuth is trusted.
                    await db.query(
                        `INSERT INTO users (id, email, name, emailVerified, created_at) VALUES (?, ?, ?, NOW(), NOW())`,
                        [newUserId, email, name || 'New User']
                    );
                }

                // 2. Ensure Site Exists
                const [userResult] = await db.query('SELECT * FROM sites WHERE user_email = ?', [email]);
                if (userResult.length === 0) {
                    await db.query('INSERT INTO sites (user_email, site_name) VALUES (?, ?)', [email, `${name}'s Site`]);
                }
            } catch (error) {
                console.error("DB Error during signIn:", error);
                return false; // If DB error occurs, cancel sign-in
            }
            return true; // Allow sign-in
        },

        // --- CRITICAL FIX IS HERE ---
        async jwt({ token, user, account }) {
            // 1. Handle Initial Sign In
            if (account && user) {
                token.id = user.id;
                // Ensure we use the generated email for TikTok/Twitter if the real one isn't there
                token.email = user.email || (account.provider === 'twitter' ? `${user.id}@users.twitter.com` : (account.provider === 'tiktok' ? `${user.id}@users.tiktok.com` : null));
                token.name = user.name;
                token.picture = user.image;

                if (account.access_token) {
                    console.log("TikTok JWT Callback: scopes received:", account.scope); // LOG SCOPES

                    // --- SCOPE VALIDATION REMOVED (User Request: Sandbox/Posting Only) ---
                    /*
                    if (account.provider === 'tiktok') {
                        const scopes = account.scope || "";
                        if (!scopes.includes('video.list')) {
                             // console.warn("TikTok Login: Missing 'video.list'. Sync will be limited.");
                        }
                    }
                    */
                    // ------------------------

                    try {
                        // FIX: Added 'is_active' to INSERT and UPDATE
                        const query = `
                            INSERT INTO social_connect (user_email, platform, access_token_encrypted, refresh_token_encrypted, expires_at, is_active)
                            VALUES (?, ?, ?, ?, ?, 1)
                            ON DUPLICATE KEY UPDATE 
                                access_token_encrypted = VALUES(access_token_encrypted), 
                                refresh_token_encrypted = VALUES(refresh_token_encrypted),
                                expires_at = VALUES(expires_at),
                                is_active = 1;
                        `;
                        const expires_at = account.expires_at ? new Date(account.expires_at * 1000) : null;
                        await db.query(query, [token.email, account.provider, encrypt(account.access_token), encrypt(account.refresh_token), expires_at]);
                    } catch (dbError) {
                        console.error("CRITICAL ERROR saving social connection:", dbError);
                    }
                }
            }

            // 2. Fetch Subscription Data and Inject into Token
            // This runs every time the session is checked, keeping the token fresh.
            if (token.email) {
                try {
                    const sub = await getUserSubscription(token.email);
                    // Save these onto the token so Middleware can read them instantly
                    token.stripePriceId = sub?.stripePriceId || null;
                    token.stripeSubscriptionStatus = sub?.stripeSubscriptionStatus || null;
                } catch (error) {
                    console.error("Error fetching subscription for token:", error);
                }
            }

            return token;
        },

        async session({ session, token }) {
            if (token) {
                session.user.id = token.id;
                session.user.email = token.email;
                session.user.name = token.name;
                session.user.image = token.picture;
                // Pass subscription data to the client-side session too (optional but useful)
                session.user.stripePriceId = token.stripePriceId;
            }
            if (session.user?.email) {
                try {
                    const [siteRows] = await db.query('SELECT id, onboarding_completed FROM sites WHERE user_email = ? LIMIT 1', [session.user.email]);
                    if (siteRows.length > 0) {
                        session.user.site_id = siteRows[0].id;
                        session.user.onboarding_completed = siteRows[0].onboarding_completed;
                    }
                } catch (error) {
                    console.error("Error attaching site data to session:", error);
                }
            }
            return session;
        },
    },
};