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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Free Discount Calculator Online</h1>
        <p className="mt-1 text-lg text-gray-600 dark:text-slate-400">Quickly calculate the final price after a discount and see how much you've saved with our easy-to-use discount calculator.</p>
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
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400"
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
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400"
          />
        </div>
      </div>

      {(parseFloat(originalPrice) > 0 && parseFloat(discount) > 0) && (
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
      
       <div className="bg-white p-6 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 space-y-6 max-w-4xl mx-auto">
        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">What is a Discount Calculator?</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">A Discount Calculator is a simple tool designed to help you figure out the final price of an item after a percentage-based discount has been applied. It also shows you the exact amount of money you save. Whether you're shopping during a sale, running a business, or just want to double-check a price, this calculator makes it easy to understand the real cost of a discounted item without doing manual math.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">How to Use This Tool</h2>
          <ol className="list-decimal list-inside mt-2 space-y-2 text-slate-600 dark:text-slate-300">
            <li><strong>Enter the Original Price:</strong> In the first field, type the full, non-discounted price of the item.</li>
            <li><strong>Enter the Discount Percentage:</strong> In the second field, enter the discount rate (e.g., for 25% off, enter "25").</li>
            <li><strong>View the Results:</strong> The calculator will instantly show you the final price you'll pay and the total amount you saved.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Benefits of Using This Tool</h2>
          <ul className="list-disc list-inside mt-2 space-y-2 text-slate-600 dark:text-slate-300">
            <li><strong>Quick and Accurate:</strong> Get instant and error-free calculations to make smart shopping decisions.</li>
            <li><strong>Clear Savings:</strong> See exactly how much money you are saving, which helps in budgeting.</li>
            <li><strong>Easy to Use:</strong> The simple interface requires only two inputs to get all the information you need.</li>
            <li><strong>Free for Everyone:</strong> Use this tool anytime, anywhere, without any cost or limitations.</li>
          </ul>
        </section>
        
        <section>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Related Tools</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
                You might also find our <a href="#" className="text-[var(--theme-primary)] hover:underline dark:text-sky-400">Percentage Calculator</a> or <a href="#" className="text-[var(--theme-primary)] hover:underline dark:text-sky-400">Loan Calculator</a> useful for other financial calculations.
            </p>
        </section>
        
        <section>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Frequently Asked Questions (FAQs)</h2>
            <div className="mt-2 space-y-3 text-slate-600 dark:text-slate-300">
              <div>
                <h3 className="font-semibold">How do you calculate a discount?</h3>
                <p>To calculate a discount, you convert the percentage to a decimal (e.g., 20% = 0.20) and multiply it by the original price. This gives you the saved amount. Subtract the saved amount from the original price to get the final price.</p>
              </div>
              <div>
                <h3 className="font-semibold">What if there are multiple discounts?</h3>
                <p>For multiple discounts (e.g., 20% off, then an additional 10% off), you must apply them sequentially. This tool is designed for a single discount, but you can calculate the first discount, then use the final price as the "Original Price" for the second discount.</p>
              </div>
            </div>
        </section>
      </div>
    </div>
  );
};

export default DiscountCalculator;