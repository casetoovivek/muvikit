import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { SpinnerIcon } from '../components/icons';

const MergePdf: React.FC = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            if (newFiles.some(file => file.type !== 'application/pdf')) {
                setError('Only PDF files are allowed.');
                return;
            }
            setFiles(prev => [...prev, ...newFiles]);
            setError('');
        }
    };

    const handleMerge = async () => {
        if (files.length < 2) {
            setError('Please select at least two PDF files to merge.');
            return;
        }
        setIsLoading(true);
        setError('');

        try {
            const mergedPdf = await PDFDocument.create();
            for (const file of files) {
                const pdfBytes = await file.arrayBuffer();
                const pdfDoc = await PDFDocument.load(pdfBytes);
                const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
                copiedPages.forEach((page) => {
                    mergedPdf.addPage(page);
                });
            }

            const mergedPdfBytes = await mergedPdf.save();
            
            const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'merged.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            setFiles([]); // Clear files after successful merge

        } catch (err) {
            console.error(err);
            setError('An error occurred while merging the PDFs. Please ensure they are valid and not corrupted.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Merge PDF</h2>
                <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">Combine multiple PDF files into a single document.</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4 dark:bg-slate-800 dark:border-slate-700">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-slate-300">Upload PDFs (2 or more)</label>
                    <input
                        type="file"
                        accept="application/pdf"
                        multiple
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--theme-primary-light)] file:text-[var(--theme-primary)] hover:file:opacity-90 dark:file:bg-slate-700 dark:file:text-sky-300 dark:text-slate-400"
                    />
                </div>

                {files.length > 0 && (
                    <div className="space-y-2">
                        <h3 className="font-semibold dark:text-slate-200">Files to Merge:</h3>
                        <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
                            {files.map((file, index) => <li key={index}>{file.name}</li>)}
                        </ul>
                    </div>
                )}

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button
                    onClick={handleMerge}
                    disabled={isLoading || files.length < 2}
                    className="w-full px-6 py-3 bg-[var(--theme-primary)] text-white font-semibold rounded-lg shadow-md hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center dark:disabled:bg-slate-600"
                >
                    {isLoading ? <><SpinnerIcon className="w-5 h-5 mr-2 animate-spin" /> Merging...</> : 'Merge PDFs and Download'}
                </button>
            </div>
        </div>
    );
};

export default MergePdf;
