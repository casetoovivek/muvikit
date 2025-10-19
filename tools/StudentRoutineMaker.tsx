import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SpinnerIcon, TrashIcon, StudentIcon, BellIcon, DownloadIcon } from '../components/icons';

// --- TYPE DEFINITIONS ---
type Priority = 'High' | 'Medium' | 'Low';
type View = 'weekly' | 'daily';

interface Activity {
    id: string;
    day: number; // 0 for Sunday, 1 for Monday, etc.
    start: number; // In minutes from midnight (e.g., 9:30 AM is 570)
    end: number; // In minutes from midnight
    title: string;
    priority: Priority;
    color: string;
    note: string;
}

interface Goal {
    id: string;
    text: string;
    completed: boolean;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => i * 30); // 30-minute intervals

const PRIORITY_COLORS: Record<Priority, string> = {
    'High': 'border-red-500',
    'Medium': 'border-yellow-500',
    'Low': 'border-green-500',
};

const SUBJECT_COLORS = ['#fecaca', '#fed7aa', '#fef08a', '#d9f99d', '#bfdbfe', '#e9d5ff', '#fbcfe8'];

const TEMPLATES: Record<string, Activity[]> = {
    'School Student': [
        // Weekday mornings
        ...[1, 2, 3, 4, 5].flatMap(day => [
            // FIX: Cast string literal to 'Priority' type to resolve type incompatibility.
            { id: `sch-${day}-1`, day, start: 480, end: 540, title: 'Math', priority: 'High' as Priority, color: SUBJECT_COLORS[0], note: '' },
            { id: `sch-${day}-2`, day, start: 540, end: 600, title: 'Science', priority: 'High' as Priority, color: SUBJECT_COLORS[1], note: '' },
            { id: `sch-${day}-3`, day, start: 600, end: 630, title: 'Break', priority: 'Low' as Priority, color: '#e5e7eb', note: '' },
        ]),
        // Weekend
        // FIX: Cast string literal to 'Priority' type to resolve type incompatibility.
        { id: 'sch-6-1', day: 6, start: 600, end: 720, title: 'Weekend Revision', priority: 'Medium' as Priority, color: SUBJECT_COLORS[3], note: '' },
    ],
    'Exam Prep': [
        // FIX: Cast string literals to 'Priority' type to resolve type incompatibility within the flatMap.
         ...[1, 2, 3, 4, 5, 6].flatMap(day => [
            { id: `exm-${day}-1`, day, start: 540, end: 660, title: 'Morning Session 1', priority: 'High' as Priority, color: SUBJECT_COLORS[0], note: 'Focus on core topics' },
            { id: `exm-${day}-2`, day, start: 660, end: 720, title: 'Lunch Break', priority: 'Low' as Priority, color: '#e5e7eb', note: '' },
            { id: `exm-${day}-3`, day, start: 720, end: 840, title: 'Afternoon Session 2', priority: 'High' as Priority, color: SUBJECT_COLORS[1], note: 'Practice papers' },
             { id: `exm-${day}-4`, day, start: 840, end: 900, title: 'Short Break', priority: 'Low' as Priority, color: '#e5e7eb', note: '' },
             { id: `exm-${day}-5`, day, start: 900, end: 1020, title: 'Evening Revision', priority: 'Medium' as Priority, color: SUBJECT_COLORS[2], note: 'Review notes' },
        ]),
    ]
};


