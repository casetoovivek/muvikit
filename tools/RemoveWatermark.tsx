import React, { useState } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import { SpinnerIcon } from '../components/icons';

const RemoveWatermark: React.FC = () => {
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
                setProcessedImage(null);
                setError('');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveWatermark = async () => {
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
                        { text: 'Please remove the watermark from this image. The area where the watermark was should be filled in realistically and seamlessly to match the surrounding image content.' },
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
            setError('Failed to remove watermark. The image may have violated a safety policy. Please try a different image.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Remove Watermark from Image</h2>
                <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">Use AI to remove watermarks or unwanted logos from images.</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4 dark:bg-slate-800 dark:border-slate-700">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--theme-primary-light)] file:text-[var(--theme-primary)] hover:file:opacity-90 dark:file:bg-slate-700 dark:file:text-sky-300 dark:text-slate-400"
                />
                <button
                    onClick={handleRemoveWatermark}
                    disabled={isLoading || !originalImage}
                    className="w-full px-6 py-3 bg-[var(--theme-primary)] text-white font-semibold rounded-lg shadow-md hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center dark:disabled:bg-slate-600"
                >
                    {isLoading ? <><SpinnerIcon className="w-5 h-5 mr-2 animate-spin" /> Removing Watermark...</> : 'Remove Watermark'}
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
                        <img src={processedImage} alt="Watermark removed" className="max-h-96 mx-auto rounded-lg shadow-md" />
                         <a
                            href={processedImage}
                            download="watermark-removed.png"
                            className="mt-4 inline-block px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700"
                        >
                            Download Image
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RemoveWatermark;