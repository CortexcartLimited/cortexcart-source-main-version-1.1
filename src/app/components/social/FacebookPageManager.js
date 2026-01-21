'use client';
import { useState, useEffect } from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

const FacebookPageManager = () => {
    const [pages, setPages] = useState([]);
    const [activePage, setActivePage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchFacebookData = async () => {
            setLoading(true);
            setError('');
            try {
                const [pagesRes, activePageRes] = await Promise.all([
                    fetch('/api/social/facebook/pages'),
                    fetch('/api/social/facebook/active-page')
                ]);

                if (!pagesRes.ok) throw new Error('Failed to load Facebook pages.');
                
                const pagesData = await pagesRes.json();
                setPages(pagesData);

                if (activePageRes.ok) {
                    const activePageData = await activePageRes.json();
                    setActivePage(activePageData);
                }

            } catch (err) {
                setError(err.message);
                setPages([]); 
            } finally {
                setLoading(false);
            }
        };

        fetchFacebookData();
    }, []);

    const handleSetActivePage = async (pageId) => {
        const selectedPage = pages.find(p => p.id === pageId);
        if (!selectedPage) return;

        try {
            const res = await fetch('/api/social/facebook/active-page', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // ✅ FIX: Put accessToken INSIDE the body
                body: JSON.stringify({ 
                    pageId: selectedPage.id,
                    accessToken: selectedPage.access_token 
                }), 
            });
            
            if (!res.ok) throw new Error('Failed to set active page.');
            
            const activePageRes = await fetch('/api/social/facebook/active-page');
            if (activePageRes.ok) {
                setActivePage(await activePageRes.json());
            }
            alert("Page Connected Successfully!");

        } catch (err) {
            setError(err.message);
        }
    };
    
    if (loading) return <p>Loading Facebook pages...</p>;
    if (error) return <p className="text-red-600">{error}</p>;

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Manage Connected Facebook Page</h3>
            {pages.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                    {pages.map((page) => (
                        <li key={page.id} className="py-3 flex items-center justify-between">
                            <span className="font-medium">{page.name}</span>
                            {/* Check against page_id to match backend response */}
                            {activePage?.pageId === page.id ? (
                                <span className="flex items-center text-green-600">
                                    <CheckCircleIcon className="h-5 w-5 mr-1.5" />
                                    Active
                                </span>
                            ) : (
                                <button
                                    onClick={() => handleSetActivePage(page.id)}
                                    className="px-3 py-1 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                                >
                                    Set as Active
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No Facebook pages found. Please ensure you have granted page access permissions.</p>
            )}
        </div>
    );
};

export default FacebookPageManager;