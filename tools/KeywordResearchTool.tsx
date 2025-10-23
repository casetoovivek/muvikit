import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
    SpinnerIcon, 
    SearchIcon, 
    CopyIcon, 
    DownloadIcon,
    InfoIcon,
    GoogleIcon,
    YouTubeIcon,
    BingIcon,
    AmazonIcon,
    EbayIcon,
    AppStoreIcon,
    PlayStoreIcon,
    InstagramIcon,
    TwitterIcon,
    PinterestIcon,
    TikTokIcon,
    SortIcon,
    TrendUpArrow,
    TrendDownArrow
} from '../components/icons';


// Let TypeScript know about the XLSX library from the script tag in index.html
declare global {
    interface Window {
        XLSX: any;
    }
}


// --- TYPE DEFINITIONS ---
interface KeywordResult {
    keyword: string;
    searchVolume: number;
    trend: number;
    cpc: number;
    competition: number;
    suggestion: string;
}

type SortableField = 'keyword' | 'searchVolume' | 'trend' | 'cpc' | 'competition' | 'suggestion';
type SortDirection = 'asc' | 'desc';
type FilterTab = 'Suggestions' | 'Questions' | 'Prepositions' | 'Hashtags';
type Source = 'Google' | 'YouTube' | 'Bing' | 'Amazon' | 'eBay' | 'App Store' | 'Play Store' | 'Instagram' | 'Twitter' | 'Pinterest' | 'TikTok';

const sources: { id: Source; icon: React.ReactElement<any> }[] = [
    { id: 'Google', icon: <GoogleIcon /> }, { id: 'YouTube', icon: <YouTubeIcon /> }, { id: 'Bing', icon: <BingIcon /> },
    { id: 'Amazon', icon: <AmazonIcon /> }, { id: 'eBay', icon: <EbayIcon /> }, { id: 'App Store', icon: <AppStoreIcon /> },
    { id: 'Play Store', icon: <PlayStoreIcon /> }, { id: 'Instagram', icon: <InstagramIcon /> }, { id: 'Twitter', icon: <TwitterIcon /> },
    { id: 'Pinterest', icon: <PinterestIcon /> }, { id: 'TikTok', icon: <TikTokIcon /> }
];

// --- HELPER & UI COMPONENTS ---

const formatNumber = (num: number) => num ? num.toLocaleString('en-US') : '0';
const formatCompetition = (comp: number) => {
    if (comp < 34) return `${comp} (Low)`;
    if (comp < 67) return `${comp} (Medium)`;
    return `${comp} (High)`;
};

const FilterIcon: React.FC<{className?: string; isActive: boolean}> = ({ className, isActive }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isActive ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
    </svg>
);


