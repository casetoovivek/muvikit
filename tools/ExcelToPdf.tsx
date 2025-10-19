import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SpinnerIcon } from '../components/icons';

declare global {
    interface Window {
        XLSX: any;
    }
}

const ExcelToPdf: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && (selectedFile.name.endsWith('.xls') || selectedFile.name.endsWith('.xlsx'))) {
            setFile(selectedFile);
            setError('');
        } else {
            setFile(null);
            setError('Please select a valid .xls or .xlsx file.');
        }
    };

    const handleConvert = async () => {
        if (!file) {
            setError('Please select a file first.');
            return;
        }
        setIsLoading(true);
        setError('');

        try {
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = e.target?.result;
                const workbook = window.XLSX.read(data, { type: 'binary' });
                const doc = new jsPDF();
                
                let isFirstSheet = true;
                workbook.SheetNames.forEach((sheetName: string) => {
                    if (!isFirstSheet) {
                        doc.addPage();
                    }
                    isFirstSheet = false;

                    const worksheet = workbook.Sheets[sheetName];
                    const json = window.XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                    
                    doc.setFontSize(16);
                    doc.text(sheetName, 14, 15);
                    
                    if (json.length > 0) {
                        autoTable(doc, {
                            head: json[0],
                            body: json.slice(1),
                            startY: 20,
                            theme: 'grid',
                            styles: {
                                fontSize: 8,
                                cellPadding: 2,
                            },
                            headStyles: {
                                fillColor: [13, 62, 128] // var(--theme-primary)
                            }
                        });
                    }
                });

                doc.save(`${file.name.split('.')[0]}.pdf`);
                setIsLoading(false);
            };
            reader.readAsBinaryString(file);
        } catch (err) {
            console.error(err);
            setError('An error occurred during conversion. The file might be corrupted.');
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Excel to PDF</h2>
                <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">Convert Excel spreadsheets (.xls, .xlsx) to PDF.</p>
                <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">Note: This tool converts sheet data into tables. Charts, images, and complex styling are not preserved.</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4 dark:bg-slate-800 dark:border-slate-700">
                <input
                    type="file"
                    accept=".xls,.xlsx"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--theme-primary-light)] file:text-[var(--theme-primary)] hover:file:opacity-90 dark:file:bg-slate-700 dark:file:text-sky-300 dark:text-slate-400"
                />
                {file && <p className="text-sm text-slate-600 dark:text-slate-300">Selected file: {file.name}</p>}
                
                {error && <p className="text-red-500 text-sm">{error}</p>}
                
                <button
                    onClick={handleConvert}
                    disabled={isLoading || !file}
                    className="w-full px-6 py-3 bg-[var(--theme-primary)] text-white font-semibold rounded-lg shadow-md hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center dark:disabled:bg-slate-600"
                >
                    {isLoading ? <><SpinnerIcon className="w-5 h-5 mr-2 animate-spin" /> Converting...</> : 'Convert to PDF and Download'}
                </button>
            </div>
        </div>
    );
};

export default ExcelToPdf;