import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { SpinnerIcon } from '../components/icons';

const SplitPdf: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [pageRange, setPageRange] = useState('');
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

    const parsePageRanges = (rangeStr: string, maxPages: number): number[] => {
        const indices = new Set<number>();
        const parts = rangeStr.split(',');
        for (const part of parts) {
            const trimmedPart = part.trim();
            if (trimmedPart.includes('-')) {
                const [start, end] = trimmedPart.split('-').map(num => parseInt(num.trim(), 10));
                if (!isNaN(start) && !isNaN(end) && start <= end) {
                    for (let i = start; i <= end; i++) {
                        if (i > 0 && i <= maxPages) indices.add(i - 1);
                    }
                }
            } else {
                const pageNum = parseInt(trimmedPart, 10);
                if (!isNaN(pageNum) && pageNum > 0 && pageNum <= maxPages) {
                    indices.add(pageNum - 1);
                }
            }
        }
        return Array.from(indices).sort((a, b) => a - b);
    };

    const handleSplit = async () => {
        if (!file || !pageRange) {
            setError('Please select a file and enter page ranges.');
            return;
        }
        setIsLoading(true);
        setError('');

        try {
            const pdfBytes = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(pdfBytes);
            const totalPages = pdfDoc.getPageCount();

            const pagesToCopy = parsePageRanges(pageRange, totalPages);
            if (pagesToCopy.length === 0) {
                throw new Error("Invalid page range or no pages selected.");
            }

            const newPdfDoc = await PDFDocument.create();
            const copiedPages = await newPdfDoc.copyPages(pdfDoc, pagesToCopy);
            copiedPages.forEach(page => newPdfDoc.addPage(page));

            const newPdfBytes = await newPdfDoc.save();
            
            const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `split_${file.name}`;
            a.click();
            URL.revokeObjectURL(url);

        } catch (err: any) {
            console.error(err);
            setError(`Error splitting PDF: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Split PDF</h2>
                <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">Extract specific pages from a PDF file.</p>
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
                        <label htmlFor="pageRange" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Pages to Extract</label>
                        <input
                            type="text"
                            id="pageRange"
                            value={pageRange}
                            onChange={e => setPageRange(e.target.value)}
                            placeholder="e.g., 1-3, 5, 8-10"
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
                        />
                    </div>
                )}
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button
                    onClick={handleSplit}
                    disabled={isLoading || !file || !pageRange}
                    className="w-full px-6 py-3 bg-[var(--theme-primary)] text-white font-semibold rounded-lg shadow-md hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center dark:disabled:bg-slate-600"
                >
                    {isLoading ? <><SpinnerIcon className="w-5 h-5 mr-2 animate-spin" /> Splitting...</> : 'Split PDF and Download'}
                </button>
            </div>
        </div>
    );
};

export default SplitPdf;
