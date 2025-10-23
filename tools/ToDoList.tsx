import React, { useState, useEffect, useMemo, useRef } from 'react';
import { TrashIcon, SpinnerIcon, BellIcon, DownloadIcon } from '../components/icons';
import { GoogleGenAI } from "@google/genai";

// --- TYPE DEFINITIONS ---
type Priority = 'High' | 'Medium' | 'Low';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  dueDate: string;
  notes: string;
}

interface Goal {
    id: string;
    text: string;
    completed: boolean;
}

const PRIORITY_STYLES: Record<Priority, { text: string; bg: string; border: string; }> = {
    'High': { text: 'text-red-700 dark:text-red-300', bg: 'bg-red-100 dark:bg-red-900/50', border: 'border-red-500' },
    'Medium': { text: 'text-yellow-700 dark:text-yellow-300', bg: 'bg-yellow-100 dark:bg-yellow-900/50', border: 'border-yellow-500' },
    'Low': { text: 'text-green-700 dark:text-green-300', bg: 'bg-green-100 dark:bg-green-900/50', border: 'border-green-500' },
};


// --- MAIN COMPONENT: ProductivityHub ---
const ProductivityHub: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);

    // Load data from localStorage
    useEffect(() => {
        try {
            const savedTasks = localStorage.getItem('hub_tasks');
            if (savedTasks) setTasks(JSON.parse(savedTasks));
            const savedGoals = localStorage.getItem('hub_goals');
            if (savedGoals) setGoals(JSON.parse(savedGoals));
        } catch (e) { console.error("Failed to load from storage", e); }
    }, []);

    // Save data to localStorage
    useEffect(() => {
        localStorage.setItem('hub_tasks', JSON.stringify(tasks));
    }, [tasks]);
     useEffect(() => {
        localStorage.setItem('hub_goals', JSON.stringify(goals));
    }, [goals]);

    const sortedTasks = useMemo(() => {
        const priorityOrder: Record<Priority, number> = { 'High': 1, 'Medium': 2, 'Low': 3 };
        return [...tasks].sort((a, b) => {
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
            if(a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            return 0;
        });
    }, [tasks]);
    
    const selectedTask = useMemo(() => tasks.find(t => t.id === selectedTaskId), [tasks, selectedTaskId]);

    const handleSaveTask = (taskData: Omit<Task, 'id' | 'completed'>, id?: string) => {
        if (id) {
            setTasks(prev => prev.map(t => t.id === id ? { ...t, ...taskData } : t));
        } else {
            const newTask: Task = {
                id: `task-${Date.now()}`,
                completed: false,
                ...taskData,
            };
            setTasks(prev => [newTask, ...prev]);
        }
        setIsModalOpen(false);
    };

    const handleDeleteTask = (id: string) => {
        setTasks(prev => prev.filter(t => t.id !== id));
        if (selectedTaskId === id) setSelectedTaskId(null);
    };
    
    const toggleTaskCompletion = (id: string) => {
        setTasks(tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task));
    };

    return (
        <div className="space-y-6">
            <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Productivity Hub & To-Do List with AI</h1>
                <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">Organize your life with our smart to-do list, goal tracker, and AI assistant. Break down large tasks and get insights into your productivity.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Task List */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-4 rounded-lg border dark:border-slate-700 h-fit">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg">My Tasks</h3>
                        <div className="flex gap-2">
                           <button onClick={() => setIsAiModalOpen(true)} className="px-3 py-1 bg-amber-100 text-amber-800 text-sm rounded-md font-semibold dark:bg-amber-900/50 dark:text-amber-300">✨ AI</button>
                           <button onClick={() => setIsModalOpen(true)} className="px-3 py-1 bg-[var(--theme-primary)] text-white text-sm rounded-md font-semibold">+</button>
                        </div>
                    </div>
                    <ul className="space-y-2 max-h-[60vh] overflow-y-auto">
                        {sortedTasks.map(task => (
                            <TaskItem key={task.id} task={task} onSelect={setSelectedTaskId} isSelected={selectedTaskId === task.id} onToggleComplete={toggleTaskCompletion} />
                        ))}
                         {sortedTasks.length === 0 && <p className="text-center text-sm text-slate-400 py-8">Your tasks will appear here. Click '+' to add a new one.</p>}
                    </ul>
                </div>

                {/* Right Column: Details & Tools */}
                <div className="lg:col-span-2 space-y-6">
                    {selectedTask ? (
                        <TaskDetail key={selectedTask.id} task={selectedTask} onSave={handleSaveTask} onDelete={handleDeleteTask} />
                    ) : (
                         <div className="p-6 bg-white dark:bg-slate-800 rounded-lg border dark:border-slate-700 text-center h-full flex flex-col justify-center">
                            <h3 className="text-lg font-semibold">Select a task to see details</h3>
                            <p className="text-sm text-slate-500">or create a new one to get started!</p>
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <GoalTracker goals={goals} setGoals={setGoals} />
                        <FocusTimer />
                    </div>
                </div>
            </div>

            {isModalOpen && <TaskModal onClose={() => setIsModalOpen(false)} onSave={handleSaveTask} />}
            {isAiModalOpen && <AiAssistantModal tasks={tasks} onClose={() => setIsAiModalOpen(false)} />}
            
            <div className="bg-white p-6 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 space-y-6">
                 <section>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">About the Productivity Hub</h2>
                    <p className="mt-2 text-slate-600 dark:text-slate-300">The Productivity Hub is more than just a simple to-do list. It's an integrated system designed to help you manage tasks, track long-term goals, and maintain focus. With features like task prioritization, due dates, notes, and an AI assistant, it provides a comprehensive solution for personal and professional organization. All your data is saved locally in your browser, ensuring your plans remain private and accessible.</p>
                </section>
                <section>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">How to Use the To-Do List</h2>
                    <ol className="list-decimal list-inside mt-2 space-y-2 text-slate-600 dark:text-slate-300">
                        <li><strong>Add a Task:</strong> Click the "+" button to open the new task modal. You can enter a simple task or use the AI to break down a complex one into smaller steps.</li>
                        <li><strong>Set Details:</strong> Assign a priority (High, Medium, Low) and an optional due date.</li>
                        <li><strong>Manage Tasks:</strong> Click on any task in the list to view and edit its details in the main panel. Mark tasks as complete by checking the box next to them.</li>
                        <li><strong>Stay Focused:</strong> Use the integrated Focus Timer (Pomodoro) to work on your tasks in distraction-free intervals.</li>
                    </ol>
                </section>
                 <section>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Frequently Asked Questions (FAQs)</h2>
                    <div className="mt-2 space-y-3 text-slate-600 dark:text-slate-300">
                    <div>
                        <h3 className="font-semibold">Where is my data stored?</h3>
                        <p>Your tasks and goals are saved securely in your browser's local storage. They are not sent to any server, ensuring your data is private.</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">How does the AI Assistant work?</h3>
                        <p>The AI Assistant uses powerful language models to help you. It can break down large, overwhelming tasks into a series of smaller, manageable sub-tasks. It can also analyze your completed and pending tasks to provide a summary of your productivity or suggest a plan for the day.</p>
                    </div>
                    </div>
                </section>
            </div>
        </div>
    );
};


// --- SUB-COMPONENTS ---
const TaskItem: React.FC<{ task: Task; onSelect: (id: string) => void; isSelected: boolean; onToggleComplete: (id: string) => void; }> = ({ task, onSelect, isSelected, onToggleComplete }) => {
    return (
        <li 
            onClick={() => onSelect(task.id)}
            className={`p-3 rounded-lg cursor-pointer border-l-4 flex items-center gap-3 transition-all duration-200 ${isSelected ? 'bg-sky-100 dark:bg-sky-900/50' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'} ${PRIORITY_STYLES[task.priority].border}`}
        >
            <input 
                type="checkbox" 
                checked={task.completed} 
                onChange={(e) => { e.stopPropagation(); onToggleComplete(task.id); }} 
                className="rounded-full text-[var(--theme-primary)] focus:ring-0 w-5 h-5"
            />
            <div className="flex-1">
                <p className={`font-medium ${task.completed ? 'line-through text-slate-500' : 'text-slate-800 dark:text-slate-200'}`}>{task.text}</p>
                {task.dueDate && <p className={`text-xs ${new Date(task.dueDate) < new Date() && !task.completed ? 'text-red-500' : 'text-slate-500'}`}>{new Date(task.dueDate).toLocaleDateString()}</p>}
            </div>
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${PRIORITY_STYLES[task.priority].bg} ${PRIORITY_STYLES[task.priority].text}`}>{task.priority}</span>
        </li>
    );
};

const TaskDetail: React.FC<{ task: Task; onSave: (data: Omit<Task, 'id' | 'completed'>, id: string) => void; onDelete: (id: string) => void; }> = ({ task, onSave, onDelete }) => {
    const [formData, setFormData] = useState(task);
    const hasChanges = useMemo(() => JSON.stringify(formData) !== JSON.stringify(task), [formData, task]);

    useEffect(() => {
        setFormData(task);
    }, [task]);

    const handleSave = () => {
        onSave(formData, task.id);
    };

    return (
        <div className="p-6 bg-white dark:bg-slate-800 rounded-lg border dark:border-slate-700 space-y-4">
             <input value={formData.text} onChange={e => setFormData({...formData, text: e.target.value})} className="w-full text-xl font-bold bg-transparent border-b dark:border-slate-600 focus:outline-none focus:border-blue-500" />
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-sm">Priority</label>
                    <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value as Priority})} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600">
                        <option>High</option><option>Medium</option><option>Low</option>
                    </select>
                </div>
                <div>
                     <label className="text-sm">Due Date</label>
                    <input type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600"/>
                </div>
            </div>
             <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Add notes..." className="w-full p-2 border rounded h-24 dark:bg-slate-700 dark:border-slate-600" />
            <div className="flex justify-between items-center">
                <button onClick={() => onDelete(task.id)} className="text-red-500 hover:underline text-sm">Delete Task</button>
                {hasChanges && <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold">Save Changes</button>}
            </div>
        </div>
    );
};

const TaskModal: React.FC<{ onClose: () => void; onSave: (data: Omit<Task, 'id' | 'completed'>) => void; }> = ({ onClose, onSave }) => {
    const [text, setText] = useState('');
    const [priority, setPriority] = useState<Priority>('Medium');
    const [dueDate, setDueDate] = useState('');
    const [notes, setNotes] = useState('');
    const [complexTask, setComplexTask] = useState('');
    const [subTasks, setSubTasks] = useState<string[]>([]);
    const [isAiLoading, setIsAiLoading] = useState(false);

    const handleBreakdown = async () => {
        if (!complexTask) return;
        setIsAiLoading(true);
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const prompt = `Break down the following complex task into a short list of simple, actionable sub-tasks. Return the response as a valid JSON array of strings. Task: "${complexTask}"`;
        try {
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            const resultText = response.text.replace(/```json|```/g, '').trim();
            setSubTasks(JSON.parse(resultText));
        } catch (e) {
            console.error(e);
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleSave = () => {
        if (!text && subTasks.length === 0) return;
        if(text) onSave({ text, priority, dueDate, notes });
        subTasks.forEach(sub => onSave({ text: sub, priority, dueDate, notes: `Part of: ${complexTask || text}` }));
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg w-full max-w-lg space-y-4">
                <h2 className="text-xl font-bold">New Task</h2>
                 <div className="p-4 border rounded-lg dark:border-slate-600 space-y-2 bg-slate-50 dark:bg-slate-700/50">
                    <p className="text-sm font-medium">✨ Feeling overwhelmed? Let AI help.</p>
                    <div className="flex gap-2">
                        <input value={complexTask} onChange={e => setComplexTask(e.target.value)} placeholder="Enter a big task, e.g., 'Plan birthday party'" className="flex-1 p-2 border rounded dark:bg-slate-600 dark:border-slate-500"/>
                        <button onClick={handleBreakdown} disabled={isAiLoading} className="px-3 py-2 bg-amber-500 text-white rounded-lg flex items-center">{isAiLoading ? <SpinnerIcon className="w-5 h-5 animate-spin"/> : 'Break Down'}</button>
                    </div>
                     {subTasks.length > 0 && <div className="pt-2 text-sm">AI suggests these tasks. Edit below and save.</div>}
                </div>
                {subTasks.length > 0 ? (
                    subTasks.map((sub, i) => <div key={i} className="p-2 bg-slate-100 dark:bg-slate-700 rounded">{sub}</div>)
                ) : (
                    <input value={text} onChange={e => setText(e.target.value)} placeholder="Or, enter a simple task title" className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600"/>
                )}
                <div className="grid grid-cols-2 gap-4">
                    <select value={priority} onChange={e => setPriority(e.target.value as Priority)} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600">
                        <option>High</option><option>Medium</option><option>Low</option>
                    </select>
                    <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600"/>
                </div>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes..." className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600" rows={2}/>
                <div className="flex justify-end gap-4">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-200 rounded-lg dark:bg-slate-600">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-[var(--theme-primary)] text-white rounded-lg">Save Task(s)</button>
                </div>
            </div>
        </div>
    );
};

const AiAssistantModal: React.FC<{ tasks: Task[], onClose: () => void }> = ({ tasks, onClose }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState('');

    const handleAiAction = async (action: 'plan' | 'summarize') => {
        setIsLoading(true);
        setResult('');
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const pendingTasks = tasks.filter(t => !t.completed).map(t => `- ${t.text} (Priority: ${t.priority}, Due: ${t.dueDate || 'N/A'})`).join('\n');
        
        let prompt = '';
        if (action === 'plan') {
            prompt = `I have the following pending tasks:\n${pendingTasks}\n\nBased on this list, suggest a simple, prioritized plan for me to tackle today. Be encouraging.`;
        } else {
            const completedTasks = tasks.filter(t => t.completed).map(t => `- ${t.text}`).join('\n');
            prompt = `Here are my completed tasks for the week:\n${completedTasks}\n\nGenerate a brief, positive summary of my productivity.`;
        }

        try {
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            setResult(response.text);
        } catch(e) { console.error(e); } finally { setIsLoading(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg w-full max-w-lg space-y-4">
                <h2 className="text-xl font-bold">AI Assistant</h2>
                <div className="flex gap-4">
                    <button onClick={() => handleAiAction('plan')} disabled={isLoading} className="flex-1 px-4 py-2 bg-blue-100 text-blue-800 rounded-lg dark:bg-blue-900/50 dark:text-blue-300">Plan My Day</button>
                    <button onClick={() => handleAiAction('summarize')} disabled={isLoading} className="flex-1 px-4 py-2 bg-green-100 text-green-800 rounded-lg dark:bg-green-900/50 dark:text-green-300">Weekly Summary</button>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg min-h-[10rem]">
                    {isLoading ? <SpinnerIcon className="w-6 h-6 animate-spin mx-auto"/> : <p className="text-sm whitespace-pre-wrap">{result || 'Select an action above...'}</p>}
                </div>
                 <div className="flex justify-end"><button onClick={onClose} className="px-4 py-2 bg-slate-200 rounded-lg dark:bg-slate-600">Close</button></div>
            </div>
        </div>
    );
};

// --- Other Tools ---
const GoalTracker: React.FC<{ goals: Goal[]; setGoals: React.Dispatch<React.SetStateAction<Goal[]>> }> = ({ goals, setGoals }) => {
    const [newGoal, setNewGoal] = useState('');
    const addGoal = () => {
        if (!newGoal.trim()) return;
        setGoals(prev => [...prev, { id: `g-${Date.now()}`, text: newGoal, completed: false }]);
        setNewGoal('');
    };
    const toggleGoal = (id: string) => {
        setGoals(prev => prev.map(g => g.id === id ? { ...g, completed: !g.completed } : g));
    };

    return (
        <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border dark:border-slate-700 space-y-3">
            <h3 className="font-bold">Goal Tracker</h3>
            <div className="flex gap-2">
                <input value={newGoal} onChange={e => setNewGoal(e.target.value)} placeholder="New long-term goal..." className="flex-1 p-2 border rounded text-sm dark:bg-slate-700 dark:border-slate-600"/>
                <button onClick={addGoal} className="px-3 bg-[var(--theme-primary)] text-white text-sm rounded">+</button>
            </div>
            <ul className="max-h-24 overflow-y-auto text-sm space-y-2">
                {goals.map(g => <li key={g.id} className="flex items-center gap-2"><input type="checkbox" checked={g.completed} onChange={() => toggleGoal(g.id)} className="rounded" /><span className={g.completed ? 'line-through text-slate-500' : ''}>{g.text}</span></li>)}
            </ul>
        </div>
    );
};

const FocusTimer: React.FC = () => {
    const [time, setTime] = useState<number>(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const timerRef = useRef<any>(null);

    useEffect(() => {
        if(isActive && time > 0) {
            timerRef.current = setInterval(() => setTime(t => t - 1), 1000);
        } else if (time === 0 && isActive) {
            if(Notification.permission === 'granted') new Notification("Pomodoro session finished!");
            setIsActive(false);
            setTime(5 * 60); // Set to break time
        }
        return () => clearInterval(timerRef.current);
    }, [isActive, time]);
    
    return (
        <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border dark:border-slate-700 space-y-2 text-center">
            <h3 className="font-bold">Focus Timer (Pomodoro)</h3>
            <p className="text-4xl font-mono">{`${Math.floor(time / 60).toString().padStart(2, '0')}:${(time % 60).toString().padStart(2, '0')}`}</p>
            <div className="flex justify-center gap-2">
                <button onClick={() => setIsActive(!isActive)} className="px-3 py-1 text-sm bg-slate-200 dark:bg-slate-700 rounded-md">{isActive ? 'Pause' : 'Start'}</button>
                <button onClick={() => { setIsActive(false); setTime(25*60) }} className="px-3 py-1 text-sm bg-slate-200 dark:bg-slate-700 rounded-md">Reset</button>
            </div>
        </div>
    );
};


export default ProductivityHub;