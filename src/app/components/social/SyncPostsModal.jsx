'use client';

import { useState, useEffect } from 'react';
import Modal from '../Modal';

export default function SyncPostsModal({ isOpen, onClose }) {
    const [connections, setConnections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(null); // 'platform' or null
    const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: string }

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            setMessage(null);
            fetch('/api/social/connections/status')
                .then(res => res.json())
                .then(data => {
                    // data.connections is array of { platform, status }
                    setConnections(data.connections || []);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Failed to load connections", err);
                    setLoading(false);
                });
        }
    }, [isOpen]);

    const handleSync = async (platform) => {
        setSyncing(platform);
        setMessage(null);
        try {
            const res = await fetch('/api/social/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ platform })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Sync failed');

            setMessage({ type: 'success', text: `Successfully synced ${platform} posts.` });
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setSyncing(null);
        }
    };

    const PLATFORM_NAMES = {
        x: 'X (Twitter)',
        facebook: 'Facebook',
        instagram: 'Instagram',
        pinterest: 'Pinterest',
        youtube: 'YouTube',
        tiktok: 'TikTok'
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Sync Social Posts">
            <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                    Sync your latest posts from connected platforms to update your widgets.
                </p>

                {message && (
                    <div className={`p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message.text}
                    </div>
                )}

                {loading ? (
                    <div className="py-8 text-center text-gray-500">Loading connections...</div>
                ) : connections.length === 0 ? (
                    <div className="py-8 text-center text-gray-500">
                        No connected accounts found. <a href="/settings/social-connections" className="text-blue-600 hover:underline">Connect an account</a> to get started.
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {connections.map(conn => (
                            <div key={conn.platform} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                                <span className="font-medium text-gray-800 dark:text-gray-200">
                                    {PLATFORM_NAMES[conn.platform] || conn.platform}
                                </span>
                                <button
                                    onClick={() => handleSync(conn.platform)}
                                    disabled={syncing !== null}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${syncing === conn.platform
                                        ? 'bg-blue-100 text-blue-400 cursor-not-allowed'
                                        : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
                                        }`}
                                >
                                    {syncing === conn.platform ? 'Syncing...' : 'Sync Posts'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Modal>
    );
}
