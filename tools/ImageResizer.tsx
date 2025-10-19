import React, { useState, useRef, ChangeEvent } from 'react';

const ImageResizer: React.FC = () => {
  const [sourceImg, setSourceImg] = useState<string | null>(null);
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [keepAspectRatio, setKeepAspectRatio] = useState(true);
  const imageRef = useRef<HTMLImageElement>(null);
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
          if (!isNaN(w)) {
              setHeight(String(Math.round(w / originalAspectRatio.current)));
          }
      }
  }
  
  const handleHeightChange = (e: ChangeEvent<HTMLInputElement>) => {
      const newHeight = e.target.value;
      setHeight(newHeight);
      if (keepAspectRatio) {
          const h = parseInt(newHeight, 10);
          if (!isNaN(h)) {
              setWidth(String(Math.round(h * originalAspectRatio.current)));
          }
      }
  }

  const resizeAndDownload = () => {
    if (!sourceImg || !imageRef.current) return;
    const w = parseInt(width, 10);
    const h = parseInt(height, 10);
    if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) return;

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(imageRef.current, 0, 0, w, h);

    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `resized-image.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Image Resizer</h2>
        <p className="mt-1 text-md text-gray-600 dark:text-slate-400">Resize an image to your desired dimensions.</p>
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
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <input type="number" placeholder="Width" value={width} onChange={handleWidthChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"/>
                <input type="number" placeholder="Height" value={height} onChange={handleHeightChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"/>
            </div>
             <label className="flex items-center space-x-2 dark:text-slate-300">
                <input type="checkbox" checked={keepAspectRatio} onChange={() => setKeepAspectRatio(!keepAspectRatio)} className="h-5 w-5 rounded border-gray-300 text-[var(--theme-primary)] focus:ring-[var(--theme-primary)] dark:border-slate-500" />
                <span>Keep aspect ratio</span>
            </label>
            <button
              onClick={resizeAndDownload}
              className="w-full px-6 py-2 bg-[var(--theme-primary)] text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition-colors"
            >
              Resize and Download
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageResizer;