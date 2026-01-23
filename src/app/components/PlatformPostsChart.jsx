'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function PlatformPostsChart({ data }) {
  if (!data || !data.labels || !data.datasets) return <div className="flex items-center justify-center h-full text-gray-500">No data available</div>;

  const chartData = data.labels.map((label, index) => ({
    name: label,
    posts: data.datasets[0].data[index],
    fill: data.datasets[0].backgroundColor[index]
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="posts" name="Posts" />
      </BarChart>
    </ResponsiveContainer>
  );
}