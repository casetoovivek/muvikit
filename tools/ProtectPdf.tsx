import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { SpinnerIcon } from '../components/icons';

const ProtectPdf: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
            setError('');
        } else {
            setFile(null);
            setError('Please select a valid PDF file.');
        }
    };

    const handleProtect = async () => {
        if (!file || !password) {
            setError('Please select a file and enter a password.');
            return;
        }
        setIsLoading(true);
        setError('');

        try {
            const pdfBytes = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(pdfBytes);
            
            pdfDoc.encrypt({
                userPassword: password,
                ownerPassword: password,
                permissions: {},
            });

            const protectedPdfBytes = await pdfDoc.save();

            const blob = new Blob([protectedPdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `protected_${file.name}`;
            a.click();
            URL.revokeObjectURL(url);

        } catch (err: any) {
            console.error(err);
            setError(`Error protecting PDF: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Protect PDF</h2>
                <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">Add a password to your PDF file.</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4 dark:bg-slate-800 dark:border-slate-700">
                <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--theme-primary-light)] file:text-[var(--theme-primary)] hover:file:opacity-90 dark:file:bg-slate-700 dark:file:text-sky-300 dark:text-slate-400"
                />
                {file && (
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Enter password"
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
                        />
                    </div>
                )}
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button
                    onClick={handleProtect}
                    disabled={isLoading || !file || !password}
                    className="w-full px-6 py-3 bg-[var(--theme-primary)] text-white font-semibold rounded-lg shadow-md hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center dark:disabled:bg-slate-600"
                >
                    {isLoading ? <><SpinnerIcon className="w-5 h-5 mr-2 animate-spin" /> Protecting...</> : 'Protect PDF and Download'}
                </button>
            </div>
        </div>
    );
};

export default ProtectPdf;
