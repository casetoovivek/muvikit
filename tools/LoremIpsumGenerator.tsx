import React, { useState } from 'react';
import { CopyIcon } from '../components/icons';

const LOREM_TEXT = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

const LoremIpsumGenerator: React.FC = () => {
  const [paragraphs, setParagraphs] = useState('3');
  const [generatedText, setGeneratedText] = useState('');
  const [copied, setCopied] = useState(false);

  const generateText = () => {
    const numParagraphs = parseInt(paragraphs, 10);
    if (isNaN(numParagraphs) || numParagraphs <= 0) {
        setGeneratedText('Please enter a valid number of paragraphs.');
        return;
    }
    const result = Array(numParagraphs).fill(LOREM_TEXT).join('\n\n');
    setGeneratedText(result);
    setCopied(false);
  };
  
  const copyToClipboard = () => {
      navigator.clipboard.writeText(generatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Free Lorem Ipsum Generator</h1>
        <p className="mt-1 text-lg text-gray-600 dark:text-slate-400">Quickly generate placeholder text for your design mockups, websites, and print layouts with our simple Lorem Ipsum generator.</p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 flex flex-col sm:flex-row items-center gap-4 dark:bg-slate-800 dark:border-slate-700">
        <label htmlFor="paragraphs" className="font-medium text-gray-700 dark:text-slate-300">Number of Paragraphs:</label>
        <input
          type="number"
          id="paragraphs"
          value={paragraphs}
          onChange={(e) => setParagraphs(e.target.value)}
          className="block w-24 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
          min="1"
        />
        <button onClick={generateText} className="px-5 py-2 bg-[var(--theme-primary)] text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition-colors">
          Generate
        </button>
      </div>
      
      {generatedText && (
          <div className="relative">
            <textarea
              readOnly
              value={generatedText}
              className="w-full h-80 p-4 border border-gray-200 bg-gray-50 rounded-lg resize-none dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
            />
            <button
              onClick={copyToClipboard}
              className="absolute top-3 right-3 px-3 py-1 bg-gray-600 text-white text-xs font-semibold rounded-md hover:bg-gray-700 dark:bg-slate-600 dark:hover:bg-slate-500 flex items-center gap-2"
            >
              <CopyIcon className="w-3 h-3" />
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
      )}

      <div className="bg-white p-6 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 space-y-6">
        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">What is Lorem Ipsum?</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">Lorem Ipsum is standardized placeholder text used by designers, developers, and printers to demonstrate the visual form of a document or typeface without relying on meaningful content. It is derived from a 1st-century BC Latin text by Cicero but is intentionally jumbled to prevent it from being distracting. Using Lorem Ipsum allows designers to focus on the layout and visual hierarchy of a design before the final content is ready.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">How to Use This Generator</h2>
          <ol className="list-decimal list-inside mt-2 space-y-2 text-slate-600 dark:text-slate-300">
            <li><strong>Specify the Number of Paragraphs:</strong> Enter the desired number of Lorem Ipsum paragraphs you need in the input box.</li>
            <li><strong>Click Generate:</strong> Press the "Generate" button to create the text.</li>
            <li><strong>Copy the Text:</strong> The placeholder text will appear in the text box below. Click the "Copy" button to copy it to your clipboard for use in your project.</li>
          </ol>
        </section>

        <section>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Frequently Asked Questions (FAQs)</h2>
            <div className="mt-2 space-y-3 text-slate-600 dark:text-slate-300">
              <div>
                <h3 className="font-semibold">Why use Lorem Ipsum instead of real text?</h3>
                <p>Using placeholder text like Lorem Ipsum helps viewers focus on the design and layout rather than getting distracted by the content itself, which is especially useful in the early stages of a project.</p>
              </div>
              <div>
                <h3 className="font-semibold">Is this tool free?</h3>
                <p>Yes, our Lorem Ipsum generator is completely free and you can use it as many times as you like.</p>
              </div>
            </div>
        </section>
      </div>
    </div>
  );
};

export default LoremIpsumGenerator;