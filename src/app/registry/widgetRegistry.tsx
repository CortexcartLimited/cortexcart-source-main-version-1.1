'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// --- Loading Component ---
const WidgetLoader = () => (
    <div className="flex h-full w-full items-center justify-center min-h-[100px] text-gray-400">
        <Loader2 className="h-6 w-6 animate-spin" />
    </div>
);

// --- Component Imports with Lazy Loading ---
const StatCard = dynamic(() => import('@/app/components/StatCard'), { loading: WidgetLoader });
const SalesBarChart = dynamic(() => import('@/app/components/SalesBarChart'), { loading: WidgetLoader });
const ActivityTimeline = dynamic(() => import('@/app/components/ActivityTimeline'), { loading: WidgetLoader });
const TopPagesChart = dynamic(() => import('@/app/components/TopPagesChart'), { loading: WidgetLoader });
const TopReferrersList = dynamic(() => import('@/app/components/TopReferrersList'), { loading: WidgetLoader });
const SocialPlatformPie = dynamic(() => import('@/app/components/SocialPlatformPie'), { loading: WidgetLoader });
const SocialReachChart = dynamic(() => import('@/app/components/SocialReachChart'), { loading: WidgetLoader });
const TrafficSourceTable = dynamic(() => import('@/app/components/TrafficSourceTable'), { loading: WidgetLoader });
const TopSocialPosts = dynamic(() => import('@/app/components/TopSocialPosts'), { loading: WidgetLoader });
const Ga4LineChart = dynamic(() => import('@/app/components/Ga4LineChart'), { loading: WidgetLoader });
const GoogleAdsCharts = dynamic(() => import('@/app/components/GoogleAdsCharts'), { loading: WidgetLoader });
const QuickBooksStatCard = dynamic(() => import('@/app/components/QuickBooksStatCard'), { loading: WidgetLoader });
const QuickBooksChart = dynamic(() => import('@/app/components/QuickBooksChart'), { loading: WidgetLoader });
const ShopifyStatCard = dynamic(() => import('@/app/components/ShopifyStatCard'), { loading: WidgetLoader });
const ShopifyProductList = dynamic(() => import('@/app/components/ShopifyProductList'), { loading: WidgetLoader });
const RecentPostsCard = dynamic(() => import('@/app/components/RecentPostsCard'), { loading: WidgetLoader });
const PlatformPostsChart = dynamic(() => import('@/app/components/PlatformPostsChart'), { loading: WidgetLoader });
const EngagementByPlatformChart = dynamic(() => import('@/app/components/EngagementByPlatformChart'), { loading: WidgetLoader });
const DescriptionWidget = dynamic(() => import('@/app/components/dashboard/widgets/DescriptionWidget'), { loading: WidgetLoader });
const ListWidget = dynamic(() => import('@/app/components/dashboard/widgets/ListWidget'), { loading: WidgetLoader });
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Box, LineChart, Share2, ThumbsUp, MessageCircle, ShoppingBag, Users } from 'lucide-react'; // Import icons for static usage if needed, though registry handles components

// --- Registry Type Definition ---
type WidgetComponentType = React.ComponentType<any>;

interface RegistryItem {
    component: WidgetComponentType;
    // Function to map context data to component props
    mapProps: (props: any, contextData: any) => any;
    wrapperClass?: string;
}

// --- Data Resolver Helper ---
function resolveDataKey(data: any, key: string) {
    if (!data) return 0;
    switch (key) {
        case 'revenue': return data.stats?.totalRevenue;
        case 'sales': return data.stats?.sales;
        case 'visitors': return data.liveVisitors;
        case 'pageviews': return data.stats?.pageviews;
        case 'ga4Users': return data.ga4Stats?.users;
        case 'ga4Sessions': return data.ga4Stats?.sessions;
        case 'ga4Pageviews': return data.ga4Stats?.pageviews;
        case 'ga4Conversions': return data.ga4Stats?.conversions;
        default: return 0;
    }
}

