import { useState, useEffect, useCallback, useRef } from 'react';
import { TrashIcon, ArrowUpTrayIcon, PhotoIcon, XCircleIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';

// Sub-component for displaying a single image in the gallery
const GalleryImage = ({ image, onSelect, onDelete, isSelected }) => {
    return (
        <div
            className="relative group aspect-square h-24 w-24 bg-gray-100 rounded-md overflow-hidden cursor-pointer flex-shrink-0" // Fixed size, flex-shrink-0
            onClick={() => onSelect(image.image_url)}
        >
            <Image
                src={image.image_url}
                alt={image.filename || 'User upload'}
                width={100}
                height={100}
                className="w-full h-full object-cover"
            />
            {isSelected && (
                <div className="absolute inset-0 ring-4 ring-blue-500 rounded-md flex items-center justify-center bg-blue-500 bg-opacity-20"> {/* Lighter opacity */}
                    <div className="bg-blue-500 rounded-full p-1">
                        <PhotoIcon className="h-4 w-4 text-white" />
                    </div>
                </div>
            )}
            <button
                onClick={(e) => { e.stopPropagation(); onDelete(image.id); }}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-600"
                aria-label="Delete image"
            >
                <TrashIcon className="h-3 w-3" />
            </button>
        </div>
    );
};

export default function ImageManager({ onImageSelect, selectedImageUrl }) {
    const [library, setLibrary] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);
    const scrollContainerRef = useRef(null); // Ref for scroll container

    const fetchImages = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/images');
            if (!response.ok) throw new Error('Failed to fetch images.');
            setLibrary(await response.json());
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchImages();
    }, [fetchImages]);

    const handleDelete = async (imageId) => {
        if (!confirm('Are you sure you want to delete this image?')) return;

        const imageToDelete = library.find(img => img.id === imageId);
        if (imageToDelete && imageToDelete.image_url === selectedImageUrl) {
            onImageSelect(''); // Clear selection in parent if the selected image is deleted
        }

        try {
            await fetch(`/api/images/${imageId}`, { method: 'DELETE' });
            await fetchImages(); // Re-fetch to update the library
        } catch (err) {
            setError('Failed to delete image.');
        }
    };

    // This function now handles file selection AND immediate upload
    const handleFileSelectedAndUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsUploading(true);
        setError('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/images/upload', {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) throw new Error((await response.json()).message || 'Upload failed');

            const newImage = await response.json();

            // Add the new image to the state and automatically select it
            setLibrary(prev => [newImage, ...prev]);
            onImageSelect(newImage.image_url); // **CRUCIAL:** Immediately tell the parent the new permanent URL

        } catch (err) {
            setError(err.message);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = ''; // Clear file input
        }
    };

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
        }
    };

    return (
        <div className="p-6 bg-white dark:bg-gray-800 shadow-md rounded-lg mt-8 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">Image Manager</h3>
            <div className="space-y-4 mb-4">
                <div>
                    <input
                        id="file-upload"
                        ref={fileInputRef}
                        type="file"
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={handleFileSelectedAndUpload}
                        className="hidden"
                        disabled={isUploading}
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current.click()}
                        disabled={isUploading}
                        className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center whitespace-nowrap transition-colors"
                    >
                        <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                        {isUploading ? 'Uploading...' : 'Upload New Image'}
                    </button>
                </div>
            </div>
            {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase">Your Library</h4>

                {isLoading ? (
                    <p className="text-sm text-gray-500">Loading library...</p>
                ) : library.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">No images uploaded yet.</p>
                ) : (
                    <div className="flex items-center">
                        <button
                            onClick={scrollLeft}
                            className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 focus:outline-none flex-shrink-0 mr-2"
                            aria-label="Scroll left"
                        >
                            <ChevronLeftIcon className="h-5 w-5" />
                        </button>

                        <div
                            ref={scrollContainerRef}
                            className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide flex-grow"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            <style jsx>{`
                                div::-webkit-scrollbar {
                                    display: none;
                                }
                            `}</style>
                            {library.map(image => (
                                <GalleryImage
                                    key={image.id}
                                    image={image}
                                    onDelete={handleDelete}
                                    onSelect={onImageSelect}
                                    isSelected={selectedImageUrl === image.image_url}
                                />
                            ))}
                        </div>

                        <button
                            onClick={scrollRight}
                            className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 focus:outline-none flex-shrink-0 ml-2"
                            aria-label="Scroll right"
                        >
                            <ChevronRightIcon className="h-5 w-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}