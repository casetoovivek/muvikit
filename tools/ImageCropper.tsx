import React, { useState, useRef } from 'react';
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  type Crop,
  type PixelCrop,
} from 'react-image-crop';

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
): Crop {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}

const ImageCropper: React.FC = () => {
  const [imgSrc, setImgSrc] = useState('');
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect, setAspect] = useState<number | undefined>(16 / 9);

  function onSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined); // Makes crop preview update between images.
      const reader = new FileReader();
      reader.addEventListener('load', () =>
        setImgSrc(reader.result?.toString() || ''),
      );
      reader.readAsDataURL(e.target.files[0]);
    }
  }

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    }
  }

  function handleDownloadClick() {
    if (!completedCrop || !imgRef.current) {
        return;
    }
    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height,
    );

    const base64Image = canvas.toDataURL('image/jpeg');
    const a = document.createElement('a');
    a.href = base64Image;
    a.download = 'cropped-image.jpeg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  const handleClearImage = () => {
    setImgSrc('');
    setCrop(undefined);
    setCompletedCrop(undefined);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (input) {
      input.value = '';
    }
  };
  
  return (
    <div className="space-y-6">
       <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Image Cropper</h2>
          <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">Upload an image, adjust the crop area, and download the result.</p>
        </div>

      <div className="bg-white p-6 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
        <div className="flex gap-4">
          <label className="block">
            <span className="sr-only">Choose profile photo</span>
            <input type="file" onChange={onSelectFile} accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--theme-primary-light)] file:text-[var(--theme-primary)] hover:file:opacity-90 dark:file:bg-slate-700 dark:file:text-sky-300 dark:text-slate-400"/>
          </label>
          {imgSrc && (
            <button
              onClick={handleClearImage}
              className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-semibold rounded-full hover:bg-gray-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500"
            >
              Clear Image
            </button>
          )}
        </div>

        {imgSrc && (
          <div className="flex flex-col items-center space-y-4 mt-4">
             <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspect}
             >
                <img ref={imgRef} src={imgSrc} onLoad={onImageLoad} alt="Crop preview" className="max-h-[60vh] object-contain"/>
             </ReactCrop>
            <button
              onClick={handleDownloadClick}
              disabled={!completedCrop?.width || !completedCrop?.height}
              className="px-6 py-2 bg-[var(--theme-primary)] text-white font-semibold rounded-lg shadow-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:ring-opacity-75 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors dark:disabled:bg-slate-600"
            >
              Download Cropped Image
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageCropper;