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

                <div className="mb-8">
                    <p className="text-lg text-gray-700 dark:text-gray-300">
                        Purchase additional tokens to power your Gemini AI experience.
                        Choose the package that best suits your needs.
                    </p>
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
