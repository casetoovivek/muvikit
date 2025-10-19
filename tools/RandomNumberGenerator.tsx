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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Random Number Generator</h2>
        <p className="mt-1 text-md text-gray-600 dark:text-slate-400">Generate a random number within a specified range.</p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 max-w-lg mx-auto space-y-6 dark:bg-slate-800 dark:border-slate-700">
        <div className="flex items-center gap-4">
          <div>
            <label htmlFor="min" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Minimum</label>
            <input
              type="number"
              id="min"
              value={min}
              onChange={(e) => setMin(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="max" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Maximum</label>
            <input
              type="number"
              id="max"
              value={max}
              onChange={(e) => setMax(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
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
    </div>
  );
};

export default RandomNumberGenerator;