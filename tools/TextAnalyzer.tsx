import React, { useState, useMemo } from 'react';

const TextAnalyzer: React.FC = () => {
  const [text, setText] = useState('');

  const stats = useMemo(() => {
    const trimmedText = text.trim();
    if (trimmedText === '') {
        return { words: 0, characters: 0, sentences: 0, paragraphs: 0, readingTime: '0 min' };
    }

    const words = trimmedText.split(/\s+/).filter(Boolean);
    const characters = text.length;
    const sentences = (trimmedText.match(/[.!?]+(\s|$)/g) || []).length;
    const paragraphs = trimmedText.split(/\n+/).filter(p => p.trim() !== '').length;
    const readingTime = Math.ceil(words.length / 200); // Average reading speed of 200 wpm

    return { words: words.length, characters, sentences, paragraphs, readingTime: `${readingTime} min` };
  }, [text]);

  const handleClear = () => {
    setText('');
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Free Word and Character Counter Tool</h1>
          <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">Use our free text analyzer to instantly count words, characters, sentences, and paragraphs. Perfect for writers, students, and professionals who need to meet specific length requirements.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
            <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Start typing or paste your text here..."
            className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] transition-shadow duration-200 resize-none dark:bg-slate-900 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400"
            />
        </div>
        <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4 dark:bg-slate-800 dark:border-slate-700">
                <div className="flex justify-between items-baseline"><span className="text-gray-600 dark:text-slate-400">Words:</span><span className="font-bold text-2xl text-[var(--theme-primary)] dark:text-sky-300">{stats.words}</span></div>
                <div className="flex justify-between items-baseline"><span className="text-gray-600 dark:text-slate-400">Characters:</span><span className="font-bold text-2xl text-[var(--theme-primary)] dark:text-sky-300">{stats.characters}</span></div>
                <div className="flex justify-between items-baseline"><span className="text-gray-600 dark:text-slate-400">Sentences:</span><span className="font-bold text-2xl text-[var(--theme-primary)] dark:text-sky-300">{stats.sentences}</span></div>
                <div className="flex justify-between items-baseline"><span className="text-gray-600 dark:text-slate-400">Paragraphs:</span><span className="font-bold text-2xl text-[var(--theme-primary)] dark:text-sky-300">{stats.paragraphs}</span></div>
                <div className="flex justify-between items-baseline"><span className="text-gray-600 dark:text-slate-400">Reading Time:</span><span className="font-bold text-2xl text-[var(--theme-primary)] dark:text-sky-300">{stats.readingTime}</span></div>
            </div>
            <button
                onClick={handleClear}
                className="w-full px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75 transition-colors dark:bg-slate-600 dark:hover:bg-slate-500"
            >
                Clear Text
            </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 space-y-6">
        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">What is a Text Analyzer?</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">A Text Analyzer, also known as a word counter or character counter, is a utility that provides detailed statistics about a piece of text. It automatically calculates the number of words, characters, sentences, and paragraphs in real-time as you type. This tool is invaluable for anyone who works with text, including students writing essays with word count limits, marketers crafting social media posts with character restrictions, or authors tracking their progress.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">How to Use This Word Counter</h2>
          <ol className="list-decimal list-inside mt-2 space-y-2 text-slate-600 dark:text-slate-300">
            <li><strong>Enter Your Text:</strong> Simply start typing directly into the text area or paste your content from another source.</li>
            <li><strong>View Real-Time Statistics:</strong> The counters on the right will update instantly as you type, showing you the exact word count, character count, and more.</li>
            <li><strong>Clear the Text:</strong> When you are finished, click the "Clear Text" button to start over with a blank slate.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Benefits of Using This Tool</h2>
          <ul className="list-disc list-inside mt-2 space-y-2 text-slate-600 dark:text-slate-300">
            <li><strong>Instant Results:</strong> Get immediate feedback on your text's length and structure without any delay.</li>
            <li><strong>Complete Privacy:</strong> Your text is processed in your browser and is never stored on our servers.</li>
            <li><strong>Comprehensive Analysis:</strong> Go beyond simple word counting with stats on sentences, paragraphs, and estimated reading time.</li>
            <li><strong>Free and Unlimited:</strong> Use our text analyzer as much as you want, completely free of charge.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Why Choose Our Text Analyzer Tool?</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">Our word counter tool is designed for speed, accuracy, and ease of use. With a clean, distraction-free interface, you can focus on your writing while the tool does the counting. It’s a reliable companion for ensuring your text meets any and all length requirements with precision.</p>
        </section>
        
        <section>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Related Tools</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
                You can also try our <a href="#" className="text-[var(--theme-primary)] hover:underline dark:text-sky-400">Case Converter</a> to change text casing or the <a href="#" className="text-[var(--theme-primary)] hover:underline dark:text-sky-400">Plagiarism Checker</a> to verify originality.
            </p>
        </section>
        
        <section>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Frequently Asked Questions (FAQs)</h2>
            <div className="mt-2 space-y-3 text-slate-600 dark:text-slate-300">
              <div>
                <h3 className="font-semibold">How is 'reading time' calculated?</h3>
                <p>Reading time is estimated based on an average reading speed of 200 words per minute (WPM).</p>
              </div>
              <div>
                <h3 className="font-semibold">Does this tool save my text?</h3>
                <p>No. For your privacy, all text analysis is done within your browser. Nothing is saved or sent to our servers.</p>
              </div>
               <div>
                <h3 className="font-semibold">Is there a character or word limit?</h3>
                <p>There is no practical limit to the amount of text you can analyze. The tool is designed to handle very large documents efficiently.</p>
              </div>
            </div>
        </section>
      </div>
    </div>
  );
};

export default TextAnalyzer;