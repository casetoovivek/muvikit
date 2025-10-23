import React, { useState, useRef, useCallback } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { SpinnerIcon, DownloadIcon } from '../components/icons';

// --- TYPE DEFINITIONS ---
interface TextItem {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontName: string;
  pageIndex: number;
}

interface PageInfo {
  imageUrl: string;
  width: number;
  height: number;
  pdfLibPage: any; // Store the original pdf-lib page object for easier access
}

interface Edit {
    text: string;
    fontSize: number;
    color: string;
    isBold: boolean;
    isItalic: boolean;
}

type EditsMap = Map<string, Edit>;

// --- HELPER FUNCTIONS ---
const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
              r: parseInt(result[1], 16) / 255,
              g: parseInt(result[2], 16) / 255,
              b: parseInt(result[3], 16) / 255,
          }
        : { r: 0, g: 0, b: 0 };
};

const mapFont = (fontName: string, isBold: boolean, isItalic: boolean): StandardFonts => {
    const lowerFont = fontName.toLowerCase();
    
    if (lowerFont.includes('times')) {
        if (isBold && isItalic) return StandardFonts.TimesRomanBoldItalic;
        if (isBold) return StandardFonts.TimesRomanBold;
        if (isItalic) return StandardFonts.TimesRomanItalic;
        return StandardFonts.TimesRoman;
    }

    if (lowerFont.includes('courier')) {
        if (isBold && isItalic) return StandardFonts.CourierBoldOblique;
        if (isBold) return StandardFonts.CourierBold;
        if (isItalic) return StandardFonts.CourierOblique;
        return StandardFonts.Courier;
    }
    
    // Default to Helvetica as a fallback
    if (isBold && (isItalic || lowerFont.includes('oblique'))) return StandardFonts.HelveticaBoldOblique;
    if (isBold) return StandardFonts.HelveticaBold;
    if (isItalic || lowerFont.includes('oblique')) return StandardFonts.HelveticaOblique;
    return StandardFonts.Helvetica;
};


// --- FLOATING TOOLBAR COMPONENT ---
interface FloatingToolbarProps {
    edit: Edit;
    position: { top: number; left: number };
    onUpdate: (update: Partial<Edit>) => void;
    onApply: () => void;
    onCancel: () => void;
}

const FloatingToolbar: React.FC<FloatingToolbarProps> = ({ edit, position, onUpdate, onApply, onCancel }) => {
    return (
        <div 
            style={{ top: position.top, left: position.left }} 
            className="absolute z-20 bg-white dark:bg-slate-700 p-2 rounded-lg shadow-lg border dark:border-slate-600 flex flex-col gap-2 w-64"
            onClick={e => e.stopPropagation()} // Prevent clicks inside from closing it
        >
            <textarea
                value={edit.text}
                onChange={(e) => onUpdate({ text: e.target.value })}
                className="w-full p-1 border rounded dark:bg-slate-600 dark:border-slate-500 text-sm"
                rows={3}
            />
            <div className="flex items-center gap-2">
                <input type="number" value={edit.fontSize} onChange={e => onUpdate({ fontSize: parseFloat(e.target.value) || 10 })} className="w-16 p-1 border rounded text-sm dark:bg-slate-600 dark:border-slate-500" />
                <input type="color" value={edit.color} onChange={e => onUpdate({ color: e.target.value })} className="w-8 h-8 p-0 border-none rounded cursor-pointer" />
                <button onClick={() => onUpdate({ isBold: !edit.isBold })} className={`font-bold w-8 h-8 rounded ${edit.isBold ? 'bg-blue-500 text-white' : 'bg-slate-200 dark:bg-slate-500'}`}>B</button>
                <button onClick={() => onUpdate({ isItalic: !edit.isItalic })} className={`italic w-8 h-8 rounded ${edit.isItalic ? 'bg-blue-500 text-white' : 'bg-slate-200 dark:bg-slate-500'}`}>I</button>
            </div>
            <div className="flex justify-end gap-2">
                <button onClick={onCancel} className="px-3 py-1 text-xs bg-slate-200 dark:bg-slate-500 rounded">Cancel</button>
                <button onClick={onApply} className="px-3 py-1 text-xs bg-blue-500 text-white rounded">Apply</button>
            </div>
        </div>
    );
};


