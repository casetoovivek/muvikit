import React, { useState, useRef } from 'react';

type ImageFormat = 'image/png' | 'image/jpeg' | 'image/webp';

const ImageConverter: React.FC = () => {
  const [sourceImg, setSourceImg] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState<ImageFormat>('image/png');
  const [fileName, setFileName] = useState('');
  const imageRef = useRef<HTMLImageElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSourceImg(event.target?.result as string);
        setFileName(file.name.split('.').slice(0, -1).join('.'));
      };
      reader.readAsDataURL(file);
    }
  };

  const convertAndDownload = () => {
    if (!sourceImg || !imageRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = imageRef.current.naturalWidth;
    canvas.height = imageRef.current.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // If converting to a format that doesn't support transparency (like JPEG), fill with white first
    if(targetFormat === 'image/jpeg'){
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0,0,canvas.width,canvas.height);
    }
    
    ctx.drawImage(imageRef.current, 0, 0);

    const dataUrl = canvas.toDataURL(targetFormat, 0.9);
    
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${fileName}.${targetFormat.split('/')[1]}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Free Online Image Converter</h1>
        <p className="mt-1 text-lg text-gray-600 dark:text-slate-400">Easily convert your images to PNG, JPG, or WEBP format. Fast, secure, and completely free.</p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4 dark:bg-slate-800 dark:border-slate-700">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--theme-primary-light)] file:text-[var(--theme-primary)] hover:file:opacity-90 dark:file:bg-slate-700 dark:file:text-sky-300 dark:text-slate-400"
        />

        {sourceImg && (
          <div className="space-y-4">
            <div className="flex justify-center p-4 bg-gray-100 rounded-lg dark:bg-slate-900">
                <img ref={imageRef} src={sourceImg} alt="Preview" className="max-h-64 object-contain" />
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <label htmlFor="format" className="font-medium text-gray-700 dark:text-slate-300">Convert to:</label>
              <select
                id="format"
                value={targetFormat}
                onChange={(e) => setTargetFormat(e.target.value as ImageFormat)}
                className="block w-full sm:w-auto px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              >
                <option value="image/png">PNG</option>
                <option value="image/jpeg">JPEG</option>
                <option value="image/webp">WEBP</option>
              </select>
              <button
                onClick={convertAndDownload}
                className="w-full sm:w-auto px-6 py-2 bg-[var(--theme-primary)] text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition-colors"
              >
                Convert and Download
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-white p-6 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 space-y-6">
        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">What is an Image Converter?</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">An Image Converter is a tool that changes the file format of an image (e.g., from JPG to PNG). Different image formats have different strengths: JPGs are great for photos due to their small file size, PNGs are ideal for graphics that require a transparent background, and WEBPs offer superior compression for web use. Our converter allows you to easily switch between these popular formats to suit your specific needs.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">How to Use This Converter</h2>
          <ol className="list-decimal list-inside mt-2 space-y-2 text-slate-600 dark:text-slate-300">
            <li><strong>Upload Your Image:</strong> Click "Choose File" and select the image you want to convert.</li>
            <li><strong>Select the Target Format:</strong> Use the dropdown menu to choose your desired output format (PNG, JPEG, or WEBP).</li>
            <li><strong>Convert and Download:</strong> Click the "Convert and Download" button. Your converted image will be saved to your device.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Benefits of Using Our Tool</h2>
          <ul className="list-disc list-inside mt-2 space-y-2 text-slate-600 dark:text-slate-300">
            <li><strong>Secure and Private:</strong> All conversions happen in your browser. Your images are never uploaded to any servers.</li>
            <li><strong>Supports Major Formats:</strong> Convert to and from the most popular web formats: PNG, JPEG, and WEBP.</li>
            <li><strong>Simple Interface:</strong> A straightforward process that takes just a few clicks.</li>
            <li><strong>Free to Use:</strong> Convert as many images as you need without any cost.</li>
          </ul>
        </section>

        <section>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Related Tools</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
                After converting, you may want to <a href="#" className="text-[var(--theme-primary)] hover:underline dark:text-sky-400">Compress Image</a> to reduce its file size or use the <a href="#" className="text-[var(--theme-primary)] hover:underline dark:text-sky-400">Image Cropper</a>.
            </p>
        </section>
        
        <section>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Frequently Asked Questions (FAQs)</h2>
            <div className="mt-2 space-y-3 text-slate-600 dark:text-slate-300">
              <div>
                <h3 className="font-semibold">Will converting an image reduce its quality?</h3>
                <p>Converting between formats like PNG (lossless) and JPEG (lossy) can affect quality. Our tool aims to maintain the highest possible quality during conversion, but converting to a lossy format like JPEG will always involve some level of compression.</p>
              </div>
              <div>
                <h3 className="font-semibold">What is the WEBP format?</h3>
                <p>WEBP is a modern image format developed by Google that provides superior lossless and lossy compression for images on the web, resulting in smaller file sizes and faster-loading websites.</p>
              </div>
            </div>
        </section>
      </div>
    </div>
  );
};

export default ImageConverter;