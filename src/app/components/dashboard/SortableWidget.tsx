'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDashboard } from '@/app/context/DashboardContext';
import { GripVertical, X, Maximize2, Minimize2 } from 'lucide-react';
import { WidgetSize } from '@/app/context/DashboardContext';

interface SortableWidgetProps {
    id: string;
    size: WidgetSize;
    children: React.ReactNode;
}

export default function SortableWidget({ id, size, children }: SortableWidgetProps) {
    const { isEditMode, removeWidget, updateWidgetSize, activeDashboardId } = useDashboard();

    // dnd-kit hook
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id, disabled: !isEditMode });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : undefined,
    };

    // Calculate Grid Classes
    // 1/3 = col-span-12 md:col-span-4
    // 1/2 = col-span-12 md:col-span-6
    // Full = col-span-12
    const colSpanClass =
        size === '1/3' ? 'col-span-12 md:col-span-4' :
            size === '1/2' ? 'col-span-12 md:col-span-6' :
                'col-span-12';

    const getNextSize = (current: WidgetSize): WidgetSize => {
        if (current === '1/3') return '1/2';
        if (current === '1/2') return 'Full';
        return '1/3';
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`${colSpanClass} relative group h-full`}
        >
            <div className={`h-full transition-all ${isEditMode ? 'ring-2 ring-dashed ring-gray-300 dark:ring-gray-700 rounded-lg p-1' : ''}`}>

                {/* Overlay Controls (Only in Edit Mode) */}
                {isEditMode && (
                    <div className="absolute top-2 right-2 z-20 flex items-center gap-1 bg-white dark:bg-gray-800 shadow-sm rounded-md border border-gray-200 dark:border-gray-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity">

                        {/* Drag Handle */}
                        <button
                            className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-move"
                            {...attributes}
                            {...listeners}
                        >
                            <GripVertical className="w-4 h-4" />
                        </button>

                        {/* Resize Button */}
                        <button
                            className="p-1 text-gray-400 hover:text-blue-600"
                            onClick={() => updateWidgetSize(activeDashboardId, id, getNextSize(size))}
                            title="Cycle Size"
                        >
                            {size === 'Full' ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        </button>

                        {/* Delete Button */}
                        <button
                            className="p-1 text-gray-400 hover:text-red-600"
                            onClick={() => {
                                if (confirm('Remove this widget?')) removeWidget(activeDashboardId, id);
                            }}
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Actual Content */}
                <div className={`h-full w-full ${isEditMode ? 'pointer-events-none select-none opacity-80' : ''}`}>
                    {children}
                </div>
            </div>
        </div>
    );
}
