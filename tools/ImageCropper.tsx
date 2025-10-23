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
  const [aspect, setAspect] = useState<number | undefined>(undefined);

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
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Free Online Image Cropper</h1>
          <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">Easily crop your images to the perfect size with our free online image cropper. Perfect for social media posts, website banners, or personal projects.</p>
        </div>

      <div className="bg-white p-6 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
          <label className="block">
            <span className="sr-only">Choose profile photo</span>
            <input type="file" onChange={onSelectFile} accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--theme-primary-light)] file:text-[var(--theme-primary)] hover:file:opacity-90 dark:file:bg-slate-700 dark:file:text-sky-300 dark:text-slate-400"/>
          </label>
           <div className="flex gap-4 items-center">
             <select onChange={(e) => setAspect(e.target.value ? parseFloat(e.target.value) : undefined)} className="p-2 border rounded-md text-sm dark:bg-slate-700 dark:border-slate-600">
                <option value="">Freeform</option>
                <option value="1">1:1 (Square)</option>
                <option value="1.91">1.91:1 (Landscape)</option>
                <option value="1.777">16:9 (Widescreen)</option>
                <option value="0.8">4:5 (Portrait)</option>
             </select>
             {imgSrc && (
                <button
                onClick={handleClearImage}
                className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-semibold rounded-full hover:bg-gray-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500"
                >
                Clear
                </button>
            )}
           </div>
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

      <div className="bg-white p-6 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 space-y-6">
        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">What is an Image Cropper?</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">An Image Cropper is a tool that allows you to select a specific area of an image and remove the unwanted outer parts. This process is essential for focusing on the main subject, changing the aspect ratio, or fitting an image into a specific layout. Unlike resizing, which shrinks or stretches the entire image, cropping trims the edges to reframe the content, which is crucial for improving composition and removing distracting elements.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">How to Use This Image Cropper</h2>
          <ol className="list-decimal list-inside mt-2 space-y-2 text-slate-600 dark:text-slate-300">
            <li><strong>Upload Your Image:</strong> Click the "Choose File" button to select an image from your device.</li>
            <li><strong>Select an Aspect Ratio (Optional):</strong> Choose a preset like Square (1:1) or Portrait (4:5), or leave it as "Freeform" to crop any shape.</li>
            <li><strong>Adjust the Crop Area:</strong> Click and drag the handles on the crop selection to adjust its size and position. The highlighted area is what you will keep.</li>
            <li><strong>Download the Result:</strong> Once you are happy with the selection, click the "Download Cropped Image" button to save the new image to your device.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Benefits of Using Our Tool</h2>
          <ul className="list-disc list-inside mt-2 space-y-2 text-slate-600 dark:text-slate-300">
            <li><strong>Completely Secure:</strong> All cropping is done directly in your browser. Your images are never uploaded to our servers.</li>
            <li><strong>Fast and Simple:</strong> The intuitive interface makes it easy to crop your image in seconds, without any complicated software.</li>
            <li><strong>Preset Aspect Ratios:</strong> Quickly crop for common social media sizes like Instagram posts or stories with our presets.</li>
            <li><strong>No Quality Loss:</strong> The cropped section of your image retains its original quality.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Why Choose Our Online Image Cropper?</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">Our free online image cropper prioritizes your privacy and speed. By processing everything on your own device, we ensure your files remain secure. It's built to be a quick, no-fuss solution for your daily cropping needs, whether you're a content creator, student, or just need to quickly edit a photo.</p>
        </section>

        <section>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Related Tools</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
                After cropping, you might also need our <a href="#" className="text-[var(--theme-primary)] hover:underline dark:text-sky-400">Image Resizer</a> to change its dimensions or our <a href="#" className="text-[var(--theme-primary)] hover:underline dark:text-sky-400">Image Converter</a> to change its format.
            </p>
        </section>
        
        <section>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Frequently Asked Questions (FAQs)</h2>
            <div className="mt-2 space-y-3 text-slate-600 dark:text-slate-300">
              <div>
                <h3 className="font-semibold">Is this online image cropper free to use?</h3>
                <p>Yes, our tool is completely free with no limits on usage.</p>
              </div>
              <div>
                <h3 className="font-semibold">Are my uploaded images safe?</h3>
                <p>Absolutely. Your images are processed client-side, meaning they never leave your computer. We do not store or see your files.</p>
              </div>
               <div>
                <h3 className="font-semibold">What image formats are supported?</h3>
                <p>You can upload most common image formats, including JPG, PNG, WEBP, and GIF. The output will be downloaded as a JPG file.</p>
              </div>
            </div>
        </section>
      </div>
    </div>
  );
};

export default ImageCropper;