import React, { useState, useMemo } from 'react';

const ProfitLossCalculator: React.FC = () => {
  const [buyPrice, setBuyPrice] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [commission, setCommission] = useState('');

  const { profitLoss, percentageReturn, isProfit } = useMemo(() => {
    const buy = parseFloat(buyPrice);
    const sell = parseFloat(sellPrice);
    const qty = parseFloat(quantity);
    const comm = parseFloat(commission) || 0;

    if (isNaN(buy) || isNaN(sell) || isNaN(qty) || buy <= 0 || sell <= 0 || qty <= 0) {
      return { profitLoss: 0, percentageReturn: 0, isProfit: false };
    }

    const totalBuyCost = buy * qty + comm;
    const totalSellValue = sell * qty - comm;
    const pl = totalSellValue - totalBuyCost;
    const percent = (pl / totalBuyCost) * 100;

    return { profitLoss: pl, percentageReturn: percent, isProfit: pl >= 0 };
  }, [buyPrice, sellPrice, quantity, commission]);

  const resultColor = isProfit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  const resultBg = isProfit ? 'bg-green-50 border-green-200 dark:bg-green-900/50 dark:border-green-800' : 'bg-red-50 border-red-200 dark:bg-red-900/50 dark:border-red-800';

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Profit/Loss Calculator</h2>
        <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">Calculate the profit or loss from your stock trades.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4 dark:bg-slate-800 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Trade Details</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Buy Price per Share</label>
            <input type="number" value={buyPrice} onChange={e => setBuyPrice(e.target.value)} placeholder="e.g., 150.50" className="mt-1 w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 placeholder-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Sell Price per Share</label>
            <input type="number" value={sellPrice} onChange={e => setSellPrice(e.target.value)} placeholder="e.g., 165.75" className="mt-1 w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 placeholder-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Quantity (Shares)</label>
            <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="e.g., 100" className="mt-1 w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 placeholder-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Commissions (Optional, total for buy & sell)</label>
            <input type="number" value={commission} onChange={e => setCommission(e.target.value)} placeholder="e.g., 10" className="mt-1 w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 placeholder-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"/>
          </div>
        </div>
        
        <div className={`p-6 rounded-lg border text-center ${resultBg}`}>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">Result</h3>
            <div className="mb-4">
                <p className="text-lg text-slate-600 dark:text-slate-400">{isProfit ? 'Total Profit' : 'Total Loss'}</p>
                <p className={`text-5xl font-bold ${resultColor} dark:text-[var(--theme-text-gold)]`}>${Math.abs(profitLoss).toFixed(2)}</p>
            </div>
            <div>
                <p className="text-lg text-slate-600 dark:text-slate-400">Percentage Return</p>
                <p className={`text-3xl font-bold ${resultColor}`}>{percentageReturn.toFixed(2)}%</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProfitLossCalculator;