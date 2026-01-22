'use client';

import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';

interface ListWidgetProps {
    items?: string[];
    listType?: 'bullet' | 'number';
    onUpdate?: (updates: { items: string[] }) => void;
    isEditMode?: boolean;
}

export default function ListWidget({ items = ['Item 1', 'Item 2'], listType = 'bullet', onUpdate, isEditMode }: ListWidgetProps) {
    const [listItems, setListItems] = useState(items);

    useEffect(() => {
        setListItems(items);
    }, [items]);

    const updateItems = (newItems: string[]) => {
        setListItems(newItems);
        if (onUpdate) {
            onUpdate({ items: newItems });
        }
    };

    const handleItemChange = (index: number, value: string) => {
        const newItems = [...listItems];
        newItems[index] = value;
        updateItems(newItems);
    };

    const addItem = () => {
        updateItems([...listItems, 'New Item']);
    };

    const removeItem = (index: number) => {
        const newItems = listItems.filter((_, i) => i !== index);
        updateItems(newItems);
    };

    return (
        <div className="w-full h-full p-2 overflow-y-auto">
            {listType === 'number' ? (
                <ol className="list-decimal list-inside space-y-2">
                    {listItems.map((item, index) => (
                        <ListItem
                            key={index}
                            index={index}
                            value={item}
                            onChange={handleItemChange}
                            onRemove={removeItem}
                            isEditMode={isEditMode}
                        />
                    ))}
                </ol>
            ) : (
                <ul className="list-disc list-inside space-y-2">
                    {listItems.map((item, index) => (
                        <ListItem
                            key={index}
                            index={index}
                            value={item}
                            onChange={handleItemChange}
                            onRemove={removeItem}
                            isEditMode={isEditMode}
                        />
                    ))}
                </ul>
            )}

            {(isEditMode) && (
                <button
                    onClick={addItem}
                    className="mt-2 flex items-center text-sm text-blue-500 hover:text-blue-600"
                >
                    <Plus className="w-4 h-4 mr-1" /> Add Item
                </button>
            )}
        </div>
    );
}

function ListItem({ index, value, onChange, onRemove, isEditMode }: {
    index: number,
    value: string,
    onChange: (i: number, v: string) => void,
    onRemove: (i: number) => void,
    isEditMode?: boolean
}) {
    return (
        <li className="flex items-center group">
            <span className="mr-2">{/* Marker handled by list style */}</span>
            <input
                type="text"
                className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-gray-700 dark:text-gray-300"
                value={value}
                onChange={(e) => onChange(index, e.target.value)}
            />
            {isEditMode && (
                <button
                    onClick={() => onRemove(index)}
                    className="ml-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </li>
    );
}
