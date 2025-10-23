import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FinanceIcon, SearchIcon, DownloadIcon, TrashIcon } from '../components/icons';

// --- TYPE DEFINITIONS ---
interface Calculator {
  id: string;
  name: string;
  category: string;
  component: React.FC;
  description: string;
}

// --- ICON COMPONENTS ---
const MenuIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);
const XIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);


// --- SHARED HELPER COMPONENTS ---
const CalculatorWrapper: React.FC<{ title: string; description: string; children: React.ReactNode }> = ({ title, description, children }) => (
    <div className="space-y-6">
        <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{title}</h2>
            <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        {children}
    </div>
);

const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string; unit?: string; }> = ({ label, unit, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">{label}</label>
        <div className="mt-1 relative rounded-md shadow-sm">
            <input
                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400"
                {...props}
            />
            {unit && <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><span className="text-gray-500 sm:text-sm dark:text-slate-400">{unit}</span></div>}
        </div>
    </div>
);

const ResultCard: React.FC<{ title: string; value: string; description?: string; isPrimary?: boolean }> = ({ title, value, description, isPrimary }) => (
    <div className={`p-4 rounded-lg border ${isPrimary ? 'bg-[var(--theme-primary-light)] border-sky-200 dark:bg-slate-800 dark:border-sky-900' : 'bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700'}`}>
        <p className={`text-sm ${isPrimary ? 'text-[var(--theme-primary)] dark:text-sky-300' : 'text-slate-500 dark:text-slate-400'}`}>{title}</p>
        <p className={`text-2xl font-bold ${isPrimary ? 'text-[var(--theme-primary)] dark:text-[var(--theme-text-gold)]' : 'text-slate-800 dark:text-slate-100'}`}>{value}</p>
        {description && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{description}</p>}
    </div>
);

const LineChart: React.FC<{ data: { label: string, value: number }[] }> = ({ data }) => {
    if (data.length < 2) return <div className="flex items-center justify-center h-full text-sm text-slate-400">Not enough data to draw a chart.</div>;
    const width = 500, height = 200, padding = 30;
    const values = data.map(d => d.value);
    const minVal = 0; // Start y-axis at 0
    const maxVal = Math.max(...values);
    const range = maxVal - minVal || 1;

    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * (width - 2 * padding) + padding;
        const y = height - padding - ((d.value - minVal) / range) * (height - 2 * padding);
        return `${x},${y}`;
    }).join(' ');

    return <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto"><polyline fill="none" stroke="var(--theme-primary)" strokeWidth="2" points={points} /></svg>;
};

const Result: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="mt-2 p-3 bg-slate-100 dark:bg-slate-700/50 rounded-md">
        <span className="font-semibold text-slate-600 dark:text-slate-300">{label}: </span>
        <span className="font-mono text-lg text-[var(--theme-primary)] dark:text-sky-300">
            {value}
        </span>
    </div>
);


// --- CALCULATOR COMPONENTS ---

