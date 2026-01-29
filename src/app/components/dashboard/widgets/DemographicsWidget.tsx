'use client';

import React from 'react';
import useSWR from 'swr';
import DemographicsCharts from '@/app/components/DemographicsCharts';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DemographicsWidget() {
    const { data, error } = useSWR('/api/social/demographics', fetcher);

    if (error) return <div className="p-4 text-red-500 bg-white dark:bg-gray-800 rounded-lg shadow h-full flex items-center justify-center">Failed to load demographics</div>;
    if (!data) return <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow h-full flex items-center justify-center">Loading...</div>;

    // DemographicsCharts expects data={ ageData, genderData, countryData }
    // We assume the API returns this format or we adapt it here.

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow h-full overflow-auto">
            <div className="mb-4">
                <h3 className="font-semibold text-gray-800 dark:text-gray-100">Audience Demographics</h3>
                <p className="text-xs text-gray-500">Aggregated from connected social platforms</p>
            </div>
            <DemographicsCharts data={data} />
        </div>
    );
}
