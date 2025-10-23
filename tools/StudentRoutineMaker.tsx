import React, { useState, useEffect, useMemo } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import AIGenerator from '../components/AIGenerator';
import { TrashIcon, DownloadIcon } from '../components/icons';

// --- CONSTANTS ---
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = Array.from({ length: 15 }, (_, i) => `${(i + 8).toString().padStart(2, '0')}:00`); // 8 AM to 10 PM

// --- TYPES ---
interface ScheduleEntry {
  activity: string;
  color: string;
}
type Schedule = Record<string, ScheduleEntry>;

interface ExportOptions {
    fontSize: number;
    fontStyle: 'normal' | 'bold';
    notes: string;
    fileName: string;
}

// --- HELPER to generate a readable schedule for the AI ---
const generateScheduleForAI = (schedule: Schedule): string => {
    let scheduleString = "Current Schedule:\n";
    let hasEntries = false;
    DAYS.forEach(day => {
        const dayEntries: string[] = [];
        TIME_SLOTS.forEach(time => {
            const key = `${day}-${time}`;
            if (schedule[key]) {
                dayEntries.push(`  - ${time}: ${schedule[key].activity}`);
            }
        });
        if (dayEntries.length > 0) {
            hasEntries = true;
            scheduleString += `${day}:\n${dayEntries.join('\n')}\n`;
        }
    });
    return hasEntries ? scheduleString : "The student's schedule is currently empty.\n";
};


// --- ACTIVITY MODAL COMPONENT ---
interface ActivityModalProps {
  day: string;
  time: string;
  entry: ScheduleEntry | null;
  onSave: (activity: string, color: string) => void;
  onDelete: () => void;
  onClose: () => void;
}

