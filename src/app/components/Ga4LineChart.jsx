// src/app/components/Ga4LineChart.jsx

'use client';

import { useTheme } from 'next-themes';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Ga4LineChart = ({ data = [] }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const chartData = {
    labels: data.map(item => new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Page Views',
        data: data.map(item => item.pageviews),
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        yAxisID: 'y',
      },
      {
        label: 'Conversions',
        data: data.map(item => item.conversions),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        yAxisID: 'y1',
      }
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        labels: {
          color: isDark ? '#e5e7eb' : '#374151'
        }
      },
      title: {
        display: false,
        color: isDark ? '#e5e7eb' : '#374151'
      }
    },
    scales: {
      x: {
        ticks: { color: isDark ? '#9ca3af' : '#4b5563' },
        grid: { color: isDark ? '#374151' : '#e5e7eb' }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Page Views',
          color: isDark ? '#e5e7eb' : '#374151'
        },
        ticks: { color: isDark ? '#9ca3af' : '#4b5563' },
        grid: { color: isDark ? '#374151' : '#e5e7eb' }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Conversions',
          color: isDark ? '#e5e7eb' : '#374151'
        },
        ticks: { color: isDark ? '#9ca3af' : '#4b5563' },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

export default Ga4LineChart;
