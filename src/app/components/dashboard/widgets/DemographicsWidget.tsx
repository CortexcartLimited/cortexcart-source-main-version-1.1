'use client';

import React from 'react';
import useSWR from 'swr';
import DemographicsCharts from '@/app/components/DemographicsCharts';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DemographicsWidget() {
    const { data, error } = useSWR('/api/social/demographics', fetcher);

    if (error) return <div className="p-4 text-red-500 bg-white dark:bg-gray-800 rounded-lg shadow h-full flex items-center justify-center">Failed to load demographics</div>;
    if (!data) return <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow h-full flex items-center justify-center">Loading...</div>;

    // Check if the API returned an error object explicitly
    if (data.error) {
        return <div className="p-4 text-gray-500 bg-white dark:bg-gray-800 rounded-lg shadow h-full flex items-center justify-center text-center">{data.error}</div>;
    }

    return (
        <div className="h-full w-full overflow-auto p-4">
            <div className="mb-4">
                <h3 className="font-semibold text-gray-800 dark:text-gray-100">Audience Demographics</h3>
                <p className="text-xs text-gray-500">Aggregated from connected social platforms</p>
            </div>
            <DemographicsCharts data={data} />
        </div>
    );
}
