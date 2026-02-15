import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import Ga4LineChart from '@/app/components/Ga4LineChart';
import PlatformPostsChart from '@/app/components/PlatformPostsChart';
import EngagementByPlatformChart from '@/app/components/EngagementByPlatformChart';
import RecentPostsCard from '@/app/components/RecentPostsCard';
import { PLATFORMS } from '@/app/social/social-config';

const AnalyticsTabContent = () => {
    const { data: session } = useSession();
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSyncing, setIsSyncing] = useState({ x: false, facebook: false, pinterest: false, youtube: false });
    const [syncMessage, setSyncMessage] = useState('');
    const [syncMessageType, setSyncMessageType] = useState('info');

    const platformColors = {
        x: 'rgba(0, 0, 0, 0.7)',
        facebook: 'rgba(37, 99, 235, 0.7)', // blue-600
        pinterest: 'rgba(220, 38, 38, 0.7)', // red-600
        youtube: 'rgba(239, 68, 68, 0.7)', // red-500
        default: 'rgba(107, 114, 128, 0.7)' // gray-500
    };

    const fetchAnalytics = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/social/analytics');
            if (!res.ok) throw new Error('Failed to load analytics data.');
            const analyticsData = await res.json();
            setData(analyticsData);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    const handleSync = async (platform) => {
        setIsSyncing(prev => ({ ...prev, [platform]: true }));
        setSyncMessage('');
        try {
            const res = await fetch(`/api/social/${platform}/sync`, { method: 'POST' });
            const result = await res.json();
            if (!res.ok) {
                setSyncMessageType('error');
                throw new Error(result.message || `An unknown error occurred during ${platform} sync.`);
            }
            setSyncMessageType('success');
            setSyncMessage(result.message);
            fetchAnalytics(); // Refresh analytics after sync
        } catch (err) {
            setSyncMessageType('error');
            setSyncMessage(err.message);
        } finally {
            setIsSyncing(prev => ({ ...prev, [platform]: false }));
        }
    };

    if (isLoading) return <p className="text-center p-8">Loading analytics...</p>;
    if (error) return <p className="text-center p-8 text-red-600">{error}</p>;

    const { stats = {}, dailyReach = [], platformStats = [] } = data || {};

    const reachChartData = (dailyReach || []).map(item => ({ date: item.date, pageviews: item.reach, conversions: 0 }));

    const platformLabels = (platformStats || []).map(p => p.platform);
    const backgroundColors = (platformStats || []).map(p => platformColors[p.platform] || platformColors.default);

    const postsByPlatformData = {
        labels: platformStats.map(item => PLATFORMS[item.platform]?.name || item.platform),
        datasets: [{
            label: 'Number of Posts',
            data: platformStats.map(item => item.postCount || 0), // Default to 0 if null
            backgroundColor: backgroundColors,
            borderWidth: 1,
        }]
    };

    const engagementByPlatformData = {
        labels: platformLabels.map(label => PLATFORMS[label]?.name || label), // Use platform name for labels
        datasets: [{
            label: 'Engagement Rate',
            data: (platformStats || []).map(p => p.engagementRate || 0), // Default to 0
            backgroundColor: backgroundColors,
        }],
    };

    return (
        <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Analytics Overview</h3>
                <div className="flex flex-wrap gap-2">
                    {/* Dynamically create sync buttons based on PLATFORMS might be better but for now keep manual to control which ones represent valid sync endpoints */}
                    <button onClick={() => handleSync('x')} disabled={isSyncing.x} className="inline-flex items-center rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 disabled:bg-gray-400">
                        <ArrowPathIcon className={`-ml-0.5 mr-1.5 h-5 w-5 ${isSyncing.x ? 'animate-spin' : ''}`} />
                        {isSyncing.x ? 'Syncing...' : 'Sync with X'}
                    </button>
                    <button onClick={() => handleSync('facebook')} disabled={isSyncing.facebook} className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:bg-blue-400">
                        <ArrowPathIcon className={`-ml-0.5 mr-1.5 h-5 w-5 ${isSyncing.facebook ? 'animate-spin' : ''}`} />
                        {isSyncing.facebook ? 'Syncing...' : 'Sync with Facebook'}
                    </button>
                    <button onClick={() => handleSync('pinterest')} disabled={isSyncing.pinterest} className="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:bg-red-400">
                        <ArrowPathIcon className={`-ml-0.5 mr-1.5 h-5 w-5 ${isSyncing.pinterest ? 'animate-spin' : ''}`} />
                        {isSyncing.pinterest ? 'Syncing...' : 'Sync with Pinterest'}
                    </button>
                    <button onClick={() => handleSync('youtube')} disabled={isSyncing.youtube} className="inline-flex items-center rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-600 disabled:bg-red-400">
                        <ArrowPathIcon className={`-ml-0.5 mr-1.5 h-5 w-5 ${isSyncing.youtube ? 'animate-spin' : ''}`} />
                        {isSyncing.youtube ? 'Syncing...' : 'Sync with YouTube'}
                    </button>
                    <button onClick={() => handleSync('tiktok')} disabled={isSyncing.tiktok} className="inline-flex items-center rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 disabled:bg-gray-400">
                        <ArrowPathIcon className={`-ml-0.5 mr-1.5 h-5 w-5 ${isSyncing.tiktok ? 'animate-spin' : ''}`} />
                        {isSyncing.tiktok ? 'Syncing...' : 'Sync with TikTok'}
                    </button>
                </div>
                {syncMessage && (
                    <div className={`text-center text-sm p-3 rounded-md mt-4 ${syncMessageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {syncMessage}
                    </div>
                )}
            </div>

            {/* Key Metrics */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Key Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Posts</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalPosts || 0}</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-5 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Reach (Impressions)</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{(stats.totalReach || 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-5 rounded-lg border border-purple-200 dark:border-purple-800">
                        <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Avg. Engagement Rate</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{parseFloat(stats.engagementRate || 0).toFixed(2)}%</p>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                <h4 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Daily Reach (Last 30 Days)</h4>
                <div className="h-80"><Ga4LineChart data={reachChartData} /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                    <h4 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Posts by Platform</h4>
                    <div className="h-80 flex justify-center">
                        <PlatformPostsChart data={postsByPlatformData} />
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                    <h4 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Engagement Rate by Platform</h4>
                    <div className="h-80 flex justify-center"><EngagementByPlatformChart data={engagementByPlatformData} /></div>
                </div>
            </div>

            <RecentPostsCard />
        </div>
    );
};

export default AnalyticsTabContent;
