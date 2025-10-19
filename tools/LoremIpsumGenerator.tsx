import React, { useState } from 'react';

const LOREM_TEXT = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris. Integer in mauris eu nibh euismod gravida. Duis ac tellus et risus vulputate vehicula. Donec lobortis risus a elit. Etiam tempor. Ut ullamcorper, ligula eu tempor congue, eros est euismod turpis, id tincidunt sapien risus a quam. Maecenas fermentum consequat mi. Donec fermentum. Pellentesque malesuada nulla a mi. Duis sapien sem, aliquet nec, commodo eget, consequat quis, neque. Aliquam faucibus, elit ut dictum aliquet, felis nisl adipiscing sapien, sed malesuada diam lacus eget erat. Cras mollis scelerisque nunc. Nullam arcu. Aliquam erat volutpat. Duis ac turpis. Integer rutrum ante eu lacus.';

const LoremIpsumGenerator: React.FC = () => {
  const [paragraphs, setParagraphs] = useState('3');
  const [generatedText, setGeneratedText] = useState('');

  const generateText = () => {
    const numParagraphs = parseInt(paragraphs, 10);
    if (isNaN(numParagraphs) || numParagraphs <= 0) {
        setGeneratedText('Please enter a valid number of paragraphs.');
        return;
    }
    const result = Array(numParagraphs).fill(LOREM_TEXT).join('\n\n');
    setGeneratedText(result);
  };
  
  const copyToClipboard = () => {
      navigator.clipboard.writeText(generatedText);
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Lorem Ipsum Generator</h2>
        <p className="mt-1 text-md text-gray-600 dark:text-slate-400">Generate placeholder text for your projects.</p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 flex items-center gap-4 dark:bg-slate-800 dark:border-slate-700">
        <label htmlFor="paragraphs" className="font-medium text-gray-700 dark:text-slate-300">Paragraphs:</label>
        <input
          type="number"
          id="paragraphs"
          value={paragraphs}
          onChange={(e) => setParagraphs(e.target.value)}
          className="block w-24 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
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
              className="absolute top-3 right-3 px-3 py-1 bg-gray-600 text-white text-xs font-semibold rounded-md hover:bg-gray-700 dark:bg-slate-600 dark:hover:bg-slate-500"
            >
              Copy
            </button>
          </div>
      )}

    </div>
  );
};

export default LoremIpsumGenerator;