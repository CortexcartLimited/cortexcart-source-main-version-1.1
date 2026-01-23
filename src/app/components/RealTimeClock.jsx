'use client';

import { useState, useEffect } from 'react';

const RealTimeClock = ({ locale = 'en-US' }) => { // Default to US format
  const [currentTime, setCurrentTime] = useState(null);

  useEffect(() => {
    setCurrentTime(new Date());
    const timerId = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  const formatDate = (date) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(locale, options);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString(locale);
  };

  return (
    <div className="hidden md:flex items-center text-sm text-gray-500">
      {currentTime && (
        <>
          <span>{formatDate(currentTime)}</span>
          <span className="mx-2">|</span>
          <span>{formatTime(currentTime)}</span>
        </>
      )}
    </div>
  );
};

// THIS IS THE LINE YOU NEED TO ADD
export default RealTimeClock;
