import React, { useState, useEffect, useMemo } from 'react';
import { SpinnerIcon, TrashIcon, CopyIcon, TextIcon, WhatsAppIcon } from '../components/icons';

// --- TYPE DEFINITIONS ---
type Tab = 'sender' | 'templates' | 'link';
interface Template {
    id: string;
    name: string;
    message: string;
}

// --- HELPER FUNCTIONS ---
const cleanPhoneNumber = (number: string) => {
    return number.replace(/[^0-9]/g, '');
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- MAIN COMPONENT ---
const WhatsAppMarketingSuite: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('sender');
    const [message, setMessage] = useState('');
    const [templates, setTemplates] = useState<Template[]>([]);

    // Load templates from localStorage on initial render
    useEffect(() => {
        try {
            const savedTemplates = localStorage.getItem('whatsapp_templates');
            if (savedTemplates) {
                setTemplates(JSON.parse(savedTemplates));
            }
        } catch (e) {
            console.error("Failed to load templates from localStorage", e);
        }
    }, []);

    // Save templates to localStorage whenever they change
    useEffect(() => {
        try {
            localStorage.setItem('whatsapp_templates', JSON.stringify(templates));
        } catch (e) {
            console.error("Failed to save templates to localStorage", e);
        }
    }, [templates]);

    const handleUseTemplate = (templateMessage: string) => {
        setMessage(templateMessage);
        setActiveTab('sender');
    };

    return (
        <div className="space-y-6">
            <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">WhatsApp Marketing Suite</h2>
                <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">Engage your audience with powerful WhatsApp tools.</p>
            </div>

            <div className="border-b border-gray-200 dark:border-slate-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setActiveTab('sender')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'sender' ? 'border-[var(--theme-primary)] text-[var(--theme-primary)] dark:border-sky-400 dark:text-sky-400' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200'}`}>
                        Bulk Sender
                    </button>
                    <button onClick={() => setActiveTab('templates')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'templates' ? 'border-[var(--theme-primary)] text-[var(--theme-primary)] dark:border-sky-400 dark:text-sky-400' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200'}`}>
                        Templates
                    </button>
                    <button onClick={() => setActiveTab('link')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'link' ? 'border-[var(--theme-primary)] text-[var(--theme-primary)] dark:border-sky-400 dark:text-sky-400' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200'}`}>
                        Link Generator
                    </button>
                </nav>
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                {activeTab === 'sender' && <BulkSenderView message={message} setMessage={setMessage} />}
                {activeTab === 'templates' && <TemplatesView templates={templates} setTemplates={setTemplates} onUseTemplate={handleUseTemplate} />}
                {activeTab === 'link' && <LinkGeneratorView />}
            </div>
        </div>
    );
};


// --- TAB COMPONENTS ---

const BulkSenderView: React.FC<{ message: string; setMessage: (m: string) => void }> = ({ message, setMessage }) => {
    const [numbers, setNumbers] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [delay, setDelay] = useState(3); // delay in seconds

    const handleSend = async () => {
        const phoneNumbers = numbers.split('\n').map(cleanPhoneNumber).filter(Boolean);
        if (phoneNumbers.length === 0 || !message.trim()) {
            alert('Please enter at least one phone number and a message.');
            return;
        }

        setIsLoading(true);
        const encodedMessage = encodeURIComponent(message);

        for (let i = 0; i < phoneNumbers.length; i++) {
            setStatus(`Opening chat for ${phoneNumbers[i]} (${i + 1}/${phoneNumbers.length})...`);
            const url = `https://wa.me/${phoneNumbers[i]}?text=${encodedMessage}`;
            window.open(url, '_blank');
            if (i < phoneNumbers.length - 1) {
                await sleep(delay * 1000);
            }
        }

        setStatus(`Finished! ${phoneNumbers.length} chats opened.`);
        setIsLoading(false);
    };

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold">Bulk Message Sender</h3>
            <textarea
                value={numbers}
                onChange={(e) => setNumbers(e.target.value)}
                placeholder="Enter phone numbers, one per line (e.g., 919876543210)"
                rows={6}
                className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600"
            />
            <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                rows={4}
                className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600"
            />
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <button onClick={handleSend} disabled={isLoading} className="w-full sm:w-auto px-6 py-3 bg-[var(--theme-primary)] text-white font-semibold rounded-lg shadow-md hover:opacity-90 disabled:bg-gray-400 flex items-center justify-center dark:disabled:bg-slate-600">
                    {isLoading ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : <WhatsAppIcon className="w-5 h-5" />}
                    <span className="ml-2">{isLoading ? 'Sending...' : 'Start Sending'}</span>
                </button>
                 <label className="text-sm flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    Delay:
                    <input type="number" value={delay} onChange={e => setDelay(parseInt(e.target.value) || 2)} min="1" max="10" className="w-16 p-1 border rounded text-center dark:bg-slate-700 dark:border-slate-600" />
                    seconds
                </label>
            </div>
            {status && <p className="text-sm text-slate-500 dark:text-slate-400">{status}</p>}
             <div className="p-3 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-sm dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-800">
                <strong>How it works:</strong> This tool will open a new WhatsApp chat tab for each number. You must manually press "Send" in each tab. Use responsibly and adhere to WhatsApp's policies to avoid account restrictions.
            </div>
        </div>
    );
};

const TemplatesView: React.FC<{ templates: Template[]; setTemplates: (t: Template[]) => void; onUseTemplate: (m: string) => void }> = ({ templates, setTemplates, onUseTemplate }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

    const handleSave = (template: { name: string, message: string }) => {
        if (editingTemplate) {
            setTemplates(templates.map(t => t.id === editingTemplate.id ? { ...t, ...template } : t));
        } else {
            setTemplates([...templates, { id: `tpl-${Date.now()}`, ...template }]);
        }
        setIsModalOpen(false);
        setEditingTemplate(null);
    };
    
    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this template?")) {
            setTemplates(templates.filter(t => t.id !== id));
        }
    };

    return (
        <div className="space-y-4">
            {isModalOpen && <TemplateModal template={editingTemplate} onSave={handleSave} onClose={() => setIsModalOpen(false)} />}
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Message Templates</h3>
                <button onClick={() => { setEditingTemplate(null); setIsModalOpen(true); }} className="px-4 py-2 bg-[var(--theme-primary)] text-white font-semibold rounded-lg shadow-sm hover:opacity-90">Create Template</button>
            </div>
            <div className="space-y-3">
                {templates.length > 0 ? templates.map(t => (
                    <div key={t.id} className="p-4 border rounded-lg dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-semibold">{t.name}</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 whitespace-pre-wrap">{t.message}</p>
                            </div>
                            <div className="flex gap-2 flex-shrink-0 ml-4">
                                <button onClick={() => onUseTemplate(t.message)} className="text-sm font-semibold text-blue-600 hover:underline">Use</button>
                                <button onClick={() => { setEditingTemplate(t); setIsModalOpen(true); }} className="text-sm font-semibold text-slate-600 hover:underline">Edit</button>
                                <button onClick={() => handleDelete(t.id)}><TrashIcon className="w-4 h-4 text-red-500" /></button>
                            </div>
                        </div>
                    </div>
                )) : <p className="text-center text-slate-500 py-8">No templates saved yet.</p>}
            </div>
        </div>
    );
};