// --- The Registry Object ---
export const WIDGET_REGISTRY: Record<string, RegistryItem> = {
    StatCard: {
        component: StatCard,
        mapProps: (props, contextData) => ({
            title: props.title,
            icon: props.icon,
            description: props.description,
            value: props.dataKey ?
                (props.dataKey === 'revenue'
                    ? `${contextData.currencySymbol || '$'}${(resolveDataKey(contextData, props.dataKey) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : (resolveDataKey(contextData, props.dataKey) || 0).toLocaleString())
                : props.value
        })
    },
    SalesBarChart: {
        component: SalesBarChart,
        mapProps: (_, contextData) => ({
            apiData: contextData.chartApiData,
            currencySymbol: contextData.currencySymbol || '$'
        }),
        wrapperClass: "p-4 bg-white dark:bg-gray-800 rounded-lg shadow h-96 overflow-hidden min-w-0" // Added overflow fix
    },
    ActivityTimeline: {
        component: ActivityTimeline,
        mapProps: (_, contextData) => ({
            dateRange: contextData.dateRange
        }),
        wrapperClass: "p-4 bg-white dark:bg-gray-800 rounded-lg shadow h-full overflow-hidden min-w-0"
    },
    TopPagesChart: {
        component: TopPagesChart,
        mapProps: (_, contextData) => ({
            data: contextData.topPages
        })
    },
    TopReferrersList: {
        component: TopReferrersList,
        mapProps: (_, contextData) => ({
            referrers: contextData.topReferrers
        }),
        wrapperClass: "p-4 bg-white dark:bg-gray-800 rounded-lg shadow h-full overflow-hidden min-w-0"
    },
    SocialPlatformPie: {
        component: SocialPlatformPie,
        mapProps: () => ({})
    },
    ShopifyProductList: {
        component: ShopifyProductList,
        mapProps: () => ({})
    },
    ShopifyStatCard: {
        component: ShopifyStatCard,
        mapProps: (props, contextData) => {
            const data = contextData.shopifyData || {};
            const currency = data.shop?.currency_symbol || '$';

            let value: string | number = 0;
            let icon = null;

            if (props.dataKey === 'totalSales') {
                value = currency + (parseFloat(data.totalSales || '0')).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                icon = ShoppingBag;
            } else if (props.dataKey === 'totalVisits') {
                value = (data.totalVisits || 0).toLocaleString();
                icon = Users;
            }

            return {
                title: props.title,
                value: value,
                icon: icon,
                description: props.description,
                className: props.className
            };
        }
    },
    RecentPostsCard: {
        component: RecentPostsCard,
        mapProps: () => ({}),
        wrapperClass: "p-0 bg-transparent shadow-none" // Contains its own card style
    },
    PlatformPostsChart: {
        component: PlatformPostsChart,
        mapProps: (props, contextData) => {
            // Logic extracted from social/page.js
            const data = contextData.socialAnalytics || {};
            const platformStats = data.platformStats || [];
            const platformColors: any = {
                x: 'rgba(0, 0, 0, 0.7)',
                facebook: 'rgba(37, 99, 235, 0.7)',
                pinterest: 'rgba(220, 38, 38, 0.7)',
                youtube: 'rgba(239, 68, 68, 0.7)',
                default: 'rgba(107, 114, 128, 0.7)'
            };
            const backgroundColors = platformStats.map((p: any) => platformColors[p.platform] || platformColors.default);

            return {
                data: {
                    labels: platformStats.map((item: any) => item.platform),
                    datasets: [{
                        data: platformStats.map((item: any) => item.postCount || 0),
                        backgroundColor: backgroundColors
                    }]
                }
            };
        },
        wrapperClass: "p-4 bg-white dark:bg-gray-800 rounded-lg shadow h-96 overflow-hidden min-w-0" // Added overflow fix
    },
    EngagementByPlatformChart: {
        component: EngagementByPlatformChart,
        mapProps: (props, contextData) => {
            const data = contextData.socialAnalytics || {};
            const platformStats = data.platformStats || [];
            const platformColors: any = {
                x: 'rgba(0, 0, 0, 0.7)',
                facebook: 'rgba(37, 99, 235, 0.7)',
                pinterest: 'rgba(220, 38, 38, 0.7)',
                youtube: 'rgba(239, 68, 68, 0.7)',
                default: 'rgba(107, 114, 128, 0.7)'
            };
            const backgroundColors = platformStats.map((p: any) => platformColors[p.platform] || platformColors.default);

            return {
                data: {
                    labels: platformStats.map((item: any) => item.platform),
                    datasets: [{
                        data: platformStats.map((p: any) => parseFloat(p.engagementRate || '0')),
                        backgroundColor: backgroundColors
                    }]
                }
            };
        },
        wrapperClass: "p-4 bg-white dark:bg-gray-800 rounded-lg shadow h-96 overflow-hidden min-w-0" // Added overflow fix
    },
    SocialReachChart: { // Re-defining to use real data
        component: Ga4LineChart, // Re-using LineChart component but mapping social data
        mapProps: (_, contextData) => {
            const data = contextData.socialAnalytics || {};
            const dailyReach = data.dailyReach || [];
            return {
                data: dailyReach.map((item: any) => ({ date: item.date, pageviews: item.reach, conversions: 0 })) // Mapping reach to 'pageviews' prop of Ga4LineChart
            };
        },
        wrapperClass: "p-4 bg-white dark:bg-gray-800 rounded-lg shadow h-96 overflow-hidden min-w-0" // Added overflow fix
    },
    SocialStatCard: { // Generic social stat wrapper
        component: StatCard,
        mapProps: (props, contextData) => {
            const data = contextData.socialAnalytics || {};
            const stats = data.stats || {};
            let value: string | number = 0;

            if (props.dataKey === 'totalPosts') value = stats.totalPosts || 0;
            else if (props.dataKey === 'totalReach') value = (stats.totalReach || 0).toLocaleString();
            else if (props.dataKey === 'engagementRate') value = (parseFloat(stats.engagementRate || '0').toFixed(2)) + '%';

            return {
                title: props.title,
                value: value,
                icon: props.icon,
                description: props.description
            };
        }
    },
    TrafficSourceTable: {
        component: TrafficSourceTable,
        mapProps: (_, contextData) => ({
            // If TrafficSourceTable expects props, map them here. 
            // Assuming it fetches its own data or uses contextData if refined later.
            // For now, mapping contextData if it accepts it, or empty if it's self-contained.
            // Checking usage implies it might be self-contained or use specific data.
        }),
        wrapperClass: "p-4 bg-white dark:bg-gray-800 rounded-lg shadow h-full overflow-hidden min-w-0"
    },
    TopSocialPosts: {
        component: TopSocialPosts,
        mapProps: (_, contextData) => ({
            posts: contextData.socialAnalytics?.topPosts
        }),
        wrapperClass: "p-4 bg-white dark:bg-gray-800 rounded-lg shadow h-full overflow-hidden min-w-0"
    },
    Ga4LineChart: {
        component: Ga4LineChart,
        mapProps: (_, contextData) => ({
            data: contextData.ga4ChartData
        }),
        wrapperClass: "p-4 bg-white dark:bg-gray-800 rounded-lg shadow h-96 overflow-hidden min-w-0"
    },
    GoogleAdsCharts: {
        component: GoogleAdsCharts,
        mapProps: (_, contextData) => ({
            data: contextData.googleAdsData
        }),
        wrapperClass: "p-4 bg-white dark:bg-gray-800 rounded-lg shadow h-96 overflow-hidden min-w-0"
    },
    QuickBooksStatCard: {
        component: QuickBooksStatCard,
        mapProps: (props, contextData) => ({
            title: props.title,
            description: props.description,
            dataKey: props.dataKey,
            data: contextData.quickBooksData
        })
    },
    QuickBooksChart: {
        component: QuickBooksChart,
        mapProps: (_, contextData) => ({
            data: contextData.quickBooksData
        }),
        wrapperClass: "p-4 bg-white dark:bg-gray-800 rounded-lg shadow h-96 overflow-hidden min-w-0"
    },
    SectionHeader: {
        component: ({ title, onUpdate }: { title: string, onUpdate?: (upd: any) => void }) => {
            const [localTitle, setLocalTitle] = React.useState(title);
            const [isEditing, setIsEditing] = React.useState(false);

            const handleBlur = () => {
                setIsEditing(false);
                if (localTitle !== title && onUpdate) {
                    onUpdate({ title: localTitle });
                }
            };

            return (
                <div className="w-full py-4 border-b border-gray-200 dark:border-gray-700 mb-4 group/header">
                    {isEditing ? (
                        <input
                            value={localTitle}
                            onChange={(e) => setLocalTitle(e.target.value)}
                            onBlur={handleBlur}
                            autoFocus
                            className="text-2xl font-bold text-gray-800 dark:text-gray-100 bg-transparent border-dashed border-b border-gray-400 focus:outline-none w-full"
                        />
                    ) : (
                        <h2
                            className="text-2xl font-bold text-gray-800 dark:text-gray-100 cursor-text hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded px-1 -ml-1 transition-colors"
                            onClick={() => setIsEditing(true)}
                        >
                            {title}
                        </h2>
                    )}
                </div>
            );
        },
        mapProps: (props) => ({ title: props.title })
    },
    DescriptionWidget: {
        component: DescriptionWidget,
        mapProps: (props) => ({ content: props.content }),
        wrapperClass: "p-4 bg-white dark:bg-gray-800 rounded-lg shadow h-full min-h-[150px] resize-y overflow-hidden hover:overflow-auto min-w-0"
    },
    BulletListWidget: {
        component: ListWidget,
        mapProps: (props) => ({ items: props.items, listType: 'bullet' }),
        wrapperClass: "p-4 bg-white dark:bg-gray-800 rounded-lg shadow h-full min-h-[150px] resize-y overflow-hidden hover:overflow-auto min-w-0"
    },
    NumberedListWidget: {
        component: ListWidget,
        mapProps: (props) => ({ items: props.items, listType: 'number' }),
        wrapperClass: "p-4 bg-white dark:bg-gray-800 rounded-lg shadow h-full min-h-[150px] resize-y overflow-hidden hover:overflow-auto min-w-0"
    },

    // --- Comparison Widget Logic ---
    ComparisonWidget: {
        component: ({ left, right }: { left: React.ReactNode, right: React.ReactNode }) => (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                <div className="border-r border-gray-200 dark:border-gray-700 pr-2">{left}</div>
                <div className="pl-2">{right}</div>
            </div>
        ),
        mapProps: (props, contextData) => {
            // Basic implementation: Expects 'leftWidget' and 'rightWidget' definitions in props
            // This is a simplified version where we'd need to recursively resolve those widgets.
            // For now, let's just render placeholders if not properly defined.
            return {
                left: <div className="p-4 text-center text-gray-500">Left View ({props.leftType || 'None'})</div>,
                right: <div className="p-4 text-center text-gray-500">Right View ({props.rightType || 'None'})</div>
            };
        },
        wrapperClass: "p-4 bg-white dark:bg-gray-800 rounded-lg shadow"
    }
};

export function getWidgetComponent(type: string) {
    return WIDGET_REGISTRY[type];
}
