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

  const handleConvert = (type: 'upper' | 'lower' | 'sentence' | 'title' | 'inverse' | 'alternating') => {
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
      case 'inverse':
        setOutput(text.split('').map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join(''));
        break;
      case 'alternating':
        setOutput(text.split('').map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join(''));
        break;
    }
  };

  const copyToClipboard = () => {
      if(output) navigator.clipboard.writeText(output);
  }

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Free Case Converter Tool Online</h1>
        <p className="mt-1 text-lg text-gray-600 dark:text-slate-400">Instantly change text between UPPER CASE, lower case, Title Case, Sentence case, and more with our versatile online case converter.</p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter your text here..."
            className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] transition-shadow duration-200 resize-none dark:bg-slate-900 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400"
            />
            <div className="relative">
                <textarea
                readOnly
                value={output}
                placeholder="Converted text will appear here..."
                className="w-full h-64 p-4 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] transition-shadow duration-200 resize-none dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-100"
                />
                {output && <button onClick={copyToClipboard} className="absolute top-2 right-2 px-3 py-1 bg-slate-200 text-slate-700 text-xs font-semibold rounded-md hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200">Copy</button>}
            </div>
        </div>

        <div className="flex flex-wrap gap-4 pt-4">
            <button onClick={() => handleConvert('upper')} className="px-5 py-2 bg-[var(--theme-primary)] text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition-colors">UPPER CASE</button>
            <button onClick={() => handleConvert('lower')} className="px-5 py-2 bg-[var(--theme-primary)] text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition-colors">lower case</button>
            <button onClick={() => handleConvert('sentence')} className="px-5 py-2 bg-[var(--theme-primary)] text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition-colors">Sentence case</button>
            <button onClick={() => handleConvert('title')} className="px-5 py-2 bg-[var(--theme-primary)] text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition-colors">Title Case</button>
            <button onClick={() => handleConvert('inverse')} className="px-5 py-2 bg-slate-600 text-white font-semibold rounded-lg shadow-md hover:bg-slate-700 transition-colors">iNVERSE cASE</button>
            <button onClick={() => handleConvert('alternating')} className="px-5 py-2 bg-slate-600 text-white font-semibold rounded-lg shadow-md hover:bg-slate-700 transition-colors">aLtErNaTiNg cAsE</button>
        </div>
      </div>

       <div className="bg-white p-6 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 space-y-6">
        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">What is a Case Converter?</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">A Case Converter is an online tool that allows you to change the capitalization of your text with a single click. Instead of manually re-typing content, you can instantly transform it into various formats like all uppercase, all lowercase, proper title case for headlines, or standard sentence case for paragraphs. This utility is extremely useful for editors, writers, and anyone who needs to format text quickly and accurately, saving time and preventing tedious manual corrections.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">How to Use This Tool</h2>
          <ol className="list-decimal list-inside mt-2 space-y-2 text-slate-600 dark:text-slate-300">
            <li><strong>Paste Your Text:</strong> Enter or paste the text you want to convert into the left-hand text box.</li>
            <li><strong>Choose a Case:</strong> Click on one of the buttons (e.g., "UPPER CASE", "Sentence case") to select your desired format.</li>
            <li><strong>View and Copy:</strong> The converted text will immediately appear in the right-hand text box. Click the "Copy" button to copy it to your clipboard.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Benefits of Using This Case Converter</h2>
          <ul className="list-disc list-inside mt-2 space-y-2 text-slate-600 dark:text-slate-300">
            <li><strong>Efficiency:</strong> Save significant time by converting large blocks of text instantly instead of re-typing.</li>
            <li><strong>Accuracy:</strong> Ensures consistent and correct capitalization for headlines (Title Case) and sentences.</li>
            <li><strong>Versatility:</strong> Offers multiple conversion options, including standard cases and creative ones like inverse and alternating case.</li>
            <li><strong>Completely Free:</strong> No sign-ups, no limits. Use our case conversion tool as much as you need.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Why Choose Our Case Conversion Tool?</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">Our tool is built for speed and simplicity. With a clean interface and instant results, it streamlines your workflow. All conversions happen in your browser, ensuring your data remains private. It's the perfect, reliable utility for quick text formatting tasks.</p>
        </section>

         <section>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Related Tools</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
                You might also find our <a href="#" className="text-[var(--theme-primary)] hover:underline dark:text-sky-400">Text Analyzer</a> useful for counting words and characters.
            </p>
        </section>
        
        <section>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Frequently Asked Questions (FAQs)</h2>
            <div className="mt-2 space-y-3 text-slate-600 dark:text-slate-300">
              <div>
                <h3 className="font-semibold">What is 'Title Case'?</h3>
                <p>Title Case capitalizes the first letter of each word, which is commonly used for headlines and titles.</p>
              </div>
              <div>
                <h3 className="font-semibold">Does this tool store my data?</h3>
                <p>No, all conversions are performed locally in your browser. Your text is never sent to our servers, ensuring your complete privacy.</p>
              </div>
               <div>
                <h3 className="font-semibold">Can I convert a large document?</h3>
                <p>Yes, the tool is designed to handle large amounts of text without any performance issues.</p>
              </div>
            </div>
        </section>
      </div>
    </div>
  );
};

export default CaseConverter;