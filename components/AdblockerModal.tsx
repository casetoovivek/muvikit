import React from 'react';

const AdblockerModal: React.FC = () => {

  const handleRefresh = () => {
    // Reload the page to check if the ad blocker has been disabled
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-90 backdrop-blur-sm flex justify-center items-center z-[9999] text-center p-4">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-2xl max-w-lg mx-auto border-2 border-red-500 dark:border-red-400">
        <div className="mx-auto bg-red-100 dark:bg-red-900/50 w-16 h-16 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-6">Ad Blocker Detected</h2>
        <p className="mt-4 text-slate-600 dark:text-slate-300">
          It looks like you're using an ad blocker. This is a free service that relies on ad revenue to operate and continue providing you with these tools.
        </p>
        <p className="mt-2 font-semibold text-slate-700 dark:text-slate-200">
          Please disable your ad blocker for this site to continue.
        </p>
        <button
          onClick={handleRefresh}
          className="mt-6 w-full px-6 py-3 bg-[var(--theme-primary)] text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition-opacity"
        >
          I've Disabled My Ad Blocker
        </button>
      </div>
    </div>
  );
};

export default AdblockerModal;
