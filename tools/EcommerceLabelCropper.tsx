import React, { useState } from 'react';
import jsPDF from 'jspdf';
import { AmazonLogo, FlipkartLogo, MeeshoLogo, MyntraLogo, SnapdealLogo } from '../components/MarketplaceLogos';
import { SpinnerIcon, TrashIcon } from '../components/icons';

type Marketplace = 'Amazon' | 'Flipkart' | 'Meesho' | 'Snapdeal' | 'Myntra';
type LabelLayout = '1' | '2_horizontal' | '4_quadrant';
type PaperSize = 'A4' | '4x6';

const marketplaces = [
    { id: 'Amazon', name: 'Amazon', logo: <AmazonLogo className="h-20 w-20" /> },
    { id: 'Flipkart', name: 'Flipkart', logo: <FlipkartLogo className="h-20 w-20" /> },
    { id: 'Meesho', name: 'Meesho', logo: <MeeshoLogo className="h-20 w-auto" /> },
    { id: 'Snapdeal', name: 'Snapdeal', logo: <SnapdealLogo className="h-20 w-auto" /> },
    { id: 'Myntra', name: 'Myntra', logo: <MyntraLogo className="h-20 w-20" /> },
];

const cropPresets: Record<LabelLayout, { x: number; y: number; width: number; height: number }[]> = {
    '1': [{ x: 0, y: 0, width: 1, height: 1 }],
    '2_horizontal': [
        { x: 0, y: 0, width: 0.5, height: 1 },
        { x: 0.5, y: 0, width: 0.5, height: 1 },
    ],
    '4_quadrant': [
        { x: 0, y: 0, width: 0.5, height: 0.5 },
        { x: 0.5, y: 0, width: 0.5, height: 0.5 },
        { x: 0, y: 0.5, width: 0.5, height: 0.5 },
        { x: 0.5, y: 0.5, width: 0.5, height: 0.5 },
    ],
};

const EcommerceLabelCropper: React.FC = () => {
    const [selectedMarketplace, setSelectedMarketplace] = useState<Marketplace | null>(null);

    if (!selectedMarketplace) {
        return <MarketplaceSelector onSelect={setSelectedMarketplace} />;
    }

    return <LabelCropperInterface marketplace={selectedMarketplace} onBack={() => setSelectedMarketplace(null)} />;
};

const MarketplaceSelector: React.FC<{ onSelect: (m: Marketplace) => void }> = ({ onSelect }) => (
    <div className="space-y-6">
        <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">E.com Seller Label Cropper</h2>
            <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">Select a marketplace to begin cropping your shipping labels.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {marketplaces.map(m => (
                <div key={m.id} className="bg-white p-6 rounded-lg border border-slate-200 text-center space-y-4 flex flex-col justify-between dark:bg-slate-800 dark:border-slate-700">
                    <div className="flex justify-center items-center h-24">{m.logo}</div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">{m.name}</h3>
                        <p className="text-sm text-slate-500 mt-1 dark:text-slate-400">
                            Effortlessly streamline your {m.name} shipping label preparation with our intuitive, one-click solution.
                        </p>
                    </div>
                    <button
                        onClick={() => onSelect(m.id as Marketplace)}
                        className="w-full mt-4 px-4 py-2 bg-white border-2 border-[var(--theme-primary)] text-[var(--theme-primary)] font-semibold rounded-lg hover:bg-[var(--theme-primary-light)] transition-colors dark:bg-slate-700 dark:text-sky-300 dark:border-sky-500 dark:hover:bg-slate-600"
                    >
                        Crop {m.name} Shipping Labels
                    </button>
                </div>
            ))}
        </div>
    </div>
);

