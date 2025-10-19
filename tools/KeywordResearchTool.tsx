import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { SpinnerIcon } from '../components/icons';

declare global {
    interface Window {
        XLSX: any;
    }
}

interface KeywordData {
    keyword: string;
    searchVolume: string; // Changed to string to accommodate ranges like "10k - 25k"
    salesPotential: 'Low' | 'Medium' | 'High';
    competition: 'Low' | 'Medium' | 'High';
    trending: 'Yes' | 'No' | 'Stable'; // New field for real-time trend analysis
}

const KeywordResearchTool: React.FC = () => {
    const [keyword, setKeyword] = useState('eco-friendly yoga mat');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [results, setResults] = useState<KeywordData[]>([]);

    const handleResearch = async () => {
        if (!keyword.trim()) {
            setError('Please enter a keyword to research.');
            return;
        }
        setIsLoading(true);
        setError('');
        setResults([]);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `
                Act as an expert e-commerce market research analyst, similar to tools like Helium 10.
                Use your search capabilities to find the most current, real-time data available.
                For the primary product keyword "${keyword}", generate a list of 15 related, long-tail keywords that an online seller would find valuable.

                For each keyword, provide the following information in a valid JSON array format. Do not include any text, code block markers, or explanations before or after the JSON array itself.
                1. "keyword": The keyword phrase.
                2. "searchVolume": An estimated monthly search volume range based on current data (e.g., "10k - 25k", "500 - 1k").
                3. "salesPotential": A score of 'Low', 'Medium', or 'High' based on commercial intent.
                4. "competition": A score of 'Low', 'Medium', or 'High' based on the number of existing sellers/products.
                5. "trending": Indicate if the keyword is currently trending up ('Yes'), trending down ('No'), or 'Stable', based on recent search data.

                Your entire response must be only the JSON array.
            `;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    tools: [{ googleSearch: {} }],
                },
            });

            let jsonString = response.text;
            
            // Clean potential markdown code blocks from the response string
            if (jsonString.startsWith('```json')) {
                jsonString = jsonString.substring(7, jsonString.length - 3).trim();
            } else if (jsonString.startsWith('```')) {
                jsonString = jsonString.substring(3, jsonString.length - 3).trim();
            }

            const parsedResults = JSON.parse(jsonString);
            setResults(parsedResults);

        } catch (err) {
            setError('An error occurred during research. The AI might be busy, the response format was incorrect, or the request could not be fulfilled. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const exportToExcel = () => {
        const ws = window.XLSX.utils.json_to_sheet(results.map(r => ({
            'Keyword': r.keyword,
            'Monthly Search Volume': r.searchVolume,
            'Sales Potential': r.salesPotential,
            'Competition': r.competition,
            'Trending': r.trending,
        })));
        const wb = window.XLSX.utils.book_new();
        window.XLSX.utils.book_append_sheet(wb, ws, "Keywords");
        window.XLSX.writeFile(wb, `keyword-research-${keyword}.xlsx`);
    };
    
    const getBadgeColor = (level: 'Low' | 'Medium' | 'High') => {
        switch(level) {
            case 'Low': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
            case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
            case 'High': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
            default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
        }
    };
    
    const getTrendingBadgeColor = (level: 'Yes' | 'No' | 'Stable') => {
        switch(level) {
            case 'Yes': return 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300';
            case 'No': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300';
            case 'Stable': return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
            default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
        }
    };

    return (
        <div className="space-y-6">
            <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">AI Keyword Research Tool</h2>
                <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">Discover valuable keywords for your products and export the insights.</p>
                 <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
                    Data is AI-estimated based on recent Google Search trends to provide real-time insights.
                </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4 dark:bg-slate-800 dark:border-slate-700">
                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="Enter a product or keyword..."
                        className="flex-grow block w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
                    />
                    <button
                        onClick={handleResearch}
                        disabled={isLoading}
                        className="px-6 py-2 bg-[var(--theme-primary)] text-white font-semibold rounded-lg shadow-md hover:opacity-90 disabled:bg-gray-400 dark:disabled:bg-slate-600 flex items-center justify-center"
                    >
                        {isLoading ? <><SpinnerIcon className="w-5 h-5 mr-2 animate-spin" /> Researching...</> : 'Research Keywords'}
                    </button>
                </div>
                {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}
            </div>

            {isLoading && (
                 <div className="flex justify-center items-center h-64"><SpinnerIcon className="w-10 h-10 animate-spin text-[var(--theme-primary)]" /></div>
            )}
            
            {results.length > 0 && (
                <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4 dark:bg-slate-800 dark:border-slate-700">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Research Results</h3>
                        <button onClick={exportToExcel} className="px-3 py-1.5 text-sm font-semibold bg-green-100 text-green-700 rounded-md hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300">Export to Excel</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                                <tr>
                                    <th className="px-6 py-3">Keyword</th>
                                    <th className="px-6 py-3">Search Volume (Monthly)</th>
                                    <th className="px-6 py-3">Sales Potential</th>
                                    <th className="px-6 py-3">Competition</th>
                                    <th className="px-6 py-3">Trending</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map(r => (
                                    <tr key={r.keyword} className="bg-white border-b hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700/50">
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{r.keyword}</td>
                                        <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-300">{r.searchVolume}</td>
                                        <td className="px-6 py-4"><span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getBadgeColor(r.salesPotential)}`}>{r.salesPotential}</span></td>
                                        <td className="px-6 py-4"><span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getBadgeColor(r.competition)}`}>{r.competition}</span></td>
                                        <td className="px-6 py-4"><span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getTrendingBadgeColor(r.trending)}`}>{r.trending}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KeywordResearchTool;