import React, { useState, useEffect, useRef } from 'react';

const STORAGE_KEY = 'muvikit-notes';

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};

const NotesTaker: React.FC = () => {
  const [notes, setNotes] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const debouncedNotes = useDebounce(notes, 500);
  const isFirstRender = useRef(true);


  useEffect(() => {
    try {
        const savedNotes = localStorage.getItem(STORAGE_KEY);
        if (savedNotes) {
        setNotes(savedNotes);
        }
    } catch(e) { console.error("Could not access localStorage", e); }
    
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
        isFirstRender.current = false;
        return;
    }
    try {
        localStorage.setItem(STORAGE_KEY, debouncedNotes);
        setSaveStatus('Saved');
        const timer = setTimeout(() => setSaveStatus(''), 2000);
        return () => clearTimeout(timer);
    } catch (e) {
        setSaveStatus('Error saving');
        console.error("Could not save to localStorage", e);
    }
  }, [debouncedNotes]);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
    setSaveStatus('Saving...');
  };
  
  const clearNotes = () => {
      setNotes('');
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch(e) { console.error("Could not clear localStorage", e); }
  }

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Free Online Notepad & Notes Taker</h1>
        <p className="mt-1 text-lg text-gray-600 dark:text-slate-400">A simple, private, and auto-saving notepad right in your browser. Jot down thoughts, create lists, and keep your notes accessible without any sign-up.</p>
      </div>

       <div className="bg-white p-6 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 space-y-4">
        <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 transition-opacity duration-300 dark:text-slate-400">{saveStatus}</span>
            <button onClick={clearNotes} className="px-4 py-1 bg-red-500 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-red-600 transition-colors">
                Clear All Notes
            </button>
        </div>
        <textarea
            value={notes}
            onChange={handleNotesChange}
            placeholder="Start writing your notes here... they will be saved automatically."
            className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] transition-shadow duration-200 resize-none dark:bg-slate-900 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400"
        />
       </div>

      <div className="bg-white p-6 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 space-y-6">
        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">What is an Online Notes Taker?</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">An online notes taker is a digital notepad that lives in your web browser. Unlike complex applications, it provides a clean, simple interface for quickly writing down information. Our tool is designed with privacy and convenience in mind—it automatically saves your text to your browser's local storage, meaning your notes are private to you and accessible whenever you revisit the page from the same device.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">How to Use This Notepad</h2>
          <ol className="list-decimal list-inside mt-2 space-y-2 text-slate-600 dark:text-slate-300">
            <li><strong>Start Typing:</strong> Simply click on the text area and begin writing.</li>
            <li><strong>Auto-Save:</strong> A "Saving..." and then "Saved" status will appear as you type, indicating your notes are securely stored in your browser.</li>
            <li><strong>Revisit Anytime:</strong> Close the tab and come back later—your notes will still be here.</li>
            <li><strong>Clear Notes:</strong> When you no longer need the notes, click the "Clear All Notes" button to permanently delete them from your browser's storage.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Benefits of Our Online Notepad</h2>
          <ul className="list-disc list-inside mt-2 space-y-2 text-slate-600 dark:text-slate-300">
            <li><strong>100% Private:</strong> Your notes are saved only on your computer. They are never sent to our servers.</li>
            <li><strong>Automatic Saving:</strong> No need to manually save your work. The tool saves your progress automatically as you type.</li>
            <li><strong>Distraction-Free:</strong> A minimal and clean interface lets you focus on your thoughts.</li>
            <li><strong>Instant Access:</strong> No accounts, no logins. Just open the page and start writing.</li>
          </ul>
        </section>
        
        <section>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Frequently Asked Questions (FAQs)</h2>
            <div className="mt-2 space-y-3 text-slate-600 dark:text-slate-300">
              <div>
                <h3 className="font-semibold">Will my notes be available on other devices?</h3>
                <p>No. Since the notes are saved in your browser's local storage, they are only accessible on the specific device and browser you used to write them.</p>
              </div>
              <div>
                <h3 className="font-semibold">What happens if I clear my browser cache?</h3>
                <p>Clearing your browser's cache or site data will permanently delete your saved notes. Be sure to back up any important information elsewhere.</p>
              </div>
            </div>
        </section>
      </div>
    </div>
  );
};

export default NotesTaker;