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
            <input type="number" value={entryPrice} onChange={e => setEntryPrice(e.target.value)} placeholder="e.g., 100" className="mt-1 w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 placeholder-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Target Price (Profit)</label>
            <input type="number" value={targetPrice} onChange={e => setTargetPrice(e.target.value)} placeholder="e.g., 120" className="mt-1 w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 placeholder-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Stop-Loss Price</label>
            <input type="number" value={stopLossPrice} onChange={e => setStopLossPrice(e.target.value)} placeholder="e.g., 95" className="mt-1 w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 placeholder-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400"/>
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
      <div className="bg-white p-6 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 space-y-6">
        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">What is a Risk/Reward Calculator?</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">A Risk/Reward Calculator is an essential risk management tool for traders. It calculates the ratio between the potential profit you could make on a trade if it hits your target and the potential loss you would incur if it hits your stop-loss. This ratio helps you evaluate whether a trade is worth taking. A favorable ratio means the potential reward is significantly greater than the potential risk.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">How to Use This Tool</h2>
          <ol className="list-decimal list-inside mt-2 space-y-2 text-slate-600 dark:text-slate-300">
            <li><strong>Enter Entry Price:</strong> Input the price at which you plan to enter the trade.</li>
            <li><strong>Enter Target Price:</strong> Input your profit target, the price at which you plan to sell for a profit.</li>
            <li><strong>Enter Stop-Loss Price:</strong> Input your stop-loss, the price at which you will sell to limit your losses if the trade goes against you.</li>
            <li><strong>Analyze the Ratio:</strong> The calculator instantly shows your Risk/Reward ratio. A ratio of "1 : 2" means you are risking $1 to potentially make $2.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Benefits of Our R/R Calculator</h2>
          <ul className="list-disc list-inside mt-2 space-y-2 text-slate-600 dark:text-slate-300">
            <li><strong>Improved Decision Making:</strong> Quickly assess if a trade setup meets your risk management criteria.</li>
            <li><strong>Enforces Discipline:</strong> Encourages you to think about both profit and loss before entering a trade.</li>
            <li><strong>Visualize Your Trade:</strong> Clearly see your potential profit and loss per share.</li>
            <li><strong>Essential for Strategy:</strong> Helps you find and filter for high-probability, high-reward trade setups.</li>
          </ul>
        </section>

        <section>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Frequently Asked Questions (FAQs)</h2>
            <div className="mt-2 space-y-3 text-slate-600 dark:text-slate-300">
              <div>
                <h3 className="font-semibold">What is a good Risk/Reward ratio?</h3>
                <p>Many traders aim for a ratio of at least 1:2, meaning the potential profit is at least twice the potential loss. However, the ideal ratio can depend on your trading strategy and win rate.</p>
              </div>
              <div>
                <h3 className="font-semibold">Does this tool work for short selling?</h3>
                <p>Yes. The calculator uses absolute differences, so it works for both long (buy low, sell high) and short (sell high, buy low) trades. Simply enter your prices as they are.</p>
              </div>
            </div>
        </section>
      </div>
    </div>
  );
};

export default RiskRewardCalculator;
