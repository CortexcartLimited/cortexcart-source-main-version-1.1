'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/app/context/DashboardContext';
import { X, Plus, Search } from 'lucide-react';
import { WIDGET_CATALOG } from './widgetConstants';

interface WidgetCreatorProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function WidgetCreator({ isOpen, onClose }: WidgetCreatorProps) {
    const { activeDashboardId, addWidget } = useDashboard();
    const [selectedCategory, setSelectedCategory] = useState(WIDGET_CATALOG[0]?.category);
    const [searchQuery, setSearchQuery] = useState('');

    if (!isOpen) return null;

    const handleAdd = (widget: any) => {
        addWidget(activeDashboardId, widget.type, widget.defaultSize, widget.defaultProps);
        onClose();
    };

    const filteredCatalog = WIDGET_CATALOG.map(cat => ({
        ...cat,
        items: cat.items.filter(item =>
            item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.type.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(cat => cat.items.length > 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Add Widget</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Search & Tabs */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search widgets..."
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 dark:text-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        {WIDGET_CATALOG.map(cat => (
                            <button
                                key={cat.category}
                                onClick={() => setSelectedCategory(cat.category)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${selectedCategory === cat.category && !searchQuery
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                {cat.category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 dark:bg-gray-900/30">
                    {searchQuery ? (
                        <div className="space-y-6">
                            {filteredCatalog.map(cat => (
                                <div key={cat.category}>
                                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-1">{cat.category}</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {cat.items.map(widget => (
                                            <WidgetCard key={widget.type} widget={widget} onAdd={() => handleAdd(widget)} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {filteredCatalog.length === 0 && <p className="text-center text-gray-500 py-10">No widgets found</p>}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {WIDGET_CATALOG.find(c => c.category === selectedCategory)?.items.map(widget => (
                                <WidgetCard key={widget.type} widget={widget} onAdd={() => handleAdd(widget)} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function WidgetCard({ widget, onAdd }: { widget: any, onAdd: () => void }) {
    const Icon = widget.icon;
    return (
        <button
            onClick={onAdd}
            className="flex flex-col items-start p-4 bg-white dark:bg-gray-750 border border-gray-200 dark:border-gray-600 rounded-xl hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 transition-all text-left w-full group"
        >
            <div className="flex justify-between w-full mb-2">
                <div className="flex items-center gap-x-2">
                    {Icon && <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-blue-500 transition" />}
                    <span className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">{widget.label}</span>
                </div>
                <Plus className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Default Size: {widget.defaultSize}</p>
        </button>
    );
}
