import React, { useState, useMemo } from 'react';

const TextAnalyzer: React.FC = () => {
  const [text, setText] = useState('');

  const stats = useMemo(() => {
    const trimmedText = text.trim();
    if (trimmedText === '') {
        return { words: 0, characters: 0, sentences: 0, paragraphs: 0 };
    }

    const words = trimmedText.split(/\s+/).filter(Boolean).length;
    const characters = text.length;
    const sentences = (trimmedText.match(/[.!?]+(\s|$)/g) || []).length;
    const paragraphs = trimmedText.split(/\n+/).filter(p => p.trim() !== '').length;

    return { words, characters, sentences, paragraphs };
  }, [text]);

  const handleClear = () => {
    setText('');
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Text Analyzer</h2>
          <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">Get instant statistics on your text.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Start typing or paste your text here..."
            className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] transition-shadow duration-200 resize-none dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
            />
        </div>
        <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-slate-200">Statistics</h3>
            <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4 dark:bg-slate-800 dark:border-slate-700">
                <div className="flex justify-between items-baseline">
                    <span className="text-gray-600 dark:text-slate-400">Words:</span>
                    <span className="font-bold text-2xl text-[var(--theme-primary)] dark:text-sky-300">{stats.words}</span>
                </div>
                <div className="flex justify-between items-baseline">
                    <span className="text-gray-600 dark:text-slate-400">Characters:</span>
                    <span className="font-bold text-2xl text-[var(--theme-primary)] dark:text-sky-300">{stats.characters}</span>
                </div>
                <div className="flex justify-between items-baseline">
                    <span className="text-gray-600 dark:text-slate-400">Sentences:</span>
                    <span className="font-bold text-2xl text-[var(--theme-primary)] dark:text-sky-300">{stats.sentences}</span>
                </div>
                <div className="flex justify-between items-baseline">
                    <span className="text-gray-600 dark:text-slate-400">Paragraphs:</span>
                    <span className="font-bold text-2xl text-[var(--theme-primary)] dark:text-sky-300">{stats.paragraphs}</span>
                </div>
            </div>
            <button
                onClick={handleClear}
                className="w-full px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75 transition-colors dark:bg-slate-600 dark:hover:bg-slate-500"
            >
                Clear Text
            </button>
        </div>
      </div>
    </div>
  );
};

export default TextAnalyzer;