const SuggestionBadge: React.FC<{ suggestion: string }> = ({ suggestion }) => {
    const style = useMemo(() => {
        if (!suggestion) return 'bg-slate-100 text-slate-800 dark:bg-slate-600 dark:text-slate-300';
        const s = suggestion.toLowerCase();
        if (s.includes('high potential')) return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
        if (s.includes('good opportunity')) return 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300';
        if (s.includes('niche')) return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300';
        if (s.includes('competitive')) return 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300';
        if (s.includes('monitor')) return 'bg-slate-100 text-slate-800 dark:bg-slate-600 dark:text-slate-300';
        return 'bg-slate-100 text-slate-800 dark:bg-slate-600 dark:text-slate-300';
    }, [suggestion]);

    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${style}`}>
            {suggestion}
        </span>
    );
};

const SimpleMarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
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
        const trimmedLine = line.trim();

        if (trimmedLine.startsWith('- ')) {
            const parts = trimmedLine.substring(2).split(/(\*\*.*?\*\*)/g).filter(Boolean);
            listItems.push(<li key={i}>{parts.map((part, partIndex) => part.startsWith('**') && part.endsWith('**') ? <strong key={partIndex}>{part.substring(2, part.length - 2)}</strong> : part)}</li>);
            continue;
        }
        
        flushList();

        if (line.startsWith('## ')) {
            elements.push(<h3 key={i} className="text-lg font-bold mt-4 mb-2 text-slate-800 dark:text-slate-200">{line.substring(3)}</h3>);
        } else if (trimmedLine !== '') {
            const parts = line.split(/(\*\*.*?\*\*)/g).filter(Boolean);
            elements.push(
                <p key={i} className="mb-2">
                    {parts.map((part, partIndex) => 
                        part.startsWith('**') && part.endsWith('**') 
                            ? <strong key={partIndex}>{part.substring(2, part.length - 2)}</strong> 
                            : part
                    )}
                </p>
            );
        }
    }

    flushList(); 

    return <div className="prose prose-sm dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">{elements}</div>;
};

const HashtagView: React.FC<{ keywords: KeywordResult[] }> = ({ keywords }) => {
    const hashtags = useMemo(() => {
        const generated = new Set<string>();
        keywords.slice(0, 50).forEach(k => {
            const clean = k.keyword
                .toLowerCase()
                .replace(/[^a-zA-Z0-9\s]/g, '')
                .replace(/\s+/g, '');
            if (clean) {
                generated.add(`#${clean}`);
            }
        });
        return Array.from(generated);
    }, [keywords]);

    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(hashtags.join(' '));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (keywords.length === 0) {
        return <div className="text-center p-8 text-slate-500">Generate keywords to see hashtag suggestions.</div>
    }

    return (
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Generated Hashtags ({hashtags.length})</h3>
                <button onClick={handleCopy} className="flex items-center gap-2 px-3 py-1 text-sm bg-slate-200 dark:bg-slate-700 rounded-md">
                    <CopyIcon className="w-4 h-4" />
                    {copied ? 'Copied!' : 'Copy All'}
                </button>
            </div>
            <div className="flex flex-wrap gap-2">
                {hashtags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300 rounded-full text-sm font-mono">{tag}</span>
                ))}
            </div>
        </div>
    );
};


