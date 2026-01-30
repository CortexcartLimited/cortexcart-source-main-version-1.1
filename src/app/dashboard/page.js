'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Layout from '@/app/components/Layout';
import AlertBanner from '@/app/components/AlertBanner';
import DateFilter from '@/app/components/DataFilter';
import LiveVisitorCount from '@/app/components/LiveVisitorCount';
import SkeletonCard from '@/app/components/SkeletonCard';
import OnboardingModal from '@/app/components/OnboardingModal';
import AiChatAssistant from '@/app/components/AiChatAssistant';
import WelcomeModal from '@/app/components/WelcomeModal';
import FriendlyError from '@/app/components/FriendlyError';

// New Dynamic Dashboard Imports
import { DashboardProvider, useDashboard } from '@/app/context/DashboardContext';
import DynamicGrid from '@/app/components/dashboard/DynamicGrid';
import DashboardSwitcher from '@/app/components/dashboard/DashboardSwitcher';

const currencySymbols = { USD: '$', EUR: '€', GBP: '£', JPY: '¥', CAD: '$', AUD: '$', INR: '₹' };

// Wrapper to provide context
export default function DashboardPage() {
    return (
        <DashboardProvider>
            <DashboardContent />
        </DashboardProvider>
    );
}

function DashboardContent() {
    // ... (existing code)

    const { data: session, status, update } = useSession();
    const { activeDashboard } = useDashboard(); // Get active dashboard for context if needed

    // State
    const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

    // Data States
    const [stats, setStats] = useState(null);
    const [chartApiData, setChartApiData] = useState([]);
    const [recentEvents, setRecentEvents] = useState([]);
    const [topPages, setTopPages] = useState([]);
    const [topReferrers, setTopReferrers] = useState([]);
    const [deviceData, setDeviceData] = useState([]); // Kept for future use
    const [performanceData, setPerformanceData] = useState(null);
    const [performanceError, setPerformanceError] = useState('');
    const [alerts, setAlerts] = useState([]);
    const [showAiRecommendations, setShowAiRecommendations] = useState(false);

    // GA4 & Ads Data
    const [ga4Stats, setGa4Stats] = useState(null);
    const [ga4ChartData, setGa4ChartData] = useState([]);
    const [ga4AudienceData, setGa4AudienceData] = useState(null);
    const [ga4Demographics, setGa4Demographics] = useState(null);
    const [googleAdsData, setGoogleAdsData] = useState(null);
    const [quickBooksData, setQuickBooksData] = useState(null); // New QB Data
    const [shopifyData, setShopifyData] = useState(null); // New Shopify Data
    const [socialAnalytics, setSocialAnalytics] = useState(null); // New Social Data

    // General
    const [liveVisitors, setLiveVisitors] = useState(0);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [siteSettings, setSiteSettings] = useState({ currency: 'USD' });

    const [dateRange, setDateRange] = useState(() => {
        const endDate = new Date();
        const startDate = new Date('2020-01-01');
        return { startDate, endDate };
    });

    const siteId = session?.user?.email;

    useEffect(() => {
        if (status === 'authenticated' && session?.user && !session.user.onboarding_completed) {
            setIsOnboardingOpen(true);
        }
    }, [status, session]);

    const handleOnboardingComplete = () => {
        setIsOnboardingOpen(false);
        update();
    };

    useEffect(() => {
        if (status === 'loading') return;

        if (status !== 'authenticated' || !siteId) {
            setIsLoading(false);
            return;
        }

        const fetchData = async () => {
            setIsLoading(true);
            setError('');

            const sd = dateRange.startDate ? `&startDate=${dateRange.startDate}` : '';
            const ed = dateRange.endDate ? `&endDate=${dateRange.endDate}` : '';
            const dateParams = `${sd}${ed}`;

            try {
                // Fetch Alerts
                const alertsRes = await fetch('/api/alerts/active');
                if (alertsRes.ok) setAlerts(await alertsRes.json());
            } catch (e) { console.error("Could not fetch alerts", e); }

            try {
                // FETCH ALL DATA in parallel because we don't know what widgets are active!
                // In a production app with widget registry, we would check activeDashboard.widgets to see what data is needed.
                // For now, we fetch everything to be safe and enable mixing.

                // 1. CortexCart Data
                const cortexPromises = [
                    fetch(`/api/stats?siteId=${siteId}${dateParams}`),
                    fetch(`/api/charts/sales-by-day?siteId=${siteId}${dateParams}`),
                    fetch(`/api/events?siteId=${siteId}${dateParams}`),
                    fetch(`/api/stats/top-pages?siteId=${siteId}${dateParams}`),
                    fetch(`/api/stats/top-referrers?siteId=${siteId}${dateParams}`),
                    fetch(`/api/site-settings?siteId=${siteId}`),
                    // fetch(`/api/stats/device-types?siteId=${siteId}${dateParams}`), // Not used in current widgets?
                ];

                // 2. GA4 Data (Wrap in try/catch to not fail block if GA4 not connected)
                const ga4Promises = [
                    fetch(`/api/ga4-stats?siteId=${siteId}${dateParams}`),
                    fetch(`/api/ga4-charts?siteId=${siteId}${dateParams}`),
                    fetch(`/api/ga4-audience?siteId=${siteId}${dateParams}`),
                    fetch(`/api/ga4-demographics?siteId=${siteId}${dateParams}`),
                    fetch(`/api/google-ads?siteId=${siteId}${dateParams}`),
                ];

                const [statsRes, chartRes, eventsRes, pagesRes, referrersRes, settingsRes] = await Promise.all(cortexPromises);

                // Process Cortex Results
                if (statsRes.ok) setStats(await statsRes.json());
                if (chartRes.ok) setChartApiData(await chartRes.json());
                if (eventsRes.ok) setRecentEvents(await eventsRes.json());
                if (pagesRes.ok) setTopPages(await pagesRes.json());
                if (referrersRes.ok) setTopReferrers(await referrersRes.json());
                if (settingsRes.ok) setSiteSettings(await settingsRes.json());

                // Process GA4 Results (Individually to avoid failure cascade)
                try {
                    const [ga4StatsRes, ga4ChartRes, ga4AudRes, ga4DemoRes, adsRes] = await Promise.all(ga4Promises);

                    if (ga4StatsRes.ok) setGa4Stats(await ga4StatsRes.json());
                    if (ga4ChartRes.ok) setGa4ChartData(await ga4ChartRes.json());
                    if (ga4AudRes.ok) setGa4AudienceData(await ga4AudRes.json());
                    if (ga4DemoRes.ok) setGa4Demographics(await ga4DemoRes.json());
                    if (adsRes.ok) setGoogleAdsData(await adsRes.json());
                } catch (ga4Err) {
                    console.warn("GA4 Data partial failure or not connected", ga4Err);
                }

                // 3. QuickBooks Data
                try {
                    const qbRes = await fetch('/api/quickbooks/financial-summary');
                    if (qbRes.ok) setQuickBooksData(await qbRes.json());
                } catch (qbErr) { console.warn("QuickBooks Data failed", qbErr); }

                // 4. Shopify Data
                try {
                    const shopRes = await fetch('/api/shopify/store-info');
                    if (shopRes.ok) setShopifyData(await shopRes.json());
                } catch (shopErr) { console.warn("Shopify Data failed", shopErr); }

                // 5. Social Analytics Data
                try {
                    const socialRes = await fetch('/api/social/analytics');
                    if (socialRes.ok) setSocialAnalytics(await socialRes.json());
                } catch (socialErr) { console.warn("Social Analytics Data failed", socialErr); }

                // AI Recommendations
                try {
                    const aiRes = await fetch(`/api/gemini-recommendations?siteId=${siteId}${dateParams}`);
                    if (aiRes.ok) {
                        const aiAlert = await aiRes.json();
                        if (aiAlert) {
                            setAlerts(prevAlerts => {
                                const filtered = prevAlerts.filter(a => a.type !== 'ai-recommendation');
                                return [aiAlert, ...filtered];
                            });
                        }
                    }
                } catch (aiErr) { console.warn("AI Recs failed", aiErr); }

            } catch (err) {
                console.error("Dashboard Data Error:", err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [dateRange.startDate, dateRange.endDate, siteId, status]);

    // Live Visitors & Performance (Side Effects)
    useEffect(() => {
        if (status === 'loading' || !siteId) return;

        async function fetchPerformanceData() {
            setPerformanceError('');
            try {
                const res = await fetch('/api/performance/get-speed');
                const data = await res.json();
                if (res.ok) setPerformanceData(data);
                else if (res.status === 429) {
                    setPerformanceError(data.message || "Limit reached.");
                    if (data.score) setPerformanceData(data);
                }
            } catch (err) { setPerformanceError(err.message); }
        }
        fetchPerformanceData();

        const interval = setInterval(() => {
            fetch(`/api/stats/live-visitors?siteId=${siteId}`)
                .then(res => res.json())
                .then(data => setLiveVisitors(data.liveVisitors))
                .catch(console.error);
        }, 10000);
        return () => clearInterval(interval);
    }, [siteId, status]);

    // AI Delay
    useEffect(() => {
        const timer = setTimeout(() => setShowAiRecommendations(true), 10000);
        return () => clearTimeout(timer);
    }, []);

    const handleDateFilterChange = (startDate, endDate) => { setDateRange({ startDate, endDate }); };

    if (status === 'loading') return <Layout><p>Loading...</p></Layout>;

    // Prepare Context Data for Widgets
    const currencySymbol = siteSettings?.currency ? (currencySymbols[siteSettings.currency] || '$') : '$';

    const dataContext = {
        stats,
        chartApiData,
        recentEvents,
        topPages,
        topReferrers,
        liveVisitors,
        ga4Stats,
        ga4ChartData,
        ga4AudienceData,
        ga4Demographics,
        googleAdsData,
        quickBooksData, // Pass to context
        shopifyData, // Pass to context
        socialAnalytics, // Pass to context
        siteSettings,
        currencySymbol, // Pass currency symbol to context
        dateRange // Important for ActivityTimeline
    };

    // AI Context
    const aiContext = {
        revenue: stats?.totalRevenue || 0,
        sales: stats?.sales || 0,
        visitors: liveVisitors || 0,
        pageviews: stats?.pageviews || 0,
        activeAlerts: alerts || [],
        topPages: topPages || [],
        ga4Users: ga4Stats?.users || 0,
        ga4Conversions: ga4Stats?.conversions || 0,
    };

    return (
        <Layout>
            <OnboardingModal
                isOpen={isOnboardingOpen}
                onComplete={handleOnboardingComplete}
                siteId={session?.user?.site_id}
            />

            {/* Error Banner */}
            {error && (
                <FriendlyError
                    message={error.includes('fetch') ? `Connection Error. (Details: ${error})` : `Error: ${error}`}
                    onRetry={() => window.location.reload()}
                />
            )}

            {/* Viewer Mode Banner */}
            {session?.user?.role === 'viewer' && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-r-lg print-hidden">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-blue-700">
                                <strong>⚠️ Viewer Mode:</strong> You have read-only access to this workspace.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Alerts */}
            <div className="space-y-4 mb-6 bg-grey-200 print-hidden">
                {alerts.map((alert) => {
                    if (alert.type === 'ai-recommendation' && !showAiRecommendations) return null;
                    return <AlertBanner key={alert.id} title={alert.title} message={alert.message} type={alert.type} />;
                })}
            </div>

            {/* Header Area: Title + Switcher + Controls */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4 print-hidden">
                <div className="flex items-center gap-4">
                    {/* Dashboard Switcher Replaces Static Title */}
                    <div className="flex items-center gap-3">
                        <DashboardSwitcher />
                        <LiveVisitorCount count={liveVisitors} />
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <DateFilter onFilterChange={handleDateFilterChange} />
                </div>
            </div>

            {/* Dynamic Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6"><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>
            ) : (
                <div className="transition-opacity duration-300">
                    <DynamicGrid dataContext={dataContext} />
                </div>
            )}

            <AiChatAssistant contextData={aiContext} />
            <WelcomeModal />
        </Layout>
    );
}