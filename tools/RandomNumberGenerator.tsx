import React, { useState } from 'react';

const RandomNumberGenerator: React.FC = () => {
  const [min, setMin] = useState('1');
  const [max, setMax] = useState('100');
  const [randomNumber, setRandomNumber] = useState<number | null>(null);

  const generateRandom = () => {
    const minNum = parseInt(min);
    const maxNum = parseInt(max);
    if (isNaN(minNum) || isNaN(maxNum) || minNum > maxNum) {
      setRandomNumber(null);
      return;
    }
    const rand = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
    setRandomNumber(rand);
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Free Random Number Generator</h1>
        <p className="mt-1 text-lg text-gray-600 dark:text-slate-400">Generate a random number within a specified range. Perfect for games, contests, or any situation where you need an unbiased random choice.</p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 max-w-lg mx-auto space-y-6 dark:bg-slate-800 dark:border-slate-700">
        <div className="flex items-center gap-4">
          <div>
            <label htmlFor="min" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Minimum Value</label>
            <input
              type="number"
              id="min"
              value={min}
              onChange={(e) => setMin(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
            />
          </div>
          <div>
            <label htmlFor="max" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Maximum Value</label>
            <input
              type="number"
              id="max"
              value={max}
              onChange={(e) => setMax(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
            />
          </div>
        </div>

        <button onClick={generateRandom} className="w-full px-6 py-3 bg-[var(--theme-primary)] text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition-colors">
          Generate Number
        </button>

        {randomNumber !== null && (
          <div className="text-center pt-4">
            <p className="text-lg text-gray-600 dark:text-slate-400">Your random number is:</p>
            <p className="text-7xl font-bold text-[var(--theme-primary)] dark:text-[var(--theme-text-gold)]">{randomNumber}</p>
          </div>
        )}
      </div>
      
      <div className="bg-white p-6 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 space-y-6 max-w-4xl mx-auto">
        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">What is a Random Number Generator?</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">A Random Number Generator (RNG) is a tool that produces a number from a given set of numbers, where each number has an equal chance of being selected. It is used in situations that require an unpredictable or unbiased outcome, such as selecting a winner for a giveaway, creating random teams for a game, or in simulations and statistical sampling. Our tool provides a simple way to generate a random integer within a custom range you define.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">How to Use This Tool</h2>
          <ol className="list-decimal list-inside mt-2 space-y-2 text-slate-600 dark:text-slate-300">
            <li><strong>Set the Range:</strong> Enter the minimum and maximum values for your desired number range. Both numbers are inclusive.</li>
            <li><strong>Generate:</strong> Click the "Generate Number" button.</li>
            <li><strong>View the Result:</strong> A random number within your specified range will appear in the result box.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Frequently Asked Questions (FAQs)</h2>
          <div className="mt-2 space-y-3 text-slate-600 dark:text-slate-300">
            <div>
              <h3 className="font-semibold">Is the number truly random?</h3>
              <p>Our tool uses the standard pseudo-random number generator provided by the browser's JavaScript engine. While not cryptographically secure for high-stakes security applications, it is more than sufficient for general-purpose use like games, lotteries, and random sampling.</p>
            </div>
            <div>
              <h3 className="font-semibold">Can I generate more than one number at a time?</h3>
              <p>Currently, this tool generates one random number per click. To get multiple numbers, you can simply click the "Generate Number" button multiple times.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default RandomNumberGenerator;