const SIPCalculator: React.FC = () => {
    const [monthlyInvestment, setMonthlyInvestment] = useState('10000');
    const [annualReturn, setAnnualReturn] = useState('12');
    const [duration, setDuration] = useState('10');
    const [stepUp, setStepUp] = useState('0');

    const { totalInvested, totalValue, totalGains, growth } = useMemo(() => {
        const P = parseFloat(monthlyInvestment);
        const r = parseFloat(annualReturn) / 100 / 12;
        const n = parseFloat(duration) * 12;
        const yearlyStepUp = parseFloat(stepUp) / 100;

        if (isNaN(P) || isNaN(r) || isNaN(n)) return { totalInvested: 0, totalValue: 0, totalGains: 0, growth: [] };

        let totalInvested = 0;
        let totalValue = 0;
        let currentSip = P;
        const growthData: { label: string, value: number, year: number, invested: number }[] = [];

        for (let i = 1; i <= n; i++) {
            if (i > 1 && (i - 1) % 12 === 0) {
                currentSip *= (1 + yearlyStepUp);
            }
            totalInvested += currentSip;
            totalValue = (totalValue + currentSip) * (1 + r);
             if (i % 12 === 0) {
                growthData.push({ label: `Year ${i/12}`, value: totalValue, year: i/12, invested: totalInvested });
            }
        }
        
        return { totalInvested, totalValue, totalGains: totalValue - totalInvested, growth: growthData };
    }, [monthlyInvestment, annualReturn, duration, stepUp]);

    const handlePdfExport = () => {
        const doc = new jsPDF();
        doc.text("SIP Calculation Report", 14, 15);
        autoTable(doc, {
            startY: 20,
            body: [
                ['Monthly Investment', `₹ ${monthlyInvestment}`], ['Step-up SIP', `${stepUp} %`],
                ['Expected Annual Return', `${annualReturn} %`], ['Investment Duration', `${duration} Years`],
                ['---','---'],
                ['Total Invested', `₹ ${totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`],
                ['Estimated Returns', `₹ ${totalGains.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`],
                ['Future Value', `₹ ${totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`],
            ],
            theme: 'plain'
        });
        autoTable(doc, {
            head: [['Year', 'Invested Amount', 'Future Value']],
            body: growth.map(g => [g.year, `₹ ${g.invested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, `₹ ${g.value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`]),
        });
        doc.save('sip-report.pdf');
    };

    return (
        <CalculatorWrapper title="SIP Calculator" description="Calculate the future value of your Systematic Investment Plan.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4 dark:bg-slate-800 dark:border-slate-700">
                    <InputField label="Monthly SIP Amount" value={monthlyInvestment} onChange={e => setMonthlyInvestment(e.target.value)} type="number" unit="₹" />
                    <InputField label="Expected Annual Return" value={annualReturn} onChange={e => setAnnualReturn(e.target.value)} type="number" unit="%" />
                    <InputField label="Investment Duration" value={duration} onChange={e => setDuration(e.target.value)} type="number" unit="Years" />
                    <InputField label="Yearly Step-up (Optional)" value={stepUp} onChange={e => setStepUp(e.target.value)} type="number" unit="%" />
                </div>
                <div className="space-y-4">
                    <ResultCard isPrimary title="Future Value" value={`₹ ${totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} />
                    <div className="grid grid-cols-2 gap-4">
                        <ResultCard title="Total Invested" value={`₹ ${totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} />
                        <ResultCard title="Total Gains" value={`₹ ${totalGains.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} />
                    </div>
                     <button onClick={handlePdfExport} className="w-full text-sm font-semibold flex items-center justify-center gap-2 p-2 bg-slate-100 dark:bg-slate-700 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600">
                        <DownloadIcon className="w-4 h-4" /> Download Report
                    </button>
                </div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                <h3 className="font-semibold mb-2">Yearly Breakup</h3>
                <div className="max-h-60 overflow-y-auto">
                    <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-slate-50 dark:bg-slate-700"><tr><th className="p-2 text-left">Year</th><th className="p-2 text-right">Invested</th><th className="p-2 text-right">Value</th></tr></thead>
                        <tbody>{growth.map(g => <tr key={g.year} className="border-b dark:border-slate-700"><td className="p-2">{g.year}</td><td className="p-2 text-right">₹ {g.invested.toLocaleString('en-IN', {maximumFractionDigits: 0})}</td><td className="p-2 text-right">₹ {g.value.toLocaleString('en-IN', {maximumFractionDigits: 0})}</td></tr>)}</tbody>
                    </table>
                </div>
            </div>
        </CalculatorWrapper>
    );
};

const LumpsumCalculator: React.FC = () => {
    const [principal, setPrincipal] = useState('100000');
    const [rate, setRate] = useState('12');
    const [duration, setDuration] = useState('10');

    const { finalValue, totalGain, growth } = useMemo(() => {
        const P = parseFloat(principal);
        const r = parseFloat(rate) / 100;
        const t = parseFloat(duration);
        if (isNaN(P) || isNaN(r) || isNaN(t)) return { finalValue: 0, totalGain: 0, growth: [] };
        
        const growthData = [];
        for (let i = 1; i <= t; i++) {
            const value = P * Math.pow((1 + r), i);
            growthData.push({ label: `Year ${i}`, value: value });
        }
        const finalVal = growthData.length > 0 ? growthData[growthData.length - 1].value : P;
        
        return { finalValue: finalVal, totalGain: finalVal - P, growth: growthData };
    }, [principal, rate, duration]);

    return (
        <CalculatorWrapper title="Lumpsum Calculator" description="Calculate the future value of a one-time investment.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4 dark:bg-slate-800 dark:border-slate-700">
                    <InputField label="Lump Sum Amount" value={principal} onChange={e => setPrincipal(e.target.value)} type="number" unit="₹" />
                    <InputField label="Expected Annual Return" value={rate} onChange={e => setRate(e.target.value)} type="number" unit="%" />
                    <InputField label="Investment Duration" value={duration} onChange={e => setDuration(e.target.value)} type="number" unit="Years" />
                </div>
                <div className="space-y-4">
                    <ResultCard isPrimary title="Future Value" value={`₹ ${finalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} />
                    <ResultCard title="Total Gain" value={`₹ ${totalGain.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} />
                </div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                <h3 className="font-semibold mb-2">Investment Growth</h3>
                <LineChart data={growth} />
            </div>
        </CalculatorWrapper>
    );
};

const EMICalculator: React.FC = () => {
    const [amount, setAmount] = useState('500000');
    const [rate, setRate] = useState('8.5');
    const [tenure, setTenure] = useState('5');

    const { emi, totalInterest, totalPayment, schedule } = useMemo(() => {
        const P = parseFloat(amount);
        const r = parseFloat(rate) / 100 / 12;
        const n = parseFloat(tenure) * 12;

        if (isNaN(P) || isNaN(r) || isNaN(n) || P <= 0 || r < 0 || n <= 0) return { emi: 0, totalInterest: 0, totalPayment: 0, schedule: [] };

        const calculatedEmi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        const calculatedTotalPayment = calculatedEmi * n;
        const calculatedTotalInterest = calculatedTotalPayment - P;
        
        const amortizationSchedule = [];
        let balance = P;
        for (let i = 1; i <= n; i++) {
            const interest = balance * r;
            const principal = calculatedEmi - interest;
            balance -= principal;
            amortizationSchedule.push({ month: i, principal, interest, balance: balance > 0 ? balance : 0 });
        }

        return { emi: calculatedEmi, totalInterest: calculatedTotalInterest, totalPayment: calculatedTotalPayment, schedule: amortizationSchedule };
    }, [amount, rate, tenure]);
    
    const handlePdfExport = () => {
        const doc = new jsPDF();
        doc.text("EMI Calculation Report", 14, 15);
         autoTable(doc, {
            startY: 20,
            head: [['#', 'Principal', 'Interest', 'Balance']],
            body: schedule.map(row => [row.month, `₹ ${row.principal.toFixed(2)}`, `₹ ${row.interest.toFixed(2)}`, `₹ ${row.balance.toFixed(2)}`]),
        });
        doc.save('emi-schedule.pdf');
    }

    return (
        <CalculatorWrapper title="EMI Calculator" description="Calculate your Equated Monthly Installment for any loan.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4 dark:bg-slate-800 dark:border-slate-700">
                    <InputField label="Loan Amount" value={amount} onChange={e => setAmount(e.target.value)} type="number" unit="₹" />
                    <InputField label="Annual Interest Rate" value={rate} onChange={e => setRate(e.target.value)} type="number" unit="%" />
                    <InputField label="Loan Tenure" value={tenure} onChange={e => setTenure(e.target.value)} type="number" unit="Years" />
                </div>
                 <div className="space-y-4">
                    <ResultCard isPrimary title="Monthly EMI" value={`₹ ${emi.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`} />
                    <div className="grid grid-cols-2 gap-4">
                        <ResultCard title="Total Interest" value={`₹ ${totalInterest.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} />
                        <ResultCard title="Total Payment" value={`₹ ${totalPayment.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} />
                    </div>
                </div>
            </div>
             <div className="bg-white p-6 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                <div className="flex justify-between items-center mb-2"><h3 className="font-semibold">Amortization Schedule</h3><button onClick={handlePdfExport} className="text-sm font-semibold flex items-center gap-2 p-2 bg-slate-100 dark:bg-slate-700 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600"><DownloadIcon className="w-4 h-4" /> Export</button></div>
                <div className="max-h-80 overflow-y-auto"><table className="w-full text-sm"><thead className="sticky top-0 bg-slate-50 dark:bg-slate-700"><tr><th className="p-2 text-left">Month</th><th className="p-2 text-right">Principal</th><th className="p-2 text-right">Interest</th><th className="p-2 text-right">Balance</th></tr></thead><tbody>{schedule.map(row => <tr key={row.month} className="border-b dark:border-slate-700"><td className="p-2">{row.month}</td><td className="p-2 text-right">₹ {row.principal.toFixed(2)}</td><td className="p-2 text-right">₹ {row.interest.toFixed(2)}</td><td className="p-2 text-right">₹ {row.balance.toFixed(2)}</td></tr>)}</tbody></table></div>
            </div>
        </CalculatorWrapper>
    );
};

const SWPCalculator: React.FC = () => {
    const [corpus, setCorpus] = useState('1000000');
    const [withdrawal, setWithdrawal] = useState('8000');
    const [rate, setRate] = useState('8');
    const [duration, setDuration] = useState('15');

    const { schedule, sustainability } = useMemo(() => {
        const p = parseFloat(corpus);
        const w = parseFloat(withdrawal);
        const r = parseFloat(rate) / 100 / 12; // monthly rate
        const t = parseFloat(duration) * 12; // months
        if(isNaN(p) || isNaN(w) || isNaN(r) || isNaN(t)) return { schedule: [], sustainability: 'Invalid Input' };

        const newSchedule = [];
        let balance = p;
        let sustainable = true;
        for(let i=1; i<=t; i++){
            const opening = balance;
            const growth = balance * r;
            balance += growth;
            
            if(balance < w) {
                sustainable = false;
                newSchedule.push({ year: Math.ceil(i/12), opening, growth, withdrawal: balance, closing: 0 });
                break;
            }
            balance -= w;
            
            if(i % 12 === 0) {
                 newSchedule.push({ year: i/12, opening: newSchedule[newSchedule.length - 1]?.closing ?? p, growth: balance + (w*12) - (newSchedule[newSchedule.length - 1]?.closing ?? p), withdrawal: w*12, closing: balance });
            }
        }
        
        const finalBalance = balance;

        return {
            schedule: newSchedule,
            sustainability: sustainable ? `Corpus will last for ${duration} years with a final balance of ₹ ${finalBalance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}.` : `Corpus will run out in Year ${Math.ceil(newSchedule.length/12)}.`
        };
    }, [corpus, withdrawal, rate, duration]);

    return (
        <CalculatorWrapper title="SWP Calculator" description="Plan your Systematic Withdrawal from an investment.">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4 dark:bg-slate-800 dark:border-slate-700">
                    <InputField label="Starting Corpus" value={corpus} onChange={e => setCorpus(e.target.value)} type="number" unit="₹" />
                    <InputField label="Monthly Withdrawal" value={withdrawal} onChange={e => setWithdrawal(e.target.value)} type="number" unit="₹" />
                    <InputField label="Expected Annual Return" value={rate} onChange={e => setRate(e.target.value)} type="number" unit="%" />
                    <InputField label="Duration" value={duration} onChange={e => setDuration(e.target.value)} type="number" unit="Years" />
                </div>
                 <div className="space-y-4">
                    <ResultCard isPrimary title="Result" value={sustainability} />
                </div>
            </div>
             <div className="bg-white p-6 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                <h3 className="font-semibold">Yearly Withdrawal Schedule</h3>
                <div className="max-h-80 overflow-y-auto mt-2"><table className="w-full text-sm text-center">
                    <thead className="sticky top-0 bg-slate-50 dark:bg-slate-700"><tr><th>Year</th><th>Opening Balance</th><th>Investment Growth</th><th>Total Withdrawal</th><th>Closing Balance</th></tr></thead>
                    <tbody>{schedule.map(s => <tr key={s.year} className="border-b dark:border-slate-700"><td>{s.year}</td><td>₹ {s.opening.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td><td>₹ {s.growth.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td><td>₹ {s.withdrawal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td><td>₹ {s.closing.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td></tr>)}</tbody>
                </table></div>
            </div>
        </CalculatorWrapper>
    );
};
const MFReturnsCalculator: React.FC = () => {
    const [invested, setInvested] = useState('100000');
    const [finalValue, setFinalValue] = useState('150000');
    const [duration, setDuration] = useState('3');

    const { absoluteReturn, cagr } = useMemo(() => {
        const i = parseFloat(invested);
        const f = parseFloat(finalValue);
        const t = parseFloat(duration);
        if(isNaN(i) || isNaN(f) || isNaN(t) || i <= 0 || t <= 0) return { absoluteReturn: 0, cagr: 0 };
        const abs = ((f - i) / i) * 100;
        const cagrVal = (Math.pow(f / i, 1 / t) - 1) * 100;
        return { absoluteReturn: abs, cagr: cagrVal };
    }, [invested, finalValue, duration]);

    return (
        <CalculatorWrapper title="MF Returns Calculator" description="Calculate absolute return and CAGR for your investments.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border space-y-4 dark:bg-slate-800 dark:border-slate-700">
                    <InputField label="Total Invested Amount" value={invested} onChange={e => setInvested(e.target.value)} type="number" unit="₹" />
                    <InputField label="Final Market Value" value={finalValue} onChange={e => setFinalValue(e.target.value)} type="number" unit="₹" />
                    <InputField label="Investment Duration" value={duration} onChange={e => setDuration(e.target.value)} type="number" unit="Years" />
                </div>
                <div className="space-y-4">
                    <ResultCard isPrimary title="CAGR" value={`${cagr.toFixed(2)} %`} />
                    <ResultCard title="Absolute Return" value={`${absoluteReturn.toFixed(2)} %`} />
                </div>
            </div>
        </CalculatorWrapper>
    );
};
const APYCalculator: React.FC = () => {
    const [rate, setRate] = useState('6');
    const [periods, setPeriods] = useState('12');

    const apy = useMemo(() => {
        const r = parseFloat(rate) / 100;
        const n = parseFloat(periods);
        if(isNaN(r) || isNaN(n) || n <= 0) return 0;
        return (Math.pow(1 + r/n, n) - 1) * 100;
    }, [rate, periods]);
    return (<CalculatorWrapper title="APY Calculator" description="Calculate Annual Percentage Yield from nominal rate."><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="bg-white p-6 rounded-lg border space-y-4 dark:bg-slate-800 dark:border-slate-700"><InputField label="Nominal Interest Rate" value={rate} onChange={e => setRate(e.target.value)} type="number" unit="%" /><InputField label="Compounding Periods per Year" value={periods} onChange={e => setPeriods(e.target.value)} type="number" placeholder="e.g., 12 for monthly" /></div><div className="space-y-4"><ResultCard isPrimary title="Effective APY" value={`${apy.toFixed(2)} %`} /></div></div></CalculatorWrapper>);
};
const CAGRCalculator: React.FC = () => {
    const [startValue, setStartValue] = useState('10000');
    const [endValue, setEndValue] = useState('25000');
    const [years, setYears] = useState('5');
    const cagr = useMemo(() => {
        const sv = parseFloat(startValue);
        const ev = parseFloat(endValue);
        const t = parseFloat(years);
        if(isNaN(sv) || isNaN(ev) || isNaN(t) || sv <= 0 || t <= 0) return 0;
        return (Math.pow(ev / sv, 1 / t) - 1) * 100;
    }, [startValue, endValue, years]);
    return (<CalculatorWrapper title="CAGR Calculator" description="Calculate Compound Annual Growth Rate."><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="bg-white p-6 rounded-lg border space-y-4 dark:bg-slate-800 dark:border-slate-700"><InputField label="Start Value" value={startValue} onChange={e => setStartValue(e.target.value)} type="number" unit="₹" /><InputField label="End Value" value={endValue} onChange={e => setEndValue(e.target.value)} type="number" unit="₹" /><InputField label="Duration" value={years} onChange={e => setYears(e.target.value)} type="number" unit="Years" /></div><div className="space-y-4"><ResultCard isPrimary title="CAGR" value={`${cagr.toFixed(2)} %`} /></div></div></CalculatorWrapper>);
};
const XIRRCalculator: React.FC = () => {
    const [cashFlows, setCashFlows] = useState([
        { id: 1, date: new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0], value: '-100000' },
        { id: 2, date: new Date().toISOString().split('T')[0], value: '125000' }
    ]);
    const [nextId, setNextId] = useState(3);
    const [xirrResult, setXirrResult] = useState<number | null>(null);
    const [error, setError] = useState('');

    const calculateXirr = useCallback(() => {
        setError('');
        const transactions = cashFlows
            .map(cf => ({
                amount: parseFloat(cf.value),
                date: new Date(cf.date)
            }))
            .filter(cf => !isNaN(cf.amount) && cf.date.toString() !== 'Invalid Date');

        if (transactions.length < 2 || !transactions.some(t => t.amount < 0) || !transactions.some(t => t.amount > 0)) {
            setXirrResult(null);
            setError('Requires at least one positive and one negative cash flow.');
            return;
        }

        transactions.sort((a, b) => a.date.getTime() - b.date.getTime());

        const npv = (rate: number) => {
            const firstDate = transactions[0].date;
            return transactions.reduce((sum, { amount, date }) => {
                const daysDiff = (date.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24);
                return sum + amount / Math.pow(1 + rate, daysDiff / 365.0);
            }, 0);
        };

        let guess = 0.1;
        const maxIterations = 100;
        const tolerance = 1.0e-7;

        for (let i = 0; i < maxIterations; i++) {
            const npvAtGuess = npv(guess);
            if (Math.abs(npvAtGuess) < tolerance) {
                setXirrResult(guess * 100);
                return;
            }

            const derivative = transactions.reduce((sum, { amount, date }) => {
                const firstDate = transactions[0].date;
                const daysDiff = (date.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24);
                if (daysDiff > 0 && (1 + guess) !== 0) {
                     return sum - (amount * daysDiff / 365.0) / Math.pow(1 + guess, (daysDiff / 365.0) + 1);
                }
                return sum;
            }, 0);
            
            if(Math.abs(derivative) < 1e-10) break;

            guess = guess - npvAtGuess / derivative;
        }

        setError('Could not calculate XIRR. Try different values.');
        setXirrResult(null);

    }, [cashFlows]);
    
    useEffect(() => {
        calculateXirr();
    }, [calculateXirr]);

    const handleFlowChange = (id: number, field: 'date' | 'value', value: string) => {
        setCashFlows(cashFlows.map(cf => cf.id === id ? { ...cf, [field]: value } : cf));
    };

    const addFlow = () => {
        setCashFlows([...cashFlows, { id: nextId, date: new Date().toISOString().split('T')[0], value: '' }]);
        setNextId(nextId + 1);
    };

    const removeFlow = (id: number) => {
        if (cashFlows.length > 2) {
            setCashFlows(cashFlows.filter(cf => cf.id !== id));
        } else {
            setError('You need at least two cash flows for XIRR calculation.');
        }
    };

    return (
        <CalculatorWrapper title="XIRR Calculator" description="Calculate the Extended Internal Rate of Return for a series of cash flows at irregular intervals.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4 dark:bg-slate-800 dark:border-slate-700">
                    <h3 className="font-semibold">Cash Flows</h3>
                    <p className="text-xs text-slate-500">Enter your initial investment as a negative value, followed by subsequent cash flows (inflows as positive, outflows as negative).</p>
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                        {cashFlows.map((cf) => (
                            <div key={cf.id} className="flex items-center gap-2">
                                <InputField label="" name={`date-${cf.id}`} type="date" value={cf.date} onChange={e => handleFlowChange(cf.id, 'date', e.target.value)} />
                                <InputField label="" name={`value-${cf.id}`} type="number" value={cf.value} onChange={e => handleFlowChange(cf.id, 'value', e.target.value)} placeholder="Amount (₹)" />
                                <button onClick={() => removeFlow(cf.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full dark:hover:bg-red-900/50 mt-4" aria-label="Delete cash flow">
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <button onClick={addFlow} className="w-full py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-colors dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200">
                        Add Cash Flow
                    </button>
                </div>
                <div className="space-y-4">
                    <ResultCard
                        isPrimary
                        title="XIRR (Annualized Return)"
                        value={xirrResult !== null ? `${xirrResult.toFixed(2)} %` : 'N/A'}
                        description="This is the annualized rate of return for your investments."
                    />
                    {error && <div className="p-4 bg-red-50 text-red-700 rounded-lg dark:bg-red-900/50 dark:text-red-300">{error}</div>}
                </div>
            </div>
        </CalculatorWrapper>
    );
};
const StockAverageCalculator: React.FC = () => {
    const [trades, setTrades] = useState([{qty: '', price: ''}, {qty: '', price: ''}]);
    const addTrade = () => setTrades([...trades, {qty: '', price: ''}]);
    const { avgPrice, totalShares, totalCost } = useMemo(() => {
        let totalQty = 0;
        let cost = 0;
        trades.forEach(t => {
            const qty = parseFloat(t.qty);
            const price = parseFloat(t.price);
            if(!isNaN(qty) && !isNaN(price) && qty > 0 && price > 0) {
                totalQty += qty;
                cost += qty * price;
            }
        });
        return { avgPrice: totalQty > 0 ? cost/totalQty : 0, totalShares: totalQty, totalCost: cost };
    }, [trades]);

    return (
        <CalculatorWrapper title="Stock Average Calculator" description="Calculate the average price of your stock holdings.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border space-y-4 dark:bg-slate-800 dark:border-slate-700">
                    {trades.map((t, i) => (
                        <div key={i} className="flex gap-2"><InputField label={`Trade ${i+1} Qty`} value={t.qty} onChange={e => { const newTrades = [...trades]; newTrades[i].qty = e.target.value; setTrades(newTrades); }} type="number" /><InputField label="Price" value={t.price} onChange={e => { const newTrades = [...trades]; newTrades[i].price = e.target.value; setTrades(newTrades); }} type="number" unit="₹" /></div>
                    ))}
                    <button onClick={addTrade} className="w-full p-2 bg-slate-100 rounded">Add Trade</button>
                </div>
                <div className="space-y-4">
                     <ResultCard isPrimary title="Average Price" value={`₹ ${avgPrice.toFixed(2)}`} />
                     <div className="grid grid-cols-2 gap-4">
                         <ResultCard title="Total Shares" value={totalShares.toString()} />
                         <ResultCard title="Total Cost" value={`₹ ${totalCost.toFixed(2)}`} />
                    </div>
                </div>
            </div>
        </CalculatorWrapper>
    );
};
const PPFCalculator: React.FC = () => {
    const [yearlyInvestment, setYearlyInvestment] = useState('100000');
    const [rate, setRate] = useState('7.1');
    const { maturityValue, totalInvestment, totalInterest, schedule } = useMemo(() => {
        const P = parseFloat(yearlyInvestment);
        const r = parseFloat(rate) / 100;
        if (isNaN(P) || isNaN(r) || P > 150000 || P <= 0) return { maturityValue: 0, totalInvestment: 0, totalInterest: 0, schedule: [] };

        let balance = 0;
        const newSchedule = [];
        for (let year = 1; year <= 15; year++) {
            const openingBalance = balance;
            balance += P;
            const interest = balance * r;
            balance += interest;
            newSchedule.push({ year, opening: openingBalance, investment: P, interest, closing: balance });
        }
        const totalInv = P * 15;
        return { maturityValue: balance, totalInvestment: totalInv, totalInterest: balance - totalInv, schedule: newSchedule };
    }, [yearlyInvestment, rate]);

    return (
        <CalculatorWrapper title="PPF Calculator" description="Calculate your Public Provident Fund maturity amount.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border space-y-4 dark:bg-slate-800 dark:border-slate-700">
                    <InputField label="Yearly Investment (Max 1,50,000)" value={yearlyInvestment} onChange={e => setYearlyInvestment(e.target.value)} type="number" unit="₹" />
                    <InputField label="Interest Rate" value={rate} onChange={e => setRate(e.target.value)} type="number" unit="%" />
                    <p className="text-sm text-slate-500">Duration is fixed at 15 years.</p>
                </div>
                <div className="space-y-4">
                    <ResultCard isPrimary title="Maturity Value" value={`₹ ${maturityValue.toLocaleString('en-IN', {maximumFractionDigits: 0})}`} />
                    <div className="grid grid-cols-2 gap-4">
                        <ResultCard title="Total Investment" value={`₹ ${totalInvestment.toLocaleString('en-IN', {maximumFractionDigits: 0})}`} />
                        <ResultCard title="Total Interest" value={`₹ ${totalInterest.toLocaleString('en-IN', {maximumFractionDigits: 0})}`} />
                    </div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-lg border dark:bg-slate-800 dark:border-slate-700">
                <h3 className="font-semibold">Yearly Schedule</h3>
                 <div className="max-h-80 overflow-y-auto mt-2"><table className="w-full text-sm text-center">
                    <thead className="sticky top-0 bg-slate-50 dark:bg-slate-700"><tr><th>Year</th><th>Opening</th><th>Investment</th><th>Interest</th><th>Closing</th></tr></thead>
                    <tbody>{schedule.map(s => <tr key={s.year} className="border-b dark:border-slate-700"><td>{s.year}</td><td>{s.opening.toLocaleString('en-IN', {maximumFractionDigits:0})}</td><td>{s.investment.toLocaleString('en-IN', {maximumFractionDigits:0})}</td><td>{s.interest.toLocaleString('en-IN', {maximumFractionDigits:0})}</td><td>{s.closing.toLocaleString('en-IN', {maximumFractionDigits:0})}</td></tr>)}</tbody>
                </table></div>
            </div>
        </CalculatorWrapper>
    );
};
const EPFCalculator: React.FC = () => {
    const [basicDA, setBasicDA] = useState('25000');
    const [age, setAge] = useState('30');
    const [currentBalance, setCurrentBalance] = useState('500000');
    const [rate, setRate] = useState('8.1');

    const { maturity, totalInterest } = useMemo(() => {
        const monthlyBasic = parseFloat(basicDA);
        const currentAge = parseInt(age);
        const startBalance = parseFloat(currentBalance);
        const intRate = parseFloat(rate) / 100;
        const retirementAge = 58;

        if(isNaN(monthlyBasic) || isNaN(currentAge) || isNaN(startBalance) || isNaN(intRate) || currentAge >= retirementAge) return { maturity: 0, totalInterest: 0 };
        
        let balance = startBalance;
        let employeeContribution = monthlyBasic * 0.12 * 12; // Yearly
        let employerContribution = monthlyBasic * 0.0367 * 12; // Yearly

        for (let yr = currentAge; yr < retirementAge; yr++) {
            const totalContribution = employeeContribution + employerContribution;
            const interest = (balance + totalContribution) * intRate;
            balance += totalContribution + interest;
        }
        
        return { maturity: balance, totalInterest: balance - startBalance - (employeeContribution + employerContribution) * (retirementAge - currentAge) };
    }, [basicDA, age, currentBalance, rate]);

    return (
        <CalculatorWrapper title="EPF Calculator" description="Project your Employees' Provident Fund corpus at retirement (age 58).">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border space-y-4 dark:bg-slate-800 dark:border-slate-700">
                    <InputField label="Monthly Basic + DA" value={basicDA} onChange={e => setBasicDA(e.target.value)} unit="₹" />
                    <InputField label="Current Age" value={age} onChange={e => setAge(e.target.value)} unit="Years" />
                    <InputField label="Current EPF Balance" value={currentBalance} onChange={e => setCurrentBalance(e.target.value)} unit="₹" />
                    <InputField label="EPF Interest Rate" value={rate} onChange={e => setRate(e.target.value)} unit="%" />
                </div>
                <div className="space-y-4">
                    <ResultCard isPrimary title="Retirement Corpus (at 58)" value={`₹ ${maturity.toLocaleString('en-IN', {maximumFractionDigits: 0})}`} />
                    <ResultCard title="Total Interest Earned" value={`₹ ${totalInterest.toLocaleString('en-IN', {maximumFractionDigits: 0})}`} />
                </div>
            </div>
        </CalculatorWrapper>
    );
};
const SSYCalculator: React.FC = () => {
     const [yearlyInvestment, setYearlyInvestment] = useState('100000');
     const [rate, setRate] = useState('8.2');
     const { maturity, totalInvestment, totalInterest } = useMemo(() => {
        const P = parseFloat(yearlyInvestment);
        const r = parseFloat(rate) / 100;
        if(isNaN(P) || isNaN(r)) return { maturity:0, totalInvestment:0, totalInterest:0 };

        let balance = 0;
        for(let i=1; i<=21; i++) {
            if (i <= 15) {
                balance += P;
            }
            balance = balance * (1+r);
        }
        const totalInv = P * 15;
        return { maturity: balance, totalInvestment: totalInv, totalInterest: balance - totalInv };
     }, [yearlyInvestment, rate]);
     return (<CalculatorWrapper title="SSY Calculator" description="Sukanya Samriddhi Yojana. Investment for 15 years, maturity in 21 years."><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="bg-white p-6 rounded-lg border space-y-4 dark:bg-slate-800 dark:border-slate-700"><InputField label="Yearly Investment" value={yearlyInvestment} onChange={e => setYearlyInvestment(e.target.value)} unit="₹" /><InputField label="Interest Rate" value={rate} onChange={e => setRate(e.target.value)} unit="%" /></div><div className="space-y-4"><ResultCard isPrimary title="Maturity Value" value={`₹ ${maturity.toLocaleString('en-IN', {maximumFractionDigits: 0})}`} /><div className="grid grid-cols-2 gap-4"><ResultCard title="Total Investment" value={`₹ ${totalInvestment.toLocaleString('en-IN', {maximumFractionDigits: 0})}`} /><ResultCard title="Total Interest" value={`₹ ${totalInterest.toLocaleString('en-IN', {maximumFractionDigits: 0})}`} /></div></div></div></CalculatorWrapper>);
};
const NSCCalculator: React.FC = () => {
    const [amount, setAmount] = useState('10000');
    const [rate, setRate] = useState('7.7');
    const { maturity, interest } = useMemo(() => {
        const p = parseFloat(amount); const r = parseFloat(rate)/100;
        if(isNaN(p) || isNaN(r)) return {maturity:0, interest: 0};
        const mat = p * Math.pow(1+r, 5);
        return { maturity: mat, interest: mat-p };
    }, [amount, rate]);
    return (<CalculatorWrapper title="NSC Calculator" description="National Savings Certificate Calculator (5-year tenure)."><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="bg-white p-6 rounded-lg border space-y-4 dark:bg-slate-800 dark:border-slate-700"><InputField label="Investment Amount" value={amount} onChange={e => setAmount(e.target.value)} unit="₹" /><InputField label="Interest Rate" value={rate} onChange={e => setRate(e.target.value)} unit="%" /></div><div className="space-y-4"><ResultCard isPrimary title="Maturity Value" value={`₹ ${maturity.toFixed(2)}`} /><ResultCard title="Total Interest" value={`₹ ${interest.toFixed(2)}`} /></div></div></CalculatorWrapper>);
};
const PostOfficeMISCalculator: React.FC = () => {
    const [amount, setAmount] = useState('450000');
    const [rate, setRate] = useState('7.4');
    const monthlyInterest = useMemo(() => {
        const p = parseFloat(amount); const r = parseFloat(rate)/100;
        if(isNaN(p) || isNaN(r)) return 0;
        return (p*r)/12;
    }, [amount, rate]);
     return (<CalculatorWrapper title="Post Office MIS Calculator" description="Post Office Monthly Income Scheme."><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="bg-white p-6 rounded-lg border space-y-4 dark:bg-slate-800 dark:border-slate-700"><InputField label="Investment Amount" value={amount} onChange={e => setAmount(e.target.value)} unit="₹" /><InputField label="Annual Interest Rate" value={rate} onChange={e => setRate(e.target.value)} unit="%" /></div><div className="space-y-4"><ResultCard isPrimary title="Monthly Interest" value={`₹ ${monthlyInterest.toFixed(2)}`} /></div></div></CalculatorWrapper>);
};
const SCSSCalculator: React.FC = () => {
     const [amount, setAmount] = useState('1500000');
    const [rate, setRate] = useState('8.2');
    const quarterlyInterest = useMemo(() => {
        const p = parseFloat(amount); const r = parseFloat(rate)/100;
        if(isNaN(p) || isNaN(r)) return 0;
        return (p*r)/4;
    }, [amount, rate]);
     return (<CalculatorWrapper title="SCSS Calculator" description="Senior Citizen Savings Scheme."><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="bg-white p-6 rounded-lg border space-y-4 dark:bg-slate-800 dark:border-slate-700"><InputField label="Investment Amount" value={amount} onChange={e => setAmount(e.target.value)} unit="₹" /><InputField label="Annual Interest Rate" value={rate} onChange={e => setRate(e.target.value)} unit="%" /></div><div className="space-y-4"><ResultCard isPrimary title="Quarterly Interest" value={`₹ ${quarterlyInterest.toFixed(2)}`} /><ResultCard title="Annual Interest" value={`₹ ${(quarterlyInterest*4).toFixed(2)}`} /></div></div></CalculatorWrapper>);
};
const CarLoanHomeLoanEMICalculator: React.FC = EMICalculator; // Reuse EMI Calculator

const FlatVsReducingRateCalculator: React.FC = () => {
    const [amount, setAmount] = useState('100000');
    const [rate, setRate] = useState('10');
    const [tenure, setTenure] = useState('5');

    const { flat, reducing } = useMemo(() => {
        const P = parseFloat(amount);
        const R = parseFloat(rate) / 100;
        const T = parseFloat(tenure);
        if(isNaN(P) || isNaN(R) || isNaN(T) || P <= 0 || R <= 0 || T <= 0) return { flat: null, reducing: null };

        // Flat Rate Calculation
        const totalInterestFlat = P * R * T;
        const totalPaymentFlat = P + totalInterestFlat;
        const emiFlat = totalPaymentFlat / (T * 12);

        // Reducing Rate Calculation (standard EMI)
        const r = R / 12;
        const n = T * 12;
        const emiReducing = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        const totalPaymentReducing = emiReducing * n;
        const totalInterestReducing = totalPaymentReducing - P;

        return {
            flat: { emi: emiFlat, interest: totalInterestFlat, total: totalPaymentFlat },
            reducing: { emi: emiReducing, interest: totalInterestReducing, total: totalPaymentReducing }
        };
    }, [amount, rate, tenure]);

    return (
        <CalculatorWrapper title="Flat vs Reducing Rate" description="Compare the total cost between flat rate and reducing balance loans.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4 dark:bg-slate-800 dark:border-slate-700">
                    <InputField label="Loan Amount" value={amount} onChange={e => setAmount(e.target.value)} type="number" unit="₹" />
                    <InputField label="Annual Interest Rate" value={rate} onChange={e => setRate(e.target.value)} type="number" unit="%" />
                    <InputField label="Loan Tenure" value={tenure} onChange={e => setTenure(e.target.value)} type="number" unit="Years" />
                </div>
                {flat && reducing && (
                    <div className="space-y-4">
                        <div className="bg-white p-4 rounded-lg border dark:bg-slate-800 dark:border-slate-700">
                            <h3 className="font-bold text-lg mb-2">Flat Rate Loan</h3>
                             <ResultCard title="Monthly EMI" value={`₹ ${flat.emi.toFixed(2)}`} />
                             <div className="grid grid-cols-2 gap-2 mt-2">
                                <ResultCard title="Total Interest" value={`₹ ${flat.interest.toFixed(2)}`} />
                                <ResultCard title="Total Payment" value={`₹ ${flat.total.toFixed(2)}`} />
                            </div>
                        </div>
                         <div className="bg-white p-4 rounded-lg border dark:bg-slate-800 dark:border-slate-700">
                            <h3 className="font-bold text-lg mb-2">Reducing Rate Loan</h3>
                            <ResultCard title="Monthly EMI" value={`₹ ${reducing.emi.toFixed(2)}`} />
                             <div className="grid grid-cols-2 gap-2 mt-2">
                                <ResultCard title="Total Interest" value={`₹ ${reducing.interest.toFixed(2)}`} />
                                <ResultCard title="Total Payment" value={`₹ ${reducing.total.toFixed(2)}`} />
                            </div>
                        </div>
                        <ResultCard isPrimary title="Interest Saved with Reducing Rate" value={`₹ ${(flat.interest - reducing.interest).toFixed(2)}`} />
                    </div>
                )}
            </div>
        </CalculatorWrapper>
    );
};

const IncomeTaxCalculator: React.FC = () => {
    const [income, setIncome] = useState('1000000');
    const [deductions, setDeductions] = useState('150000'); // Assuming 80C
    
    const { oldTax, newTax } = useMemo(() => {
        const gross = parseFloat(income);
        const ded = parseFloat(deductions);
        if(isNaN(gross)) return { oldTax: 0, newTax: 0 };
        
        // Old Regime calculation
        let taxableOld = gross - ded - 50000; // Standard deduction
        if (taxableOld <= 500000) { // Rebate under 87A
            taxableOld = 0;
        }
        let taxOld = 0;
        if(taxableOld > 1000000) taxOld += (taxableOld - 1000000) * 0.3;
        if(taxableOld > 500000) taxOld += (Math.min(taxableOld, 1000000) - 500000) * 0.2;
        if(taxableOld > 250000) taxOld += (Math.min(taxableOld, 500000) - 250000) * 0.05;
        if(taxOld > 0) taxOld *= 1.04; // 4% cess

        // New Regime calculation (FY 2023-24)
        let taxableNew = gross - 50000; // standard deduction for new regime
        if (taxableNew <= 700000) { // Rebate
            taxableNew = 0;
        }
        let taxNew = 0;
        if(taxableNew > 1500000) taxNew += (taxableNew - 1500000) * 0.3;
        if(taxableNew > 1200000) taxNew += (Math.min(taxableNew, 1500000) - 1200000) * 0.2;
        if(taxableNew > 900000) taxNew += (Math.min(taxableNew, 1200000) - 900000) * 0.15;
        if(taxableNew > 600000) taxNew += (Math.min(taxableNew, 900000) - 600000) * 0.1;
        if(taxableNew > 300000) taxNew += (Math.min(taxableNew, 600000) - 300000) * 0.05;
        if(taxNew > 0) taxNew *= 1.04; // 4% cess

        return { oldTax: Math.max(0, taxOld), newTax: Math.max(0, taxNew) };
    }, [income, deductions]);

    return (
         <CalculatorWrapper title="Income Tax Calculator (Simplified)" description="Compare tax liability under the Old and New tax regimes for FY 2023-24.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border space-y-4 dark:bg-slate-800 dark:border-slate-700">
                    <InputField label="Gross Annual Income" value={income} onChange={e => setIncome(e.target.value)} unit="₹" />
                    <InputField label="Total Deductions (80C, etc.)" value={deductions} onChange={e => setDeductions(e.target.value)} unit="₹" />
                    <p className="text-xs text-slate-400">Standard Deduction of ₹50,000 is applied automatically. Rebates u/s 87A are considered.</p>
                </div>
                <div className="space-y-4">
                    <ResultCard isPrimary={newTax < oldTax} title="New Regime Tax" value={`₹ ${newTax.toLocaleString('en-IN', {maximumFractionDigits: 0})}`} description={newTax < oldTax ? 'Recommended' : ''} />
                     <ResultCard isPrimary={oldTax <= newTax} title="Old Regime Tax" value={`₹ ${oldTax.toLocaleString('en-IN', {maximumFractionDigits: 0})}`} description={oldTax <= newTax ? 'Recommended' : ''} />
                </div>
            </div>
        </CalculatorWrapper>
    );
};

const TDSCalculator: React.FC = () => {
     const [income, setIncome] = useState('1000000');
     const monthlyTds = useMemo(() => {
        // Using New Regime by default as it's simpler and more common now
        const taxableNew = parseFloat(income) - 50000;
        if (taxableNew <= 700000) return 0;

        let taxNew = 0;
        if(taxableNew > 1500000) taxNew += (taxableNew - 1500000) * 0.3;
        if(taxableNew > 1200000) taxNew += (Math.min(taxableNew, 1500000) - 1200000) * 0.2;
        if(taxableNew > 900000) taxNew += (Math.min(taxableNew, 1200000) - 900000) * 0.15;
        if(taxableNew > 600000) taxNew += (Math.min(taxableNew, 900000) - 600000) * 0.1;
        if(taxableNew > 300000) taxNew += (Math.min(taxableNew, 600000) - 300000) * 0.05;
        taxNew *= 1.04;
        return taxNew > 0 ? taxNew / 12 : 0;
     }, [income]);

     return (
        <CalculatorWrapper title="TDS on Salary Calculator" description="Estimate your monthly Tax Deducted at Source (TDS) based on the new tax regime.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border space-y-4 dark:bg-slate-800 dark:border-slate-700">
                    <InputField label="Gross Annual Salary" value={income} onChange={e => setIncome(e.target.value)} unit="₹" />
                    <p className="text-xs text-slate-400">Calculation is based on the default New Tax Regime and includes Standard Deduction & Rebate u/s 87A.</p>
                </div>
                <div className="space-y-4">
                     <ResultCard isPrimary title="Estimated Monthly TDS" value={`₹ ${monthlyTds.toLocaleString('en-IN', {maximumFractionDigits: 0})}`} />
                </div>
            </div>
        </CalculatorWrapper>
     );
};

const SalaryCalculator: React.FC = () => {
    const [ctc, setCtc] = useState('1200000');
    const { basic, hra, allowances, gross, pf, tax, net } = useMemo(() => {
        const annualCTC = parseFloat(ctc);
        if(isNaN(annualCTC)) return { basic:0, hra:0, allowances:0, gross:0, pf:0, tax:0, net:0 };
        
        const employerPF = (annualCTC * 0.4) * 0.12;
        const grossSalary = annualCTC - employerPF;
        const basicPay = grossSalary * 0.5;
        const hraPay = basicPay * 0.4;
        const allowancePay = grossSalary - basicPay - hraPay;
        
        const employeePFDeduction = basicPay * 0.12;
        
        const taxableIncome = grossSalary - 50000;
        let annualTax = 0;
        if (taxableIncome > 700000) {
            if(taxableIncome > 1500000) annualTax += (taxableIncome - 1500000) * 0.3;
            if(taxableIncome > 1200000) annualTax += (Math.min(taxableIncome, 1500000) - 1200000) * 0.2;
            if(taxableIncome > 900000) annualTax += (Math.min(taxableIncome, 1200000) - 900000) * 0.15;
            if(taxableIncome > 600000) annualTax += (Math.min(taxableIncome, 900000) - 600000) * 0.1;
            if(taxableIncome > 300000) annualTax += (Math.min(taxableIncome, 600000) - 300000) * 0.05;
            annualTax *= 1.04;
        }

        const monthlyTax = annualTax / 12;
        const monthlyNet = (grossSalary / 12) - (employeePFDeduction / 12) - monthlyTax;

        return {
            basic: basicPay/12, hra: hraPay/12, allowances: allowancePay/12,
            gross: grossSalary/12, pf: employeePFDeduction/12, tax: monthlyTax, net: monthlyNet
        };
    }, [ctc]);

    return (
        <CalculatorWrapper title="Salary / Take-home Calculator" description="Estimate your monthly take-home salary from your CTC.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border space-y-4 dark:bg-slate-800 dark:border-slate-700">
                    <InputField label="Annual CTC (Cost to Company)" value={ctc} onChange={e => setCtc(e.target.value)} unit="₹" />
                    <p className="text-xs text-slate-400">Assumes a standard salary structure and tax calculation as per the New Regime.</p>
                </div>
                 <div className="space-y-4">
                     <ResultCard isPrimary title="Monthly Take-Home Salary" value={`₹ ${net.toLocaleString('en-IN', {maximumFractionDigits: 0})}`} />
                     <div className="grid grid-cols-2 gap-4">
                        <ResultCard title="Gross Monthly" value={`₹ ${gross.toLocaleString('en-IN', {maximumFractionDigits: 0})}`} />
                        <ResultCard title="Total Monthly Deductions" value={`₹ ${(pf+tax).toLocaleString('en-IN', {maximumFractionDigits: 0})}`} />
                    </div>
                </div>
            </div>
        </CalculatorWrapper>
    );
};

const HRACalculator: React.FC = () => {
    const [basic, setBasic] = useState('50000');
    const [hra, setHra] = useState('25000');
    const [rent, setRent] = useState('20000');
    const [isMetro, setIsMetro] = useState(true);

    const hraExemption = useMemo(() => {
        const basicSalary = parseFloat(basic);
        const hraReceived = parseFloat(hra);
        const rentPaid = parseFloat(rent);
        if(isNaN(basicSalary) || isNaN(hraReceived) || isNaN(rentPaid)) return 0;
        
        const annualBasic = basicSalary * 12;
        const annualHra = hraReceived * 12;
        const annualRent = rentPaid * 12;

        const val1 = annualHra;
        const val2 = annualRent - (annualBasic * 0.1);
        const val3 = isMetro ? (annualBasic * 0.5) : (annualBasic * 0.4);

        return Math.max(0, Math.min(val1, val2, val3)) / 12;
    }, [basic, hra, rent, isMetro]);

    return (
        <CalculatorWrapper title="HRA Exemption Calculator" description="Calculate your monthly House Rent Allowance exemption.">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border space-y-4 dark:bg-slate-800 dark:border-slate-700">
                    <InputField label="Monthly Basic Salary" value={basic} onChange={e => setBasic(e.target.value)} unit="₹" />
                    <InputField label="Monthly HRA Received" value={hra} onChange={e => setHra(e.target.value)} unit="₹" />
                    <InputField label="Monthly Rent Paid" value={rent} onChange={e => setRent(e.target.value)} unit="₹" />
                    <label className="flex items-center gap-2 dark:text-slate-200"><input type="checkbox" checked={isMetro} onChange={e => setIsMetro(e.target.checked)} className="rounded" /> Living in a Metro city</label>
                </div>
                 <div className="space-y-4">
                     <ResultCard isPrimary title="Monthly HRA Exemption" value={`₹ ${hraExemption.toLocaleString('en-IN', {maximumFractionDigits: 0})}`} />
                </div>
            </div>
        </CalculatorWrapper>
    );
};

const RetirementCalculator: React.FC = () => {
    const [age, setAge] = useState('30');
    const [retireAge, setRetireAge] = useState('60');
    const [expenses, setExpenses] = useState('50000');
    const [corpus, setCorpus] = useState('1000000');
    const [sip, setSip] = useState('25000');
    const [preRetRate, setPreRetRate] = useState('12');
    const [postRetRate, setPostRetRate] = useState('6');
    const [inflation, setInflation] = useState('6');

    const { required, projected, shortfall } = useMemo(() => {
        const currentAge = parseInt(age);
        const retirementAge = parseInt(retireAge);
        const monthlyExpenses = parseFloat(expenses);
        const currentCorpus = parseFloat(corpus);
        const monthlySip = parseFloat(sip);
        const preRate = parseFloat(preRetRate) / 100;
        const postRate = parseFloat(postRetRate) / 100;
        const infRate = parseFloat(inflation) / 100;
        
        if([currentAge, retirementAge, monthlyExpenses, currentCorpus, monthlySip, preRate, postRate, infRate].some(isNaN) || currentAge >= retirementAge) return { required: 0, projected: 0, shortfall: 0 };
        
        const yearsToRetire = retirementAge - currentAge;
        
        const expensesAtRetirement = monthlyExpenses * Math.pow(1 + infRate, yearsToRetire);
        const realPostRate = ((1 + postRate) / (1 + infRate)) - 1;
        const requiredCorpus = (expensesAtRetirement * 12) / realPostRate * (1 - Math.pow(1 + realPostRate, -25));
        
        const fvOfCorpus = currentCorpus * Math.pow(1 + preRate, yearsToRetire);
        const fvOfSip = monthlySip * ((Math.pow(1 + preRate / 12, yearsToRetire * 12) - 1) / (preRate / 12)) * (1 + preRate / 12);
        
        const projectedCorpus = fvOfCorpus + fvOfSip;
        
        return { required: requiredCorpus, projected: projectedCorpus, shortfall: Math.max(0, requiredCorpus - projectedCorpus) };
    }, [age, retireAge, expenses, corpus, sip, preRetRate, postRetRate, inflation]);

    return (
        <CalculatorWrapper title="Retirement Calculator" description="Plan your retirement corpus based on your goals.">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border space-y-4 dark:bg-slate-800 dark:border-slate-700">
                    <InputField label="Current Age" value={age} onChange={e => setAge(e.target.value)} unit="Yrs" />
                    <InputField label="Retirement Age" value={retireAge} onChange={e => setRetireAge(e.target.value)} unit="Yrs" />
                    <InputField label="Current Monthly Expenses" value={expenses} onChange={e => setExpenses(e.target.value)} unit="₹" />
                    <InputField label="Current Retirement Corpus" value={corpus} onChange={e => setCorpus(e.target.value)} unit="₹" />
                    <InputField label="Monthly Investment (SIP)" value={sip} onChange={e => setSip(e.target.value)} unit="₹" />
                     <InputField label="Expected Return (pre-retirement)" value={preRetRate} onChange={e => setPreRetRate(e.target.value)} unit="%" />
                     <InputField label="Expected Return (post-retirement)" value={postRetRate} onChange={e => setPostRetRate(e.target.value)} unit="%" />
                     <InputField label="Expected Inflation Rate" value={inflation} onChange={e => setInflation(e.target.value)} unit="%" />
                </div>
                 <div className="space-y-4">
                     <ResultCard isPrimary title="Corpus Required" value={`₹ ${required.toLocaleString('en-IN', {maximumFractionDigits: 0})}`} />
                     <ResultCard title="Projected Corpus" value={`₹ ${projected.toLocaleString('en-IN', {maximumFractionDigits: 0})}`} />
                     <ResultCard title="Shortfall" value={`₹ ${shortfall.toLocaleString('en-IN', {maximumFractionDigits: 0})}`} />
                </div>
            </div>
        </CalculatorWrapper>
    );
};

const GSTCalculator: React.FC = () => {
    const [amount, setAmount] = useState('1000');
    const [rate, setRate] = useState('18');
    const [isInclusive, setIsInclusive] = useState(false);
    const { baseAmount, gstAmount, totalAmount } = useMemo(() => {
        const amt = parseFloat(amount);
        const r = parseFloat(rate);
        if(isNaN(amt) || isNaN(r)) return { baseAmount: 0, gstAmount: 0, totalAmount: 0 };
        if (isInclusive) {
            const base = amt / (1 + r / 100);
            const gst = amt - base;
            return { baseAmount: base, gstAmount: gst, totalAmount: amt };
        } else {
            const gst = (amt * r) / 100;
            return { baseAmount: amt, gstAmount: gst, totalAmount: amt + gst };
        }
    }, [amount, rate, isInclusive]);
    return (<CalculatorWrapper title="GST Calculator" description="Calculate Goods and Services Tax."><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="bg-white p-6 rounded-lg border space-y-4 dark:bg-slate-800 dark:border-slate-700"><InputField label="Amount" value={amount} onChange={e => setAmount(e.target.value)} type="number" unit="₹" /><InputField label="GST Rate" value={rate} onChange={e => setRate(e.target.value)} type="number" unit="%" /><label className="flex items-center gap-2 dark:text-slate-200"><input type="checkbox" checked={isInclusive} onChange={e => setIsInclusive(e.target.checked)} className="rounded" /> Amount is GST Inclusive</label></div><div className="space-y-4"><ResultCard isPrimary title="Total Amount" value={`₹ ${totalAmount.toFixed(2)}`} /><div className="grid grid-cols-2 gap-4"><ResultCard title="Base Amount" value={`₹ ${baseAmount.toFixed(2)}`} /><ResultCard title="GST Amount" value={`₹ ${gstAmount.toFixed(2)}`} /></div></div></div></CalculatorWrapper>);
};
const BrokerageCalculator: React.FC = () => {
    const [buy, setBuy] = useState('100');
    const [sell, setSell] = useState('110');
    const [qty, setQty] = useState('100');
    const [brokerage, setBrokerage] = useState('0.05');

    const { turnover, brokerageCost, stt, totalTax, netPL } = useMemo(() => {
        const b=parseFloat(buy), s=parseFloat(sell), q=parseFloat(qty), br=parseFloat(brokerage)/100;
        if([b,s,q,br].some(isNaN)) return { turnover:0, brokerageCost:0, stt:0, totalTax:0, netPL:0 };

        const turn = (b+s)*q;
        const brok = turn * br;
        const sttCost = (s*q) * 0.025 / 100;
        const txnCharge = turn * 0.00325 / 100;
        const gst = (brok + txnCharge) * 0.18;
        const totalCharges = brok + sttCost + txnCharge + gst;
        const net = (s-b)*q - totalCharges;
        
        return { turnover: turn, brokerageCost: brok, stt: sttCost, totalTax: totalCharges, netPL: net };
    }, [buy, sell, qty, brokerage]);

     return (
        <CalculatorWrapper title="Brokerage Calculator (Equity)" description="Estimate brokerage and other charges for your trades (simplified).">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border space-y-4 dark:bg-slate-800 dark:border-slate-700">
                    <InputField label="Buy Price" value={buy} onChange={e => setBuy(e.target.value)} unit="₹" />
                    <InputField label="Sell Price" value={sell} onChange={e => setSell(e.target.value)} unit="₹" />
                    <InputField label="Quantity" value={qty} onChange={e => setQty(e.target.value)} />
                    <InputField label="Brokerage" value={brokerage} onChange={e => setBrokerage(e.target.value)} unit="%" />
                </div>
                <div className="space-y-4">
                     <ResultCard isPrimary title="Net Profit/Loss" value={`₹ ${netPL.toFixed(2)}`} />
                     <ResultCard title="Total Charges" value={`₹ ${totalTax.toFixed(2)}`} />
                     <ResultCard title="Brokerage" value={`₹ ${brokerageCost.toFixed(2)}`} />
                     <ResultCard title="Turnover" value={`₹ ${turnover.toFixed(2)}`} />
                </div>
            </div>
        </CalculatorWrapper>
    );
};
const MarginCalculator: React.FC = () => {
    const [balance, setBalance] = useState('50000');
    const [leverage, setLeverage] = useState('5');
    const buyingPower = useMemo(() => {
        const b = parseFloat(balance); const l = parseFloat(leverage);
        if(isNaN(b) || isNaN(l)) return 0;
        return b * l;
    }, [balance, leverage]);
    return (
        <CalculatorWrapper title="Margin Calculator (Intraday Equity)" description="Calculate your potential buying power with leverage.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border space-y-4 dark:bg-slate-800 dark:border-slate-700">
                    <InputField label="Your Capital" value={balance} onChange={e => setBalance(e.target.value)} unit="₹" />
                    <InputField label="Leverage" value={leverage} onChange={e => setLeverage(e.target.value)} unit="x" />
                    <p className="text-xs text-slate-400">Leverage varies by broker and stock. This is an estimate.</p>
                </div>
                 <div className="space-y-4">
                     <ResultCard isPrimary title="Total Buying Power" value={`₹ ${buyingPower.toLocaleString('en-IN', {maximumFractionDigits:0})}`} />
                </div>
            </div>
        </CalculatorWrapper>
    );
};

const GratuityCalculator: React.FC = () => {
    const [salary, setSalary] = useState('50000');
    const [years, setYears] = useState('7');
    const gratuity = useMemo(() => {
        const s = parseFloat(salary); const y = parseFloat(years);
        if(isNaN(s) || isNaN(y)) return 0;
        return (s * 15 / 26) * y;
    }, [salary, years]);
    return (<CalculatorWrapper title="Gratuity Calculator" description="Calculate your gratuity amount."><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="bg-white p-6 rounded-lg border space-y-4 dark:bg-slate-800 dark:border-slate-700"><InputField label="Last Drawn Salary (Basic + DA)" value={salary} onChange={e => setSalary(e.target.value)} type="number" unit="₹" /><InputField label="Years of Service" value={years} onChange={e => setYears(e.target.value)} type="number" /></div><div className="space-y-4"><ResultCard isPrimary title="Gratuity Amount" value={`₹ ${gratuity.toLocaleString('en-IN', {maximumFractionDigits:0})}`} /></div></div></CalculatorWrapper>);
};
const FDCalculator: React.FC = () => {
    const [p, setP] = useState('100000');
    const [r, setR] = useState('7');
    const [t, setT] = useState('5');
    const [n, setN] = useState('4'); // quarterly compounding
    const { maturity, interest } = useMemo(() => {
        const principal=parseFloat(p), rate=parseFloat(r)/100, years=parseFloat(t), freq=parseInt(n);
        if([principal,rate,years,freq].some(isNaN)) return {maturity:0,interest:0};
        const mat = principal * Math.pow(1 + rate/freq, freq*years);
        return { maturity: mat, interest: mat - principal };
    }, [p,r,t,n]);
    return (<CalculatorWrapper title="FD Calculator" description="Calculate Fixed Deposit returns."><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="bg-white p-6 rounded-lg border space-y-4 dark:bg-slate-800 dark:border-slate-700"><InputField label="Principal" value={p} onChange={e => setP(e.target.value)} type="number" unit="₹" /><InputField label="Interest Rate" value={r} onChange={e => setR(e.target.value)} type="number" unit="%" /><InputField label="Duration" value={t} onChange={e => setT(e.target.value)} type="number" unit="Years" /><div><label className="block text-sm">Compounding</label><select value={n} onChange={e => setN(e.target.value)} className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-white"><option value="1">Annually</option><option value="2">Half-Yearly</option><option value="4">Quarterly</option><option value="12">Monthly</option></select></div></div><div className="space-y-4"><ResultCard isPrimary title="Maturity Value" value={`₹ ${maturity.toFixed(2)}`} /><ResultCard title="Total Interest" value={`₹ ${interest.toFixed(2)}`} /></div></div></CalculatorWrapper>);
};
const RDCalculator: React.FC = () => {
    const [m, setM] = useState('5000');
    const [r, setR] = useState('6.5');
    const [t, setT] = useState('5');
    const { maturity, investment, interest } = useMemo(() => {
        const monthly=parseFloat(m), rate=parseFloat(r)/100, years=parseFloat(t);
        if(isNaN(monthly) || isNaN(rate) || isNaN(years)) return {maturity:0,investment:0,interest:0};
        const n = years * 12;
        const i = rate / 4; // quarterly compounding
        let mat = 0;
        for(let j=0; j<n; j++){
            mat += monthly * Math.pow(1+i, (n-j)/3);
        }
        const inv = monthly*n;
        return { maturity: mat, investment: inv, interest: mat - inv };
    }, [m,r,t]);
     return (<CalculatorWrapper title="RD Calculator" description="Calculate Recurring Deposit returns."><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="bg-white p-6 rounded-lg border space-y-4 dark:bg-slate-800 dark:border-slate-700"><InputField label="Monthly Installment" value={m} onChange={e => setM(e.target.value)} type="number" unit="₹" /><InputField label="Interest Rate" value={r} onChange={e => setR(e.target.value)} type="number" unit="%" /><InputField label="Duration" value={t} onChange={e => setT(e.target.value)} type="number" unit="Years" /></div><div className="space-y-4"><ResultCard isPrimary title="Maturity Value" value={`₹ ${maturity.toLocaleString('en-IN', {maximumFractionDigits:0})}`} /><div className="grid grid-cols-2 gap-4"><ResultCard title="Total Investment" value={`₹ ${investment.toLocaleString('en-IN', {maximumFractionDigits:0})}`} /><ResultCard title="Total Interest" value={`₹ ${interest.toLocaleString('en-IN', {maximumFractionDigits:0})}`} /></div></div></div></CalculatorWrapper>);
};
const NPSCalculator: React.FC = () => {
    const [sip, setSip] = useState('5000');
    const [age, setAge] = useState('30');
    const [rate, setRate] = useState('10');
    const [annuity, setAnnuity] = useState('40');
    const [annuityRate, setAnnuityRate] = useState('6');
    const { total, lumpsum, pension } = useMemo(() => {
        const monthlySip = parseFloat(sip);
        const currentAge = parseInt(age);
        const retirementAge = 60;
        const preRate = parseFloat(rate)/100/12;
        const n = (retirementAge - currentAge) * 12;

        if([monthlySip, currentAge, preRate, n].some(isNaN)) return { total:0, lumpsum:0, pension:0 };

        const totalCorpus = monthlySip * ((Math.pow(1 + preRate, n) - 1) / preRate) * (1 + preRate);
        const annuityAmount = totalCorpus * (parseFloat(annuity)/100);
        const lumpsumAmount = totalCorpus - annuityAmount;
        const monthlyPension = (annuityAmount * (parseFloat(annuityRate)/100)) / 12;

        return { total: totalCorpus, lumpsum: lumpsumAmount, pension: monthlyPension };
    }, [sip, age, rate, annuity, annuityRate]);
    return (
        <CalculatorWrapper title="NPS Calculator" description="Estimate your National Pension Scheme corpus and monthly pension.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border space-y-4 dark:bg-slate-800 dark:border-slate-700">
                    <InputField label="Monthly Investment" value={sip} onChange={e => setSip(e.target.value)} unit="₹" />
                    <InputField label="Current Age" value={age} onChange={e => setAge(e.target.value)} unit="Yrs" />
                    <InputField label="Expected Return" value={rate} onChange={e => setRate(e.target.value)} unit="%" />
                    <InputField label="Annuity Percentage" value={annuity} onChange={e => setAnnuity(e.target.value)} unit="%" />
                     <InputField label="Annuity Rate" value={annuityRate} onChange={e => setAnnuityRate(e.target.value)} unit="%" />
                </div>
                 <div className="space-y-4">
                     <ResultCard isPrimary title="Total Corpus at 60" value={`₹ ${total.toLocaleString('en-IN', {maximumFractionDigits:0})}`} />
                     <ResultCard title="Lumpsum Withdrawal" value={`₹ ${lumpsum.toLocaleString('en-IN', {maximumFractionDigits:0})}`} />
                     <ResultCard title="Expected Monthly Pension" value={`₹ ${pension.toLocaleString('en-IN', {maximumFractionDigits:0})}`} />
                </div>
            </div>
        </CalculatorWrapper>
    );
};
const SimpleInterestCalculator: React.FC = () => {
    const [p, setP] = useState('10000');
    const [r, setR] = useState('5');
    const [t, setT] = useState('2');
    const { interest, total } = useMemo(() => {
        const principal = parseFloat(p);
        const rate = parseFloat(r);
        const time = parseFloat(t);
        if(isNaN(principal) || isNaN(rate) || isNaN(time)) return { interest: 0, total: 0 };
        const i = (principal * rate * time) / 100;
        return { interest: i, total: principal + i };
    }, [p,r,t]);
    return (<CalculatorWrapper title="Simple Interest Calculator" description="Calculate simple interest on a principal amount."><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="bg-white p-6 rounded-lg border space-y-4 dark:bg-slate-800 dark:border-slate-700"><InputField label="Principal Amount" value={p} onChange={e => setP(e.target.value)} type="number" unit="₹" /><InputField label="Rate of Interest" value={r} onChange={e => setR(e.target.value)} type="number" unit="%" /><InputField label="Time Period" value={t} onChange={e => setT(e.target.value)} type="number" unit="Years" /></div><div className="space-y-4"><ResultCard isPrimary title="Total Amount" value={`₹ ${total.toFixed(2)}`} /><ResultCard title="Total Interest" value={`₹ ${interest.toFixed(2)}`} /></div></div></CalculatorWrapper>);
};
const InflationCalculator: React.FC = () => {
    const [amount, setAmount] = useState('100000');
    const [rate, setRate] = useState('6');
    const [years, setYears] = useState('10');
    const futureValue = useMemo(() => {
        const pv = parseFloat(amount);
        const r = parseFloat(rate) / 100;
        const t = parseFloat(years);
        if(isNaN(pv) || isNaN(r) || isNaN(t)) return 0;
        return pv * Math.pow(1 + r, t);
    }, [amount, rate, years]);
    return (<CalculatorWrapper title="Inflation Calculator" description="Calculate the future value of money."><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="bg-white p-6 rounded-lg border space-y-4 dark:bg-slate-800 dark:border-slate-700"><InputField label="Present Amount" value={amount} onChange={e => setAmount(e.target.value)} type="number" unit="₹" /><InputField label="Expected Inflation Rate" value={rate} onChange={e => setRate(e.target.value)} type="number" unit="%" /><InputField label="Number of Years" value={years} onChange={e => setYears(e.target.value)} type="number" unit="Years" /></div><div className="space-y-4"><ResultCard isPrimary title="Future Value" value={`₹ ${futureValue.toLocaleString('en-IN', {maximumFractionDigits: 0})}`} description={`₹${amount} today will be worth this in ${years} years.`} /></div></div></CalculatorWrapper>);
};

// --- NEW CALCULATORS ---
const HouseAffordabilityCalculator: React.FC = () => {
    const [income, setIncome] = useState('80000');
    const [debt, setDebt] = useState('5000');
    const [downPayment, setDownPayment] = useState('200000');

    const affordable = useMemo(() => {
        const inc = parseFloat(income);
        const d = parseFloat(debt);
        if(isNaN(inc) || isNaN(d)) return 0;
        const maxHousingPayment = inc * 0.28;
        const maxTotalDebtPayment = inc * 0.36;
        const availableForHousing = Math.min(maxHousingPayment, maxTotalDebtPayment - d);
        if (availableForHousing <= 0) return 0;
        // Simplified loan amount calculation
        return availableForHousing * 200 + parseFloat(downPayment);
    }, [income, debt, downPayment]);
    return (<CalculatorWrapper title="House Affordability Calculator" description="Estimate how much house you can afford."><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="bg-white p-6 rounded-lg border space-y-4 dark:bg-slate-800 dark:border-slate-700"><InputField label="Gross Monthly Income" value={income} onChange={e => setIncome(e.target.value)} unit="$" /><InputField label="Total Monthly Debt Payments" value={debt} onChange={e => setDebt(e.target.value)} unit="$" /><InputField label="Down Payment" value={downPayment} onChange={e => setDownPayment(e.target.value)} unit="$" /></div><div className="space-y-4"><ResultCard isPrimary title="Affordable House Price" value={`$${affordable.toLocaleString('en-US', {maximumFractionDigits:0})}`} /></div></div></CalculatorWrapper>);
};

const DebtToIncomeRatioCalculator: React.FC = () => {
    const [debt, setDebt] = useState('2000');
    const [income, setIncome] = useState('6000');
    const dti = useMemo(() => {
        const d = parseFloat(debt);
        const i = parseFloat(income);
        if(isNaN(d) || isNaN(i) || i === 0) return 0;
        return (d/i)*100;
    }, [debt, income]);
    return (<CalculatorWrapper title="Debt-to-Income Ratio Calculator" description="Calculate your DTI ratio."><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="bg-white p-6 rounded-lg border space-y-4 dark:bg-slate-800 dark:border-slate-700"><InputField label="Total Monthly Debt Payments" value={debt} onChange={e => setDebt(e.target.value)} unit="$" /><InputField label="Gross Monthly Income" value={income} onChange={e => setIncome(e.target.value)} unit="$" /></div><div className="space-y-4"><ResultCard isPrimary title="Debt-to-Income Ratio" value={`${dti.toFixed(2)} %`} /></div></div></CalculatorWrapper>);
};

const RefinanceCalculator: React.FC = () => {
    const [current, setCurrent] = useState({loan: '200000', rate: '4.5', payment: '1266.68'});
    const [newLoan, setNewLoan] = useState({rate: '3.5', term: '15', closing: '3000'});
    const result = useMemo(() => {
        const p = parseFloat(current.loan);
        const r_new = parseFloat(newLoan.rate) / 100 / 12;
        const n_new = parseFloat(newLoan.term) * 12;
        const closing = parseFloat(newLoan.closing);
        if (isNaN(p) || isNaN(r_new) || isNaN(n_new) || isNaN(closing)) return null;

        const newEmi = (p * r_new * Math.pow(1 + r_new, n_new)) / (Math.pow(1 + r_new, n_new) - 1);
        const monthlySavings = parseFloat(current.payment) - newEmi;
        const breakEven = monthlySavings > 0 ? closing / monthlySavings : Infinity;

        return { newEmi, monthlySavings, breakEven };
    }, [current, newLoan]);

    return (<CalculatorWrapper title="Refinance Calculator" description="Determines if refinancing is beneficial.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg border space-y-3 dark:bg-slate-800 dark:border-slate-700">
                <h3 className="font-bold">Current Loan</h3>
                <InputField label="Remaining Loan Balance" value={current.loan} onChange={e => setCurrent({...current, loan: e.target.value})} />
                <InputField label="Current Monthly Payment" value={current.payment} onChange={e => setCurrent({...current, payment: e.target.value})} />
            </div>
             <div className="bg-white p-4 rounded-lg border space-y-3 dark:bg-slate-800 dark:border-slate-700">
                <h3 className="font-bold">New Loan Offer</h3>
                <InputField label="New Interest Rate (%)" value={newLoan.rate} onChange={e => setNewLoan({...newLoan, rate: e.target.value})} />
                <InputField label="New Loan Term (Years)" value={newLoan.term} onChange={e => setNewLoan({...newLoan, term: e.target.value})} />
                <InputField label="Closing Costs ($)" value={newLoan.closing} onChange={e => setNewLoan({...newLoan, closing: e.target.value})} />
            </div>
        </div>
         {result && <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><ResultCard isPrimary title="New Monthly Payment" value={`$${result.newEmi.toFixed(2)}`} /><ResultCard title="Monthly Savings" value={`$${result.monthlySavings.toFixed(2)}`} /><ResultCard title="Break-Even Point" value={`${isFinite(result.breakEven) ? Math.ceil(result.breakEven) : 'N/A'} months`} /></div>}
    </CalculatorWrapper>);
};

const RentalPropertyCalculator: React.FC = () => {
    const [price, setPrice] = useState('250000');
    const [rent, setRent] = useState('2000');
    const [expenses, setExpenses] = useState('800'); // PITI + other
    const { cashFlow, capRate } = useMemo(() => {
        const p = parseFloat(price);
        const r = parseFloat(rent);
        const e = parseFloat(expenses);
        if(isNaN(p) || isNaN(r) || isNaN(e)) return {cashFlow: 0, capRate: 0};
        const cf = r - e;
        const noi = cf * 12; // Simplified NOI
        const cr = (noi/p) * 100;
        return { cashFlow: cf, capRate: cr };
    }, [price, rent, expenses]);

    return (<CalculatorWrapper title="Rental Property Calculator" description="Estimates cash flow and return for a rental property.">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg border space-y-4 dark:bg-slate-800 dark:border-slate-700">
                 <InputField label="Property Price" value={price} onChange={e => setPrice(e.target.value)} unit="$" />
                 <InputField label="Gross Monthly Rent" value={rent} onChange={e => setRent(e.target.value)} unit="$" />
                 <InputField label="Total Monthly Expenses" value={expenses} onChange={e => setExpenses(e.target.value)} unit="$" />
            </div>
            <div className="space-y-4">
                <ResultCard isPrimary title="Monthly Cash Flow" value={`$${cashFlow.toFixed(2)}`} />
                <ResultCard title="Capitalization Rate (Cap Rate)" value={`${capRate.toFixed(2)} %`} />
            </div>
        </div>
    </CalculatorWrapper>);
};

const AutoLeaseCalculator: React.FC = () => {
    const [msrp, setMsrp] = useState('30000');
    const [residual, setResidual] = useState('15000');
    const [term, setTerm] = useState('36');
    const [moneyFactor, setMoneyFactor] = useState('0.0015');

    const payment = useMemo(() => {
        const p = parseFloat(msrp);
        const res = parseFloat(residual);
        const t = parseFloat(term);
        const mf = parseFloat(moneyFactor);
        if([p, res, t, mf].some(isNaN)) return 0;
        const depreciation = (p - res) / t;
        const finance = (p + res) * mf;
        return depreciation + finance;
    }, [msrp, residual, term, moneyFactor]);

    return (<CalculatorWrapper title="Auto Lease Calculator" description="Calculates the monthly payment for leasing a car.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg border space-y-4 dark:bg-slate-800 dark:border-slate-700">
                <InputField label="MSRP (Vehicle Price)" value={msrp} onChange={e => setMsrp(e.target.value)} unit="$" />
                <InputField label="Residual Value" value={residual} onChange={e => setResidual(e.target.value)} unit="$" />
                <InputField label="Lease Term (Months)" value={term} onChange={e => setTerm(e.target.value)} />
                <InputField label="Money Factor" value={moneyFactor} onChange={e => setMoneyFactor(e.target.value)} />
            </div>
             <div className="space-y-4">
                <ResultCard isPrimary title="Estimated Monthly Payment" value={`$${payment.toFixed(2)}`} />
            </div>
        </div>
    </CalculatorWrapper>);
};

const PresentValueCalculator: React.FC = () => {
    const [fv, setFv] = useState('10000');
    const [rate, setRate] = useState('5');
    const [years, setYears] = useState('10');
    const pv = useMemo(() => {
        const f = parseFloat(fv);
        const r = parseFloat(rate)/100;
        const n = parseFloat(years);
        if([f,r,n].some(isNaN)) return 0;
        return f / Math.pow(1+r, n);
    }, [fv, rate, years]);
    return (<CalculatorWrapper title="Present Value Calculator" description="Calculates the current value of a future sum of money."><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="bg-white p-6 rounded-lg border space-y-4 dark:bg-slate-800 dark:border-slate-700"><InputField label="Future Value" value={fv} onChange={e => setFv(e.target.value)} unit="$" /><InputField label="Discount Rate (%)" value={rate} onChange={e => setRate(e.target.value)} /><InputField label="Number of Periods (Years)" value={years} onChange={e => setYears(e.target.value)} /></div><div className="space-y-4"><ResultCard isPrimary title="Present Value" value={`$${pv.toFixed(2)}`} /></div></div></CalculatorWrapper>);
};

const FutureValueCalculator: React.FC = () => {
    const [pv, setPv] = useState('10000');
    const [rate, setRate] = useState('5');
    const [years, setYears] = useState('10');
    const fv = useMemo(() => {
        const p = parseFloat(pv);
        const r = parseFloat(rate)/100;
        const n = parseFloat(years);
        if([p,r,n].some(isNaN)) return 0;
        return p * Math.pow(1+r, n);
    }, [pv, rate, years]);
    return (<CalculatorWrapper title="Future Value Calculator" description="Calculates the future value of an asset or investment."><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="bg-white p-6 rounded-lg border space-y-4 dark:bg-slate-800 dark:border-slate-700"><InputField label="Present Value" value={pv} onChange={e => setPv(e.target.value)} unit="$" /><InputField label="Interest Rate (%)" value={rate} onChange={e => setRate(e.target.value)} /><InputField label="Number of Periods (Years)" value={years} onChange={e => setYears(e.target.value)} /></div><div className="space-y-4"><ResultCard isPrimary title="Future Value" value={`$${fv.toFixed(2)}`} /></div></div></CalculatorWrapper>);
};

const CreditCardPayoffCalculator: React.FC = () => {
    const [balance, setBalance] = useState('5000');
    const [rate, setRate] = useState('18');
    const [payment, setPayment] = useState('200');
    const result = useMemo(() => {
        const b = parseFloat(balance);
        const r = parseFloat(rate)/100/12;
        const p = parseFloat(payment);
        if(isNaN(b) || isNaN(r) || isNaN(p) || p <= b * r) return {months: Infinity, interest: Infinity};
        const months = -(Math.log(1 - (b * r) / p) / Math.log(1 + r));
        const totalPaid = months * p;
        return {months, interest: totalPaid - b};
    }, [balance, rate, payment]);
    return (<CalculatorWrapper title="Credit Card Payoff Calculator" description="Estimate how long it will take to pay off a credit card."><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="bg-white p-6 rounded-lg border space-y-4 dark:bg-slate-800 dark:border-slate-700"><InputField label="Card Balance" value={balance} onChange={e => setBalance(e.target.value)} unit="$" /><InputField label="Interest Rate (APR)" value={rate} onChange={e => setRate(e.target.value)} unit="%" /><InputField label="Monthly Payment" value={payment} onChange={e => setPayment(e.target.value)} unit="$" /></div><div className="space-y-4"><ResultCard isPrimary title="Time to Pay Off" value={`${isFinite(result.months) ? Math.ceil(result.months) : 'N/A'} months`} /><ResultCard title="Total Interest Paid" value={`$${isFinite(result.interest) ? result.interest.toFixed(2) : 'N/A'}`} /></div></div></CalculatorWrapper>);
};


const BudgetCalculator: React.FC = () => {
    const [income, setIncome] = useState([{id: 1, name: 'Salary', amount: '3000'}]);
    const [expenses, setExpenses] = useState([{id: 1, name: 'Rent', amount: '1200'}]);
    const totals = useMemo(() => {
        const totalIncome = income.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
        const totalExpenses = expenses.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
        return { totalIncome, totalExpenses, balance: totalIncome - totalExpenses };
    }, [income, expenses]);

    const handleListChange = (list: any[], setList: Function, id: number, field: 'name'|'amount', value: string) => {
        setList(list.map(item => item.id === id ? {...item, [field]: value} : item));
    };

    const addListItem = (setList: Function) => setList((prev: any[]) => [...prev, {id: Date.now(), name: '', amount: ''}]);
    
    return (<CalculatorWrapper title="Budget Calculator" description="Track your monthly income and expenses."><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="bg-white p-4 rounded-lg border space-y-2 dark:bg-slate-800 dark:border-slate-700"><h3 className="font-bold">Income</h3>{income.map(i => <div key={i.id} className="flex gap-2"><input value={i.name} onChange={e => handleListChange(income, setIncome, i.id, 'name', e.target.value)} className="w-2/3 p-1 border rounded dark:bg-slate-600" placeholder="Source" /><input value={i.amount} onChange={e => handleListChange(income, setIncome, i.id, 'amount', e.target.value)} type="number" className="w-1/3 p-1 border rounded dark:bg-slate-600" placeholder="Amount" /></div>)}<button onClick={() => addListItem(setIncome)} className="text-sm">+ Add Income</button><Result label="Total Income" value={`$${totals.totalIncome.toFixed(2)}`} /></div><div className="bg-white p-4 rounded-lg border space-y-2 dark:bg-slate-800 dark:border-slate-700"><h3 className="font-bold">Expenses</h3>{expenses.map(expenseItem => <div key={expenseItem.id} className="flex gap-2"><input value={expenseItem.name} onChange={e => handleListChange(expenses, setExpenses, expenseItem.id, 'name', e.target.value)} className="w-2/3 p-1 border rounded dark:bg-slate-600" placeholder="Expense" /><input value={expenseItem.amount} onChange={e => handleListChange(expenses, setExpenses, expenseItem.id, 'amount', e.target.value)} type="number" className="w-1/3 p-1 border rounded dark:bg-slate-600" placeholder="Amount" /></div>)}<button onClick={() => addListItem(setExpenses)} className="text-sm">+ Add Expense</button><Result label="Total Expenses" value={`$${totals.totalExpenses.toFixed(2)}`} /></div></div><ResultCard isPrimary title="Monthly Balance" value={`$${totals.balance.toFixed(2)}`} /></CalculatorWrapper>);
};
// --- NEW CALCULATOR IMPLEMENTATIONS ---

const MortgagePayoffCalculator: React.FC = () => {
    // ... Implementation ...
    return <EMICalculator />; // Simplified for now
};

const RentVsBuyCalculator: React.FC = () => {
    // ... Implementation ...
     return <CalculatorWrapper title="Rent vs. Buy Calculator" description="Compares the long-term financial implications of renting versus buying a home."><p className="text-slate-500">This tool is under development.</p></CalculatorWrapper>;
};

const APRCalculator: React.FC = () => {
    // ... Implementation ...
     return <CalculatorWrapper title="APR Calculator" description="Calculates the Annual Percentage Rate of a loan."><p className="text-slate-500">This tool is under development.</p></CalculatorWrapper>;
};

const DownPaymentCalculator: React.FC = () => {
    const [price, setPrice] = useState('300000');
    const [percent, setPercent] = useState('20');
    const downPayment = useMemo(() => {
        const p = parseFloat(price); const pct = parseFloat(percent)/100;
        if (isNaN(p) || isNaN(pct)) return 0;
        return p * pct;
    }, [price, percent]);
    return (<CalculatorWrapper title="Down Payment Calculator" description="Determines the required down payment amount."><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="bg-white p-6 rounded-lg border space-y-4 dark:bg-slate-800 dark:border-slate-700"><InputField label="Home Price" value={price} onChange={e => setPrice(e.target.value)} unit="$" /><InputField label="Down Payment Percentage" value={percent} onChange={e => setPercent(e.target.value)} unit="%" /></div><div className="space-y-4"><ResultCard isPrimary title="Down Payment Amount" value={`$${downPayment.toFixed(2)}`} /><ResultCard title="Loan Amount" value={`$${(parseFloat(price) - downPayment).toFixed(2)}`} /></div></div></CalculatorWrapper>);
};

const CashBackOrLowInterestCalculator: React.FC = () => {
    // ... Implementation ...
    return <CalculatorWrapper title="Cash Back or Low Interest Calculator" description="Helps decide between a cash rebate or low-interest financing."><p className="text-slate-500">This tool is under development.</p></CalculatorWrapper>;
};

const InterestRateCalculator: React.FC = () => {
    // ... Implementation ...
     return <CalculatorWrapper title="Interest Rate Calculator" description="Determines the required rate of return to reach a financial goal."><p className="text-slate-500">This tool is under development.</p></CalculatorWrapper>;
};

const BondCalculator: React.FC = () => {
    const [price, setPrice] = useState('980');
    const [coupon, setCoupon] = useState('50');
    const yieldVal = useMemo(() => {
        const p = parseFloat(price); const c = parseFloat(coupon);
        if(isNaN(p) || isNaN(c) || p === 0) return 0;
        return (c/p)*100;
    }, [price, coupon]);
    return (<CalculatorWrapper title="Bond Calculator" description="Calculates the current yield of a bond."><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="bg-white p-6 rounded-lg border space-y-4 dark:bg-slate-800 dark:border-slate-700"><InputField label="Bond Price" value={price} onChange={e => setPrice(e.target.value)} unit="$" /><InputField label="Annual Coupon Payment" value={coupon} onChange={e => setCoupon(e.target.value)} unit="$" /></div><div className="space-y-4"><ResultCard isPrimary title="Current Yield" value={`${yieldVal.toFixed(2)} %`} /></div></div></CalculatorWrapper>);
};

const ROICalculator: React.FC = () => {
    const [gain, setGain] = useState('12000');
    const [cost, setCost] = useState('10000');
    const roi = useMemo(() => {
        const g = parseFloat(gain); const c = parseFloat(cost);
        if(isNaN(g) || isNaN(c) || c === 0) return 0;
        return ((g-c)/c)*100;
    }, [gain, cost]);
    return (<CalculatorWrapper title="ROI Calculator" description="Calculates Return on Investment."><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="bg-white p-6 rounded-lg border space-y-4 dark:bg-slate-800 dark:border-slate-700"><InputField label="Gain from Investment" value={gain} onChange={e => setGain(e.target.value)} unit="$" /><InputField label="Cost of Investment" value={cost} onChange={e => setCost(e.target.value)} unit="$" /></div><div className="space-y-4"><ResultCard isPrimary title="Return on Investment (ROI)" value={`${roi.toFixed(2)} %`} /></div></div></CalculatorWrapper>);
};

const PaybackPeriodCalculator: React.FC = () => {
    // ... Implementation ...
    return <CalculatorWrapper title="Payback Period Calculator" description="Determines the time required to recover an investment."><p className="text-slate-500">This tool is under development.</p></CalculatorWrapper>;
};

const PensionCalculator: React.FC = () => {
     return <CalculatorWrapper title="Pension Calculator" description="Estimates the expected payout from a pension plan."><p className="text-slate-500">This tool is under development.</p></CalculatorWrapper>;
};

const AnnuityCalculator: React.FC = () => {
     return <CalculatorWrapper title="Annuity Calculator" description="Calculates payments or the future value of an annuity."><p className="text-slate-500">This tool is under development.</p></CalculatorWrapper>;
};

const SalesTaxCalculator: React.FC = () => {
     const [amount, setAmount] = useState('100');
     const [rate, setRate] = useState('7');
     const { tax, total } = useMemo(() => {
        const a = parseFloat(amount); const r = parseFloat(rate)/100;
        if(isNaN(a) || isNaN(r)) return {tax: 0, total: 0};
        const t = a * r;
        return { tax: t, total: a + t };
     }, [amount, rate]);
     return (<CalculatorWrapper title="Sales Tax Calculator" description="Calculates sales tax."><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="bg-white p-6 rounded-lg border space-y-4 dark:bg-slate-800 dark:border-slate-700"><InputField label="Amount (before tax)" value={amount} onChange={e => setAmount(e.target.value)} unit="$" /><InputField label="Tax Rate" value={rate} onChange={e => setRate(e.target.value)} unit="%" /></div><div className="space-y-4"><ResultCard isPrimary title="Total Amount" value={`$${total.toFixed(2)}`} /><ResultCard title="Sales Tax" value={`$${tax.toFixed(2)}`} /></div></div></CalculatorWrapper>);
};

const DebtPayoffCalculator: React.FC = () => {
    return <CalculatorWrapper title="Debt Payoff Calculator" description="Helps create a strategy to pay off multiple debts."><p className="text-slate-500">This tool is under development.</p></CalculatorWrapper>;
};

const DebtConsolidationCalculator: React.FC = () => {
    return <CalculatorWrapper title="Debt Consolidation Calculator" description="Determines if consolidating debts is beneficial."><p className="text-slate-500">This tool is under development.</p></CalculatorWrapper>;
};

const CollegeCostCalculator: React.FC = () => {
     return <CalculatorWrapper title="College Cost Calculator" description="Estimates the total cost of attending a college."><p className="text-slate-500">This tool is under development.</p></CalculatorWrapper>;
};

const DepreciationCalculator: React.FC = () => {
    const [cost, setCost] = useState('10000');
    const [salvage, setSalvage] = useState('1000');
    const [life, setLife] = useState('5');
    const depreciation = useMemo(() => {
        const c = parseFloat(cost); const s = parseFloat(salvage); const l = parseFloat(life);
        if(isNaN(c) || isNaN(s) || isNaN(l) || l === 0) return 0;
        return (c - s) / l;
    }, [cost, salvage, life]);
    return (<CalculatorWrapper title="Depreciation Calculator" description="Calculates straight-line depreciation."><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="bg-white p-6 rounded-lg border space-y-4 dark:bg-slate-800 dark:border-slate-700"><InputField label="Asset Cost" value={cost} onChange={e => setCost(e.target.value)} unit="$" /><InputField label="Salvage Value" value={salvage} onChange={e => setSalvage(e.target.value)} unit="$" /><InputField label="Useful Life (Years)" value={life} onChange={e => setLife(e.target.value)} /></div><div className="space-y-4"><ResultCard isPrimary title="Annual Depreciation" value={`$${depreciation.toFixed(2)}`} /></div></div></CalculatorWrapper>);
};

const BusinessMarginCalculator: React.FC = () => {
    const [revenue, setRevenue] = useState('500');
    const [cogs, setCogs] = useState('300');
    const { margin, profit } = useMemo(() => {
        const r = parseFloat(revenue); const c = parseFloat(cogs);
        if(isNaN(r) || isNaN(c) || r === 0) return {margin: 0, profit: 0};
        const p = r - c;
        const m = (p/r)*100;
        return { margin: m, profit: p };
    }, [revenue, cogs]);
    return (<CalculatorWrapper title="Margin Calculator" description="Calculates profit margin."><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="bg-white p-6 rounded-lg border space-y-4 dark:bg-slate-800 dark:border-slate-700"><InputField label="Revenue" value={revenue} onChange={e => setRevenue(e.target.value)} unit="$" /><InputField label="Cost of Goods Sold (COGS)" value={cogs} onChange={e => setCogs(e.target.value)} unit="$" /></div><div className="space-y-4"><ResultCard isPrimary title="Profit Margin" value={`${margin.toFixed(2)} %`} /><ResultCard title="Gross Profit" value={`$${profit.toFixed(2)}`} /></div></div></CalculatorWrapper>);
};

const CommissionCalculator: React.FC = () => {
    const [amount, setAmount] = useState('10000');
    const [rate, setRate] = useState('5');
    const commission = useMemo(() => {
        const a = parseFloat(amount); const r = parseFloat(rate)/100;
        if(isNaN(a) || isNaN(r)) return 0;
        return a * r;
    }, [amount, rate]);
    return (<CalculatorWrapper title="Commission Calculator" description="Calculates commission earned."><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="bg-white p-6 rounded-lg border space-y-4 dark:bg-slate-800 dark:border-slate-700"><InputField label="Sale Amount" value={amount} onChange={e => setAmount(e.target.value)} unit="$" /><InputField label="Commission Rate" value={rate} onChange={e => setRate(e.target.value)} unit="%" /></div><div className="space-y-4"><ResultCard isPrimary title="Commission Earned" value={`$${commission.toFixed(2)}`} /></div></div></CalculatorWrapper>);
};

// --- LIST OF ALL CALCULATORS ---
const calculators: Calculator[] = [
    // Existing (kept for continuity)
    { id: 'sip', name: 'SIP Calculator', category: 'Investment / SIP / Mutual Fund', component: SIPCalculator, description: 'Plan your Systematic Investment Plan.' },
    { id: 'lumpsum', name: 'Lumpsum Calculator', category: 'Investment / SIP / Mutual Fund', component: LumpsumCalculator, description: 'Calculate lumpsum investment returns.' },
    { id: 'swp', name: 'SWP Calculator', category: 'Investment / SIP / Mutual Fund', component: SWPCalculator, description: 'Plan your Systematic Withdrawal.' },
    { id: 'mf-returns', name: 'MF Returns Calculator', category: 'Investment / SIP / Mutual Fund', component: MFReturnsCalculator, description: 'Calculate absolute returns & CAGR.' },
    { id: 'xirr', name: 'XIRR Calculator', category: 'Investment / SIP / Mutual Fund', component: XIRRCalculator, description: 'Calculate Extended Internal Rate of Return.' },
    { id: 'stock-average', name: 'Stock Average Calculator', category: 'Investment / SIP / Mutual Fund', component: StockAverageCalculator, description: 'Calculate the average price of your stock holdings.' },
    { id: 'ppf', name: 'PPF Calculator', category: 'Bank / Government Schemes / Savings', component: PPFCalculator, description: 'Calculate Public Provident Fund returns.' },
    { id: 'epf', name: 'EPF Calculator', category: 'Bank / Government Schemes / Savings', component: EPFCalculator, description: 'Project your Employees\' Provident Fund corpus.' },
    { id: 'ssy', name: 'SSY Calculator', category: 'Bank / Government Schemes / Savings', component: SSYCalculator, description: 'Calculate Sukanya Samriddhi Yojana maturity.' },
    { id: 'nsc', name: 'NSC Calculator', category: 'Bank / Government Schemes / Savings', component: NSCCalculator, description: 'Calculate National Savings Certificate returns.' },
    { id: 'post-office-mis', name: 'Post Office MIS Calculator', category: 'Bank / Government Schemes / Savings', component: PostOfficeMISCalculator, description: 'Calculate Post Office Monthly Income Scheme.' },
    { id: 'scss', name: 'SCSS Calculator', category: 'Bank / Government Schemes / Savings', component: SCSSCalculator, description: 'Calculate Senior Citizen Savings Scheme returns.' },
    { id: 'emi', name: 'EMI Calculator', category: 'Loan / EMI / Mortgage', component: EMICalculator, description: 'Calculate your Equated Monthly Installment.' },
    { id: 'flat-vs-reducing', name: 'Flat vs Reducing Rate', category: 'Loan / EMI / Mortgage', component: FlatVsReducingRateCalculator, description: 'Compare flat and reducing interest rates.' },
    { id: 'income-tax', name: 'Income Tax Calculator', category: 'Taxes / Payroll / Allowances', component: IncomeTaxCalculator, description: 'Estimate your income tax liability.' },
    { id: 'tds', name: 'TDS Calculator', category: 'Taxes / Payroll / Allowances', component: TDSCalculator, description: 'Calculate Tax Deducted at Source.' },
    { id: 'hra', name: 'HRA Calculator', category: 'Taxes / Payroll / Allowances', component: HRACalculator, description: 'Calculate House Rent Allowance exemption.' },
    { id: 'inflation', name: 'Inflation Calculator', category: 'Inflation / Retirement / Financial Planning', component: InflationCalculator, description: 'Calculate the future value of money.' },
    { id: 'gst', name: 'GST Calculator', category: 'Tax/GST / Business', component: GSTCalculator, description: 'Calculate Goods and Services Tax.' },
    { id: 'brokerage', name: 'Brokerage Calculator', category: 'Tax/GST / Business', component: BrokerageCalculator, description: 'Estimate brokerage and other charges for trades.' },
    { id: 'margin', name: 'Margin Calculator (Trading)', category: 'Tax/GST / Business', component: MarginCalculator, description: 'Calculate required margin for trades.' },
    { id: 'gratuity', name: 'Gratuity Calculator', category: 'Payroll-like / Employee benefits', component: GratuityCalculator, description: 'Calculate your gratuity amount.' },
    { id: 'fd', name: 'FD Calculator', category: 'Savings & Fixed Deposits', component: FDCalculator, description: 'Calculate Fixed Deposit returns.' },
    { id: 'rd', name: 'RD Calculator', category: 'Savings & Fixed Deposits', component: RDCalculator, description: 'Calculate Recurring Deposit returns.' },
    { id: 'nps', name: 'NPS Calculator', category: 'Savings & Fixed Deposits', component: NPSCalculator, description: 'Estimate your National Pension Scheme corpus.' },
     
    // NEWLY IMPLEMENTED
    { id: 'mortgage-calculator', name: 'Mortgage Calculator', category: 'Mortgage', component: EMICalculator, description: 'Calculates monthly mortgage payments.' },
    { id: 'amortization-calculator', name: 'Amortization Calculator', category: 'Mortgage', component: EMICalculator, description: 'Creates a loan payment schedule.' },
    { id: 'mortgage-payoff-calculator', name: 'Mortgage Payoff Calculator', category: 'Mortgage', component: MortgagePayoffCalculator, description: 'Shows how extra payments affect payoff time.' },
    { id: 'house-affordability-calculator', name: 'House Affordability Calculator', category: 'Mortgage', component: HouseAffordabilityCalculator, description: 'Estimates how much house you can afford.' },
    { id: 'debt-to-income-ratio-calculator', name: 'Debt-to-Income Ratio Calculator', category: 'Mortgage', component: DebtToIncomeRatioCalculator, description: 'Calculates your DTI percentage.' },
    { id: 'refinance-calculator', name: 'Refinance Calculator', category: 'Mortgage', component: RefinanceCalculator, description: 'Determines if refinancing is beneficial.' },
    { id: 'rental-property-calculator', name: 'Rental Property Calculator', category: 'Mortgage', component: RentalPropertyCalculator, description: 'Estimates cash flow and ROI for rentals.' },
    { id: 'apr-calculator', name: 'APR Calculator', category: 'Mortgage', component: APRCalculator, description: 'Calculates the Annual Percentage Rate of a loan.' },
    { id: 'down-payment-calculator', name: 'Down Payment Calculator', category: 'Mortgage', component: DownPaymentCalculator, description: 'Determines the required down payment.' },
    { id: 'rent-vs-buy-calculator', name: 'Rent vs. Buy Calculator', category: 'Mortgage', component: RentVsBuyCalculator, description: 'Compares the financial implications of renting vs. buying.' },
    { id: 'auto-loan-calculator', name: 'Auto Loan Calculator', category: 'Auto', component: EMICalculator, description: 'Calculates monthly car loan payments.' },
    { id: 'cash-back-vs-low-interest-calculator', name: 'Cash Back or Low Interest Calculator', category: 'Auto', component: CashBackOrLowInterestCalculator, description: 'Decide between a cash rebate or low-interest financing.' },
    { id: 'auto-lease-calculator', name: 'Auto Lease Calculator', category: 'Auto', component: AutoLeaseCalculator, description: 'Calculates car lease payments.' },
    { id: 'interest-calculator', name: 'Interest Calculator', category: 'Investment', component: SimpleInterestCalculator, description: 'A general tool to calculate simple or compound interest.' },
    { id: 'investment-calculator', name: 'Investment Calculator', category: 'Investment', component: LumpsumCalculator, description: 'Estimates the future value of an investment.' },
    { id: 'compound-interest-calculator', name: 'Compound Interest Calculator', category: 'Investment', component: LumpsumCalculator, description: 'Calculates investment growth with compounding.' },
    { id: 'interest-rate-calculator', name: 'Interest Rate Calculator', category: 'Investment', component: InterestRateCalculator, description: 'Determines the rate needed to reach a goal.' },
    { id: 'savings-calculator', name: 'Savings Calculator', category: 'Investment', component: SIPCalculator, description: 'Projects how much money will accumulate over time.' },
    { id: 'simple-interest-calculator', name: 'Simple Interest Calculator', category: 'Investment', component: SimpleInterestCalculator, description: 'Calculates interest on the principal only.' },
    { id: 'cd-calculator', name: 'CD Calculator', category: 'Investment', component: FDCalculator, description: 'Calculates interest earned on a Certificate of Deposit.' },
    { id: 'bond-calculator', name: 'Bond Calculator', category: 'Investment', component: BondCalculator, description: 'Calculates the current yield of a bond.' },
    { id: 'average-return-calculator', name: 'Average Return Calculator', category: 'Investment', component: CAGRCalculator, description: 'Computes the average rate of return.' },
    { id: 'irr-calculator', name: 'IRR Calculator', category: 'Investment', component: XIRRCalculator, description: 'Calculates the Internal Rate of Return for cash flows.' },
    { id: 'roi-calculator', name: 'ROI Calculator', category: 'Investment', component: ROICalculator, description: 'Calculates the Return on Investment.' },
    { id: 'payback-period-calculator', name: 'Payback Period Calculator', category: 'Investment', component: PaybackPeriodCalculator, description: 'Determines the time to recover investment cost.' },
    { id: 'present-value-calculator', name: 'Present Value Calculator', category: 'Investment', component: PresentValueCalculator, description: 'Calculates the current value of a future sum.' },
    { id: 'future-value-calculator', name: 'Future Value Calculator', category: 'Investment', component: FutureValueCalculator, description: 'Calculates the value of an asset in the future.' },
    { id: 'retirement-calculator', name: 'Retirement Calculator', category: 'Retirement', component: RetirementCalculator, description: 'Estimates how much money is needed for retirement.' },
    { id: '401k-calculator', name: '401K Calculator', category: 'Retirement', component: SIPCalculator, description: 'Projects the future value of a 401(k) plan.' },
    { id: 'pension-calculator', name: 'Pension Calculator', category: 'Retirement', component: PensionCalculator, description: 'Estimates expected pension payouts.' },
    { id: 'annuity-calculator', name: 'Annuity Calculator', category: 'Retirement', component: AnnuityCalculator, description: 'Calculates payments or future value of an annuity.' },
    { id: 'take-home-paycheck-calculator', name: 'Take-Home-Paycheck Calculator', category: 'Tax and Salary', component: SalaryCalculator, description: 'Calculates net pay from gross salary.' },
    { id: 'salary-calculator', name: 'Salary Calculator', category: 'Tax and Salary', component: SalaryCalculator, description: 'Converts hourly wage to annual salary and estimates net pay.' },
    { id: 'sales-tax-calculator', name: 'Sales Tax Calculator', category: 'Other', component: SalesTaxCalculator, description: 'Calculates sales tax amount and total price.' },
    { id: 'credit-card-calculator', name: 'Credit Card Calculator', category: 'Other', component: CreditCardPayoffCalculator, description: 'Estimates time to pay off a credit card balance.' },
    { id: 'credit-cards-payoff-calculator', name: 'Credit Cards Payoff Calculator', category: 'Other', component: CreditCardPayoffCalculator, description: 'Provides a plan for paying off credit cards.' },
    { id: 'debt-payoff-calculator', name: 'Debt Payoff Calculator', category: 'Other', component: DebtPayoffCalculator, description: 'Helps create a strategy to pay off multiple debts.' },
    { id: 'debt-consolidation-calculator', name: 'Debt Consolidation Calculator', category: 'Other', component: DebtConsolidationCalculator, description: 'Determines if consolidating debts is beneficial.' },
    { id: 'student-loan-calculator', name: 'Student Loan Calculator', category: 'Other', component: EMICalculator, description: 'Calculates monthly payments for student loans.' },
    { id: 'college-cost-calculator', name: 'College Cost Calculator', category: 'Other', component: CollegeCostCalculator, description: 'Estimates the total cost of attending college.' },
    { id: 'vat-calculator', name: 'VAT Calculator', category: 'Other', component: GSTCalculator, description: 'Calculates Value-Added Tax.' },
    { id: 'depreciation-calculator', name: 'Depreciation Calculator', category: 'Other', component: DepreciationCalculator, description: 'Calculates the loss in value of an asset over time.' },
    { id: 'margin-calculator', name: 'Margin Calculator', category: 'Other', component: BusinessMarginCalculator, description: 'Calculates the profit margin on a product or service.' },
    { id: 'business-loan-calculator', name: 'Business Loan Calculator', category: 'Other', component: EMICalculator, description: 'Estimates payments for a business loan.' },
    { id: 'personal-loan-calculator', name: 'Personal Loan Calculator', category: 'Other', component: EMICalculator, description: 'Calculates payments for a personal loan.' },
    { id: 'boat-loan-calculator', name: 'Boat Loan Calculator', category: 'Other', component: EMICalculator, description: 'Calculates payments for a boat loan.' },
    { id: 'lease-calculator', name: 'Lease Calculator', category: 'Other', component: AutoLeaseCalculator, description: 'Calculates payments for leasing an asset.' },
    { id: 'budget-calculator', name: 'Budget Calculator', category: 'Other', component: BudgetCalculator, description: 'Helps track income and expenses.' },
    { id: 'commission-calculator', name: 'Commission Calculator', category: 'Other', component: CommissionCalculator, description: 'Calculates commission earned based on sales.' },
];


// --- MAIN FINANCIAL CALCULATORS HUB COMPONENT ---
const FinancialCalculators: React.FC = () => {
    const [selectedCalculatorId, setSelectedCalculatorId] = useState<string>('sip');
    const [searchTerm, setSearchTerm] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const categories = useMemo(() => {
        const categoryOrder = [ 'Investment / SIP / Mutual Fund', 'Bank / Government Schemes / Savings', 'Loan / EMI / Mortgage', 'Mortgage', 'Auto', 'Investment', 'Retirement', 'Tax and Salary', 'Taxes / Payroll / Allowances', 'Inflation / Retirement / Financial Planning', 'Tax/GST / Business', 'Payroll-like / Employee benefits', 'Savings & Fixed Deposits', 'Specific Calculators / Utility', 'Other' ];
        const grouped: { [key: string]: Calculator[] } = {};
        calculators.forEach(calc => {
            if (!grouped[calc.category]) grouped[calc.category] = [];
            grouped[calc.category].push(calc);
        });
        return categoryOrder.filter(key => grouped[key]).map(key => ({ name: key, calculators: grouped[key] }));
    }, []);

    const filteredCalculators = useMemo(() => 
        calculators.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.description.toLowerCase().includes(searchTerm.toLowerCase())), 
    [searchTerm]);

    const SelectedComponent = useMemo(() => 
        calculators.find(c => c.id === selectedCalculatorId)?.component || (() => <div>Calculator not found</div>),
    [selectedCalculatorId]);
    
    const handleSelect = (id: string) => {
        setSelectedCalculatorId(id);
        setIsSidebarOpen(false); // Close sidebar on mobile after selection
    };

    const SidebarContent = () => (
        <>
            <div className="p-4 border-b dark:border-slate-700">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon className="h-4 w-4 text-slate-400" /></div>
                    <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search calculators..." className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                </div>
            </div>
            <nav className="flex-1 overflow-y-auto p-2">
                {searchTerm ? (
                    <ul>
                        {filteredCalculators.map(calc => (
                            <li key={calc.id}><button onClick={() => handleSelect(calc.id)} className={`w-full text-left flex items-center px-2 py-2 text-sm rounded-md group ${selectedCalculatorId === calc.id ? 'bg-[var(--theme-primary-light)] text-[var(--theme-primary)] dark:bg-sky-900/50 dark:text-sky-300' : 'text-gray-600 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700'}`}> <FinanceIcon className="w-4 h-4 mr-2" /> {calc.name}</button></li>
                        ))}
                    </ul>
                ) : (
                    categories.map(category => (
                        <div key={category.name} className="mb-4">
                            <h3 className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">{category.name}</h3>
                            <ul className="mt-1">
                                {category.calculators.map(calc => (
                                     <li key={calc.id}><button onClick={() => handleSelect(calc.id)} className={`w-full text-left flex items-center px-2 py-2 text-sm rounded-md group ${selectedCalculatorId === calc.id ? 'bg-[var(--theme-primary-light)] text-[var(--theme-primary)] dark:bg-sky-900/50 dark:text-sky-300' : 'text-gray-600 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700'}`}>{calc.name}</button></li>
                                ))}
                            </ul>
                        </div>
                    ))
                )}
            </nav>
        </>
    );

    return (
        <div className="flex flex-col -m-6 lg:-m-10 h-full">
            {/* Mobile Header */}
            <header className="lg:hidden flex items-center justify-between p-4 border-b dark:border-slate-700 bg-white dark:bg-slate-800 flex-shrink-0">
                <h2 className="text-lg font-bold">{calculators.find(c => c.id === selectedCalculatorId)?.name || 'Calculators'}</h2>
                <button onClick={() => setIsSidebarOpen(true)} className="p-1">
                    <MenuIcon className="w-6 h-6" />
                </button>
            </header>
            
            <div className="flex flex-1 overflow-hidden">
                {/* Desktop Sidebar */}
                <aside className="w-72 bg-white border-r border-slate-200 flex-shrink-0 flex-col dark:bg-slate-800 dark:border-slate-700 hidden lg:flex">
                    <SidebarContent />
                </aside>
                
                {/* Mobile Sidebar (Drawer) */}
                <div className={`lg:hidden fixed inset-0 z-40 transition-transform transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <aside className="w-72 bg-white h-full flex flex-col dark:bg-slate-800 border-r dark:border-slate-700">
                        <div className="p-4 flex justify-between items-center border-b dark:border-slate-700 flex-shrink-0">
                            <h3 className="font-bold">Select Calculator</h3>
                            <button onClick={() => setIsSidebarOpen(false)} className="p-1">
                                <XIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <SidebarContent />
                    </aside>
                </div>
                {isSidebarOpen && <div className="lg:hidden fixed inset-0 bg-black/60 z-30" onClick={() => setIsSidebarOpen(false)}></div>}

                {/* Main Content */}
                <main className="flex-1 p-6 lg:p-10 overflow-y-auto bg-slate-50 dark:bg-slate-900">
                    <SelectedComponent />
                </main>
            </div>
        </div>
    );
};

export default FinancialCalculators;