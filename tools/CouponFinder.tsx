import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { SpinnerIcon, SearchIcon, CopyIcon } from '../components/icons';

interface Coupon {
    code: string;
    description: string;
    source: string;
    discount: string;
}

const CouponFinder: React.FC = () => {
    const [query, setQuery] = useState('GoDaddy domain registration');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [results, setResults] = useState<Coupon[]>([]);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const handleSearch = async () => {
        if (!query.trim()) {
            setError('Please enter a service like "GoDaddy" or "Hostinger hosting".');
            return;
        }
        setIsLoading(true);
        setError('');
        setResults([]);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `
                You are a coupon code expert for web services. Use your real-time search to find the latest, active coupon codes for "${query}".
                Only return codes that are verifiably active or less than 15 days old.
                Provide the response ONLY in a valid JSON array of objects. Each object must have these exact keys: "code", "description", "source", and "discount".
                - "code": The coupon code text.
                - "description": A brief explanation of the deal.
                - "source": The registrar or company (e.g., "GoDaddy", "Hostinger").
                - "discount": The discount value (e.g., "30% off", "$5 off").
                If no valid codes are found, you must return an empty array: []. Do not include any text, markdown, or explanations before or after the JSON array.
            `;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    tools: [{ googleSearch: {} }],
                },
            });

            let jsonString = response.text;
            const jsonMatch = jsonString.match(/\[.*\]/s);
            if (jsonMatch) {
                jsonString = jsonMatch[0];
            } else {
                 throw new Error("AI response was not in the expected JSON array format.");
            }

            const parsedResults = JSON.parse(jsonString);
            if (Array.isArray(parsedResults) && parsedResults.length > 0) {
                setResults(parsedResults);
            } else {
                setError(`No recent coupons found for "${query}". Try a broader search like "domain coupons".`);
            }

        } catch (err) {
            setError('An error occurred. The AI service may be busy or could not find relevant deals. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    return (
        <div className="space-y-6">
            <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Domain & Hosting Coupon Finder</h2>
                <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">Find the latest discount codes for domain registration and web hosting services.</p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="e.g., Namecheap hosting, .com domain deals"
                        className="flex-grow w-full px-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-[var(--theme-primary)] dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    />
                    <button onClick={handleSearch} disabled={isLoading} className="px-5 py-2 bg-[var(--theme-primary)] text-white font-semibold rounded-lg shadow-md hover:opacity-90 disabled:bg-gray-400 flex items-center justify-center dark:disabled:bg-slate-600">
                        {isLoading ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : <SearchIcon className="w-5 h-5" />}
                        <span className="ml-2">{isLoading ? 'Searching...' : 'Find Coupons'}</span>
                    </button>
                </div>
            </div>

            {isLoading && <div className="flex justify-center items-center h-40"><SpinnerIcon className="w-10 h-10 animate-spin text-[var(--theme-primary)]" /></div>}
            
            {error && !isLoading && (
                <div className="p-4 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-lg dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800 text-center">
                    {error}
                </div>
            )}
            
            {results.length > 0 && !isLoading && (
                <div className="space-y-4">
                    {results.map((coupon, index) => (
                        <div key={index} className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 dark:bg-slate-800 dark:border-slate-700">
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{coupon.source}</p>
                                <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{coupon.description}</p>
                            </div>
                            <div className="flex items-center gap-4 bg-slate-100 dark:bg-slate-700 p-3 rounded-lg">
                                <span className="font-mono font-bold text-lg text-[var(--theme-primary)] dark:text-sky-300">{coupon.code}</span>
                                <button onClick={() => handleCopy(coupon.code)} className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600">
                                    {copiedCode === coupon.code ? <span className="text-sm text-green-600 dark:text-green-400">Copied!</span> : <CopyIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CouponFinder;