const ActivityModal: React.FC<ActivityModalProps> = ({ day, time, entry, onSave, onDelete, onClose }) => {
    const [activity, setActivity] = useState(entry?.activity || '');
    const [color, setColor] = useState(entry?.color || '#a7f3d0'); // Default light green

    const handleSave = () => {
        if (activity.trim()) {
            onSave(activity, color);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg w-full max-w-sm space-y-4 shadow-xl" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                    {entry ? 'Edit Activity' : 'Add Activity'}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{day} at {time}</p>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Activity / Subject</label>
                    <input
                        value={activity}
                        onChange={(e) => setActivity(e.target.value)}
                        placeholder="e.g., Study Math"
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400"
                        autoFocus
                    />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Color</label>
                     <input type="color" value={color} onChange={e => setColor(e.target.value)} className="mt-1 w-full h-10 p-1 border border-gray-300 rounded-md cursor-pointer dark:border-slate-600"/>
                </div>
                <div className="flex justify-between items-center pt-2">
                    {entry ? (
                        <button onClick={onDelete} className="p-2 text-red-500 hover:bg-red-100 rounded-full dark:hover:bg-red-900/50">
                            <TrashIcon className="w-5 h-5"/>
                        </button>
                    ) : <div></div>}
                    <div className="flex gap-2">
                        <button onClick={onClose} className="px-4 py-2 bg-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500">Cancel</button>
                        <button onClick={handleSave} className="px-4 py-2 bg-[var(--theme-primary)] text-white rounded-lg text-sm font-semibold hover:opacity-90">Save</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- PDF EXPORT MODAL ---
interface ExportPdfModalProps {
    schedule: Schedule;
    onClose: () => void;
}

const ExportPdfModal: React.FC<ExportPdfModalProps> = ({ schedule, onClose }) => {
    const [options, setOptions] = useState<ExportOptions>({
        fontSize: 10,
        fontStyle: 'normal',
        notes: '',
        fileName: 'student-routine.pdf'
    });

    const handleOptionChange = (field: keyof ExportOptions, value: any) => {
        setOptions(prev => ({ ...prev, [field]: value }));
    };

    const handleExport = () => {
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        doc.text("My Weekly Student Routine", 14, 15);
        
        if (options.notes.trim()) {
            doc.setFontSize(10);
            doc.text(options.notes, 14, 22, { maxWidth: 260 });
        }

        const head = [['Time', ...DAYS]];
        const body = TIME_SLOTS.map(time => {
            return [time, ...DAYS.map(day => schedule[`${day}-${time}`]?.activity || '')];
        });
        
        const isColorDark = (hexColor: string) => {
            const color = (hexColor.charAt(0) === '#') ? hexColor.substring(1, 7) : hexColor;
            const r = parseInt(color.substring(0, 2), 16);
            const g = parseInt(color.substring(2, 4), 16);
            const b = parseInt(color.substring(4, 6), 16);
            const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            return luminance < 0.5;
        };
        const hexToRgbArray = (hex: string): [number, number, number] => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [255, 255, 255];
        };

        autoTable(doc, {
            head,
            body,
            startY: options.notes.trim() ? 30 : 20,
            theme: 'grid',
            styles: {
                fontSize: options.fontSize,
                fontStyle: options.fontStyle,
                halign: 'center',
                valign: 'middle',
            },
            headStyles: { fillColor: [13, 62, 128], textColor: [255, 255, 255] },
            willDrawCell: (data) => {
                const day = DAYS[data.column.index - 1];
                const time = TIME_SLOTS[data.row.index];
                if (day && time) {
                    const entry = schedule[`${day}-${time}`];
                    if (entry?.color) {
                        if (isColorDark(entry.color)) {
                            data.cell.styles.textColor = [255, 255, 255];
                        } else {
                            data.cell.styles.textColor = [0, 0, 0];
                        }
                        data.cell.styles.fillColor = hexToRgbArray(entry.color);
                    }
                }
            }
        });
        doc.save(options.fileName.endsWith('.pdf') ? options.fileName : `${options.fileName}.pdf`);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg w-full max-w-lg space-y-4 shadow-xl" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold">Export Options</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium">Font Size</label>
                        <input type="number" value={options.fontSize} onChange={e => handleOptionChange('fontSize', parseInt(e.target.value))} className="w-full p-2 mt-1 border rounded dark:bg-slate-700" />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Font Style</label>
                        <div className="mt-2">
                             <input type="checkbox" id="boldCheck" checked={options.fontStyle === 'bold'} onChange={e => handleOptionChange('fontStyle', e.target.checked ? 'bold' : 'normal')} className="mr-2" />
                             <label htmlFor="boldCheck">Bold Text</label>
                        </div>
                    </div>
                </div>
                <div>
                    <label className="text-sm font-medium">Notes / Comments (Optional)</label>
                    <textarea value={options.notes} onChange={e => handleOptionChange('notes', e.target.value)} rows={3} className="w-full p-2 mt-1 border rounded dark:bg-slate-700" placeholder="Add a title or comment to your PDF..."></textarea>
                </div>
                 <div>
                    <label className="text-sm font-medium">File Name</label>
                    <input type="text" value={options.fileName} onChange={e => handleOptionChange('fileName', e.target.value)} className="w-full p-2 mt-1 border rounded dark:bg-slate-700" />
                </div>
                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-200 rounded-lg dark:bg-slate-600">Cancel</button>
                    <button onClick={handleExport} className="px-4 py-2 bg-[var(--theme-primary)] text-white rounded-lg">Download PDF</button>
                </div>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---
const StudentRoutineMaker: React.FC = () => {
    const [schedule, setSchedule] = useState<Schedule>({});
    const [modalData, setModalData] = useState<{ day: string; time: string } | null>(null);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

    // Load schedule from localStorage
    useEffect(() => {
        try {
            const savedSchedule = localStorage.getItem('student_weekly_schedule');
            if (savedSchedule) {
                setSchedule(JSON.parse(savedSchedule));
            }
        } catch (e) { console.error("Failed to load schedule", e); }
    }, []);

    // Save schedule to localStorage
    useEffect(() => {
        localStorage.setItem('student_weekly_schedule', JSON.stringify(schedule));
    }, [schedule]);
    
    const handleCellClick = (day: string, time: string) => {
        setModalData({ day, time });
    };

    const handleSaveActivity = (activity: string, color: string) => {
        if (!modalData) return;
        const key = `${modalData.day}-${modalData.time}`;
        setSchedule(prev => ({ ...prev, [key]: { activity, color } }));
        setModalData(null);
    };
    
    const handleDeleteActivity = () => {
        if (!modalData) return;
        const key = `${modalData.day}-${modalData.time}`;
        const newSchedule = { ...schedule };
        delete newSchedule[key];
        setSchedule(newSchedule);
        setModalData(null);
    };
    
    const aiPromptPrefix = useMemo(() => {
        const scheduleString = generateScheduleForAI(schedule);
        return `As an expert academic advisor, analyze the following student's weekly schedule and their personal goals. Provide actionable suggestions to optimize their routine for better balance, focus, and productivity. Present your advice in a clear, structured Markdown format.\n\n${scheduleString}\nBased on this schedule, and the student's goals below, provide your recommendations. Student Goals:`;
    }, [schedule]);


    return (
        <div className="space-y-6">
            {modalData && (
                <ActivityModal
                    day={modalData.day}
                    time={modalData.time}
                    entry={schedule[`${modalData.day}-${modalData.time}`] || null}
                    onSave={handleSaveActivity}
                    onDelete={handleDeleteActivity}
                    onClose={() => setModalData(null)}
                />
            )}
            {isExportModalOpen && <ExportPdfModal schedule={schedule} onClose={() => setIsExportModalOpen(false)} />}
            <div className="pb-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">AI Student Routine Maker</h2>
                    <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">Plan your week, track subjects, and get AI-powered suggestions.</p>
                </div>
                <button onClick={() => setIsExportModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200">
                    <DownloadIcon className="w-5 h-5"/>
                    Export PDF
                </button>
            </div>

            <div className="overflow-x-auto">
                <div className="grid" style={{ gridTemplateColumns: 'auto repeat(7, 1fr)' }}>
                    <div className="sticky left-0 bg-slate-50 dark:bg-slate-900 z-10"></div> {/* Corner */}
                    {DAYS.map(day => (
                        <div key={day} className="text-center font-semibold p-2 border-b border-r dark:border-slate-700 sticky top-0 bg-slate-50 dark:bg-slate-900">{day}</div>
                    ))}
                    {TIME_SLOTS.map(time => (
                        <React.Fragment key={time}>
                            <div className="p-2 border-r dark:border-slate-700 text-xs text-slate-500 text-right sticky left-0 bg-slate-50 dark:bg-slate-900 z-10">{time}</div>
                            {DAYS.map(day => {
                                const key = `${day}-${time}`;
                                const entry = schedule[key];
                                return (
                                    <div
                                        key={key}
                                        onClick={() => handleCellClick(day, time)}
                                        className="border-r border-b dark:border-slate-700 h-16 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 p-1 text-xs"
                                        style={{ backgroundColor: entry?.color }}
                                    >
                                      <span className="text-slate-800 dark:text-slate-200" style={{ mixBlendMode: 'difference', filter: 'invert(1) grayscale(1) contrast(100)'}}>
                                        {entry?.activity}
                                      </span>
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            <AIGenerator
                title="Get AI Suggestions"
                description="Describe your study goals, weak subjects, or personal commitments, and let the AI suggest improvements to your schedule."
                promptPrefix={aiPromptPrefix}
                placeholder="e.g., 'I need more time for math but also want to exercise three times a week. I feel most energetic in the mornings.'"
            />
        </div>
    );
};

export default StudentRoutineMaker;