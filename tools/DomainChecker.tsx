import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { SpinnerIcon, SearchIcon } from '../components/icons';

// Data structure for the AI's JSON response
interface DomainCheckResult {
  domainName: string;
  isAvailable: boolean;
  details: {
    whois?: {
      registrar: string;
      registeredOn: string;
      expiresOn: string;
      owner: string;
    };
    purchaseSuggestions?: {
      registrar: string;
      deal: string;
    }[];
    alternativeSuggestions?: string[];
  };
}

const DomainChecker: React.FC = () => {
    const [domain, setDomain] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<DomainCheckResult | null>(null);

    const handleCheck = async () => {
        if (!domain.trim()) {
            setError('Please enter a domain name to check.');
            return;
        }
        setIsLoading(true);
        setError('');
        setResult(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `
                You are a domain name expert. Use your real-time search tools to analyze the domain "${domain}".
                Provide a response ONLY in a valid JSON object format with the following structure. Do not add any text before or after the JSON.
                - If the domain is taken, perform a WHOIS lookup and fill the 'whois' object.
                - If the domain is available, provide purchase suggestions and alternatives.

                JSON Structure:
                {
                  "domainName": "${domain}",
                  "isAvailable": boolean,
                  "details": {
                    "whois": { // Omit if domain is available
                      "registrar": "string",
                      "registeredOn": "string",
                      "expiresOn": "string",
                      "owner": "string (or 'Redacted for Privacy')"
                    },
                    "purchaseSuggestions": [ // Omit if domain is taken
                      { "registrar": "Namecheap", "deal": "string" },
                      { "registrar": "GoDaddy", "deal": "string" },
                      { "registrar": "Hostinger", "deal": "string" }
                    ],
                    "alternativeSuggestions": [ "string", "string" ] // Provide for both available and taken domains
                  }
                }
            `;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: { 
                    tools: [{ googleSearch: {} }],
                 },
            });
            
            let jsonString = response.text.trim();
            if (jsonString.startsWith('```json')) {
                jsonString = jsonString.substring(7, jsonString.length - 3).trim();
            } else if (jsonString.startsWith('```')) {
                jsonString = jsonString.substring(3, jsonString.length - 3).trim();
            }

            try {
                const parsedResult = JSON.parse(jsonString);
                setResult(parsedResult);
            } catch (parseError) {
                 throw new Error("AI returned an invalid response format. Please try again.");
            }

        } catch (err: any) {
            console.error(err);
            setError(err.message || `Failed to check "${domain}". The domain might be invalid, or the AI service is currently unavailable.`);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="space-y-6">
            <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Domain Availability Checker</h2>
                <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">Instantly check if a domain is available and get purchase suggestions or WHOIS details.</p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                <div className="flex flex-col sm:flex-row gap-4">
                    <input type="text" value={domain} onChange={(e) => setDomain(e.target.value.toLowerCase())} placeholder="e.g., myawesomewebsite.com" className="flex-grow w-full px-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-[var(--theme-primary)] dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100" />
                    <button onClick={handleCheck} disabled={isLoading} className="px-5 py-2 bg-[var(--theme-primary)] text-white font-semibold rounded-lg shadow-md hover:opacity-90 disabled:bg-gray-400 flex items-center justify-center dark:disabled:bg-slate-600">
                        {isLoading ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : <SearchIcon className="w-5 h-5" />}
                        <span className="ml-2">{isLoading ? 'Checking...' : 'Check'}</span>
                    </button>
                </div>
                {error && <p className="text-red-600 dark:text-red-400 text-sm mt-2">{error}</p>}
            </div>

            {isLoading && <div className="flex justify-center items-center h-40"><SpinnerIcon className="w-10 h-10 animate-spin text-[var(--theme-primary)]" /></div>}

            {result && (
                <div className="space-y-6">
                    {/* Main Result Card */}
                    <div className={`p-6 rounded-lg border ${result.isAvailable ? 'bg-green-50 border-green-200 dark:bg-green-900/50 dark:border-green-800' : 'bg-red-50 border-red-200 dark:bg-red-900/50 dark:border-red-800'}`}>
                        <h3 className="text-2xl font-bold flex items-center gap-3">
                            {result.isAvailable ? 
                                <span className="text-green-700 dark:text-green-300">🎉 Congratulations!</span> : 
                                <span className="text-red-700 dark:text-red-300">😕 Sorry...</span>}
                        </h3>
                        <p className={`mt-1 text-lg ${result.isAvailable ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                            The domain <span className="font-bold">{result.domainName}</span> is {result.isAvailable ? 'available!' : 'already taken.'}
                        </p>
                    </div>

                    {/* Details Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {result.isAvailable ? (
                             <div className="bg-white p-4 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-3">Where to Buy</h3>
                                <ul className="space-y-3">
                                    {result.details.purchaseSuggestions?.map(s => (
                                        <li key={s.registrar} className="p-3 bg-slate-50 rounded-md border dark:bg-slate-700/50 dark:border-slate-600">
                                            <p className="font-semibold text-slate-700 dark:text-slate-200">{s.registrar}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{s.deal}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                             <div className="bg-white p-4 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-3">WHOIS Details</h3>
                                {result.details.whois ? (
                                    <dl className="text-sm">
                                        <div className="py-2 grid grid-cols-3 gap-4"><dt className="font-medium text-slate-500 dark:text-slate-400">Registrar</dt><dd className="col-span-2 text-slate-700 dark:text-slate-200">{result.details.whois.registrar}</dd></div>
                                        <div className="py-2 grid grid-cols-3 gap-4 border-t dark:border-slate-700"><dt className="font-medium text-slate-500 dark:text-slate-400">Registered On</dt><dd className="col-span-2 text-slate-700 dark:text-slate-200">{result.details.whois.registeredOn}</dd></div>
                                        <div className="py-2 grid grid-cols-3 gap-4 border-t dark:border-slate-700"><dt className="font-medium text-slate-500 dark:text-slate-400">Expires On</dt><dd className="col-span-2 text-slate-700 dark:text-slate-200">{result.details.whois.expiresOn}</dd></div>
                                        <div className="py-2 grid grid-cols-3 gap-4 border-t dark:border-slate-700"><dt className="font-medium text-slate-500 dark:text-slate-400">Owner</dt><dd className="col-span-2 text-slate-700 dark:text-slate-200">{result.details.whois.owner}</dd></div>
                                    </dl>
                                ) : <p className="text-slate-500">WHOIS data could not be retrieved.</p>}
                            </div>
                        )}

                        <div className="bg-white p-4 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-3">Alternative Suggestions</h3>
                            <ul className="space-y-2">
                                {result.details.alternativeSuggestions?.map(alt => (
                                    <li key={alt} className="p-2 bg-slate-50 rounded-md text-sm font-mono text-slate-600 dark:bg-slate-700/50 dark:text-slate-300">{alt}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
            <div className="bg-white p-6 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 space-y-6 mt-6">
                <section>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">What is a Domain Checker?</h2>
                    <p className="mt-2 text-slate-600 dark:text-slate-300">A Domain Checker is a tool that verifies if a specific website domain name is available to be registered. If the domain is already taken, it can perform a WHOIS lookup to retrieve public registration details like the registrar, registration date, and expiration date. Our AI-powered tool goes a step further by providing purchase suggestions from popular registrars if the domain is available and generating alternative domain ideas if it's not.</p>
                </section>
                <section>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">How to Use This Tool</h2>
                    <ol className="list-decimal list-inside mt-2 space-y-2 text-slate-600 dark:text-slate-300">
                        <li><strong>Enter a Domain Name:</strong> Type the full domain name you want to check, including the extension (e.g., mywebsite.com, mybusiness.org).</li>
                        <li><strong>Click "Check":</strong> The AI will perform a real-time search to determine the domain's status.</li>
                        <li><strong>Review Results:</strong> You will see an immediate confirmation of whether the domain is available or taken. The tool will also provide relevant details like WHOIS data, purchase deals, and alternative suggestions.</li>
                    </ol>
                </section>
                <section>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Frequently Asked Questions (FAQs)</h2>
                    <div className="mt-2 space-y-3 text-slate-600 dark:text-slate-300">
                        <div>
                            <h3 className="font-semibold">What is WHOIS data?</h3>
                            <p>WHOIS is a public record of who owns a domain name and how to get in contact with them. However, many owners use privacy services to hide their personal information, in which case the owner may be listed as "Redacted for Privacy."</p>
                        </div>
                        <div>
                            <h3 className="font-semibold">Is the availability check accurate?</h3>
                            <p>Yes, the tool uses real-time search capabilities to provide the most current availability status. However, domain availability can change in an instant, so it's always best to register a desired name as soon as you find it's available.</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default DomainChecker;