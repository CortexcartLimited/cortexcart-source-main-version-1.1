// File: src/app/components/PlatformPostsChart.jsx

'use client';
import { useTheme } from 'next-themes';

import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const PlatformPostsChart = ({ chartData }) => {

  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: isDark ? '#e5e7eb' : '#374151'
        }
      },
      title: {
        display: false
      },
    },
    scales: {
      x: {
        ticks: { color: isDark ? '#9ca3af' : '#4b5563' },
        grid: { color: isDark ? '#374151' : '#e5e7eb' }
      },
      y: {
        beginAtZero: true,
        ticks: {
          // Ensure y-axis only shows whole numbers for post counts
          stepSize: 1,
          precision: 0,
          color: isDark ? '#9ca3af' : '#4b5563'
        },
        grid: { color: isDark ? '#374151' : '#e5e7eb' }
      }
    }
  };

  if (!chartData || !chartData.labels || chartData.labels.length === 0) {
    return <p className="text-sm text-gray-500 text-center mt-4">No post data available to display.</p>;
  }

  return <Bar data={chartData} options={options} />;
};

export default PlatformPostsChart;