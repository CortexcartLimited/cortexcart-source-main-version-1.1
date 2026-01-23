'use client';

import React, { useState, useEffect } from 'react';

interface DescriptionWidgetProps {
    content?: string;
    onUpdate?: (updates: { content: string }) => void;
    isEditMode?: boolean;
}

export default function DescriptionWidget({ content = 'Add a description...', onUpdate, isEditMode }: DescriptionWidgetProps) {
    const [text, setText] = useState(content);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        setText(content);
    }, [content]);

    const handleBlur = () => {
        setIsEditing(false);
        if (text !== content && onUpdate) {
            onUpdate({ content: text });
        }
    };

    if (isEditing || isEditMode) {
        return (
            <textarea
                className="w-full h-full p-2 bg-transparent border-gray-200 dark:border-gray-700 resize-none focus:ring-0 focus:outline-none text-gray-700 dark:text-gray-300"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onBlur={handleBlur}
                placeholder="Type your description here..."
                autoFocus={isEditing}
            />
        );
    }

    return (
        <div
            className="w-full h-full p-2 text-gray-700 dark:text-gray-300 whitespace-pre-wrap cursor-text"
            onClick={() => setIsEditing(true)}
        >
            {text}
        </div>
    );
}
