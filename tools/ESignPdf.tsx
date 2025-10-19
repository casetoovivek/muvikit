import React, { useState, useRef, useCallback } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import SignatureCanvas from 'react-signature-canvas';
import { SpinnerIcon } from '../components/icons';

const ESignPdf: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [pdfPages, setPdfPages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const sigCanvas = useRef<any>({});

    const clearSignature = () => sigCanvas.current.clear();

    const renderPdf = useCallback(async (pdfFile: File) => {
        setIsLoading(true);
        try {
            const pdfBytes = await pdfFile.arrayBuffer();
            const pdfDoc = await (window as any).pdfjsLib.getDocument({ data: pdfBytes }).promise;
            const numPages = pdfDoc.numPages;
            const pages: string[] = [];

            for (let i = 1; i <= numPages; i++) {
                const page = await pdfDoc.getPage(i);
                const viewport = page.getViewport({ scale: 1.0 });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                await page.render({ canvasContext: context, viewport: viewport }).promise;
                pages.push(canvas.toDataURL());
            }
            setPdfPages(pages);
        } catch (err) {
            console.error(err);
            setError('Failed to render PDF preview.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
            setError('');
            renderPdf(selectedFile);
        } else {
            setFile(null);
            setPdfPages([]);
            setError('Please select a valid PDF file.');
        }
    };

    const handlePlaceSignature = async (pageIndex: number, event: React.MouseEvent<HTMLImageElement>) => {
        if (!file || sigCanvas.current.isEmpty()) {
            setError('Please provide a signature first.');
            return;
        }

        setIsLoading(true);
        try {
            const signatureImage = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
            
            const pdfBytes = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(pdfBytes);
            const page = pdfDoc.getPages()[pageIndex];

            const pngImage = await pdfDoc.embedPng(signatureImage);
            
            const { width, height } = page.getSize();
            const rect = (event.target as HTMLImageElement).getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width * width;
            const y = height - ((event.clientY - rect.top) / rect.height * height);

            page.drawImage(pngImage, {
                x: x - 50, // Center signature
                y: y - 25,
                width: 100,
                height: 50,
            });

            const signedPdfBytes = await pdfDoc.save();
            
            const blob = new Blob([signedPdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `signed_${file.name}`;
            a.click();
            URL.revokeObjectURL(url);

        } catch (err) {
            console.error(err);
            setError('Failed to place signature.');
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="space-y-6">
            <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">eSign PDF</h2>
                <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">Draw your signature and place it on your PDF document.</p>
            </div>

            {!file && (
                <div className="bg-white p-6 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                    <input type="file" accept="application/pdf" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--theme-primary-light)] file:text-[var(--theme-primary)] hover:file:opacity-90 dark:file:bg-slate-700 dark:file:text-sky-300 dark:text-slate-400" />
                </div>
            )}

            {error && <p className="text-red-500">{error}</p>}
            
            {isLoading && <div className="flex justify-center items-center p-8"><SpinnerIcon className="w-8 h-8 animate-spin text-[var(--theme-primary)]"/></div>}

            {file && !isLoading && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4 max-h-[70vh] overflow-y-auto p-2 bg-slate-100 dark:bg-slate-900 rounded-lg">
                        <p className="text-center font-semibold text-slate-600 dark:text-slate-300">Click on a page to place your signature</p>
                        {pdfPages.map((pageDataUrl, index) => (
                            <img
                                key={index}
                                src={pageDataUrl}
                                alt={`Page ${index + 1}`}
                                className="w-full h-auto border shadow-md cursor-pointer hover:ring-2 hover:ring-[var(--theme-primary)]"
                                onClick={(e) => handlePlaceSignature(index, e)}
                            />
                        ))}
                    </div>
                    <div className="space-y-4">
                        <div className="bg-white p-4 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                            <h3 className="font-semibold text-slate-800 mb-2 dark:text-slate-200">Draw Your Signature Here</h3>
                            <div className="bg-slate-50 border rounded-md dark:bg-slate-700 dark:border-slate-600">
                                <SignatureCanvas
                                    ref={sigCanvas}
                                    penColor='black'
                                    canvasProps={{ className: 'w-full h-48' }}
                                />
                            </div>
                            <button onClick={clearSignature} className="text-sm text-slate-500 hover:underline mt-2 dark:text-slate-400">Clear</button>
                        </div>
                         <button onClick={() => { setFile(null); setPdfPages([]); }} className="w-full px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 transition-colors dark:bg-slate-600 dark:hover:bg-slate-500">
                           Change PDF
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ESignPdf;
