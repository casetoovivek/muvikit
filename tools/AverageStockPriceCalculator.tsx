import React, { useState, useMemo } from 'react';
import { TrashIcon } from '../components/icons';

interface Purchase {
  id: number;
  shares: string;
  price: string;
}

const AverageStockPriceCalculator: React.FC = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([
    { id: 1, shares: '', price: '' },
    { id: 2, shares: '', price: '' },
  ]);
  const [nextId, setNextId] = useState(3);

  const { totalShares, totalCost, averagePrice } = useMemo(() => {
    let sharesSum = 0;
    let costSum = 0;
    purchases.forEach(p => {
      const s = parseFloat(p.shares);
      const pr = parseFloat(p.price);
      if (!isNaN(s) && !isNaN(pr) && s > 0 && pr > 0) {
        sharesSum += s;
        costSum += s * pr;
      }
    });
    return {
      totalShares: sharesSum,
      totalCost: costSum,
      averagePrice: sharesSum > 0 ? costSum / sharesSum : 0,
    };
  }, [purchases]);

  const handlePurchaseChange = (id: number, field: keyof Omit<Purchase, 'id'>, value: string) => {
    setPurchases(purchases.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const addPurchase = () => {
    setPurchases([...purchases, { id: nextId, shares: '', price: '' }]);
    setNextId(nextId + 1);
  };

  const removePurchase = (id: number) => {
    setPurchases(purchases.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Average Stock Price Calculator</h2>
        <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">Calculate the average price of shares bought at different prices.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4 dark:bg-slate-800 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Your Purchases</h3>
          {purchases.map((purchase, index) => (
            <div key={purchase.id} className="flex items-center gap-2">
              <span className="text-slate-500 font-medium dark:text-slate-400">#{index + 1}</span>
              <input
                type="number"
                placeholder="Shares"
                value={purchase.shares}
                onChange={(e) => handlePurchaseChange(purchase.id, 'shares', e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 placeholder-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400"
              />
              <input
                type="number"
                placeholder="Price"
                value={purchase.price}
                onChange={(e) => handlePurchaseChange(purchase.id, 'price', e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 placeholder-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400"
              />
              <button onClick={() => removePurchase(purchase.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full dark:hover:bg-red-900/50" aria-label="Delete purchase">
                <TrashIcon className="w-5 h-5"/>
              </button>
            </div>
          ))}
          <button onClick={addPurchase} className="w-full py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-colors dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200">
            Add Another Purchase
          </button>
        </div>
        
        <div className="space-y-4">
            <div className="bg-[var(--theme-primary-light)] p-6 rounded-lg border border-sky-200 text-center dark:bg-slate-800 dark:border-sky-900">
                <p className="text-lg text-[var(--theme-primary)] dark:text-sky-300">Average Price Per Share</p>
                <p className="text-5xl font-bold text-[var(--theme-primary)] dark:text-[var(--theme-text-gold)]">${averagePrice.toFixed(3)}</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-slate-200 flex justify-between text-center dark:bg-slate-800 dark:border-slate-700">
                <div>
                    <p className="text-md text-slate-600 dark:text-slate-400">Total Shares</p>
                    <p className="text-2xl font-semibold text-slate-800 dark:text-slate-200">{totalShares}</p>
                </div>
                 <div>
                    <p className="text-md text-slate-600 dark:text-slate-400">Total Cost</p>
                    <p className="text-2xl font-semibold text-slate-800 dark:text-slate-200">${totalCost.toFixed(2)}</p>
                </div>
            </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 space-y-6">
        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">What is a Stock Average Calculator?</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">A Stock Average Calculator is a financial tool used by investors to determine the weighted average cost of their shares when they have bought the same stock at different prices over time. This is also known as calculating the "cost basis." It's essential for understanding your true break-even point and accurately calculating your profit or loss when you eventually sell the shares.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">How to Use This Tool</h2>
          <ol className="list-decimal list-inside mt-2 space-y-2 text-slate-600 dark:text-slate-300">
            <li><strong>Enter Your Purchases:</strong> For each purchase you made, enter the number of "Shares" and the "Price" per share.</li>
            <li><strong>Add More Trades:</strong> If you have more than two purchases, click the "Add Another Purchase" button to add more rows.</li>
            <li><strong>View the Results:</strong> The tool automatically calculates your "Average Price Per Share," as well as your "Total Shares" and "Total Cost."</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Benefits of Using Our Tool</h2>
          <ul className="list-disc list-inside mt-2 space-y-2 text-slate-600 dark:text-slate-300">
            <li><strong>Accurate Cost Basis:</strong> Get a precise weighted average price for accurate profit and loss tracking.</li>
            <li><strong>Better Decision Making:</strong> Knowing your average cost helps in setting realistic profit targets and stop-loss levels.</li>
            <li><strong>Simple and Fast:</strong> No complex spreadsheets needed. Just enter your trades and get instant results.</li>
            <li><strong>Portfolio Management:</strong> An essential tool for investors who "average down" or "average up" on their positions.</li>
          </ul>
        </section>

        <section>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Frequently Asked Questions (FAQs)</h2>
            <div className="mt-2 space-y-3 text-slate-600 dark:text-slate-300">
              <div>
                <h3 className="font-semibold">Does this calculator include brokerage fees or commissions?</h3>
                <p>No, this is a simplified calculator that does not factor in brokerage fees. For a more precise cost basis, you would typically add the commission cost to your total investment amount.</p>
              </div>
              <div>
                <h3 className="font-semibold">How is the average price calculated?</h3>
                <p>It's a weighted average. The formula is: (Total Cost of All Purchases) / (Total Number of Shares). This gives more "weight" to purchases where you bought more shares.</p>
              </div>
            </div>
        </section>
      </div>
    </div>
  );
};

export default AverageStockPriceCalculator;
