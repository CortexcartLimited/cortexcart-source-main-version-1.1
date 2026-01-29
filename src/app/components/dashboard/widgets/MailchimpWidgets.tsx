'use client';

import React, { useState, useEffect } from 'react';
import { Users, ShoppingCart, ThumbsUp, Mail, TrendingUp } from 'lucide-react';
import useSWR from 'swr';
import AudienceGrowthChart from '@/app/components/social/AudienceGrowthChart';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// --- Helper Components ---
const Spinner = () => (
    <div className="flex justify-center items-center py-8">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
);

const ErrorMsg = ({ msg }: { msg: string }) => (
    <div className="p-4 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
        {msg}
    </div>
);

// --- Mailchimp Stat Card ---
export const MailchimpStatCard = ({ dataKey, title, icon: Icon, description }: any) => {
    const { data: audiencesData, error } = useSWR('/api/mailchimp/audiences', fetcher);
    const isLoading = !audiencesData && !error;

    if (isLoading) return <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow h-32 flex items-center justify-center"><Spinner /></div>;
    if (error) return <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow h-32 flex items-center justify-center"><ErrorMsg msg="Failed to load" /></div>;

    const audience = audiencesData?.[0]; // Default to first audience for now
    let value = 0;

    if (audience && audience.stats) {
        if (dataKey === 'member_count') value = audience.stats.member_count;
        else if (dataKey === 'unsubscribe_count') value = audience.stats.unsubscribe_count;
        else if (dataKey === 'open_rate') value = audience.stats.open_rate;
        else if (dataKey === 'click_rate') value = audience.stats.click_rate;
    }

    // Format if needed
    const displayValue = (dataKey === 'open_rate' || dataKey === 'click_rate')
        ? `${value}%`
        : value.toLocaleString();

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
                    {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
                </div>
                {Icon && <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg"><Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" /></div>}
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {displayValue}
            </div>
            {audience && <p className="text-xs text-gray-400 mt-2 truncate">Audience: {audience.name}</p>}
        </div>
    );
};

// --- Mailchimp Growth Chart ---
export const MailchimpGrowthChart = () => {
    const { data: audiences, error: audienceError } = useSWR('/api/mailchimp/audiences', fetcher);

    // We need an audience ID to fetch growth. 
    // This is tricky inside a widget without global state. 
    // We'll default to the first one available.
    const audienceId = audiences?.[0]?.id;

    const { data: growthData, error: growthError } = useSWR(
        audienceId ? `/api/mailchimp/audience-growth?list_id=${audienceId}` : null,
        fetcher
    );

    if (!audiences && !audienceError) return <div className="flex items-center justify-center h-full"><Spinner /></div>;
    if (audienceError || growthError) return <div className="flex items-center justify-center h-full"><ErrorMsg msg="Failed to load data" /></div>;
    if (!audiences?.length) return <div className="flex items-center justify-center h-full text-gray-500">No Mailchimp audiences found.</div>;
    if (!growthData) return <div className="flex items-center justify-center h-full"><Spinner /></div>;

    const totalSubs = growthData.reduce((acc: any, day: any) => acc + day.subs, 0);
    const totalUnsubs = growthData.reduce((acc: any, day: any) => acc + day.unsubs, 0);

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">Audience Growth</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{audiences[0].name} (Last 30 Days)</p>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-center">
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{totalSubs}</p>
                    <p className="text-[10px] text-blue-800 dark:text-blue-300 uppercase">New</p>
                </div>
                <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded text-center">
                    <p className="text-lg font-bold text-red-600 dark:text-red-400">{totalUnsubs}</p>
                    <p className="text-[10px] text-red-800 dark:text-red-300 uppercase">Unsubs</p>
                </div>
                <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded text-center">
                    <p className="text-lg font-bold text-gray-800 dark:text-gray-200">{totalSubs - totalUnsubs}</p>
                    <p className="text-[10px] text-gray-600 dark:text-gray-400 uppercase">Net</p>
                </div>
            </div>

            <div className="flex-1 min-h-0">
                <AudienceGrowthChart growthData={growthData} />
            </div>
        </div>
    );
};

// --- Mailchimp Campaigns List ---
export const MailchimpCampaignsList = () => {
    const { data: campaigns, error } = useSWR('/api/mailchimp/campaigns', fetcher);

    if (!campaigns && !error) return <div className="flex items-center justify-center h-full"><Spinner /></div>;
    if (error) return <div className="flex items-center justify-center h-full"><ErrorMsg msg="Failed to load campaigns" /></div>;
    if (!campaigns?.length) return <div className="p-4 text-center text-gray-500">No campaigns found.</div>;

    return (
        <div className="h-full bg-white dark:bg-gray-800 flex flex-col p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Recent Campaigns</h3>
            <div className="flex-1 overflow-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900/50 sticky top-0">
                        <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Campaign</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Open Rate</th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Click Rate</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {campaigns.slice(0, 5).map((camp: any) => (
                            <tr key={camp.id}>
                                <td className="px-3 py-2 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate w-32 md:w-48 lg:w-64">
                                        {camp.settings.subject_line || 'No Subject'}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {camp.send_time ? new Date(camp.send_time).toLocaleDateString() : 'Draft'}
                                    </div>
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap">
                                    <span className={`px-2 py-0.5 text-xs rounded-full capitalize ${camp.status === 'sent' ? 'bg-green-100 text-green-800' :
                                            camp.status === 'sending' ? 'bg-blue-100 text-blue-800' :
                                                'bg-gray-100 text-gray-800'
                                        }`}>
                                        {camp.status}
                                    </span>
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">
                                    {camp.report_summary ? `${(camp.report_summary.open_rate * 100).toFixed(1)}%` : '-'}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">
                                    {camp.report_summary ? `${(camp.report_summary.click_rate * 100).toFixed(1)}%` : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
