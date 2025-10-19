import React, { useState } from 'react';
// FIX: Corrected import path for icon
import { CopyIcon } from '../components/icons';

const UrlShortener: React.FC = () => {
  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleShorten = async () => {
    if (!longUrl) {
      setError('Please enter a URL.');
      return;
    }
    setLoading(true);
    setError('');
    setShortUrl('');
    setCopied(false);

    try {
      const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`);
      if (response.ok) {
        const data = await response.text();
        if (data === 'Error') {
             setError('Failed to shorten URL. Please ensure it is a valid and properly formatted link.');
        } else {
            setShortUrl(data);
        }
      } else {
        setError('Failed to connect to the shortening service. Please try again later.');
      }
    } catch (e) {
      setError('An network error occurred. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (shortUrl) {
        navigator.clipboard.writeText(shortUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">URL Shortener</h2>
        <p className="mt-1 text-md text-gray-600 dark:text-slate-400">Create short links for easy sharing.</p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 max-w-2xl mx-auto space-y-4 dark:bg-slate-800 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="url"
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            placeholder="Enter a long URL here"
            className="flex-grow block w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
          />
          <button
            onClick={handleShorten}
            disabled={loading}
            className="px-6 py-2 bg-[var(--theme-primary)] text-white font-semibold rounded-lg shadow-md hover:opacity-90 disabled:bg-gray-400 dark:disabled:bg-slate-600"
          >
            {loading ? 'Shortening...' : 'Shorten'}
          </button>
        </div>
        
        {error && <p className="text-red-600 dark:text-red-400">{error}</p>}
        
        {shortUrl && (
          <div className="p-4 bg-gray-100 rounded-lg flex items-center justify-between dark:bg-slate-700">
            <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-[var(--theme-primary)] hover:underline dark:text-sky-300">
              {shortUrl}
            </a>
            <button onClick={copyToClipboard} className="text-gray-500 hover:text-[var(--theme-primary)] dark:text-slate-400 dark:hover:text-sky-400">
                {copied ? 'Copied!' : <CopyIcon className="w-5 h-5"/>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UrlShortener;