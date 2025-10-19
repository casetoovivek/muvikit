import React, { useState, useMemo } from 'react';

const conversionFactors = {
  length: {
    meters: 1,
    kilometers: 1000,
    miles: 1609.34,
    feet: 0.3048,
  },
  mass: {
    grams: 1,
    kilograms: 1000,
    pounds: 453.592,
    ounces: 28.3495,
  },
};

const UnitConverter: React.FC = () => {
  const [category, setCategory] = useState<'length' | 'mass' | 'temperature'>('length');
  const [fromUnit, setFromUnit] = useState('meters');
  const [toUnit, setToUnit] = useState('feet');
  const [inputValue, setInputValue] = useState('1');

  const units = useMemo(() => {
    if (category === 'temperature') return ['Celsius', 'Fahrenheit', 'Kelvin'];
    return Object.keys(conversionFactors[category]);
  }, [category]);

  const outputValue = useMemo(() => {
    const input = parseFloat(inputValue);
    if (isNaN(input)) return '';

    if (category === 'temperature') {
        if (fromUnit === toUnit) return input.toFixed(2);
        
        let celsiusValue: number;
        // First convert input to Celsius
        switch (fromUnit) {
            case 'Fahrenheit':
                celsiusValue = (input - 32) * 5/9;
                break;
            case 'Kelvin':
                celsiusValue = input - 273.15;
                break;
            default: // Celsius
                celsiusValue = input;
        }

        // Then convert from Celsius to target unit
        switch (toUnit) {
            case 'Fahrenheit':
                return (celsiusValue * 9/5 + 32).toFixed(2);
            case 'Kelvin':
                return (celsiusValue + 273.15).toFixed(2);
            default: // Celsius
                return celsiusValue.toFixed(2);
        }

    } else {
        const fromFactor = conversionFactors[category][fromUnit as keyof typeof conversionFactors['length']];
        const toFactor = conversionFactors[category][toUnit as keyof typeof conversionFactors['length']];
        if (fromFactor === undefined || toFactor === undefined) return '';
        const result = (input * fromFactor) / toFactor;
        return result.toPrecision(5);
    }
  }, [inputValue, fromUnit, toUnit, category]);
  
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newCategory = e.target.value as 'length' | 'mass' | 'temperature';
      setCategory(newCategory);
      if (newCategory === 'temperature') {
          setFromUnit('Celsius');
          setToUnit('Fahrenheit');
      } else {
          const newUnits = Object.keys(conversionFactors[newCategory]);
          setFromUnit(newUnits[0]);
          setToUnit(newUnits[1]);
      }
  }


  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Unit Converter</h2>
        <p className="mt-1 text-md text-gray-600 dark:text-slate-400">Convert between different units of measurement.</p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 max-w-2xl mx-auto space-y-4 dark:bg-slate-800 dark:border-slate-700">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Category</label>
          <select id="category" value={category} onChange={handleCategoryChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] sm:text-sm rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white">
            <option value="length">Length</option>
            <option value="mass">Mass</option>
            <option value="temperature">Temperature</option>
          </select>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div className="sm:col-span-1">
                <label htmlFor="input-value" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Value</label>
                <input
                    type="number"
                    id="input-value"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                />
            </div>
            <div className="sm:col-span-1">
                <label htmlFor="from-unit" className="block text-sm font-medium text-gray-700 dark:text-slate-300">From</label>
                <select id="from-unit" value={fromUnit} onChange={(e) => setFromUnit(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] sm:text-sm rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                    {units.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                </select>
            </div>
             <div className="sm:col-span-1">
                <label htmlFor="to-unit" className="block text-sm font-medium text-gray-700 dark:text-slate-300">To</label>
                <select id="to-unit" value={toUnit} onChange={(e) => setToUnit(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] sm:text-sm rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                     {units.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                </select>
            </div>
        </div>

        <div className="pt-4 text-center">
            <p className="text-lg text-gray-600 dark:text-slate-400">Result:</p>
            <p className="text-4xl font-bold text-[var(--theme-primary)] dark:text-sky-300">{outputValue} <span className="text-2xl text-gray-500 dark:text-slate-400">{toUnit}</span></p>
        </div>
      </div>
    </div>
  );
};

export default UnitConverter;