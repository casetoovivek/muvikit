import React, { useState, useMemo } from 'react';

const PositionSizeCalculator: React.FC = () => {
  const [accountSize, setAccountSize] = useState('10000');
  const [riskPercent, setRiskPercent] = useState('2');
  const [entryPrice, setEntryPrice] = useState('');
  const [stopLossPrice, setStopLossPrice] = useState('');

  const { amountToRisk, positionSize } = useMemo(() => {
    const account = parseFloat(accountSize);
    const risk = parseFloat(riskPercent) / 100;
    const entry = parseFloat(entryPrice);
    const stopLoss = parseFloat(stopLossPrice);

    if (isNaN(account) || isNaN(risk) || isNaN(entry) || isNaN(stopLoss) || account <= 0 || risk <= 0 || entry <= 0 || stopLoss <= 0) {
      return { amountToRisk: 0, positionSize: 0 };
    }
    
    if (entry <= stopLoss) {
        return { amountToRisk: 0, positionSize: 0 };
    }

    const riskAmount = account * risk;
    const riskPerShare = entry - stopLoss;
    const size = riskAmount / riskPerShare;

    return { amountToRisk: riskAmount, positionSize: size };
  }, [accountSize, riskPercent, entryPrice, stopLossPrice]);

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Position Size Calculator</h2>
        <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">Calculate how many shares to buy based on your risk tolerance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4 dark:bg-slate-800 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Your Inputs</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Account Size ($)</label>
            <input type="number" value={accountSize} onChange={e => setAccountSize(e.target.value)} className="mt-1 w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Risk per Trade (%)</label>
            <input type="number" value={riskPercent} onChange={e => setRiskPercent(e.target.value)} className="mt-1 w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Entry Price ($)</label>
            <input type="number" value={entryPrice} onChange={e => setEntryPrice(e.target.value)} className="mt-1 w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Stop-Loss Price ($)</label>
            <input type="number" value={stopLossPrice} onChange={e => setStopLossPrice(e.target.value)} className="mt-1 w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"/>
          </div>
        </div>
        
        <div className="space-y-4">
            <div className="bg-[var(--theme-primary-light)] p-6 rounded-lg border border-sky-200 text-center dark:bg-slate-800 dark:border-sky-900">
                <p className="text-lg text-[var(--theme-primary)] dark:text-sky-300">Position Size (Shares to Buy)</p>
                <p className="text-5xl font-bold text-[var(--theme-primary)] dark:text-[var(--theme-text-gold)]">{positionSize.toFixed(2)}</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-slate-200 text-center dark:bg-slate-800 dark:border-slate-700">
                <p className="text-md text-slate-600 dark:text-slate-400">Amount to Risk on this Trade</p>
                <p className="text-2xl font-semibold text-slate-800 dark:text-slate-200">${amountToRisk.toFixed(2)}</p>
            </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 space-y-6">
        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">What is a Position Size Calculator?</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">A Position Size Calculator is one of the most critical risk management tools for a trader. It tells you exactly how many shares or units of an asset to buy or sell to ensure you only risk a specific, pre-determined percentage of your trading capital on a single trade. By using this tool, you can standardize your risk across all trades, regardless of the stock's price or your stop-loss distance, which is fundamental to long-term survival and profitability in the markets.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">How to Use This Tool</h2>
          <ol className="list-decimal list-inside mt-2 space-y-2 text-slate-600 dark:text-slate-300">
            <li><strong>Enter Account Size:</strong> Input your total trading capital.</li>
            <li><strong>Define Your Risk:</strong> Enter the maximum percentage of your account you are willing to risk on this one trade (e.g., 1% or 2%).</li>
            <li><strong>Set Your Entry Price:</strong> Input the price at which you plan to buy the stock.</li>
            <li><strong>Set Your Stop-Loss:</strong> Input the price at which you will sell to exit the trade if it moves against you.</li>
            <li><strong>Get Your Position Size:</strong> The calculator will show you exactly how many shares to purchase to adhere to your risk plan.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Benefits of Position Sizing</h2>
          <ul className="list-disc list-inside mt-2 space-y-2 text-slate-600 dark:text-slate-300">
            <li><strong>Capital Preservation:</strong> Prevents any single losing trade from causing significant damage to your account.</li>
            <li><strong>Emotional Control:</strong> Trading with a defined risk reduces fear and greed, leading to better decision-making.</li>
            <li><strong>Consistent Risk Exposure:</strong> Ensures that your risk is the same for every trade, whether you are trading a $10 stock or a $1000 stock.</li>
            <li><strong>Professional Approach:</strong> It's a cornerstone of all professional trading strategies.</li>
          </ul>
        </section>

        <section>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Frequently Asked Questions (FAQs)</h2>
            <div className="mt-2 space-y-3 text-slate-600 dark:text-slate-300">
              <div>
                <h3 className="font-semibold">What is a common risk percentage to use?</h3>
                <p>Most professional traders risk between 0.5% and 2% of their total account capital on any single trade. New traders are often advised to start with 1% or less.</p>
              </div>
              <div>
                <h3 className="font-semibold">Why can't I just buy 100 shares of everything?</h3>
                <p>Buying a fixed number of shares exposes you to vastly different levels of risk. A 10% drop in a $200 stock would cause a much larger monetary loss than a 10% drop in a $20 stock. Position sizing fixes this by standardizing the dollar amount at risk.</p>
              </div>
            </div>
        </section>
      </div>
    </div>
  );
};

export default PositionSizeCalculator;
