import React, { useState } from 'react';
import Tesseract from 'tesseract.js';
import { SpinnerIcon } from '../components/icons';

const ImageToText: React.FC = () => {
    const [image, setImage] = useState<string | null>(null);
    const [text, setText] = useState('');
    const [progress, setProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
                setText('');
                setError('');
                setProgress(0);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRecognize = async () => {
        if (!image) {
            setError('Please upload an image first.');
            return;
        }
        setIsLoading(true);
        setError('');
        setText('');
        setProgress(0);

        try {
            const result = await Tesseract.recognize(
                image,
                'eng',
                {
                    logger: m => {
                        if (m.status === 'recognizing text') {
                            setProgress(Math.round(m.progress * 100));
                        }
                    }
                }
            );
            setText(result.data.text);
        } catch (err) {
            console.error(err);
            setError('An error occurred during text recognition.');
        } finally {
            setIsLoading(false);
            setProgress(100);
        }
    };

    return (
        <div className="space-y-6">
            <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Image to Text (OCR)</h2>
                <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">Extract text from an image using Optical Character Recognition.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <div className="space-y-4">
                    <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4 dark:bg-slate-800 dark:border-slate-700">
                        <input type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--theme-primary-light)] file:text-[var(--theme-primary)] hover:file:opacity-90 dark:file:bg-slate-700 dark:file:text-sky-300 dark:text-slate-400" />
                        {image && <img src={image} alt="Preview" className="max-h-64 mx-auto rounded-md" />}
                    </div>
                    <button
                        onClick={handleRecognize}
                        disabled={isLoading || !image}
                        className="w-full px-6 py-3 bg-[var(--theme-primary)] text-white font-semibold rounded-lg shadow-md hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center dark:disabled:bg-slate-600"
                    >
                        {isLoading ? <><SpinnerIcon className="w-5 h-5 mr-2 animate-spin" /> Recognizing...</> : 'Recognize Text'}
                    </button>
                    {error && <p className="text-red-500">{error}</p>}
                </div>

                <div className="space-y-2">
                    {isLoading && (
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                            <div className="bg-[var(--theme-primary)] h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                        </div>
                    )}
                    <textarea
                        readOnly
                        value={text}
                        placeholder="Extracted text will appear here..."
                        className="w-full h-96 p-4 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] transition-shadow duration-200 resize-none dark:bg-slate-800/50 dark:border-slate-700 dark:text-white"
                    />
                </div>
            </div>
        </div>
    );
};

export default ImageToText;
