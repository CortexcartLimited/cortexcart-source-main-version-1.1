'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from "@/app/components/ui/button";

// Utility to format currency
const formatCurrency = (amount, currency = 'GBP') => {
    return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: currency,
    }).format(amount);
};

// Generic Quickfile Widget Component
const QuickfileWidgetBase = ({ title, icon: Icon, type, className }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Check connection status first
                const statusRes = await fetch('/api/quickfile/status');
                if (statusRes.ok) {
                    const statusData = await statusRes.json();
                    setIsConnected(statusData.isConnected);
                    if (!statusData.isConnected) {
                        setLoading(false);
                        return;
                    }
                }

                // Fetch financial data
                const res = await fetch('/api/quickfile/financial-summary');
                if (!res.ok) throw new Error('Failed to fetch data');
                const result = await res.json();

                // Select specific data based on widget type
                let value = 0;
                switch (type) {
                    case 'revenue': value = result.totalRevenue; break;
                    case 'expenses': value = result.totalExpenses; break;
                    case 'profit': value = result.netProfit; break;
                    default: value = 0;
                }

                setData(value);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [type]);

    if (loading) {
        return (
            <Card className={`h-full flex items-center justify-center ${className}`}>
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </Card>
        );
    }

    if (!isConnected) {
        return (
            <Card className={`h-full flex flex-col items-center justify-center p-4 text-center ${className}`}>
                <Icon className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 mb-2">Quickfile not connected</p>
                <Button variant="outline" size="sm" asChild>
                    <Link href="/financials/quickfile">Connect</Link>
                </Button>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className={`h-full flex flex-col items-center justify-center p-4 text-center ${className}`}>
                <AlertCircle className="h-8 w-8 text-red-400 mb-2" />
                <p className="text-sm text-red-500">Error loading data</p>
            </Card>
        );
    }

    return (
        <Card className={`h-full ${className}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(data)}</div>
                <p className="text-xs text-muted-foreground">Fiscal Year to Date</p>
            </CardContent>
        </Card>
    );
};

export const QuickfileRevenueWidget = () => (
    <QuickfileWidgetBase
        title="Quickfile Revenue"
        icon={TrendingUp}
        type="revenue"
        className="bg-white dark:bg-gray-800"
    />
);

export const QuickfileExpensesWidget = () => (
    <QuickfileWidgetBase
        title="Quickfile Expenses"
        icon={TrendingDown}
        type="expenses"
        className="bg-white dark:bg-gray-800"
    />
);

export const QuickfileProfitWidget = () => (
    <QuickfileWidgetBase
        title="Quickfile Profit"
        icon={DollarSign}
        type="profit"
        className="bg-white dark:bg-gray-800"
    />
);
