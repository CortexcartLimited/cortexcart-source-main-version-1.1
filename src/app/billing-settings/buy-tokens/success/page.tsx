'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import Layout from '@/app/components/Layout';

const TokenSuccessPage = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const sessionId = searchParams.get('session_id');
    const [status, setStatus] = useState('processing'); // processing, success, error
    const [message, setMessage] = useState('Verifying your purchase...');
    const [tokensAdded, setTokensAdded] = useState(0);

    // Use a ref to prevent double-firing in React strict mode
    const hasCalledRef = useRef(false);

    useEffect(() => {
        if (!sessionId) {
            setStatus('error');
            setMessage('No session ID found.');
            return;
        }

        if (hasCalledRef.current) return;
        hasCalledRef.current = true;

        const verifyPurchase = async () => {
            try {
                const res = await fetch(`/api/stripe/tokens/callback?session_id=${sessionId}`);
                const data = await res.json();

                if (res.ok && data.success) {
                    setStatus('success');
                    setTokensAdded(data.tokensAdded);
                    setMessage('Tokens added successfully!');

                    // Optional: Redirect after a few seconds
                    setTimeout(() => {
                        router.push('/billing-settings');
                    }, 5000);
                } else {
                    setStatus('error');
                    setMessage(data.error || 'Failed to verify purchase.');
                }
            } catch (err) {
                setStatus('error');
                setMessage('An error occurred while verifying details.');
            }
        };

        verifyPurchase();
    }, [sessionId, router]);

    return (
        <Layout>
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100 dark:border-gray-700">

                    {status === 'processing' && (
                        <div className="flex flex-col items-center">
                            <Loader2 className="h-16 w-16 text-purple-600 animate-spin mb-4" />
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Processing...</h2>
                            <p className="text-gray-600 dark:text-gray-300">{message}</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="flex flex-col items-center">
                            <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle2 className="h-10 w-10 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Purchase Successful!</h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-6">
                                You have successfully added <strong>{tokensAdded.toLocaleString()}</strong> tokens to your account.
                            </p>
                            <div className="space-y-3 w-full">
                                <Link
                                    href="/billing-settings"
                                    className="block w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition"
                                >
                                    Return to Billing
                                </Link>
                                <p className="text-sm text-gray-500">Redirecting in 5 seconds...</p>
                            </div>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="flex flex-col items-center">
                            <div className="h-20 w-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <AlertCircle className="h-10 w-10 text-red-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Something went wrong</h2>
                            <p className="text-red-500 mb-6">{message}</p>
                            <Link
                                href="/billing-settings"
                                className="block w-full py-3 px-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold rounded-lg transition"
                            >
                                Return to Billing
                            </Link>
                        </div>
                    )}

                </div>
            </div>
        </Layout>
    );
};

export default TokenSuccessPage;
