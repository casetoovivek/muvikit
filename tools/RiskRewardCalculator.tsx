import React, { useState, useMemo } from 'react';

const RiskRewardCalculator: React.FC = () => {
  const [entryPrice, setEntryPrice] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [stopLossPrice, setStopLossPrice] = useState('');

  const { potentialProfit, potentialLoss, riskRewardRatio } = useMemo(() => {
    const entry = parseFloat(entryPrice);
    const target = parseFloat(targetPrice);
    const stopLoss = parseFloat(stopLossPrice);

    if (isNaN(entry) || isNaN(target) || isNaN(stopLoss) || entry <= 0 || target <= 0 || stopLoss <= 0) {
      return { potentialProfit: 0, potentialLoss: 0, riskRewardRatio: '0' };
    }

    const profit = Math.abs(target - entry);
    const loss = Math.abs(entry - stopLoss);
    
    if (loss === 0) {
        return { potentialProfit: profit, potentialLoss: loss, riskRewardRatio: '∞' };
    }

    const ratio = profit / loss;
    
    return { potentialProfit: profit, potentialLoss: loss, riskRewardRatio: ratio.toFixed(2) };
  }, [entryPrice, targetPrice, stopLossPrice]);

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Risk/Reward Calculator</h2>
        <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">Determine the risk vs. reward for a potential trade.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4 dark:bg-slate-800 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Trade Setup</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Entry Price</label>
            <input type="number" value={entryPrice} onChange={e => setEntryPrice(e.target.value)} placeholder="e.g., 100" className="mt-1 w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 placeholder-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Target Price (Profit)</label>
            <input type="number" value={targetPrice} onChange={e => setTargetPrice(e.target.value)} placeholder="e.g., 120" className="mt-1 w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 placeholder-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Stop-Loss Price</label>
            <input type="number" value={stopLossPrice} onChange={e => setStopLossPrice(e.target.value)} placeholder="e.g., 95" className="mt-1 w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 placeholder-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"/>
          </div>
        </div>
        
        <div className="space-y-4">
            <div className="bg-[var(--theme-primary-light)] p-6 rounded-lg border border-sky-200 text-center dark:bg-slate-800 dark:border-sky-900">
                <p className="text-lg text-[var(--theme-primary)] dark:text-sky-300">Risk/Reward Ratio</p>
                <p className="text-5xl font-bold text-[var(--theme-primary)] dark:text-[var(--theme-text-gold)]">1 : {riskRewardRatio}</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-slate-200 flex justify-between text-center dark:bg-slate-800 dark:border-slate-700">
                <div className="text-green-600 dark:text-green-400">
                    <p className="text-md">Potential Profit / Share</p>
                    <p className="text-2xl font-semibold">${potentialProfit.toFixed(2)}</p>
                </div>
                 <div className="text-red-600 dark:text-red-400">
                    <p className="text-md">Potential Loss / Share</p>
                    <p className="text-2xl font-semibold">${potentialLoss.toFixed(2)}</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default RiskRewardCalculator;