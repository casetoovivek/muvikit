import React from 'react';
import { Tool } from '../types';

interface ToolCardProps {
  tool: Tool;
  onSelectTool: (tool: Tool) => void;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, onSelectTool }) => {
  return (
    <div
      onClick={() => onSelectTool(tool)}
      className="bg-white p-6 rounded-lg border border-slate-200 hover:shadow-lg hover:border-[var(--theme-primary)] transition-all duration-200 cursor-pointer group dark:bg-slate-800 dark:border-slate-700"
    >
      <div className="flex items-center space-x-4">
        <div className="bg-[var(--theme-primary-light)] p-3 rounded-lg text-[var(--theme-primary)] group-hover:bg-[var(--theme-primary)] group-hover:text-white transition-colors duration-200 dark:bg-slate-700 dark:text-sky-300 dark:group-hover:bg-sky-500 dark:group-hover:text-white">
          {/* FIX: Removed redundant type cast as it's no longer needed after updating the Tool interface. */}
          {React.cloneElement(tool.icon, { className: "w-6 h-6" })}
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800 group-hover:text-[var(--theme-primary)] transition-colors duration-200 dark:text-slate-200">{tool.name}</h3>
          <p className="text-sm text-slate-500 mt-1 dark:text-slate-400">{tool.description}</p>
        </div>
      </div>
    </div>
  );
};

export default ToolCard;