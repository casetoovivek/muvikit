import React, { useState, useRef, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { jsPDF } from 'jspdf';
// FIX: Changed import to use jspdf-autotable as a function and removed module augmentation, resolving a module not found error.
import autoTable from 'jspdf-autotable';
import { SpinnerIcon, PdfFileIcon, ExcelFileIcon } from '../components/icons';

// jsPDF-autotable ke liye type definition
// FIX: Removed module augmentation which was causing a 'module not found' error. The functional import of autoTable makes this unnecessary.

// XLSX global script se aata hai
declare global {
    interface Window {
        XLSX: any;
        mammoth: any;
        pptx: any;
    }
}

const UniversalFileAnalyzer: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [analysisResult, setAnalysisResult] = useState('');
    const [summarizedData, setSummarizedData] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'analysis' | 'summary'>('analysis');
    const [status, setStatus] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const resetState = () => {
        setFile(null);
        setIsLoading(false);
        setError('');
        setAnalysisResult('');
        setSummarizedData([]);
        setActiveTab('analysis');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        resetState();

        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
            setError('File is too large. Please upload a file smaller than 10MB.');
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setFile(selectedFile);
    };
    
    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = error => reject(error);
        });
    };

    const handleAnalyze = async () => {
        if (!file) {
            setError('Please upload a file first.');
            return;
        }
        setIsLoading(true);
        setError('');
        setAnalysisResult('');
        setSummarizedData([]);
        setActiveTab('analysis');

        try {
            const fileType = file.type;
            const fileName = file.name;
            let contentForAI: { text: string } | { inlineData: { mimeType: string; data: string } };
            let analysisPrompt: string;
            const isOfficeDoc = fileName.endsWith('.docx') || fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.pptx');

            if (fileType.startsWith('image/') || fileType === 'application/pdf') {
                setStatus(`Reading ${fileType.split('/')[0]} file...`);
                const base64Data = await fileToBase64(file);
                contentForAI = { inlineData: { mimeType: fileType, data: base64Data } };
                analysisPrompt = `You are an expert file analyst. Analyze the attached file named '${fileName}'.`;

            } else if (isOfficeDoc || fileType.startsWith('text/')) {
                let extractedText = '';
                const arrayBuffer = await file.arrayBuffer();
                
                if (fileName.endsWith('.docx')) {
                    setStatus('Extracting text from Word document...');
                    const result = await window.mammoth.extractRawText({ arrayBuffer });
                    extractedText = result.value;
                } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
                    setStatus('Extracting text from Excel spreadsheet...');
                    const workbook = window.XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
                    workbook.SheetNames.forEach((sheetName: string) => {
                        const worksheet = workbook.Sheets[sheetName];
                        const csvText = window.XLSX.utils.sheet_to_csv(worksheet);
                        extractedText += `--- Sheet: ${sheetName} ---\n${csvText}\n\n`;
                    });
                } else if (fileName.endsWith('.pptx')) {
                    setStatus('Extracting text from PowerPoint presentation...');
                    const pptx = new window.pptx();
                    const presentation = await pptx.load(file);
                    for (const slide of presentation.slides) {
                        extractedText += `--- Slide ${slide.number} ---\n`;
                        for (const element of slide.elements) {
                            if (element.type === 'text') {
                                extractedText += element.text + '\n';
                            }
                        }
                        extractedText += '\n';
                    }
                } else { // Plain text
                    setStatus('Reading text file...');
                    extractedText = await file.text();
                }

                if (!extractedText.trim()) {
                    throw new Error("Could not extract any text from the document. It might be empty or in an unsupported format.");
                }

                contentForAI = { text: `File Content:\n"""\n${extractedText}\n"""` };
                analysisPrompt = `You are an expert file analyst. Analyze the following text content extracted from a file named '${fileName}'.`;

            } else {
                throw new Error(`Unsupported file type: ${fileType || 'unknown'}. This tool currently supports images, PDFs, text, and standard office documents.`);
            }

            // --- Common Gemini Call Logic ---
            setStatus('Asking AI for analysis...');
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

            const schema = {
              type: Type.OBJECT,
              properties: {
                analysisReport: { type: Type.STRING, description: 'A detailed, well-organized analysis of the file content in Markdown format.' },
                hasSummarizableData: { type: Type.BOOLEAN, description: 'Set to true only if the file contains clear numerical, tabular, or financial data (like an invoice, sales report, CSV with numbers) that can be summarized into a table.' },
                summarizedData: { type: Type.STRING, description: 'If hasSummarizableData is true, extract the key data and return it as a JSON string representing an array of objects. Each object is a row. Use concise keys for object keys that will make sense as table headers (e.g., "Item", "Quantity", "Amount"). If no summarizable data is found, return an empty JSON array string, i.e., "[]".' }
              },
              required: ['analysisReport', 'hasSummarizableData', 'summarizedData']
            };

            const fullPrompt = `${analysisPrompt}
            1. Provide a detailed analysis in Markdown format for the 'analysisReport' field.
            2. Examine the file for any tabular, numerical, or financial data.
            3. If such data exists, set 'hasSummarizableData' to true and populate the 'summarizedData' field with a JSON string representing an array of objects.
            4. If no such data exists, set 'hasSummarizableData' to false and provide an empty JSON array string "[]" for 'summarizedData'.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: { parts: [ contentForAI as any, { text: fullPrompt } ] },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: schema,
                }
            });

            const result = JSON.parse(response.text);

            setAnalysisResult(result.analysisReport || 'No analysis was generated.');
            if (result.hasSummarizableData && result.summarizedData) {
                try {
                    const parsedSummary = JSON.parse(result.summarizedData);
                    if (Array.isArray(parsedSummary) && parsedSummary.length > 0) {
                        setSummarizedData(parsedSummary);
                        setActiveTab('summary');
                    } else {
                        setSummarizedData([]);
                    }
                } catch (e) {
                    console.error("Failed to parse summarizedData JSON string:", e);
                    setSummarizedData([]);
                }
            } else {
                setSummarizedData([]);
            }

        } catch (e: any) {
            setError(e.message || 'An error occurred during analysis.');
            console.error(e);
        } finally {
            setIsLoading(false);
            setStatus('');
        }
    };


    const handleExportPdf = () => {
        if (summarizedData.length === 0) return;

        const doc = new jsPDF();
        const head = [Object.keys(summarizedData[0])];
        // FIX: Explicitly convert each cell to a string using a map function `(cell) => String(cell)` instead of passing `String` directly. This avoids potential type ambiguity and ensures all data passed to the PDF generator is in the correct format.
        const body = summarizedData.map(row => Object.values(row).map(cell => String(cell)));

        doc.text("Summarized Data", 14, 15);
        // FIX: Changed doc.autoTable to autoTable(doc, ...) to match the modern functional usage of jspdf-autotable.
        autoTable(doc, {
            startY: 20,
            head: head,
            body: body,
            theme: 'grid',
            headStyles: { fillColor: [13, 62, 128] }
        });

        doc.save('summarized-data.pdf');
    };

    const handleExportExcel = () => {
        if (summarizedData.length === 0) return;
        const ws = window.XLSX.utils.json_to_sheet(summarizedData);
        const wb = window.XLSX.utils.book_new();
        window.XLSX.utils.book_append_sheet(wb, ws, "Summary");
        window.XLSX.writeFile(wb, "summarized-data.xlsx");
    };
    
    // Simple Markdown Renderer Component
    const MarkdownRenderer = ({ text }: { text: string }) => {
        const lines = text.split('\n');
        const elements: React.ReactElement[] = [];
        let listItems: React.ReactElement[] = [];
    
        const flushList = () => {
            if (listItems.length > 0) {
                elements.push(<ul key={`ul-${elements.length}`} className="list-disc pl-6 mb-4">{listItems}</ul>);
                listItems = [];
            }
        };
    
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
    
            // ... (rest of the Markdown renderer logic)
            // List items
            if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
                listItems.push(<li key={i} className="mb-1">{line.trim().substring(2)}</li>);
                continue;
            }
    
            flushList();
    
            // Headings and paragraphs
            if (line.startsWith('### ')) {
                elements.push(<h3 key={i} className="text-lg font-semibold mt-4 mb-2 text-slate-800 dark:text-slate-200">{line.substring(4)}</h3>);
            } else if (line.startsWith('## ')) {
                elements.push(<h2 key={i} className="text-xl font-bold mt-6 mb-3 text-slate-800 dark:text-slate-200 border-b pb-1 dark:border-slate-600">{line.substring(3)}</h2>);
            } else if (line.startsWith('# ')) {
                elements.push(<h1 key={i} className="text-2xl font-extrabold mt-8 mb-4 text-slate-900 dark:text-slate-100 border-b-2 pb-2 dark:border-slate-500">{line.substring(2)}</h1>);
            } else if (line.trim() !== '') {
                const parts = line.split(/(\*\*.*?\*\*|`.*?`)/g).filter(Boolean);
                elements.push(
                    <p key={i} className="mb-2 text-slate-700 dark:text-slate-300">
                        {parts.map((part, partIndex) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                                return <strong key={partIndex}>{part.substring(2, part.length - 2)}</strong>;
                            }
                            if (part.startsWith('`') && part.endsWith('`')) {
                                return <code key={partIndex} className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-sm font-mono">{part.substring(1, part.length - 1)}</code>;
                            }
                            return part;
                        })}
                    </p>
                );
            }
        }
    
        flushList();
    
        return <div>{elements}</div>;
    };


    return (
        <div className="space-y-6">
            <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Universal File Analyzer</h2>
                <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">Let AI analyze your documents, spreadsheets, presentations, and images to provide detailed insights.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="space-y-4">
                    <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4 dark:bg-slate-800 dark:border-slate-700">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">1. Upload your file</h3>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--theme-primary-light)] file:text-[var(--theme-primary)] hover:file:opacity-90 dark:file:bg-slate-700 dark:file:text-sky-300 dark:text-slate-400"
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400">Supports: PDF, DOC/X, XLS/X, PPT/X, TXT, CSV, Images, and more. Max size: 10MB.</p>
                         {file && (
                            <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-900 rounded-lg text-center border-2 border-dashed border-slate-300 dark:border-slate-600">
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">File Ready for Analysis:</p>
                                <p className="text-md font-semibold text-slate-800 dark:text-slate-100">{file.name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">({(file.size / 1024).toFixed(2)} KB)</p>
                                <button onClick={resetState} className="mt-2 text-xs text-red-500 hover:underline">Clear</button>
                            </div>
                        )}
                    </div>
                     <button
                        onClick={handleAnalyze}
                        disabled={isLoading || !file}
                        className="w-full px-6 py-3 bg-[var(--theme-primary)] text-white font-semibold rounded-lg shadow-md hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center dark:disabled:bg-slate-600"
                    >
                        {isLoading ? <><SpinnerIcon className="w-5 h-5 mr-2 animate-spin" /> {status || 'Analyzing...'}</> : '2. Analyze with AI'}
                    </button>
                    {error && <p className="mt-2 text-red-600 dark:text-red-400 text-sm">{error}</p>}
                </div>

                <div className="bg-white p-6 rounded-lg border border-slate-200 min-h-[20rem] dark:bg-slate-800 dark:border-slate-700">
                    <div className="border-b border-slate-200 dark:border-slate-700 mb-4">
                        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                            <button onClick={() => setActiveTab('analysis')} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'analysis' ? 'border-[var(--theme-primary)] text-[var(--theme-primary)] dark:border-sky-400 dark:text-sky-400' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200'}`}>
                                3. AI Analysis Report
                            </button>
                            <button onClick={() => setActiveTab('summary')} disabled={summarizedData.length === 0} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm disabled:cursor-not-allowed disabled:text-slate-400 dark:disabled:text-slate-600 ${activeTab === 'summary' ? 'border-[var(--theme-primary)] text-[var(--theme-primary)] dark:border-sky-400 dark:text-sky-400' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200'}`}>
                                4. Summarized Data
                            </button>
                        </nav>
                    </div>

                    {isLoading && (
                        <div className="flex flex-col items-center justify-center h-full pt-12">
                            <SpinnerIcon className="w-10 h-10 animate-spin text-[var(--theme-primary)]" />
                            <p className="mt-4 text-slate-500 dark:text-slate-400">{status || 'AI is analyzing your file...'}</p>
                        </div>
                    )}

                    {!isLoading && activeTab === 'analysis' && (
                        analysisResult ? (
                            <div className="max-h-96 overflow-y-auto pr-2"><MarkdownRenderer text={analysisResult} /></div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full pt-12 text-center">
                                <p className="text-slate-500 dark:text-slate-400">Your analysis report will appear here after processing.</p>
                            </div>
                        )
                    )}
                    
                    {!isLoading && activeTab === 'summary' && (
                        summarizedData.length > 0 ? (
                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button onClick={handleExportPdf} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold bg-red-100 text-red-700 rounded-md hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900">
                                        <PdfFileIcon className="w-5 h-5"/> Export as PDF
                                    </button>
                                    <button onClick={handleExportExcel} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold bg-green-100 text-green-700 rounded-md hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-900">
                                        <ExcelFileIcon className="w-5 h-5"/> Export as Excel
                                    </button>
                                </div>
                                <div className="max-h-80 overflow-auto border rounded-lg dark:border-slate-700">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300 sticky top-0">
                                            <tr>
                                                {Object.keys(summarizedData[0]).map(header => <th key={header} className="px-4 py-2">{header}</th>)}
                                            </tr>
                                        </thead>
                                        <tbody className="dark:text-slate-300">
                                            {summarizedData.map((row, rowIndex) => (
                                                <tr key={rowIndex} className="bg-white border-b hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700/50">
                                                    {Object.values(row).map((cell: any, cellIndex) => <td key={cellIndex} className="px-4 py-2">{String(cell)}</td>)}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                             <div className="flex flex-col items-center justify-center h-full pt-12 text-center">
                                <p className="text-slate-500 dark:text-slate-400">No summarizable data was found in this file.</p>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default UniversalFileAnalyzer;