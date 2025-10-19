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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Image Converter</h2>
        <p className="mt-1 text-md text-gray-600 dark:text-slate-400">Convert images to PNG, JPG, or WEBP format.</p>
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
    </div>
  );
};

export default ImageConverter;