import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { SpinnerIcon, SearchIcon } from '../components/icons';

// --- MARKDOWN RENDERER (Adapted for financial data) ---
const MarkdownRenderer = ({ text }: { text: string }) => {
    const lines = text.split('\n');
    const elements: React.ReactElement[] = [];
    let listItems: React.ReactElement[] = [];

    const flushList = () => {
        if (listItems.length > 0) {
            elements.push(<ul key={`ul-${elements.length}`} className="list-disc pl-6 mb-4 space-y-1">{listItems}</ul>);
            listItems = [];
        }
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Table handling
        if (line.trim().startsWith('|')) {
            flushList();
            const tableLines = [];
            let temp_i = i;
            while (temp_i < lines.length && lines[temp_i].trim().startsWith('|')) {
                tableLines.push(lines[temp_i]);
                temp_i++;
            }
            
            if (tableLines.length > 0) {
                const isSeparatorRow = (row: string) => row.trim().match(/^\|(?:\s*:?-+:?\s*\|)+$/);
                
                let headerCells: string[] = [];
                const bodyRows: React.ReactElement[] = [];
                let hasHeader = false;
                let startIndex = 0;

                if (tableLines.length > 1 && isSeparatorRow(tableLines[1])) {
                    hasHeader = true;
                    headerCells = tableLines[0].trim().slice(1, -1).split('|').map(c => c.trim());
                    startIndex = 2;
                }
                
                for (let j = startIndex; j < tableLines.length; j++) {
                    const cells = tableLines[j].trim().slice(1, -1).split('|').map(c => c.trim());
                    bodyRows.push(
                        <tr key={`tr-${i}-${j}`} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                            {cells.map((cell, cellIndex) => (
                                <td key={cellIndex} className={`p-2.5 ${cellIndex === 0 ? 'font-medium text-slate-700 dark:text-slate-300' : 'text-right font-mono'}`}>{cell}</td>
                            ))}
                        </tr>
                    );
                }

                elements.push(
                    <div key={`table-wrapper-${i}`} className="overflow-x-auto my-4 rounded-lg border border-slate-200 dark:border-slate-700">
                        <table key={`table-${i}`} className="w-full border-collapse text-sm">
                            {hasHeader && (
                                <thead key={`thead-${i}`} className="bg-slate-100 dark:bg-slate-700">
                                    <tr key={`tr-header-${i}`}>
                                        {headerCells.map((cell, cellIndex) => (
                                            <th key={cellIndex} className={`p-2.5 font-semibold ${cellIndex > 0 ? 'text-right' : 'text-left'}`}>{cell}</th>
                                        ))}
                                    </tr>
                                </thead>
                            )}
                            <tbody key={`tbody-${i}`}>{bodyRows}</tbody>
                        </table>
                    </div>
                );
                i = temp_i - 1;
                continue;
            }
        }
        
        // List items
        if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
            listItems.push(<li key={i} className="text-slate-700 dark:text-slate-300">{line.trim().substring(2)}</li>);
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
                <p key={i} className="mb-2 text-slate-700 dark:text-slate-300 leading-relaxed">
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

    return <div className="prose prose-slate dark:prose-invert max-w-none">{elements}</div>;
};


// --- MAIN COMPONENT ---
const StockScreener: React.FC = () => {
    const [query, setQuery] = useState('TATA MOTORS');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [data, setData] = useState<string>('');

    const handleAnalyze = async () => {
        if (!query.trim()) {
            setError('Please enter a stock, index, or forex pair.');
            return;
        }
        setIsLoading(true);
        setError('');
        setData('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `
                You are a sophisticated financial data API. For the stock symbol "${query}", use your real-time search capabilities to provide a comprehensive, detailed financial analysis similar to screener.in.
                Structure your entire response using clear Markdown. Do not include any text, explanations, or code block syntax before or after the main Markdown content.
                Include the following sections with clear Markdown headings (e.g., "## Key Metrics"):
                1. A one-paragraph "About" section describing the company.
                2. "Key Metrics": A Markdown table with two columns for the metric name and its value (e.g., | Market Cap | ₹ 1,23,456 Cr. |).
                3. "Pros": A bulleted list.
                4. "Cons": A bulleted list.
                5. "Peer Comparison": A Markdown table.
                6. "Quarterly Results": A Markdown table.
                7. "Profit & Loss": A Markdown table.
                8. "Balance Sheet": A Markdown table.
                9. "Cash Flows": A Markdown table.
                10. "Shareholding Pattern": A Markdown table.
                11. "Latest News & Announcements": A bulleted list.
                Ensure all financial data is presented in Markdown tables for clarity.
            `;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: { tools: [{ googleSearch: {} }] },
            });
            
            setData(response.text);
        } catch (err) {
            console.error(err);
            setError(`Failed to analyze "${query}". The symbol might be incorrect, data unavailable, or the AI response was invalid. Please try again.`);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="space-y-6">
            <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">AI Stock Screener</h2>
                <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">Deep analysis of any stock, index, or forex pair with real-time, AI-powered data.</p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                <div className="flex flex-col sm:flex-row gap-4">
                    <input type="text" value={query} onChange={(e) => setQuery(e.target.value.toUpperCase())} placeholder="Enter Stock Symbol (e.g., RELIANCE, NIFTY 50, EURUSD)" className="flex-grow w-full px-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-[var(--theme-primary)] dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                    <button onClick={handleAnalyze} disabled={isLoading} className="px-5 py-2 bg-[var(--theme-primary)] text-white font-semibold rounded-lg shadow-md hover:opacity-90 disabled:bg-gray-400 flex items-center justify-center dark:disabled:bg-slate-600">
                        {isLoading ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : <SearchIcon className="w-5 h-5" />}
                        <span className="ml-2">{isLoading ? 'Analyzing...' : 'Analyze'}</span>
                    </button>
                </div>
                {error && <p className="text-red-600 dark:text-red-400 text-sm mt-2">{error}</p>}
            </div>

            {isLoading && <div className="flex justify-center items-center h-64"><SpinnerIcon className="w-10 h-10 animate-spin text-[var(--theme-primary)]" /></div>}

            {data && (
                <div className="bg-white p-6 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                    <MarkdownRenderer text={data} />
                </div>
            )}
        </div>
    );
};

export default StockScreener;