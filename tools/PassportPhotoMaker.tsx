import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import ReactCrop, { centerCrop, makeAspectCrop, type Crop } from 'react-image-crop';
import { jsPDF } from 'jspdf';
import { SpinnerIcon, DownloadIcon, ImageIcon } from '../components/icons';

// --- TYPE DEFINITIONS ---
interface PassportTemplate {
  name: string;
  width_mm: number;
  height_mm: number;
  bg_color: string;
}

// --- CONSTANTS ---
const PASSPORT_TEMPLATES: Record<string, PassportTemplate> = {
    'India': { name: 'India', width_mm: 35, height_mm: 45, bg_color: '#FFFFFF' },
    'USA': { name: 'USA', width_mm: 51, height_mm: 51, bg_color: '#FFFFFF' },
    'UK': { name: 'United Kingdom', width_mm: 35, height_mm: 45, bg_color: '#F0F0F0' },
    'Schengen': { name: 'Schengen Visa', width_mm: 35, height_mm: 45, bg_color: '#E1E1E1' },
    'Custom': { name: 'Custom', width_mm: 50, height_mm: 50, bg_color: '#FFFFFF' },
};

const PRESET_COLORS = [
  '#FFFFFF', // White
  '#E1E1E1', // Light Grey (Schengen)
  '#D0E3F7', // Light Blue
  '#0073E6', // Standard Blue
  '#F0F0F0', // Off-White (UK)
  '#C0C0C0', // Silver Grey
  '#FF0000', // Red (for some countries)
  '#333333', // Dark Grey
];

const DPI = 300;
const MM_TO_INCH = 0.0393701;

