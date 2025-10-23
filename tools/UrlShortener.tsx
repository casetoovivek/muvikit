import React, { useState } from 'react';
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
    // Simple URL validation
    if (!/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i.test(longUrl)) {
        setError('Please enter a valid URL (e.g., https://example.com).');
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Free URL Shortener</h1>
        <p className="mt-1 text-lg text-gray-600 dark:text-slate-400">Create short, memorable links from long URLs. Perfect for sharing on social media, in emails, or anywhere space is limited.</p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 max-w-2xl mx-auto space-y-4 dark:bg-slate-800 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="url"
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            placeholder="Enter a long URL here (e.g., https://...)"
            className="flex-grow block w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400"
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
      
       <div className="bg-white p-6 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 space-y-6 max-w-4xl mx-auto">
        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">What is a URL Shortener?</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">A URL shortener is a service that takes a long, complex web address and converts it into a short, easy-to-share link. When a user clicks the short link, they are automatically redirected to the original long URL. This is incredibly useful for social media platforms with character limits (like Twitter), for creating clean-looking links in marketing materials, and for making links easier to remember and type.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">How to Shorten a Link</h2>
          <ol className="list-decimal list-inside mt-2 space-y-2 text-slate-600 dark:text-slate-300">
            <li><strong>Paste Your Long URL:</strong> Copy the long web address you want to shorten and paste it into the input field.</li>
            <li><strong>Click "Shorten":</strong> Press the "Shorten" button to generate your new, compact link.</li>
            <li><strong>Copy and Share:</strong> Your short URL will appear. Click the copy icon to copy it to your clipboard and share it anywhere.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Benefits of Using Our Link Shortener</h2>
          <ul className="list-disc list-inside mt-2 space-y-2 text-slate-600 dark:text-slate-300">
            <li><strong>Clean and Tidy:</strong> Makes your links look more professional and less cluttered.</li>
            <li><strong>Easy to Share:</strong> Perfect for platforms with character limits and for verbal sharing.</li>
            <li><strong>Free and Fast:</strong> Generate short links instantly without any cost or registration.</li>
            <li><strong>Reliable Redirection:</strong> Our shortened links use a stable service to ensure they always work.</li>
          </ul>
        </section>

        <section>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Frequently Asked Questions (FAQs)</h2>
            <div className="mt-2 space-y-3 text-slate-600 dark:text-slate-300">
              <div>
                <h3 className="font-semibold">Do these short links expire?</h3>
                <p>No, the links created with this service are permanent and do not have an expiration date.</p>
              </div>
              <div>
                <h3 className="font-semibold">Can I customize the short link?</h3>
                <p>This is a simple, direct URL shortener that does not support custom aliases (vanity URLs). It provides a randomly generated short link for maximum speed and simplicity.</p>
              </div>
            </div>
        </section>
      </div>
    </div>
  );
};

export default UrlShortener;