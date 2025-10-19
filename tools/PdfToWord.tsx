import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import Tesseract from 'tesseract.js';
import { SpinnerIcon } from '../components/icons';

declare global {
    interface Window {
        htmlToDocx: any;
    }
}

const PdfToWord: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
            setError('');
            setStatus('');
        } else {
            setFile(null);
            setError('Please select a valid PDF file.');
        }
    };

    const simpleMarkdownToHtml = (markdown: string) => {
        return markdown
            .split('\n')
            .map(line => {
                if (line.startsWith('### ')) return `<h3>${line.substring(4)}</h3>`;
                if (line.startsWith('## ')) return `<h2>${line.substring(3)}</h2>`;
                if (line.startsWith('# ')) return `<h1>${line.substring(2)}</h1>`;
                if (line.startsWith('* ')) return `<ul><li>${line.substring(2)}</li></ul>`; // Simplistic list
                if (line.trim() === '') return '<br />';
                return `<p>${line}</p>`;
            })
            .join('');
    };

    const handleConvert = async () => {
        if (!file) {
            setError('Please upload a PDF file first.');
            return;
        }
        setIsLoading(true);
        setError('');
        
        try {
            // 1. Extract text using PDF.js and Tesseract OCR as a fallback
            setStatus('Step 1/3: Extracting text from PDF...');
            const pdfBytes = await file.arrayBuffer();
            const pdfDoc = await (window as any).pdfjsLib.getDocument({ data: pdfBytes }).promise;
            const numPages = pdfDoc.numPages;
            let fullText = '';

            for (let i = 1; i <= numPages; i++) {
                const page = await pdfDoc.getPage(i);
                const textContent = await page.getTextContent();
                let pageText = textContent.items.map((item: any) => item.str).join(' ');

                if (pageText.trim().length < 50) { // Likely a scanned page
                    const viewport = page.getViewport({ scale: 1.5 });
                    const canvas = document.createElement('canvas');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    const context = canvas.getContext('2d');
                    if(context) {
                         await page.render({ canvasContext: context, viewport: viewport }).promise;
                         const result = await Tesseract.recognize(canvas, 'eng');
                         pageText = result.data.text;
                    }
                }
                fullText += pageText + '\n\n';
            }

            // 2. Use Gemini AI to format the text
            setStatus('Step 2/3: AI is formatting the document...');
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `Given the following raw text extracted from a PDF, please re-format it into a clean, well-structured document using simple Markdown. Preserve headings, paragraphs, lists, and tables as best as you can. Do not add any commentary, just return the formatted text. Text: """${fullText}"""`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            const formattedMarkdown = response.text;

            // 3. Convert formatted text (Markdown -> HTML -> DOCX) and download
            setStatus('Step 3/3: Generating .docx file...');
            const htmlContent = simpleMarkdownToHtml(formattedMarkdown);
            const blob = await window.htmlToDocx(htmlContent, null, {
                table: { row: { cantSplit: true } },
                footer: false,
                header: false,
            });

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${file.name.replace('.pdf', '')}.docx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

        } catch (err: any) {
            console.error(err);
            setError(`Conversion failed: ${err.message}. Please try again.`);
        } finally {
            setIsLoading(false);
            setStatus('');
        }
    };

    return (
        <div className="space-y-6">
            <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">AI-Powered PDF to Word</h2>
                <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">Convert PDFs, including scanned ones, to editable Word documents using AI.</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4 dark:bg-slate-800 dark:border-slate-700">
                <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--theme-primary-light)] file:text-[var(--theme-primary)] hover:file:opacity-90 dark:file:bg-slate-700 dark:file:text-sky-300 dark:text-slate-400"
                />
                
                {file && <p className="text-sm text-slate-600 dark:text-slate-300">Selected file: {file.name}</p>}
                
                <button
                    onClick={handleConvert}
                    disabled={isLoading || !file}
                    className="w-full px-6 py-3 bg-[var(--theme-primary)] text-white font-semibold rounded-lg shadow-md hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center dark:disabled:bg-slate-600"
                >
                    {isLoading ? <><SpinnerIcon className="w-5 h-5 mr-2 animate-spin" /> {status || 'Converting...'}</> : 'Convert to Word and Download'}
                </button>
                 {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>
        </div>
    );
};

export default PdfToWord;
