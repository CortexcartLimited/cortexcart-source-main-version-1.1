'use client';
import ThemeToggle from '@/app/components/ThemeToggle';
import { useTheme } from 'next-themes';

export default function ThemeTestPage() {
    const { theme } = useTheme();

    return (
        <div className="p-10 flex flex-col items-center justify-center min-h-screen bg-white dark:bg-black transition-colors">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Theme Test Page</h1>
            <p className="mb-4 text-gray-700 dark:text-gray-300">Current Theme: {theme}</p>
            <div className="border p-4 rounded shadow">
                <p className="mb-2">Toggle Component:</p>
                <ThemeToggle />
            </div>
            <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded">
                <p className="text-gray-900 dark:text-white">This box should change color.</p>
            </div>
        </div>
    );
}
