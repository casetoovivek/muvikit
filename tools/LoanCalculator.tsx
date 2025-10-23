import React, { useState, useMemo } from 'react';

const LoanCalculator: React.FC = () => {
  const [amount, setAmount] = useState('100000');
  const [rate, setRate] = useState('8.5');
  const [term, setTerm] = useState('10');

  const { monthlyPayment, totalPayment, totalInterest } = useMemo(() => {
    const principal = parseFloat(amount);
    const annualRate = parseFloat(rate);
    const years = parseFloat(term);

    if (isNaN(principal) || isNaN(annualRate) || isNaN(years) || principal <= 0 || annualRate < 0 || years <= 0) {
      return { monthlyPayment: 0, totalPayment: 0, totalInterest: 0 };
    }

    const monthlyRate = annualRate / 100 / 12;
    const numberOfPayments = years * 12;
    
    if(monthlyRate === 0) {
        const monthly = principal / numberOfPayments;
        return { monthlyPayment: monthly, totalPayment: principal, totalInterest: 0};
    }

    const monthly = (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    const total = monthly * numberOfPayments;
    const interest = total - principal;

    return { monthlyPayment: monthly, totalPayment: total, totalInterest: interest };
  }, [amount, rate, term]);

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Free Loan & EMI Calculator</h1>
        <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">Estimate your monthly loan payments (EMI), total interest, and total payment for personal loans, car loans, or home loans.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4 dark:bg-slate-800 dark:border-slate-700">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Loan Amount ($)</label>
            <input type="number" id="amount" value={amount} onChange={e => setAmount(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"/>
          </div>
          <div>
            <label htmlFor="rate" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Annual Interest Rate (%)</label>
            <input type="number" id="rate" value={rate} onChange={e => setRate(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"/>
          </div>
          <div>
            <label htmlFor="term" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Loan Term (Years)</label>
            <input type="number" id="term" value={term} onChange={e => setTerm(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"/>
          </div>
        </div>
        
        <div className="space-y-4">
            <div className="bg-[var(--theme-primary-light)] p-6 rounded-lg border border-sky-200 text-center dark:bg-slate-800 dark:border-sky-900">
                <p className="text-lg text-[var(--theme-primary)] dark:text-sky-300">Monthly Payment (EMI)</p>
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
      
       <div className="bg-white p-6 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 space-y-6 max-w-4xl mx-auto">
        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">What is an EMI Calculator?</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">An EMI (Equated Monthly Installment) Calculator is a financial tool that helps you calculate your fixed monthly payment towards a loan. It takes into account the loan principal, the interest rate, and the loan tenure to determine how much you need to pay each month. This is essential for financial planning, as it allows you to understand your monthly commitment and the total cost of borrowing before taking out a loan for a car, home, or personal expense.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">How to Use the Loan Calculator</h2>
          <ol className="list-decimal list-inside mt-2 space-y-2 text-slate-600 dark:text-slate-300">
            <li><strong>Enter Loan Amount:</strong> Input the total principal amount you wish to borrow.</li>
            <li><strong>Enter Interest Rate:</strong> Provide the annual interest rate for the loan.</li>
            <li><strong>Enter Loan Term:</strong> Set the duration of the loan in years.</li>
            <li><strong>Review Results:</strong> The calculator will instantly display your monthly EMI, the total interest you'll pay over the loan's lifetime, and the total amount you'll repay.</li>
          </ol>
        </section>
        
        <section>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Frequently Asked Questions (FAQs)</h2>
            <div className="mt-2 space-y-3 text-slate-600 dark:text-slate-300">
              <div>
                <h3 className="font-semibold">What does EMI stand for?</h3>
                <p>EMI stands for Equated Monthly Installment. It's a fixed payment amount made by a borrower to a lender at a specified date each calendar month.</p>
              </div>
              <div>
                <h3 className="font-semibold">Does this calculator include other fees?</h3>
                <p>No, this is a simplified EMI calculator that only considers the principal and interest. It does not include other potential charges like processing fees, prepayment charges, or insurance.</p>
              </div>
            </div>
        </section>
      </div>
    </div>
  );
};

export default LoanCalculator;