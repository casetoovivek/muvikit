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
            <div className="bg-white p-6 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 space-y-6">
                <section>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">What is a PDF Splitter?</h2>
                    <p className="mt-2 text-slate-600 dark:text-slate-300">A PDF Splitter is a tool that allows you to extract one or more pages from a PDF document and save them as a new, separate PDF file. This is useful when you only need a specific chapter from a large book, a single invoice from a monthly statement, or want to remove unnecessary pages from a document before sharing it.</p>
                </section>
                <section>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">How to Use This Tool</h2>
                    <ol className="list-decimal list-inside mt-2 space-y-2 text-slate-600 dark:text-slate-300">
                        <li><strong>Upload Your PDF:</strong> Select the PDF file you want to split from your device.</li>
                        <li><strong>Specify Page Ranges:</strong> In the "Pages to Extract" field, enter the page numbers you want to keep. You can enter single pages (e.g., 5), ranges (e.g., 1-3), or a combination (e.g., 1-3, 5, 8-10).</li>
                        <li><strong>Split and Download:</strong> Click the "Split PDF and Download" button. A new PDF containing only your selected pages will be generated and downloaded.</li>
                    </ol>
                </section>
                <section>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Benefits of Our PDF Splitter</h2>
                    <ul className="list-disc list-inside mt-2 space-y-2 text-slate-600 dark:text-slate-300">
                        <li><strong>Secure and Private:</strong> All processing happens in your browser. Your files are never uploaded to our servers.</li>
                        <li><strong>Flexible Page Selection:</strong> Extract any combination of pages or ranges to create the exact document you need.</li>
                        <li><strong>Reduce File Size:</strong> By removing unnecessary pages, you can create smaller, easier-to-share files.</li>
                        <li><strong>Free and Unlimited:</strong> Split as many PDFs as you need without any cost or limitations.</li>
                    </ul>
                </section>
                <section>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Frequently Asked Questions (FAQs)</h2>
                    <div className="mt-2 space-y-3 text-slate-600 dark:text-slate-300">
                        <div>
                            <h3 className="font-semibold">Is my document safe?</h3>
                            <p>Yes. Because the splitting process is done entirely on your computer, your documents remain private and secure.</p>
                        </div>
                        <div>
                            <h3 className="font-semibold">Can I split a password-protected PDF?</h3>
                            <p>No, you must first remove the password from the PDF before you can split it. You can use our "Unlock PDF" tool for this purpose.</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default SplitPdf;
