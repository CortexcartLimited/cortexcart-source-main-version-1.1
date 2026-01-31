import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        // 1. Get the site URL from your database
        const [rows] = await db.query(
            'SELECT site_url FROM sites WHERE user_email = ?',
            [session.user.email]
        );

        if (rows.length === 0 || !rows[0].site_url) {
            return NextResponse.json({ error: 'Site URL not configured' }, { status: 404 });
        }

        let url = rows[0].site_url;
        // Ensure URL has https://
        if (!url.startsWith('http')) url = `https://${url}`;

        // --- CACHE IMPLEMENTATION START ---

        // Helper to ensure cache table exists (run only once per cold start ideally, but safe here)
        await db.query(`
            CREATE TABLE IF NOT EXISTS pagespeed_cache (
                url VARCHAR(255) PRIMARY KEY,
                data JSON,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Check cache
        const [cacheRows] = await db.query(
            'SELECT data, updated_at FROM pagespeed_cache WHERE url = ?',
            [url]
        );

        if (cacheRows.length > 0) {
            const cached = cacheRows[0];
            const cacheAge = Date.now() - new Date(cached.updated_at).getTime();
            const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

            if (cacheAge < CACHE_DURATION) {
                console.log(`Serving PageSpeed from cache for: ${url}`);
                return NextResponse.json(cached.data);
            }
        }
        // --- CACHE IMPLEMENTATION END ---

        // 2. Call Google PageSpeed API
        const apiKey = process.env.GOOGLE_API_KEY || '';
        const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile&category=performance&category=seo${apiKey ? `&key=${apiKey}` : ''}`;

        console.log(`Fetching PageSpeed API for: ${url}`);
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!response.ok) {
            // If quota exceeded, try to return stale cache if available
            if (response.status === 429 && cacheRows.length > 0) {
                console.warn("Quota exceeded. Returning stale cache.");
                return NextResponse.json({ ...cacheRows[0].data, _stale: true });
            }
            throw new Error(data.error?.message || 'Failed to fetch PageSpeed data');
        }

        // 3. Extract Data safely
        const lighthouse = data.lighthouseResult;
        const audits = lighthouse.audits || {};
        const lcp = audits['largest-contentful-paint']?.displayValue || 'N/A';
        const cls = audits['cumulative-layout-shift']?.displayValue || 'N/A';
        const fcp = audits['first-contentful-paint']?.displayValue || 'N/A';

        const performancScore = lighthouse.categories?.performance?.score
            ? Math.round(lighthouse.categories.performance.score * 100)
            : 0;

        if (!performancScore && !data.error) {
            console.warn("Lighthouse returned no performance score.");
        }

        const resultData = {
            score: performancScore,
            metrics: { lcp, cls, fcp }
        };

        // Save to Cache
        await db.query(
            'INSERT INTO pagespeed_cache (url, data) VALUES (?, ?) ON DUPLICATE KEY UPDATE data = VALUES(data), updated_at = CURRENT_TIMESTAMP',
            [url, JSON.stringify(resultData)]
        );

        return NextResponse.json(resultData);

    } catch (error) {
        console.error('PageSpeed Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}