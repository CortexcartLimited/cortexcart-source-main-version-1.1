import { db } from '@/lib/db';
import { decrypt } from '@/lib/crypto';

export async function getReportingData(identifier, startDate, endDate) {
    try {
        // 1. Resolve Site ID & User Email
        let siteId = identifier;
        let userEmail = identifier;
        let currency = '$';

        if (identifier.includes('@')) {
            const [siteRows] = await db.query(
                'SELECT id, currency FROM sites WHERE user_email = ?',
                [identifier]
            );
            if (siteRows.length > 0) {
                siteId = siteRows[0].id;
                currency = siteRows[0].currency || '$';
            } else {
                // EDGE CASE: User has account but no site set up
                return {
                    dateRange: { start: startDate, end: endDate },
                    currency,
                    stats: { totalRevenue: "Not Connected", visitors: 0, pageviews: 0 },
                    topPages: [],
                    referrers: []
                };
            }
        }

        // 2. Set Dates
        const endObj = endDate ? new Date(endDate) : new Date();
        const startObj = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const endIso = endObj.toISOString().split('T')[0];
        const startIso = startObj.toISOString().split('T')[0];

        // 3. Get Traffic Stats (Internal)
        const [trafficStats] = await db.query(`
            SELECT
                COUNT(DISTINCT id) as visitors,
                COUNT(*) as pageviews
            FROM events
            WHERE site_id = ? AND event_name = 'pageview' AND created_at BETWEEN ? AND ?
        `, [siteId, startIso, endIso]);

        // 4. Get Revenue (Shopify Logic)
        let totalRevenue = "Not Connected"; // DEFAULT STATUS
        let salesByDay = [];

        try {
            const [storeRows] = await db.query(
                'SELECT store_url, access_token_encrypted FROM shopify_stores WHERE user_email = ?',
                [userEmail]
            );

            if (storeRows.length > 0) {
                const { store_url, access_token_encrypted } = storeRows[0];
                const accessToken = decrypt(access_token_encrypted);

                const queryParams = new URLSearchParams({
                    status: 'any',
                    created_at_min: startObj.toISOString(),
                    created_at_max: endObj.toISOString(),
                    limit: '250',
                    fields: 'total_price,created_at'
                });

                const shopifyRes = await fetch(`https://${store_url}/admin/api/2024-04/orders.json?${queryParams}`, {
                    headers: {
                        'X-Shopify-Access-Token': accessToken,
                        'Content-Type': 'application/json'
                    }
                });

                if (shopifyRes.ok) {
                    const data = await shopifyRes.json();

                    // Calculate Total Revenue
                    totalRevenue = data.orders.reduce((sum, order) => sum + parseFloat(order.total_price), 0);

                    // Calculate Daily Sales for Chart
                    const salesMap = {};
                    data.orders.forEach(order => {
                        const date = order.created_at.split('T')[0];
                        salesMap[date] = (salesMap[date] || 0) + parseFloat(order.total_price);
                    });

                    // Sort by date
                    salesByDay = Object.keys(salesMap).sort().map(date => ({
                        date,
                        total_sales: parseFloat(salesMap[date].toFixed(2))
                    }));

                } else {
                    console.warn("Shopify API Error:", shopifyRes.statusText);
                    totalRevenue = "Sync Error";
                }
            }
        } catch (shopifyErr) {
            console.error("Failed to fetch Shopify revenue:", shopifyErr);
            totalRevenue = "Sync Error";
            salesByDay = [];
        }

        // 5. Get Top Pages
        const [topPages] = await db.query(`
            SELECT
                JSON_UNQUOTE(JSON_EXTRACT(event_data, '$.pathname')) as pathname,
                COUNT(*) as views
            FROM events
            WHERE
                site_id = ? AND
                event_name = 'pageview' AND
                created_at BETWEEN ? AND ?
            GROUP BY pathname
            ORDER BY views DESC
            LIMIT 5
        `, [siteId, startIso, endIso]);

        // 6. Get Top Referrers
        const [referrers] = await db.query(`
            SELECT
                JSON_UNQUOTE(JSON_EXTRACT(event_data, '$.referrer')) as referrer,
                COUNT(*) as count
            FROM events
            WHERE
                site_id = ? AND
                event_name = 'pageview' AND
                created_at BETWEEN ? AND ? AND
                JSON_UNQUOTE(JSON_EXTRACT(event_data, '$.referrer')) IS NOT NULL AND
                JSON_UNQUOTE(JSON_EXTRACT(event_data, '$.referrer')) != ''
            GROUP BY referrer
            ORDER BY count DESC
            LIMIT 5
        `, [siteId, startIso, endIso]);

        return {
            dateRange: { start: startIso, end: endIso },
            currency,
            stats: {
                // totalRevenue can now be a number OR a string like "Not Connected"
                totalRevenue: totalRevenue,
                visitors: trafficStats[0]?.visitors || 0,
                pageviews: trafficStats[0]?.pageviews || 0
            },
            topPages,
            referrers,
            salesByDay
        };

    } catch (error) {
        console.error("Data Helper Error:", error);
        throw new Error(`Failed to fetch report data: ${error.message}`);
    }
}