import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Brush } from 'recharts';

export default function SocialReachChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/social/analytics')
      .then(res => res.json())
      .then(res => {
        setData(res.dailyReach || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="h-full flex items-center justify-center text-gray-500">Loading Social Data...</div>;
  if (!data || data.length === 0) return <div className="flex items-center justify-center h-full text-gray-500">No data available</div>;

  // Format date for X-Axis
  const formattedData = data.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={formattedData}>
        <defs>
          <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ec4899" stopOpacity={0.1} />
            <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} minTickGap={30} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip
          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
        />
        <Area
          type="monotone"
          dataKey="reach"
          stroke="#ec4899"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorReach)"
        />
        <Brush dataKey="date" height={30} stroke="#ec4899" />
      </AreaChart>
    </ResponsiveContainer>
  );
}