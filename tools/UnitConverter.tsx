import React, { useState, useMemo } from 'react';

const conversionFactors: { [key: string]: { [key: string]: number } } = {
  length: {
    Meters: 1,
    Kilometers: 1000,
    Miles: 1609.34,
    Feet: 0.3048,
    Inches: 0.0254,
    Yards: 0.9144,
  },
  mass: {
    Grams: 1,
    Kilograms: 1000,
    Pounds: 453.592,
    Ounces: 28.3495,
  },
  temperature: {}, // Special handling
  speed: {
    'm/s': 1,
    'km/h': 0.277778,
    'mph': 0.44704,
    'knots': 0.514444,
  },
  area: {
    'm²': 1,
    'km²': 1000000,
    'ft²': 0.092903,
    'acres': 4046.86,
  },
  volume: {
    'Liters': 1,
    'Milliliters': 0.001,
    'Gallons (US)': 3.78541,
    'Cubic Meters': 1000,
  }
};

type Category = keyof typeof conversionFactors;

const UnitConverter: React.FC = () => {
  const [category, setCategory] = useState<Category>('length');
  const [fromUnit, setFromUnit] = useState('Meters');
  const [toUnit, setToUnit] = useState('Feet');
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
        switch (fromUnit) {
            case 'Fahrenheit': celsiusValue = (input - 32) * 5/9; break;
            case 'Kelvin': celsiusValue = input - 273.15; break;
            default: celsiusValue = input;
        }

        switch (toUnit) {
            case 'Fahrenheit': return (celsiusValue * 9/5 + 32).toFixed(2);
            case 'Kelvin': return (celsiusValue + 273.15).toFixed(2);
            default: return celsiusValue.toFixed(2);
        }

    } else {
        const fromFactor = conversionFactors[category][fromUnit];
        const toFactor = conversionFactors[category][toUnit];
        if (fromFactor === undefined || toFactor === undefined) return '';
        const result = (input * fromFactor) / toFactor;
        return result.toPrecision(6);
    }
  }, [inputValue, fromUnit, toUnit, category]);
  
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newCategory = e.target.value as Category;
      setCategory(newCategory);
      let newUnits;
      if (newCategory === 'temperature') {
          newUnits = ['Celsius', 'Fahrenheit'];
      } else {
          newUnits = Object.keys(conversionFactors[newCategory]);
      }
      setFromUnit(newUnits[0]);
      setToUnit(newUnits[1] || newUnits[0]);
  }

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Free Online Unit Converter</h1>
        <p className="mt-1 text-lg text-gray-600 dark:text-slate-400">Quickly convert between different units of measurement for length, mass, temperature, and more.</p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 max-w-2xl mx-auto space-y-4 dark:bg-slate-800 dark:border-slate-700">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Measurement Type</label>
          <select id="category" value={category} onChange={handleCategoryChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] sm:text-sm rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100">
            {Object.keys(conversionFactors).map(cat => <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>)}
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
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                />
            </div>
            <div className="sm:col-span-1">
                <label htmlFor="from-unit" className="block text-sm font-medium text-gray-700 dark:text-slate-300">From</label>
                <select id="from-unit" value={fromUnit} onChange={(e) => setFromUnit(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] sm:text-sm rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100">
                    {units.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                </select>
            </div>
             <div className="sm:col-span-1">
                <label htmlFor="to-unit" className="block text-sm font-medium text-gray-700 dark:text-slate-300">To</label>
                <select id="to-unit" value={toUnit} onChange={(e) => setToUnit(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] sm:text-sm rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100">
                     {units.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                </select>
            </div>
        </div>

        <div className="pt-4 text-center">
            <p className="text-lg text-gray-600 dark:text-slate-400">Result:</p>
            <p className="text-4xl font-bold text-[var(--theme-primary)] dark:text-sky-300">{outputValue} <span className="text-2xl text-gray-500 dark:text-slate-400">{toUnit}</span></p>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 space-y-6 max-w-4xl mx-auto">
        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">About Our Unit Converter</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">A unit converter is a tool that allows you to translate one unit of measurement into another. Whether you're a student working on a science project, a chef following a recipe with different units, or a traveler trying to understand distances, a unit converter is an essential tool. Our online converter handles a wide variety of categories, including length, mass, temperature, speed, area, and volume, providing quick and accurate results for your daily needs.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">How to Use This Tool</h2>
          <ol className="list-decimal list-inside mt-2 space-y-2 text-slate-600 dark:text-slate-300">
            <li><strong>Select the Measurement Type:</strong> Choose a category from the dropdown menu (e.g., Length, Mass, Temperature).</li>
            <li><strong>Enter Your Value:</strong> Type the number you wish to convert into the "Value" field.</li>
            <li><strong>Choose Your Units:</strong> Select the unit you are converting "From" and the unit you want to convert "To".</li>
            <li><strong>View the Result:</strong> The converted value will appear instantly at the bottom.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Frequently Asked Questions (FAQs)</h2>
          <div className="mt-2 space-y-3 text-slate-600 dark:text-slate-300">
            <div>
              <h3 className="font-semibold">What is the difference between mass and weight?</h3>
              <p>While often used interchangeably, mass is the amount of matter in an object, whereas weight is the force of gravity on that object. Our "Mass" category converts units like kilograms, grams, and pounds.</p>
            </div>
            <div>
              <h3 className="font-semibold">How is temperature conversion handled?</h3>
              <p>Temperature conversions (Celsius, Fahrenheit, Kelvin) follow different formulas than other units and do not scale linearly from a zero point. Our tool uses the standard, scientifically accepted formulas for accurate temperature conversions.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default UnitConverter;