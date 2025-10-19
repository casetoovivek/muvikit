import React, { useState } from 'react';
import jsPDF from 'jspdf';

const PdfCreator: React.FC = () => {
    const [text, setText] = useState('');
    const [fileName, setFileName] = useState('document.pdf');

    const createPdf = () => {
        if (!text.trim()) return;

        const doc = new jsPDF();
        
        // Add text, auto-managing line breaks.
        const splitText = doc.splitTextToSize(text, 180);
        doc.text(splitText, 15, 20);
        
        doc.save(fileName || 'document.pdf');
    };

    return (
        <div className="space-y-6">
            <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Simple PDF Creator</h2>
                <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">Type or paste text below to create a basic PDF document.</p>
            </div>

            <div className="space-y-4">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Start writing your content here..."
                    className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] transition-shadow duration-200 resize-none dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
                />
                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        placeholder="Filename.pdf"
                        className="block w-full sm:w-64 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    />
                    <button
                        onClick={createPdf}
                        disabled={!text.trim()}
                        className="px-6 py-2 bg-[var(--theme-primary)] text-white font-semibold rounded-lg shadow-md hover:opacity-90 disabled:bg-gray-400 transition-colors dark:disabled:bg-slate-600"
                    >
                        Create and Download PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PdfCreator;
