import React from 'react';

interface LogoProps {
  className?: string;
}

export const AmazonLogo: React.FC<LogoProps> = ({ className }) => (
  <div className={`relative ${className} bg-white border border-gray-200 rounded-lg flex items-center justify-center p-2`}>
    <svg viewBox="0 0 102 31" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
      <path d="M58.74 20.32c-3.34 0-5.4-1.38-5.4-4.54 0-4.04 3-4.8 6.78-4.8 2.18 0 4.1.24 5.7.62l.54-2.58c-1.54-.36-3.3-.54-5.18-.54-5.08 0-9.3 2.18-9.3 7.32 0 4.28 3.34 7.08 8.1 7.08 4.38 0 7.42-2.14 7.42-5.46 0-2.82-1.94-4.36-5.46-4.6v-.08c1.9-.3 3.32-1.48 3.32-3.4 0-2.12-1.84-3.32-4.6-3.32-2.94 0-4.72 1.34-4.72 3.6 0 .6.14 1.18.38 1.74h.02c.8-1.3 2.22-2 4.1-2 .9 0 2.22.38 2.22 1.48 0 1.04-.92 1.28-2.22 1.28h-1.5v2.2h1.6c1.68 0 2.92.34 2.92 1.6 0 1.22-1.14 1.74-2.92 1.74-1.74 0-3.3-.64-4.34-2.02h-.02c-.3.84-.44 1.74-.44 2.66 0 2.8 2.08 4.24 5.22 4.24 2.5 0 4.46-1.12 4.46-3.08 0-1.28-.9-2.28-2.76-2.28h-2.18v.02z" fill="#000" />
      <path d="M89.3 11.22c-2.3 0-3.86.92-4.94 2.06h-.02c.02-.6.04-1.2.04-1.82V.3h-3.4v29.4h3.4V17.92c0-3.12 1.1-5.1 4.24-5.1 3.16 0 3.96 2.3 3.96 4.8v11.8h3.4V16.62c0-4.3-2.18-7.1-7.7-7.1z" fill="#000" />
      <path d="M72.28 20.54c.48 2.34 2.82 3.42 5.02 3.42 2.62 0 4.28-.96 4.28-2.52 0-1.64-1.18-2.3-4.9-3.04-4.44-.88-7.34-2.1-7.34-6.04 0-3.56 2.9-6.3 7.9-6.3 4.4 0 7.3 2.4 7.82 5.86l-3.24.58c-.34-1.8-1.92-2.84-4.58-2.84-2.28 0-3.7.88-3.7 2.24 0 1.5 1.28 2.06 4.54 2.74 4.58.94 7.7 2.3 7.7 6.3 0 3.64-3.1 6.6-8.6 6.6-5.2 0-8.24-2.7-8.7-6.52l3.28-.62z" fill="#000" />
      <path d="M49 19.46c.72 1.34 2.14 2.06 3.84 2.06 1.3 0 2.04-.36 2.04-.94 0-.46-.3-.72-1.6-1.1l-3.1-.9c-2.96-.86-4.84-2.1-4.84-4.92 0-2.88 2.26-5.1 5.88-5.1 3.2 0 5.3 1.54 6.2 3.5l-2.48.96c-.46-.96-1.5-1.54-3.48-1.54-1.54 0-2.2.4-2.2.86 0 .5.44.7 1.7.98l3.1.92c3.18.94 4.74 2.14 4.74 4.96 0 2.96-2.2 5.4-6.5 5.4-3.8 0-6.1-1.7-7.1-3.66l2.4-1.04z" fill="#000" />
      <path d="M44.4 29.7V5.9h-3.92l-4.4 12.38-4.4-12.38h-3.9v23.8h3.1V10.5l4.6 13h.2l4.62-13v19.2h3.1z" fill="#000" />
      <path d="M12.23 20.82c-.14.4-.22.8-.22 1.22 0 2.22 1.76 3.44 4.3 3.44 2.9 0 4.4-1.48 4.4-3.64 0-2.1-1.26-3.42-4.32-4.36-2.4-.74-4.2-1.5-4.2-3.6 0-1.96 1.62-3.3 3.96-3.3 2.2 0 3.7 1.1 4.14 2.9l-2.72.68c-.18-.7-.8-1.12-1.58-1.12-1.14 0-1.52.54-1.52 1.2 0 .7.5 1.16 2.94 1.84 2.8.8 5.76 2.02 5.76 5.12 0 3.1-2.44 5.3-6.5 5.3-3.82 0-6.42-2-6.9-4.52l2.64-.6zM1.9 29.7V.3H0v29.4h1.9z" fill="#000" />
      <path d="M89.3 11.22c-2.3 0-3.86.92-4.94 2.06h-.02c.02-.6.04-1.2.04-1.82V.3h-3.4v29.4h3.4V17.92c0-3.12 1.1-5.1 4.24-5.1 3.16 0 3.96 2.3 3.96 4.8v11.8h3.4V16.62c0-4.3-2.18-7.1-7.7-7.1z" fill="#000" />
      <path d="M93.3 29.4c.5-1.1 1.2-2.3 1.2-2.3s4.3 2.3 7.5 2.3c2.4 0 3.3-1.1 3.3-2.4 0-2.3-4.8-2-4.8-5.8 0-2.3 2-4.5 5.8-4.5 2.4 0 4.9 1.1 4.9 1.1s-1-2-1.3-3.1l2 .4s1.2 2.3 1.2 4c0 3.2-2.4 5.2-4.3 5.9.9.5 1.5 1.6 1.5 2.9 0 2.8-2.3 4.4-5.6 4.4-4.4-.1-8.5-2.8-8.5-2.8z" fill="#FF9900" />
      <path d="M98.9 20.2c-2.6 0-5.8 2.2-5.8 2.2s.5 1.1.9 1.6c.4.5 4.3 2.8 8.1 2.8 3.5 0 5.4-2.1 5.4-4.5 0-2.2-1.8-3.9-4.8-4.4-.8-.1-1.6-.2-2.4-.2h-.4z" fill="#FF9900" />
    </svg>
  </div>
);

