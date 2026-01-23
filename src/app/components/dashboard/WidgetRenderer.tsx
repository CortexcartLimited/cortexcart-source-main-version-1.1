'use client';

import React from 'react';
import { useDashboard } from '@/app/context/DashboardContext';
import { getWidgetComponent } from '@/app/registry/widgetRegistry';

interface WidgetRendererProps {
    id: string; // Widget ID
    type: string;
    props: any;
    contextData: any;
}

export default function WidgetRenderer({ id, type, props, contextData }: WidgetRendererProps) {
    const { updateWidget, activeDashboardId, isEditMode } = useDashboard();
    const registryItem = getWidgetComponent(type);

    if (!registryItem) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                Unknown Widget: {type}
            </div>
        );
    }

    const { component: Component, mapProps, wrapperClass } = registryItem;

    // Pass an onUpdate function to the component
    const handleUpdate = (updates: any) => {
        updateWidget(activeDashboardId, id, { props: { ...props, ...updates } });
    };

    const mappedProps = mapProps(props, contextData);

    const content = (
        <React.Fragment>
            {/* 
               We render title here if wrapperClass is present.
               SectionHeader is a special case that handles its own title editing.
            */}
            {props.title && wrapperClass && (
                <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">{props.title}</h3>
            )}
            <Component {...mappedProps} onUpdate={handleUpdate} isEditMode={isEditMode} />
        </React.Fragment>
    );

    if (wrapperClass) {
        return <div className={wrapperClass}>{content}</div>;
    }

    return <>{content}</>;
}
