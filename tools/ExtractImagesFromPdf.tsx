import React, { useState } from 'react';
import { SpinnerIcon } from '../components/icons';

const ExtractImagesFromPdf: React.FC = () => {
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
                const extractedImages: string[] = [];

                for (let i = 1; i <= numPages; i++) {
                    const page = await pdfDoc.getPage(i);
                    const operatorList = await page.getOperatorList();
                    
                    for (let j = 0; j < operatorList.fnArray.length; j++) {
                        const op = operatorList.fnArray[j];
                        if (op === (window as any).pdfjsLib.OPS.paintImageXObject) {
                            const imageName = operatorList.argsArray[j][0];
                            await page.objs.get(imageName, (img: any) => {
                                const canvas = document.createElement('canvas');
                                canvas.width = img.width;
                                canvas.height = img.height;
                                const ctx = canvas.getContext('2d');
                                if (!ctx) return;

                                const imgData = ctx.createImageData(img.width, img.height);
                                const pixels = imgData.data;
                                const data = img.data;
                                
                                // Handle different color spaces
                                if (img.kind === (window as any).pdfjsLib.ImageKind.GRAYSCALE_1BPP) {
                                    // Handle 1-bit grayscale (monochrome)
                                    let k = 0;
                                    for (let i = 0; i < data.length; i++) {
                                        const b = data[i];
                                        for (let bit = 7; bit >= 0; bit--) {
                                            if (k >= pixels.length) break;
                                            const pixel = (b >> bit) & 1 ? 0 : 255;
                                            pixels[k++] = pixel;
                                            pixels[k++] = pixel;
                                            pixels[k++] = pixel;
                                            pixels[k++] = 255;
                                        }
                                    }
                                } else if (img.kind === (window as any).pdfjsLib.ImageKind.RGB_24BPP) {
                                    // Handle 24-bit RGB
                                    let k = 0;
                                    for (let i = 0; i < data.length; i += 3) {
                                        pixels[k++] = data[i];
                                        pixels[k++] = data[i+1];
                                        pixels[k++] = data[i+2];
                                        pixels[k++] = 255;
                                    }
                                } else {
                                    // For simplicity, handle others as RGBA (may not be perfect for all kinds)
                                    pixels.set(data);
                                }
                                
                                ctx.putImageData(imgData, 0, 0);
                                extractedImages.push(canvas.toDataURL('image/png'));
                            });
                        }
                    }
                }
                setImages(extractedImages);
                 if (extractedImages.length === 0) {
                    setError('No images found in this PDF.');
                }
            } catch (err) {
                console.error(err);
                setError('Failed to process PDF. It may be corrupted or password-protected.');
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
        a.download = `image_${index + 1}.png`;
        a.click();
    };


    return (
        <div className="space-y-6">
            <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Extract Images from PDF</h2>
                <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">Extract all images contained in a PDF file.</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4 dark:bg-slate-800 dark:border-slate-700">
                <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--theme-primary-light)] file:text-[var(--theme-primary)] hover:file:opacity-90 dark:file:bg-slate-700 dark:file:text-sky-300 dark:text-slate-400"
                />
            </div>
            
            {error && !isLoading && <p className="text-center text-red-500 text-sm">{error}</p>}
            
            {isLoading && (
                <div className="text-center p-8">
                    <SpinnerIcon className="w-8 h-8 mx-auto animate-spin text-[var(--theme-primary)]" />
                    <p className="mt-2 text-slate-500 dark:text-slate-400">Extracting images...</p>
                </div>
            )}

            {images.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Extracted Images ({images.length})</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {images.map((imgSrc, index) => (
                            <div key={index} className="relative group border rounded-lg overflow-hidden">
                                <img src={imgSrc} alt={`Extracted ${index + 1}`} className="w-full h-auto" />
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

export default ExtractImagesFromPdf;
