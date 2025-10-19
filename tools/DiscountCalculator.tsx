import React, { useState, useMemo } from 'react';

const DiscountCalculator: React.FC = () => {
  const [originalPrice, setOriginalPrice] = useState('');
  const [discount, setDiscount] = useState('');

  const { finalPrice, savedAmount } = useMemo(() => {
    const price = parseFloat(originalPrice);
    const disc = parseFloat(discount);

    if (isNaN(price) || isNaN(disc) || price < 0 || disc < 0 || disc > 100) {
      return { finalPrice: 0, savedAmount: 0 };
    }

    const saved = (price * disc) / 100;
    const final = price - saved;
    return { finalPrice: final, savedAmount: saved };
  }, [originalPrice, discount]);

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Discount Calculator</h2>
        <p className="mt-1 text-md text-gray-600 dark:text-slate-400">Calculate the final price after a discount.</p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4 max-w-md mx-auto dark:bg-slate-800 dark:border-slate-700">
        <div>
          <label htmlFor="originalPrice" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Original Price ($)</label>
          <input
            type="number"
            id="originalPrice"
            value={originalPrice}
            onChange={(e) => setOriginalPrice(e.target.value)}
            placeholder="e.g., 100"
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
          />
        </div>
        <div>
          <label htmlFor="discount" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Discount (%)</label>
          <input
            type="number"
            id="discount"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            placeholder="e.g., 25"
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
          />
        </div>
      </div>

      {finalPrice > 0 && (
         <div className="bg-[var(--theme-primary-light)] p-6 rounded-lg border border-sky-200 text-center max-w-md mx-auto dark:bg-slate-800 dark:border-sky-900">
            <div className="mb-4">
                <p className="text-lg text-gray-600 dark:text-slate-400">You Save</p>
                <p className="text-4xl font-bold text-green-600 dark:text-green-400">${savedAmount.toFixed(2)}</p>
            </div>
            <div>
                <p className="text-lg text-gray-600 dark:text-slate-400">Final Price</p>
                <p className="text-4xl font-bold text-[var(--theme-primary)] dark:text-[var(--theme-text-gold)]">${finalPrice.toFixed(2)}</p>
            </div>
        </div>
      )}
    </div>
  );
};

export default DiscountCalculator;