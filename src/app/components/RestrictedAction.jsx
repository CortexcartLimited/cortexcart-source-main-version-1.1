'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import toast, { Toaster } from 'react-hot-toast';

export const RestrictedAction = ({ children, className = '' }) => {
    const { data: session } = useSession();
    const isViewer = session?.user?.role === 'viewer';

    const handleClick = (e) => {
        if (isViewer) {
            e.preventDefault();
            e.stopPropagation();
            toast.error("Access Restricted: You are in Viewer mode.\nPlease contact your Account Admin to perform this action.", {
                style: {
                    border: '1px solid #F87171',
                    padding: '16px',
                    color: '#B91C1C',
                },
                iconTheme: {
                    primary: '#F87171',
                    secondary: '#FFFAEE',
                },
            });
        }
    };

    if (isViewer) {
        return (
            <div
                onClickCapture={handleClick}
                className={`relative group ${className} cursor-not-allowed opacity-60`}
                title="Admin Access Only"
            >
                {/* Overlay to catch clicks even on disabled buttons */}
                <div className="absolute inset-0 z-50 bg-transparent"></div>
                {children}
            </div>
        );
    }

    return (
        <>
            {children}
            <Toaster position="top-center" />
        </>
    );
};
