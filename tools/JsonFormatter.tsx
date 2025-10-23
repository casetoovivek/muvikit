import React, { useState } from 'react';
import { CopyIcon } from '../components/icons';

const JsonFormatter: React.FC = () => {
  const [inputJson, setInputJson] = useState('');
  const [outputJson, setOutputJson] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleFormat = () => {
    try {
      if (inputJson.trim() === '') {
          setOutputJson('');
          setError('');
          return;
      }
      const parsed = JSON.parse(inputJson);
      const formatted = JSON.stringify(parsed, null, 2); // 2 spaces for indentation
      setOutputJson(formatted);
      setError('');
      setCopied(false);
    } catch (e: any) {
      setOutputJson('');
      setError(`Invalid JSON: ${e.message}`);
    }
  };

  const copyToClipboard = () => {
      if(outputJson && !error) {
          navigator.clipboard.writeText(outputJson);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
      }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">JSON Formatter & Validator</h1>
        <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">Easily beautify, format, and validate your JSON data to make it readable and error-free.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
            <h3 className="font-semibold text-gray-700 dark:text-slate-300">Input JSON</h3>
            <textarea
              value={inputJson}
              onChange={(e) => setInputJson(e.target.value)}
              placeholder='{ "messy": ["json", "data"], "goes": "here" }'
              className="w-full h-96 p-4 font-mono text-sm border border-gray-300 rounded-lg focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400"
            />
        </div>
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-700 dark:text-slate-300">Formatted Output</h3>
                {outputJson && !error && (
                    <button onClick={copyToClipboard} className="px-3 py-1 bg-slate-200 text-slate-700 text-xs font-semibold rounded-md hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 flex items-center gap-2">
                        <CopyIcon className="w-3 h-3" />
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                )}
            </div>
            <textarea
              readOnly
              value={error || outputJson}
              className={`w-full h-96 p-4 font-mono text-sm border rounded-lg ${error ? 'border-red-500 text-red-700 bg-red-50 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800' : 'border-gray-200 bg-gray-50 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-100'}`}
            />
        </div>
      </div>
      <button onClick={handleFormat} className="px-6 py-2 bg-[var(--theme-primary)] text-white font-semibold rounded-lg shadow-md hover:opacity-90">
        Format / Beautify JSON
      </button>

       <div className="bg-white p-6 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 space-y-6">
        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">What is a JSON Formatter?</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">A JSON Formatter, also known as a JSON Beautifier, is a tool that takes messy, unformatted JSON data and organizes it into a clean, human-readable structure with proper indentation. It also acts as a validator by checking if the input is valid JSON and reporting any syntax errors. This is an essential utility for developers and data analysts who work with APIs and JSON files, as it makes debugging and understanding complex data structures significantly easier.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">How to Use This Tool</h2>
          <ol className="list-decimal list-inside mt-2 space-y-2 text-slate-600 dark:text-slate-300">
            <li><strong>Paste Your JSON:</strong> Copy your JSON data and paste it into the "Input JSON" text area on the left.</li>
            <li><strong>Click Format:</strong> Press the "Format / Beautify JSON" button.</li>
            <li><strong>Get Formatted Output:</strong> If your JSON is valid, the beautifully formatted output will appear on the right. If there are errors, a descriptive error message will be shown instead.</li>
            <li><strong>Copy the Result:</strong> Click the "Copy" button to copy the clean JSON to your clipboard.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Benefits of Using This JSON Formatter</h2>
          <ul className="list-disc list-inside mt-2 space-y-2 text-slate-600 dark:text-slate-300">
            <li><strong>Improved Readability:</strong> Instantly transforms minified or disorganized JSON into a structured format.</li>
            <li><strong>Error Detection:</strong> Quickly identifies syntax errors like missing commas or brackets, helping you debug faster.</li>
            <li><strong>Client-Side Processing:</strong> Your data is processed securely in your browser and is never sent to our servers.</li>
            <li><strong>Simple and Fast:</strong> A clean interface for quick formatting without any unnecessary clutter.</li>
          </ul>
        </section>
        
        <section>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Frequently Asked Questions (FAQs)</h2>
            <div className="mt-2 space-y-3 text-slate-600 dark:text-slate-300">
              <div>
                <h3 className="font-semibold">What is JSON?</h3>
                <p>JSON (JavaScript Object Notation) is a lightweight data-interchange format that is easy for humans to read and write and easy for machines to parse and generate. It is commonly used for transmitting data in web applications (e.g., sending some data from a server to a client, so it can be displayed on a web page).</p>
              </div>
              <div>
                <h3 className="font-semibold">Is my sensitive JSON data safe?</h3>
                <p>Yes. Our tool operates entirely within your browser. No data is ever transmitted to our servers, ensuring your information remains completely private and secure.</p>
              </div>
            </div>
        </section>
      </div>
    </div>
  );
};

export default JsonFormatter;