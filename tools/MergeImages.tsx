import React, { useState, useEffect } from 'react';

const MergeImages: React.FC = () => {
    const [images, setImages] = useState<HTMLImageElement[]>([]);
    const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
    const [mergedUrl, setMergedUrl] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const imagePromises = files.map(file => {
                return new Promise<HTMLImageElement>((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const img = new Image();
                        img.src = event.target?.result as string;
                        img.onload = () => resolve(img);
                    };
                    reader.readAsDataURL(file);
                });
            });
            Promise.all(imagePromises).then(loadedImages => {
                setImages(prev => [...prev, ...loadedImages]);
            });
        }
    };

    useEffect(() => {
        if (images.length === 0) return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        if (orientation === 'horizontal') {
            canvas.width = images.reduce((sum, img) => sum + img.width, 0);
            canvas.height = Math.max(...images.map(img => img.height));
            let currentX = 0;
            images.forEach(img => {
                ctx.drawImage(img, currentX, 0);
                currentX += img.width;
            });
        } else { // vertical
            canvas.width = Math.max(...images.map(img => img.width));
            canvas.height = images.reduce((sum, img) => sum + img.height, 0);
            let currentY = 0;
            images.forEach(img => {
                ctx.drawImage(img, 0, currentY);
                currentY += img.height;
            });
        }
        setMergedUrl(canvas.toDataURL('image/png'));
    }, [images, orientation]);
    
    const clearImages = () => setImages([]);

    return (
        <div className="space-y-6">
            <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Merge Images</h2>
                <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">Combine multiple images into a single file.</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4 dark:bg-slate-800 dark:border-slate-700">
                 <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--theme-primary-light)] file:text-[var(--theme-primary)] hover:file:opacity-90 dark:file:bg-slate-700 dark:file:text-sky-300 dark:text-slate-400"
                />

                {images.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex gap-4 items-center">
                             <label className="font-medium text-gray-700 dark:text-slate-300">Orientation:</label>
                             <select
                                value={orientation}
                                onChange={e => setOrientation(e.target.value as any)}
                                className="block w-auto px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                             >
                                 <option value="horizontal">Horizontal</option>
                                 <option value="vertical">Vertical</option>
                             </select>
                             <button onClick={clearImages} className="text-sm text-slate-500 hover:underline dark:text-slate-400">Clear Images</button>
                        </div>
                        <div className="p-4 bg-slate-100 rounded-lg dark:bg-slate-900 max-h-96 overflow-auto">
                            <h3 className="font-semibold mb-2 dark:text-slate-200">Result Preview:</h3>
                            {mergedUrl && <img src={mergedUrl} alt="Merged" className="max-w-full h-auto" />}
                        </div>
                         <a
                            href={mergedUrl}
                            download="merged-image.png"
                            className="block w-full text-center px-6 py-3 bg-[var(--theme-primary)] text-white font-semibold rounded-lg shadow-md hover:opacity-90"
                        >
                            Download Merged Image
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MergeImages;
