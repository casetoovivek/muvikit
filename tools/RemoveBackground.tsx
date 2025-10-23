import React, { useState } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import { SpinnerIcon } from '../components/icons';

const RemoveBackground: React.FC = () => {
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [processedImage, setProcessedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setOriginalImage(event.target?.result as string);
                setProcessedImage(null); // Clear previous result
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
        setProcessedImage(null);

        try {
            const base64Data = originalImage.split(',')[1];
            const mimeType = originalImage.split(';')[0].split(':')[1];

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: {
                    parts: [
                        { inlineData: { data: base64Data, mimeType: mimeType } },
                        { text: 'Remove the background from this image, making the new background transparent. Pay close attention to preserving fine details like hair strands.' },
                    ],
                },
                config: { responseModalities: [Modality.IMAGE] },
            });
            
            const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
            if (imagePart?.inlineData) {
                setProcessedImage(`data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`);
            } else {
                throw new Error("AI did not return an image. It might be due to a safety policy violation.");
            }
        } catch (err: any) {
            setError(err.message || 'Failed to remove background. Please try a different image.');
            setProcessedImage(null);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">AI Background Remover</h2>
                <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">Automatically remove the background from any image with a single click.</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4 dark:bg-slate-800 dark:border-slate-700">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--theme-primary-light)] file:text-[var(--theme-primary)] hover:file:opacity-90 dark:file:bg-slate-700 dark:file:text-sky-300 dark:text-slate-400"
                />
                <button
                    onClick={handleRemoveBackground}
                    disabled={isLoading || !originalImage}
                    className="w-full px-6 py-3 bg-[var(--theme-primary)] text-white font-semibold rounded-lg shadow-md hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center dark:disabled:bg-slate-600"
                >
                    {isLoading ? <><SpinnerIcon className="w-5 h-5 mr-2 animate-spin"/> Removing Background...</> : 'Remove Background'}
                </button>
            </div>

            {error && <div className="p-4 bg-red-100 text-red-800 border border-red-200 rounded-lg dark:bg-red-900/50 dark:text-red-300 dark:border-red-800">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {originalImage && (
                    <div className="text-center">
                        <h3 className="text-lg font-semibold mb-2 dark:text-slate-200">Original</h3>
                        <img src={originalImage} alt="Original" className="max-h-96 mx-auto rounded-lg shadow-md" />
                    </div>
                )}
                {processedImage && (
                    <div className="text-center">
                        <h3 className="text-lg font-semibold mb-2 dark:text-slate-200">Result</h3>
                        <div className="relative inline-block" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Crect width='10' height='10' fill='%23eee'/%3E%3Crect x='10' y='10' width='10' height='10' fill='%23eee'/%3E%3C/svg%3E")`}}>
                            <img src={processedImage} alt="Background removed" className="max-h-96 mx-auto rounded-lg shadow-md relative" />
                        </div>
                         <a
                            href={processedImage}
                            download="background-removed.png"
                            className="mt-4 inline-block px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700"
                        >
                            Download PNG
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RemoveBackground;