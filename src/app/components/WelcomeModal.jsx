'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function WelcomeModal() {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Start a timer to eventually hide the modal
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 4000); // Modal stays for 4 seconds

    // Animate the progress bar over the duration
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, 35); // Update progress roughly every 35ms

    // Cleanup on component unmount
    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-[200]">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center transform transition-all animate-in fade-in zoom-in-95 duration-500">
        <div className="flex justify-center mb-6">
          <Image
            src="/optimized-image-2.webp"
            alt="CortexCart Logo"
            width={200}
            height={50}
            priority
          />
        </div>
        <p className="text-lg font-medium text-gray-700">
          Insight Dashboard Version {process.env.NEXT_PUBLIC_APP_VERSION}
        </p>
        <p className="text-sm text-gray-500 mt-2 mb-6">
          Loading your dashboard, please wait...
        </p>
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
