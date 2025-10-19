import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { TrashIcon, SpinnerIcon, ChartIcon, ImageIcon, DownloadIcon } from '../components/icons';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


// --- DATA INTERFACES ---
interface TradeStats {
    netPL: number;
    contracts: number;
    volume: number;
    commissions: number;
    netROI: number;
    grossPL: number;
}

interface TradeNote {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    stats: TradeStats;
    tags: string[];
    content: string;
    chartUrl?: string;
    imageUrl?: string;
}

// --- DEBOUNCE HOOK ---
const useDebounce = <T,>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};

// --- DUMMY DATA ---
const createDummyNote = (): TradeNote => {
    const id = `TNOTE-${Date.now()}`;
    const date = new Date();
    return {
        id,
        title: `New Trade - ${date.toLocaleDateString()}`,
        createdAt: date.toISOString(),
        updatedAt: date.toISOString(),
        stats: { netPL: 0, contracts: 0, volume: 0, commissions: 0, netROI: 0, grossPL: 0 },
        tags: [],
        content: "## Pre-Market Plan\n\n- \n\n## Session Recap\n\n- \n\n## Post-Market Analysis\n\n- ",
        chartUrl: '',
        imageUrl: '',
    };
};

// --- MAIN COMPONENT ---
const ProTradingJournal: React.FC = () => {
    const [notes, setNotes] = useState<TradeNote[]>([]);
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const savedNotes = localStorage.getItem('pro_trading_journal_notes');
            if (savedNotes) {
                const parsedNotes = JSON.parse(savedNotes);
                setNotes(parsedNotes);
                if (parsedNotes.length > 0) {
                    setSelectedNoteId(parsedNotes[0].id);
                }
            }
        } catch (error) {
            console.error("Failed to load notes:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Save to localStorage when notes change
    useEffect(() => {
        try {
            localStorage.setItem('pro_trading_journal_notes', JSON.stringify(notes));
        } catch (error) {
            console.error("Failed to save notes:", error);
        }
    }, [notes]);

    const handleCreateNote = () => {
        const newNote = createDummyNote();
        setNotes(prev => [newNote, ...prev]);
        setSelectedNoteId(newNote.id);
    };

    const handleDeleteNote = (id: string) => {
        if (window.confirm("Are you sure you want to permanently delete this trade note?")) {
            setNotes(prev => prev.filter(n => n.id !== id));
            if (selectedNoteId === id) {
                setSelectedNoteId(notes.length > 1 ? notes.filter(n => n.id !== id)[0]?.id || null : null);
            }
        }
    };
    
    const selectedNote = useMemo(() => notes.find(n => n.id === selectedNoteId), [notes, selectedNoteId]);

    const handleNoteUpdate = useCallback((updatedNote: Partial<TradeNote>) => {
        if (!selectedNoteId) return;
        setNotes(prev =>
            prev.map(n =>
                n.id === selectedNoteId
                    ? { ...n, ...updatedNote, updatedAt: new Date().toISOString() }
                    : n
            )
        );
    }, [selectedNoteId]);
    
    const handleDownloadReport = () => {
        const doc = new jsPDF();
    
        // 1. Title
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text("Pro Trader Growth Report", 105, 20, { align: 'center' });
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 26, { align: 'center' });
    
        // 2. Summary Stats
        const totalTrades = notes.length;
        const winningTrades = notes.filter(n => n.stats.netPL > 0);
        const losingTrades = notes.filter(n => n.stats.netPL < 0);
        const winRate = totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0;
        const totalNetPL = notes.reduce((sum, n) => sum + n.stats.netPL, 0);
        const totalProfit = winningTrades.reduce((sum, n) => sum + n.stats.netPL, 0);
        const totalLoss = losingTrades.reduce((sum, n) => sum + n.stats.netPL, 0);
        const avgWin = winningTrades.length > 0 ? totalProfit / winningTrades.length : 0;
        const avgLoss = losingTrades.length > 0 ? totalLoss / losingTrades.length : 0;
        const profitFactor = totalLoss !== 0 ? Math.abs(totalProfit / totalLoss) : Infinity;
    
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text("Performance Summary", 14, 40);
    
        autoTable(doc, {
            startY: 45,
            body: [
                ['Total Net P&L', `$${totalNetPL.toFixed(2)}`],
                ['Total Trades', totalTrades],
                ['Win Rate', `${winRate.toFixed(2)}%`],
                ['Profit Factor', profitFactor === Infinity ? '∞' : profitFactor.toFixed(2)],
                ['Average Winning Trade', `$${avgWin.toFixed(2)}`],
                ['Average Losing Trade', `$${avgLoss.toFixed(2)}`],
            ],
            theme: 'striped',
            styles: { cellPadding: 3, fontSize: 10 },
        });
    
        // 3. Trade Log Table
        const finalY = (doc as any).lastAutoTable.finalY;
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text("Detailed Trade Log", 14, finalY + 15);
    
        autoTable(doc, {
            startY: finalY + 20,
            head: [['Date', 'Title', 'Net P&L', 'Contracts', 'Commissions']],
            body: notes.map(n => [
                new Date(n.createdAt).toLocaleDateString(),
                n.title,
                `$${n.stats.netPL.toFixed(2)}`,
                n.stats.contracts,
                `$${n.stats.commissions.toFixed(2)}`,
            ]),
            theme: 'grid',
            headStyles: { fillColor: [13, 62, 128] }, // theme-primary
            styles: { fontSize: 9 },
        });
    
        doc.save('trading-growth-report.pdf');
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><SpinnerIcon className="w-10 h-10 animate-spin text-[var(--theme-primary)]" /></div>;
    }

    return (
        <div className="flex h-full -m-6 lg:-m-10">
            {/* Left Sidebar (Folders & Tags) */}
            <aside className="w-48 bg-white border-r border-slate-200 flex-shrink-0 hidden lg:flex flex-col dark:bg-slate-800 dark:border-slate-700">
                <div className="p-4 border-b dark:border-slate-700">
                    <button onClick={handleCreateNote} className="w-full px-4 py-2 bg-[var(--theme-primary)] text-white text-sm font-semibold rounded-lg shadow-sm hover:opacity-90">
                        + New Note
                    </button>
                </div>
                <nav className="p-4 space-y-4">
                    <div>
                        <h3 className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Folders</h3>
                        <ul className="mt-2 space-y-1 text-sm">
                            <li className="p-2 rounded-md bg-[var(--theme-primary-light)] text-[var(--theme-primary)] font-semibold dark:bg-sky-900/50 dark:text-sky-300">All Notes</li>
                            <li className="p-2 rounded-md text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700">Trade Notes</li>
                            <li className="p-2 rounded-md text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700">Daily Journal</li>
                        </ul>
                    </div>
                     <div>
                        <h3 className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Tags</h3>
                         <ul className="mt-2 space-y-1 text-sm">
                             <li className="p-2 rounded-md text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700">#winning-trade</li>
                             <li className="p-2 rounded-md text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700">#revenge-trade</li>
                        </ul>
                    </div>
                </nav>
            </aside>

            {/* Middle Column (Notes List) */}
            <div className="w-full lg:w-80 border-r border-slate-200 flex-shrink-0 flex flex-col bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700">
                <div className="p-4 border-b dark:border-slate-700 flex-shrink-0 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">All Notes ({notes.length})</h2>
                    <button onClick={handleDownloadReport} className="p-2 text-slate-500 hover:bg-slate-200 rounded-full dark:text-slate-400 dark:hover:bg-slate-700" title="Download Growth Report">
                        <DownloadIcon className="w-5 h-5" />
                    </button>
                </div>
                <ul className="overflow-y-auto flex-grow">
                    {notes.map(note => (
                        <li key={note.id} onClick={() => setSelectedNoteId(note.id)} className={`p-4 border-b dark:border-slate-700 cursor-pointer ${selectedNoteId === note.id ? 'bg-white dark:bg-slate-900' : 'hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}>
                            <h3 className="font-semibold text-slate-800 dark:text-slate-200 truncate">{note.title}</h3>
                            <div className="flex justify-between items-center text-sm mt-1">
                                <span className={`font-bold ${note.stats.netPL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    Net P&L: ${note.stats.netPL.toFixed(2)}
                                </span>
                                <span className="text-slate-400">{new Date(note.createdAt).toLocaleDateString()}</span>
                            </div>
                        </li>
                    ))}
                </ul>
                 <div className="p-2 border-t dark:border-slate-700 lg:hidden">
                    <button onClick={handleCreateNote} className="w-full px-4 py-2 bg-[var(--theme-primary)] text-white text-sm font-semibold rounded-lg shadow-sm hover:opacity-90">
                        + New Note
                    </button>
                </div>
            </div>

            {/* Right Column (Note Detail) */}
            <main className="flex-1 bg-white dark:bg-slate-900 overflow-y-auto">
                {selectedNote ? (
                    <NoteDetail key={selectedNote.id} note={selectedNote} onUpdate={handleNoteUpdate} onDelete={handleDeleteNote} />
                ) : (
                    <div className="p-10 text-center flex flex-col justify-center items-center h-full">
                        <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200">Welcome to your Trading Journal</h2>
                        <p className="mt-2 text-slate-500 dark:text-slate-400">Select a note from the list to view its details, or create a new note to log your next trade.</p>
                        <button onClick={handleCreateNote} className="mt-6 px-5 py-2 bg-[var(--theme-primary)] text-white font-semibold rounded-lg shadow-md hover:opacity-90">
                            Create Your First Note
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

// --- Note Detail Sub-component ---
const NoteDetail: React.FC<{ note: TradeNote; onUpdate: (update: Partial<TradeNote>) => void; onDelete: (id: string) => void; }> = ({ note, onUpdate, onDelete }) => {
    const [localNote, setLocalNote] = useState(note);
    const debouncedNote = useDebounce(localNote, 500);

    useEffect(() => {
        onUpdate(debouncedNote);
    }, [debouncedNote, onUpdate]);

    const handleStatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLocalNote(prev => ({
            ...prev,
            stats: { ...prev.stats, [name]: parseFloat(value) || 0 }
        }));
    };
    
    const handleContentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
         const { name, value } = e.target;
         setLocalNote(prev => ({ ...prev, [name]: value }));
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setLocalNote(prev => ({ ...prev, imageUrl: event.target?.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const StatInput: React.FC<{ name: keyof TradeStats, label: string }> = ({ name, label }) => (
        <div>
            <label className="text-xs text-slate-500 dark:text-slate-400">{label}</label>
            <input
                type="number"
                name={name}
                value={localNote.stats[name]}
                onChange={handleStatChange}
                className="w-full text-lg font-semibold bg-transparent focus:outline-none dark:text-slate-100"
            />
        </div>
    );

    return (
        <div className="p-6 lg:p-10 space-y-6">
            <div className="flex justify-between items-start">
                <div>
                     <input name="title" value={localNote.title} onChange={handleContentChange} className="text-2xl font-bold text-slate-800 bg-transparent focus:outline-none dark:text-slate-100 w-full" />
                    <p className="text-xs text-slate-400">
                        Created: {new Date(note.createdAt).toLocaleString()} | Last Updated: {new Date(note.updatedAt).toLocaleString()}
                    </p>
                </div>
                 <button onClick={() => onDelete(note.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full dark:hover:bg-red-900/50" aria-label="Delete note">
                    <TrashIcon className="w-5 h-5"/>
                </button>
            </div>

            {/* Stats Block */}
            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className={`p-2 rounded ${localNote.stats.netPL >= 0 ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50'}`}>
                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Net P&L</label>
                        <input
                            type="number"
                            name="netPL"
                            value={localNote.stats.netPL}
                            onChange={handleStatChange}
                            className={`w-full text-xl font-bold bg-transparent focus:outline-none ${localNote.stats.netPL >= 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}
                        />
                    </div>
                    <StatInput name="contracts" label="Contracts" />
                    <StatInput name="volume" label="Volume" />
                    <StatInput name="commissions" label="Commissions" />
                    <StatInput name="netROI" label="Net ROI (%)" />
                    <StatInput name="grossPL" label="Gross P&L" />
                </div>
            </div>

            <div className="space-y-4">
                {/* Chart URL Input */}
                <div className="flex items-center gap-2">
                    <ChartIcon className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    <input
                        name="chartUrl"
                        value={localNote.chartUrl || ''}
                        onChange={handleContentChange}
                        placeholder="Paste TradingView Chart URL..."
                        className="w-full p-2 border border-slate-200 rounded-lg text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                    />
                    {localNote.chartUrl && (
                        <a href={localNote.chartUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-2 text-sm bg-slate-200 font-semibold rounded-lg hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 flex-shrink-0">
                            Open
                        </a>
                    )}
                </div>

                {/* Image Upload/Display */}
                <div className="p-4 border border-slate-200 rounded-lg dark:border-slate-700">
                    <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-slate-300">Trade Image</label>
                    {localNote.imageUrl ? (
                        <div className="relative group w-fit">
                            <img src={localNote.imageUrl} alt="Trade setup" className="max-h-60 w-auto rounded-md shadow-sm" />
                            <button
                                onClick={() => setLocalNote(prev => ({...prev, imageUrl: ''}))}
                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Remove Image"
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <label className="w-full flex justify-center items-center px-4 py-6 bg-slate-50 text-slate-500 rounded-lg border-2 border-dashed border-slate-300 cursor-pointer hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700">
                            <ImageIcon className="w-6 h-6 mr-2" />
                            <span className="text-sm font-medium">Click to upload image</span>
                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </label>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <textarea
                name="content"
                value={localNote.content}
                onChange={handleContentChange}
                className="w-full h-96 p-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent transition-shadow duration-200 resize-none dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                placeholder="Jot down your notes..."
            />
        </div>
    );
};


export default ProTradingJournal;