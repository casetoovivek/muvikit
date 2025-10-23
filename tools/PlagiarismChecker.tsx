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
        contents: `Act as a plagiarism detection tool. Analyze the following text for potential plagiarism against public web sources. Provide a simple summary of your findings. If potential matching sources are found, list them clearly with URLs. Text to check: "${text}"`,
        config: { tools: [{ googleSearch: {} }] },
      });
      setResult(response.text);
    } catch (err) {
      setError('An error occurred while checking for plagiarism. The AI service may be busy. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Free AI Plagiarism Checker</h1>
        <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">Ensure the originality of your work. Paste your text below to check for potential plagiarism against online sources using advanced AI.</p>
      </div>

      <div className="space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste the text you want to check here..."
          className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] transition-shadow duration-200 resize-none dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400"
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
        <div className="bg-white p-6 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Analysis Results</h2>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg whitespace-pre-wrap text-sm leading-relaxed dark:bg-slate-900/50 dark:border-slate-700 dark:text-slate-300">
                {result}
            </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 space-y-6">
         <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">What is a Plagiarism Checker?</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">A Plagiarism Checker is a tool that scans a piece of text to identify instances where the content matches existing sources online. It is an essential utility for students, writers, educators, and content creators to ensure their work is original and properly cited. Our AI-powered tool leverages advanced search capabilities to compare your text against a vast index of web pages, articles, and publications to detect potential similarities and help you maintain academic and professional integrity.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">How to Use This Plagiarism Checker</h2>
          <ol className="list-decimal list-inside mt-2 space-y-2 text-slate-600 dark:text-slate-300">
            <li><strong>Paste Your Text:</strong> Enter the content you wish to analyze into the provided text area.</li>
            <li><strong>Start the Scan:</strong> Click the "Check for Plagiarism" button to initiate the AI-powered analysis.</li>
            <li><strong>Review the Results:</strong> The tool will provide a summary of its findings. If any potential matches are found, it will list the source URLs for you to review.</li>
          </ol>
        </section>

         <section>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Related Tools</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
                To improve your writing, try our <a href="#" className="text-[var(--theme-primary)] hover:underline dark:text-sky-400">Grammar Fixer</a> or <a href="#" className="text-[var(--theme-primary)] hover:underline dark:text-sky-400">Content Improver</a>.
            </p>
        </section>

        <section>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Frequently Asked Questions (FAQs)</h2>
            <div className="mt-2 space-y-3 text-slate-600 dark:text-slate-300">
              <div>
                <h3 className="font-semibold">Is this plagiarism checker accurate?</h3>
                <p>Our tool uses Google's powerful Gemini AI with search grounding to provide a highly relevant analysis based on public web data. However, it should be used as a guide, not as a definitive verdict. Always manually review the potential sources.</p>
              </div>
              <div>
                <h3 className="font-semibold">Is my text saved or stored?</h3>
                <p>No. Your text is sent for a one-time analysis and is not stored or logged by our service. Your privacy is protected.</p>
              </div>
               <div>
                <h3 className="font-semibold">Can this tool detect AI-generated content?</h3>
                <p>This tool is designed to find matches with existing online sources. While it might flag AI-generated text that closely resembles its training data, its primary purpose is to detect human-written plagiarism, not to identify content as AI-generated.</p>
              </div>
            </div>
        </section>
      </div>
    </div>
  );
};

export default PlagiarismChecker;