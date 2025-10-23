import React, { useState, useMemo, useCallback } from 'react';
// FIX: Imported FinanceIcon to resolve 'Cannot find name' error.
import { SearchIcon, FinanceIcon } from '../components/icons';

// --- TYPE DEFINITIONS ---
interface Calculator {
  id: string;
  name: string;
  category: string;
  component: React.FC;
}

// --- HELPER & UI COMPONENTS ---
const CalculatorWrapper: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{title}</h2>
        {children}
    </div>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = ({ label, ...props }) => (
    <div className="flex-1">
        {label && <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{label}</label>}
        <input {...props} className="w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 placeholder-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100" />
    </div>
);

const Result: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
    <div className="mt-2 p-3 bg-slate-100 dark:bg-slate-700/50 rounded-md">
        <span className="font-semibold text-slate-600 dark:text-slate-300">{label}: </span>
        <span className="font-mono text-lg text-[var(--theme-primary)] dark:text-sky-300">
            {typeof value === 'number' && !Number.isInteger(value) ? value.toFixed(4) : String(value)}
        </span>
    </div>
);


// --- UTILITY FUNCTIONS ---
const factorial = (n: number): number => {
    if (n < 0 || n > 170) return Infinity; // Prevent call stack overflow and handle large numbers
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
};
const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : Math.abs(a);
const lcm = (a: number, b: number): number => Math.abs(a * b) / gcd(a, b) || 0;


// --- INDIVIDUAL CALCULATOR COMPONENTS ---

