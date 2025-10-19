import React, { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { SpinnerIcon } from '../components/icons';

declare global {
    interface Window {
        mammoth: any;
    }
}

const WordToPdf: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && (selectedFile.name.endsWith('.docx'))) {
            setFile(selectedFile);
            setError('');
        } else {
            setFile(null);
            setError('Please select a valid .docx file. .doc files are not supported.');
        }
    };

    const handleConvert = async () => {
        if (!file) {
            setError('Please select a file first.');
            return;
        }
        setIsLoading(true);
        setError('');

        try {
            const arrayBuffer = await file.arrayBuffer();
            const result = await window.mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
            const html = result.value;

            const container = document.createElement('div');
            container.style.width = '210mm'; // A4 width
            container.style.padding = '15mm';
            container.style.fontFamily = 'Times New Roman, serif';
            container.innerHTML = html;
            document.body.appendChild(container);
            
            const canvas = await html2canvas(container, { scale: 2 });
            document.body.removeChild(container);
            
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${file.name.replace('.docx', '')}.pdf`);

        } catch (err) {
            console.error(err);
            setError('An error occurred during conversion. The file might be corrupted or have complex formatting not supported by this tool.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Word to PDF</h2>
                <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">Convert Word documents (.docx) to PDF.</p>
                <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">Note: This tool works best for text-based documents. Complex layouts and formatting may vary.</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4 dark:bg-slate-800 dark:border-slate-700">
                <input
                    type="file"
                    accept=".docx"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--theme-primary-light)] file:text-[var(--theme-primary)] hover:file:opacity-90 dark:file:bg-slate-700 dark:file:text-sky-300 dark:text-slate-400"
                />
                {file && <p className="text-sm text-slate-600 dark:text-slate-300">Selected file: {file.name}</p>}
                
                {error && <p className="text-red-500 text-sm">{error}</p>}
                
                <button
                    onClick={handleConvert}
                    disabled={isLoading || !file}
                    className="w-full px-6 py-3 bg-[var(--theme-primary)] text-white font-semibold rounded-lg shadow-md hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center dark:disabled:bg-slate-600"
                >
                    {isLoading ? <><SpinnerIcon className="w-5 h-5 mr-2 animate-spin" /> Converting...</> : 'Convert to PDF and Download'}
                </button>
            </div>
        </div>
    );
};

export default WordToPdf;
