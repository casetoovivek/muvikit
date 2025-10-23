import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import { SpinnerIcon, ChartIcon, BellIcon, MailIcon, WhatsAppIcon } from '../components/icons';

// Helper to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
};

const AiChartAnalyst: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'analyzer' | 'alerts'>('analyzer');
    // Analyzer state
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [userQuestion, setUserQuestion] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [analysisResult, setAnalysisResult] = useState('');
    
    // Alerts state
    const [symbol, setSymbol] = useState('XAUUSD');
    const [timeframe, setTimeframe] = useState('15 Minute');
    const [conditions, setConditions] = useState<string[]>([]);
    const [isAlertActive, setIsAlertActive] = useState(false);
    const alertIntervalRef = useRef<any>(null);

    // Cleanup interval on component unmount
    useEffect(() => {
        return () => {
            if (alertIntervalRef.current) {
                clearInterval(alertIntervalRef.current);
            }
        };
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                setImageUrl(event.target?.result as string);
            };
            reader.readAsDataURL(file);
            setError('');
            setAnalysisResult('');
        } else {
            setError('Please select a valid image file (PNG, JPG, etc.).');
            setImageFile(null);
            setImageUrl(null);
        }
    };

    const handleAnalyzeChart = async () => {
        if (!imageFile) {
            setError('Please upload a chart image first.');
            return;
        }
        setIsLoading(true);
        setError('');
        setAnalysisResult('');

        try {
            const base64Data = await fileToBase64(imageFile);
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

            const prompt = `
                You are an expert technical analyst specializing in Smart Money Concepts (SMC). Analyze the provided chart image. Based ONLY on the visual information in the image, provide a detailed technical analysis in well-structured Markdown format.

                Your analysis must include:
                1.  **Market Structure & Trend:** Identify the primary trend and any recent breaks of structure (BoS) or changes of character (CHoCH).
                2.  **Key Liquidity Zones:** Point out significant areas of buy-side and sell-side liquidity (e.g., old highs/lows, equal highs/lows).
                3.  **Order Blocks & Imbalances:** Identify any visible bullish or bearish order blocks and Fair Value Gaps (FVG) or imbalances.
                4.  **Potential Scenarios:** Based on SMC principles, describe potential future price movements. Is price likely to sweep liquidity before reversing? Is it mitigating an order block?
                5.  **Actionable Insights:** Suggest potential entry points for high-probability setups. Specify the conditions, such as a return to an order block or a sweep of liquidity followed by a market structure shift. Explain the "why" behind the trade idea, considering potential liquidity traps.
                ${userQuestion ? `\nAdditionally, address this specific question from an SMC perspective: "${userQuestion}"` : ''}
                
                Present the final analysis in a clear, professional format.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: {
                    parts: [
                        { inlineData: { data: base64Data, mimeType: imageFile.type } },
                        { text: prompt }
                    ]
                }
            });

            setAnalysisResult(response.text);

        } catch (err) {
            console.error(err);
            setError('Analysis failed. The AI service may be unavailable, or the request may have violated a safety policy. Please try a different chart.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleConditionChange = (condition: string) => {
        setConditions(prev => 
            prev.includes(condition) 
            ? prev.filter(c => c !== condition) 
            : [...prev, condition]
        );
    };
    
    const handleActivateAlert = async () => {
        if (!symbol.trim() || conditions.length === 0) {
            setError('Please provide a symbol and select at least one condition.');
            return;
        }

        if (Notification.permission !== 'granted') {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                setError('Notification permission is required to activate alerts.');
                return;
            }
        }
        
        setError('');
        setIsAlertActive(true);

        const checkConditions = async () => {
            console.log(`Checking conditions for ${symbol}...`);
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
                const prompt = `
                    You are a real-time trading alert bot. For the symbol "${symbol}", are any of the following conditions currently met on the ${timeframe} chart: ${conditions.join(', ')}?
                    Use your real-time search capabilities to get the latest market data.
                    Respond ONLY with a valid JSON object with two keys: "alert" (boolean) and "reason" (string, explaining which condition was met and why).
                    Example: {"alert": true, "reason": "Bullish Engulfing Candle formed on the 15 Minute chart, indicating strong buying pressure."}
                    If no condition is met, respond with: {"alert": false, "reason": "No specified conditions are met at this time."}
                `;
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                    config: { tools: [{ googleSearch: {} }] }
                });
                
                try {
                    const result = JSON.parse(response.text);
                    if (result.alert === true) {
                        new Notification(`Trading Alert: ${symbol}`, {
                            body: result.reason,
                            icon: 'https://aistudio.google.com/favicon.ico'
                        });
                    }
                } catch(parseError) {
                    console.error("Failed to parse AI alert response:", parseError);
                }
            } catch (e) {
                console.error("Error checking alert conditions:", e);
                // Don't show error to user for background checks
            }
        };

        checkConditions(); // Check immediately
        alertIntervalRef.current = setInterval(checkConditions, 60000); // Check every 60 seconds
    };

    const handleDeactivateAlert = () => {
        if (alertIntervalRef.current) {
            clearInterval(alertIntervalRef.current);
        }
        setIsAlertActive(false);
    };

    const MarkdownRenderer = ({ text }: { text: string }) => {
        // ... (Markdown renderer implementation remains the same)
        const lines = text.split('\n');
        const elements: React.ReactElement[] = [];
        let listItems: React.ReactElement[] = [];
        const flushList = () => { if (listItems.length > 0) { elements.push(<ul key={`ul-${elements.length}`} className="list-disc pl-6 mb-4 space-y-1">{listItems}</ul>); listItems = []; } };
        for (let i = 0; i < lines.length; i++) { const line = lines[i]; if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) { listItems.push(<li key={i}>{line.trim().substring(2)}</li>); continue; } flushList(); if (line.startsWith('### ')) { elements.push(<h3 key={i} className="text-lg font-semibold mt-4 mb-2 text-slate-800 dark:text-slate-200">{line.substring(4)}</h3>); } else if (line.startsWith('## ')) { elements.push(<h2 key={i} className="text-xl font-bold mt-6 mb-3 text-slate-800 dark:text-slate-200 border-b pb-1 dark:border-slate-600">{line.substring(3)}</h2>); } else if (line.startsWith('# ')) { elements.push(<h1 key={i} className="text-2xl font-extrabold mt-8 mb-4 text-slate-900 dark:text-slate-100 border-b-2 pb-2 dark:border-slate-500">{line.substring(2)}</h1>); } else if (line.trim() !== '') { const parts = line.split(/(\*\*.*?\*\*|`.*?`)/g).filter(Boolean); elements.push(<p key={i} className="mb-2 text-slate-700 dark:text-slate-300 leading-relaxed">{parts.map((part, partIndex) => { if (part.startsWith('**') && part.endsWith('**')) { return <strong key={partIndex}>{part.substring(2, part.length - 2)}</strong>; } if (part.startsWith('`') && part.endsWith('`')) { return <code key={partIndex} className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-sm font-mono">{part.substring(1, part.length - 1)}</code>; } return part; })}</p>); } } flushList(); return <div className="prose prose-slate dark:prose-invert max-w-none">{elements}</div>;
    };

    return (
        <div className="space-y-6">
            <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">AI Chart Analyst & Signal Finder</h2>
                <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">Upload any chart for AI analysis, or set up real-time trade alerts.</p>
            </div>
            
            <div className="border-b border-gray-200 dark:border-slate-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setActiveTab('analyzer')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'analyzer' ? 'border-[var(--theme-primary)] text-[var(--theme-primary)] dark:border-sky-400 dark:text-sky-400' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200'}`}>
                        Chart Analyzer
                    </button>
                    <button onClick={() => setActiveTab('alerts')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'alerts' ? 'border-[var(--theme-primary)] text-[var(--theme-primary)] dark:border-sky-400 dark:text-sky-400' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200'}`}>
                        Real-Time Alerts
                    </button>
                </nav>
            </div>

            {activeTab === 'analyzer' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4 dark:bg-slate-800 dark:border-slate-700">
                         <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">1. Upload Chart Image</h3>
                        <input type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--theme-primary-light)] file:text-[var(--theme-primary)] hover:file:opacity-90 dark:file:bg-slate-700 dark:file:text-sky-300 dark:text-slate-400" />
                        
                        {imageUrl && <div className="mt-4 p-2 bg-slate-100 dark:bg-slate-900 rounded-lg"><img src={imageUrl} alt="Chart Preview" className="max-h-80 w-auto mx-auto rounded-md" /></div>}
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">2. Specific Question (Optional)</label>
                             <textarea value={userQuestion} onChange={e => setUserQuestion(e.target.value)} placeholder="e.g., 'Where is the liquidity I should be watching?'" className="w-full p-2 border border-slate-300 rounded-md text-slate-900 placeholder:text-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100" rows={2}></textarea>
                        </div>
                        
                        <button onClick={handleAnalyzeChart} disabled={isLoading || !imageFile} className="w-full px-6 py-3 bg-[var(--theme-primary)] text-white font-semibold rounded-lg shadow-md hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center dark:disabled:bg-slate-600">
                            {isLoading ? <><SpinnerIcon className="w-5 h-5 mr-2 animate-spin" /> Analyzing...</> : '3. Analyze Chart'}
                        </button>
                         {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}
                    </div>
                    <div className="bg-white p-6 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 min-h-[30rem]">
                         <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">AI Analysis</h3>
                         {isLoading && <div className="flex justify-center items-center h-64"><SpinnerIcon className="w-10 h-10 animate-spin text-[var(--theme-primary)]" /></div>}
                         {analysisResult ? (<div className="max-h-[70vh] overflow-y-auto pr-2"><MarkdownRenderer text={analysisResult} /></div>) : !isLoading && (<div className="text-center text-slate-500 dark:text-slate-400 pt-16"><ChartIcon className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" /><p className="mt-4">Your chart analysis will appear here.</p></div>)}
                    </div>
                </div>
            )}
            
            {activeTab === 'alerts' && (
                 <div className="bg-white p-8 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 max-w-4xl mx-auto space-y-6">
                    {isAlertActive ? (
                        <div className="text-center space-y-4">
                            <div className="flex items-center justify-center gap-3">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                </span>
                                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Alert is Active</h3>
                            </div>
                            <div className="p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg border dark:border-slate-600 text-left text-slate-800 dark:text-slate-200">
                                <p><span className="font-semibold">Monitoring Symbol:</span> {symbol}</p>
                                <p><span className="font-semibold">Timeframe:</span> {timeframe}</p>
                                <p><span className="font-semibold">Conditions:</span> {conditions.join(', ')}</p>
                            </div>
                            <div className="p-3 bg-sky-50 text-sky-800 border border-sky-200 rounded-lg text-sm dark:bg-sky-900/50 dark:text-sky-300 dark:border-sky-800">
                                <strong>Important:</strong> Alerts are active only while this browser tab remains open. The system checks for your conditions once every minute.
                            </div>
                            <button onClick={handleDeactivateAlert} className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white font-bold rounded-lg shadow-md hover:bg-red-700 transition-colors">
                                Deactivate Alert
                            </button>
                        </div>
                    ) : (
                        <>
                            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Create a New Real-Time Alert</h3>
                            {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <input value={symbol} onChange={e => setSymbol(e.target.value.toUpperCase())} placeholder="Symbol (e.g., BTC/USD)" className="p-2 border rounded text-slate-900 bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100" />
                                <select className="p-2 border rounded text-slate-900 bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100">
                                    <option>Forex</option><option>Crypto</option><option>Stocks</option>
                                </select>
                                <select value={timeframe} onChange={e => setTimeframe(e.target.value)} className="p-2 border rounded text-slate-900 bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100">
                                    <option>15 Minute</option><option>1 Hour</option><option>4 Hour</option><option>1 Day</option>
                                </select>
                            </div>
                            <div>
                                <label className="font-medium text-slate-600 dark:text-slate-300">Conditions (Select one or more)</label>
                                <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                                    {['Trendline Retest (3rd Touch)', 'Support/Resistance Flip', 'Bullish Engulfing Candle', 'SMC: Liquidity Grab', 'SMC: Order Block Entry', 'Fair Value Gap Fill'].map(cond => (
                                        <label key={cond} className="flex items-center gap-2 p-2 border rounded-md cursor-pointer text-slate-800 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700 dark:text-slate-200">
                                            <input type="checkbox" checked={conditions.includes(cond)} onChange={() => handleConditionChange(cond)} className="rounded text-[var(--theme-primary)] focus:ring-[var(--theme-primary)] dark:bg-slate-600 border-slate-400" />
                                            <span>{cond}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="font-medium text-slate-600 dark:text-slate-300">Notification Method</label>
                                <div className="mt-2 flex flex-col sm:flex-row gap-4">
                                    <label className="flex items-center gap-2 p-3 border rounded-lg flex-1 cursor-pointer text-slate-800 dark:border-slate-600 dark:text-slate-200">
                                        <input type="radio" name="notification" className="text-[var(--theme-primary)] focus:ring-[var(--theme-primary)]" defaultChecked />
                                        <BellIcon className="w-5 h-5" />
                                        <span>Chrome Push</span>
                                    </label>
                                    <div className="relative flex items-center gap-2 p-3 border rounded-lg flex-1 cursor-not-allowed bg-slate-50 dark:bg-slate-700/50 dark:border-slate-700 group">
                                        <input type="radio" name="notification" className="text-[var(--theme-primary)]" disabled />
                                        <MailIcon className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                                        <span className="text-slate-400 dark:text-slate-500">Email</span>
                                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block px-2 py-1 bg-slate-800 text-white text-xs rounded-md">Requires backend server</span>
                                    </div>
                                    <div className="relative flex items-center gap-2 p-3 border rounded-lg flex-1 cursor-not-allowed bg-slate-50 dark:bg-slate-700/50 dark:border-slate-700 group">
                                        <input type="radio" name="notification" className="text-[var(--theme-primary)]" disabled />
                                        <WhatsAppIcon className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                                        <span className="text-slate-400 dark:text-slate-500">WhatsApp</span>
                                         <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block px-2 py-1 bg-slate-800 text-white text-xs rounded-md">Requires backend server</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={handleActivateAlert} className="w-full px-6 py-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 transition-colors">
                                Activate Alert
                            </button>
                        </>
                    )}
                 </div>
            )}
        </div>
    );
};

export default AiChartAnalyst;