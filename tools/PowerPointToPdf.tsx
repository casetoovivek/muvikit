import React, { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { SpinnerIcon } from '../components/icons';

declare global {
    interface Window {
        pptx: any;
    }
}

const PowerPointToPdf: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [progress, setProgress] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && selectedFile.name.endsWith('.pptx')) {
            setFile(selectedFile);
            setError('');
        } else {
            setFile(null);
            setError('Please select a valid .pptx file. .ppt files are not supported.');
        }
    };

    const handleConvert = async () => {
        if (!file) {
            setError('Please select a file first.');
            return;
        }
        setIsLoading(true);
        setError('');
        setProgress('Loading presentation...');

        try {
            const pptx = new window.pptx();
            const presentation = await pptx.load(file);
            const slideCount = presentation.slides.length;
            const pdf = new jsPDF('l', 'mm', 'a4'); // Landscape A4

            for (let i = 0; i < slideCount; i++) {
                setProgress(`Processing slide ${i + 1} of ${slideCount}...`);
                if (i > 0) pdf.addPage();
                
                const slide = presentation.slides[i];
                const slideHtmlContainer = document.createElement('div');
                // A4 landscape dimensions in pixels at 96 DPI
                slideHtmlContainer.style.width = '1122.5px';
                slideHtmlContainer.style.height = '793.7px';
                slideHtmlContainer.style.position = 'relative';
                slideHtmlContainer.style.overflow = 'hidden';
                slideHtmlContainer.style.backgroundColor = `#${slide.backgroundColor || 'FFF'}`;

                for (const element of slide.elements) {
                    if (element.type === 'text') {
                        const p = document.createElement('p');
                        p.textContent = element.text;
                        p.style.position = 'absolute';
                        p.style.left = `${element.x}px`;
                        p.style.top = `${element.y}px`;
                        p.style.width = `${element.width}px`;
                        p.style.height = `${element.height}px`;
                        p.style.color = `#${element.fontColor || '000'}`;
                        p.style.fontSize = `${element.fontSize || 18}pt`;
                        p.style.fontFamily = element.fontFace || 'Arial';
                        p.style.textAlign = element.align;
                        if (element.isBold) p.style.fontWeight = 'bold';
                        if (element.isItalic) p.style.fontStyle = 'italic';
                        slideHtmlContainer.appendChild(p);
                    }
                }
                
                document.body.appendChild(slideHtmlContainer);
                const canvas = await html2canvas(slideHtmlContainer, { scale: 2 });
                document.body.removeChild(slideHtmlContainer);
                
                const imgData = canvas.toDataURL('image/png');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            }
            
            pdf.save(`${file.name.replace('.pptx', '')}.pdf`);

        } catch (err) {
            console.error(err);
            setError('An error occurred during conversion. The file might be corrupted or use unsupported features.');
        } finally {
            setIsLoading(false);
            setProgress('');
        }
    };

    return (
        <div className="space-y-6">
            <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">PowerPoint to PDF</h2>
                <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">Convert PowerPoint presentations (.pptx) to PDF.</p>
                <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">Note: This is a basic converter. Images, shapes, and complex formatting are not yet supported.</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4 dark:bg-slate-800 dark:border-slate-700">
                <input
                    type="file"
                    accept=".pptx"
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
                    {isLoading ? <><SpinnerIcon className="w-5 h-5 mr-2 animate-spin" /> {progress || 'Converting...'}</> : 'Convert to PDF and Download'}
                </button>
            </div>
        </div>
    );
};

export default PowerPointToPdf;
