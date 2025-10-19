import React, { useState } from 'react';
import jsPDF from 'jspdf';
import { SpinnerIcon } from '../components/icons';

const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const CompressPdf: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [quality, setQuality] = useState(0.7); // Default JPEG quality
    const [result, setResult] = useState<{ size: number, reduction: number } | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
            setResult(null);
            setError('');
        } else {
            setFile(null);
            setError('Please select a valid PDF file.');
        }
    };

    const handleCompress = async () => {
        if (!file) {
            setError('Please select a file first.');
            return;
        }
        setIsLoading(true);
        setResult(null);
        setError('');

        try {
            const pdfBytes = await file.arrayBuffer();
            const pdfDoc = await (window as any).pdfjsLib.getDocument({ data: pdfBytes }).promise;
            const numPages = pdfDoc.numPages;
            
            const compressedPdf = new jsPDF();
            if (numPages > 1) compressedPdf.deletePage(1);

            for (let i = 1; i <= numPages; i++) {
                const page = await pdfDoc.getPage(i);
                const viewport = page.getViewport({ scale: 1.5 });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({ canvasContext: context, viewport: viewport }).promise;
                const imgData = canvas.toDataURL('image/jpeg', quality);

                if (i > 1) compressedPdf.addPage();
                
                const { width, height } = compressedPdf.internal.pageSize;
                compressedPdf.setPage(i);
                compressedPdf.addImage(imgData, 'JPEG', 0, 0, width, height);
            }

            // FIX: Replace deprecated `getBlob()` with `output('blob')` to correctly generate a Blob from the jsPDF instance.
            const pdfBlob = compressedPdf.output('blob');
            const url = URL.createObjectURL(pdfBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `compressed_${file.name}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setResult({
                size: pdfBlob.size,
                reduction: 100 - (pdfBlob.size / file.size * 100)
            });

        } catch (err) {
            console.error(err);
            setError('An error occurred during compression. The PDF might be corrupted or password-protected.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Compress PDF</h2>
                <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">Reduce the file size of your PDF.</p>
                 <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">Note: This tool works best for PDFs with images. Text-only PDFs may increase in size.</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4 dark:bg-slate-800 dark:border-slate-700">
                <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--theme-primary-light)] file:text-[var(--theme-primary)] hover:file:opacity-90 dark:file:bg-slate-700 dark:file:text-sky-300 dark:text-slate-400"
                />
                
                {file && (
                    <div className="space-y-2">
                        <label htmlFor="quality" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Image Quality: {Math.round(quality * 100)}%</label>
                        <input id="quality" type="range" min="0.1" max="1" step="0.05" value={quality} onChange={e => setQuality(parseFloat(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700" />
                        <p className="text-xs text-slate-500 dark:text-slate-400">Lower quality means smaller file size.</p>
                    </div>
                )}
                
                {error && <p className="text-red-500 text-sm">{error}</p>}
                
                <button
                    onClick={handleCompress}
                    disabled={isLoading || !file}
                    className="w-full px-6 py-3 bg-[var(--theme-primary)] text-white font-semibold rounded-lg shadow-md hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center dark:disabled:bg-slate-600"
                >
                    {isLoading ? <><SpinnerIcon className="w-5 h-5 mr-2 animate-spin" /> Compressing...</> : 'Compress and Download'}
                </button>
            </div>

            {result && file && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center dark:bg-green-900/50 dark:border-green-800">
                    <h3 className="font-semibold text-green-800 dark:text-green-300">Compression Successful!</h3>
                    <p className="text-green-700 dark:text-green-400">
                        Original Size: {formatBytes(file.size)} | New Size: {formatBytes(result.size)}
                    </p>
                    <p className="text-lg font-bold text-green-800 dark:text-green-200">
                        Reduced by {result.reduction.toFixed(2)}%
                    </p>
                </div>
            )}
        </div>
    );
};

export default CompressPdf;