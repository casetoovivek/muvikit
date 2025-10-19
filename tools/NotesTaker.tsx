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
    const savedNotes = localStorage.getItem(STORAGE_KEY);
    if (savedNotes) {
      setNotes(savedNotes);
    }
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
        isFirstRender.current = false;
        return;
    }
    localStorage.setItem(STORAGE_KEY, debouncedNotes);
    setSaveStatus('Saved');
    const timer = setTimeout(() => setSaveStatus(''), 2000);
    return () => clearTimeout(timer);
  }, [debouncedNotes]);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
    setSaveStatus('Saving...');
  };
  
  const clearNotes = () => {
      setNotes('');
      localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-200 flex justify-between items-center dark:border-slate-700">
        <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Notes Taker</h2>
            <p className="mt-1 text-md text-gray-600 dark:text-slate-400">Your notes are automatically saved in your browser.</p>
        </div>
        {saveStatus && <span className="text-sm text-gray-500 transition-opacity duration-300 dark:text-slate-400">{saveStatus}</span>}
      </div>

      <textarea
        value={notes}
        onChange={handleNotesChange}
        placeholder="Start writing your notes here..."
        className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] transition-shadow duration-200 resize-none dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
      />

      <div className="flex gap-4">
         <button onClick={clearNotes} className="px-5 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 transition-colors dark:bg-slate-600 dark:hover:bg-slate-500">
            Clear Notes
        </button>
      </div>
    </div>
  );
};

export default NotesTaker;