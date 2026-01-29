import {
    Users, ShoppingCart, DollarSign, Eye, TrendingUp, TrendingDown,
    BarChart, Clock, FileText, Link, PieChart, LineChart, Megaphone,
    Package, Type, ShoppingBag, Receipt, Store, Share2, ThumbsUp, MessageCircle, MousePointerClick
} from 'lucide-react';

export const WIDGET_CATALOG = [
    {
        category: 'Essentials',
        items: [
            { type: 'StatCard', label: 'Live Visitors', icon: Users, defaultSize: '1/3', defaultProps: { title: 'Live Visitors', icon: '👥', dataKey: 'visitors' } },
            { type: 'StatCard', label: 'Total Sales', icon: ShoppingCart, defaultSize: '1/3', defaultProps: { title: 'Total Sales', icon: '🛒', dataKey: 'sales' } },
            { type: 'StatCard', label: 'Total Revenue', icon: DollarSign, defaultSize: '1/3', defaultProps: { title: 'Total Revenue', icon: '💰', dataKey: 'revenue' } },
            { type: 'StatCard', label: 'Page Views', icon: Eye, defaultSize: '1/3', defaultProps: { title: 'Page Views', icon: '👁️', dataKey: 'pageviews' } },
            { type: 'QuickBooksStatCard', label: 'QB Total Revenue', icon: Receipt, defaultSize: '1/3', defaultProps: { title: 'QB Revenue', description: 'Fiscal Year', dataKey: 'totalRevenue' }, platform: 'quickbooks' },
            { type: 'QuickBooksStatCard', label: 'QB Total Expenses', icon: Receipt, defaultSize: '1/3', defaultProps: { title: 'QB Expenses', description: 'Fiscal Year', dataKey: 'totalExpenses' }, platform: 'quickbooks' },
            { type: 'QuickBooksStatCard', label: 'QB Net Profit', icon: TrendingUp, defaultSize: '1/3', defaultProps: { title: 'QB Net Profit', description: 'Fiscal Year', dataKey: 'netProfit' }, platform: 'quickbooks' },
            { type: 'ShopifyStatCard', label: 'Shopify Sales', icon: ShoppingBag, defaultSize: '1/3', defaultProps: { title: 'Store Sales', description: 'All-time Net', dataKey: 'totalSales', className: 'bg-blue-50 dark:bg-blue-900/20' }, platform: 'shopify' },
            { type: 'ShopifyStatCard', label: 'Shopify Visits', icon: Users, defaultSize: '1/3', defaultProps: { title: 'Total Visits', description: 'All-time Sessions', dataKey: 'totalVisits', className: 'bg-green-50 dark:bg-green-900/20' }, platform: 'shopify' },
            { type: 'SocialStatCard', label: 'Social Posts', icon: Share2, defaultSize: '1/3', defaultProps: { title: 'Total Posts', description: 'All Platforms', dataKey: 'totalPosts' } },
            { type: 'SocialStatCard', label: 'Social Reach', icon: Users, defaultSize: '1/3', defaultProps: { title: 'Total Reach', description: 'Impressions', dataKey: 'totalReach' } },
            { type: 'SocialStatCard', label: 'Avg Engagement', icon: ThumbsUp, defaultSize: '1/3', defaultProps: { title: 'Avg Engagement', description: 'Click/Like Rate', dataKey: 'engagementRate' } },
        ]
    },
    {
        category: 'Charts',
        items: [
            { type: 'SalesBarChart', label: 'Sales Bar Chart', icon: BarChart, defaultSize: 'Full', defaultProps: { title: 'Sales Overview' } },
            { type: 'ActivityTimeline', label: 'Recent Activity', icon: Clock, defaultSize: '1/2', defaultProps: { title: 'Recent Events' } },
            { type: 'TopPagesChart', label: 'Top Pages', icon: FileText, defaultSize: '1/2', defaultProps: { title: 'Top Pages' } },
            { type: 'TopReferrersList', label: 'Referrers List', icon: Link, defaultSize: '1/2', defaultProps: { title: 'Top Referrers' } },
            { type: 'SocialPlatformPie', label: 'Social Platform Distribution', icon: PieChart, defaultSize: '1/2', defaultProps: { title: 'Social Distribution' } },
            { type: 'SocialReachChart', label: 'Daily Social Reach', icon: LineChart, defaultSize: 'Full', defaultProps: { title: 'Daily Reach Trend' } },
            { type: 'PlatformPostsChart', label: 'Posts by Platform', icon: BarChart, defaultSize: 'Full', defaultProps: { title: 'Posts Distribution' } },
            { type: 'EngagementByPlatformChart', label: 'Engagement by Platform', icon: BarChart, defaultSize: 'Full', defaultProps: { title: 'Engagement Rates' } },
            { type: 'RecentPostsCard', label: 'Recent Social Posts', icon: MessageCircle, defaultSize: 'Full', defaultProps: { title: 'Recent Posts' } },
            { type: 'Ga4LineChart', label: 'GA4 Traffic & Conversions', icon: LineChart, defaultSize: 'Full', defaultProps: { title: 'Traffic & Conversions' } },
            { type: 'GoogleAdsCharts', label: 'Google Ads Performance', icon: Megaphone, defaultSize: 'Full', defaultProps: { title: 'Google Ads' } },
            { type: 'QuickBooksChart', label: 'Financial Overview', icon: BarChart, defaultSize: 'Full', defaultProps: { title: 'Financial Overview' }, platform: 'quickbooks' },
            { type: 'ShopifyProductList', label: 'Product List', icon: Package, defaultSize: 'Full', defaultProps: { title: 'Your Products' }, platform: 'shopify' },
        ]
    },
    {
        category: 'Text & Content',
        items: [
            { type: 'DescriptionWidget', label: 'Description', icon: FileText, defaultSize: 'Full', defaultProps: {} },
            { type: 'BulletListWidget', label: 'Bullet List', icon: Share2, defaultSize: '1/2', defaultProps: { title: 'Bullet List' } },
            { type: 'NumberedListWidget', label: 'Numbered List', icon: Type, defaultSize: '1/2', defaultProps: { title: 'Numbered List' } },
        ]
    },
    {
        category: 'Design & Layout',
        items: [
            { type: 'SectionHeader', label: 'Section Header', icon: Type, defaultSize: 'Full', defaultProps: { title: 'New Section' } },
        ]
    },
    {
        category: 'Marketing',
        items: [

            { type: 'MailchimpStatCard', label: 'Mailchimp Subscribers', icon: Users, defaultSize: '1/3', defaultProps: { title: 'Total Subscribers', dataKey: 'member_count', icon: Users }, platform: 'mailchimp' },
            { type: 'MailchimpStatCard', label: 'Mailchimp Resubscribes', icon: Users, defaultSize: '1/3', defaultProps: { title: 'Unsubscribes', dataKey: 'unsubscribe_count', icon: Users }, platform: 'mailchimp' },
            { type: 'MailchimpStatCard', label: 'Mailchimp Open Rate', icon: Eye, defaultSize: '1/3', defaultProps: { title: 'Avg Open Rate', dataKey: 'open_rate', icon: Eye }, platform: 'mailchimp' },
            { type: 'MailchimpStatCard', label: 'Mailchimp Click Rate', icon: MousePointerClick, defaultSize: '1/3', defaultProps: { title: 'Avg Click Rate', dataKey: 'click_rate', icon: MousePointerClick }, platform: 'mailchimp' },
            { type: 'MailchimpGrowthChart', label: 'Audience Growth', icon: TrendingUp, defaultSize: '1/2', defaultProps: {}, platform: 'mailchimp' },
            { type: 'MailchimpCampaignsList', label: 'Recent Campaigns', icon: Megaphone, defaultSize: '1/2', defaultProps: {}, platform: 'mailchimp' },
            { type: 'DemographicsWidget', label: 'Audience Demographics', icon: Users, defaultSize: 'Full', defaultProps: {} },
        ]
    }
];

