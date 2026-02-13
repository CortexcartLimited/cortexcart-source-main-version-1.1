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

const ConnectQuickfilePrompt = () => (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed shadow-sm p-8 text-center mt-4">
        <DollarSign className="h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-semibold">Connect to Quickfile</h3>
        <p className="mt-2 mb-4 text-sm text-muted-foreground">
            To view your financial dashboard, please connect your Quickfile account.
        </p>
        <Button asChild>
            <Link href="/api/connect/quickfile">Connect Quickfile</Link>
        </Button>
    </div>
);

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

    useEffect(() => {
        const checkStatus = async () => {
            try {
                // Placeholder API endpoints - assuming they will be implemented or mocking response for now
                const response = await fetch('/api/quickfile/status');

                // If endpoint doesn't exist yet, we simulate not connected to avoid crash
                if (!response.ok) {
                    setIsConnected(false);
                    setIsLoading(false);
                    return;
                }

                const data = await response.json();
                setIsConnected(data.isConnected);
                if (data.isConnected) {
                    fetchFinancials();
                } else {
                    setIsLoading(false);
                }
            } catch (err) {
                setError(err.message);
                setIsLoading(false);
            }
        };

        const fetchFinancials = async () => {
            try {
                const [financialsRes, settingsRes] = await Promise.all([
                    fetch('/api/quickfile/financial-summary'),
                    fetch('/api/site-settings') // Fetch settings
                ]);

                if (!financialsRes.ok) {
                    const data = await financialsRes.json();
                    throw new Error(data.message || 'Failed to fetch financial data');
                }
                setFinancialData(await financialsRes.json());

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
        if (!isConnected) return <ConnectQuickfilePrompt />;
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
