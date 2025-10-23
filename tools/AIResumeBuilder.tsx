import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { SpinnerIcon, TrashIcon, DownloadIcon } from '../components/icons';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';

// Enable html-to-docx-file-saver from index.html
declare global {
    interface Window {
        htmlToDocx: any;
    }
}

// --- TYPE DEFINITIONS ---
interface PersonalInfo {
    name: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    linkedin: string;
    summary: string;
}
interface Experience {
    id: string;
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    bullets: string[];
}
interface Education {
    id: string;
    degree: string;
    institution: string;
    location: string;
    date: string;
}
interface Skill {
    id: string;
    name: string;
}
interface Project {
    id: string;
    name: string;
    description: string;
    link: string;
}
interface ResumeData {
    personalInfo: PersonalInfo;
    experience: Experience[];
    education: Education[];
    skills: Skill[];
    projects: Project[];
}

// --- INITIAL STATE ---
const initialResumeData: ResumeData = {
    personalInfo: { name: 'Your Name', email: 'youremail@example.com', phone: '123-456-7890', location: 'City, Country', website: 'yourportfolio.com', linkedin: 'linkedin.com/in/yourprofile', summary: 'A brief professional summary about yourself...' },
    experience: [{ id: `exp-${Date.now()}`, title: 'Job Title', company: 'Company Name', location: 'City, Country', startDate: '2020-01', endDate: 'Present', bullets: ['Responsibility or achievement 1', 'Responsibility or achievement 2'] }],
    education: [{ id: `edu-${Date.now()}`, degree: 'Degree or Certificate', institution: 'University Name', location: 'City, Country', date: '2020' }],
    skills: [{ id: `skill-${Date.now()}`, name: 'React' }, { id: `skill-${Date.now()+1}`, name: 'Node.js' }],
    projects: [{ id: `proj-${Date.now()}`, name: 'Project Name', description: 'A short description of your project.', link: 'github.com/yourproject' }],
};


// --- HELPER & UI COMPONENTS ---
const Section: React.FC<{ title: string; onAdd?: () => void; children: React.ReactNode }> = ({ title, onAdd, children }) => (
    <div className="mb-6">
        <div className="flex justify-between items-center border-b-2 border-slate-200 dark:border-slate-600 pb-2 mb-3">
            <h3 className="text-lg font-bold">{title}</h3>
            {onAdd && <button onClick={onAdd} className="px-2 py-0.5 bg-slate-200 dark:bg-slate-600 text-sm rounded font-semibold">+</button>}
        </div>
        {children}
    </div>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{label}</label>
        <input {...props} className="w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 placeholder-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400 text-sm" />
    </div>
);

const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }> = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{label}</label>
        <textarea {...props} className="w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 placeholder-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400 text-sm" />
    </div>
);

const resumeToPlainText = (resumeData: ResumeData) => {
    let text = `RESUME\n\n${resumeData.personalInfo.name.toUpperCase()}\n`;
    text += `${resumeData.personalInfo.email} | ${resumeData.personalInfo.phone} | ${resumeData.personalInfo.location}\n`;
    text += `Website: ${resumeData.personalInfo.website} | LinkedIn: ${resumeData.personalInfo.linkedin}\n`;
    text += `\n--- SUMMARY ---\n${resumeData.personalInfo.summary}\n`;
    text += `\n--- WORK EXPERIENCE ---\n`;
    resumeData.experience.forEach(e => {
        text += `\n${e.title.toUpperCase()} | ${e.company}\n`;
        text += `${e.location} | ${e.startDate} - ${e.endDate}\n`;
        e.bullets.forEach(b => text += `- ${b}\n`);
    });
    text += `\n--- EDUCATION ---\n`;
    resumeData.education.forEach(e => {
        text += `\n${e.degree}, ${e.institution}\n`;
        text += `${e.location} | ${e.date}\n`;
    });
    text += `\n--- SKILLS ---\n${resumeData.skills.map(s => s.name).join(', ')}\n`;
    text += `\n--- PROJECTS ---\n`;
    resumeData.projects.forEach(p => {
        text += `\n${p.name}\n${p.description}\nLink: ${p.link}\n`;
    });
    return text;
};

