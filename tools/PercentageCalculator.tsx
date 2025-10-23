import React, { useState, useMemo } from 'react';

const PercentageCalculator: React.FC = () => {
  const [val1, setVal1] = useState('');
  const [val2, setVal2] = useState('');
  const [val3, setVal3] = useState('');
  const [val4, setVal4] = useState('');

  const result1 = useMemo(() => {
    const num1 = parseFloat(val1);
    const num2 = parseFloat(val2);
    if (isNaN(num1) || isNaN(num2) || num2 === 0) return '...';
    return ((num1 * num2) / 100).toFixed(2);
  }, [val1, val2]);

  const result2 = useMemo(() => {
    const num3 = parseFloat(val3);
    const num4 = parseFloat(val4);
    if (isNaN(num3) || isNaN(num4) || num4 === 0) return '...';
    return ((num3 / num4) * 100).toFixed(2) + '%';
  }, [val3, val4]);

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Free Percentage Calculator</h1>
        <p className="mt-1 text-lg text-gray-600 dark:text-slate-400">Quickly and easily perform common percentage calculations, such as finding a percentage of a number or determining what percentage one number is of another.</p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 max-w-2xl mx-auto space-y-8 dark:bg-slate-800 dark:border-slate-700">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-200">What is X % of Y?</h3>
          <div className="flex items-center gap-4 flex-wrap mt-2">
            <input
              type="number"
              value={val1}
              onChange={(e) => setVal1(e.target.value)}
              placeholder="X"
              className="w-24 block px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
            />
            <span className="text-gray-600 dark:text-slate-400">% of</span>
            <input
              type="number"
              value={val2}
              onChange={(e) => setVal2(e.target.value)}
              placeholder="Y"
              className="w-24 block px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
            />
            <span className="text-gray-600 dark:text-slate-400">=</span>
            <div className="flex-1 min-w-[6rem] p-3 bg-[var(--theme-primary-light)] border border-sky-200 rounded-md text-center dark:bg-slate-700 dark:border-slate-600">
              <span className="font-bold text-xl text-[var(--theme-primary)] dark:text-[var(--theme-text-gold)]">{result1}</span>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-200">X is what % of Y?</h3>
          <div className="flex items-center gap-4 flex-wrap mt-2">
            <input
              type="number"
              value={val3}
              onChange={(e) => setVal3(e.target.value)}
              placeholder="X"
              className="w-24 block px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
            />
            <span className="text-gray-600 dark:text-slate-400">is what % of</span>
            <input
              type="number"
              value={val4}
              onChange={(e) => setVal4(e.target.value)}
              placeholder="Y"
              className="w-24 block px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
            />
            <span className="text-gray-600 dark:text-slate-400">=</span>
            <div className="flex-1 min-w-[6rem] p-3 bg-[var(--theme-primary-light)] border border-sky-200 rounded-md text-center dark:bg-slate-700 dark:border-slate-600">
              <span className="font-bold text-xl text-[var(--theme-primary)] dark:text-[var(--theme-text-gold)]">{result2}</span>
            </div>
          </div>
        </div>
      </div>

       <div className="bg-white p-6 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 space-y-6 max-w-4xl mx-auto">
        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Understanding Percentage Calculations</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">A percentage is a number or ratio expressed as a fraction of 100. It is a common way to represent parts of a whole, such as discounts, statistics, or grades. Our percentage calculator simplifies common percentage problems, whether you're calculating a tip, figuring out a sales discount, or analyzing data. It provides instant, accurate answers for your everyday math needs.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">How to Use This Calculator</h2>
          <ol className="list-decimal list-inside mt-2 space-y-2 text-slate-600 dark:text-slate-300">
            <li><strong>Choose the Calculation Type:</strong> Decide which problem you want to solve—either "What is X% of Y?" or "X is what % of Y?".</li>
            <li><strong>Enter Your Numbers:</strong> Fill in the corresponding input boxes (marked X and Y) with your values.</li>
            <li><strong>Get the Result:</strong> The answer will appear instantly in the result box as you type. There's no need to press a "calculate" button.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Benefits of Our Percentage Calculator</h2>
          <ul className="list-disc list-inside mt-2 space-y-2 text-slate-600 dark:text-slate-300">
            <li><strong>Fast and Simple:</strong> The clean design and real-time calculations provide a seamless user experience.</li>
            <li><strong>Handles Multiple Scenarios:</strong> Solves the two most common percentage problems in one convenient tool.</li>
            <li><strong>Accurate Results:</strong> Avoid manual calculation errors and get precise answers every time.</li>
            <li><strong>Completely Free:</strong> This tool is free to use without any restrictions or hidden fees.</li>
          </ul>
        </section>
        
        <section>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Related Tools</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
                For more specific calculations, you might like our <a href="#" className="text-[var(--theme-primary)] hover:underline dark:text-sky-400">Discount Calculator</a> or <a href="#" className="text-[var(--theme-primary)] hover:underline dark:text-sky-400">GPA Calculator</a>.
            </p>
        </section>
        
        <section>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Frequently Asked Questions (FAQs)</h2>
            <div className="mt-2 space-y-3 text-slate-600 dark:text-slate-300">
              <div>
                <h3 className="font-semibold">What is the formula for calculating a percentage?</h3>
                <p>To find what X is as a percentage of Y, the formula is (X / Y) * 100. To find a percentage of a number, the formula is (Percentage / 100) * Number.</p>
              </div>
            </div>
        </section>
      </div>
    </div>
  );
};

export default PercentageCalculator;