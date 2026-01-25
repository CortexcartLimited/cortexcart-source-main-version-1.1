import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/solid';
import Image from 'next/image'; // Import Next.js Image component

const AlertBanner = ({ title, message, type = 'info' }) => {

  // 1. Define styles for different alert types
  const alertStyles = {
    success: {
      bgColor: 'bg-green-50 dark:bg-green-900',
      textColor: 'text-green-800 dark:text-green-100',
      iconColor: 'text-green-400 dark:text-green-400',
      icon: CheckCircleIcon
    },
    warning: {
      bgColor: 'bg-yellow-50 dark:bg-yellow-900',
      textColor: 'text-yellow-800 dark:text-yellow-100',
      iconColor: 'text-yellow-400 dark:text-yellow-400',
      icon: ExclamationTriangleIcon
    },
    error: {
      bgColor: 'bg-red-50 dark:bg-red-900',
      textColor: 'text-red-800 dark:text-red-100',
      iconColor: 'text-red-400 dark:text-red-400',
      icon: XCircleIcon
    },
    info: {
      bgColor: 'bg-blue-50 dark:bg-blue-900',
      textColor: 'text-blue-800 dark:text-blue-100',
      iconColor: 'text-blue-400 dark:text-blue-400',
      icon: InformationCircleIcon
    },
    // 2. New 'ai-recommendation' type
    'ai-recommendation': {
      bgColor: 'bg-indigo-50 dark:bg-indigo-900', // A distinct color for AI
      textColor: 'text-indigo-900 dark:text-indigo-100',
      iconColor: 'text-indigo-400 dark:text-indigo-400',
      // No standard icon, we'll use a custom image
    }
  };

  const style = alertStyles[type] || alertStyles.info;
  const IconComponent = style.icon;

  return (
    <div className={`rounded-md p-4 ${style.bgColor}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          {/* 3. Conditional rendering for the icon */}
          {type === 'ai-recommendation' ? (
            <div className="h-24 w-24 rounded-full overflow-hidden p-4">
              <Image
                src="/optimized-image-2.webp" // Path to your saved image
                alt="AI"
                width={48}
                height={48}
                className="object-cover h-full w-full"
              />
            </div>
          ) : (
            <IconComponent className={`h-5 w-5 ${style.iconColor}`} aria-hidden="true" />
          )}
        </div>
        <div className={`ml-3 flex-1 ${type === 'ai-recommendation' ? 'mt-1' : ''}`}>
          <h3 className={`text-sm font-medium ${style.textColor}`}>{title}</h3>
          <div className={`mt-2 text-sm ${style.textColor} opacity-90`}>
            <p className="whitespace-normal">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertBanner;