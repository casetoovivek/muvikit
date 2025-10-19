import React, { useState } from 'react';
import { Tool } from '../types';
import { ChevronDownIcon } from './icons';

interface SidebarProps {
  tools: Tool[];
  selectedTool: Tool | null;
  onSelectTool: (tool: Tool) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ tools, selectedTool, onSelectTool }) => {
  const categories = Array.from(new Set(tools.map(t => t.category || 'Other')));
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set(categories));

  const toggleCategory = (category: string) => {
    setOpenCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };
  
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 hidden lg:block overflow-y-auto dark:bg-slate-800 dark:border-slate-700">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-200">Tools</h2>
      </div>
      <nav className="flex-1 px-2 pb-4 space-y-2">
        {categories.map(category => {
          const isOpen = openCategories.has(category);
          return (
            <div key={category}>
              <button
                onClick={() => toggleCategory(category)}
                className="flex items-center justify-between w-full px-2 py-2 text-left text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-md focus:outline-none dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <span>{category}</span>
                <ChevronDownIcon 
                  className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} 
                />
              </button>
              
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-screen' : 'max-h-0'}`}>
                <div className="mt-1 space-y-1 pl-2">
                  {tools.filter(tool => (tool.category || 'Other') === category).map(tool => (
                    <a
                      key={tool.id}
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        onSelectTool(tool);
                      }}
                      className={`flex items-center px-2 py-2 text-sm font-medium rounded-md group ${
                        selectedTool?.id === tool.id
                          ? 'bg-[var(--theme-primary-light)] text-[var(--theme-primary)] dark:bg-sky-900/50 dark:text-sky-300'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100'
                      }`}
                    >
                      {/* FIX: Removed redundant type cast as it's no longer needed after updating the Tool interface. */}
                      {React.cloneElement(tool.icon, { className: "w-5 h-5 mr-3 flex-shrink-0" })}
                      <span>{tool.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;