// --- MAIN COMPONENT ---
const AIResumeBuilder: React.FC = () => {
    const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);
    const [accentColor, setAccentColor] = useState('#0d3e80');
    const [isAiScoreModalOpen, setIsAiScoreModalOpen] = useState(false);
    const [isCoverLetterModalOpen, setIsCoverLetterModalOpen] = useState(false);
    const [aiBulletPointTarget, setAiBulletPointTarget] = useState<{expId: string, jobTitle: string} | null>(null);

    // Load from localStorage
    useEffect(() => {
        try {
            const savedData = localStorage.getItem('ai-resume-data-v2');
            if (savedData) setResumeData(JSON.parse(savedData));
        } catch (e) { console.error("Failed to load resume data", e); }
    }, []);

    // Save to localStorage
    useEffect(() => {
        localStorage.setItem('ai-resume-data-v2', JSON.stringify(resumeData));
    }, [resumeData]);

    const handleExportPdf = async () => {
        const resumeElement = document.getElementById('resume-preview-content');
        if (!resumeElement) return;
        const canvas = await html2canvas(resumeElement, { scale: 3 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${resumeData.personalInfo.name.replace(' ', '_')}_Resume.pdf`);
    };

    const handleExportDocx = async () => {
        const resumeElement = document.getElementById('resume-preview-content');
        if (!resumeElement) return;
        const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:sans-serif;font-size:11pt;} h1,h2,h3,h4{color:${accentColor};} h2{border-bottom:1px solid #ccc;}</style></head><body>${resumeElement.innerHTML}</body></html>`;
        await window.htmlToDocx(html, null, {
            styles: `h1 { font-size: 22pt; color: ${accentColor}; } h2 { font-size: 14pt; color: ${accentColor}; border-bottom: 1px solid #ccc; } p, li { font-size: 11pt; }`
        });
    };

    const handleExportTxt = () => {
        const text = resumeToPlainText(resumeData);
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${resumeData.personalInfo.name.replace(' ', '_')}_Resume.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-8 -m-6 lg:-m-10 text-slate-800 dark:text-slate-200" style={{ height: 'calc(100vh - 64px)' }}>
                {isAiScoreModalOpen && <AiScoreModal resumeText={resumeToPlainText(resumeData)} onClose={() => setIsAiScoreModalOpen(false)} />}
                {isCoverLetterModalOpen && <CoverLetterModal resumeData={resumeData} onClose={() => setIsCoverLetterModalOpen(false)} />}
                {aiBulletPointTarget && <AiBulletPointGeneratorModal target={aiBulletPointTarget} onGenerate={(bullets) => {
                    setResumeData(prev => ({ ...prev, experience: prev.experience.map(exp => exp.id === aiBulletPointTarget.expId ? {...exp, bullets} : exp) }));
                    setAiBulletPointTarget(null);
                }} onClose={() => setAiBulletPointTarget(null)} />}

                <div className="w-full md:w-1/2 lg:w-2/5 p-6 overflow-y-auto bg-white dark:bg-slate-800 border-r dark:border-slate-700">
                    <h2 className="text-2xl font-bold mb-4">Resume Editor</h2>
                    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg mb-6 space-y-4">
                        <div className="flex flex-col sm:flex-row gap-2 justify-between">
                            <button onClick={() => setIsAiScoreModalOpen(true)} className="flex-1 px-4 py-2 text-sm bg-amber-100 text-amber-800 rounded font-semibold dark:bg-amber-900/50 dark:text-amber-300">✨ Get AI Score</button>
                            <button onClick={() => setIsCoverLetterModalOpen(true)} className="flex-1 px-4 py-2 text-sm bg-sky-100 text-sky-800 rounded font-semibold dark:bg-sky-900/50 dark:text-sky-300">Generate Cover Letter</button>
                        </div>
                    </div>
                    <ResumeForm resumeData={resumeData} setResumeData={setResumeData} onGenerateBullets={(expId, jobTitle) => setAiBulletPointTarget({expId, jobTitle})} />
                </div>

                <div className="w-full md:w-1/2 lg:w-3/5 p-6 bg-slate-100 dark:bg-slate-900 overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">Live Preview</h2>
                        <div className="flex items-center gap-2">
                            <DownloadIcon className="w-5 h-5 text-slate-500" />
                            <button onClick={handleExportPdf} className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md dark:bg-red-900/50 dark:text-red-300">PDF</button>
                            <button onClick={handleExportDocx} className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md dark:bg-blue-900/50 dark:text-blue-300">DOCX</button>
                            <button onClick={handleExportTxt} className="px-3 py-1 text-sm bg-slate-200 text-slate-700 rounded-md dark:bg-slate-600 dark:text-slate-300">TXT</button>
                        </div>
                    </div>
                    <div className="p-4 bg-slate-200 dark:bg-slate-900/50 rounded-lg">
                        <div id="resume-preview-content" className="bg-white dark:bg-slate-800 shadow-lg mx-auto" style={{ width: '210mm', minHeight: '297mm', padding: '1in' }}>
                            <ResumePreview resumeData={resumeData} accentColor={accentColor} />
                        </div>
                    </div>
                </div>
            </div>
             <div className="bg-white p-6 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 space-y-6 mt-8">
                <section>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">What is an AI Resume Builder?</h2>
                    <p className="mt-2 text-slate-600 dark:text-slate-300">An AI Resume Builder is an advanced tool that helps you create a professional, polished resume with the help of artificial intelligence. It goes beyond simple templates by offering smart features like generating impactful bullet points for your work experience, providing an expert score and feedback on your overall resume, and even drafting a customized cover letter based on a job description. This tool is designed to help you stand out to recruiters and pass through Applicant Tracking Systems (ATS).</p>
                </section>
                <section>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">How to Use This Tool</h2>
                    <ol className="list-decimal list-inside mt-2 space-y-2 text-slate-600 dark:text-slate-300">
                        <li><strong>Fill in Your Information:</strong> Use the editor on the left to enter your personal details, work experience, education, and skills.</li>
                        <li><strong>Use AI Assistance:</strong> Click the "AI Generate" button in the work experience section to get suggestions for powerful, action-oriented bullet points.</li>
                        <li><strong>Get an AI Score:</strong> Once your resume is complete, click "Get AI Score" to receive an overall score and actionable feedback on how to improve it.</li>
                        <li><strong>Generate a Cover Letter:</strong> Paste a job description into the "Generate Cover Letter" tool to get a tailored letter that connects your resume to the job requirements.</li>
                        <li><strong>Download Your Resume:</strong> Export your finished resume in PDF, DOCX, or TXT format using the download buttons above the preview.</li>
                    </ol>
                </section>
                <section>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Frequently Asked Questions (FAQs)</h2>
                    <div className="mt-2 space-y-3 text-slate-600 dark:text-slate-300">
                        <div>
                            <h3 className="font-semibold">Is my resume data saved?</h3>
                            <p>For your convenience and privacy, all your resume data is saved automatically in your browser's local storage. It is not sent to our servers. Clearing your browser data will erase your saved resume.</p>
                        </div>
                        <div>
                            <h3 className="font-semibold">How does the AI scoring work?</h3>
                            <p>The AI analyzes your resume text for key factors that recruiters and Applicant Tracking Systems (ATS) look for, such as the use of action verbs, quantifiable achievements, clarity, and keyword relevance. It then provides a score and suggestions for improvement.</p>
                        </div>
                         <div>
                            <h3 className="font-semibold">Can I change the template or design?</h3>
                            <p>This version uses a clean, modern, and universally accepted template. We are working on adding more template options and design customizations in a future update.</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};


// --- FORM COMPONENT ---
const ResumeForm: React.FC<{ resumeData: ResumeData, setResumeData: (data: ResumeData) => void, onGenerateBullets: (expId: string, jobTitle: string) => void }> = ({ resumeData, setResumeData, onGenerateBullets }) => {
    
    const handleFieldChange = (section: keyof ResumeData, id: string | null, field: string, value: any) => {
        setResumeData({
            ...resumeData,
            [section]: id 
                ? (resumeData[section] as any[]).map(item => item.id === id ? { ...item, [field]: value } : item) 
                : { ...(resumeData[section] as object), [field]: value }
        });
    };

    const handleAddItem = (section: 'experience' | 'education' | 'skills' | 'projects') => {
        const newItem = {
            experience: { id: `exp-${Date.now()}`, title: '', company: '', location: '', startDate: '', endDate: '', bullets: [''] },
            education: { id: `edu-${Date.now()}`, degree: '', institution: '', location: '', date: '' },
            skills: { id: `skill-${Date.now()}`, name: '' },
            projects: { id: `proj-${Date.now()}`, name: '', description: '', link: '' }
        }[section];
        setResumeData({ ...resumeData, [section]: [...(resumeData[section] as any[]), newItem] });
    };

    const handleRemoveItem = (section: 'experience' | 'education' | 'skills' | 'projects', id: string) => {
        setResumeData({ ...resumeData, [section]: (resumeData[section] as any[]).filter(item => item.id !== id) });
    };

    const handleBulletChange = (expId: string, bulletIndex: number, value: string) => {
        const newExperience = resumeData.experience.map(exp => {
            if (exp.id === expId) {
                const newBullets = [...exp.bullets];
                newBullets[bulletIndex] = value;
                return { ...exp, bullets: newBullets };
            }
            return exp;
        });
        setResumeData({ ...resumeData, experience: newExperience });
    };
     const handleAddBullet = (expId: string) => {
        const newExperience = resumeData.experience.map(exp => exp.id === expId ? { ...exp, bullets: [...exp.bullets, ''] } : exp);
        setResumeData({ ...resumeData, experience: newExperience });
    };
    const handleRemoveBullet = (expId: string, bulletIndex: number) => {
        const newExperience = resumeData.experience.map(exp => exp.id === expId ? { ...exp, bullets: exp.bullets.filter((_, i) => i !== bulletIndex) } : exp);
        setResumeData({ ...resumeData, experience: newExperience });
    };

    return (
        <div className="space-y-6">
            <Section title="Personal Information">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Full Name" value={resumeData.personalInfo.name} onChange={e => handleFieldChange('personalInfo', null, 'name', e.target.value)} />
                    <Input label="Email" type="email" value={resumeData.personalInfo.email} onChange={e => handleFieldChange('personalInfo', null, 'email', e.target.value)} />
                    <Input label="Phone" value={resumeData.personalInfo.phone} onChange={e => handleFieldChange('personalInfo', null, 'phone', e.target.value)} />
                    <Input label="Location" value={resumeData.personalInfo.location} onChange={e => handleFieldChange('personalInfo', null, 'location', e.target.value)} />
                    <Input label="Website" value={resumeData.personalInfo.website} onChange={e => handleFieldChange('personalInfo', null, 'website', e.target.value)} />
                    <Input label="LinkedIn" value={resumeData.personalInfo.linkedin} onChange={e => handleFieldChange('personalInfo', null, 'linkedin', e.target.value)} />
                </div>
                <TextArea label="Summary" value={resumeData.personalInfo.summary} onChange={e => handleFieldChange('personalInfo', null, 'summary', e.target.value)} rows={4} />
            </Section>

            <Section title="Work Experience" onAdd={() => handleAddItem('experience')}>
                {resumeData.experience.map(exp => (
                    <div key={exp.id} className="p-4 border rounded-lg mb-4 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 space-y-3 relative">
                         <button onClick={() => handleRemoveItem('experience', exp.id)} className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-100 rounded-full"><TrashIcon className="w-4 h-4" /></button>
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Job Title" value={exp.title} onChange={e => handleFieldChange('experience', exp.id, 'title', e.target.value)} />
                            <Input label="Company" value={exp.company} onChange={e => handleFieldChange('experience', exp.id, 'company', e.target.value)} />
                        </div>
                         <Input label="Location" value={exp.location} onChange={e => handleFieldChange('experience', exp.id, 'location', e.target.value)} />
                        <div className="grid grid-cols-2 gap-4">
                             <Input label="Start Date" value={exp.startDate} onChange={e => handleFieldChange('experience', exp.id, 'startDate', e.target.value)} placeholder="e.g., 2020-01" />
                             <Input label="End Date" value={exp.endDate} onChange={e => handleFieldChange('experience', exp.id, 'endDate', e.target.value)} placeholder="e.g., Present" />
                        </div>
                        <div>
                             <label className="text-sm font-medium flex justify-between items-center">Accomplishments <button onClick={() => onGenerateBullets(exp.id, exp.title)} className="px-2 py-0.5 text-xs bg-amber-100 text-amber-800 rounded">AI Generate</button></label>
                            {exp.bullets.map((bullet, i) => (
                                <div key={i} className="flex items-center gap-2 mt-1">
                                    <input value={bullet} onChange={e => handleBulletChange(exp.id, i, e.target.value)} className="w-full p-1 text-sm border-b dark:bg-transparent dark:border-slate-600 focus:outline-none" />
                                    <button onClick={() => handleRemoveBullet(exp.id, i)}><TrashIcon className="w-3 h-3 text-red-400"/></button>
                                </div>
                            ))}
                            <button onClick={() => handleAddBullet(exp.id)} className="text-xs mt-2">+ Add bullet point</button>
                        </div>
                    </div>
                ))}
            </Section>

            <Section title="Education" onAdd={() => handleAddItem('education')}>
                {resumeData.education.map(edu => (
                     <div key={edu.id} className="p-4 border rounded-lg mb-4 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 space-y-3 relative">
                         <button onClick={() => handleRemoveItem('education', edu.id)} className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-100 rounded-full"><TrashIcon className="w-4 h-4" /></button>
                        <Input label="Degree / Certificate" value={edu.degree} onChange={e => handleFieldChange('education', edu.id, 'degree', e.target.value)} />
                        <Input label="Institution" value={edu.institution} onChange={e => handleFieldChange('education', edu.id, 'institution', e.target.value)} />
                         <div className="grid grid-cols-2 gap-4">
                            <Input label="Location" value={edu.location} onChange={e => handleFieldChange('education', edu.id, 'location', e.target.value)} />
                            <Input label="Date" value={edu.date} onChange={e => handleFieldChange('education', edu.id, 'date', e.target.value)} placeholder="e.g., 2020" />
                        </div>
                    </div>
                ))}
            </Section>

            <Section title="Skills" onAdd={() => handleAddItem('skills')}>
                <div className="flex flex-wrap gap-2">
                    {resumeData.skills.map(skill => (
                        <div key={skill.id} className="flex items-center gap-1 bg-slate-200 dark:bg-slate-700 rounded-full px-3 py-1 text-sm">
                            <input value={skill.name} onChange={e => handleFieldChange('skills', skill.id, 'name', e.target.value)} className="bg-transparent focus:outline-none w-24" />
                            <button onClick={() => handleRemoveItem('skills', skill.id)}>&times;</button>
                        </div>
                    ))}
                </div>
            </Section>
        </div>
    );
};


// --- PREVIEW COMPONENT ---
const ResumePreview: React.FC<{ resumeData: ResumeData, accentColor: string }> = ({ resumeData, accentColor }) => {
    const { personalInfo, experience, education, skills, projects } = resumeData;

    const formatUrl = (url: string) => {
        if (!url) return '#';
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        return `https://${url}`;
    };

    return (
        <div className="font-sans text-xs text-gray-800" style={{ '--accent-color': accentColor } as React.CSSProperties}>
            <header className="text-center mb-6">
                <h1 className="text-3xl font-bold tracking-wider">{personalInfo.name}</h1>
                <p className="text-xs mt-1">{personalInfo.location} | {personalInfo.phone} | {personalInfo.email}</p>
                 <p className="text-xs mt-1"><a href={formatUrl(personalInfo.website)} className="text-blue-600">{personalInfo.website}</a> | <a href={formatUrl(personalInfo.linkedin)} className="text-blue-600">{personalInfo.linkedin}</a></p>
            </header>
            <main>
                <section>
                    <h2 className="text-sm font-bold uppercase tracking-widest border-b-2 pb-1" style={{ borderColor: accentColor, color: accentColor }}>Summary</h2>
                    <p className="mt-2 text-justify">{personalInfo.summary}</p>
                </section>
                <section className="mt-4">
                     <h2 className="text-sm font-bold uppercase tracking-widest border-b-2 pb-1" style={{ borderColor: accentColor, color: accentColor }}>Experience</h2>
                    {experience.map(exp => (
                        <div key={exp.id} className="mt-3">
                            <div className="flex justify-between items-baseline">
                                <h3 className="text-sm font-bold">{exp.title}</h3>
                                <span className="text-xs font-light">{exp.startDate} - {exp.endDate}</span>
                            </div>
                            <div className="flex justify-between items-baseline">
                                <h4 className="text-sm italic">{exp.company}</h4>
                                <span className="text-xs font-light">{exp.location}</span>
                            </div>
                            <ul className="list-disc pl-5 mt-1 text-xs space-y-0.5">
                                {exp.bullets.map((b, i) => <li key={i}>{b}</li>)}
                            </ul>
                        </div>
                    ))}
                </section>
                 <section className="mt-4">
                     <h2 className="text-sm font-bold uppercase tracking-widest border-b-2 pb-1" style={{ borderColor: accentColor, color: accentColor }}>Education</h2>
                    {education.map(edu => (
                         <div key={edu.id} className="mt-3">
                            <div className="flex justify-between items-baseline">
                                <h3 className="text-sm font-bold">{edu.degree}</h3>
                                <span className="text-xs font-light">{edu.date}</span>
                            </div>
                            <h4 className="text-sm italic">{edu.institution}, {edu.location}</h4>
                        </div>
                    ))}
                </section>
                <section className="mt-4">
                     <h2 className="text-sm font-bold uppercase tracking-widest border-b-2 pb-1" style={{ borderColor: accentColor, color: accentColor }}>Skills</h2>
                     <p className="mt-2 text-xs">{skills.map(s => s.name).join(' • ')}</p>
                </section>
            </main>
        </div>
    );
};

// --- AI MODAL COMPONENTS ---
const AiScoreModal: React.FC<{ resumeText: string, onClose: () => void }> = ({ resumeText, onClose }) => {
    const [result, setResult] = useState<{ score: number; feedback: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const getScore = async () => {
            setIsLoading(true);
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
                const schema = {
                  type: Type.OBJECT,
                  properties: {
                    score: { type: Type.INTEGER, description: "A score from 0-100 evaluating the resume based on ATS compatibility, clarity, and impact." },
                    feedback: { type: Type.STRING, description: "Actionable feedback in Markdown format, with sections for 'Strengths' and 'Areas for Improvement'." }
                  },
                  required: ['score', 'feedback']
                };
                const prompt = `Act as a professional recruiter and ATS. Analyze the following resume text and provide a score and feedback.\n\n${resumeText}`;
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                    config: { responseMimeType: "application/json", responseSchema: schema }
                });
                setResult(JSON.parse(response.text));
            } catch (e) {
                console.error(e);
                setResult({ score: 0, feedback: "Error getting analysis. The AI might be busy or your API key may be invalid. Please try again." });
            } finally {
                setIsLoading(false);
            }
        };
        getScore();
    }, [resumeText]);

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg w-full max-w-lg space-y-4">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">AI Resume Analysis</h2>
                {isLoading ? (
                    <div className="flex flex-col items-center gap-4 p-8"><SpinnerIcon className="w-10 h-10 animate-spin text-[var(--theme-primary)]" /><p>Analyzing your resume...</p></div>
                ) : result && (
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <div className="w-32 h-32 flex-shrink-0">
                            <CircularProgressbar value={result.score} text={`${result.score}`} styles={buildStyles({ pathColor: `rgba(13, 62, 128, ${result.score / 100})`, textColor: '#0d3e80', trailColor: '#e0f2fe' })} />
                        </div>
                        <div className="max-h-64 overflow-y-auto text-sm prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: result.feedback.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                    </div>
                )}
                <div className="text-right"><button onClick={onClose} className="px-4 py-2 bg-slate-200 rounded-lg dark:bg-slate-600">Close</button></div>
            </div>
        </div>
    );
};

