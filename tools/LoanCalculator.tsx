import React, { useState, useMemo } from 'react';

const LoanCalculator: React.FC = () => {
  const [amount, setAmount] = useState('10000');
  const [rate, setRate] = useState('5');
  const [term, setTerm] = useState('5');

  const { monthlyPayment, totalPayment, totalInterest } = useMemo(() => {
    const principal = parseFloat(amount);
    const annualRate = parseFloat(rate);
    const years = parseFloat(term);

    if (isNaN(principal) || isNaN(annualRate) || isNaN(years) || principal <= 0 || annualRate <= 0 || years <= 0) {
      return { monthlyPayment: 0, totalPayment: 0, totalInterest: 0 };
    }

    const monthlyRate = annualRate / 100 / 12;
    const numberOfPayments = years * 12;
    
    const monthly = (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    const total = monthly * numberOfPayments;
    const interest = total - principal;

    return { monthlyPayment: monthly, totalPayment: total, totalInterest: interest };
  }, [amount, rate, term]);

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Loan Calculator</h2>
        <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">Estimate your monthly loan payments.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4 dark:bg-slate-800 dark:border-slate-700">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Loan Amount ($)</label>
            <input type="number" id="amount" value={amount} onChange={e => setAmount(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"/>
          </div>
          <div>
            <label htmlFor="rate" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Annual Interest Rate (%)</label>
            <input type="number" id="rate" value={rate} onChange={e => setRate(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"/>
          </div>
          <div>
            <label htmlFor="term" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Loan Term (Years)</label>
            <input type="number" id="term" value={term} onChange={e => setTerm(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"/>
          </div>
        </div>
        
        <div className="space-y-4">
            <div className="bg-[var(--theme-primary-light)] p-6 rounded-lg border border-sky-200 text-center dark:bg-slate-800 dark:border-sky-900">
                <p className="text-lg text-[var(--theme-primary)] dark:text-sky-300">Monthly Payment</p>
                <p className="text-4xl font-bold text-[var(--theme-primary)] dark:text-[var(--theme-text-gold)]">${monthlyPayment.toFixed(2)}</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-slate-200 flex justify-between dark:bg-slate-800 dark:border-slate-700">
                <div>
                    <p className="text-md text-gray-600 dark:text-slate-400">Total Payment</p>
                    <p className="text-2xl font-semibold text-slate-800 dark:text-slate-200">${totalPayment.toFixed(2)}</p>
                </div>
                 <div>
                    <p className="text-md text-gray-600 dark:text-slate-400">Total Interest</p>
                    <p className="text-2xl font-semibold text-slate-800 dark:text-slate-200">${totalInterest.toFixed(2)}</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LoanCalculator;