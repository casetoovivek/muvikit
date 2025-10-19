import React, { useState } from 'react';

const CaseConverter: React.FC = () => {
  const [text, setText] = useState('');
  const [output, setOutput] = useState('');

  const toSentenceCase = (str: string) => {
    return str.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
  };

  const toTitleCase = (str: string) => {
    return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const handleConvert = (type: 'upper' | 'lower' | 'sentence' | 'title') => {
    switch (type) {
      case 'upper':
        setOutput(text.toUpperCase());
        break;
      case 'lower':
        setOutput(text.toLowerCase());
        break;
      case 'sentence':
        setOutput(toSentenceCase(text));
        break;
      case 'title':
        setOutput(toTitleCase(text));
        break;
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Case Converter</h2>
        <p className="mt-1 text-md text-gray-600 dark:text-slate-400">Easily convert text between different letter cases.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text here..."
          className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] transition-shadow duration-200 resize-none dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
        />
        <textarea
          readOnly
          value={output}
          placeholder="Converted text will appear here..."
          className="w-full h-64 p-4 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] transition-shadow duration-200 resize-none dark:bg-slate-800/50 dark:border-slate-700 dark:text-white"
        />
      </div>

      <div className="flex flex-wrap gap-4">
        <button onClick={() => handleConvert('upper')} className="px-5 py-2 bg-[var(--theme-primary)] text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition-colors">UPPER CASE</button>
        <button onClick={() => handleConvert('lower')} className="px-5 py-2 bg-[var(--theme-primary)] text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition-colors">lower case</button>
        <button onClick={() => handleConvert('sentence')} className="px-5 py-2 bg-[var(--theme-primary)] text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition-colors">Sentence case</button>
        <button onClick={() => handleConvert('title')} className="px-5 py-2 bg-[var(--theme-primary)] text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition-colors">Title Case</button>
      </div>
    </div>
  );
};

export default CaseConverter;