// --- Main Component ---
const StudentRoutineMaker: React.FC = () => {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [view, setView] = useState<View>('weekly');
    const [currentDay, setCurrentDay] = useState(new Date().getDay());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSlot, setEditingSlot] = useState<{ day: number, start: number } | null>(null);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [isFocusMode, setIsFocusMode] = useState(false);
    
    // Load from localStorage
    useEffect(() => {
        try {
            const savedActivities = localStorage.getItem('student_routine_activities');
            if (savedActivities) setActivities(JSON.parse(savedActivities));
            const savedGoals = localStorage.getItem('student_routine_goals');
            if (savedGoals) setGoals(JSON.parse(savedGoals));
        } catch (e) { console.error("Failed to load from storage", e); }
    }, []);

    // Save to localStorage
    useEffect(() => {
        localStorage.setItem('student_routine_activities', JSON.stringify(activities));
    }, [activities]);
    useEffect(() => {
        localStorage.setItem('student_routine_goals', JSON.stringify(goals));
    }, [goals]);


    const handleSlotClick = (day: number, start: number) => {
        setEditingSlot({ day, start });
        setIsModalOpen(true);
    };

    const handleSaveActivity = (activity: Omit<Activity, 'id' | 'day' | 'start'>) => {
        if (!editingSlot) return;
        const newActivity: Activity = {
            id: `act-${Date.now()}`,
            day: editingSlot.day,
            start: editingSlot.start,
            ...activity
        };
        // Remove any existing activity in the same slot before adding the new one
        setActivities(prev => [...prev.filter(a => !(a.day === newActivity.day && a.start < newActivity.end && a.end > newActivity.start)), newActivity]);
        setIsModalOpen(false);
        setEditingSlot(null);
    };

    const handleDeleteActivity = (id: string) => {
        setActivities(prev => prev.filter(a => a.id !== id));
    };

    const handleLoadTemplate = (templateName: keyof typeof TEMPLATES) => {
        if(window.confirm("This will replace your current routine. Are you sure?")) {
            setActivities(TEMPLATES[templateName]);
        }
    };
    
    const exportToPdf = () => {
        const doc = new jsPDF('l', 'mm', 'a4');
        doc.text("My Weekly Routine", 14, 15);
        
        const head = [['Time', ...DAYS]];
        const body = TIME_SLOTS.slice(12, 48).map(start => { // From 6 AM to midnight
            const timeStr = `${Math.floor(start / 60)}:${(start % 60).toString().padStart(2, '0')}`;
            const row = [timeStr];
            for (let day = 0; day < 7; day++) {
                const activity = activities.find(a => a.day === day && a.start <= start && a.end > start);
                row.push(activity ? activity.title : '');
            }
            return row;
        });

        autoTable(doc, { head, body, startY: 20 });
        doc.save('my-routine.pdf');
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Student Routine Maker</h1>
            
            {/* Controls */}
            <div className="flex flex-wrap gap-4 p-4 bg-white dark:bg-slate-800 rounded-lg border dark:border-slate-700 items-center">
                <div className="flex-1 min-w-max">
                    <span className="text-sm font-medium mr-2 dark:text-slate-300">View:</span>
                    <button onClick={() => setView('weekly')} className={`px-3 py-1 rounded-md text-sm ${view === 'weekly' ? 'bg-[var(--theme-primary)] text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>Weekly</button>
                    <button onClick={() => setView('daily')} className={`px-3 py-1 rounded-md text-sm ml-2 ${view === 'daily' ? 'bg-[var(--theme-primary)] text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>Daily</button>
                </div>
                 <div className="flex-1 min-w-max">
                    <span className="text-sm font-medium mr-2 dark:text-slate-300">Templates:</span>
                    <button onClick={() => handleLoadTemplate('School Student')} className="px-3 py-1 text-sm bg-slate-200 dark:bg-slate-700 rounded-md">School</button>
                    <button onClick={() => handleLoadTemplate('Exam Prep')} className="px-3 py-1 text-sm bg-slate-200 dark:bg-slate-700 rounded-md ml-2">Exam Prep</button>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setIsAiModalOpen(true)} className="px-3 py-2 text-sm font-semibold bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 dark:bg-amber-900/50 dark:text-amber-300">Smart Suggest AI</button>
                    <button onClick={exportToPdf} className="px-3 py-2 text-sm font-semibold bg-red-100 text-red-700 rounded-lg hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300">Export PDF</button>
                    <button onClick={() => setIsFocusMode(true)} className="px-3 py-2 text-sm font-semibold bg-sky-100 text-sky-800 rounded-lg hover:bg-sky-200 dark:bg-sky-900/50 dark:text-sky-300">Focus Boost</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 bg-white dark:bg-slate-800 p-4 rounded-lg border dark:border-slate-700">
                    {view === 'weekly' ? (
                        <WeeklyView activities={activities} onSlotClick={handleSlotClick} onDelete={handleDeleteActivity} />
                    ) : (
                        <DailyView activities={activities} onSlotClick={handleSlotClick} onDelete={handleDeleteActivity} currentDay={currentDay} setCurrentDay={setCurrentDay} />
                    )}
                </div>
                <div className="space-y-6">
                    <GoalTracker goals={goals} setGoals={setGoals} />
                    <FocusTimer />
                    <Analytics activities={activities} />
                </div>
            </div>

            {isModalOpen && editingSlot && (
                <ActivityModal
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveActivity}
                    day={editingSlot.day}
                    start={editingSlot.start}
                />
            )}
            {isAiModalOpen && <AiSuggestionModal onClose={() => setIsAiModalOpen(false)} setActivities={setActivities} />}
            {isFocusMode && <FocusModeOverlay onClose={() => setIsFocusMode(false)} />}
        </div>
    );
};