// --- MAIN COMPONENT ---
const KeywordResearchTool: React.FC = () => {
    const [source, setSource] = useState<Source>('YouTube');
    const [keyword, setKeyword] = useState('how to use youtube');
    
    const [results, setResults] = useState<KeywordResult[]>([]);
    const [aiSuggestions, setAiSuggestions] = useState('');
    const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(false);
    const [isSuggestionLoading, setIsSuggestionLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [activeTab, setActiveTab] = useState<FilterTab>('Suggestions');
    const [sortConfig, setSortConfig] = useState<{ key: SortableField; direction: SortDirection } | null>({ key: 'searchVolume', direction: 'desc'});
    
    const [filters, setFilters] = useState({
        searchVolume: { min: '', max: '' },
        trend: { min: '', max: '' },
        cpc: { min: '', max: '' },
        competition: { min: '', max: '' },
        suggestion: new Set<string>(),
    });
    const [activeFilter, setActiveFilter] = useState<SortableField | null>(null);
    const filterPopupRef = useRef<HTMLDivElement>(null);


    const handleSearch = useCallback(async (searchKeyword: string) => {
        if (!searchKeyword.trim()) {
            setError('Please enter a keyword to research.');
            return;
        }
        setIsLoading(true);
        setError('');
        setResults([]);
        setSelectedKeywords(new Set());
        setAiSuggestions('');
        setIsSuggestionLoading(false);
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `
                You are a professional keyword research tool API. For the keyword "${searchKeyword}" on "${source}", generate a comprehensive list of 100 related keywords.
                Your response MUST be a stream of newline-delimited JSON objects. Each object on a new line must have this exact structure:
                {
                  "keyword": "string",
                  "searchVolume": number,
                  "trend": number,
                  "cpc": number,
                  "competition": number (0-100),
                  "suggestion": "string" (A 1-2 word strategic suggestion like 'High Potential', 'Good Opportunity', 'Niche Target', 'Very Competitive', 'Monitor Trend')
                }
                Do not include any other text, explanations, or JSON array brackets. Start streaming the JSON objects immediately.
            `;

            const stream = await ai.models.generateContentStream({
                model: 'gemini-2.5-pro',
                contents: prompt,
                config: { tools: [{ googleSearch: {} }] },
            });
            
            let buffer = '';
            const collectedKeywords: KeywordResult[] = [];
            for await (const chunk of stream) {
                buffer += chunk.text;
                const lines = buffer.split('\n');
                
                buffer = lines.pop() || ''; 
    
                for (const line of lines) {
                    if (line.trim()) {
                        try {
                            const keywordData: KeywordResult = JSON.parse(line);
                            collectedKeywords.push(keywordData);
                            if (collectedKeywords.length % 5 === 0) {
                                setResults([...collectedKeywords]);
                            }
                        } catch (e) {
                            console.warn("Failed to parse streamed line:", line);
                        }
                    }
                }
            }
            if (buffer.trim()) {
                 try {
                    const keywordData = JSON.parse(buffer);
                    collectedKeywords.push(keywordData);
                } catch (e) {
                    console.warn("Failed to parse final buffer:", buffer);
                }
            }

            setResults(collectedKeywords);
            setIsLoading(false);

            if (collectedKeywords.length > 0) {
                setIsSuggestionLoading(true);
                const keywordSample = collectedKeywords.slice(0, 30).map((k: KeywordResult) => 
                    `- ${k.keyword} (Volume: ${k.searchVolume}, Competition: ${k.competition})`
                ).join('\n');
                
                const suggestionPrompt = `
                    You are an expert SEO strategist. Based on the following keyword data for "${searchKeyword}", provide actionable suggestions for a content strategy.
                    Your response must be in Markdown format and include these sections:
                    1.  **## Top Keywords to Target:** List 3-5 high-volume keywords.
                    2.  **## Long-Tail Opportunities:** List 3-5 longer, specific keywords.
                    3.  **## Low-Competition Gems:** Identify 3-5 keywords with good volume and low competition.
                    4.  **## Content Strategy Summary:** Provide a short paragraph on how to use these keywords.
                `;

                const suggestionResponse = await ai.models.generateContent({
                    model: 'gemini-2.5-pro',
                    contents: suggestionPrompt,
                });
                setAiSuggestions(suggestionResponse.text);
            }

        } catch (err: any) {
            setError(err.message || 'An error occurred during research. The AI might be busy. Please try again.');
            console.error(err);
            setIsLoading(false);
        } finally {
            setIsSuggestionLoading(false);
        }
    }, [source]);

    const summary = useMemo(() => {
        if (results.length === 0) return null;
        
        const totalKeywords = results.length;
        const totalSearchVolume = results.reduce((sum, k) => sum + k.searchVolume, 0);
        const averageTrend = results.reduce((sum, k) => sum + k.trend, 0) / totalKeywords;
        const averageCpc = results.reduce((sum, k) => sum + k.cpc, 0) / totalKeywords;
        const averageCompetition = results.reduce((sum, k) => sum + k.competition, 0) / totalKeywords;

        return { totalKeywords, totalSearchVolume, averageTrend, averageCpc, averageCompetition };
    }, [results]);

    const filteredAndSortedKeywords = useMemo(() => {
        let filtered = [...results];
        
        switch (activeTab) {
            case 'Questions':
                filtered = results.filter(r => 
                    /^(what|how|why|when|where|who|is|can|do|are|does|which|should)\s/i.test(r.keyword) || r.keyword.includes('?')
                );
                break;
            case 'Prepositions':
                filtered = results.filter(r =>
                    /\s(for|with|to|in|on|without|like|near|from|about|under|over|between)\s/i.test(r.keyword)
                );
                break;
            default:
                break;
        }
        
        // Apply column filters
        filtered = filtered.filter(item => {
            const { searchVolume, trend, cpc, competition, suggestion } = filters;
            const svMin = parseFloat(searchVolume.min);
            const svMax = parseFloat(searchVolume.max);
            const trendMin = parseFloat(trend.min);
            const trendMax = parseFloat(trend.max);
            const cpcMin = parseFloat(cpc.min);
            const cpcMax = parseFloat(cpc.max);
            const compMin = parseFloat(competition.min);
            const compMax = parseFloat(competition.max);

            if (!isNaN(svMin) && item.searchVolume < svMin) return false;
            if (!isNaN(svMax) && item.searchVolume > svMax) return false;
            if (!isNaN(trendMin) && item.trend < trendMin) return false;
            if (!isNaN(trendMax) && item.trend > trendMax) return false;
            if (!isNaN(cpcMin) && item.cpc < cpcMin) return false;
            if (!isNaN(cpcMax) && item.cpc > cpcMax) return false;
            if (!isNaN(compMin) && item.competition < compMin) return false;
            if (!isNaN(compMax) && item.competition > compMax) return false;
            if (suggestion.size > 0 && !suggestion.has(item.suggestion)) return false;

            return true;
        });


        if (sortConfig !== null) {
            filtered.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];
                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return filtered;
    }, [results, activeTab, sortConfig, filters]);
    
    // --- Filter Popup Logic ---
    const uniqueSuggestions = useMemo(() => Array.from(new Set(results.map(r => r.suggestion).filter(Boolean))), [results]);
    const isFilterActive = (key: SortableField) => {
        if (key === 'suggestion') return filters.suggestion.size > 0;
        const filter = filters[key as keyof typeof filters];
        if (typeof filter === 'object' && filter !== null && 'min' in filter) {
             return filter.min !== '' || filter.max !== '';
        }
        return false;
    };
    
    // FIX: Changed `field` type from a literal union to `string` to accommodate both 'min'/'max' and dynamic suggestion strings.
    // A type assertion is used in the 'else' block to maintain type safety for numeric filters.
    const handleFilterChange = (key: SortableField, field: string, value: string | boolean) => {
        setFilters(prev => {
            if (key === 'suggestion') {
                const newSet = new Set(prev.suggestion);
                if (value) {
                    newSet.add(field);
                } else {
                    newSet.delete(field);
                }
                return { ...prev, suggestion: newSet };
            } else {
                const currentFilter = prev[key as Exclude<SortableField, 'suggestion' | 'keyword'>];
                return { ...prev, [key]: { ...currentFilter, [field as 'min' | 'max']: value } };
            }
        });
    };
    const clearFilter = (key: SortableField) => {
        if (key === 'suggestion') {
            setFilters(prev => ({...prev, suggestion: new Set()}));
        } else {
            setFilters(prev => ({...prev, [key]: { min: '', max: '' }}));
        }
    };
    
    const clearAllFilters = () => {
         setFilters({
            searchVolume: { min: '', max: '' },
            trend: { min: '', max: '' },
            cpc: { min: '', max: '' },
            competition: { min: '', max: '' },
            suggestion: new Set<string>(),
        });
    };
    
    // Close popup on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterPopupRef.current && !filterPopupRef.current.contains(event.target as Node) && !(event.target as HTMLElement).closest('.filter-btn')) {
                setActiveFilter(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    // Export to Excel
    const handleExportExcel = () => {
        const dataToExport = filteredAndSortedKeywords.map(r => ({
            'Keyword': r.keyword,
            'Search Volume': r.searchVolume,
            'Trend (%)': r.trend,
            'CPC (USD)': r.cpc,
            'Competition': r.competition,
            'AI Suggestion': r.suggestion,
        }));
        const ws = window.XLSX.utils.json_to_sheet(dataToExport);
        const wb = window.XLSX.utils.book_new();
        window.XLSX.utils.book_append_sheet(wb, ws, "Keywords");
        window.XLSX.writeFile(wb, `${keyword}_keywords.xlsx`);
    };

    return (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 max-w-7xl mx-auto text-slate-800 dark:text-slate-200">
            <div className="flex justify-between items-center p-2 border-b dark:border-slate-700">
                <h1 className="text-xl font-bold">Keyword Tool</h1>
                <div className="flex items-center gap-4 text-sm">
                    <span>Find Keywords</span>
                    <span>Check Search Volume</span>
                    <button className="px-4 py-2 border rounded-lg dark:border-slate-600">Keywords ({selectedKeywords.size})</button>
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg">Account</button>
                </div>
            </div>

            <div className="p-4 space-y-6">
                <div className="flex items-center gap-4 border-b dark:border-slate-700 pb-4 overflow-x-auto">
                    {sources.map(s => (
                        <button key={s.id} onClick={() => setSource(s.id)} className={`flex-shrink-0 flex items-center gap-2 p-2 border-b-2 transition-colors ${source === s.id ? 'border-red-500 text-slate-800 dark:text-slate-100' : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}>
                            {React.cloneElement(s.icon, {className: "w-5 h-5"})}
                            <span className="text-sm font-semibold">{s.id}</span>
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <input type="text" value={keyword} onChange={e => setKeyword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch(keyword)} className="flex-grow p-3 border border-slate-300 rounded-md dark:bg-slate-800 dark:border-slate-600" />
                    <select className="p-3 border rounded-md dark:bg-slate-800 dark:border-slate-600"><option>Global / Worldwide</option></select>
                    <select className="p-3 border rounded-md dark:bg-slate-800 dark:border-slate-600"><option>English</option></select>
                    <button onClick={() => handleSearch(keyword)} disabled={isLoading} className="p-3 bg-purple-600 text-white rounded-md">
                        {isLoading ? <SpinnerIcon className="w-6 h-6 animate-spin"/> : <SearchIcon className="w-6 h-6"/>}
                    </button>
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                
                <div className="border-b dark:border-slate-700">
                    <div className="flex space-x-8">
                        {(['Suggestions', 'Questions', 'Prepositions', 'Hashtags'] as FilterTab[]).map(tab => (
                             <button key={tab} onClick={() => setActiveTab(tab)} className={`py-2 px-1 border-b-2 font-semibold ${activeTab === tab ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>
                                {tab === 'Suggestions' ? `Keyword ${tab}` : tab}
                            </button>
                        ))}
                    </div>
                </div>

                {(isLoading && results.length === 0) && <div className="flex justify-center p-16"><SpinnerIcon className="w-12 h-12 animate-spin text-purple-600" /></div>}
                
                {!isLoading && results.length === 0 && activeTab !== 'Hashtags' && (
                    <div className="text-center p-16 text-slate-500 dark:text-slate-400">
                        <p>Enter a keyword and click the search button to see results.</p>
                    </div>
                )}
                
                 {activeTab === 'Hashtags' ? (
                    <HashtagView keywords={results} />
                ) : results.length > 0 && (
                    <div className="space-y-6">
                        {summary && (
                            <div className="p-6 border rounded-lg dark:border-slate-700">
                                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center items-center">
                                    <div><p className="text-sm text-slate-500 dark:text-slate-400">Total Keywords</p><p className="font-bold text-xl text-slate-800 dark:text-slate-100">{formatNumber(summary.totalKeywords)}</p></div>
                                    <div><p className="text-sm text-slate-500 dark:text-slate-400">Total Search Volume</p><p className="font-bold text-xl text-slate-800 dark:text-slate-100">{formatNumber(summary.totalSearchVolume)}</p></div>
                                    <div><p className="text-sm text-slate-500 dark:text-slate-400">Average Trend</p><p className={`font-bold text-xl ${summary.averageTrend > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>↑ {summary.averageTrend.toFixed(1)}%</p></div>
                                    <div><p className="text-sm text-slate-500 dark:text-slate-400">Average CPC (USD)</p><p className="font-bold text-xl text-slate-800 dark:text-slate-100">${summary.averageCpc.toFixed(2)}</p></div>
                                    <div><p className="text-sm text-slate-500 dark:text-slate-400">Average Competition</p><p className="font-bold text-xl text-slate-800 dark:text-slate-100">{formatCompetition(Math.round(summary.averageCompetition))}</p></div>
                                    <button onClick={handleExportExcel} className="flex items-center justify-center gap-2 px-3 py-2 text-sm bg-green-100 text-green-800 rounded font-semibold dark:bg-green-900/50 dark:text-green-300">
                                        <DownloadIcon className="w-4 h-4" /> Export Excel
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        <div className="flex justify-end">
                             <button onClick={clearAllFilters} className="text-sm text-blue-600 hover:underline dark:text-sky-400">Clear All Filters</button>
                        </div>

                        <div className="overflow-x-auto relative">
                             {activeFilter && (
                                <div ref={filterPopupRef} className="absolute z-10 top-8 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg border dark:border-slate-600 w-64 space-y-3">
                                   <h4 className="font-semibold text-sm">Filter by {activeFilter}</h4>
                                   {activeFilter === 'suggestion' ? (
                                        <div className="max-h-48 overflow-y-auto space-y-1">
                                            {uniqueSuggestions.map(s => (
                                                <label key={s} className="flex items-center gap-2 text-sm">
                                                    <input type="checkbox" checked={filters.suggestion.has(s)} onChange={e => handleFilterChange('suggestion', s, e.target.checked)} className="rounded" />
                                                    {s}
                                                </label>
                                            ))}
                                        </div>
                                   ) : (
                                       <div className="space-y-2">
                                           <input type="number" placeholder="Min" value={filters[activeFilter as Exclude<SortableField, 'suggestion'|'keyword'>].min} onChange={e => handleFilterChange(activeFilter as any, 'min', e.target.value)} className="w-full p-2 border rounded text-sm dark:bg-slate-700 dark:border-slate-500" />
                                           <input type="number" placeholder="Max" value={filters[activeFilter as Exclude<SortableField, 'suggestion'|'keyword'>].max} onChange={e => handleFilterChange(activeFilter as any, 'max', e.target.value)} className="w-full p-2 border rounded text-sm dark:bg-slate-700 dark:border-slate-500" />
                                       </div>
                                   )}
                                    <div className="flex justify-between pt-2">
                                        <button onClick={() => clearFilter(activeFilter)} className="text-xs text-blue-600">Clear</button>
                                        <button onClick={() => setActiveFilter(null)} className="text-xs bg-slate-200 dark:bg-slate-600 px-2 py-1 rounded">Close</button>
                                    </div>
                                </div>
                            )}

                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b dark:border-slate-700">
                                        <th className="p-2 text-left"><input type="checkbox"/></th>
                                        <th className="p-2 text-left font-semibold text-slate-600 dark:text-slate-300">Keywords</th>
                                        {['searchVolume', 'trend', 'cpc', 'competition', 'suggestion'].map(key => (
                                            <th key={key} className="p-2 text-left font-semibold text-slate-600 dark:text-slate-300">
                                                <div className="flex items-center gap-1">
                                                    <span>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                                                    <button onClick={() => setActiveFilter(key as SortableField)} className="filter-btn">
                                                        <FilterIcon className={`w-3 h-3 ${isFilterActive(key as SortableField) ? 'text-blue-500' : 'text-slate-400'}`} isActive={isFilterActive(key as SortableField)} />
                                                    </button>
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAndSortedKeywords.map(r => (
                                        <tr key={r.keyword} className="border-t dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                            <td className="p-3"><input type="checkbox" /></td>
                                            <td className="p-3 font-medium text-slate-800 dark:text-slate-100">{r.keyword}</td>
                                            <td className="p-3 text-slate-600 dark:text-slate-300">{formatNumber(r.searchVolume)}</td>
                                            <td className="p-3">
                                                <span className={`${r.trend > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                    {r.trend > 0 ? `↑ +${r.trend}%` : `↓ ${r.trend}%`}
                                                </span>
                                            </td>
                                            <td className="p-3 text-slate-600 dark:text-slate-300">${r.cpc.toFixed(2)}</td>
                                            <td className="p-3">
                                                <span className={r.competition > 66 ? 'text-red-600 dark:text-red-400' : r.competition > 33 ? 'text-yellow-500 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}>
                                                    {formatCompetition(r.competition)}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                <SuggestionBadge suggestion={r.suggestion} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                             {isLoading && <div className="flex justify-center p-8"><SpinnerIcon className="w-8 h-8 animate-spin text-purple-600"/></div>}
                        </div>
                        
                        {isSuggestionLoading && (
                            <div className="flex justify-center items-center gap-2 p-8 text-slate-500 dark:text-slate-400">
                                <SpinnerIcon className="w-8 h-8 animate-spin text-purple-600" />
                                <p>Generating AI SEO Strategy...</p>
                            </div>
                        )}
                        
                        {aiSuggestions && !isSuggestionLoading && (
                            <div className="mt-8 p-6 border rounded-lg bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700">
                                <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100">✨ AI SEO Strategy Suggestions</h3>
                                <SimpleMarkdownRenderer text={aiSuggestions} />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default KeywordResearchTool;