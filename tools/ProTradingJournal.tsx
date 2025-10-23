import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { TrashIcon, SpinnerIcon, ChartIcon, ImageIcon, DownloadIcon } from '../components/icons';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

// --- TYPE DEFINITIONS ---
interface Trade {
    id: string;
    date: string;
    symbol: string;
    type: 'Buy' | 'Sell';
    quantity: number;
    entryPrice: number;
    exitPrice: number;
    stopLoss?: number;
    takeProfit?: number;
    notes: string;
    strategy?: string;
    screenshot?: string; // base64
    profitOrLoss: number;
    returnPercentage: number;
    riskRewardRatio?: number;
}

interface Goal {
    profitTarget: number;
    winRateTarget: number;
    tradeCountTarget: number;
}

interface PerformanceSummary {
    totalPL: number;
    winRate: number;
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    averageRR: number;
    averageWin: number;
    averageLoss: number;
    maxDrawdown: number;
}


// --- MAIN COMPONENT ---
const ProTradingJournal: React.FC = () => {
    const [trades, setTrades] = useState<Trade[]>([]);
    const [goals, setGoals] = useState<Goal>({ profitTarget: 1000, winRateTarget: 60, tradeCountTarget: 20 });
    const [activeTab, setActiveTab] = useState<'dashboard' | 'log'>('log');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({ dateRange: '', symbol: '', strategy: '' });
    const [aiInsight, setAiInsight] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const importInputRef = useRef<HTMLInputElement>(null);

    // Load data from localStorage
    useEffect(() => {
        try {
            const savedTrades = localStorage.getItem('adv_trader_journal_trades_v2');
            const savedGoals = localStorage.getItem('adv_trader_journal_goals_v2');
            if (savedTrades) setTrades(JSON.parse(savedTrades));
            if (savedGoals) setGoals(JSON.parse(savedGoals));
        } catch (e) { console.error("Failed to load data", e); } finally { setIsLoading(false); }
    }, []);

    // Save data to localStorage
    useEffect(() => { localStorage.setItem('adv_trader_journal_trades_v2', JSON.stringify(trades)); }, [trades]);
    useEffect(() => { localStorage.setItem('adv_trader_journal_goals_v2', JSON.stringify(goals)); }, [goals]);

    const handleSaveTrade = (trade: Omit<Trade, 'id' | 'profitOrLoss' | 'returnPercentage' | 'riskRewardRatio'> & { screenshot?: string }, id?: string) => {
        const pl = (trade.exitPrice - trade.entryPrice) * trade.quantity * (trade.type === 'Buy' ? 1 : -1);
        const ret = (pl / (trade.entryPrice * trade.quantity)) * 100;
        let rr;
        if (trade.stopLoss && trade.takeProfit) {
            const potentialLoss = Math.abs(trade.entryPrice - trade.stopLoss);
            const potentialProfit = Math.abs(trade.takeProfit - trade.entryPrice);
            if (potentialLoss > 0) rr = potentialProfit / potentialLoss;
        }

        const newTradeData = { ...trade, profitOrLoss: pl, returnPercentage: ret, riskRewardRatio: rr };

        if (id) {
            setTrades(prev => prev.map(t => t.id === id ? { ...t, ...newTradeData } : t));
        } else {
            setTrades(prev => [{ id: `T-${Date.now()}`, ...newTradeData }, ...prev]);
        }
        setIsModalOpen(false);
        setEditingTrade(null);
    };

    const handleDeleteTrade = (id: string) => {
        if (window.confirm("Are you sure? This action cannot be undone.")) {
            setTrades(prev => prev.filter(t => t.id !== id));
        }
    };

    const filteredTrades = useMemo(() => {
        return trades
            .filter(t => filters.symbol ? t.symbol.toLowerCase().includes(filters.symbol.toLowerCase()) : true)
            .filter(t => filters.strategy ? t.strategy?.toLowerCase().includes(filters.strategy.toLowerCase()) : true)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [trades, filters]);

    const performanceSummary = useMemo((): PerformanceSummary => {
        const totalTrades = filteredTrades.length;
        if (totalTrades === 0) return { totalPL: 0, winRate: 0, totalTrades: 0, winningTrades: 0, losingTrades: 0, averageRR: 0, averageWin: 0, averageLoss: 0, maxDrawdown: 0 };

        const winning = filteredTrades.filter(t => t.profitOrLoss > 0);
        const losing = filteredTrades.filter(t => t.profitOrLoss < 0);
        const totalPL = filteredTrades.reduce((sum, t) => sum + t.profitOrLoss, 0);
        const totalWinAmount = winning.reduce((sum, t) => sum + t.profitOrLoss, 0);
        const totalLossAmount = losing.reduce((sum, t) => sum + t.profitOrLoss, 0);

        let cumulativePl = 0;
        let peak = 0;
        let maxDd = 0;
        [...filteredTrades].reverse().forEach(t => {
            cumulativePl += t.profitOrLoss;
            if (cumulativePl > peak) peak = cumulativePl;
            const drawdown = peak - cumulativePl;
            if (drawdown > maxDd) maxDd = drawdown;
        });

        const tradesWithRR = filteredTrades.filter(t => t.riskRewardRatio);

        return {
            totalPL,
            winRate: (winning.length / totalTrades) * 100,
            totalTrades,
            winningTrades: winning.length,
            losingTrades: losing.length,
            averageRR: tradesWithRR.length > 0 ? tradesWithRR.reduce((sum, t) => sum + (t.riskRewardRatio || 0), 0) / tradesWithRR.length : 0,
            averageWin: winning.length > 0 ? totalWinAmount / winning.length : 0,
            averageLoss: losing.length > 0 ? totalLossAmount / losing.length : 0,
            maxDrawdown: maxDd,
        };
    }, [filteredTrades]);
    
    const handleGenerateAiInsight = async () => {
        if(trades.length < 5) {
            setAiInsight("Please add at least 5 trades for a meaningful analysis.");
            return;
        }
        setIsAiLoading(true);
        setAiInsight('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const tradesSummary = filteredTrades.slice(0, 20).map(t => `Trade on ${t.symbol}: P/L=${t.profitOrLoss.toFixed(2)}, Strategy=${t.strategy || 'N/A'}, Notes=${t.notes.substring(0, 100)}...`).join('\n');
            const prompt = `
                You are a professional trading psychologist and performance coach. Based on the following summary of my recent trades and overall performance, provide actionable insights in well-structured Markdown format.

                Overall Performance:
                - Total P/L: $${performanceSummary.totalPL.toFixed(2)}
                - Win Rate: ${performanceSummary.winRate.toFixed(2)}%
                - Average Win: $${performanceSummary.averageWin.toFixed(2)}
                - Average Loss: $${performanceSummary.averageLoss.toFixed(2)}
                - Number of Trades: ${performanceSummary.totalTrades}
                
                Recent Trades Sample:
                ${tradesSummary}
                
                Your analysis should cover:
                1.  **## What You're Doing Right:** Identify positive patterns (e.g., "Your winning trades have a solid average profit...").
                2.  **## Potential Mistakes to Avoid:** Based on losing trades or notes, identify potential emotional mistakes (e.g., "Notes mentioning 'FOMO' suggest emotional entries...").
                3.  **## Actionable Suggestion:** Provide one clear, actionable tip to improve consistency or profitability (e.g., "Consider implementing a stricter rule for your stop-loss...").
            `;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            setAiInsight(response.text);
        } catch(e) {
            console.error(e);
            setAiInsight("An error occurred while generating insights. Please try again.");
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleBackup = () => {
        const jsonString = JSON.stringify(trades, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'trader_journal_backup.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
         const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedTrades = JSON.parse(e.target?.result as string);
                if (Array.isArray(importedTrades)) {
                     if (window.confirm("This will overwrite your current journal. Are you sure?")) {
                        setTrades(importedTrades);
                    }
                } else { throw new Error("Invalid format"); }
            } catch (error) { alert("Failed to import. Invalid JSON file."); }
        };
        reader.readAsText(file);
        event.target.value = ''; // Allow re-uploading same file
    };

    if (isLoading) return <div className="flex justify-center items-center h-full"><SpinnerIcon className="w-10 h-10 animate-spin text-[var(--theme-primary)]" /></div>;

    return (
        <div className="space-y-6">
             {isModalOpen && <TradeModal trade={editingTrade} onSave={handleSaveTrade} onClose={() => { setIsModalOpen(false); setEditingTrade(null); }} />}
            <div className="pb-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Advanced Trader Journal</h2>
                    <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">Record, analyze, and improve your trading performance.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => importInputRef.current?.click()} className="px-3 py-2 text-sm bg-slate-200 rounded-md hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600">Import</button>
                    <button onClick={handleBackup} className="px-3 py-2 text-sm bg-slate-200 rounded-md hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600">Backup</button>
                    <input type="file" ref={importInputRef} onChange={handleImport} className="hidden" accept=".json" />
                </div>
            </div>

            <div className="border-b border-gray-200 dark:border-slate-700">
                <nav className="-mb-px flex space-x-8">
                    <button onClick={() => setActiveTab('dashboard')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'dashboard' ? 'border-[var(--theme-primary)] text-[var(--theme-primary)] dark:border-sky-400 dark:text-sky-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}>Dashboard</button>
                    <button onClick={() => setActiveTab('log')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'log' ? 'border-[var(--theme-primary)] text-[var(--theme-primary)] dark:border-sky-400 dark:text-sky-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}>Trade Log</button>
                </nav>
            </div>

            {activeTab === 'dashboard' && (
                <DashboardView summary={performanceSummary} trades={filteredTrades} goals={goals} aiInsight={aiInsight} isAiLoading={isAiLoading} onGenerateAiInsight={handleGenerateAiInsight} />
            )}
            {activeTab === 'log' && (
                <TradeLogView 
                    trades={filteredTrades} 
                    filters={filters} 
                    onFilterChange={setFilters} 
                    onEdit={(trade) => { setEditingTrade(trade); setIsModalOpen(true); }} 
                    onDelete={handleDeleteTrade}
                    onAddNew={() => { setEditingTrade(null); setIsModalOpen(true); }}
                />
            )}
        </div>
    );
};

const StatCard: React.FC<{ title: string; value: string; color?: string; }> = ({ title, value, color }) => (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border dark:border-slate-700">
        <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
        <p className={`text-2xl font-bold ${color || 'text-slate-800 dark:text-slate-100'}`}>{value}</p>
    </div>
);

const LineChart: React.FC<{ data: { label: string, value: number }[] }> = ({ data }) => {
    const chartRef = useRef<SVGSVGElement>(null);
    if (data.length < 2) return <div className="flex items-center justify-center h-full text-sm text-slate-400">Add at least 2 trades to see your equity curve.</div>;
    const width = 500, height = 200, padding = 30;
    const values = data.map(d => d.value);
    const minVal = Math.min(0, ...values);
    const maxVal = Math.max(0, ...values);
    const range = maxVal - minVal || 1;

    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * (width - 2 * padding) + padding;
        const y = height - padding - ((d.value - minVal) / range) * (height - 2 * padding);
        return `${x},${y}`;
    }).join(' ');

    return <svg ref={chartRef} viewBox={`0 0 ${width} ${height}`} className="w-full h-auto"><polyline fill="none" stroke="var(--theme-primary)" strokeWidth="2" points={points} /></svg>;
};

const MarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
    return <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: text.replace(/\n/g, '<br />').replace(/## (.*)/g, '<h3>$1</h3>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>') }} />;
};


const DashboardView: React.FC<{summary: PerformanceSummary, trades: Trade[], goals: Goal, aiInsight: string, isAiLoading: boolean, onGenerateAiInsight: () => void}> = ({summary, trades, goals, aiInsight, isAiLoading, onGenerateAiInsight}) => {
    const topWinning = useMemo(() => [...trades].filter(t => t.profitOrLoss > 0).sort((a, b) => b.profitOrLoss - a.profitOrLoss).slice(0, 5), [trades]);
    const topLosing = useMemo(() => [...trades].filter(t => t.profitOrLoss < 0).sort((a, b) => a.profitOrLoss - b.profitOrLoss).slice(0, 5), [trades]);
    const equityCurveData = useMemo(() => {
        let cumulativePL = 0;
        return [...trades].reverse().map((t, i) => {
            cumulativePL += t.profitOrLoss;
            return { label: (i+1).toString(), value: cumulativePL };
        });
    }, [trades]);

    const handleExportPdf = async () => {
        const doc = new jsPDF();
        doc.text("Trading Performance Report", 14, 20);
        
        autoTable(doc, {
            startY: 30,
            head: [['Metric', 'Value']],
            body: [
                ['Total P&L', `$${summary.totalPL.toFixed(2)}`],
                ['Win Rate', `${summary.winRate.toFixed(1)}%`],
                ['Total Trades', summary.totalTrades],
                ['Avg R:R', summary.averageRR > 0 ? `1 : ${summary.averageRR.toFixed(2)}` : 'N/A'],
                ['Max Drawdown', `$${summary.maxDrawdown.toFixed(2)}`],
            ]
        });

        if (topWinning.length > 0) {
            doc.text("Top 5 Winning Trades", 14, (doc as any).lastAutoTable.finalY + 15);
            autoTable(doc, {
                startY: (doc as any).lastAutoTable.finalY + 20,
                head: [['Symbol', 'P/L']],
                body: topWinning.map(t => [t.symbol, `$${t.profitOrLoss.toFixed(2)}`])
            });
        }
    
        if (topLosing.length > 0) {
            doc.text("Top 5 Losing Trades", 14, (doc as any).lastAutoTable.finalY + 15);
            autoTable(doc, {
                startY: (doc as any).lastAutoTable.finalY + 20,
                head: [['Symbol', 'P/L']],
                body: topLosing.map(t => [t.symbol, `$${t.profitOrLoss.toFixed(2)}`])
            });
        }

        const equityChartElement = document.getElementById('equity-chart-container');
        if (equityChartElement) {
            const canvas = await html2canvas(equityChartElement, {backgroundColor: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff'});
            const imgData = canvas.toDataURL('image/png');
            autoTable(doc, {}); // Ensure autotable finishes
            const lastY = (doc as any).lastAutoTable.finalY || 30;
            if(lastY > 180) doc.addPage();
            doc.text("Equity Curve", 14, lastY > 180 ? 20 : lastY + 10);
            doc.addImage(imgData, 'PNG', 14, lastY > 180 ? 30 : lastY + 20, 180, 80);
        }

        doc.save('trading-report.pdf');
    };

    const handleExportExcel = () => {
        const wb = window.XLSX.utils.book_new();

        const summaryData = [
            { Metric: 'Total P&L', Value: summary.totalPL },
            { Metric: 'Win Rate (%)', Value: summary.winRate },
            { Metric: 'Total Trades', Value: summary.totalTrades },
            { Metric: 'Avg R:R', Value: summary.averageRR },
            { Metric: 'Max Drawdown', Value: summary.maxDrawdown },
        ];
        const ws_summary = window.XLSX.utils.json_to_sheet(summaryData);
        window.XLSX.utils.book_append_sheet(wb, ws_summary, "Performance Summary");

        if (topWinning.length > 0) {
            const ws_wins = window.XLSX.utils.json_to_sheet(topWinning.map(t => ({ Symbol: t.symbol, 'P/L': t.profitOrLoss, Date: t.date })));
            window.XLSX.utils.book_append_sheet(wb, ws_wins, "Top Wins");
        }

        if (topLosing.length > 0) {
            const ws_losses = window.XLSX.utils.json_to_sheet(topLosing.map(t => ({ Symbol: t.symbol, 'P/L': t.profitOrLoss, Date: t.date })));
            window.XLSX.utils.book_append_sheet(wb, ws_losses, "Top Losses");
        }
    
        window.XLSX.writeFile(wb, "trading-dashboard-report.xlsx");
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <StatCard title="Total P&L" value={`$${summary.totalPL.toFixed(2)}`} color={summary.totalPL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} />
                <StatCard title="Win Rate" value={`${summary.winRate.toFixed(1)}%`} />
                <StatCard title="Total Trades" value={summary.totalTrades.toString()} />
                <StatCard title="Avg R:R" value={summary.averageRR > 0 ? `1:${summary.averageRR.toFixed(2)}` : 'N/A'} />
                <StatCard title="Max Drawdown" value={`$${summary.maxDrawdown.toFixed(2)}`} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div id="equity-chart-container" className="lg:col-span-2 bg-white dark:bg-slate-800 p-4 rounded-lg border dark:border-slate-700">
                    <h3 className="font-bold mb-2 text-slate-800 dark:text-slate-100">Cumulative P&L</h3>
                    <LineChart data={equityCurveData} />
                </div>
                 <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border dark:border-slate-700">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-slate-800 dark:text-slate-100">AI Performance Coach</h3>
                        <div className="flex items-center gap-2">
                            <button onClick={handleExportPdf} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-red-100 text-red-700 rounded-md hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300"><DownloadIcon className="w-4 h-4" /> PDF</button>
                            <button onClick={handleExportExcel} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-green-100 text-green-700 rounded-md hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300"><DownloadIcon className="w-4 h-4" /> Excel</button>
                        </div>
                    </div>
                    <div className="mt-2 text-sm max-h-48 overflow-y-auto pr-2">
                        {isAiLoading ? <div className="flex justify-center"><SpinnerIcon className="w-6 h-6 animate-spin"/></div> : aiInsight ? <MarkdownRenderer text={aiInsight} /> : <p className="text-slate-500">Click below to get insights on your performance.</p>}
                    </div>
                    <button onClick={onGenerateAiInsight} disabled={isAiLoading} className="mt-2 px-3 py-1 text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 rounded font-semibold">Analyze My Trades</button>
                </div>
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border dark:border-slate-700">
                     <h3 className="font-bold text-green-600 dark:text-green-400 mb-2">Top 5 Winning Trades</h3>
                     <ul className="text-sm space-y-1">
                         {topWinning.map(t => <li key={t.id} className="flex justify-between"><span>{t.symbol}</span><span className="font-semibold">${t.profitOrLoss.toFixed(2)}</span></li>)}
                     </ul>
                 </div>
                 <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border dark:border-slate-700">
                     <h3 className="font-bold text-red-600 dark:text-red-400 mb-2">Top 5 Losing Trades</h3>
                     <ul className="text-sm space-y-1">
                         {topLosing.map(t => <li key={t.id} className="flex justify-between"><span>{t.symbol}</span><span className="font-semibold">${t.profitOrLoss.toFixed(2)}</span></li>)}
                     </ul>
                 </div>
            </div>
        </div>
    );
}

const TradeLogView: React.FC<{trades: Trade[], filters: any, onFilterChange: (f: any) => void, onEdit: (t: Trade) => void, onDelete: (id: string) => void, onAddNew: () => void}> = ({trades, filters, onFilterChange, onEdit, onDelete, onAddNew}) => {
    
    const exportPdf = () => {
        const doc = new jsPDF();
        doc.text("Trade Log", 14, 15);
        autoTable(doc, {
            head: [['Date', 'Symbol', 'Type', 'Entry', 'Exit', 'Qty', 'P/L', '% Return', 'Strategy']],
            body: trades.map(t => [
                new Date(t.date).toLocaleDateString(),
                t.symbol,
                t.type,
                t.entryPrice.toFixed(2),
                t.exitPrice.toFixed(2),
                t.quantity,
                t.profitOrLoss.toFixed(2),
                `${t.returnPercentage.toFixed(2)}%`,
                t.strategy || ''
            ]),
            startY: 20,
        });
        doc.save('trade-log.pdf');
    };

    const exportExcel = () => {
        const data = trades.map(t => ({
            'Date': new Date(t.date).toLocaleDateString(),
            'Symbol': t.symbol,
            'Type': t.type,
            'Entry Price': t.entryPrice,
            'Exit Price': t.exitPrice,
            'Quantity': t.quantity,
            'P/L ($)': t.profitOrLoss,
            'Return (%)': t.returnPercentage,
            'Strategy': t.strategy,
            'Notes': t.notes
        }));
        const ws = window.XLSX.utils.json_to_sheet(data);
        const wb = window.XLSX.utils.book_new();
        window.XLSX.utils.book_append_sheet(wb, ws, "Trade Log");
        window.XLSX.writeFile(wb, "trade-log.xlsx");
    };
    
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="flex gap-2">
                     <input type="text" placeholder="Filter by Symbol..." value={filters.symbol} onChange={e => onFilterChange({...filters, symbol: e.target.value})} className="p-2 border border-slate-300 rounded-md text-sm bg-white text-slate-900 placeholder-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                     <input type="text" placeholder="Filter by Strategy..." value={filters.strategy} onChange={e => onFilterChange({...filters, strategy: e.target.value})} className="p-2 border border-slate-300 rounded-md text-sm bg-white text-slate-900 placeholder-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                </div>
                 <div className="flex items-center gap-2">
                    <button onClick={exportPdf} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-red-100 text-red-700 rounded-md hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300">
                        <DownloadIcon className="w-4 h-4" /> PDF
                    </button>
                    <button onClick={exportExcel} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-green-100 text-green-700 rounded-md hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300">
                        <DownloadIcon className="w-4 h-4" /> Excel
                    </button>
                    <button onClick={onAddNew} className="px-4 py-2 bg-[var(--theme-primary)] text-white font-semibold rounded-lg shadow-sm">Add New Trade</button>
                </div>
            </div>
            <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg border dark:border-slate-700">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-700 text-xs uppercase text-left">
                        <tr>
                            {['Date', 'Symbol', 'Type', 'P/L', '% Return', 'Strategy', 'Actions'].map(h => <th key={h} className="p-3">{h}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {trades.map(trade => (
                            <tr key={trade.id} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                <td className="p-3">{new Date(trade.date).toLocaleDateString()}</td>
                                <td className="p-3 font-semibold">{trade.symbol}</td>
                                <td className="p-3">{trade.type}</td>
                                <td className={`p-3 ${trade.profitOrLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>${trade.profitOrLoss.toFixed(2)}</td>
                                <td className={`p-3 ${trade.profitOrLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>{trade.returnPercentage.toFixed(2)}%</td>
                                <td className="p-3">{trade.strategy}</td>
                                <td className="p-3 flex gap-2">
                                    <button onClick={() => onEdit(trade)} className="text-blue-600 hover:underline">Edit</button> 
                                    <button onClick={() => onDelete(trade.id)}><TrashIcon className="w-4 h-4 text-red-500"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {trades.length === 0 && <p className="text-center p-8 text-slate-500 dark:text-slate-400">No trades found. Add a new trade to get started.</p>}
            </div>
        </div>
    );
}

// This component is now defined at the module level for better performance and code structure,
// preventing it from being redefined on every render of TradeModal.
const InputField: React.FC<{
    label: string;
    name: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    placeholder?: string;
    step?: string;
}> = ({ label, ...props }) => (
    <div>
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
        <input {...props} className="w-full p-2 mt-1 border border-slate-300 rounded bg-white text-slate-900 placeholder-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
    </div>
);

const TradeModal: React.FC<{trade: Trade | null, onSave: (t: any, id?: string) => void, onClose: () => void}> = ({trade, onSave, onClose}) => {
    const [form, setForm] = useState(trade || {date: new Date().toISOString().split('T')[0], type: 'Buy', quantity: 0, entryPrice: 0, exitPrice: 0, notes: '', strategy: ''});
    const [screenshot, setScreenshot] = useState(trade?.screenshot || null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;
        const isNumeric = ['quantity', 'entryPrice', 'exitPrice', 'stopLoss', 'takeProfit'].includes(name);
        setForm(prev => ({...prev, [name]: isNumeric ? parseFloat(value) || '' : value}));
    }

    const handleScreenshot = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => setScreenshot(event.target?.result as string);
            reader.readAsDataURL(file);
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({...form, screenshot}, (form as Trade).id);
    }
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <h2 className="font-bold text-lg mb-4">{trade ? 'Edit' : 'New'} Trade</h2>
                <form onSubmit={handleSubmit} className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-3">
                        <InputField label="Date" name="date" type="date" value={(form as any).date} onChange={handleChange} />
                        <InputField label="Symbol" name="symbol" value={(form as any).symbol || ''} onChange={handleChange} placeholder="e.g., AAPL" />
                    </div>
                     <div className="grid grid-cols-3 gap-3">
                        <div><label className="text-sm font-medium text-slate-700 dark:text-slate-300">Type</label><select name="type" value={(form as any).type} onChange={handleChange} className="w-full p-2 mt-1 border border-slate-300 rounded bg-white text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-white"><option>Buy</option><option>Sell</option></select></div>
                        <InputField label="Quantity" name="quantity" value={(form as any).quantity || ''} onChange={handleChange} placeholder="e.g., 100" type="number" step="any" />
                        <InputField label="Strategy" name="strategy" value={(form as any).strategy || ''} onChange={handleChange} placeholder="e.g., Breakout" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <InputField label="Entry Price" name="entryPrice" value={(form as any).entryPrice || ''} onChange={handleChange} type="number" step="any" />
                        <InputField label="Exit Price" name="exitPrice" value={(form as any).exitPrice || ''} onChange={handleChange} type="number" step="any" />
                    </div>
                     <div className="grid grid-cols-2 gap-3">
                        <InputField label="Stop Loss (Optional)" name="stopLoss" value={(form as any).stopLoss || ''} onChange={handleChange} type="number" step="any" />
                        <InputField label="Take Profit (Optional)" name="takeProfit" value={(form as any).takeProfit || ''} onChange={handleChange} type="number" step="any" />
                    </div>
                    <div><label className="text-sm font-medium text-slate-700 dark:text-slate-300">Notes</label><textarea name="notes" value={(form as any).notes || ''} onChange={handleChange} placeholder="Trade rationale, emotions, etc." className="w-full p-2 mt-1 border border-slate-300 rounded bg-white text-slate-900 placeholder-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:text-white" rows={3}></textarea></div>
                    <div><label className="text-sm font-medium text-slate-700 dark:text-slate-300">Screenshot</label><input type="file" accept="image/*" onChange={handleScreenshot} className="w-full text-sm mt-1 text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 dark:file:bg-slate-600 dark:file:text-slate-200 dark:hover:file:bg-slate-500" />
                        {screenshot && <img src={screenshot} alt="preview" className="mt-2 max-h-24 rounded" />}
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 rounded-lg hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-[var(--theme-primary)] text-white rounded-lg hover:opacity-90">Save Trade</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ProTradingJournal;