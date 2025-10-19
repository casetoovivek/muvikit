import React, { useState } from 'react';

const JsonFormatter: React.FC = () => {
  const [inputJson, setInputJson] = useState('');
  const [outputJson, setOutputJson] = useState('');
  const [error, setError] = useState('');

  const handleFormat = () => {
    try {
      if (inputJson.trim() === '') {
          setOutputJson('');
          setError('');
          return;
      }
      const parsed = JSON.parse(inputJson);
      const formatted = JSON.stringify(parsed, null, 2);
      setOutputJson(formatted);
      setError('');
    } catch (e: any) {
      setOutputJson('');
      setError(`Invalid JSON: ${e.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">JSON Formatter</h2>
        <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">Paste your JSON here to beautify and validate it.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
            <h3 className="font-semibold text-gray-700 dark:text-slate-300">Input</h3>
            <textarea
              value={inputJson}
              onChange={(e) => setInputJson(e.target.value)}
              placeholder='{ "messy": "json" }'
              className="w-full h-96 p-4 font-mono text-sm border border-gray-300 rounded-lg focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
            />
        </div>
        <div className="space-y-2">
            <h3 className="font-semibold text-gray-700 dark:text-slate-300">Output</h3>
            <textarea
              readOnly
              value={error || outputJson}
              className={`w-full h-96 p-4 font-mono text-sm border rounded-lg ${error ? 'border-red-500 text-red-700 bg-red-50 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800' : 'border-gray-200 bg-gray-50 dark:bg-slate-800/50 dark:border-slate-700 dark:text-white'}`}
            />
        </div>
      </div>
      <button onClick={handleFormat} className="px-6 py-2 bg-[var(--theme-primary)] text-white font-semibold rounded-lg shadow-md hover:opacity-90">
        Format JSON
      </button>
    </div>
  );
};

export default JsonFormatter;