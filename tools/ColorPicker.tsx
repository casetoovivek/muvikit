import React, { useState, useMemo } from 'react';
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Color Picker & Converter</h1>
        <p className="mt-1 text-lg text-gray-600 dark:text-slate-400">Select a color to instantly get its HEX, RGB, and HSL codes. An essential tool for designers, developers, and artists.</p>
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
      
       <div className="bg-white p-6 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 space-y-6 max-w-4xl mx-auto">
        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">What are HEX, RGB, and HSL?</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">HEX, RGB, and HSL are different ways to represent colors in digital formats. <strong>HEX</strong> (Hexadecimal) codes are six-character codes often used in web design (e.g., #FFFFFF for white). <strong>RGB</strong> (Red, Green, Blue) defines a color by the intensity of its red, green, and blue components. <strong>HSL</strong> (Hue, Saturation, Lightness) represents color in a more intuitive, human-friendly way, describing its shade, intensity, and brightness. Our tool instantly converts between all three formats.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">How to Use the Color Picker</h2>
          <ol className="list-decimal list-inside mt-2 space-y-2 text-slate-600 dark:text-slate-300">
            <li><strong>Select a Color:</strong> Click on the large color preview on the left to open your system's color picker. You can also manually enter a HEX code in the "HEX" field.</li>
            <li><strong>View the Codes:</strong> The HEX, RGB, and HSL values for your selected color will be automatically displayed.</li>
            <li><strong>Copy the Code:</strong> Click the copy icon next to any value to copy it to your clipboard.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Benefits of This Tool</h2>
          <ul className="list-disc list-inside mt-2 space-y-2 text-slate-600 dark:text-slate-300">
            <li><strong>Real-Time Conversion:</strong> Instantly see the corresponding codes in all three formats as you pick a color.</li>
            <li><strong>Easy to Use:</strong> A simple, visual interface makes finding the perfect color and its codes effortless.</li>
            <li><strong>One-Click Copy:</strong> Quickly copy any color value to your clipboard for use in your projects.</li>
            <li><strong>Developer and Designer Friendly:</strong> Provides the most common color code formats used in web development, graphic design, and data visualization.</li>
          </ul>
        </section>
        
        <section>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Frequently Asked Questions (FAQs)</h2>
            <div className="mt-2 space-y-3 text-slate-600 dark:text-slate-300">
              <div>
                <h3 className="font-semibold">Can I pick a color from an image?</h3>
                <p>This tool uses your system's built-in color picker. Many operating systems (like macOS and Windows) have an eyedropper tool within their native color picker that allows you to select a color from anywhere on your screen, including an image.</p>
              </div>
            </div>
        </section>
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