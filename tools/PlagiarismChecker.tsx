import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { SpinnerIcon } from '../components/icons';

const PlagiarismChecker: React.FC = () => {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const handleCheck = async () => {
    if (!text.trim()) {
      setError('Please enter some text to check.');
      return;
    }
    setIsLoading(true);
    setResult('');
    setError('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analyze the following text for plagiarism. Provide a simple summary of your findings, and if potential sources are found, list them clearly. Text: "${text}"`,
      });
      setResult(response.text);
    } catch (err) {
      setError('An error occurred while checking for plagiarism. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Plagiarism Checker</h2>
        <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">Paste your text below to check for potential plagiarism using AI.</p>
      </div>

      <div className="space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste the text you want to check here..."
          className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] transition-shadow duration-200 resize-none dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
          disabled={isLoading}
        />
        <button
          onClick={handleCheck}
          disabled={isLoading}
          className="px-6 py-3 w-full sm:w-auto bg-[var(--theme-primary)] text-white font-semibold rounded-lg shadow-md hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center dark:disabled:bg-slate-600"
        >
          {isLoading ? <><SpinnerIcon className="w-5 h-5 mr-2 animate-spin"/> Checking...</> : 'Check for Plagiarism'}
        </button>
      </div>

      {error && <div className="p-4 bg-red-100 text-red-800 border border-red-200 rounded-lg dark:bg-red-900/50 dark:text-red-300 dark:border-red-800">{error}</div>}
      
      {result && (
        <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2 dark:text-slate-200">Results</h3>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg whitespace-pre-wrap text-sm leading-relaxed dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
                {result}
            </div>
        </div>
      )}
    </div>
  );
};

export default PlagiarismChecker;