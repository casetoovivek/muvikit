import React, { useState, useRef } from 'react';
import QRCode from 'qrcode.react';
import { DownloadIcon } from '../components/icons';

const QrCodeGenerator: React.FC = () => {
  const [text, setText] = useState('https://aistudio.google.com');
  const [fgColor, setFgColor] = useState('#0d3e80');
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
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Free QR Code Generator</h1>
        <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">Create custom QR codes from any text or URL instantly. Customize the colors and download your high-quality QR code for free.</p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-slate-200 max-w-lg mx-auto space-y-6 dark:bg-slate-800 dark:border-slate-700">
        <div>
          <label htmlFor="qr-text" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Text or URL</label>
          <input
            type="text"
            id="qr-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
                 <label htmlFor="fg-color" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Code Color</label>
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
               <QRCode renderAs="canvas" value={text} size={256} level="H" fgColor={fgColor} bgColor={bgColor} />
            </div>
            <div>
                 <button onClick={handleDownload} className="px-6 py-2 bg-[var(--theme-primary)] text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mx-auto">
                    <DownloadIcon className="w-5 h-5"/>
                    Download QR Code
                </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 space-y-6 max-w-4xl mx-auto">
        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">What is a QR Code?</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">A QR (Quick Response) code is a type of two-dimensional barcode that can store various kinds of information, such as a website URL, contact details, or plain text. It can be easily scanned using the camera on a smartphone, providing a quick and seamless bridge between the physical and digital worlds. QR codes are widely used in marketing, retail, and event management to share information effortlessly.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">How to Use the QR Code Generator</h2>
          <ol className="list-decimal list-inside mt-2 space-y-2 text-slate-600 dark:text-slate-300">
            <li><strong>Enter Your Data:</strong> Type or paste the website URL, text, or any other information you want to embed into the "Text or URL" field.</li>
            <li><strong>Customize Colors:</strong> Use the color pickers to select a custom color for the QR code and its background. For best results, ensure there is high contrast between the two colors.</li>
            <li><strong>Preview and Download:</strong> A preview of your QR code will be generated instantly. Once you are satisfied, click the "Download QR Code" button to save it as a high-quality PNG file.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Benefits of Using Our Tool</h2>
          <ul className="list-disc list-inside mt-2 space-y-2 text-slate-600 dark:text-slate-300">
            <li><strong>Instant Generation:</strong> Create QR codes in real-time as you type.</li>
            <li><strong>Customization:</strong> Personalize your QR code with custom colors to match your brand or style.</li>
            <li><strong>High-Resolution Output:</strong> Download your QR code as a high-quality PNG, suitable for both print and digital use.</li>
            <li><strong>Completely Free and Private:</strong> Your data is processed in your browser and is never stored on our servers.</li>
          </ul>
        </section>
        
        <section>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Frequently Asked Questions (FAQs)</h2>
            <div className="mt-2 space-y-3 text-slate-600 dark:text-slate-300">
              <div>
                <h3 className="font-semibold">What can I put in a QR code?</h3>
                <p>You can encode almost any text-based information, including website links, phone numbers, email addresses, Wi-Fi network credentials, and plain text messages.</p>
              </div>
              <div>
                <h3 className="font-semibold">Do QR codes expire?</h3>
                <p>No, the QR codes generated by this tool are static and do not expire. They will work as long as the encoded data (like a website link) is still valid.</p>
              </div>
            </div>
        </section>
      </div>
    </div>
  );
};

export default QrCodeGenerator;