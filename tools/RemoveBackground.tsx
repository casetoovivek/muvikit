import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import ReactCrop, { centerCrop, makeAspectCrop, type Crop, type PixelCrop } from 'react-image-crop';
import { SpinnerIcon } from '../components/icons';

// Helper function to convert base64 to blob
function base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
}

// Helper to format file size
const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};


const RemoveBackground: React.FC = () => {
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [processedImage, setProcessedImage] = useState<string | null>(null);
    const [finalImage, setFinalImage] = useState<string | null>(null);
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [bgColor, setBgColor] = useState('#0d3e80'); // Professional Blue
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const [outputSize, setOutputSize] = useState('');
    const [jpegQuality, setJpegQuality] = useState(0.92);

    const processedImgRef = useRef<HTMLImageElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setOriginalImage(event.target?.result as string);
                setProcessedImage(null);
                setFinalImage(null);
                setCrop(undefined);
                setCompletedCrop(undefined);
                setError('');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveBackground = async () => {
        if (!originalImage) {
            setError('Please upload an image first.');
            return;
        }
        setIsLoading(true);
        setError('');

        try {
            const base64Data = originalImage.split(',')[1];
            const mimeType = originalImage.split(';')[0].split(':')[1];

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: {
                    parts: [
                        { inlineData: { data: base64Data, mimeType: mimeType } },
                        { text: 'Remove the background from this image, making the new background transparent.' },
                    ],
                },
                config: {
                    responseModalities: [Modality.IMAGE],
                },
            });
            
            const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);
            if (imagePart?.inlineData) {
                const newBase64 = imagePart.inlineData.data;
                const newMimeType = imagePart.inlineData.mimeType;
                setProcessedImage(`data:${newMimeType};base64,${newBase64}`);
            } else {
                throw new Error("AI did not return an image. It might be due to a safety policy violation.");
            }
        } catch (err) {
            console.error(err);
            setError('Failed to remove background. The image may have violated a safety policy. Please try a different image.');
        } finally {
            setIsLoading(false);
        }
    };

    const onProcessedImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const { width, height } = e.currentTarget;
        const crop = centerCrop(
            makeAspectCrop({ unit: '%', width: 90 }, 1, width, height),
            width, height
        );
        setCrop(crop);
    };

    const applyChanges = useCallback(() => {
        if (!processedImgRef.current || !completedCrop || !completedCrop.width || !completedCrop.height) {
            return;
        }

        const image = processedImgRef.current;
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        
        canvas.width = completedCrop.width * scaleX;
        canvas.height = completedCrop.height * scaleY;
    
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Apply background color
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw cropped image on top
        ctx.drawImage(
            image,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0, 0, canvas.width, canvas.height
        );
        
        const dataUrl = canvas.toDataURL('image/jpeg', jpegQuality);
        setFinalImage(dataUrl);

        const blob = base64ToBlob(dataUrl.split(',')[1], 'image/jpeg');
        setOutputSize(formatBytes(blob.size));

    }, [completedCrop, bgColor, jpegQuality]);

    useEffect(() => {
        if (completedCrop && processedImgRef.current) {
            applyChanges();
        }
    }, [applyChanges, completedCrop, bgColor, jpegQuality]);
    

    return (
        <div className="space-y-6">
            <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">AI Background Remover & Passport Photo Creator</h2>
                <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">Remove a background, add a new color, and resize for your needs.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="space-y-4 bg-white p-6 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Step 1: Upload Image</h3>
                        <input type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--theme-primary-light)] file:text-[var(--theme-primary)] hover:file:opacity-90 dark:file:bg-slate-700 dark:file:text-sky-300 dark:text-slate-400" />
                    </div>
                    {originalImage && (
                        <div>
                            <img src={originalImage} alt="Original" className="max-h-60 mx-auto rounded-md" />
                            <button onClick={handleRemoveBackground} disabled={isLoading} className="mt-4 w-full px-6 py-3 bg-[var(--theme-primary)] text-white font-semibold rounded-lg shadow-md hover:opacity-90 disabled:bg-gray-400 flex items-center justify-center dark:disabled:bg-slate-600">
                                {isLoading ? <><SpinnerIcon className="w-5 h-5 mr-2 animate-spin"/> Removing Background...</> : 'Step 2: Remove Background'}
                            </button>
                        </div>
                    )}
                </div>

                <div className={`space-y-4 bg-white p-6 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 ${!processedImage && !isLoading ? 'hidden' : ''}`}>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Step 3: Customize & Download</h3>
                    {isLoading && <div className="flex items-center justify-center h-60"><SpinnerIcon className="w-10 h-10 animate-spin text-[var(--theme-primary)]" /></div>}
                    {processedImage && !isLoading && (
                        <div className="space-y-4">
                             <p className="text-sm text-center text-slate-500 dark:text-slate-400">Crop your image (passport photos are usually square).</p>
                             <div className="bg-slate-100 dark:bg-slate-900 p-2 rounded-md flex justify-center">
                                <ReactCrop crop={crop} onChange={c => setCrop(c)} onComplete={c => setCompletedCrop(c)} aspect={1}>
                                    <img ref={processedImgRef} src={processedImage} onLoad={onProcessedImageLoad} alt="Processed" className="max-h-60" />
                                </ReactCrop>
                             </div>
                            
                            <div className="flex items-center gap-4">
                                <label htmlFor="bg-color" className="font-medium text-gray-700 dark:text-slate-300">Background Color:</label>
                                <input type="color" id="bg-color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-12 h-10 p-1 border border-gray-300 rounded-md cursor-pointer dark:border-slate-600"/>
                            </div>
                            
                            <div>
                                <label htmlFor="quality" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Image Quality / File Size:</label>
                                <input id="quality" type="range" min="0.1" max="1" step="0.01" value={jpegQuality} onChange={e => setJpegQuality(parseFloat(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700" />
                            </div>

                            <div className="text-center bg-slate-50 p-3 rounded-lg dark:bg-slate-700">
                                <p className="font-semibold text-slate-700 dark:text-slate-200">Estimated Size: <span className="text-[var(--theme-primary)] dark:text-sky-300">{outputSize}</span></p>
                            </div>

                            <a href={finalImage ?? '#'} download="final-image.jpg" className={`block w-full text-center px-6 py-3 font-semibold rounded-lg shadow-md ${!finalImage ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}>
                                Download Final Image
                            </a>
                        </div>
                    )}
                </div>
            </div>
             {error && <div className="p-4 bg-red-100 text-red-800 border border-red-200 rounded-lg dark:bg-red-900/50 dark:text-red-300 dark:border-red-800">{error}</div>}
        </div>
    );
};

export default RemoveBackground;
