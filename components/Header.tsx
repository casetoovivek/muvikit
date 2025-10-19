import React from 'react';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  onLogoClick: () => void;
  theme: string;
  toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogoClick, theme, toggleTheme }) => {
  return (
    <header className="bg-white border-b border-gray-200 z-10 shadow-sm dark:bg-slate-800 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-16">
          <div 
            className="flex items-center space-x-3 cursor-pointer"
            onClick={onLogoClick}
          >
            <div className="bg-[var(--theme-primary)] p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2 1M4 7l2-1M4 7v2.5M12 21.5v-2.5M12 18.5l-2 1m2-1l2 1" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-[var(--theme-primary)] dark:text-sky-300">Muvikit</h1>
          </div>
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </div>
      </div>
    </header>
  );
};

export default Header;