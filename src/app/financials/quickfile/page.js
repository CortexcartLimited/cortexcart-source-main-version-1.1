'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

// Import your Tailwind-based UI components
import Layout from '@/app/components/Layout';
import QuickBooksStatCard from '@/app/components/QuickBooksStatCard'; // Reusing for consistent styling
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import FriendlyError from '@/app/components/FriendlyError';

const ConnectQuickfilePrompt = ({ onConnect }) => {
    const [accountNumber, setAccountNumber] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const res = await fetch('/api/connect/quickfile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accountNumber, apiKey }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to connect');
            }

            onConnect();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="max-w-md mx-auto mt-8">
            <CardHeader>
                <div className="flex justify-center mb-4">
                    <DollarSign className="h-12 w-12 text-blue-600" />
                </div>
                <CardTitle className="text-center">Connect Quickfile</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <p className="text-sm text-gray-500 text-center mb-4">
                        Enter your Quickfile credentials to sync your financial data.
                        You can find these in Account Settings {'>'} 3rd Party Integration.
                    </p>
                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md">
                            {error}
                        </div>
                    )}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Account Number</label>
                        <input
                            type="text"
                            required
                            className="w-full p-2 border rounded-md"
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                            placeholder="e.g. 6131234567"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">API Key</label>
                        <input
                            type="password"
                            required
                            className="w-full p-2 border rounded-md"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Your Quickfile API Key"
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? 'Connecting...' : 'Connect Quickfile'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

const FinancialsPageSkeleton = () => (
    <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
        </div>
        <SkeletonCard height="h-[400px]" />
    </div>
);

const SkeletonCard = ({ height = "h-32" }) => (
    <div className={`w-full bg-gray-200 animate-pulse rounded-lg ${height}`}></div>
);


export default function QuickfilePage() {
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [financialData, setFinancialData] = useState(null);
    const [error, setError] = useState(null);
    const [currencySymbol, setCurrencySymbol] = useState('£'); // Quickfile is predominantly UK

    const currencySymbols = { USD: '$', EUR: '€', GBP: '£', JPY: '¥', CAD: '$', AUD: '$', INR: '₹' };

    const fetchFinancials = async () => {
        try {
            const [financialsRes, settingsRes] = await Promise.all([
                fetch('/api/quickfile/financial-summary'),
                fetch('/api/site-settings') // Fetch settings
            ]);

            if (!financialsRes.ok) {
                // Check if it's an auth error (401)
                if (financialsRes.status === 401) {
                    setIsConnected(false);
                    return;
                }
                const data = await financialsRes.json();
                throw new Error(data.message || 'Failed to fetch financial data');
            }
            setFinancialData(await financialsRes.json());
            setIsConnected(true);

            if (settingsRes.ok) {
                const settings = await settingsRes.json();
                if (settings.currency && currencySymbols[settings.currency]) {
                    setCurrencySymbol(currencySymbols[settings.currency]);
                }
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const response = await fetch('/api/quickfile/status');

                if (!response.ok) {
                    setIsConnected(false);
                    setIsLoading(false);
                    return;
                }

                const data = await response.json();
                if (data.isConnected) {
                    setIsConnected(true);
                    fetchFinancials();
                } else {
                    setIsConnected(false);
                    setIsLoading(false);
                }
            } catch (err) {
                setError(err.message);
                setIsLoading(false);
            }
        };

        checkStatus();
    }, []);

    const chartData = [
        { name: 'Revenue', value: parseFloat(financialData?.totalRevenue) || 0 },
        { name: 'Expenses', value: parseFloat(financialData?.totalExpenses) || 0 },
        { name: 'Profit', value: parseFloat(financialData?.netProfit) || 0 },
    ];

    const renderContent = () => {
        if (isLoading) return <FinancialsPageSkeleton />;
        if (error) {
            return <FriendlyError message={error} onRetry={() => window.location.reload()} />;
        }
        if (!isConnected) return <ConnectQuickfilePrompt onConnect={fetchFinancials} />;
        if (isConnected && !financialData) return <p>Could not load financial data. Please try again.</p>;

        return (
            <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <QuickBooksStatCard
                        title="Total Revenue"
                        value={financialData.totalRevenue}
                        icon={TrendingUp}
                        description="This Fiscal Year-to-date"
                        className="bg-green-100 dark:bg-green-900/50 border-green-200 dark:border-green-800"
                        currencySymbol={currencySymbol}
                    />
                    <QuickBooksStatCard
                        title="Total Expenses"
                        value={financialData.totalExpenses}
                        icon={TrendingDown}
                        description="This Fiscal Year-to-date"
                        className="bg-red-100 dark:bg-red-900/50 border-red-200 dark:border-red-800"
                        currencySymbol={currencySymbol}
                    />
                    <QuickBooksStatCard
                        title="Net Profit"
                        value={financialData.netProfit}
                        icon={DollarSign}
                        description="This Fiscal Year-to-date"
                        className="bg-blue-100 dark:bg-blue-900/50 border-blue-200 dark:border-blue-800"
                        currencySymbol={currencySymbol}
                    />
                </div>

                <Card className="border-0 shadow-md">
                    <CardHeader>
                        <CardTitle>Financial Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[400px] p-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value) => `${currencySymbol}${value.toLocaleString()}`} />
                                <Legend />
                                <Bar dataKey="value" fill="hsl(var(--primary))" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        );
    };

    return (
        <Layout>
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <h2 className="text-3xl font-bold tracking-tight">Quickfile Dashboard</h2>
                {renderContent()}
            </div>
        </Layout>
    );
}