// --- Sub-components ---
const WeeklyView = ({ activities, onSlotClick, onDelete }: any) => {
    return (
        <div className="grid grid-cols-8 grid-rows-[auto_repeat(24,_minmax(0,_1fr))] h-[120vh]">
            <div className="row-span-1"></div> {/* Empty corner */}
            {DAYS.map(day => <div key={day} className="row-span-1 text-center font-bold text-sm p-2 sticky top-0 bg-white dark:bg-slate-800">{day}</div>)}
            
            {Array.from({length: 24}).map((_, hour) => (
                <React.Fragment key={hour}>
                    <div className="col-start-1 text-right text-xs pr-2 pt-1 border-t dark:border-slate-700">{`${hour}:00`}</div>
                    {DAYS.map((_, dayIndex) => (
                        <div key={dayIndex} className="col-start-auto border-t border-l dark:border-slate-700 relative"
                             onClick={() => onSlotClick(dayIndex, hour * 60)}>
                             {/* Render activities for this slot */}
                             {activities.filter((a: Activity) => a.day === dayIndex && Math.floor(a.start / 60) === hour).map((act: Activity) => (
                                <ActivityBlock key={act.id} activity={act} onDelete={onDelete} />
                             ))}
                        </div>
                    ))}
                </React.Fragment>
            ))}
        </div>
    );
};

