import React, { useState } from 'react';
import Tesseract from 'tesseract.js';
import { SpinnerIcon } from '../components/icons';

const PdfToText: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [text, setText] = useState('');
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
            setError('');
            setText('');
            setProgress(0);
            setStatus('');
        } else {
            setFile(null);
            setError('Please select a valid PDF file.');
        }
    };

    const handleExtract = async () => {
        if (!file) {
            setError('Please upload a PDF file first.');
            return;
        }
        setIsLoading(true);
        setError('');
        setText('');
        setProgress(0);

        try {
            const pdfBytes = await file.arrayBuffer();
            const pdfDoc = await (window as any).pdfjsLib.getDocument({ data: pdfBytes }).promise;
            const numPages = pdfDoc.numPages;
            let fullText = '';
            
            setStatus(`Loading PDF... (0/${numPages} pages)`);

            for (let i = 1; i <= numPages; i++) {
                const page = await pdfDoc.getPage(i);
                
                // Try getting text content directly first
                const textContent = await page.getTextContent();
                let pageText = textContent.items.map((item: any) => item.str).join(' ');

                // If text content is sparse, it might be a scanned PDF, so use OCR.
                if (pageText.trim().length < 50) { // Arbitrary threshold to detect scanned pages
                    setStatus(`Performing OCR on page ${i}/${numPages}...`);
                    const viewport = page.getViewport({ scale: 2.0 });
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    if (!context) continue;

                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    await page.render({ canvasContext: context, viewport: viewport }).promise;

                    const result = await Tesseract.recognize(
                        canvas.toDataURL(),
                        'eng',
                        {
                            logger: m => {
                                if (m.status === 'recognizing text') {
                                    const pageProgress = Math.round(m.progress * 100);
                                    const totalProgress = Math.round(((i - 1) / numPages * 100) + (pageProgress / numPages));
                                    setProgress(totalProgress);
                                }
                            }
                        }
                    );
                    pageText = result.data.text;
                } else {
                     // Update progress for text-based extraction
                     setProgress(Math.round((i / numPages) * 100));
                }
                
                fullText += `--- Page ${i} ---\n\n${pageText}\n\n`;
                setStatus(`Processed page ${i}/${numPages}`);
            }
            setText(fullText);

        } catch (err: any) {
            console.error(err);
            if (err.name === 'PasswordException') {
              setError('The PDF is password-protected. Please unlock it first.');
            } else {
              setError('An error occurred during text extraction. The PDF might be corrupted.');
            }
        } finally {
            setIsLoading(false);
            setProgress(100);
            if(!error) setStatus('Extraction Complete');
        }
    };

    return (
        <div className="space-y-6">
            <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">PDF to Text / OCR</h2>
                <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">Extract text from your PDF files. Works with both regular and scanned PDFs.</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4 dark:bg-slate-800 dark:border-slate-700">
                <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--theme-primary-light)] file:text-[var(--theme-primary)] hover:file:opacity-90 dark:file:bg-slate-700 dark:file:text-sky-300 dark:text-slate-400"
                />
                
                <button
                    onClick={handleExtract}
                    disabled={isLoading || !file}
                    className="w-full px-6 py-3 bg-[var(--theme-primary)] text-white font-semibold rounded-lg shadow-md hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center dark:disabled:bg-slate-600"
                >
                    {isLoading ? <><SpinnerIcon className="w-5 h-5 mr-2 animate-spin" /> Extracting...</> : 'Extract Text'}
                </button>
                {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
            
            {(isLoading || text) && (
                 <div className="space-y-2">
                    {isLoading && (
                        <div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-slate-700">
                                <div className="bg-[var(--theme-primary)] h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{status}</p>
                        </div>
                    )}
                    <textarea
                        readOnly
                        value={text}
                        placeholder="Extracted text will appear here..."
                        className="w-full h-96 p-4 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] transition-shadow duration-200 resize-none dark:bg-slate-800/50 dark:border-slate-700 dark:text-white"
                    />
                </div>
            )}
        </div>
    );
};

export default PdfToText;