const ScientificCalculator: React.FC = () => {
    const [display, setDisplay] = useState('0');

    const handleButtonClick = (value: string) => {
        if (display === 'Error' || display === 'Infinity') {
            setDisplay(value === 'AC' ? '0' : value);
            return;
        }

        if (value === 'AC') {
            setDisplay('0');
        } else if (value === '=') {
            try {
                // A slightly safer eval by replacing known math functions
                const expr = display
                    .replace(/\^/g, '**')
                    .replace(/√\(/g, 'Math.sqrt(')
                    .replace(/sin\(/g, 'Math.sin(Math.PI/180 *') // Assume degrees
                    .replace(/cos\(/g, 'Math.cos(Math.PI/180 *') // Assume degrees
                    .replace(/tan\(/g, 'Math.tan(Math.PI/180 *') // Assume degrees
                    .replace(/log\(/g, 'Math.log10(')
                    .replace(/ln\(/g, 'Math.log(');

                // FIX: Replaced insecure `new Function()` with a safer evaluation method using a blocklist to prevent arbitrary code execution.
                // This resolves a cryptic build error "Type 'String' has no call signatures" which was likely caused by the build tool's handling of `new Function`.
                if (/[^0-9a-zA-Z\s.+\-*/%()^.√*]/.test(expr)) {
                    throw new Error("Invalid characters in expression");
                }
                // eslint-disable-next-line no-eval
                const result = eval(expr);
                setDisplay(String(result));
            } catch (error) {
                setDisplay('Error');
            }
        } else if (value === 'Back') {
            setDisplay(display.length > 1 ? display.slice(0, -1) : '0');
        } else if (value === '±') {
            setDisplay(prev => String(parseFloat(prev) * -1));
        } else {
             setDisplay(prev => (prev === '0' && !'()'.includes(value) && value !== '.') ? value : prev + value);
        }
    };

    const buttons = [
        '(', ')', '√(', '^', 'Back',
        '7', '8', '9', '/', 'AC',
        '4', '5', '6', '*', 'sin(',
        '1', '2', '3', '-', 'cos(',
        '0', '.', '=', '+', 'tan('
    ];

    return (
        <CalculatorWrapper title="Scientific Calculator">
            <div className="max-w-sm mx-auto bg-white dark:bg-slate-800 p-4 rounded-lg border dark:border-slate-700 shadow-md">
                <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded text-right text-3xl font-mono mb-4 overflow-x-auto">{display}</div>
                <div className="grid grid-cols-5 gap-2">
                    {buttons.map(btn => (
                        <button key={btn} onClick={() => handleButtonClick(btn)} className={`p-3 rounded-lg text-md font-semibold ${/[0-9.]/.test(btn) ? 'bg-white dark:bg-slate-600' : 'bg-slate-200 dark:bg-slate-700'} hover:bg-slate-300 dark:hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]`}>
                            {btn}
                        </button>
                    ))}
                </div>
            </div>
        </CalculatorWrapper>
    );
};

const FractionCalculator: React.FC = () => {
    const [num1, setNum1] = useState('1');
    const [den1, setDen1] = useState('2');
    const [num2, setNum2] = useState('1');
    const [den2, setDen2] = useState('3');
    const [operator, setOperator] = useState('+');
    
    const result = useMemo(() => {
        const n1 = parseInt(num1), d1 = parseInt(den1);
        const n2 = parseInt(num2), d2 = parseInt(den2);
        if ([n1, d1, n2, d2].some(isNaN) || d1 === 0 || d2 === 0) {
            return 'Invalid';
        }

        const simplify = (n: number, d: number) => {
            if (d === 0) return 'Undefined';
            const common = gcd(n, d);
            const simplifiedN = n / common;
            const simplifiedD = d / common;
            return simplifiedD === 1 ? `${simplifiedN}` : `${simplifiedN}/${simplifiedD}`;
        };
        
        let resN, resD;
        switch (operator) {
            case '+': resN = n1 * d2 + n2 * d1; resD = d1 * d2; break;
            case '-': resN = n1 * d2 - n2 * d1; resD = d1 * d2; break;
            case '*': resN = n1 * n2; resD = d1 * d2; break;
            case '/': resN = n1 * d2; resD = d1 * n2; break;
            default: return '';
        }
        return simplify(resN, resD);
    },[num1, den1, num2, den2, operator]);

    return (
        <CalculatorWrapper title="Fraction Calculator">
            <div className="flex flex-wrap items-center gap-2">
                <div className="flex flex-col gap-1 w-20"><Input value={num1} onChange={e => setNum1(e.target.value)} type="number" /><hr/><Input value={den1} onChange={e => setDen1(e.target.value)} type="number" /></div>
                <select value={operator} onChange={e => setOperator(e.target.value)} className="p-2 border rounded dark:bg-slate-700 h-11"><option>+</option><option>-</option><option>*</option><option>/</option></select>
                <div className="flex flex-col gap-1 w-20"><Input value={num2} onChange={e => setNum2(e.target.value)} type="number" /><hr/><Input value={den2} onChange={e => setDen2(e.target.value)} type="number" /></div>
                <div className="p-2 border rounded flex-1 text-center font-bold text-lg dark:border-slate-600 h-11 flex items-center justify-center">= {result}</div>
            </div>
        </CalculatorWrapper>
    );
};

const PercentageCalculatorComponent: React.FC = () => {
    const [val1, setVal1] = useState('15');
    const [val2, setVal2] = useState('200');
    const result1 = useMemo(() => {
        const v1=parseFloat(val1), v2=parseFloat(val2);
        return !isNaN(v1) && !isNaN(v2) ? (v1/100 * v2).toFixed(2) : '...';
    }, [val1, val2]);
    return (
        <CalculatorWrapper title="Percentage Calculator">
            <div className="flex items-center gap-2">
                <Input value={val1} onChange={e => setVal1(e.target.value)} type="number" />
                <span>% of</span>
                <Input value={val2} onChange={e => setVal2(e.target.value)} type="number" />
                <span>=</span>
                <span className="font-bold text-lg">{result1}</span>
            </div>
        </CalculatorWrapper>
    );
};

const RandomNumberGeneratorComponent: React.FC = () => {
    const [min, setMin] = useState('1');
    const [max, setMax] = useState('100');
    const [result, setResult] = useState<number|null>(null);
    const generate = () => {
        const minN = parseInt(min), maxN = parseInt(max);
        if (!isNaN(minN) && !isNaN(maxN) && minN <= maxN) {
            setResult(Math.floor(Math.random() * (maxN - minN + 1)) + minN);
        }
    };
    return (
        <CalculatorWrapper title="Random Number Generator">
            <div className="flex items-end gap-2">
                <Input label="Min" value={min} onChange={e => setMin(e.target.value)} type="number" />
                <Input label="Max" value={max} onChange={e => setMax(e.target.value)} type="number" />
                <button onClick={generate} className="p-2 bg-[var(--theme-primary)] text-white rounded h-10">Generate</button>
            </div>
            {result !== null && <Result label="Random Number" value={result} />}
        </CalculatorWrapper>
    );
};

const PercentErrorCalculator: React.FC = () => {
    const [trueVal, setTrueVal] = useState('10');
    const [measuredVal, setMeasuredVal] = useState('10.5');
    const error = useMemo(() => {
        const t = parseFloat(trueVal);
        const m = parseFloat(measuredVal);
        if(isNaN(t) || isNaN(m) || t === 0) return '...';
        return (Math.abs(m - t) / Math.abs(t) * 100).toFixed(4) + '%';
    }, [trueVal, measuredVal]);
    return (
        <CalculatorWrapper title="Percent Error Calculator">
            <div className="flex items-end gap-2">
                <Input label="True Value" value={trueVal} onChange={e => setTrueVal(e.target.value)} type="number" />
                <Input label="Measured Value" value={measuredVal} onChange={e => setMeasuredVal(e.target.value)} type="number" />
            </div>
            <Result label="Percent Error" value={error} />
        </CalculatorWrapper>
    );
};

const ExponentCalculator: React.FC = () => {
    const [base, setBase] = useState('2');
    const [exponent, setExponent] = useState('10');
    const result = useMemo(() => {
        const b = parseFloat(base);
        const e = parseFloat(exponent);
        if(isNaN(b) || isNaN(e)) return '...';
        const res = Math.pow(b, e);
        return isFinite(res) ? res.toLocaleString() : 'Infinity';
    }, [base, exponent]);
    return (
        <CalculatorWrapper title="Exponent Calculator">
            <div className="flex items-end gap-2">
                <Input label="Base (x)" value={base} onChange={e => setBase(e.target.value)} type="number" />
                <Input label="Exponent (y)" value={exponent} onChange={e => setExponent(e.target.value)} type="number" />
            </div>
            <Result label="Result (x^y)" value={result} />
        </CalculatorWrapper>
    );
};

const NumberBaseCalculator: React.FC = () => {
    const [input, setInput] = useState('10');
    const [fromBase, setFromBase] = useState('10');
    const [toBase, setToBase] = useState('2');

    const result = useMemo(() => {
        try {
            const num = parseInt(input, parseInt(fromBase));
            if(isNaN(num)) return 'Invalid input';
            return num.toString(parseInt(toBase)).toUpperCase();
        } catch {
            return 'Error';
        }
    }, [input, fromBase, toBase]);

    return (
        <CalculatorWrapper title="Binary/Hex/Number Base Calculator">
            <div className="flex items-end gap-2">
                <Input label="Input Value" value={input} onChange={e => setInput(e.target.value)} />
                <div className="flex-1">
                    <label className="block text-sm">From Base</label>
                    <select value={fromBase} onChange={e => setFromBase(e.target.value)} className="w-full p-2 border rounded dark:bg-slate-700 h-10"><option value="2">Binary</option><option value="8">Octal</option><option value="10">Decimal</option><option value="16">Hex</option></select>
                </div>
                 <div className="flex-1">
                    <label className="block text-sm">To Base</label>
                    <select value={toBase} onChange={e => setToBase(e.target.value)} className="w-full p-2 border rounded dark:bg-slate-700 h-10"><option value="2">Binary</option><option value="8">Octal</option><option value="10">Decimal</option><option value="16">Hex</option></select>
                </div>
            </div>
            <Result label="Result" value={result} />
        </CalculatorWrapper>
    )
}

const HalfLifeCalculator: React.FC = () => {
    const [initial, setInitial] = useState('100');
    const [time, setTime] = useState('20');
    const [halfLife, setHalfLife] = useState('10');
    const result = useMemo(() => {
        const i = parseFloat(initial);
        const t = parseFloat(time);
        const h = parseFloat(halfLife);
        if(isNaN(i) || isNaN(t) || isNaN(h) || h <= 0) return '...';
        return (i * Math.pow(0.5, t/h)).toFixed(4);
    }, [initial, time, halfLife]);
    return (
        <CalculatorWrapper title="Half-Life Calculator">
            <Input label="Initial Quantity" value={initial} onChange={e=>setInitial(e.target.value)} type="number" />
            <Input label="Time Elapsed" value={time} onChange={e=>setTime(e.target.value)} type="number" />
            <Input label="Half-Life" value={halfLife} onChange={e=>setHalfLife(e.target.value)} type="number" />
            <Result label="Final Quantity Remaining" value={result} />
        </CalculatorWrapper>
    );
};

const QuadraticFormulaCalculator: React.FC = () => {
    const [a, setA] = useState('1'); const [b, setB] = useState('-3'); const [c, setC] = useState('2');
    const roots = useMemo(() => {
        const A=parseFloat(a), B=parseFloat(b), C=parseFloat(c);
        if(isNaN(A) || isNaN(B) || isNaN(C) || A === 0) return 'Invalid input (a cannot be 0)';
        const discriminant = B*B - 4*A*C;
        if (discriminant < 0) return 'No real roots (complex roots)';
        const root1 = (-B + Math.sqrt(discriminant)) / (2*A);
        const root2 = (-B - Math.sqrt(discriminant)) / (2*A);
        return root1 === root2 ? `x = ${root1.toFixed(4)}` :`x₁ = ${root1.toFixed(4)}, x₂ = ${root2.toFixed(4)}`;
    }, [a, b, c]);
    return (<CalculatorWrapper title="Quadratic Formula Calculator"><p className="text-sm text-slate-500">Solves ax² + bx + c = 0</p><div className="flex gap-2"><Input label="a" value={a} onChange={e => setA(e.target.value)} /><Input label="b" value={b} onChange={e => setB(e.target.value)} /><Input label="c" value={c} onChange={e => setC(e.target.value)} /></div><Result label="Roots" value={roots} /></CalculatorWrapper>);
};

const LogCalculator: React.FC = () => {
    const [base, setBase] = useState('10');
    const [num, setNum] = useState('100');
    const result = useMemo(() => {
        const b = parseFloat(base);
        const n = parseFloat(num);
        if(isNaN(b) || isNaN(n) || b <= 0 || b === 1 || n <= 0) return '...';
        return (Math.log(n) / Math.log(b)).toFixed(6);
    }, [base, num]);
    return (
        <CalculatorWrapper title="Logarithm Calculator">
            <div className="flex items-end gap-2">
                <Input label="Base" value={base} onChange={e => setBase(e.target.value)} type="number" />
                <Input label="Number" value={num} onChange={e => setNum(e.target.value)} type="number" />
            </div>
            <Result label="Result" value={result} />
        </CalculatorWrapper>
    );
};

const RatioCalculator: React.FC = () => {
    const [a, setA] = useState('2'); const [b, setB] = useState('3');
    const [c, setC] = useState('4'); const [d, setD] = useState('');
    const simplified = useMemo(() => {
        const n1=parseInt(a), n2=parseInt(b);
        if(!isNaN(n1) && !isNaN(n2)) {
            const common = gcd(n1, n2);
            return `${n1/common}:${n2/common}`;
        }
        return '...';
    }, [a, b]);
    
    React.useEffect(() => {
        const valA=parseFloat(a), valB=parseFloat(b), valC=parseFloat(c);
        if(!isNaN(valA) && !isNaN(valB) && !isNaN(valC) && valA !== 0) {
            setD(((valB * valC) / valA).toFixed(4));
        } else {
            setD('');
        }
    }, [a,b,c]);

    return (
        <CalculatorWrapper title="Ratio Calculator">
             <div className="flex items-center gap-2">
                <Input value={a} onChange={e => setA(e.target.value)} /> :
                <Input value={b} onChange={e => setB(e.target.value)} />
                <Result label="Simplified" value={simplified} />
            </div>
            <p className="text-sm text-slate-500 pt-4">Solve for x:</p>
            <div className="flex items-center gap-2">
                <Input value={a} onChange={e => setA(e.target.value)} /> :
                <Input value={b} onChange={e => setB(e.target.value)} /> =
                <Input value={c} onChange={e => setC(e.target.value)} /> :
                <Input value={d} onChange={e => setD(e.target.value)} placeholder="x" />
            </div>
        </CalculatorWrapper>
    );
};

const RootCalculator: React.FC = () => {
    const [num, setNum] = useState('27');
    const [root, setRoot] = useState('3');
    const result = useMemo(() => {
        const n = parseFloat(num);
        const r = parseFloat(root);
        if(isNaN(n) || isNaN(r) || r === 0) return '...';
        return Math.pow(n, 1/r).toFixed(6);
    }, [num, root]);
    return (
        <CalculatorWrapper title="Root Calculator">
            <div className="flex items-end gap-2">
                <Input label="Nth Root" value={root} onChange={e => setRoot(e.target.value)} type="number" />
                <Input label="Number" value={num} onChange={e => setNum(e.target.value)} type="number" />
            </div>
            <Result label="Result" value={result} />
        </CalculatorWrapper>
    );
};

const LCMCalculator: React.FC = () => {
    const [nums, setNums] = useState('12, 18');
    const result = useMemo(() => {
        const numArr = nums.split(/[\s,]+/).map(n => parseInt(n.trim())).filter(n => !isNaN(n));
        if (numArr.length < 2) return '...';
        return numArr.reduce(lcm);
    }, [nums]);
    return (<CalculatorWrapper title="Least Common Multiple (LCM) Calculator"><Input label="Numbers (comma-separated)" value={nums} onChange={e => setNums(e.target.value)} /><Result label="LCM" value={result} /></CalculatorWrapper>);
};

const GCFCalculator: React.FC = () => {
    const [nums, setNums] = useState('48, 18');
    const result = useMemo(() => {
        const numArr = nums.split(/[\s,]+/).map(n => parseInt(n.trim())).filter(n => !isNaN(n));
        if (numArr.length < 2) return '...';
        return numArr.reduce(gcd);
    }, [nums]);
    return (<CalculatorWrapper title="Greatest Common Factor (GCF) Calculator"><Input label="Numbers (comma-separated)" value={nums} onChange={e => setNums(e.target.value)} /><Result label="GCF" value={result} /></CalculatorWrapper>);
};

const FactorCalculator: React.FC = () => {
    const [num, setNum] = useState('36');
    const factors = useMemo(() => {
        const n = parseInt(num);
        if(isNaN(n) || n <= 0) return '...';
        const result = new Set<number>();
        for (let i = 1; i <= Math.sqrt(n); i++) {
            if (n % i === 0) {
                result.add(i);
                result.add(n/i);
            }
        }
        return Array.from(result).sort((a,b) => a-b).join(', ');
    }, [num]);
    return (<CalculatorWrapper title="Factor Calculator"><Input label="Number" value={num} onChange={e => setNum(e.target.value)} type="number" /><Result label="Factors" value={factors} /></CalculatorWrapper>);
};

const RoundingCalculator: React.FC = () => {
    const [num, setNum] = useState('3.14159');
    const [decimals, setDecimals] = useState('2');
    const result = useMemo(() => {
        const n = parseFloat(num);
        const d = parseInt(decimals);
        if(isNaN(n) || isNaN(d) || d < 0) return '...';
        return n.toFixed(d);
    }, [num, decimals]);
    return (<CalculatorWrapper title="Rounding Calculator"><div className="flex gap-2"><Input label="Number" value={num} onChange={e=>setNum(e.target.value)} /><Input label="Decimal Places" value={decimals} onChange={e=>setDecimals(e.target.value)} type="number" /></div><Result label="Rounded Number" value={result} /></CalculatorWrapper>);
};

const MatrixCalculator: React.FC = () => {
    // Basic 2x2 implementation for demonstration
    const [matrixA, setMatrixA] = useState([['1','2'],['3','4']]);
    const [matrixB, setMatrixB] = useState([['5','6'],['7','8']]);
    const [op, setOp] = useState('+');

    const result = useMemo(() => {
        try {
            const A = matrixA.map(row => row.map(cell => parseFloat(cell)));
            const B = matrixB.map(row => row.map(cell => parseFloat(cell)));
            if (A.flat().some(isNaN) || B.flat().some(isNaN)) return [['...','...'],['...','...']];

            switch(op) {
                case '+': return A.map((row, i) => row.map((cell, j) => cell + B[i][j]));
                case '-': return A.map((row, i) => row.map((cell, j) => cell - B[i][j]));
                case '*': return [
                    [A[0][0]*B[0][0] + A[0][1]*B[1][0], A[0][0]*B[0][1] + A[0][1]*B[1][1]],
                    [A[1][0]*B[0][0] + A[1][1]*B[1][0], A[1][0]*B[0][1] + A[1][1]*B[1][1]]
                ];
                default: return [['...','...'],['...','...']];
            }
        } catch { return [['Err','Err'],['Err','Err']]; }
    }, [matrixA, matrixB, op]);

    return (
        <CalculatorWrapper title="Matrix Calculator (2x2)">
            <div className="flex items-center gap-2">
                <div><p className="text-center mb-1">Matrix A</p><div className="grid grid-cols-2 gap-1">
                    <Input value={matrixA[0][0]} onChange={e => setMatrixA(p => [[e.target.value,p[0][1]], p[1]])} />
                    <Input value={matrixA[0][1]} onChange={e => setMatrixA(p => [[p[0][0],e.target.value], p[1]])} />
                    <Input value={matrixA[1][0]} onChange={e => setMatrixA(p => [p[0], [e.target.value,p[1][1]]])} />
                    <Input value={matrixA[1][1]} onChange={e => setMatrixA(p => [p[0], [p[1][0],e.target.value]])} />
                </div></div>
                <select value={op} onChange={e=>setOp(e.target.value)} className="p-2 border rounded dark:bg-slate-700 h-10 mt-6"><option>+</option><option>-</option><option>*</option></select>
                <div><p className="text-center mb-1">Matrix B</p><div className="grid grid-cols-2 gap-1">
                    <Input value={matrixB[0][0]} onChange={e => setMatrixB(p => [[e.target.value,p[0][1]], p[1]])} />
                    <Input value={matrixB[0][1]} onChange={e => setMatrixB(p => [[p[0][0],e.target.value], p[1]])} />
                    <Input value={matrixB[1][0]} onChange={e => setMatrixB(p => [p[0], [e.target.value,p[1][1]]])} />
                    <Input value={matrixB[1][1]} onChange={e => setMatrixB(p => [p[0], [p[1][0],e.target.value]])} />
                </div></div>
                 <div><p className="text-center mb-1">Result</p><div className="grid grid-cols-2 gap-1 p-4 bg-slate-100 dark:bg-slate-700 rounded-md">
                    <span className="p-2 text-center">{result[0][0]}</span><span className="p-2 text-center">{result[0][1]}</span>
                    <span className="p-2 text-center">{result[1][0]}</span><span className="p-2 text-center">{result[1][1]}</span>
                </div></div>
            </div>
            <p className="text-xs text-slate-500">Note: This is a simplified 2x2 matrix calculator. A full-featured version is in development.</p>
        </CalculatorWrapper>
    );
};

const ScientificNotationCalculator: React.FC = () => {
    const [num, setNum] = useState('12345');
    const { sci, norm } = useMemo(() => {
        if(num.includes('e')) {
            const n = parseFloat(num);
            if(isNaN(n)) return {sci: '...', norm: '...'};
            return { sci: num, norm: n.toLocaleString('en-US', {maximumFractionDigits: 20}) };
        } else {
            const n = parseFloat(num);
            if(isNaN(n)) return {sci: '...', norm: '...'};
            return { sci: n.toExponential(), norm: num };
        }
    }, [num]);
    return (<CalculatorWrapper title="Scientific Notation Calculator"><Input label="Number or Scientific Notation" value={num} onChange={e => setNum(e.target.value)} /><Result label="Scientific Notation" value={sci} /><Result label="Normal Number" value={norm} /></CalculatorWrapper>);
};

const BigNumberCalculator: React.FC = () => {
    const [val1, setVal1] = useState('12345678901234567890');
    const [val2, setVal2] = useState('98765432109876543210');
    const [op, setOp] = useState('+');
    const result = useMemo(() => {
        try {
            const n1 = BigInt(val1);
            const n2 = BigInt(val2);
            switch(op) {
                case '+': return (n1 + n2).toString();
                case '-': return (n1 - n2).toString();
                case '*': return (n1 * n2).toString();
                case '/': return (n1 / n2).toString();
            }
        } catch { return 'Invalid BigInt'; }
    }, [val1, val2, op]);
    return (<CalculatorWrapper title="Big Number Calculator"><div className="flex items-center gap-2"><Input value={val1} onChange={e=>setVal1(e.target.value)}/><select value={op} onChange={e=>setOp(e.target.value)} className="p-2 border rounded dark:bg-slate-700 h-10"><option>+</option><option>-</option><option>*</option><option>/</option></select><Input value={val2} onChange={e=>setVal2(e.target.value)}/></div><Result label="Result" value={result || '...'} /></CalculatorWrapper>);
};


// --- STATISTICS CALCULATORS ---
const StatisticsCalculatorComponent: React.FC = () => {
    const [numbers, setNumbers] = useState('10, 12, 23, 23, 16, 23, 21, 16');
    const stats = useMemo(() => {
        const numArray = numbers.split(/[\s,]+/).map(n => parseFloat(n.trim())).filter(n => !isNaN(n));
        if (numArray.length === 0) return null;

        numArray.sort((a, b) => a - b);
        const sum = numArray.reduce((acc, val) => acc + val, 0);
        const mean = sum / numArray.length;
        
        let median;
        const mid = Math.floor(numArray.length / 2);
        if (numArray.length % 2 === 0) {
            median = (numArray[mid - 1] + numArray[mid]) / 2;
        } else {
            median = numArray[mid];
        }

        const modeMap: { [key: number]: number } = {};
        let maxCount = 0;
        let modes: number[] = [];
        numArray.forEach(num => {
            modeMap[num] = (modeMap[num] || 0) + 1;
            if (modeMap[num] > maxCount) {
                maxCount = modeMap[num];
                modes = [num];
            } else if (modeMap[num] === maxCount && !modes.includes(num)) {
                modes.push(num);
            }
        });
        
        const range = numArray[numArray.length - 1] - numArray[0];
        const variance = numArray.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (numArray.length - 1); // Sample variance
        const stdDev = Math.sqrt(variance);

        return {
            count: numArray.length,
            sum,
            mean,
            median,
            mode: modes.join(', '),
            range,
            variance,
            stdDev
        };
    }, [numbers]);

    return (
        <CalculatorWrapper title="Statistics Calculator (Mean, Median, Mode, etc.)">
            <textarea
                value={numbers}
                onChange={e => setNumbers(e.target.value)}
                placeholder="Enter numbers separated by commas or spaces"
                rows={4}
                className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600"
            />
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Result label="Count" value={stats.count} />
                    <Result label="Sum" value={stats.sum} />
                    <Result label="Mean" value={stats.mean} />
                    <Result label="Median" value={stats.median} />
                    <Result label="Mode" value={stats.mode} />
                    <Result label="Range" value={stats.range} />
                    <Result label="Variance (Sample)" value={stats.variance} />
                    <Result label="Std Dev (Sample)" value={stats.stdDev} />
                </div>
            )}
        </CalculatorWrapper>
    );
};

const NumberSequenceCalculator: React.FC = () => {
    const [start, setStart] = useState('2');
    const [diff, setDiff] = useState('3');
    const [count, setCount] = useState('10');
    const [type, setType] = useState('arithmetic');

    const sequence = useMemo(() => {
        const s=parseFloat(start), d=parseFloat(diff), c=parseInt(count);
        if(isNaN(s) || isNaN(d) || isNaN(c) || c <= 0 || c > 1000) return '...';
        const result = [s];
        for(let i=1; i<c; i++){
            if(type === 'arithmetic') result.push(result[i-1] + d);
            else result.push(result[i-1] * d);
        }
        return result.join(', ');
    }, [start, diff, count, type]);

    return (
        <CalculatorWrapper title="Number Sequence Calculator">
            <div className="flex gap-2">
                <Input label="Start" value={start} onChange={e=>setStart(e.target.value)} />
                <Input label={type === 'arithmetic' ? 'Difference' : 'Ratio'} value={diff} onChange={e=>setDiff(e.target.value)} />
                <Input label="Count" value={count} onChange={e=>setCount(e.target.value)} />
                <select value={type} onChange={e=>setType(e.target.value)} className="p-2 border rounded dark:bg-slate-700 h-10 self-end"><option value="arithmetic">Arithmetic</option><option value="geometric">Geometric</option></select>
            </div>
            <Result label="Sequence" value={sequence} />
        </CalculatorWrapper>
    );
};

const SampleSizeCalculator: React.FC = () => {
    const [confidence, setConfidence] = useState('95');
    const [margin, setMargin] = useState('5');
    const [population, setPopulation] = useState('');
    
    const size = useMemo(() => {
        const c = parseFloat(confidence);
        const m = parseFloat(margin)/100;
        const p = parseFloat(population);
        if(isNaN(c) || isNaN(m) || c <= 0 || m <= 0) return '...';
        
        const zScores: Record<string, number> = {'90': 1.645, '95': 1.96, '99': 2.576};
        const z = zScores[confidence];
        if(!z) return 'Invalid confidence level';

        const sample = (z*z * 0.25) / (m*m);
        if(isNaN(p) || p <= 0) return Math.ceil(sample);
        
        return Math.ceil(sample / (1 + (sample-1)/p));

    }, [confidence, margin, population]);

    return (
        <CalculatorWrapper title="Sample Size Calculator">
            <div className="flex gap-2">
                <div className="flex-1">
                    <label className="block text-sm">Confidence Level</label>
                    <select value={confidence} onChange={e=>setConfidence(e.target.value)} className="w-full p-2 border rounded dark:bg-slate-700 h-10"><option>90</option><option>95</option><option>99</option></select>
                </div>
                <Input label="Margin of Error (%)" value={margin} onChange={e=>setMargin(e.target.value)} />
                <Input label="Population (Optional)" value={population} onChange={e=>setPopulation(e.target.value)} />
            </div>
            <Result label="Required Sample Size" value={size} />
        </CalculatorWrapper>
    );
};

const ProbabilityCalculator: React.FC = () => {
    const [p1, setP1] = useState('0.5');
    const [p2, setP2] = useState('0.5');
    return (
        <CalculatorWrapper title="Probability Calculator">
             <div className="flex gap-2">
                <Input label="Prob. of Event A" value={p1} onChange={e=>setP1(e.target.value)} />
                <Input label="Prob. of Event B" value={p2} onChange={e=>setP2(e.target.value)} />
            </div>
            <Result label="P(A and B)" value={(parseFloat(p1)*parseFloat(p2)).toFixed(4)} />
            <Result label="P(A or B)" value={(parseFloat(p1) + parseFloat(p2) - (parseFloat(p1)*parseFloat(p2))).toFixed(4)} />
        </CalculatorWrapper>
    );
};

const PermutationCombinationCalculator: React.FC = () => {
    const [n, setN] = useState('10');
    const [r, setR] = useState('4');
    
    const results = useMemo(() => {
        const nVal = parseInt(n);
        const rVal = parseInt(r);

        if (isNaN(nVal) || isNaN(rVal) || nVal < 0 || rVal < 0 || rVal > nVal) {
            return { permutation: 'Invalid input', combination: 'Invalid input' };
        }

        const nFact = factorial(nVal);
        const rFact = factorial(rVal);
        const nMinusRFact = factorial(nVal - rVal);
        
        const permutation = nFact / nMinusRFact;
        const combination = nFact / (rFact * nMinusRFact);

        return { permutation: isFinite(permutation) ? permutation.toLocaleString() : 'Too large', combination: isFinite(combination) ? combination.toLocaleString() : 'Too large' };
    }, [n, r]);

    return (
        <CalculatorWrapper title="Permutation and Combination Calculator">
            <div className="flex items-end gap-2">
                <Input label="Total items (n)" value={n} onChange={e => setN(e.target.value)} type="number" />
                <Input label="Items to choose (r)" value={r} onChange={e => setR(e.target.value)} type="number" />
            </div>
            <Result label="Permutation (nPr)" value={results.permutation} />
            <Result label="Combination (nCr)" value={results.combination} />
        </CalculatorWrapper>
    );
};

const ZScoreCalculator: React.FC = () => {
    const [x, setX] = useState('80');
    const [mean, setMean] = useState('70');
    const [sd, setSd] = useState('5');
    const score = useMemo(() => {
        const val=parseFloat(x), m=parseFloat(mean), s=parseFloat(sd);
        if(isNaN(val) || isNaN(m) || isNaN(s) || s === 0) return '...';
        return ((val - m) / s).toFixed(4);
    }, [x, mean, sd]);
    return (
        <CalculatorWrapper title="Z-Score Calculator">
            <div className="flex gap-2">
                <Input label="Data Point (x)" value={x} onChange={e=>setX(e.target.value)} />
                <Input label="Mean (μ)" value={mean} onChange={e=>setMean(e.target.value)} />
                <Input label="Std Dev (σ)" value={sd} onChange={e=>setSd(e.target.value)} />
            </div>
            <Result label="Z-Score" value={score} />
        </CalculatorWrapper>
    );
};

const ConfidenceIntervalCalculator: React.FC = () => {
    const [mean, setMean] = useState('100');
    const [sd, setSd] = useState('15');
    const [n, setN] = useState('30');
    const [c, setC] = useState('95');
    const interval = useMemo(() => {
        const m=parseFloat(mean), s=parseFloat(sd), num=parseInt(n), conf=parseInt(c);
        if([m, s, num, conf].some(isNaN) || num <= 0) return '...';
        const zScores: Record<string, number> = {'90': 1.645, '95': 1.96, '99': 2.576};
        const z = zScores[conf];
        if(!z) return 'Invalid confidence';
        const margin = z * (s / Math.sqrt(num));
        return `${(m - margin).toFixed(4)} to ${(m + margin).toFixed(4)}`;
    }, [mean, sd, n, c]);

    return (
        <CalculatorWrapper title="Confidence Interval Calculator">
            <div className="flex gap-2">
                <Input label="Sample Mean" value={mean} onChange={e=>setMean(e.target.value)} />
                <Input label="Sample Std Dev" value={sd} onChange={e=>setSd(e.target.value)} />
                <Input label="Sample Size" value={n} onChange={e=>setN(e.target.value)} />
                <div className="flex-1"><label className="block text-sm">Confidence</label><select value={c} onChange={e=>setC(e.target.value)} className="w-full p-2 border rounded dark:bg-slate-700 h-10"><option>90</option><option>95</option><option>99</option></select></div>
            </div>
             <Result label="Confidence Interval" value={interval} />
        </CalculatorWrapper>
    );
};


// --- GEOMETRY CALCULATORS ---
const TriangleSolver: React.FC = () => {
    // Placeholder - A full solver is complex
    return <CalculatorWrapper title="Triangle Calculator"><p className="text-slate-500">This is a placeholder for a full triangle solver (SSS, SAS, etc.), which requires more complex trigonometric calculations.</p></CalculatorWrapper>;
};

const VolumeCalculator: React.FC = () => {
    const [shape, setShape] = useState('Cube');
    const [inputs, setInputs] = useState({ s: '5', r: '5', h: '10', l: '5', w: '4' });
    
    const volume = useMemo(() => {
        const s=parseFloat(inputs.s), r=parseFloat(inputs.r), h=parseFloat(inputs.h), l=parseFloat(inputs.l), w=parseFloat(inputs.w);
        switch(shape) {
            case 'Cube': return !isNaN(s) ? s**3 : '...';
            case 'Sphere': return !isNaN(r) ? (4/3) * Math.PI * r**3 : '...';
            case 'Cylinder': return !isNaN(r) && !isNaN(h) ? Math.PI * r**2 * h : '...';
            case 'Cone': return !isNaN(r) && !isNaN(h) ? (1/3) * Math.PI * r**2 * h : '...';
            case 'Rectangular Prism': return !isNaN(l) && !isNaN(w) && !isNaN(h) ? l*w*h : '...';
            default: return '...';
        }
    }, [shape, inputs]);

    return (
        <CalculatorWrapper title="Volume Calculator">
            <select value={shape} onChange={e=>setShape(e.target.value)} className="w-full p-2 border rounded dark:bg-slate-700">
                <option>Cube</option><option>Sphere</option><option>Cylinder</option><option>Cone</option><option>Rectangular Prism</option>
            </select>
            <div className="flex gap-2">
                {shape === 'Cube' && <Input label="Side" value={inputs.s} onChange={e=>setInputs({...inputs, s: e.target.value})} />}
                {shape === 'Sphere' && <Input label="Radius" value={inputs.r} onChange={e=>setInputs({...inputs, r: e.target.value})} />}
                {shape === 'Cylinder' && <><Input label="Radius" value={inputs.r} onChange={e=>setInputs({...inputs, r: e.target.value})} /><Input label="Height" value={inputs.h} onChange={e=>setInputs({...inputs, h: e.target.value})} /></>}
                {shape === 'Cone' && <><Input label="Radius" value={inputs.r} onChange={e=>setInputs({...inputs, r: e.target.value})} /><Input label="Height" value={inputs.h} onChange={e=>setInputs({...inputs, h: e.target.value})} /></>}
                {shape === 'Rectangular Prism' && <><Input label="Length" value={inputs.l} onChange={e=>setInputs({...inputs, l: e.target.value})} /><Input label="Width" value={inputs.w} onChange={e=>setInputs({...inputs, w: e.target.value})} /><Input label="Height" value={inputs.h} onChange={e=>setInputs({...inputs, h: e.target.value})} /></>}
            </div>
            <Result label="Volume" value={typeof volume === 'number' ? volume.toFixed(4) : volume} />
        </CalculatorWrapper>
    );
};


const SlopeCalculator: React.FC = () => {
    const [x1, setX1] = useState('2'); const [y1, setY1] = useState('3');
    const [x2, setX2] = useState('6'); const [y2, setY2] = useState('5');
    const slope = useMemo(() => {
        const p1x=parseFloat(x1), p1y=parseFloat(y1), p2x=parseFloat(x2), p2y=parseFloat(y2);
        if([p1x,p1y,p2x,p2y].some(isNaN)) return '...';
        if(p2x - p1x === 0) return 'Undefined (vertical line)';
        return ((p2y - p1y) / (p2x - p1x)).toFixed(4);
    }, [x1, y1, x2, y2]);
    return (
        <CalculatorWrapper title="Slope Calculator">
            <div className="flex gap-4">
                <div className="p-2 border rounded dark:border-slate-600"><p className="text-sm mb-1">Point 1</p><div className="flex gap-2"><Input label="x₁" value={x1} onChange={e=>setX1(e.target.value)} /><Input label="y₁" value={y1} onChange={e=>setY1(e.target.value)} /></div></div>
                <div className="p-2 border rounded dark:border-slate-600"><p className="text-sm mb-1">Point 2</p><div className="flex gap-2"><Input label="x₂" value={x2} onChange={e=>setX2(e.target.value)} /><Input label="y₂" value={y2} onChange={e=>setY2(e.target.value)} /></div></div>
            </div>
             <Result label="Slope" value={slope} />
        </CalculatorWrapper>
    );
};

const AreaCalculator: React.FC = () => {
    const [shape, setShape] = useState('Rectangle');
    const [inputs, setInputs] = useState({ s: '5', r: '5', h: '10', l: '5', w: '4', b: '6' });
    
    const area = useMemo(() => {
        const s=parseFloat(inputs.s), r=parseFloat(inputs.r), h=parseFloat(inputs.h), l=parseFloat(inputs.l), w=parseFloat(inputs.w), b=parseFloat(inputs.b);
        switch(shape) {
            case 'Square': return !isNaN(s) ? s**2 : '...';
            case 'Rectangle': return !isNaN(l) && !isNaN(w) ? l*w : '...';
            case 'Circle': return !isNaN(r) ? Math.PI * r**2 : '...';
            case 'Triangle': return !isNaN(b) && !isNaN(h) ? 0.5 * b * h : '...';
            default: return '...';
        }
    }, [shape, inputs]);

    return (
        <CalculatorWrapper title="Area Calculator">
            <select value={shape} onChange={e=>setShape(e.target.value)} className="w-full p-2 border rounded dark:bg-slate-700">
                <option>Square</option><option>Rectangle</option><option>Circle</option><option>Triangle</option>
            </select>
            <div className="flex gap-2">
                {shape === 'Square' && <Input label="Side" value={inputs.s} onChange={e=>setInputs({...inputs, s: e.target.value})} />}
                {shape === 'Rectangle' && <><Input label="Length" value={inputs.l} onChange={e=>setInputs({...inputs, l: e.target.value})} /><Input label="Width" value={inputs.w} onChange={e=>setInputs({...inputs, w: e.target.value})} /></>}
                {shape === 'Circle' && <Input label="Radius" value={inputs.r} onChange={e=>setInputs({...inputs, r: e.target.value})} />}
                {shape === 'Triangle' && <><Input label="Base" value={inputs.b} onChange={e=>setInputs({...inputs, b: e.target.value})} /><Input label="Height" value={inputs.h} onChange={e=>setInputs({...inputs, h: e.target.value})} /></>}
            </div>
            <Result label="Area" value={typeof area === 'number' ? area.toFixed(4) : area} />
        </CalculatorWrapper>
    );
};

const DistanceCalculator: React.FC = () => {
    const [x1, setX1] = useState('0'); const [y1, setY1] = useState('0');
    const [x2, setX2] = useState('3'); const [y2, setY2] = useState('4');

    const distance = useMemo(() => {
        const p1x=parseFloat(x1), p1y=parseFloat(y1), p2x=parseFloat(x2), p2y=parseFloat(y2);
        if([p1x,p1y,p2x,p2y].some(isNaN)) return '...';
        return Math.sqrt(Math.pow(p2x-p1x, 2) + Math.pow(p2y-p1y, 2)).toFixed(4);
    }, [x1, y1, x2, y2]);
    return (
        <CalculatorWrapper title="Distance Calculator (2D)">
            <div className="flex gap-4">
                <div className="p-2 border rounded dark:border-slate-600"><p className="text-sm mb-1">Point 1</p><div className="flex gap-2"><Input label="x₁" value={x1} onChange={e=>setX1(e.target.value)} /><Input label="y₁" value={y1} onChange={e=>setY1(e.target.value)} /></div></div>
                <div className="p-2 border rounded dark:border-slate-600"><p className="text-sm mb-1">Point 2</p><div className="flex gap-2"><Input label="x₂" value={x2} onChange={e=>setX2(e.target.value)} /><Input label="y₂" value={y2} onChange={e=>setY2(e.target.value)} /></div></div>
            </div>
            <Result label="Distance" value={distance} />
        </CalculatorWrapper>
    );
};

const CircleCalculator: React.FC = () => {
    const [radius, setRadius] = useState('10');
    const { area, circumference, diameter } = useMemo(() => {
        const r = parseFloat(radius);
        if (isNaN(r) || r < 0) return { area: '...', circumference: '...', diameter: '...' };
        return {
            area: (Math.PI * r * r).toFixed(4),
            circumference: (2 * Math.PI * r).toFixed(4),
            diameter: (2 * r).toFixed(4)
        };
    }, [radius]);
    return (
        <CalculatorWrapper title="Circle Calculator">
            <Input label="Radius" value={radius} onChange={e => setRadius(e.target.value)} type="number" />
            <Result label="Diameter" value={diameter} />
            <Result label="Circumference" value={circumference} />
            <Result label="Area" value={area} />
        </CalculatorWrapper>
    );
};

const SurfaceAreaCalculator: React.FC = () => {
    const [shape, setShape] = useState('Cube');
    const [inputs, setInputs] = useState({ s: '5', r: '5', h: '10' });
    const area = useMemo(() => {
        const s=parseFloat(inputs.s), r=parseFloat(inputs.r), h=parseFloat(inputs.h);
        switch(shape) {
            case 'Cube': return !isNaN(s) ? 6 * s*s : '...';
            case 'Sphere': return !isNaN(r) ? 4 * Math.PI * r*r : '...';
            case 'Cylinder': return !isNaN(r) && !isNaN(h) ? 2*Math.PI*r*h + 2*Math.PI*r*r : '...';
            default: return '...';
        }
    }, [shape, inputs]);
     return (
        <CalculatorWrapper title="Surface Area Calculator">
            <select value={shape} onChange={e=>setShape(e.target.value)} className="w-full p-2 border rounded dark:bg-slate-700">
                <option>Cube</option><option>Sphere</option><option>Cylinder</option>
            </select>
             <div className="flex gap-2">
                {shape === 'Cube' && <Input label="Side" value={inputs.s} onChange={e=>setInputs({...inputs, s: e.target.value})} />}
                {shape === 'Sphere' && <Input label="Radius" value={inputs.r} onChange={e=>setInputs({...inputs, r: e.target.value})} />}
                {shape === 'Cylinder' && <><Input label="Radius" value={inputs.r} onChange={e=>setInputs({...inputs, r: e.target.value})} /><Input label="Height" value={inputs.h} onChange={e=>setInputs({...inputs, h: e.target.value})} /></>}
            </div>
            <Result label="Surface Area" value={typeof area === 'number' ? area.toFixed(4) : area} />
        </CalculatorWrapper>
    );
};

const PythagoreanTheoremCalculator: React.FC = () => {
    const [a, setA] = useState('3'); const [b, setB] = useState('4');
    const c = useMemo(() => {
        const sideA=parseFloat(a), sideB=parseFloat(b);
        if(isNaN(sideA) || isNaN(sideB) || sideA <=0 || sideB <= 0) return '...';
        return Math.sqrt(sideA*sideA + sideB*sideB).toFixed(4);
    }, [a, b]);
    return (
        <CalculatorWrapper title="Pythagorean Theorem Calculator">
            <p className="text-sm text-slate-500">a² + b² = c²</p>
            <div className="flex gap-2">
                <Input label="Side a" value={a} onChange={e=>setA(e.target.value)} />
                <Input label="Side b" value={b} onChange={e=>setB(e.target.value)} />
            </div>
            <Result label="Hypotenuse c" value={c} />
        </CalculatorWrapper>
    );
};

const RightTriangleCalculator: React.FC = () => {
    const [a, setA] = useState('3'); const [b, setB] = useState('4');
     const { c, angleA, angleB } = useMemo(() => {
        const sideA=parseFloat(a), sideB=parseFloat(b);
        if(isNaN(sideA) || isNaN(sideB) || sideA <=0 || sideB <= 0) return {c:'...', angleA:'...', angleB:'...'};
        const sideC = Math.sqrt(sideA*sideA + sideB*sideB);
        const angA = Math.atan(sideA / sideB) * (180 / Math.PI);
        const angB = 90 - angA;
        return { c: sideC.toFixed(4), angleA: angA.toFixed(2), angleB: angB.toFixed(2) };
    }, [a, b]);
    return (
        <CalculatorWrapper title="Right Triangle Calculator">
            <div className="flex gap-2">
                <Input label="Side a" value={a} onChange={e=>setA(e.target.value)} />
                <Input label="Side b" value={b} onChange={e=>setB(e.target.value)} />
            </div>
            <Result label="Hypotenuse c" value={c} />
            <Result label="Angle A (degrees)" value={angleA} />
            <Result label="Angle B (degrees)" value={angleB} />
        </CalculatorWrapper>
    );
};


// --- LIST OF ALL CALCULATORS ---
const allCalculators: Calculator[] = [
    // Math
    { id: 'scientific', name: 'Scientific Calculator', category: 'Math', component: ScientificCalculator },
    { id: 'fraction', name: 'Fraction Calculator', category: 'Math', component: FractionCalculator },
    { id: 'percentage', name: 'Percentage Calculator', category: 'Math', component: PercentageCalculatorComponent },
    { id: 'random-number', name: 'Random Number Generator', category: 'Math', component: RandomNumberGeneratorComponent },
    { id: 'percent-error', name: 'Percent Error Calculator', category: 'Math', component: PercentErrorCalculator },
    { id: 'exponent', name: 'Exponent Calculator', category: 'Math', component: ExponentCalculator },
    { id: 'number-base', name: 'Binary/Hex Calculator', category: 'Math', component: NumberBaseCalculator },
    { id: 'half-life', name: 'Half-Life Calculator', category: 'Math', component: HalfLifeCalculator },
    { id: 'quadratic', name: 'Quadratic Formula Calculator', category: 'Math', component: QuadraticFormulaCalculator },
    { id: 'log', name: 'Log Calculator', category: 'Math', component: LogCalculator },
    { id: 'ratio', name: 'Ratio Calculator', category: 'Math', component: RatioCalculator },
    { id: 'root', name: 'Root Calculator', category: 'Math', component: RootCalculator },
    { id: 'lcm', name: 'Least Common Multiple (LCM)', category: 'Math', component: LCMCalculator },
    { id: 'gcf', name: 'Greatest Common Factor (GCF)', category: 'Math', component: GCFCalculator },
    { id: 'factor', name: 'Factor Calculator', category: 'Math', component: FactorCalculator },
    { id: 'rounding', name: 'Rounding Calculator', category: 'Math', component: RoundingCalculator },
    { id: 'matrix', name: 'Matrix Calculator', category: 'Math', component: MatrixCalculator },
    { id: 'scientific-notation', name: 'Scientific Notation Calculator', category: 'Math', component: ScientificNotationCalculator },
    { id: 'big-number', name: 'Big Number Calculator', category: 'Math', component: BigNumberCalculator },
    // Statistics
    { id: 'statistics', name: 'Statistics Calculator', category: 'Statistics', component: StatisticsCalculatorComponent },
    { id: 'number-sequence', name: 'Number Sequence Calculator', category: 'Statistics', component: NumberSequenceCalculator },
    { id: 'sample-size', name: 'Sample Size Calculator', category: 'Statistics', component: SampleSizeCalculator },
    { id: 'probability', name: 'Probability Calculator', category: 'Statistics', component: ProbabilityCalculator },
    // The StatisticsCalculatorComponent covers Mean, Median, Mode, Range, and Standard Deviation.
    { id: 'mean-median-mode', name: 'Mean, Median, Mode, Range', category: 'Statistics', component: StatisticsCalculatorComponent },
    { id: 'std-dev', name: 'Standard Deviation Calculator', category: 'Statistics', component: StatisticsCalculatorComponent },
    { id: 'permutation-combination', name: 'Permutation & Combination', category: 'Statistics', component: PermutationCombinationCalculator },
    { id: 'z-score', name: 'Z-score Calculator', category: 'Statistics', component: ZScoreCalculator },
    { id: 'confidence-interval', name: 'Confidence Interval Calculator', category: 'Statistics', component: ConfidenceIntervalCalculator },
    // Geometry
    { id: 'triangle', name: 'Triangle Calculator', category: 'Geometry', component: TriangleSolver },
    { id: 'volume', name: 'Volume Calculator', category: 'Geometry', component: VolumeCalculator },
    { id: 'slope', name: 'Slope Calculator', category: 'Geometry', component: SlopeCalculator },
    { id: 'area', name: 'Area Calculator', category: 'Geometry', component: AreaCalculator },
    { id: 'distance', name: 'Distance Calculator', category: 'Geometry', component: DistanceCalculator },
    { id: 'circle', name: 'Circle Calculator', category: 'Geometry', component: CircleCalculator },
    { id: 'surface-area', name: 'Surface Area Calculator', category: 'Geometry', component: SurfaceAreaCalculator },
    { id: 'pythagorean', name: 'Pythagorean Theorem Calculator', category: 'Geometry', component: PythagoreanTheoremCalculator },
    { id: 'right-triangle', name: 'Right Triangle Calculator', category: 'Geometry', component: RightTriangleCalculator },
];


// --- MAIN HUB COMPONENT ---
const MathCalculators: React.FC = () => {
    const [selectedId, setSelectedId] = useState('scientific');
    const [searchTerm, setSearchTerm] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const categories = useMemo(() => {
        const grouped: { [key: string]: Calculator[] } = {};
        allCalculators.forEach(calc => {
            if (!grouped[calc.category]) grouped[calc.category] = [];
            grouped[calc.category].push(calc);
        });
        return Object.keys(grouped).sort().map(key => ({ name: key, calculators: grouped[key] }));
    }, []);

    const filteredCalculators = useMemo(() => 
        allCalculators.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())), 
    [searchTerm]);

    const SelectedComponent = useMemo(() => 
        allCalculators.find(c => c.id === selectedId)?.component || (() => <div>Not Found</div>),
    [selectedId]);
    
    const handleSelect = (id: string) => {
        setSelectedId(id);
        setIsSidebarOpen(false); // Close sidebar on mobile after selection
    };

    const SidebarContent = () => (
        <>
            <div className="p-4 border-b dark:border-slate-700">
                <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search calculators..." className="w-full pl-9 p-2 border rounded-md text-sm dark:bg-slate-700 dark:border-slate-600"/>
                </div>
            </div>
            <nav className="p-2 flex-1 overflow-y-auto">
                {searchTerm ? (
                    <ul>
                        {filteredCalculators.map(c => (
                            <li key={c.id}><button onClick={() => handleSelect(c.id)} className={`w-full text-left flex items-center px-2 py-2 text-sm rounded-md group ${selectedId === c.id ? 'bg-[var(--theme-primary-light)] text-[var(--theme-primary)] dark:bg-sky-900/50 dark:text-sky-300' : 'text-gray-600 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700'}`}> <FinanceIcon className="w-4 h-4 mr-2" /> {c.name}</button></li>
                        ))}
                    </ul>
                ) : (
                    categories.map(cat => (
                        <div key={cat.name} className="mb-4">
                            <h3 className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">{cat.name}</h3>
                            <ul className="mt-1">
                                {cat.calculators.map(c => (
                                     <li key={c.id}><button onClick={() => handleSelect(c.id)} className={`w-full text-left flex items-center px-2 py-2 text-sm rounded-md group ${selectedId === c.id ? 'bg-[var(--theme-primary-light)] text-[var(--theme-primary)] dark:bg-sky-900/50 dark:text-sky-300' : 'text-gray-600 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700'}`}>{c.name}</button></li>
                                ))}
                            </ul>
                        </div>
                    ))
                )}
            </nav>
        </>
    );

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

    return (
        <div className="flex flex-col md:flex-row -m-6 lg:-m-10 h-full">
            {/* Mobile Header */}
            <header className="lg:hidden flex items-center justify-between p-4 border-b dark:border-slate-700 bg-white dark:bg-slate-800 flex-shrink-0">
                <h2 className="text-lg font-bold">{allCalculators.find(c => c.id === selectedId)?.name || 'Calculators'}</h2>
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

export default MathCalculators;
