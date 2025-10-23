import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { SpinnerIcon } from '../components/icons';

const currencies = {
    'USD': 'United States Dollar',
    'EUR': 'Euro',
    'GBP': 'British Pound Sterling',
    'INR': 'Indian Rupee',
    'JPY': 'Japanese Yen',
    'CAD': 'Canadian Dollar',
    'AUD': 'Australian Dollar',
    'CHF': 'Swiss Franc',
    'CNY': 'Chinese Yuan',
    'AED': 'UAE Dirham',
    'SGD': 'Singapore Dollar',
    'NZD': 'New Zealand Dollar',
};
type CurrencyCode = keyof typeof currencies;

const CurrencyConverter: React.FC = () => {
    const [amount, setAmount] = useState('100');
    const [fromCurrency, setFromCurrency] = useState<CurrencyCode>('USD');
    const [toCurrency, setToCurrency] = useState<CurrencyCode>('INR');
    const [exchangeRate, setExchangeRate] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchRate = useCallback(async (from: CurrencyCode, to: CurrencyCode) => {
        if (from === to) {
            setExchangeRate(1);
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `What is the current exchange rate from ${from} to ${to}? Respond with only the numerical value, for example: 83.54. Do not include any other words, symbols, or explanations.`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: { tools: [{ googleSearch: {} }] },
            });
            
            const rateText = response.text.trim().match(/[\d,.]+/)?.[0] || '';
            const rateValue = parseFloat(rateText.replace(/,/g, ''));

            if (isNaN(rateValue) || rateValue <= 0) {
                throw new Error("AI returned an invalid rate.");
            }
            setExchangeRate(rateValue);
        } catch (err: any) {
            setError('Failed to fetch the latest exchange rate. Please try again.');
            setExchangeRate(null);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRate(fromCurrency, toCurrency);
    }, [fromCurrency, toCurrency, fetchRate]);

    const convertedAmount = useMemo(() => {
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || exchangeRate === null) {
            return 0;
        }
        return numericAmount * exchangeRate;
    }, [amount, exchangeRate]);

    const handleSwapCurrencies = () => {
        setFromCurrency(toCurrency);
        setToCurrency(fromCurrency);
    };

    return (
        <div className="space-y-6">
            <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Live Currency Converter</h1>
                <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">Convert amounts between major world currencies with real-time exchange rates powered by AI and Google Search.</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200 max-w-2xl mx-auto space-y-6 dark:bg-slate-800 dark:border-slate-700">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                    <div className="sm:col-span-1">
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Amount</label>
                        <input
                            type="number"
                            id="amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] sm:text-lg dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                        />
                    </div>
                    <div className="sm:col-span-1">
                        <label htmlFor="fromCurrency" className="block text-sm font-medium text-gray-700 dark:text-slate-300">From</label>
                        <select
                            id="fromCurrency"
                            value={fromCurrency}
                            onChange={(e) => setFromCurrency(e.target.value as CurrencyCode)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] sm:text-lg rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                        >
                            {Object.entries(currencies).map(([code, name]) => (
                                <option key={code} value={code}>{code}</option>
                            ))}
                        </select>
                    </div>
                    <div className="sm:col-span-1 flex items-center justify-center">
                        <button onClick={handleSwapCurrencies} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700" aria-label="Swap currencies">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                        </button>
                    </div>
                </div>

                <div>
                    <label htmlFor="toCurrency" className="block text-sm font-medium text-gray-700 dark:text-slate-300">To</label>
                    <select
                        id="toCurrency"
                        value={toCurrency}
                        onChange={(e) => setToCurrency(e.target.value as CurrencyCode)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] sm:text-lg rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                    >
                        {Object.entries(currencies).map(([code, name]) => (
                            <option key={code} value={code}>{code}</option>
                        ))}
                    </select>
                </div>

                {isLoading && (
                    <div className="flex items-center justify-center p-4">
                        <SpinnerIcon className="w-6 h-6 animate-spin text-[var(--theme-primary)]" />
                        <p className="ml-2 text-slate-500 dark:text-slate-400">Fetching latest rate...</p>
                    </div>
                )}
                
                {error && <p className="text-red-600 dark:text-red-400 text-center">{error}</p>}
                
                {!isLoading && !error && exchangeRate !== null && (
                    <div className="p-6 bg-[var(--theme-primary-light)] rounded-lg text-center dark:bg-slate-900/50 dark:border-sky-900 border border-sky-200">
                        <p className="text-sm text-[var(--theme-primary)] dark:text-sky-300">{amount} {currencies[fromCurrency]} equals</p>
                        <p className="text-4xl font-bold text-[var(--theme-primary)] dark:text-[var(--theme-text-gold)]">
                            {convertedAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} {toCurrency}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                            1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency} (Live Rate)
                        </p>
                    </div>
                )}
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 space-y-6 max-w-4xl mx-auto">
                <section>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">About the Currency Converter</h2>
                <p className="mt-2 text-slate-600 dark:text-slate-300">Our Currency Converter is a powerful tool for anyone dealing with international finance, travel, or e-commerce. It leverages AI-powered real-time search to fetch the most current exchange rates between major world currencies, ensuring your conversions are accurate and up-to-date. Whether you're planning a trip, making an online purchase from another country, or managing investments, this tool provides the clarity you need.</p>
                </section>

                <section>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">How to Use This Tool</h2>
                <ol className="list-decimal list-inside mt-2 space-y-2 text-slate-600 dark:text-slate-300">
                    <li><strong>Enter Amount:</strong> Input the amount of money you want to convert.</li>
                    <li><strong>Select Currencies:</strong> Choose the currency you are converting 'From' and the currency you are converting 'To' using the dropdown menus.</li>
                    <li><strong>View Conversion:</strong> The tool will automatically fetch the live exchange rate and display the converted amount instantly.</li>
                    <li><strong>Swap (Optional):</strong> Click the swap icon between the currency selectors to quickly reverse the conversion.</li>
                </ol>
                </section>
                
                <section>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Frequently Asked Questions (FAQs)</h2>
                    <div className="mt-2 space-y-3 text-slate-600 dark:text-slate-300">
                    <div>
                        <h3 className="font-semibold">How often are the exchange rates updated?</h3>
                        <p>The exchange rates are fetched in real-time using AI-powered search whenever you select a new currency pair, ensuring you get the most current data available.</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">What does "exchange rate" mean?</h3>
                        <p>The exchange rate is the value of one currency for the purpose of conversion to another. For example, if the USD to INR rate is 83.5, it means one US Dollar is worth 83.5 Indian Rupees.</p>
                    </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default CurrencyConverter;