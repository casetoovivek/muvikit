import React, { useState } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { SpinnerIcon } from '../components/icons';

const AddPageNumbersToPdf: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
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

    const handleAddNumbers = async () => {
        if (!file) {
            setError('Please select a file.');
            return;
        }
        setIsLoading(true);
        setError('');

        try {
            const pdfBytes = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(pdfBytes);
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const pages = pdfDoc.getPages();
            const totalPages = pages.length;

            pages.forEach((page, i) => {
                const { width, height } = page.getSize();
                const pageNumberText = `Page ${i + 1} of ${totalPages}`;
                const textSize = 12;
                const textWidth = font.widthOfTextAtSize(pageNumberText, textSize);

                page.drawText(pageNumberText, {
                    x: width / 2 - textWidth / 2,
                    y: 20,
                    size: textSize,
                    font: font,
                    color: rgb(0, 0, 0),
                });
            });

            const numberedPdfBytes = await pdfDoc.save();

            const blob = new Blob([numberedPdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `numbered_${file.name}`;
            a.click();
            URL.revokeObjectURL(url);

        } catch (err: any) {
            console.error(err);
            setError(`Error adding page numbers: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Add Page Numbers to PDF</h2>
                <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">Automatically insert page numbers at the bottom of each page.</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4 dark:bg-slate-800 dark:border-slate-700">
                <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--theme-primary-light)] file:text-[var(--theme-primary)] hover:file:opacity-90 dark:file:bg-slate-700 dark:file:text-sky-300 dark:text-slate-400"
                />
                
                {error && <p className="text-red-500 text-sm">{error}</p>}
                
                <button
                    onClick={handleAddNumbers}
                    disabled={isLoading || !file}
                    className="w-full px-6 py-3 bg-[var(--theme-primary)] text-white font-semibold rounded-lg shadow-md hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center dark:disabled:bg-slate-600"
                >
                    {isLoading ? <><SpinnerIcon className="w-5 h-5 mr-2 animate-spin" /> Processing...</> : 'Add Numbers and Download'}
                </button>
            </div>
        </div>
    );
};

export default AddPageNumbersToPdf;
