'use client';

import { useState } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import SyncPostsModal from './SyncPostsModal';

export default function SocialSyncButton({ className = "" }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className={`flex items-center text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors ${className}`}
                title="Sync Posts"
            >
                <ArrowPathIcon className="w-4 h-4 mr-1" />
                Sync Posts
            </button>

            <SyncPostsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}