const CoverLetterModal: React.FC<{ resumeData: ResumeData, onClose: () => void }> = ({ resumeData, onClose }) => {
    const [jobDesc, setJobDesc] = useState('');
    const [letter, setLetter] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const generateLetter = async () => {
        if (!jobDesc.trim()) return;
        setIsLoading(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const resumeText = `Name: ${resumeData.personalInfo.name}\nSummary: ${resumeData.personalInfo.summary}\nExperience: ${resumeData.experience.map(e => `${e.title} at ${e.company}: ${e.bullets.join(', ')}`).join('; ')}\nSkills: ${resumeData.skills.map(s => s.name).join(', ')}`;
            const prompt = `Based on this resume: "${resumeText}" and this job description: "${jobDesc}", write a professional and concise cover letter.`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            setLetter(response.text);
        } catch (e) { console.error(e); } finally { setIsLoading(false); }
    };

    return (
         <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg w-full max-w-2xl space-y-4 max-h-[90vh] flex flex-col">
                <h2 className="text-xl font-bold">AI Cover Letter Generator</h2>
                <TextArea label="Paste Job Description Here" value={jobDesc} onChange={e => setJobDesc(e.target.value)} rows={5} />
                <button onClick={generateLetter} disabled={isLoading} className="w-full p-2 bg-sky-500 text-white rounded">{isLoading ? 'Generating...' : 'Generate Letter'}</button>
                <div className="flex-1 overflow-y-auto">
                    {isLoading && letter==='' && <SpinnerIcon className="w-8 h-8 animate-spin mx-auto mt-4"/>}
                    {letter && <TextArea label="Generated Cover Letter" value={letter} rows={15} readOnly />}
                </div>
                <div className="text-right"><button onClick={onClose} className="px-4 py-2 bg-slate-200 rounded-lg dark:bg-slate-600">Close</button></div>
            </div>
        </div>
    );
};