const TemplateModal: React.FC<{ template: Template | null, onSave: (t: { name: string, message: string }) => void, onClose: () => void }> = ({ template, onSave, onClose }) => {
    const [name, setName] = useState(template?.name || '');
    const [message, setMessage] = useState(template?.message || '');

    const handleSubmit = () => {
        if (name.trim() && message.trim()) {
            onSave({ name, message });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg w-full max-w-lg space-y-4">
                <h2 className="text-lg font-bold">{template ? 'Edit' : 'Create'} Template</h2>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Template Name" className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600" />
                <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Message content..." rows={5} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600" />
                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 rounded">Cancel</button>
                    <button onClick={handleSubmit} className="px-4 py-2 bg-[var(--theme-primary)] text-white rounded">Save</button>
                </div>
            </div>
        </div>
    );
};

const LinkGeneratorView: React.FC = () => {
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState('');
    const [copied, setCopied] = useState(false);

    const generatedLink = useMemo(() => {
        const cleanedPhone = cleanPhoneNumber(phone);
        if (!cleanedPhone) return '';
        const encodedMessage = encodeURIComponent(message);
        return `https://wa.me/${cleanedPhone}?text=${encodedMessage}`;
    }, [phone, message]);

    const handleCopy = () => {
        if (!generatedLink) return;
        navigator.clipboard.writeText(generatedLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
         <div className="space-y-4">
            <h3 className="text-xl font-bold">WhatsApp Link Generator</h3>
            <p className="text-sm text-slate-500">Create a link with a pre-filled message to share anywhere.</p>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Enter phone number with country code" className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600" />
            <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Enter pre-filled message (optional)" rows={3} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600" />
            
            {generatedLink && (
                <div className="p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg flex items-center justify-between gap-4">
                    <a href={generatedLink} target="_blank" rel="noopener noreferrer" className="text-sm font-mono text-blue-600 dark:text-sky-400 truncate hover:underline">{generatedLink}</a>
                    <button onClick={handleCopy} className="px-3 py-1 bg-slate-200 dark:bg-slate-600 text-sm font-semibold rounded-md flex items-center gap-2">
                        <CopyIcon className="w-4 h-4" />
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default WhatsAppMarketingSuite;
