import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import { SpinnerIcon } from '../components/icons';

const ImageResizer: React.FC = () => {
  const [sourceImg, setSourceImg] = useState<string | null>(null);
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [keepAspectRatio, setKeepAspectRatio] = useState(true);
  const [format, setFormat] = useState<'jpeg' | 'png' | 'webp'>('png');
  const [isProcessing, setIsProcessing] = useState(false);

  const originalAspectRatio = useRef<number>(1);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          originalAspectRatio.current = img.naturalWidth / img.naturalHeight;
          setWidth(String(img.naturalWidth));
          setHeight(String(img.naturalHeight));
          setFormat(file.type === 'image/png' ? 'png' : 'jpeg');
        };
        img.src = event.target?.result as string;
        setSourceImg(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleWidthChange = (e: ChangeEvent<HTMLInputElement>) => {
      const newWidth = e.target.value;
      setWidth(newWidth);
      if (keepAspectRatio) {
          const w = parseInt(newWidth, 10);
          if (!isNaN(w) && originalAspectRatio.current > 0) {
              setHeight(String(Math.round(w / originalAspectRatio.current)));
          } else {
              setHeight('');
          }
      }
  }
  
  const handleHeightChange = (e: ChangeEvent<HTMLInputElement>) => {
      const newHeight = e.target.value;
      setHeight(newHeight);
      if (keepAspectRatio) {
          const h = parseInt(newHeight, 10);
          if (!isNaN(h) && originalAspectRatio.current > 0) {
              setWidth(String(Math.round(h * originalAspectRatio.current)));
          } else {
              setWidth('');
          }
      }
  }

  const handleResizeAndDownload = async () => {
    if (!sourceImg) return;
    const w = parseInt(width, 10);
    const h = parseInt(height, 10);
    if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) return;

    setIsProcessing(true);
    
    await new Promise(resolve => setTimeout(resolve, 50));

    try {
        const img = new Image();
        img.src = sourceImg;
        await new Promise(r => img.onload = r);

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        if (format === 'jpeg') {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, w, h);
        }
        
        ctx.drawImage(img, 0, 0, w, h);

        const dataUrl = canvas.toDataURL(`image/${format}`, 0.95);
        
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `resized-image.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } catch (e) {
        console.error("Failed to resize image", e);
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Free Online Image Resizer</h1>
        <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">Change the dimensions of your images in pixels (px). Resize JPG, PNG, and WEBP files while maintaining aspect ratio.</p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4 dark:bg-slate-800 dark:border-slate-700">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--theme-primary-light)] file:text-[var(--theme-primary)] hover:file:opacity-90 dark:file:bg-slate-700 dark:file:text-sky-300 dark:text-slate-400"
        />

        {sourceImg && (
          <div className="pt-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="flex justify-center items-center bg-slate-100 dark:bg-slate-900 rounded-lg p-4 h-96">
                <img src={sourceImg} alt="Preview" className="max-h-full max-w-full object-contain" />
            </div>

            <div className="space-y-6">
                <div>
                    <h3 className="font-semibold text-lg mb-2 text-slate-700 dark:text-slate-200">New Dimensions</h3>
                    <div className="grid grid-cols-2 gap-4 items-center">
                        <input type="number" placeholder="Width" value={width} onChange={handleWidthChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"/>
                        <input type="number" placeholder="Height" value={height} onChange={handleHeightChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"/>
                    </div>
                    <label className="flex items-center space-x-2 mt-3 text-sm dark:text-slate-300">
                        <input type="checkbox" checked={keepAspectRatio} onChange={() => setKeepAspectRatio(!keepAspectRatio)} className="h-4 w-4 rounded border-gray-300 text-[var(--theme-primary)] focus:ring-[var(--theme-primary)] dark:border-slate-500" />
                        <span>Keep aspect ratio</span>
                    </label>
                </div>
                
                <div>
                    <h3 className="font-semibold text-lg mb-2 text-slate-700 dark:text-slate-200">Output Format</h3>
                     <div className="grid grid-cols-3 gap-2 mb-4">
                        {(['png', 'jpeg', 'webp'] as const).map(f => (
                            <button key={f} onClick={() => setFormat(f)} className={`py-2 text-sm font-semibold rounded-md ${format === f ? 'bg-[var(--theme-primary)] text-white' : 'bg-slate-200 dark:bg-slate-600'}`}>{f.toUpperCase()}</button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={handleResizeAndDownload}
                    disabled={isProcessing}
                    className="w-full px-6 py-3 bg-[var(--theme-primary)] text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition-colors disabled:bg-gray-400 flex items-center justify-center"
                >
                  {isProcessing ? <><SpinnerIcon className="w-5 h-5 mr-2 animate-spin"/> Resizing...</> : 'Resize and Download'}
                </button>
            </div>
          </div>
        )}
      </div>

       <div className="bg-white p-6 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 space-y-6 max-w-4xl mx-auto">
        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">What is an Image Resizer?</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">An Image Resizer is a tool that changes the pixel dimensions (width and height) of an image. This is different from compressing an image, which reduces its file size (in KB/MB), or cropping, which trims the edges. Resizing is essential when you need an image to fit specific dimensions, such as a website banner, a social media profile picture, or a thumbnail for a blog post. Our tool allows you to set precise dimensions and can automatically maintain the original aspect ratio to prevent distortion.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">How to Use This Resizer</h2>
          <ol className="list-decimal list-inside mt-2 space-y-2 text-slate-600 dark:text-slate-300">
            <li><strong>Upload Your Image:</strong> Select an image file from your device.</li>
            <li><strong>Enter New Dimensions:</strong> Type your desired width or height in pixels. If "Keep aspect ratio" is checked, the other dimension will update automatically.</li>
            <li><strong>Choose Output Format:</strong> Select whether you want to save the resized image as a PNG, JPEG, or WEBP.</li>
            <li><strong>Download Your Image:</strong> Click "Resize and Download" to save the newly sized image.</li>
          </ol>
        </section>

         <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Why Choose Our Image Resizer?</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">Our tool is fast, private, and easy to use. All processing happens in your browser, so your images are never uploaded to a server. The "Keep aspect ratio" feature ensures your photos are never stretched or distorted. It’s the perfect solution for quick and secure image resizing.</p>
        </section>

        <section>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Related Tools</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
                You might also need our <a href="#" className="text-[var(--theme-primary)] hover:underline dark:text-sky-400">Image Cropper</a> to trim your image or the <a href="#" className="text-[var(--theme-primary)] hover:underline dark:text-sky-400">Image Compressor</a> to reduce file size.
            </p>
        </section>
        
        <section>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Frequently Asked Questions (FAQs)</h2>
            <div className="mt-2 space-y-3 text-slate-600 dark:text-slate-300">
              <div>
                <h3 className="font-semibold">Will resizing my image reduce its quality?</h3>
                <p>Making an image smaller (downsizing) generally maintains good quality. Making an image larger (upsizing) can cause it to look blurry or pixelated, as the software has to guess what the new pixels should be.</p>
              </div>
              <div>
                <h3 className="font-semibold">What is aspect ratio?</h3>
                <p>Aspect ratio is the proportional relationship between the width and height of an image. Keeping it locked ensures your image doesn't look stretched or squashed after resizing.</p>
              </div>
            </div>
        </section>
      </div>
    </div>
  );
};

export default ImageResizer;