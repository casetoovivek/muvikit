import React, { useState } from 'react';
import jsPDF from 'jspdf';
import { SpinnerIcon } from '../components/icons';

const ImageToPdf: React.FC = () => {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const imagePromises = files.map(file => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            resolve(event.target?.result as string);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      Promise.all(imagePromises).then(base64Images => {
        setImages(prev => [...prev, ...base64Images]);
      });
    }
  };

  const convertAndDownload = async () => {
    if (images.length === 0) return;
    setLoading(true);

    const pdf = new jsPDF('p', 'mm', 'a4');
    const a4Width = 210;
    const a4Height = 297;
    const margin = 10;
    const maxWidth = a4Width - margin * 2;
    const maxHeight = a4Height - margin * 2;

    for (let i = 0; i < images.length; i++) {
      const imgData = images[i];
      const img = new Image();
      img.src = imgData;
      
      await new Promise<void>(resolve => {
          img.onload = () => {
            if (i > 0) pdf.addPage();
            
            const imgWidth = img.width;
            const imgHeight = img.height;
            const ratio = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
            
            const newWidth = imgWidth * ratio;
            const newHeight = imgHeight * ratio;
            
            const x = (a4Width - newWidth) / 2;
            const y = (a4Height - newHeight) / 2;

            pdf.addImage(imgData, 'JPEG', x, y, newWidth, newHeight);
            resolve();
          };
      });
    }

    pdf.save('converted-images.pdf');
    setLoading(false);
  };
  
  const clearImages = () => {
      setImages([]);
  }

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Image to PDF Converter</h2>
        <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">Upload one or more images to convert them into a single PDF file.</p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4 dark:bg-slate-800 dark:border-slate-700">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-slate-300">Select Images</label>
          <input
            type="file"
            accept="image/jpeg, image/png, image/webp"
            multiple
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--theme-primary-light)] file:text-[var(--theme-primary)] hover:file:opacity-90 dark:file:bg-slate-700 dark:file:text-sky-300 dark:text-slate-400"
          />
        </div>

        {images.length > 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4 bg-slate-50 rounded-lg max-h-96 overflow-y-auto dark:bg-slate-900">
              {images.map((src, index) => (
                <img key={index} src={src} alt={`Preview ${index + 1}`} className="w-full h-auto object-cover rounded-md border dark:border-slate-700" />
              ))}
            </div>
            <div className="flex gap-4">
                <button
                  onClick={convertAndDownload}
                  disabled={loading}
                  className="flex-1 px-6 py-2 bg-[var(--theme-primary)] text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition-colors disabled:bg-gray-400 flex justify-center items-center dark:disabled:bg-slate-600"
                >
                  {loading ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : 'Convert and Download PDF'}
                </button>
                 <button
                  onClick={clearImages}
                  className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 transition-colors dark:bg-slate-600 dark:hover:bg-slate-500"
                >
                  Clear
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageToPdf;