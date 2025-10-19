import React, { useState, useRef } from 'react';
import QRCode from 'qrcode.react';

const QrCodeGenerator: React.FC = () => {
  const [text, setText] = useState('https://aistudio.google.com');
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const qrRef = useRef<HTMLDivElement>(null);
  
  const handleDownload = () => {
      if (qrRef.current) {
          const canvas = qrRef.current.querySelector('canvas');
          if (canvas) {
              const url = canvas.toDataURL('image/png');
              const a = document.createElement('a');
              a.href = url;
              a.download = 'qrcode.png';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
          }
      }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">QR Code Generator</h2>
        <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">Enter text or a URL to generate a custom QR code.</p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-slate-200 max-w-lg mx-auto space-y-6 dark:bg-slate-800 dark:border-slate-700">
        <div>
          <label htmlFor="qr-text" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Text or URL</label>
          <input
            type="text"
            id="qr-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
                 <label htmlFor="fg-color" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Foreground Color</label>
                 <input type="color" id="fg-color" value={fgColor} onChange={e => setFgColor(e.target.value)} className="mt-1 w-full h-10 p-1 border border-gray-300 rounded-md cursor-pointer dark:border-slate-600"/>
            </div>
             <div>
                 <label htmlFor="bg-color" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Background Color</label>
                 <input type="color" id="bg-color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="mt-1 w-full h-10 p-1 border border-gray-300 rounded-md cursor-pointer dark:border-slate-600"/>
            </div>
        </div>

        {text && (
          <div className="text-center space-y-4 pt-4">
            <div ref={qrRef} className="inline-block p-4 border rounded-lg dark:border-slate-600" style={{ backgroundColor: bgColor }}>
               <QRCode value={text} size={256} level="H" fgColor={fgColor} bgColor={bgColor} />
            </div>
            <div>
                 <button onClick={handleDownload} className="px-6 py-2 bg-[var(--theme-primary)] text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition-opacity">
                    Download QR Code
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QrCodeGenerator;