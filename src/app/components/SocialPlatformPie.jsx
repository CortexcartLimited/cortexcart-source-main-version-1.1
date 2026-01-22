'use client';
import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useTheme } from 'next-themes';

const COLORS = ['#1877F2', '#E1306C', '#BD081C', '#E60023', '#000000']; // Brand Colors: FB, Insta, YT, Pinterest, X

export default function SocialPlatformPie() {
  const [data, setData] = useState([]);
  const { theme } = useTheme();
  // We don't strictly need a separate mounted state for just the colors if we accept hydration mismatch risk, 
  // but better to match client side. 
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch('/api/social/analytics')
      .then(res => res.json())
      .then(res => {
        // Map platform stats to chart format
        const chartData = (res.platformStats || []).map(p => ({
          name: p.platform,
          value: Number(p.postCount)
        }));
        setData(chartData);
      });
  }, []);

  if (!data.length) return null;

  const isDark = mounted && theme === 'dark';
  const textColor = isDark ? '#D1D5DB' : '#374151'; // gray-300 vs gray-700
  const tooltipBg = isDark ? '#1F2937' : '#FFFFFF';
  const tooltipText = isDark ? '#F3F4F6' : '#111827';

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm h-full">
      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Activity by Platform</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={isDark ? '#1F2937' : '#fff'} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: '8px',
                border: isDark ? '1px solid #374151' : 'none',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                backgroundColor: tooltipBg,
                color: tooltipText
              }}
              itemStyle={{ color: tooltipText }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => <span style={{ color: textColor }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}