// --- MAIN PDF TEXT EDITOR COMPONENT ---
const PdfTextEditor: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [pages, setPages] = useState<PageInfo[]>([]);
    const [textItems, setTextItems] = useState<TextItem[]>([]);
    const [edits, setEdits] = useState<EditsMap>(new Map());
    const [currentEdit, setCurrentEdit] = useState<({ id: string } & Edit) | null>(null);
    const [toolbarPosition, setToolbarPosition] = useState<{ top: number; left: number } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const resetState = () => {
        setFile(null);
        setPages([]);
        setTextItems([]);
        setEdits(new Map());
        setCurrentEdit(null);
        setIsLoading(false);
        setStatus('');
        setError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const processPdf = useCallback(async (pdfFile: File) => {
        setIsLoading(true);
        setStatus('Analyzing PDF...');
        resetState();
        setFile(pdfFile);

        try {
            const pdfBytes = await pdfFile.arrayBuffer();
            // Create a separate copy for pdf-lib to prevent ArrayBuffer detachment issues caused by pdf.js.
            const pdfLibBytes = pdfBytes.slice(0);

            // Pass a Uint8Array view to pdf.js.
            const pdfjsDoc = await (window as any).pdfjsLib.getDocument({ data: new Uint8Array(pdfBytes) }).promise;
            
            // Load pdf-lib with its own safe copy of the bytes.
            const pdfLibDoc = await PDFDocument.load(pdfLibBytes);
            
            const numPages = pdfjsDoc.numPages;
            const newPages: PageInfo[] = [];
            const newTextItems: TextItem[] = [];

            for (let i = 1; i <= numPages; i++) {
                setStatus(`Processing page ${i} of ${numPages}...`);
                const page = await pdfjsDoc.getPage(i);
                const viewport = page.getViewport({ scale: 1.5 }); // Use a fixed scale for consistency

                const canvas = document.createElement('canvas');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                const context = canvas.getContext('2d');
                if (!context) continue;
                await page.render({ canvasContext: context, viewport: viewport }).promise;
                newPages.push({ imageUrl: canvas.toDataURL(), width: viewport.width, height: viewport.height, pdfLibPage: pdfLibDoc.getPage(i-1) });

                const textContent = await page.getTextContent();
                for (const [itemIndex, item] of textContent.items.entries()) {
                    if ('str' in item && item.str.trim()) {
                         const tx = (window as any).pdfjsLib.Util.transform(viewport.transform, item.transform);
                         newTextItems.push({
                            id: `p${i-1}-i${itemIndex}`,
                            text: item.str,
                            x: tx[4],
                            y: viewport.height - tx[5], // Convert to top-left origin
                            width: item.width,
                            height: item.height,
                            fontName: item.fontName,
                            pageIndex: i - 1,
                         });
                    }
                }
            }
            setPages(newPages);
            setTextItems(newTextItems);
        } catch (e) {
            console.error(e);
            setError('Failed to process PDF. It may be corrupted or password-protected.');
        } finally {
            setIsLoading(false);
            setStatus('');
        }
    }, []);
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            processPdf(selectedFile);
        } else if (selectedFile) {
            setError('Please select a valid PDF file.');
        }
    };

    const handleTextClick = (item: TextItem, e: React.MouseEvent) => {
        e.stopPropagation();
        const existingEdit = edits.get(item.id);
        const fontNameLower = item.fontName.toLowerCase();
        setCurrentEdit({
            id: item.id,
            text: existingEdit?.text ?? item.text,
            fontSize: existingEdit?.fontSize ?? Math.round(item.height * 0.9), // Approximate font size
            color: existingEdit?.color ?? '#000000', // Default to black
            isBold: existingEdit?.isBold ?? fontNameLower.includes('bold'),
            isItalic: existingEdit?.isItalic ?? (fontNameLower.includes('italic') || fontNameLower.includes('oblique')),
        });
        const containerRect = containerRef.current?.getBoundingClientRect();
        if (containerRect) {
            setToolbarPosition({ top: e.clientY - containerRect.top, left: e.clientX - containerRect.left + 10 });
        }
    };

    const handleApplyEdit = () => {
        if (!currentEdit) return;
        const newEdits = new Map(edits);
        newEdits.set(currentEdit.id, {
            text: currentEdit.text,
            fontSize: currentEdit.fontSize,
            color: currentEdit.color,
            isBold: currentEdit.isBold,
            isItalic: currentEdit.isItalic,
        });
        setEdits(newEdits);
        setCurrentEdit(null);
        setToolbarPosition(null);
    };

    const handleSave = async () => {
        if (!file || edits.size === 0) return;
        setIsLoading(true);
        setStatus('Applying edits...');
        setError('');

        try {
            const existingPdfBytes = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(existingPdfBytes);
            
            for (const [id, edit] of edits.entries()) {
                const item = textItems.find(t => t.id === id);
                if (!item) continue;
    
                setStatus(`Applying edit to page ${item.pageIndex + 1}...`);
                const page = pdfDoc.getPage(item.pageIndex);
                const { height: pageHeight } = page.getSize();
                const scale = page.getWidth() / pages[item.pageIndex].width;

                const fontToEmbed = mapFont(item.fontName, edit.isBold, edit.isItalic);
                const embeddedFont = await pdfDoc.embedFont(fontToEmbed);

                // Cover old text with a white rectangle. Make it taller to cover potential text wrapping.
                page.drawRectangle({
                    x: (item.x * scale) - 2,
                    y: pageHeight - (item.y * scale) - (item.height * scale * 1.5), // Position lower to cover more
                    width: (item.width * scale) + 4,
                    height: (item.height * scale) * 2.5, // Make rectangle significantly taller
                    color: rgb(1, 1, 1), // White
                });
    
                const textColor = hexToRgb(edit.color);
                // Draw new text
                page.drawText(edit.text, {
                    x: item.x * scale,
                    y: pageHeight - (item.y * scale),
                    font: embeddedFont,
                    size: edit.fontSize,
                    color: rgb(textColor.r, textColor.g, textColor.b),
                    lineHeight: edit.fontSize * 1.2,
                    maxWidth: (item.width * scale) * 1.5 // Allow some overflow
                });
            }
    
            setStatus('Saving PDF...');
            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `edited_${file.name}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
    
        } catch (e) {
            console.error(e);
            setError('Failed to save the PDF. An unexpected error occurred.');
        } finally {
            setIsLoading(false);
            setStatus('');
        }
    };

    return (
        <div className="space-y-6" ref={containerRef} onClick={() => setCurrentEdit(null)}>
            {currentEdit && toolbarPosition && (
                <FloatingToolbar
                    edit={currentEdit}
                    position={toolbarPosition}
                    onUpdate={(update) => setCurrentEdit(prev => prev ? { ...prev, ...update } : null)}
                    onApply={handleApplyEdit}
                    onCancel={() => setCurrentEdit(null)}
                />
            )}
            <div className="pb-4 border-b border-gray-200 flex justify-between items-start dark:border-slate-700">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Advanced PDF Text Editor</h2>
                    <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">Click on text to edit style, color, and content.</p>
                </div>
                {file && (
                    <button
                        onClick={handleSave}
                        disabled={isLoading || edits.size === 0}
                        className="flex-shrink-0 ml-4 inline-flex items-center gap-2 px-5 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        <DownloadIcon className="w-5 h-5" />
                        Save & Download
                    </button>
                )}
            </div>
            
            {!file && !isLoading && (
                 <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4 dark:bg-slate-800 dark:border-slate-700">
                    <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--theme-primary-light)] file:text-[var(--theme-primary)] hover:file:opacity-90 dark:file:bg-slate-700 dark:file:text-sky-300 dark:text-slate-400" />
                </div>
            )}

            {isLoading && (
                <div className="flex flex-col items-center justify-center p-12 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <SpinnerIcon className="w-10 h-10 animate-spin text-[var(--theme-primary)]" />
                    <p className="mt-4 text-slate-500 dark:text-slate-400">{status}</p>
                </div>
            )}
            
            {error && <div className="p-4 bg-red-100 text-red-700 rounded-lg dark:bg-red-900/50 dark:text-red-300">{error}</div>}

            {pages.length > 0 && !isLoading && (
                 <div className="space-y-8 bg-slate-200 dark:bg-slate-900 p-4 lg:p-8 rounded-lg">
                    {pages.map((page, pageIndex) => (
                        <div key={pageIndex} className="relative mx-auto shadow-lg" style={{ width: page.width, height: page.height }}>
                            <img src={page.imageUrl} alt={`Page ${pageIndex + 1}`} className="w-full h-full select-none" />
                            {textItems.filter(item => item.pageIndex === pageIndex).map(item => {
                                const isBeingEdited = currentEdit?.id === item.id;
                                const hasBeenEdited = edits.has(item.id);

                                return (
                                    <div
                                        key={item.id}
                                        onClick={(e) => handleTextClick(item, e)}
                                        style={{ left: item.x, top: item.y, width: item.width, height: item.height }}
                                        className={`absolute cursor-pointer group ${isBeingEdited ? 'outline-none' : 'hover:outline hover:outline-1 hover:outline-sky-400'}`}
                                    >
                                        <div className={`w-full h-full ${hasBeenEdited ? 'bg-green-100/30' : ''} ${isBeingEdited ? 'bg-sky-100/50' : ''}`}></div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
};

export default PdfTextEditor;
