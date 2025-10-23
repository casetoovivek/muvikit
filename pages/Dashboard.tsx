import React, { useState, useMemo } from 'react';
import { Tool } from '../types';
import ToolCard from '../components/ToolCard';
import { SearchIcon } from '../components/icons';

interface DashboardProps {
  tools: Tool[];
  onSelectTool: (tool: Tool) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ tools, onSelectTool }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const categories = useMemo(() => {
    const grouped: { [key: string]: Tool[] } = {};
    tools.forEach(tool => {
      const category = tool.category || 'Other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(tool);
    });
    // Define a specific order for categories
    const categoryOrder = [
        'The Pro Trader',
        'E-commerce Tools',
        'Student Tools',
        'Text',
        'Image',
        'PDF Tools',
        'AI Writing Tools',
        'File Conversion',
        'Finance & Business',
        'Developer',
        'Other',
        'Career Tools',
        'Government Services',
        'About & Legal'
    ];
    // Return sorted categories
    return categoryOrder.filter(cat => grouped[cat]).map(category => ({
      name: category,
      tools: grouped[category],
    }));
  }, [tools]);

  const filteredTools = useMemo(() => {
    if (!searchTerm) {
      return [];
    }
    return tools.filter(tool =>
      tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tools, searchTerm]);

  return (
    <div className="space-y-10">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-slate-800 dark:text-slate-100">Welcome to Muvikit</h1>
        <p className="mt-2 text-lg text-slate-500 dark:text-slate-400">A collection of free, simple, and powerful tools to boost your productivity.</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for a tool (e.g., 'PDF', 'crop', 'password')..."
            className="block w-full pl-12 pr-4 py-3 bg-white border border-slate-300 rounded-full text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
          />
        </div>
      </div>

      {searchTerm ? (
        <div>
          <h2 className="text-2xl font-bold text-slate-700 mb-4 dark:text-slate-200">
            Search Results ({filteredTools.length})
          </h2>
          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTools.map((tool, index) => (
                <ToolCard key={tool.id} tool={tool} onSelectTool={onSelectTool} animationDelay={`${index * 50}ms`} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">No tools found</h3>
              <p className="text-slate-500 dark:text-slate-400 mt-2">Try a different search term.</p>
            </div>
          )}
        </div>
      ) : (
        categories.map(category => (
          <div key={category.name}>
            <h2 className="text-2xl font-bold text-slate-700 mb-4 dark:text-slate-200">{category.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {category.tools.map((tool, index) => (
                <ToolCard key={tool.id} tool={tool} onSelectTool={onSelectTool} animationDelay={`${index * 50}ms`} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Dashboard;