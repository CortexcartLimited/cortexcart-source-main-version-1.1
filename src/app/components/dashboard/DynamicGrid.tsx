'use client';

import React, { useState } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import { useDashboard } from '@/app/context/DashboardContext';
import SortableWidget from './SortableWidget';
import WidgetRenderer from './WidgetRenderer';
import WidgetCreator from './WidgetCreator';
import { Plus } from 'lucide-react';

export default function DynamicGrid({ dataContext }: { dataContext: any }) {
    const { activeDashboard, activeDashboardId, updateLayout, isEditMode } = useDashboard();
    const [showCreator, setShowCreator] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    if (!activeDashboard) return <div className="p-8 text-center text-gray-500">No dashboard active</div>;

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = activeDashboard.widgets.findIndex((w) => w.id === active.id);
            const newIndex = activeDashboard.widgets.findIndex((w) => w.id === over.id);

            const newWidgets = arrayMove(activeDashboard.widgets, oldIndex, newIndex);
            updateLayout(activeDashboardId, newWidgets);
        }
    };

    return (
        <div className="min-h-screen pb-20">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={activeDashboard.widgets.map(w => w.id)}
                    strategy={rectSortingStrategy}
                >
                    <div className="grid grid-cols-12 gap-6 auto-rows-min">
                        {activeDashboard.widgets.map((widget) => (
                            <SortableWidget key={widget.id} id={widget.id} size={widget.size}>
                                <WidgetRenderer id={widget.id} type={widget.type} props={widget.props} contextData={dataContext} />
                            </SortableWidget>
                        ))}

                        {/* Add Widget Placeholder (Visible at bottom in Edit Mode) */}
                        {isEditMode && (
                            <div className="col-span-12 md:col-span-4 min-h-[150px]">
                                <button
                                    onClick={() => setShowCreator(true)}
                                    className="w-full h-full border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition gap-2"
                                >
                                    <Plus className="w-8 h-8" />
                                    <span className="font-medium">Add Widget</span>
                                </button>
                            </div>
                        )}
                    </div>
                </SortableContext>
            </DndContext>

            <WidgetCreator isOpen={showCreator} onClose={() => setShowCreator(false)} />
        </div>
    );
}
