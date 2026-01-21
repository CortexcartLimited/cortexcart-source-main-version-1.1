import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const FriendlyError = ({ message, onRetry }) => {
    return (
        <div className="rounded-md bg-red-50 p-4 border border-red-200 my-4">
            <div className="flex">
                <div className="flex-shrink-0">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Something went wrong</h3>
                    <div className="mt-2 text-sm text-red-700">
                        <p className="whitespace-pre-wrap">{message}</p>
                    </div>
                    {onRetry && (
                        <div className="mt-4">
                            <div className="-mx-2 -my-1.5 flex">
                                <button
                                    type="button"
                                    onClick={onRetry}
                                    className="rounded-md bg-red-50 px-2 py-1.5 text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
                                >
                                    Try again
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FriendlyError;