const DailyView = ({ activities, onSlotClick, onDelete, currentDay, setCurrentDay }: any) => {
     return (
        <div>
            <div className="flex justify-center mb-4 border-b pb-2 dark:border-slate-700">
                {DAYS.map((day, index) => (
                    <button key={day} onClick={() => setCurrentDay(index)} className={`px-4 py-2 text-sm font-medium rounded-md ${currentDay === index ? 'bg-[var(--theme-primary)] text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}>{day}</button>
                ))}
            </div>
            <div className="space-y-1">
                 {TIME_SLOTS.slice(12, 48).map(start => {
                     const activity = activities.find((a: Activity) => a.day === currentDay && a.start <= start && a.end > start);
                     const timeStr = `${Math.floor(start / 60)}:${(start % 60).toString().padStart(2, '0')}`;
                     return (
                         <div key={start} onClick={() => onSlotClick(currentDay, start)} className="flex items-stretch min-h-[50px] border-t dark:border-slate-700">
                             <div className="w-20 text-right pr-4 pt-1 text-sm text-slate-500">{timeStr}</div>
                             <div className="flex-1 border-l pl-2 dark:border-slate-700">
                                 {activity && <ActivityBlock activity={activity} onDelete={onDelete} isDailyView={true} />}
                             </div>
                         </div>
                     )
                 })}
            </div>
        </div>
    );
};

const ActivityBlock = ({ activity, onDelete, isDailyView = false }: any) => {
    const duration = activity.end - activity.start;
    const height = isDailyView ? 'auto' : `${(duration / 60) * 100}%`;
    const top = isDailyView ? '0' : `${(activity.start % 60) / 60 * 100}%`;

    return (
        <div 
            style={{ backgroundColor: activity.color, top: top, height: height }}
            className={`absolute w-full p-2 text-xs rounded-lg text-black overflow-hidden group ${PRIORITY_COLORS[activity.priority]} border-l-4 ${isDailyView ? 'static h-full' : ''}`}
        >
            <p className="font-bold">{activity.title}</p>
            <p className="opacity-70">{activity.note}</p>
            <button onClick={(e) => { e.stopPropagation(); onDelete(activity.id); }} className="absolute top-1 right-1 p-0.5 bg-black/20 rounded-full opacity-0 group-hover:opacity-100">
                <TrashIcon className="w-3 h-3 text-white" />
            </button>
        </div>
    )
};

interface ActivityModalProps {
    onClose: () => void;
    onSave: (activity: Omit<Activity, 'id' | 'day' | 'start'>) => void;
    day: number;
    start: number;
}
const ActivityModal = ({ onClose, onSave, day, start }: ActivityModalProps) => {
    const [title, setTitle] = useState('');
    const [duration, setDuration] = useState(60);
    const [priority, setPriority] = useState<Priority>('Medium');
    const [color, setColor] = useState(SUBJECT_COLORS[0]);
    const [note, setNote] = useState('');
    const [remind, setRemind] = useState(false);

    const handleSubmit = () => {
        if(remind && Notification.permission !== 'granted') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    scheduleNotification();
                }
            });
        } else if(remind) {
            scheduleNotification();
        }
        onSave({ title, end: start + duration, priority, color, note });
    };

    const scheduleNotification = () => {
         const now = new Date();
         const activityDate = new Date();
         const dayDiff = day - now.getDay();
         activityDate.setDate(now.getDate() + dayDiff);
         activityDate.setHours(Math.floor(start/60), start % 60, 0, 0);

         const timeout = activityDate.getTime() - Date.now() - (5 * 60 * 1000); // 5 mins before
         if(timeout > 0) {
             setTimeout(() => {
                 new Notification('Routine Reminder', { body: `Your activity "${title}" is starting in 5 minutes.` });
             }, timeout);
         }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg w-full max-w-md space-y-4">
                <h2 className="text-xl font-bold">Add/Edit Activity</h2>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Activity Title" className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600" />
                <select value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600">
                    <option value={30}>30 mins</option>
                    <option value={60}>1 hour</option>
                    <option value={90}>1.5 hours</option>
                    <option value={120}>2 hours</option>
                </select>
                <select value={priority} onChange={e => setPriority(e.target.value as Priority)} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600">
                    <option>High</option><option>Medium</option><option>Low</option>
                </select>
                <div>
                    <div className="flex gap-2">{SUBJECT_COLORS.map(c => <button key={c} onClick={() => setColor(c)} style={{backgroundColor: c}} className={`w-8 h-8 rounded-full ${color === c ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}></button>)}</div>
                </div>
                <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Notes..." className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600" rows={2}></textarea>
                <label className="flex items-center gap-2"><input type="checkbox" checked={remind} onChange={e => setRemind(e.target.checked)} className="rounded text-[var(--theme-primary)]" /> Remind me 5 mins before</label>

                <div className="flex justify-end gap-4">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-200 rounded-lg dark:bg-slate-600">Cancel</button>
                    <button onClick={handleSubmit} className="px-4 py-2 bg-[var(--theme-primary)] text-white rounded-lg">Save</button>
                </div>
            </div>
        </div>
    );
};

const GoalTracker = ({ goals, setGoals }: any) => {
    const [newGoal, setNewGoal] = useState('');
    const addGoal = () => {
        if (!newGoal.trim()) return;
        setGoals((prev: Goal[]) => [...prev, { id: `g-${Date.now()}`, text: newGoal, completed: false }]);
        setNewGoal('');
    };
    const toggleGoal = (id: string) => {
        setGoals((prev: Goal[]) => prev.map(g => g.id === id ? { ...g, completed: !g.completed } : g));
    };

    return (
        <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border dark:border-slate-700 space-y-3">
            <h3 className="font-bold">Goal Tracker</h3>
            <div className="flex gap-2">
                <input value={newGoal} onChange={e => setNewGoal(e.target.value)} placeholder="New goal..." className="flex-1 p-2 border rounded text-sm dark:bg-slate-700 dark:border-slate-600"/>
                <button onClick={addGoal} className="px-3 bg-[var(--theme-primary)] text-white text-sm rounded">+</button>
            </div>
            <ul className="max-h-32 overflow-y-auto text-sm space-y-2">
                {goals.map((g: Goal) => <li key={g.id} className="flex items-center gap-2"><input type="checkbox" checked={g.completed} onChange={() => toggleGoal(g.id)} className="rounded" /><span className={g.completed ? 'line-through text-slate-500' : ''}>{g.text}</span></li>)}
            </ul>
        </div>
    );
};

const FocusTimer = () => {
    const [time, setTime] = useState<number>(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const timerRef = useRef<any>(null);

    useEffect(() => {
        if(isActive && time > 0) {
            timerRef.current = setInterval(() => setTime(t => t - 1), 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [isActive, time]);
    
    return (
        <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border dark:border-slate-700 space-y-2 text-center">
            <h3 className="font-bold">Focus Timer</h3>
            <p className="text-4xl font-mono">{`${Math.floor(time / 60).toString().padStart(2, '0')}:${(time % 60).toString().padStart(2, '0')}`}</p>
            <div className="flex justify-center gap-2">
                <button onClick={() => setIsActive(!isActive)} className="px-3 py-1 text-sm bg-slate-200 dark:bg-slate-700 rounded-md">{isActive ? 'Pause' : 'Start'}</button>
                <button onClick={() => { setIsActive(false); setTime(25*60) }} className="px-3 py-1 text-sm bg-slate-200 dark:bg-slate-700 rounded-md">Reset</button>
            </div>
        </div>
    );
};

const Analytics = ({ activities }: any) => {
    const data = useMemo(() => {
        // FIX: Provide an explicit type for the accumulator in the reduce function to avoid implicit 'any'.
        const subjectTimes = activities.reduce((acc: { [key: string]: number }, act: Activity) => {
            if (act.title !== 'Break') {
                const duration = act.end - act.start;
                acc[act.title] = (acc[act.title] || 0) + duration;
            }
            return acc;
        }, {});
        const total = Object.values(subjectTimes).reduce((sum: number, t: number) => sum + t, 0) || 1;
        return Object.entries(subjectTimes).map(([title, time]) => ({ title, time, percent: (time / total) * 100 }));
    }, [activities]);

    return (
         <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border dark:border-slate-700 space-y-2">
            <h3 className="font-bold">Performance Analytics</h3>
            <div className="space-y-1">
                {data.map(d => (
                    <div key={d.title}>
                        <p className="text-sm font-medium">{d.title} ({Math.round(d.time/60)} hrs)</p>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${d.percent}%`}}></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
};

const AiSuggestionModal = ({ onClose, setActivities }: any) => {
    const [wake, setWake] = useState('07:00');
    const [sleep, setSleep] = useState('23:00');
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const prompt = `Create a balanced student study routine for all 7 days of the week (Sunday=0, Monday=1...). The student wakes at ${wake} and sleeps at ${sleep}. Include study blocks, short breaks, and a lunch break. Return the response ONLY as a valid JSON array of objects. Each object must have keys: "day" (number), "start" (number in minutes from midnight), "end" (number in minutes from midnight), "title" (string).`;
        try {
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            const resultText = response.text.replace(/```json|```/g, '').trim();
            const suggestedActivities = JSON.parse(resultText).map((a: any) => ({...a, id: `ai-${Date.now()}-${Math.random()}`, priority: 'Medium', color: SUBJECT_COLORS[Math.floor(Math.random()*SUBJECT_COLORS.length)], note: ''}));
            setActivities(suggestedActivities);
            onClose();
        } catch(e) {
            console.error("AI suggestion failed", e);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg w-full max-w-md space-y-4">
                <h2 className="text-xl font-bold">AI Routine Suggestion</h2>
                <label>Wake up time: <input type="time" value={wake} onChange={e => setWake(e.target.value)} className="p-1 border rounded dark:bg-slate-700 dark:border-slate-600"/></label>
                <label>Sleep time: <input type="time" value={sleep} onChange={e => setSleep(e.target.value)} className="p-1 border rounded dark:bg-slate-700 dark:border-slate-600"/></label>
                <div className="flex justify-end gap-4">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-200 rounded-lg dark:bg-slate-600">Cancel</button>
                    <button onClick={handleGenerate} disabled={loading} className="px-4 py-2 bg-[var(--theme-primary)] text-white rounded-lg">{loading ? <SpinnerIcon className="w-5 h-5 animate-spin"/> : 'Generate'}</button>
                </div>
            </div>
        </div>
    )
};

const FocusModeOverlay = ({ onClose }: any) => {
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        document.documentElement.requestFullscreen();
        audioRef.current?.play();
        return () => {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            }
        }
    }, []);

    return (
        <div className="fixed inset-0 bg-slate-900 z-[100] flex flex-col justify-center items-center text-white">
            <audio ref={audioRef} src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" loop></audio>
            <h2 className="text-5xl font-bold">Focus Mode</h2>
            <p className="mt-4">Minimizing distractions. Close this to exit.</p>
            <FocusTimer />
            <button onClick={onClose} className="mt-8 px-6 py-3 bg-red-600 rounded-lg">Exit Focus Mode</button>
        </div>
    )
};


export default StudentRoutineMaker;