import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
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
    const [showAlertModal, setShowAlertModal] = useState(false);


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

    const handleAnalyze = async () => {
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
                6.  **Rally/Decline Information:** Briefly mention how long the current major price move has been occurring, if visible from the chart's timeframe.
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
    
    // Markdown Renderer Component
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
            
            if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
                listItems.push(<li key={i}>{line.trim().substring(2)}</li>);
                continue;
            }

            flushList();

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
    
    const AlertModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
         <div className="fixed inset-0 bg-slate-900 bg-opacity-80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-2xl max-w-lg mx-auto border-2 border-[var(--theme-primary)] dark:border-sky-500">
                <div className="mx-auto bg-sky-100 dark:bg-sky-900/50 w-16 h-16 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-sky-600 dark:text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-6 text-center">Backend Server Required</h2>
                <p className="mt-4 text-slate-600 dark:text-slate-300 text-center">
                    Activating real-time, 24/7 market alerts requires a dedicated server to constantly monitor data feeds from sources like TradingView. This ensures you never miss a signal, even when your browser is closed.
                </p>
                <p className="mt-4 font-semibold text-slate-700 dark:text-slate-200 text-center">
                    This advanced functionality is on our roadmap for a future Pro version! For now, please continue to use the on-demand Chart Analyzer.
                </p>
                <button
                    onClick={onClose}
                    className="mt-6 w-full px-6 py-3 bg-[var(--theme-primary)] text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition-opacity"
                >
                    Understood
                </button>
            </div>
        </div>
    );


    return (
        <div className="space-y-6">
            {showAlertModal && <AlertModal onClose={() => setShowAlertModal(false)} />}
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
                    {/* Left Column: Upload & Preview */}
                    <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4 dark:bg-slate-800 dark:border-slate-700">
                         <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">1. Upload Chart Image</h3>
                        <input type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--theme-primary-light)] file:text-[var(--theme-primary)] hover:file:opacity-90 dark:file:bg-slate-700 dark:file:text-sky-300 dark:text-slate-400" />
                        <p className="text-xs text-slate-400">For best results, get charts from <a href="https://www.tradingview.com" target="_blank" rel="noopener noreferrer" className="text-[var(--theme-primary)] hover:underline dark:text-sky-400">TradingView.com</a></p>
                       
                        {imageUrl && (
                            <div className="mt-4 p-2 bg-slate-100 dark:bg-slate-900 rounded-lg">
                                <img src={imageUrl} alt="Chart Preview" className="max-h-80 w-auto mx-auto rounded-md" />
                            </div>
                        )}
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">2. Specific Question (Optional)</label>
                             <textarea value={userQuestion} onChange={e => setUserQuestion(e.target.value)} placeholder="e.g., 'Where is the liquidity I should be watching?'" className="w-full p-2 border border-slate-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white" rows={2}></textarea>
                        </div>
                        
                        <button onClick={handleAnalyze} disabled={isLoading || !imageFile} className="w-full px-6 py-3 bg-[var(--theme-primary)] text-white font-semibold rounded-lg shadow-md hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center dark:disabled:bg-slate-600">
                            {isLoading ? <><SpinnerIcon className="w-5 h-5 mr-2 animate-spin" /> Analyzing...</> : '3. Analyze Chart'}
                        </button>
                         {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}
                    </div>
                    {/* Right Column: Analysis */}
                    <div className="bg-white p-6 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 min-h-[30rem]">
                         <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">AI Analysis</h3>
                         {isLoading && <div className="flex justify-center items-center h-64"><SpinnerIcon className="w-10 h-10 animate-spin text-[var(--theme-primary)]" /></div>}
                         {analysisResult ? (
                             <div className="max-h-[70vh] overflow-y-auto pr-2">
                                <MarkdownRenderer text={analysisResult} />
                             </div>
                         ) : !isLoading && (
                             <div className="text-center text-slate-500 dark:text-slate-400 pt-16">
                                <ChartIcon className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
                                <p className="mt-4">Your chart analysis will appear here.</p>
                             </div>
                         )}
                    </div>
                </div>
            )}
            
            {activeTab === 'alerts' && (
                 <div className="bg-white p-8 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 max-w-4xl mx-auto space-y-6">
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Create a New Real-Time Alert</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input placeholder="Symbol (e.g., BTC/USD)" className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600" />
                        <select className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600">
                            <option>Crypto</option>
                            <option>Stocks</option>
                            <option>Forex</option>
                        </select>
                         <select className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600">
                            <option>4 Hour</option>
                            <option>1 Day</option>
                             <option>1 Hour</option>
                             <option>15 Minute</option>
                        </select>
                    </div>
                    <div>
                        <label className="font-medium text-slate-600 dark:text-slate-300">Conditions (Select one or more)</label>
                        <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                            {['Trendline Retest (3rd Touch)', 'Support/Resistance Flip', 'Bullish Engulfing Candle', 'SMC: Liquidity Grab', 'SMC: Order Block Entry', 'Fair Value Gap Fill'].map(cond => (
                                <label key={cond} className="flex items-center gap-2 p-2 border rounded-md cursor-pointer hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700">
                                    <input type="checkbox" className="rounded text-[var(--theme-primary)] focus:ring-[var(--theme-primary)]" />
                                    <span>{cond}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="font-medium text-slate-600 dark:text-slate-300">Notification Method</label>
                        <div className="mt-2 flex gap-4">
                            <label className="flex items-center gap-2 p-3 border rounded-lg flex-1 cursor-pointer dark:border-slate-600">
                                <input type="radio" name="notification" className="text-[var(--theme-primary)] focus:ring-[var(--theme-primary)]" defaultChecked />
                                <BellIcon className="w-5 h-5" />
                                <span>Chrome Push</span>
                            </label>
                            <label className="flex items-center gap-2 p-3 border rounded-lg flex-1 cursor-pointer dark:border-slate-600">
                                <input type="radio" name="notification" className="text-[var(--theme-primary)] focus:ring-[var(--theme-primary)]" />
                                <MailIcon className="w-5 h-5" />
                                <span>Email</span>
                            </label>
                             <label className="flex items-center gap-2 p-3 border rounded-lg flex-1 cursor-pointer dark:border-slate-600">
                                <input type="radio" name="notification" className="text-[var(--theme-primary)] focus:ring-[var(--theme-primary)]" />
                                <WhatsAppIcon className="w-5 h-5" />
                                <span>WhatsApp</span>
                            </label>
                        </div>
                    </div>
                    <button onClick={() => setShowAlertModal(true)} className="w-full px-6 py-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 transition-colors">
                        Activate Alert
                    </button>
                 </div>
            )}
        </div>
    );
};

export default AiChartAnalyst;