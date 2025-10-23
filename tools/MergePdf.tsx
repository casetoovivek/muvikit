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
            // FIX: Explicitly type the 'file' parameter in the callback to resolve 'unknown' type error.
            if (newFiles.some((file: File) => file.type !== 'application/pdf')) {
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
            <div className="bg-white p-6 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 space-y-6">
                <section>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">What is a PDF Merger?</h2>
                    <p className="mt-2 text-slate-600 dark:text-slate-300">A PDF Merger is a utility that allows you to combine several individual PDF documents into one single, consolidated PDF file. This is extremely useful for organizing related documents, creating reports, compiling presentations, or simplifying file sharing. Instead of sending multiple attachments, you can send one organized file.</p>
                </section>
                <section>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">How to Use This Tool</h2>
                    <ol className="list-decimal list-inside mt-2 space-y-2 text-slate-600 dark:text-slate-300">
                        <li><strong>Upload Your PDFs:</strong> Click the "Choose File" button and select two or more PDF files from your device. You can select multiple files at once by holding Ctrl (or Cmd on Mac) while clicking.</li>
                        <li><strong>Review Your Files:</strong> The names of your selected files will appear in a list for you to review.</li>
                        <li><strong>Merge and Download:</strong> Click the "Merge PDFs and Download" button. The tool will process your files and a download for the new, combined PDF will start automatically.</li>
                    </ol>
                </section>
                <section>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Benefits of Our PDF Merger</h2>
                    <ul className="list-disc list-inside mt-2 space-y-2 text-slate-600 dark:text-slate-300">
                        <li><strong>Completely Secure:</strong> All merging happens directly in your browser. Your files are never uploaded to our servers, ensuring your data remains private.</li>
                        <li><strong>Fast and Efficient:</strong> Our tool processes and combines your files in seconds without any queues or waiting times.</li>
                        <li><strong>No Limits:</strong> Merge as many files as you need, as many times as you want, completely free.</li>
                        <li><strong>Easy to Use:</strong> A simple, intuitive interface makes combining PDFs effortless for everyone.</li>
                    </ul>
                </section>
                <section>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Frequently Asked Questions (FAQs)</h2>
                    <div className="mt-2 space-y-3 text-slate-600 dark:text-slate-300">
                        <div>
                            <h3 className="font-semibold">Are my files safe?</h3>
                            <p>Absolutely. Your privacy is our top priority. The entire merging process is done on your own computer, so your sensitive documents are never transmitted over the internet.</p>
                        </div>
                        <div>
                            <h3 className="font-semibold">Is there a limit on the number or size of files I can merge?</h3>
                            <p>There are no artificial limits imposed by our tool. However, performance may be limited by your browser's capabilities when handling a very large number of files or extremely large file sizes.</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default MergePdf;