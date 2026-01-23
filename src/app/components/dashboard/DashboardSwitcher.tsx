'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useDashboard } from '@/app/context/DashboardContext';
import { ChevronDown, Plus, Check, LayoutDashboard, Settings, Pencil, Trash2, Printer } from 'lucide-react';

export default function DashboardSwitcher() {
    const {
        dashboards,
        activeDashboardId,
        setActiveDashboardId,
        addDashboard,
        deleteDashboard,
        isEditMode,
        toggleEditMode
    } = useDashboard();

    const [isOpen, setIsOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newDashName, setNewDashName] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (newDashName.trim()) {
            addDashboard(newDashName);
            setNewDashName('');
            setIsCreating(false);
            setIsOpen(false);
        }
    };

    const activeDashboard = dashboards.find(d => d.id === activeDashboardId);

    return (
        <div className="relative" ref={dropdownRef}>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                    <LayoutDashboard className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="font-medium text-gray-700 dark:text-gray-200">
                        {activeDashboard?.name || 'Select Dashboard'}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Delete Dashboard Button (Only for Custom Dashboards) */}
                {activeDashboard?.isCustom && (
                    <button
                        onClick={() => {
                            if (confirm(`Are you sure you want to delete "${activeDashboard.name}"? This cannot be undone.`)) {
                                deleteDashboard(activeDashboard.id);
                            }
                        }}
                        className="p-2 rounded-lg border bg-white dark:bg-gray-800 border-red-200 dark:border-red-900/50 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                        title="Delete Dashboard"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}

                {/* Print Dashboard Button */}
                <button
                    onClick={() => window.print()}
                    className="p-2 rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    title="Print Dashboard"
                >
                    <Printer className="w-4 h-4" />
                </button>

                {/* Edit Mode Toggle for current dashboard */}
                <button
                    onClick={toggleEditMode}
                    className={`p-2 rounded-lg border transition ${isEditMode
                        ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                    title={isEditMode ? "Finish Editing" : "Edit Dashboard"}
                >
                    {isEditMode ? <Check className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
                </button>
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-2 space-y-1">
                        <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            My Dashboards
                        </div>
                        {dashboards.map(dash => (
                            <div
                                key={dash.id}
                                className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition ${activeDashboardId === dash.id
                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-200'
                                    }`}
                                onClick={() => {
                                    setActiveDashboardId(dash.id);
                                    setIsOpen(false);
                                }}
                            >
                                <span className="truncate">{dash.name}</span>
                                {activeDashboardId === dash.id && <Check className="w-4 h-4 ml-2 flex-shrink-0" />}
                                {/* Delete button only for custom dashboards and not the active one (optional ux choice, but keeping simple) */}
                                {dash.isCustom && activeDashboardId !== dash.id && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm('Are you sure you want to delete this dashboard?')) deleteDashboard(dash.id);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 hover:text-red-600 rounded"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-gray-100 dark:border-gray-700 p-2">
                        {!isCreating ? (
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsCreating(true); }}
                                className="flex items-center w-full px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition"
                            >
                                <Plus className="w-4 h-4 mr-2" /> Create New Dashboard
                            </button>
                        ) : (
                            <form onSubmit={handleCreate} className="p-1">
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Dashboard Name..."
                                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-900 dark:text-white"
                                    value={newDashName}
                                    onChange={e => setNewDashName(e.target.value)}
                                    onClick={e => e.stopPropagation()}
                                />
                                <div className="flex gap-2 mt-2">
                                    <button type="submit" className="flex-1 bg-blue-600 text-white text-xs py-1.5 rounded hover:bg-blue-700">Create</button>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); setIsCreating(false); }}
                                        className="flex-1 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 text-xs py-1.5 rounded hover:bg-gray-300"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
