'use client';

import React from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { ArrowLeftCircle } from 'lucide-react';
import Layout from '@/app/components/Layout';

// Add type definition for the custom element
declare global {
    namespace JSX {
        interface IntrinsicElements {
            'stripe-pricing-table': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
                'pricing-table-id': string;
                'publishable-key': string;
            }, HTMLElement>;
        }
    }
}

const BuyTokensPage = () => {
    const [usage, setUsage] = React.useState({ used: 0, limit: 0 });
    const [loadingUsage, setLoadingUsage] = React.useState(true);

    React.useEffect(() => {
        fetch('/api/user/usage')
            .then(res => res.json())
            .then(data => {
                setUsage(data);
                setLoadingUsage(false);
            })
            .catch(err => {
                console.error("Failed to load usage", err);
                setLoadingUsage(false);
            });
    }, []);

    const percentage = usage.limit > 0 ? Math.min((usage.used / usage.limit) * 100, 100) : 0;

    return (
        <Layout>
            <div className="flex flex-col min-h-screen">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                        Buy Gemini AI Tokens
                    </h2>
                    <Link
                        href="/billing-settings"
                        className="flex items-center text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-bold py-2 px-4 rounded-lg transition duration-300"
                    >
                        <ArrowLeftCircle className="h-5 w-5 mr-2" /> Back to Billing
                    </Link>
                </div>

                <div className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-purple-100 dark:border-purple-900">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Your AI Token Usage</h3>
                    {loadingUsage ? (
                        <div className="animate-pulse h-4 bg-gray-200 rounded w-full"></div>
                    ) : (
                        <div>
                            <div className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <span>{usage.used.toLocaleString()} used</span>
                                <span>Limit: {usage.limit.toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700 overflow-hidden">
                                <div
                                    className={`h-4 rounded-full transition-all duration-500 ${percentage > 90 ? 'bg-red-500' : 'bg-purple-600'}`}
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            </div>
                            <p className="text-sm text-gray-500 mt-2">
                                Tokens reset monthly on your billing date. Purchase more below if you run out!
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex-grow bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-purple-100 dark:border-purple-900">
                    <Script async src="https://js.stripe.com/v3/pricing-table.js" />
                    <stripe-pricing-table
                        pricing-table-id="prctbl_1SzKUyF6XLY4flzwKOkOzBm8"
                        publishable-key="pk_live_516AKZLF6XLY4flzwwwMzeUtWpKJwS6hvzICj7TLnuUuUxmBIGVJuqRArTcUy3tYSKvcZz1tGd5EBL1GPqYc1wQt500llD4lfK6"
                    >
                    </stripe-pricing-table>
                </div>
            </div>
        </Layout>
    );
};

export default BuyTokensPage;