const LabelCropperInterface: React.FC<{ marketplace: Marketplace, onBack: () => void }> = ({ marketplace, onBack }) => {
    const [file, setFile] = useState<File | null>(null);
    const [labelLayout, setLabelLayout] = useState<LabelLayout>('1');
    const [paperSize, setPaperSize] = useState<PaperSize>('A4');
    const [croppedImages, setCroppedImages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
            setCroppedImages([]);
            setError('');
        } else {
            setFile(null);
            setError('Please select a valid PDF file.');
        }
    };

    const processPdf = async () => {
        if (!file) return;
        setIsLoading(true);
        setStatus('Processing PDF...');
        setError('');
        setCroppedImages([]);

        try {
            const pdfBytes = await file.arrayBuffer();
            const pdfDoc = await (window as any).pdfjsLib.getDocument({ data: pdfBytes }).promise;
            const preset = cropPresets[labelLayout];
            const cropped: string[] = [];

            for (let i = 1; i <= pdfDoc.numPages; i++) {
                setStatus(`Processing page ${i} of ${pdfDoc.numPages}...`);
                const page = await pdfDoc.getPage(i);
                const viewport = page.getViewport({ scale: 2.0 }); // High resolution
                const pageCanvas = document.createElement('canvas');
                pageCanvas.width = viewport.width;
                pageCanvas.height = viewport.height;
                const context = pageCanvas.getContext('2d');
                if (!context) continue;

                await page.render({ canvasContext: context, viewport: viewport }).promise;

                for (const cropArea of preset) {
                    const sx = pageCanvas.width * cropArea.x;
                    const sy = pageCanvas.height * cropArea.y;
                    const sWidth = pageCanvas.width * cropArea.width;
                    const sHeight = pageCanvas.height * cropArea.height;

                    const labelCanvas = document.createElement('canvas');
                    labelCanvas.width = sWidth;
                    labelCanvas.height = sHeight;
                    labelCanvas.getContext('2d')?.drawImage(pageCanvas, sx, sy, sWidth, sHeight, 0, 0, sWidth, sHeight);
                    cropped.push(labelCanvas.toDataURL('image/png'));
                }
            }
            setCroppedImages(cropped);
        } catch (e) {
            setError('Failed to process PDF. It might be corrupted or password-protected.');
            console.error(e);
        } finally {
            setIsLoading(false);
            setStatus('');
        }
    };

    const mergeAndDownload = async () => {
        if (croppedImages.length === 0) return;
        setIsLoading(true);
        setStatus('Merging labels into PDF...');

        const isA4 = paperSize === 'A4';
        const doc = new jsPDF({
            orientation: isA4 ? 'p' : 'l',
            unit: 'mm',
            format: isA4 ? 'a4' : [152.4, 101.6] // 6x4 inches in mm
        });

        if (!isA4) { // For 4x6, one label per page
            for (let i = 0; i < croppedImages.length; i++) {
                if (i > 0) doc.addPage();
                doc.addImage(croppedImages[i], 'PNG', 0, 0, 152.4, 101.6);
            }
        } else { // For A4, fit 4 labels per page
            const labelsPerPage = 4;
            const labelWidth = 105; // A6 width
            const labelHeight = 148.5; // A6 height
            const positions = [
                { x: 0, y: 0 },
                { x: 105, y: 0 },
                { x: 0, y: 148.5 },
                { x: 105, y: 148.5 },
            ];

            for (let i = 0; i < croppedImages.length; i++) {
                const pageIndex = Math.floor(i / labelsPerPage);
                const posIndex = i % labelsPerPage;

                if (i > 0 && posIndex === 0) doc.addPage();
                doc.addImage(croppedImages[i], 'PNG', positions[posIndex].x, positions[posIndex].y, labelWidth, labelHeight);
            }
        }

        doc.save(`${marketplace}_labels_${paperSize}.pdf`);
        setIsLoading(false);
        setStatus('');
    };

    const removeImage = (index: number) => {
        setCroppedImages(current => current.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-6">
            <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
                <button onClick={onBack} className="text-sm text-[var(--theme-primary)] hover:underline mb-2 dark:text-sky-400">
                    &larr; Back to Marketplace Selection
                </button>
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{marketplace} Label Cropper</h2>
                <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">Upload, process, and merge your shipping labels.</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4 dark:bg-slate-800 dark:border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-slate-300">1. Upload Label PDF</label>
                        <input type="file" accept="application/pdf" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--theme-primary-light)] file:text-[var(--theme-primary)] hover:file:opacity-90 dark:file:bg-slate-700 dark:file:text-sky-300 dark:text-slate-400" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-slate-300">2. Labels per Page Layout</label>
                        <select value={labelLayout} onChange={e => setLabelLayout(e.target.value as LabelLayout)} className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                            <option value="1">1 Label per Page</option>
                            <option value="2_horizontal">2 Labels per Page (Side-by-side)</option>
                            <option value="4_quadrant">4 Labels per Page (2x2 Grid)</option>
                        </select>
                    </div>
                </div>
                <button onClick={processPdf} disabled={!file || isLoading} className="w-full px-6 py-3 bg-[var(--theme-primary)] text-white font-semibold rounded-lg shadow-md hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center dark:disabled:bg-slate-600">
                    {isLoading ? <><SpinnerIcon className="w-5 h-5 mr-2 animate-spin" /> {status} </> : '3. Process Labels'}
                </button>
                {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>

            {croppedImages.length > 0 && (
                <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4 dark:bg-slate-800 dark:border-slate-700">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Cropped Labels ({croppedImages.length})</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg max-h-96 overflow-y-auto dark:bg-slate-900">
                        {croppedImages.map((src, index) => (
                            <div key={index} className="relative group border rounded-md overflow-hidden">
                                <img src={src} alt={`Label ${index + 1}`} className="w-full h-auto" />
                                <button onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <TrashIcon className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                     <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                             <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-slate-300">4. Output Paper Size</label>
                             <select value={paperSize} onChange={e => setPaperSize(e.target.value as PaperSize)} className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                                <option value="A4">A4 (4 labels per page)</option>
                                <option value="4x6">4" x 6" Thermal (1 label per page)</option>
                            </select>
                        </div>
                        <div className="flex-1 self-end">
                            <button onClick={mergeAndDownload} disabled={isLoading} className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center dark:disabled:bg-slate-600">
                                {isLoading ? <><SpinnerIcon className="w-5 h-5 mr-2 animate-spin" /> {status} </> : '5. Merge & Download PDF'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EcommerceLabelCropper;