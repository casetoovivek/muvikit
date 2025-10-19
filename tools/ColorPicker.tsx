import React, { useState, useMemo } from 'react';
// FIX: Corrected import path for icon
import { CopyIcon } from '../components/icons';

const ColorPicker: React.FC = () => {
  const [color, setColor] = useState('#2563eb');

  const { rgb, hsl } = useMemo(() => {
    let r = 0, g = 0, b = 0;
    if (color.length === 7) {
      r = parseInt(color.substring(1, 3), 16);
      g = parseInt(color.substring(3, 5), 16);
      b = parseInt(color.substring(5, 7), 16);
    }
    const rgbString = `rgb(${r}, ${g}, ${b})`;

    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    const hslString = `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;

    return { rgb: rgbString, hsl: hslString };
  }, [color]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Color Picker</h2>
        <p className="mt-1 text-md text-gray-600 dark:text-slate-400">Select a color to get its HEX, RGB, and HSL codes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden">
            <div className="absolute inset-0 w-full h-full" style={{ backgroundColor: color }}></div>
            <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
        </div>
        
        <div className="space-y-4">
            <ColorDisplay label="HEX" value={color} onCopy={copyToClipboard} />
            <ColorDisplay label="RGB" value={rgb} onCopy={copyToClipboard} />
            <ColorDisplay label="HSL" value={hsl} onCopy={copyToClipboard} />
        </div>
      </div>
    </div>
  );
};

interface ColorDisplayProps {
    label: string;
    value: string;
    onCopy: (value: string) => void;
}

const ColorDisplay: React.FC<ColorDisplayProps> = ({ label, value, onCopy }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        onCopy(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
    return (
        <div className="bg-white p-4 rounded-lg border border-gray-200 dark:bg-slate-800 dark:border-slate-700">
            <div className="font-semibold text-gray-600 mb-1 dark:text-slate-400">{label}</div>
            <div className="flex items-center justify-between">
                <span className="font-mono text-lg text-gray-800 dark:text-slate-200">{value}</span>
                <button onClick={handleCopy} className="text-gray-500 hover:text-[var(--theme-primary)] dark:text-slate-400 dark:hover:text-sky-400">
                    {copied ? 'Copied!' : <CopyIcon className="w-5 h-5"/>}
                </button>
            </div>
        </div>
    )
}

export default ColorPicker;