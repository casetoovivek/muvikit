import React, { useState } from 'react';
import { PDFDocument, RotationTypes } from 'pdf-lib';
import { SpinnerIcon } from '../components/icons';

const RotatePdf: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [rotation, setRotation] = useState<90 | 180 | 270>(90);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
            setError('');
        } else {
            setFile(null);
            setError('Please select a valid PDF file.');
        }
    };

    const handleRotate = async () => {
        if (!file) {
            setError('Please select a file.');
            return;
        }
        setIsLoading(true);
        setError('');

        try {
            const pdfBytes = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(pdfBytes);
            const pages = pdfDoc.getPages();
            
            pages.forEach(page => {
                const currentRotation = page.getRotation().angle;
                page.setRotation({ type: RotationTypes.Degrees, angle: currentRotation + rotation });
            });

            const rotatedPdfBytes = await pdfDoc.save();

            const blob = new Blob([rotatedPdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `rotated_${file.name}`;
            a.click();
            URL.revokeObjectURL(url);

        } catch (err: any) {
            console.error(err);
            setError(`Error rotating PDF: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Rotate PDF</h2>
                <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">Rotate all pages in a PDF file.</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4 dark:bg-slate-800 dark:border-slate-700">
                <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--theme-primary-light)] file:text-[var(--theme-primary)] hover:file:opacity-90 dark:file:bg-slate-700 dark:file:text-sky-300 dark:text-slate-400"
                />
                {file && (
                    <div>
                        <label htmlFor="rotation" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Rotation Angle</label>
                        <select
                            id="rotation"
                            value={rotation}
                            onChange={e => setRotation(parseInt(e.target.value) as 90 | 180 | 270)}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        >
                            <option value="90">90° Clockwise</option>
                            <option value="180">180°</option>
                            <option value="270">270° Clockwise (90° Counter-clockwise)</option>
                        </select>
                    </div>
                )}
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button
                    onClick={handleRotate}
                    disabled={isLoading || !file}
                    className="w-full px-6 py-3 bg-[var(--theme-primary)] text-white font-semibold rounded-lg shadow-md hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center dark:disabled:bg-slate-600"
                >
                    {isLoading ? <><SpinnerIcon className="w-5 h-5 mr-2 animate-spin" /> Rotating...</> : 'Rotate PDF and Download'}
                </button>
            </div>
        </div>
    );
};

export default RotatePdf;
