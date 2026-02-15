'use client';
import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useTheme } from 'next-themes';

const COLORS = ['#1877F2', '#E1306C', '#BD081C', '#E60023', '#000000']; // Brand Colors: FB, Insta, YT, Pinterest, X

export default function SocialPlatformPie() {
  const [data, setData] = useState([]);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch('/api/social/analytics')
      .then(res => res.json())
      .then(res => {
        const chartData = (res.platformStats || []).map(p => ({
          name: p.platform,
          value: Number(p.postCount)
        }));
        setData(chartData);
      });
  }, []);

  if (!data.length) return <div className="flex items-center justify-center h-full text-gray-500">No data available</div>;

  const isDark = mounted && theme === 'dark';
  const textColor = isDark ? '#D1D5DB' : '#374151';
  const tooltipBg = isDark ? '#1F2937' : '#FFFFFF';
  const tooltipText = isDark ? '#F3F4F6' : '#111827';

  return (
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
          height={66}
          wrapperStyle={{ height: 66 }}
          formatter={(value) => <span style={{ color: textColor }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}