'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import SocialSyncButton from './social/SocialSyncButton';

export default function EngagementByPlatformChart({ data }) {
  if (!data || !data.labels || !data.datasets) return <div className="flex items-center justify-center h-full text-gray-500">No data available</div>;

  const chartData = data.labels.map((label, index) => ({
    name: label,
    rate: data.datasets[0].data[index],
    fill: data.datasets[0].backgroundColor[index]
  }));

  return (
    <div className="relative h-full w-full">
      <div className="absolute top-0 right-0 z-10">
        <SocialSyncButton />
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis unit="%" />
          <Tooltip formatter={(value) => `${value}%`} />
          <Legend />
          <Bar dataKey="rate" name="Engagement Rate" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}