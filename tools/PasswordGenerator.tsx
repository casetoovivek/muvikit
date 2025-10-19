import React, { useState, useEffect } from 'react';

const calculateStrength = (password: string): number => {
  let score = 0;
  if (!password) return 0;

  // Award points for different character types
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  
  return Math.min(score, 4); // Cap score at 4
};

const PasswordStrengthMeter = ({ password }: { password: string }) => {
  const strength = calculateStrength(password);
  const strengthLabels = ['Very Weak', 'Weak', 'Okay', 'Good', 'Strong'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];

  return (
    <div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-slate-700">
        <div 
          className={`h-2.5 rounded-full transition-all duration-300 ${strengthColors[strength]}`} 
          style={{ width: `${(strength / 4) * 100}%` }}
        ></div>
      </div>
      <p className={`text-right text-sm font-medium mt-1 ${strength > 2 ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-slate-400'}`}>
        {strengthLabels[strength]}
      </p>
    </div>
  );
};

const PasswordGenerator: React.FC = () => {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [copied, setCopied] = useState(false);

  const generatePassword = () => {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+~`|}{[]:;?><,./-=';
    let charset = '';
    if (includeUppercase) charset += upper;
    if (includeLowercase) charset += lower;
    if (includeNumbers) charset += numbers;
    if (includeSymbols) charset += symbols;
    
    if (charset === '') {
        setPassword('');
        return;
    }

    let newPassword = '';
    for (let i = 0; i < length; i++) {
      newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setPassword(newPassword);
    setCopied(false);
  };
  
  useEffect(() => {
      generatePassword();
  }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols]);


  const copyToClipboard = () => {
    if (password) {
      navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Password Generator</h2>
        <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">Create secure, random passwords to protect your accounts.</p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-slate-200 max-w-2xl mx-auto space-y-6 dark:bg-slate-800 dark:border-slate-700">
        <div className="relative">
            <input 
                type="text" 
                readOnly 
                value={password}
                placeholder="Your generated password will appear here"
                className="w-full p-4 pr-20 text-xl font-mono bg-slate-100 border border-slate-300 rounded-lg dark:bg-slate-900 dark:border-slate-600 dark:text-[var(--theme-text-gold)]"
            />
            <button onClick={copyToClipboard} className="absolute inset-y-0 right-0 px-4 text-sm font-semibold text-white bg-[var(--theme-primary)] rounded-r-lg hover:opacity-90 transition-opacity">
                {copied ? 'Copied!' : 'Copy'}
            </button>
        </div>
        
        <PasswordStrengthMeter password={password} />

        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label htmlFor="length" className="font-medium text-gray-700 dark:text-slate-300">Password Length:</label>
                <span className="text-lg font-bold text-[var(--theme-primary)] dark:text-sky-300">{length}</span>
            </div>
            <input 
                id="length"
                type="range" 
                min="8" 
                max="64" 
                value={length}
                onChange={(e) => setLength(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
            />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <label className="flex items-center space-x-2 p-3 bg-slate-50 border rounded-lg cursor-pointer dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200">
                <input type="checkbox" checked={includeUppercase} onChange={() => setIncludeUppercase(!includeUppercase)} className="h-5 w-5 rounded border-gray-300 text-[var(--theme-primary)] focus:ring-[var(--theme-primary)] dark:border-slate-500" />
                <span>Uppercase</span>
            </label>
             <label className="flex items-center space-x-2 p-3 bg-slate-50 border rounded-lg cursor-pointer dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200">
                <input type="checkbox" checked={includeLowercase} onChange={() => setIncludeLowercase(!includeLowercase)} className="h-5 w-5 rounded border-gray-300 text-[var(--theme-primary)] focus:ring-[var(--theme-primary)] dark:border-slate-500" />
                <span>Lowercase</span>
            </label>
             <label className="flex items-center space-x-2 p-3 bg-slate-50 border rounded-lg cursor-pointer dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200">
                <input type="checkbox" checked={includeNumbers} onChange={() => setIncludeNumbers(!includeNumbers)} className="h-5 w-5 rounded border-gray-300 text-[var(--theme-primary)] focus:ring-[var(--theme-primary)] dark:border-slate-500" />
                <span>Numbers</span>
            </label>
             <label className="flex items-center space-x-2 p-3 bg-slate-50 border rounded-lg cursor-pointer dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200">
                <input type="checkbox" checked={includeSymbols} onChange={() => setIncludeSymbols(!includeSymbols)} className="h-5 w-5 rounded border-gray-300 text-[var(--theme-primary)] focus:ring-[var(--theme-primary)] dark:border-slate-500" />
                <span>Symbols</span>
            </label>
        </div>
        
        <button onClick={generatePassword} className="w-full px-6 py-3 bg-[var(--theme-primary)] text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition-opacity">
            Regenerate Password
        </button>
      </div>
    </div>
  );
};

export default PasswordGenerator;