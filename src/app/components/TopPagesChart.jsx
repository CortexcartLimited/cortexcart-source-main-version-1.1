'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

export default function TopPagesChart({ data }) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-gray-500">No page data available.</div>;
  }

  // Clean up paths for display (remove trailing slashes, rename / to Home)
  const chartData = data.slice(0, 5).map(item => ({
    name: (item.path || item.page || '/').replace(/\/$/, '') || 'Home',
    views: item.views
  }));

  // Determine colors based on theme, fallback to light if not mounted yet (ssg/ssr consistency)
  const isDark = mounted && theme === 'dark';
  const axisColor = isDark ? '#9CA3AF' : '#4B5563'; // gray-400 vs gray-600
  const tooltipBg = isDark ? '#1F2937' : '#FFFFFF'; // gray-800 vs white
  const tooltipText = isDark ? '#F3F4F6' : '#111827'; // gray-100 vs gray-900

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm h-full">
      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Top Pages</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart layout="vertical" data={chartData} margin={{ left: 10, right: 30 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDark ? '#374151' : '#E5E7EB'} />
            <XAxis type="number" hide />
            <YAxis
              dataKey="name"
              type="category"
              width={100}
              tick={{ fontSize: 12, fill: axisColor }}
              interval={0}
              stroke={isDark ? '#4B5563' : '#D1D5DB'}
            />
            <Tooltip
              cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
              contentStyle={{
                borderRadius: '8px',
                border: isDark ? '1px solid #374151' : 'none',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                backgroundColor: tooltipBg,
                color: tooltipText
              }}
              itemStyle={{ color: tooltipText }}
            />
            <Bar dataKey="views" fill="#4F46E5" radius={[0, 4, 4, 0]} barSize={20}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index === 0 ? '#4F46E5' : '#818CF8'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}