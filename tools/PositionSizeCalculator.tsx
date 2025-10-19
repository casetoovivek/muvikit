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
            <input type="number" value={accountSize} onChange={e => setAccountSize(e.target.value)} className="mt-1 w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-white"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Risk per Trade (%)</label>
            <input type="number" value={riskPercent} onChange={e => setRiskPercent(e.target.value)} className="mt-1 w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-white"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Entry Price ($)</label>
            <input type="number" value={entryPrice} onChange={e => setEntryPrice(e.target.value)} className="mt-1 w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-white"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Stop-Loss Price ($)</label>
            <input type="number" value={stopLossPrice} onChange={e => setStopLossPrice(e.target.value)} className="mt-1 w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-white"/>
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
    </div>
  );
};

export default PositionSizeCalculator;