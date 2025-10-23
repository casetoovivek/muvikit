import React, { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { SpinnerIcon, TrashIcon, DownloadIcon, ImageIcon } from '../components/icons';

interface ImageFile {
    id: string;
    file: File;
}

interface ResultFile {
    id: string;
    name: string;
    originalSize: number;
    newSize: number;
    url: string;
    error?: string;
}

const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const ReduceImageSize: React.FC = () => {
    const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
    const [targetSize, setTargetSize] = useState('100');
    const [dimensions, setDimensions] = useState({ width: '', height: '' });
    const [isProcessing, setIsProcessing] = useState(false);
    const [results, setResults] = useState<ResultFile[]>([]);
    const [dragActive, setDragActive] = useState(false);
    const [status, setStatus] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFiles = (files: FileList | null) => {
        if (!files) return;
        const newImageFiles = Array.from(files)
            .filter(file => file.type.startsWith('image/'))
            .map(file => ({ id: `${file.name}-${file.lastModified}`, file }));
        setImageFiles(prev => [...prev, ...newImageFiles]);
    };

    const handleDrag = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFiles(e.target.files);
        }
    };

    const removeFile = (id: string) => {
        setImageFiles(prev => prev.filter(f => f.id !== id));
    };

    const compressImage = async (file: File, targetSizeBytes: number, newWidth?: number, newHeight?: number): Promise<Omit<ResultFile, 'id' | 'name' | 'originalSize'>> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = async () => {
                    const canvas = document.createElement('canvas');
                    const w = newWidth || img.naturalWidth;
                    const h = newHeight || img.naturalHeight;
                    canvas.width = w;
                    canvas.height = h;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        resolve({ error: 'Canvas context not available.', url: '', newSize: 0 });
                        return;
                    }
                    ctx.drawImage(img, 0, 0, w, h);

                    // Binary search for the best quality
                    let lower = 0.0;
                    let upper = 1.0;
                    let bestUrl = '';
                    let bestSize = 0;

                    for (let i = 0; i < 7; i++) { // 7 iterations are usually enough
                        const mid = (lower + upper) / 2;
                        const dataUrl = canvas.toDataURL('image/jpeg', mid);
                        const blob = await (await fetch(dataUrl)).blob();
                        
                        if (blob.size <= targetSizeBytes) {
                            bestUrl = dataUrl;
                            bestSize = blob.size;
                            lower = mid;
                        } else {
                            upper = mid;
                        }
                    }
                    
                    if (bestUrl) {
                        resolve({ url: bestUrl, newSize: bestSize });
                    } else {
                        // If even quality 0 is too large, return the lowest possible quality image
                        const lowestQualityUrl = canvas.toDataURL('image/jpeg', 0);
                         const blob = await (await fetch(lowestQualityUrl)).blob();
                        resolve({ url: lowestQualityUrl, newSize: blob.size, error: 'Could not reach target size. Smallest possible size provided.' });
                    }
                };
                img.onerror = () => {
                     resolve({ error: 'Could not load image file.', url: '', newSize: 0 });
                }
                img.src = event.target?.result as string;
            };
            reader.onerror = () => {
                 resolve({ error: 'Could not read file.', url: '', newSize: 0 });
            }
            reader.readAsDataURL(file);
        });
    };

    const handleReduceSize = async () => {
        if (imageFiles.length === 0) return;
        setIsProcessing(true);
        setResults([]);
        const targetBytes = parseInt(targetSize) * 1024;
        const newWidth = dimensions.width ? parseInt(dimensions.width) : undefined;
        const newHeight = dimensions.height ? parseInt(dimensions.height) : undefined;
        
        const newResults: ResultFile[] = [];
        for (let i = 0; i < imageFiles.length; i++) {
            const { id, file } = imageFiles[i];
            setStatus(`Processing ${i + 1} of ${imageFiles.length}: ${file.name}`);
            const result = await compressImage(file, targetBytes, newWidth, newHeight);
            newResults.push({
                id,
                name: file.name,
                originalSize: file.size,
                ...result,
            });
        }
        setResults(newResults);
        setIsProcessing(false);
        setStatus('');
    };

    const clearAll = () => {
        setImageFiles([]);
        setResults([]);
    };

    return (
        <div className="space-y-6">
            <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Reduce Image Size in KB</h2>
                <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">Compress images to a target file size, with optional resizing.</p>
            </div>
            
            <div onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} className={`relative p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${dragActive ? 'border-[var(--theme-primary)] bg-[var(--theme-primary-light)] dark:bg-sky-900/50' : 'border-slate-300 dark:border-slate-600'}`}>
                <input ref={fileInputRef} type="file" multiple onChange={handleChange} className="hidden" accept="image/*" />
                <ImageIcon className="w-12 h-12 mx-auto text-slate-400"/>
                <p className="mt-2 font-semibold text-slate-700 dark:text-slate-200">Select Or Drag & Drop Images Here</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">You can compress multiple images at once.</p>
                <button onClick={() => fileInputRef.current?.click()} className="mt-4 px-5 py-2 bg-[var(--theme-primary)] text-white font-semibold rounded-lg shadow-md hover:opacity-90">
                    Select Images
                </button>
            </div>
            
            {(imageFiles.length > 0 || results.length > 0) && (
                <div className="bg-white p-6 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Target Size (in KB)</label>
                            <input type="number" value={targetSize} onChange={e => setTargetSize(e.target.value)} className="mt-1 p-2 w-full border rounded-md dark:bg-slate-700 dark:border-slate-600"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">New Dimensions (Optional)</label>
                            <div className="flex gap-2 mt-1">
                                <input type="number" value={dimensions.width} onChange={e => setDimensions({...dimensions, width: e.target.value})} placeholder="Width" className="p-2 w-full border rounded-md dark:bg-slate-700 dark:border-slate-600"/>
                                <input type="number" value={dimensions.height} onChange={e => setDimensions({...dimensions, height: e.target.value})} placeholder="Height" className="p-2 w-full border rounded-md dark:bg-slate-700 dark:border-slate-600"/>
                            </div>
                        </div>
                    </div>
                    <button onClick={handleReduceSize} disabled={isProcessing || imageFiles.length === 0} className="w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:bg-slate-400 flex items-center justify-center">
                        {isProcessing ? <><SpinnerIcon className="w-5 h-5 mr-2 animate-spin"/> {status || 'Processing...'}</> : `Reduce Size of ${imageFiles.length} Image(s)`}
                    </button>
                    <button onClick={clearAll} className="w-full py-2 text-sm text-slate-600 hover:underline dark:text-slate-400">Clear All</button>

                    {results.length > 0 && (
                        <div className="space-y-2 pt-4 border-t dark:border-slate-600">
                             <h3 className="font-semibold">Results:</h3>
                             {results.map(res => (
                                 <div key={res.id} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-700 rounded-md">
                                     <div className="truncate">
                                         <p className="text-sm font-medium truncate" title={res.name}>{res.name}</p>
                                         <p className="text-xs text-slate-500 dark:text-slate-400">{formatBytes(res.originalSize)} &rarr; <span className="font-bold">{formatBytes(res.newSize)}</span></p>
                                         {res.error && <p className="text-xs text-red-500">{res.error}</p>}
                                     </div>
                                     <a href={res.url} download={res.name.replace(/\.[^/.]+$/, "") + ".jpg"} className="ml-4 p-2 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300">
                                        <DownloadIcon className="w-4 h-4"/>
                                     </a>
                                 </div>
                             ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ReduceImageSize;