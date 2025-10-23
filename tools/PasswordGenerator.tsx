import React, { useState, useEffect } from 'react';
import { CopyIcon } from '../components/icons';

const calculateStrength = (password: string): number => {
  let score = 0;
  if (!password) return 0;

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
          style={{ width: `${((strength + 1) / 5) * 100}%` }}
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Free Secure Password Generator</h1>
        <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">Create strong, random passwords to protect your online accounts with our customizable password generator tool.</p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-slate-200 max-w-2xl mx-auto space-y-6 dark:bg-slate-800 dark:border-slate-700">
        <div className="relative">
            <input 
                type="text" 
                readOnly 
                value={password}
                placeholder="Your generated password will appear here"
                className="w-full p-4 pr-24 text-xl font-mono bg-slate-100 border border-slate-300 rounded-lg dark:bg-slate-900 dark:border-slate-600 dark:text-[var(--theme-text-gold)]"
            />
            <button onClick={copyToClipboard} className="absolute inset-y-0 right-0 px-4 text-sm font-semibold text-white bg-[var(--theme-primary)] rounded-r-lg hover:opacity-90 transition-opacity flex items-center gap-2">
                <CopyIcon className="w-4 h-4"/>
                {copied ? 'Copied!' : 'Copy'}
            </button>
        </div>
        
        <PasswordStrengthMeter password={password} />

        <div className="space-y-4 pt-4 border-t dark:border-slate-700">
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
                <span>ABC</span>
            </label>
             <label className="flex items-center space-x-2 p-3 bg-slate-50 border rounded-lg cursor-pointer dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200">
                <input type="checkbox" checked={includeLowercase} onChange={() => setIncludeLowercase(!includeLowercase)} className="h-5 w-5 rounded border-gray-300 text-[var(--theme-primary)] focus:ring-[var(--theme-primary)] dark:border-slate-500" />
                <span>abc</span>
            </label>
             <label className="flex items-center space-x-2 p-3 bg-slate-50 border rounded-lg cursor-pointer dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200">
                <input type="checkbox" checked={includeNumbers} onChange={() => setIncludeNumbers(!includeNumbers)} className="h-5 w-5 rounded border-gray-300 text-[var(--theme-primary)] focus:ring-[var(--theme-primary)] dark:border-slate-500" />
                <span>123</span>
            </label>
             <label className="flex items-center space-x-2 p-3 bg-slate-50 border rounded-lg cursor-pointer dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200">
                <input type="checkbox" checked={includeSymbols} onChange={() => setIncludeSymbols(!includeSymbols)} className="h-5 w-5 rounded border-gray-300 text-[var(--theme-primary)] focus:ring-[var(--theme-primary)] dark:border-slate-500" />
                <span>#$&</span>
            </label>
        </div>
        
        <button onClick={generatePassword} className="w-full px-6 py-3 bg-[var(--theme-primary)] text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition-opacity">
            Regenerate Password
        </button>
      </div>

       <div className="bg-white p-6 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 space-y-6 max-w-4xl mx-auto">
        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">What is a Secure Password Generator?</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">A secure password generator is a tool that automatically creates complex, random passwords that are difficult for hackers to guess or crack. Instead of using easily memorable (and insecure) passwords like "password123" or your pet's name, a generator combines uppercase letters, lowercase letters, numbers, and symbols to create a robust line of defense for your digital accounts. Using a strong, unique password for every service is one of the most effective ways to protect your personal information online.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">How to Use This Password Generator</h2>
          <ol className="list-decimal list-inside mt-2 space-y-2 text-slate-600 dark:text-slate-300">
            <li><strong>Adjust the Length:</strong> Use the slider to select your desired password length. Longer is generally stronger.</li>
            <li><strong>Select Character Types:</strong> Check or uncheck the boxes to include or exclude uppercase letters, lowercase letters, numbers, and symbols.</li>
            <li><strong>Generate and Copy:</strong> The tool automatically generates a password based on your settings. Click the "Copy" button to copy it to your clipboard.</li>
            <li><strong>Regenerate if Needed:</strong> If you don't like the generated password, simply click "Regenerate Password" for a new one.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Benefits of This Tool</h2>
          <ul className="list-disc list-inside mt-2 space-y-2 text-slate-600 dark:text-slate-300">
            <li><strong>Maximum Security:</strong> Creates truly random passwords that are resistant to brute-force and dictionary attacks.</li>
            <li><strong>Fully Customizable:</strong> Control the length and character types to meet the specific requirements of any website.</li>
            <li><strong>Instant Strength Check:</strong> The strength meter gives you immediate feedback on how secure your chosen settings are.</li>
            <li><strong>Client-Side Generation:</strong> Your passwords are generated in your browser and are never sent to our servers, ensuring 100% privacy.</li>
          </ul>
        </section>

        <section>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Frequently Asked Questions (FAQs)</h2>
            <div className="mt-2 space-y-3 text-slate-600 dark:text-slate-300">
              <div>
                <h3 className="font-semibold">What makes a password strong?</h3>
                <p>A strong password is long (at least 12-16 characters), complex (includes a mix of character types), and random (doesn't contain personal information or dictionary words).</p>
              </div>
              <div>
                <h3 className="font-semibold">Is it safe to use an online password generator?</h3>
                <p>Yes, our tool is safe because it generates passwords directly on your computer (client-side). Your generated password is never transmitted over the internet or stored by us.</p>
              </div>
               <div>
                <h3 className="font-semibold">Should I use the same password for multiple websites?</h3>
                <p>No. You should use a unique, strong password for every online account. If one site is breached, using unique passwords prevents attackers from accessing your other accounts.</p>
              </div>
            </div>
        </section>
      </div>
    </div>
  );
};

export default PasswordGenerator;