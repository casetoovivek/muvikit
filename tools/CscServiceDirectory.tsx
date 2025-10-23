import React, { useState, useMemo } from 'react';
import { cscServicesData } from '../data/cscServicesData';
import { SearchIcon } from '../components/icons';

interface Service {
    name: string;
    category: string;
    description: string;
    link: string;
}

const CscServiceDirectory: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredServices = useMemo(() => {
        if (!searchTerm) {
            return cscServicesData;
        }
        return cscServicesData.filter(service =>
            service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    const categories = useMemo(() => {
        const grouped: { [key: string]: Service[] } = {};
        filteredServices.forEach(service => {
            if (!grouped[service.category]) {
                grouped[service.category] = [];
            }
            grouped[service.category].push(service);
        });
        return Object.entries(grouped);
    }, [filteredServices]);

    return (
        <div className="space-y-6">
            <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">CSC Service Directory</h2>
                <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">Your guide to government e-services available through CSC.</p>
            </div>

            <div className="max-w-xl mx-auto">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search for a service (e.g., 'Aadhaar', 'PAN Card')..."
                        className="block w-full pl-12 pr-4 py-3 bg-white border border-slate-300 rounded-full text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
                    />
                </div>
            </div>

            {categories.length > 0 ? (
                <div className="space-y-8">
                    {categories.map(([category, services]) => (
                        <div key={category}>
                            <h3 className="text-2xl font-bold text-slate-700 mb-4 dark:text-slate-200">{category}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {services.map(service => (
                                    <div key={service.name} className="bg-white p-6 rounded-lg border border-slate-200 flex flex-col justify-between dark:bg-slate-800 dark:border-slate-700">
                                        <div>
                                            <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">{service.name}</h4>
                                            <p className="text-sm text-slate-500 mt-1 dark:text-slate-400">{service.description}</p>
                                        </div>
                                        <a
                                            href={service.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-4 inline-block text-center px-4 py-2 bg-white border-2 border-[var(--theme-primary)] text-[var(--theme-primary)] font-semibold rounded-lg hover:bg-[var(--theme-primary-light)] transition-colors text-sm dark:bg-slate-700 dark:text-sky-300 dark:border-sky-500 dark:hover:bg-slate-600"
                                        >
                                            Visit Site
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">No services found</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Try a different search term.</p>
                </div>
            )}
        </div>
    );
};

export default CscServiceDirectory;