const AiBulletPointGeneratorModal: React.FC<{ target: { expId: string, jobTitle: string }, onGenerate: (bullets: string[]) => void, onClose: () => void }> = ({ target, onGenerate, onClose }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `For a resume with the job title "${target.jobTitle}", generate 3-4 impactful, accomplishment-driven bullet points. Focus on quantifiable achievements. Return the response as a valid JSON array of strings. Example: ["Led a team of 5 engineers to increase system efficiency by 15%", "Reduced server costs by $50,000 annually by migrating to a new cloud provider."]`
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            const resultText = response.text.replace(/```json|```/g, '').trim();
            const bullets = JSON.parse(resultText);
            onGenerate(bullets);
        } catch(e) { console.error(e); } finally { setIsLoading(false); }
    };
    
    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg w-full max-w-md space-y-4">
                 <h2 className="text-xl font-bold">Generate Bullet Points</h2>
                 <p>Let AI write powerful accomplishment statements for your role as a <strong>{target.jobTitle}</strong>.</p>
                 {isLoading 
                    ? <div className="flex justify-center p-8"><SpinnerIcon className="w-8 h-8 animate-spin"/></div>
                    : <div className="flex justify-end gap-2"><button onClick={onClose}>Cancel</button><button onClick={handleGenerate} className="px-4 py-2 bg-amber-500 text-white rounded">Generate</button></div>
                 }
            </div>
        </div>
    );
};

export default AIResumeBuilder;