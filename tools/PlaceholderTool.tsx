import React from 'react';

interface PlaceholderToolProps {
  title: string;
  description: string;
}

const PlaceholderTool: React.FC<PlaceholderToolProps> = ({ title, description }) => {
  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{title}</h2>
        <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      <div className="bg-white p-8 rounded-lg border border-slate-200 text-center dark:bg-slate-800 dark:border-slate-700">
        <div className="mx-auto bg-[var(--theme-primary-light)] w-16 h-16 rounded-full flex items-center justify-center dark:bg-slate-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[var(--theme-primary)] dark:text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h3 className="mt-4 text-xl font-semibold text-slate-800 dark:text-slate-200">Feature Coming Soon!</h3>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          This is an advanced tool that requires server-side processing. Our team is hard at work building it.
          <br />
          The user interface is ready, and full functionality will be enabled in a future update.
        </p>
        <button
          disabled
          className="mt-6 px-6 py-2 bg-slate-300 text-slate-500 font-semibold rounded-lg cursor-not-allowed dark:bg-slate-600 dark:text-slate-400"
        >
          Coming Soon
        </button>
      </div>
      <p className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400 italic">
        If The Text Is Not Displaying Clearly, Please Consider Using Dark Mode.
      </p>
    </div>
  );
};

export default PlaceholderTool;