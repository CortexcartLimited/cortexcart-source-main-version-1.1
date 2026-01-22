'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";

export default function QuickBooksChart({ data }) {
    if (!data) return <div className="flex items-center justify-center h-full text-gray-500">No data available</div>;

    const chartData = [
        { name: 'Revenue', value: parseFloat(data?.totalRevenue) || 0 },
        { name: 'Expenses', value: parseFloat(data?.totalExpenses) || 0 },
        { name: 'Profit', value: parseFloat(data?.netProfit) || 0 },
    ];

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="value" name="Amount" fill="hsl(var(--primary))" />
            </BarChart>
        </ResponsiveContainer>
    );
}
