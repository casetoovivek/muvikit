import React, { useState, useMemo } from 'react';

const PercentageCalculator: React.FC = () => {
  const [val1, setVal1] = useState('');
  const [val2, setVal2] = useState('');

  const result = useMemo(() => {
    const num1 = parseFloat(val1);
    const num2 = parseFloat(val2);
    if (isNaN(num1) || isNaN(num2)) return 'N/A';
    if (num2 === 0) return (0).toFixed(2);
    return ((num1 * num2) / 100).toFixed(2);
  }, [val1, val2]);

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Percentage Calculator</h2>
        <p className="mt-1 text-md text-gray-600 dark:text-slate-400">Quickly perform common percentage calculations.</p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 max-w-2xl mx-auto space-y-4 dark:bg-slate-800 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-200">What is X % of Y?</h3>
        <div className="flex items-center gap-4 flex-wrap">
          <input
            type="number"
            value={val1}
            onChange={(e) => setVal1(e.target.value)}
            placeholder="X"
            className="w-24 block px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
          />
          <span className="text-gray-600 dark:text-slate-400">% of</span>
          <input
            type="number"
            value={val2}
            onChange={(e) => setVal2(e.target.value)}
            placeholder="Y"
            className="w-24 block px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
          />
          <span className="text-gray-600 dark:text-slate-400">=</span>
          <div className="flex-1 min-w-[6rem] p-3 bg-[var(--theme-primary-light)] border border-sky-200 rounded-md text-center dark:bg-slate-700 dark:border-slate-600">
            <span className="font-bold text-xl text-[var(--theme-primary)] dark:text-[var(--theme-text-gold)]">{result}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PercentageCalculator;