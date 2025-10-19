import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { SpinnerIcon, SearchIcon } from '../components/icons';

// --- DATA INTERFACES ---
interface TrendData {
  interestOverTime: { date: string; value: number }[];
  interestByRegion: { region: string; value: number }[];
  topRelatedQueries: { query: string; value: string }[];
  risingRelatedQueries: { query: string; value: string }[];
}

// --- SVG LINE CHART COMPONENT ---
const LineChart: React.FC<{ data: { date: string, value: number }[] }> = ({ data }) => {
    const width = 500;
    const height = 200;
    const padding = 30;

    if (data.length === 0) return null;

    const points = data.map((point, i) => {
        const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
        const y = height - padding - (point.value / 100) * (height - padding * 2);
        return `${x},${y}`;
    }).join(' ');

    const areaPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
            {/* Y-Axis labels and grid lines */}
            {[0, 25, 50, 75, 100].map(val => (
                <g key={val}>
                    <text x={padding - 5} y={height - padding - (val / 100) * (height - padding * 2)} textAnchor="end" alignmentBaseline="middle" fontSize="10" className="fill-slate-400">{val}</text>
                    <line x1={padding} y1={height - padding - (val / 100) * (height - padding * 2)} x2={width - padding} y2={height - padding - (val / 100) * (height - padding * 2)} className="stroke-slate-200 dark:stroke-slate-700" strokeWidth="1" />
                </g>
            ))}

             {/* Area Gradient */}
            <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--theme-primary)" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="var(--theme-primary)" stopOpacity="0" />
                </linearGradient>
            </defs>
            <polygon points={areaPoints} fill="url(#areaGradient)" />

            {/* Main Line */}
            <polyline points={points} fill="none" stroke="var(--theme-primary)" strokeWidth="2" />

            {/* X-Axis labels */}
            <text x={padding} y={height - padding + 15} textAnchor="start" fontSize="10" className="fill-slate-500 dark:fill-slate-400">{data[0].date}</text>
            <text x={width-padding} y={height - padding + 15} textAnchor="end" fontSize="10" className="fill-slate-500 dark:fill-slate-400">{data[data.length-1].date}</text>
        </svg>
    );
};

// --- TREND TABLE COMPONENT ---
const TrendTable: React.FC<{ title: string, data: { query?: string, region?: string, value: string | number }[] }> = ({ title, data }) => (
    <div className="bg-white p-4 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
        <h3 className="text-md font-bold text-slate-800 dark:text-slate-200 mb-3">{title}</h3>
        <ul className="space-y-2 text-sm">
            {data.map((item, index) => (
                <li key={index} className="flex justify-between items-center gap-4">
                    <span className="text-slate-700 dark:text-slate-300 truncate">{item.query || item.region}</span>
                    <span className="font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">{typeof item.value === 'number' ? `${item.value}/100` : item.value}</span>
                </li>
            ))}
        </ul>
    </div>
);

// --- MAIN DASHBOARD COMPONENT ---
const GoogleTrendsExplorer: React.FC = () => {
    const [keyword, setKeyword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [trendData, setTrendData] = useState<TrendData | null>(null);

    const handleSearch = async () => {
        if (!keyword.trim()) {
            setError('Please enter a topic or keyword.');
            return;
        }
        setIsLoading(true);
        setError('');
        setTrendData(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `
                Act as a Google Trends analyst. Using your real-time search capabilities, provide a trend analysis for the keyword "${keyword}".
                Return the data in a valid JSON object with the following structure, and nothing else:
                {
                  "interestOverTime": [ an array of 12 objects, each with "date" (e.g., "Jan '24") and "value" (a number from 0-100) representing monthly interest over the last year ],
                  "interestByRegion": [ an array of the top 5 objects, each with "region" (string) and "value" (a number from 0-100) ],
                  "topRelatedQueries": [ an array of the top 5 objects, each with "query" (string) and "value" (a string like "100" or "90") ],
                  "risingRelatedQueries": [ an array of the top 5 objects, each with "query" (string) and "value" (a percentage string like "+1,250%" or "Breakout") ]
                }
                Do not include any introductory text, explanations, or markdown code block syntax.
            `;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: { tools: [{ googleSearch: {} }] }
            });

            const parsedData = JSON.parse(response.text);
            setTrendData(parsedData);
        } catch (err) {
            console.error(err);
            setError("Failed to fetch trend data. The AI may be busy or the topic may not have enough data. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="space-y-6">
            <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Google Trends Explorer</h2>
                <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">Get real-time insights into search trends for any keyword.</p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="Enter a search term (e.g., 'AI startups')"
                        className="flex-grow w-full px-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    />
                    <button onClick={handleSearch} disabled={isLoading} className="px-5 py-2 bg-[var(--theme-primary)] text-white font-semibold rounded-lg shadow-md hover:opacity-90 disabled:bg-gray-400 flex items-center justify-center dark:disabled:bg-slate-600">
                         {isLoading ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : <SearchIcon className="w-5 h-5"/>}
                        <span className="ml-2">{isLoading ? 'Analyzing...' : 'Search Trends'}</span>
                    </button>
                </div>
                 {error && <p className="text-red-600 dark:text-red-400 text-sm mt-2">{error}</p>}
            </div>

            {isLoading && (
                <div className="flex justify-center items-center h-64">
                    <SpinnerIcon className="w-10 h-10 animate-spin text-[var(--theme-primary)]" />
                </div>
            )}
            
            {trendData && (
                <div className="space-y-6">
                    {/* Interest over time */}
                    <div className="bg-white p-6 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">Interest over time</h3>
                        <LineChart data={trendData.interestOverTime} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <TrendTable title="Interest by region" data={trendData.interestByRegion} />
                        <TrendTable title="Top related queries" data={trendData.topRelatedQueries} />
                        <TrendTable title="Rising related queries" data={trendData.risingRelatedQueries} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default GoogleTrendsExplorer;
