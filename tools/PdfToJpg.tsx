import React, { useState } from 'react';
import { SpinnerIcon } from '../components/icons';

const PdfToJpg: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [images, setImages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
            setError('');
            setIsLoading(true);
            setImages([]);

            try {
                const pdfBytes = await selectedFile.arrayBuffer();
                const pdfDoc = await (window as any).pdfjsLib.getDocument({ data: pdfBytes }).promise;
                const numPages = pdfDoc.numPages;
                const convertedImages: string[] = [];

                for (let i = 1; i <= numPages; i++) {
                    const page = await pdfDoc.getPage(i);
                    const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better quality
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    await page.render({ canvasContext: context, viewport: viewport }).promise;
                    convertedImages.push(canvas.toDataURL('image/jpeg', 0.9));
                }
                setImages(convertedImages);
            } catch (err) {
                console.error(err);
                setError('Failed to process PDF. The file might be corrupted or invalid.');
            } finally {
                setIsLoading(false);
            }
        } else {
            setFile(null);
            setError('Please select a valid PDF file.');
        }
    };

    const downloadImage = (dataUrl: string, index: number) => {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `page_${index + 1}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="space-y-6">
            <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">PDF to JPG</h2>
                <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">Convert each page of your PDF into a JPG image.</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4 dark:bg-slate-800 dark:border-slate-700">
                <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--theme-primary-light)] file:text-[var(--theme-primary)] hover:file:opacity-90 dark:file:bg-slate-700 dark:file:text-sky-300 dark:text-slate-400"
                />
                {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>

            {isLoading && (
                <div className="text-center p-8">
                    <SpinnerIcon className="w-8 h-8 mx-auto animate-spin text-[var(--theme-primary)]" />
                    <p className="mt-2 text-slate-500 dark:text-slate-400">Converting PDF...</p>
                </div>
            )}

            {images.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Generated Images ({images.length})</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {images.map((imgSrc, index) => (
                            <div key={index} className="relative group border rounded-lg overflow-hidden">
                                <img src={imgSrc} alt={`Page ${index + 1}`} className="w-full h-auto" />
                                <button
                                    onClick={() => downloadImage(imgSrc, index)}
                                    className="absolute bottom-2 right-2 bg-white/80 text-black px-3 py-1 text-xs rounded-full font-semibold opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                                >
                                    Download
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PdfToJpg;
