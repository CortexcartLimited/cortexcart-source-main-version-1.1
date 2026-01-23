// app/components/StatCard.jsx
import React from 'react';

const StatCard = ({ title, value, icon }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center justify-between border border-gray-200 dark:border-gray-700">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-3xl font-bold dark:text-gray-100">{value}</p>
      </div>
      <div className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200 p-3 rounded-full">
        {/* We'll use simple text for icons for now, but you can use an icon library like Heroicons */}
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );
};

export default StatCard;
