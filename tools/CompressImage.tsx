import React, { useState, useRef, useEffect } from 'react';

const CompressImage: React.FC = () => {
    const [sourceImg, setSourceImg] = useState<string | null>(null);
    const [quality, setQuality] = useState(0.7);
    const [originalSize, setOriginalSize] = useState(0);
    const [compressedSize, setCompressedSize] = useState(0);
    const [compressedUrl, setCompressedUrl] = useState('');
    const imageRef = useRef<HTMLImageElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setOriginalSize(file.size);
            const reader = new FileReader();
            reader.onload = (event) => {
                setSourceImg(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        if (!sourceImg || !imageRef.current) return;

        const img = imageRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
            if (blob) {
                setCompressedSize(blob.size);
                setCompressedUrl(URL.createObjectURL(blob));
            }
        }, 'image/jpeg', quality);

    }, [sourceImg, quality]);

    const formatBytes = (bytes: number, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-6">
            <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Compress Image</h2>
                <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">Reduce image file size while maintaining quality.</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4 dark:bg-slate-800 dark:border-slate-700">
                <input
                    type="file"
                    accept="image/jpeg, image/png"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--theme-primary-light)] file:text-[var(--theme-primary)] hover:file:opacity-90 dark:file:bg-slate-700 dark:file:text-sky-300 dark:text-slate-400"
                />

                {sourceImg && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                        <div>
                            <img ref={imageRef} src={sourceImg} alt="Original Preview" className="max-h-80 w-auto mx-auto rounded-md" />
                            <p className="text-center mt-2 text-sm text-slate-500 dark:text-slate-400">Original Size: {formatBytes(originalSize)}</p>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="quality" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Quality: {Math.round(quality * 100)}%</label>
                                <input
                                    id="quality"
                                    type="range"
                                    min="0.1"
                                    max="1"
                                    step="0.05"
                                    value={quality}
                                    onChange={(e) => setQuality(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
                                />
                            </div>
                            <div className="text-center bg-slate-50 p-4 rounded-lg dark:bg-slate-700">
                                <p className="font-semibold text-slate-700 dark:text-slate-200">Compressed Size:</p>
                                <p className="text-2xl font-bold text-[var(--theme-primary)] dark:text-sky-300">{formatBytes(compressedSize)}</p>
                                <p className="text-sm font-bold text-green-600 dark:text-green-400">
                                    {originalSize > 0 && `~${Math.round(100 - (compressedSize / originalSize) * 100)}% smaller`}
                                </p>
                            </div>
                            <a
                                href={compressedUrl}
                                download="compressed-image.jpg"
                                className="block w-full text-center px-6 py-3 bg-[var(--theme-primary)] text-white font-semibold rounded-lg shadow-md hover:opacity-90"
                            >
                                Download Compressed Image
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompressImage;