// --- MAIN COMPONENT ---
const PassportPhotoMaker: React.FC = () => {
    // Input/Output State
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [processedImage, setProcessedImage] = useState<string | null>(null);
    
    // Control State
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');

    // Customization State
    const [templateKey, setTemplateKey] = useState('India');
    const [customSize, setCustomSize] = useState({ width_mm: 35, height_mm: 45 });
    const [bgType, setBgType] = useState<'color' | 'image' | 'blur'>('color');
    const [bgColor, setBgColor] = useState('#FFFFFF');
    const [bgImage, setBgImage] = useState<string | null>(null);
    const [imageFormat, setImageFormat] = useState<'png' | 'jpeg'>('jpeg');

    // Cropping State
    const [crop, setCrop] = useState<Crop>();
    const [aspect, setAspect] = useState(35 / 45);

    // Refs
    const originalImgRef = useRef<HTMLImageElement>(null);
    const processedImgRef = useRef<HTMLImageElement>(null);
    const previewCanvasRef = useRef<HTMLCanvasElement>(null);
    const bgImageInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const template = PASSPORT_TEMPLATES[templateKey];
        if (template) {
            setAspect(template.width_mm / template.height_mm);
            if (bgType === 'color') {
                setBgColor(template.bg_color);
            }
        }
    }, [templateKey, bgType]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setOriginalImage(event.target?.result as string);
                setProcessedImage(null);
                setCrop(undefined);
                setError('');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveBackground = async () => {
        if (!originalImage) return;
        setIsLoading(true);
        setStatus('Removing background with AI...');
        setError('');
        try {
            const base64Data = originalImage.split(',')[1];
            const mimeType = originalImage.split(';')[0].split(':')[1];
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: {
                    parts: [
                        { inlineData: { data: base64Data, mimeType } },
                        { text: 'Remove the background, making it transparent. Preserve fine details like hair.' }
                    ]
                },
                config: { responseModalities: [Modality.IMAGE] }
            });
            const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
            if (imagePart?.inlineData) {
                setProcessedImage(`data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`);
            } else {
                throw new Error("AI did not return an image.");
            }
        } catch (err: any) {
            setError(err.message || 'Failed to remove background.');
        } finally {
            setIsLoading(false);
            setStatus('');
        }
    };

    const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
        const { width, height } = e.currentTarget;
        const newCrop = centerCrop(makeAspectCrop({ unit: '%', width: 90 }, aspect, width, height), width, height);
        setCrop(newCrop);
    }, [aspect]);

    const handleBgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => setBgImage(event.target?.result as string);
            reader.readAsDataURL(file);
        }
    };
    
    // --- Centralized rendering logic for the live preview canvas ---
    useEffect(() => {
        const canvas = previewCanvasRef.current;
        const image = processedImgRef.current; // Ref on the image inside ReactCrop

        if (!canvas || !image || !crop?.width || !crop?.height) {
            return;
        }

        const template = templateKey === 'Custom' ? customSize : PASSPORT_TEMPLATES[templateKey];
        const targetWidthPx = Math.round(template.width_mm * MM_TO_INCH * DPI);
        const targetHeightPx = Math.round(template.height_mm * MM_TO_INCH * DPI);

        canvas.width = targetWidthPx;
        canvas.height = targetHeightPx;
        canvas.style.aspectRatio = `${targetWidthPx / targetHeightPx}`;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // Always start with a clean slate
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const drawSubject = () => {
            const scaleX = image.naturalWidth / image.width;
            const scaleY = image.naturalHeight / image.height;
            const cropX = crop.x * scaleX, cropY = crop.y * scaleY;
            const cropWidth = crop.width * scaleX, cropHeight = crop.height * scaleY;

            ctx.drawImage(
                image, cropX, cropY, cropWidth, cropHeight,
                0, 0, canvas.width, canvas.height
            );
        };

        // This promise wrapper handles the async nature of loading a background image.
        const drawBackgroundAndSubject = async () => {
            // --- Background Drawing Logic ---
            if (bgType === 'image' && bgImage) {
                try {
                    const bgImgElement = new Image();
                    bgImgElement.crossOrigin = 'anonymous';
                    await new Promise((resolve, reject) => {
                        bgImgElement.onload = resolve;
                        bgImgElement.onerror = reject;
                        bgImgElement.src = bgImage;
                    });
                    ctx.drawImage(bgImgElement, 0, 0, canvas.width, canvas.height);
                } catch (e) {
                    console.error("Failed to load background image, falling back to white.");
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
            } else if (bgType === 'color') {
                ctx.fillStyle = bgColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            } else {
                // For 'blur' (unimplemented) or for transparent PNG output.
                // If the target format is JPEG, we must provide a solid background.
                if (imageFormat === 'jpeg') {
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
                // Otherwise, the canvas remains transparent after clearRect for PNG output.
            }
            
            // --- Subject Drawing ---
            drawSubject();
        };

        drawBackgroundAndSubject();

    }, [processedImage, crop, bgColor, bgImage, bgType, templateKey, customSize, imageFormat]);


    const handleDownloadImage = () => {
        const canvas = previewCanvasRef.current;
        if (!canvas) return;

        const dataUrl = canvas.toDataURL(`image/${imageFormat}`);
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `passport_photo.${imageFormat}`;
        a.click();
    };

    const handleDownloadSheet = () => {
        const canvas = previewCanvasRef.current;
        if (!canvas) return;
        
        const imageDataUrl = canvas.toDataURL(`image/${imageFormat}`);
        const doc = new jsPDF('p', 'mm', 'a4');
        const template = templateKey === 'Custom' ? customSize : PASSPORT_TEMPLATES[templateKey];
        const { width_mm, height_mm } = template;
        const cols = Math.floor(210 / width_mm);
        const rows = Math.floor(297 / height_mm);

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                doc.addImage(imageDataUrl, imageFormat.toUpperCase(), j * width_mm, i * height_mm, width_mm, height_mm);
            }
        }
        doc.save('passport_sheet.pdf');
    };

    return (
        <div className="space-y-6">
            <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">AI Passport Photo Maker</h2>
                <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">Create professional passport photos with custom sizes and backgrounds.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Controls */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border dark:border-slate-700">
                        <h3 className="font-semibold mb-2">1. Upload Your Photo</h3>
                        <input type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--theme-primary-light)] file:text-[var(--theme-primary)] dark:file:bg-slate-700 dark:file:text-sky-300" />
                    </div>
                    
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border dark:border-slate-700">
                        <h3 className="font-semibold mb-2">2. Remove Background</h3>
                        <button onClick={handleRemoveBackground} disabled={!originalImage || isLoading} className="w-full p-2 bg-[var(--theme-primary)] text-white rounded-lg disabled:bg-slate-400 flex items-center justify-center">
                             {isLoading && status ? <><SpinnerIcon className="w-5 h-5 mr-2 animate-spin"/> {status}</> : 'Remove with AI'}
                        </button>
                    </div>

                    <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border dark:border-slate-700 space-y-3">
                        <h3 className="font-semibold">3. Adjust & Customize</h3>
                        <div>
                            <label className="text-sm font-medium">Country / Size</label>
                            <select value={templateKey} onChange={e => setTemplateKey(e.target.value)} className="w-full p-2 mt-1 border rounded dark:bg-slate-700">
                                {Object.keys(PASSPORT_TEMPLATES).map(key => <option key={key} value={key}>{PASSPORT_TEMPLATES[key].name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Background</label>
                            <div className="flex gap-2 mt-1">
                                <button onClick={() => setBgType('color')} className={`flex-1 p-2 rounded text-sm ${bgType === 'color' ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-600'}`}>Color</button>
                                <button onClick={() => setBgType('image')} className={`flex-1 p-2 rounded text-sm ${bgType === 'image' ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-600'}`}>Image</button>
                                <button onClick={() => setBgType('blur')} className={`flex-1 p-2 rounded text-sm ${bgType === 'blur' ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-600'}`}>Blur</button>
                            </div>
                        </div>
                         {bgType === 'color' && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-10 h-10 p-1 border rounded-md cursor-pointer dark:border-slate-600"/>
                                    <input type="text" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-full p-2 border rounded dark:bg-slate-700" />
                                </div>
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {PRESET_COLORS.map(color => (
                                        <button
                                            key={color}
                                            onClick={() => setBgColor(color)}
                                            className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${bgColor.toLowerCase() === color.toLowerCase() ? 'border-blue-500 ring-2 ring-blue-500' : 'border-slate-300 dark:border-slate-600'}`}
                                            style={{ backgroundColor: color }}
                                            aria-label={`Set background to ${color}`}
                                        />
                                    ))}
                                </div>
                            </div>
                         )}
                         {bgType === 'image' && (
                            <button onClick={() => bgImageInputRef.current?.click()} className="w-full p-2 bg-slate-200 dark:bg-slate-600 text-sm rounded flex items-center justify-center gap-2"><ImageIcon className="w-4 h-4"/> Upload Background</button>
                         )}
                         <input type="file" ref={bgImageInputRef} onChange={handleBgImageUpload} accept="image/*" className="hidden" />
                    </div>
                </div>

                {/* Previews */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border dark:border-slate-700 text-center">
                        <h3 className="font-semibold mb-2">Crop Subject</h3>
                         <div className="flex justify-center items-center h-96 bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden">
                            {processedImage ? (
                                <ReactCrop crop={crop} onChange={c => setCrop(c)} aspect={aspect}>
                                    <img ref={processedImgRef} src={processedImage} onLoad={onImageLoad} alt="Croppable subject" style={{ maxHeight: '24rem' }}/>
                                </ReactCrop>
                            ) : originalImage ? (
                                <img ref={originalImgRef} src={originalImage} alt="Original" className="max-h-96" />
                            ) : (<p className="text-slate-400">Upload an image to start</p>)}
                         </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border dark:border-slate-700 text-center">
                        <h3 className="font-semibold mb-2">Final Result</h3>
                        <div className="flex justify-center items-center h-96 bg-slate-100 dark:bg-slate-900 rounded-lg p-2" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Crect width='10' height='10' fill='%23f1f5f9'/%3E%3Crect x='10' y='10' width='10' height='10' fill='%23f1f5f9'/%3E%3Crect width='10' height='10' y='10' fill='%23e2e8f0'/%3E%3Crect x='10' width='10' height='10' fill='%23e2e8f0'/%3E%3C/svg%3E")`}}>
                            {processedImage && crop ? (
                                <canvas
                                    ref={previewCanvasRef}
                                    className="max-w-full max-h-full rounded-md shadow-md"
                                />
                            ) : (
                                <div className="text-center text-slate-400">
                                    <ImageIcon className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600"/>
                                    <p className="mt-2">Result will appear here</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Download Section */}
             {processedImage && crop && (
                <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border dark:border-slate-700 space-y-3">
                     <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Download</h3>
                     <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <div className="flex-1 w-full sm:w-auto">
                             <label className="text-sm">Image Format</label>
                            <select value={imageFormat} onChange={e => setImageFormat(e.target.value as any)} className="w-full p-2 border rounded dark:bg-slate-700">
                                <option value="jpeg">JPEG</option><option value="png">PNG</option>
                            </select>
                        </div>
                        <button onClick={handleDownloadImage} className="w-full sm:w-auto flex-1 p-3 bg-green-600 text-white font-semibold rounded-lg flex items-center justify-center gap-2">
                            <DownloadIcon className="w-5 h-5" /> Download Single Photo
                        </button>
                         <button onClick={handleDownloadSheet} className="w-full sm:w-auto flex-1 p-3 bg-red-600 text-white font-semibold rounded-lg flex items-center justify-center gap-2">
                            <DownloadIcon className="w-5 h-5" /> Download Photo Sheet (PDF)
                        </button>
                     </div>
                </div>
             )}
        </div>
    );
};

export default PassportPhotoMaker;