export const FlipkartLogo: React.FC<LogoProps> = ({ className }) => (
    <div className={`relative ${className} bg-white border border-gray-200 rounded-lg flex items-center justify-center p-2`}>
        <div className="w-16 h-16 bg-yellow-400 rounded-lg shadow-md flex items-center justify-center">
            <span className="text-4xl font-extrabold text-blue-600 italic">f</span>
        </div>
    </div>
);


export const MeeshoLogo: React.FC<LogoProps> = ({ className }) => (
    <div className={`relative ${className} bg-white border border-gray-200 rounded-lg flex items-center justify-center p-2`}>
        <span className="text-4xl font-bold" style={{color: '#f43397'}}>meesho</span>
    </div>
);

export const SnapdealLogo: React.FC<LogoProps> = ({ className }) => (
    <div className={`relative ${className} bg-red-600 border border-gray-200 rounded-lg flex items-center justify-center p-2`}>
        <span className="text-3xl font-bold text-white">snapdeal</span>
    </div>
);

export const MyntraLogo: React.FC<LogoProps> = ({ className }) => (
    <div className={`relative ${className} bg-white border border-gray-200 rounded-lg flex items-center justify-center p-2`}>
         <svg viewBox="0 0 100 60" className="w-full h-auto">
            <path d="M0 60 L20 20 L40 60 L30 60 L20 40 L10 60 Z" fill="#F03F69"/>
            <path d="M25 25 L40 0 L55 25 L40 25 Z" fill="#F26A44"/>
            <path d="M45 60 L60 20 L75 60 L65 60 L60 50 L55 60 Z" fill="#F26A44"/>
            <path d="M80 60 L100 20 L100 60 Z" fill="#F03F69" />
        </svg>
    </div>
);