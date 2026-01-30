// src/middleware.js
export const runtime = 'nodejs';

import { withAuth } from "next-auth/middleware";
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { jwtVerify } from 'jose';
import { getPlanDetails } from '@/lib/plans';

// --- Feature Mappings ---
const PATH_REQUIREMENTS = {
    '/social': { limitKey: 'maxSocialConnections', minRequired: 1 },
    '/settings/integrations': { limitKey: 'maxPlatformIntegrations', minRequired: 1 },
    '/settings/platforms': { limitKey: 'maxPlatformIntegrations', minRequired: 1 },
    '/analytics/google': { limitKey: 'googleAnalytics', minRequired: true },
    '/experiments': { limitKey: 'abTesting', minRequired: true },
    '/heatmaps': { limitKey: 'maxHeatmaps', minRequired: 1 },
    '/recommendations': { limitKey: 'recommendationWidgets', minRequired: true },
    '/reports': { limitKey: 'maxReports', minRequired: true },
    '/support/support-tickets': { limitKey: 'supportTickets', minRequired: true },
};

const getAdminSecret = () => {
    const secret = process.env.JWT_ADMIN_SECRET;
    if (!secret) throw new Error("JWT_ADMIN_SECRET is not set.");
    return new TextEncoder().encode(secret);
};

// ==============================================================
// 1. ORIGINAL MIDDLEWARE LOGIC (Renamed)
// ==============================================================
async function customMiddleware(req) {
    const { pathname } = req.nextUrl;
    const appUrl = process.env.NEXTAUTH_URL || req.nextUrl.origin;

    // NOTE: Public path check is now handled in 'authorized' callback below,
    // but redundant check here is harmless and safe.

    // ==============================================================
    // 2. Admin Check
    // ==============================================================
    if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
        const adminCookie = req.cookies.get('cortex-tracker-token');
        if (!adminCookie) return NextResponse.redirect(new URL('/admin/login', appUrl));
        try {
            const { payload } = await jwtVerify(adminCookie.value, getAdminSecret());
            if (payload.role !== 'superadmin') throw new Error('Not superadmin');
            return NextResponse.next();
        } catch (e) {
            return NextResponse.redirect(new URL('/admin/login?error=InvalidToken', appUrl));
        }
    }

    // ==============================================================
    // 3. Feature & Authentication Check
    // ==============================================================
    const requirement = Object.entries(PATH_REQUIREMENTS).find(([path]) => pathname.startsWith(path))?.[1];

    if (requirement) {
        // We can reuse the token from NextAuth wrapper if we wanted, but existing logic fetches it.
        // req.nextauth.token is available if we used 'callbacks' correctly above.
        // Let's stick to existing getToken to minimize breakage risk during migration.
        const sessionToken = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

        // If user is not logged in, redirect to login
        if (!sessionToken?.email) {
            const loginUrl = new URL('/login', appUrl);
            loginUrl.searchParams.set('callbackUrl', req.url);
            return NextResponse.redirect(loginUrl);
        }

        const priceId = sessionToken.stripePriceId;
        const status = sessionToken.stripeSubscriptionStatus;
        const isActive = status === 'active' || status === 'trialing';

        // --- NEW: READ-ONLY CHECK ---
        const isViewer = sessionToken.role === 'viewer';

        // Block restricted "Write" API paths or settings pages for viewers
        // We define what a viewer cannot touch.
        const RESTRICTED_FOR_VIEWER = [
            '/settings',
            '/upgrade-plans',
            '/billing-settings', // Assuming this exists or is part of regular settings
            '/api/ai/generate',  // Example: Block generating new reports
            '/api/subscription', // Block subscription changes
            '/api/connect',      // Block adding connections
            '/danger-zone'
        ];

        // Strict Check: specific paths that modify state
        const isRestrictedPath = RESTRICTED_FOR_VIEWER.some(p => pathname.startsWith(p));

        if (isViewer && isRestrictedPath) {
            // If API request, return 403 JSON
            if (pathname.startsWith('/api/')) {
                return NextResponse.json({ error: 'Access Denied: Read-Only User' }, { status: 403 });
            }
            // If Page request, redirect to dashboard or show error
            return NextResponse.redirect(new URL('/dashboard?error=readonly', appUrl));
        }
        // ----------------------------

        let plan;
        if (priceId && isActive) {
            plan = getPlanDetails(priceId);
        } else {
            plan = getPlanDetails(null);
        }

        const limit = plan.limits[requirement.limitKey];
        let hasAccess = false;

        if (typeof requirement.minRequired === 'boolean') {
            const isTruthy = !!limit || limit === Number.POSITIVE_INFINITY;
            hasAccess = isTruthy === requirement.minRequired;
        } else if (typeof limit === 'number') {
            hasAccess = limit >= requirement.minRequired;
        }

        if (!hasAccess) {
            const url = new URL('/upgrade-plans', appUrl);
            url.searchParams.set('reason', isActive ? 'limit' : 'inactive_or_free');
            url.searchParams.set('feature', requirement.limitKey);
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

// ==============================================================
// 4. MAIN EXPORT: WITHAUTH WRAPPER
// ==============================================================
export default withAuth(
    customMiddleware,
    {
        callbacks: {
            authorized: ({ req, token }) => {
                const { pathname } = req.nextUrl;

                // A. PUBLIC PATHS - Allow
                const publicPaths = [
                    '/login',
                    '/registration',
                    '/verify-email',
                    '/auth/set-password',
                    '/api/auth',
                    '/api/register',
                    '/api/verify-token',
                    '/favicon.ico',
                    '/_next',
                    '/static',
                    '/api/webhooks',
                    '/api/crm/send-message',
                    '/api/webhooks/whatsapp'
                ];
                if (publicPaths.some(path => pathname.startsWith(path))) {
                    return true;
                }

                // B. ADMIN PATHS - Allow (Let inner middleware handle custom token check)
                if (pathname.startsWith('/admin')) {
                    return true;
                }

                // C. DEFAULT - Require Session Token
                // If token exists, return true (allow access -> run middleware).
                // If false, redirects to pages.signIn
                return !!token;
            },
        },
        pages: {
            signIn: '/login',
        },
    }
);

// ==============================================================
// 5. CONFIGURATION
// ==============================================================
export const config = {
    matcher: [
        "/dashboard/:path*",
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\.webp$|.*\\.png$|.*\\.jpg$).*)"
    ],
};
