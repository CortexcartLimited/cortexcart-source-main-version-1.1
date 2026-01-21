import React from 'react';

const TopPagesList = ({ pages = [] }) => {
  if (!pages || pages.length === 0) {
    return <p className="text-sm text-gray-500">No page view data available for this period.</p>;
  }

  return (
    <div className="flow-root">
      <ul role="list" className="divide-y divide-gray-200">
        {pages.map((item, index) => {
          // 1. Handle both 'path' and 'page' keys to prevent blank lines
          const rawPath = item.path || item.page || 'Unknown';

          // 2. Rename "/" to "Home Page"
          const displayPath = rawPath === '/' ? 'Home Page' : rawPath;

          // 3. Conditional Highlighting
          let highlightClass = 'bg-red-100 text-red-800'; // Default < 49
          const views = item.views || 0;

          if (views > 70) {
            highlightClass = 'bg-green-100 text-green-800';
          } else if (views >= 50 && views <= 69) {
            highlightClass = 'bg-amber-100 text-amber-800';
          }

          return (
            <li key={`${rawPath}-${index}`} className={`py-3 sm:py-4 px-4 rounded-md mb-2 ${highlightClass}`}>
              <div className="flex items-center space-x-4">
                <div className="flex-1 min-w-0">
                  <p title={rawPath} className="text-sm font-medium truncate">
                    {displayPath}
                  </p>
                </div>
                <div className="inline-flex items-center text-base font-semibold">
                  {views.toLocaleString()}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default TopPagesList;