import React, { useState, useEffect, useMemo, useRef } from 'react';
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { PdfFileIcon, DownloadIcon, SearchIcon, ImageIcon, TrashIcon, SpinnerIcon, LightbulbIcon, LinkIcon, AudioIcon, WriteIcon, YouTubeIcon, GovIcon, DocumentTextIcon, GlobeAltIcon, AcademicCapIcon, QuestionMarkCircleIcon, SparklesIcon, MindMapIcon } from '../components/icons';

// FIX: Added missing type definitions for Source, ChatMessage, Flashcard, and QuizQuestion.
// --- TYPE DEFINITIONS ---
interface Source {
    id: string;
    name: string;
    type: 'PDF' | 'TXT' | 'Website' | 'YouTube';
    content: string;
    icon: React.ReactElement;
    size?: string;
}

interface ChatMessage {
    sender: 'user' | 'ai';
    text: string;
}

interface Flashcard {
    term: string;
    definition: string;
}

interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: string;
}


// --- DECODE AUDIO DATA (as per guidelines) ---
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


// --- MAIN COMPONENT ---
const SourceMind: React.FC = () => {
    const [sources, setSources] = useState<Source[]>([]);
    const [conversation, setConversation] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');
    const [activeModal, setActiveModal] = useState<string | null>(null);
    const [generatedContent, setGeneratedContent] = useState<any>(null);
    const userInputRef = useRef<HTMLInputElement>(null);

    const showPopup = (message: string) => {
        setPopupMessage(message);
        setIsPopupVisible(true);
        setTimeout(() => setIsPopupVisible(false), 3000);
    };

    const handleAddSource = async (file?: File, url?: string, type?: 'Website' | 'YouTube') => {
        setIsLoading(true);
        setPopupMessage('Processing source...');
        setIsPopupVisible(true);

        try {
            let newSource: Source | null = null;
            if (file) {
                const content = file.type === 'application/pdf' 
                    ? await extractPdfText(file) 
                    : await file.text();
                
                newSource = {
                    id: `file-${Date.now()}`,
                    name: file.name,
                    type: file.type === 'application/pdf' ? 'PDF' : 'TXT',
                    content,
                    icon: file.type === 'application/pdf' ? <PdfFileIcon className="w-5 h-5 text-red-500" /> : <DocumentTextIcon className="w-5 h-5 text-gray-500" />,
                    size: `${(file.size / 1024).toFixed(1)} KB`,
                };
            } else if (url && type) {
                 // For this client-side demo, we'll use AI to "simulate" fetching content
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
                const prompt = type === 'YouTube' 
                    ? `Summarize the key points of the YouTube video at this URL: ${url}`
                    : `Provide a comprehensive summary of the content at this webpage: ${url}`;
                
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                    config: { tools: [{ googleSearch: {} }] }
                });

                newSource = {
                    id: `url-${Date.now()}`,
                    name: url,
                    type,
                    content: response.text,
                    icon: type === 'YouTube' ? <YouTubeIcon className="w-5 h-5 text-red-600" /> : <GlobeAltIcon className="w-5 h-5 text-blue-500" />,
                };
            }
            if (newSource) {
                setSources(prev => [...prev, newSource]);
                showPopup(`Added source: ${newSource.name}`);
            }
        } catch (error) {
            console.error(error);
            showPopup('Failed to process source.');
        } finally {
            setIsLoading(false);
            setIsPopupVisible(false);
            setActiveModal(null);
        }
    };

    const extractPdfText = async (file: File): Promise<string> => {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await (window as any).pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let text = '';
        for (let i = 1; i <= pdfDoc.numPages; i++) {
            const page = await pdfDoc.getPage(i);
            const textContent = await page.getTextContent();
            text += textContent.items.map((item: any) => item.str).join(' ');
        }
        return text;
    };

    const handleSendMessage = async () => {
        const question = userInputRef.current?.value;
        if (!question || isLoading) return;
        if (sources.length === 0) {
            showPopup('Please add at least one source before asking a question.');
            return;
        }

        setIsLoading(true);
        setConversation(prev => [...prev, { sender: 'user', text: question }]);
        if (userInputRef.current) userInputRef.current.value = '';

        try {
            const sourceContext = sources.map(s => `--- Source: ${s.name} ---\n${s.content}`).join('\n\n');
            // FIX: Corrected the invalid template literal syntax in the prompt string.
            // The original `\${'${source_name}'}` was causing a compilation error because `source_name` is not defined.
            // Replaced it with a clear placeholder instruction for the AI on how to format citations.
            const prompt = `You are a research assistant. Based ONLY on the provided sources below, answer the user's question. After each piece of information you provide, cite the source in the format [Source: <source name>]. If the answer cannot be found in the sources, say 'I could not find an answer in the provided sources.'\n\n---SOURCES---\n${sourceContext}\n\n---QUESTION---\n${question}`;
            
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            
            setConversation(prev => [...prev, { sender: 'ai', text: response.text }]);

        } catch (error) {
            console.error(error);
            setConversation(prev => [...prev, { sender: 'ai', text: 'Sorry, I encountered an error. Please try again.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStudioAction = async (action: 'Audio' | 'Flashcards' | 'Quiz' | 'StudyGuide' | 'BriefingDoc' | 'MindMap') => {
        if (sources.length === 0) {
            showPopup('Please add sources before generating content.');
            return;
        }
        
        setIsLoading(true);
        setGeneratedContent(null);
        setActiveModal(action);

        const sourceContext = sources.map(s => `--- Source: ${s.name} ---\n${s.content}`).join('\n\n');
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        
        try {
            switch(action) {
                case 'Audio':
                    const audioPrompt = `Create a cheerful, engaging, two-person podcast-style audio overview of the following content. Make it sound like a conversation between two hosts, Joe and Jane, discussing the key points. Content: ${sourceContext}`;
                    const audioResponse = await ai.models.generateContent({
                        model: "gemini-2.5-flash-preview-tts",
                        contents: [{ parts: [{ text: audioPrompt }] }],
                        config: {
                            responseModalities: [Modality.AUDIO],
                            speechConfig: {
                                multiSpeakerVoiceConfig: {
                                speakerVoiceConfigs: [
                                    { speaker: 'Joe', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
                                    { speaker: 'Jane', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } }
                                ] }
                            }
                        }
                    });
                    const base64Audio = audioResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
                    if (base64Audio) setGeneratedContent({ type: 'audio', data: base64Audio });
                    break;
                case 'Flashcards':
                    const flashcardSchema = {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                term: { type: Type.STRING },
                                definition: { type: Type.STRING }
                            },
                            required: ['term', 'definition']
                        }
                    };
                    const flashcardResponse = await ai.models.generateContent({
                        model: 'gemini-2.5-pro',
                        contents: `Based on the provided sources, create a set of 10-15 flashcards covering the key terms and concepts.\n\n${sourceContext}`,
                        config: { responseMimeType: "application/json", responseSchema: flashcardSchema }
                    });
                    setGeneratedContent({ type: 'flashcards', data: JSON.parse(flashcardResponse.text) });
                    break;
                case 'Quiz':
                    const quizSchema = {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                question: { type: Type.STRING },
                                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                                correctAnswer: { type: Type.STRING }
                            },
                             required: ['question', 'options', 'correctAnswer']
                        }
                    };
                     const quizResponse = await ai.models.generateContent({
                        model: 'gemini-2.5-pro',
                        contents: `Based on the provided sources, create a multiple-choice quiz with 5 questions (each with 4 options) to test understanding.\n\n${sourceContext}`,
                        config: { responseMimeType: "application/json", responseSchema: quizSchema }
                    });
                    setGeneratedContent({ type: 'quiz', data: JSON.parse(quizResponse.text) });
                    break;
                case 'StudyGuide':
                case 'BriefingDoc':
                    const docPrompt = action === 'StudyGuide'
                        ? `Create a comprehensive study guide from the provided sources. Use Markdown for formatting, including headings, bullet points, and bold text for key terms.`
                        : `Create a concise, one-page briefing document summarizing the most critical information from the provided sources. Use Markdown for clear headings and bullet points.`;
                    const docResponse = await ai.models.generateContent({
                        model: 'gemini-2.5-pro',
                        contents: `${docPrompt}\n\n${sourceContext}`
                    });
                    setGeneratedContent({ type: 'document', data: docResponse.text, title: action === 'StudyGuide' ? 'Study Guide' : 'Briefing Document' });
                    break;
                 case 'MindMap':
                    const mindMapSchema = {
                        type: Type.OBJECT,
                        properties: {
                            root: {
                                type: Type.OBJECT,
                                properties: {
                                    topic: { type: Type.STRING },
                                    children: {
                                        type: Type.ARRAY,
                                        items: {
                                            type: Type.OBJECT,
                                            properties: {
                                                topic: { type: Type.STRING },
                                                // Define children as a generic array to stop schema recursion.
                                                // The model will infer the recursive structure from the prompt.
                                                children: { type: Type.ARRAY }
                                            },
                                            required: ['topic', 'children']
                                        }
                                    }
                                },
                                required: ['topic', 'children']
                            }
                        },
                        required: ['root']
                    };
                    const mindMapResponse = await ai.models.generateContent({
                        model: 'gemini-2.5-pro',
                        contents: `Based on the provided sources, create a hierarchical mind map of the key concepts. The mind map should have a central root topic and nested children. Return the response as a valid JSON object with a single 'root' key. The root object and all children should have 'topic' (string) and 'children' (array of objects) keys. Keep topics concise.\n\n${sourceContext}`,
                        config: { responseMimeType: "application/json", responseSchema: mindMapSchema }
                    });
                    setGeneratedContent({ type: 'mindmap', data: JSON.parse(mindMapResponse.text) });
                    break;
            }
        } catch(e) {
            console.error(e);
            showPopup(`Failed to generate ${action}.`);
            setActiveModal(null);
        } finally {
            setIsLoading(false);
        }
    };
    
    const ComingSoonPopup = () => (
        <div className={`fixed bottom-5 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-lg shadow-lg transition-opacity duration-300 ${isPopupVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            {popupMessage}
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 -m-6 lg:-m-10 h-full bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200" style={{ height: 'calc(100vh - 64px)' }}>
                <ComingSoonPopup />
                
                {/* --- MODALS --- */}
                {activeModal === 'AddSource' && <AddSourceModal onAdd={handleAddSource} onClose={() => setActiveModal(null)} isLoading={isLoading} />}
                {activeModal && ['Flashcards', 'Quiz', 'Audio', 'StudyGuide', 'BriefingDoc', 'MindMap'].includes(activeModal) &&
                    <ContentModal
                        type={activeModal}
                        content={generatedContent}
                        isLoading={isLoading}
                        onClose={() => setActiveModal(null)}
                    />
                }

                {/* Left Panel: Sources */}
                <div className="w-full md:w-1/4 lg:w-1/5 p-4 border-r dark:border-slate-700 flex flex-col">
                    <h2 className="text-lg font-bold mb-4">Sources ({sources.length})</h2>
                    <button onClick={() => setActiveModal('AddSource')} className="w-full p-2 bg-[var(--theme-primary)] text-white font-semibold rounded-md hover:opacity-90 text-sm mb-4">
                        + Add Source
                    </button>
                    <div className="flex-1 overflow-y-auto space-y-2">
                        {sources.map(source => (
                            <div key={source.id} className="p-2.5 bg-white dark:bg-slate-800 rounded-md border dark:border-slate-700 flex items-center gap-3">
                                {source.icon}
                                <div className="flex-1 truncate">
                                    <p className="text-sm font-medium truncate" title={source.name}>{source.name}</p>
                                    <p className="text-xs text-slate-500">{source.type} {source.size && `(${source.size})`}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Center Panel: Chat */}
                <div className="w-full md:w-1/2 lg:w-3/5 p-4 flex flex-col bg-white dark:bg-slate-800/50">
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {conversation.length === 0 ? (
                            <div className="text-center p-8">
                                <h1 className="text-2xl font-bold">Welcome to SourceMind</h1>
                                <p className="text-slate-500 mt-1">Your AI research partner.</p>
                                <p className="text-sm mt-4 p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg">Add a source and ask a question to begin.</p>
                            </div>
                        ) : (
                            conversation.map((msg, i) => (
                                <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-xl p-3 rounded-lg ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>
                                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                    </div>
                                </div>
                            ))
                        )}
                        {isLoading && conversation.length > 0 && (
                            <div className="flex justify-start"><div className="p-3 rounded-lg bg-slate-200 dark:bg-slate-700"><SpinnerIcon className="w-5 h-5 animate-spin" /></div></div>
                        )}
                    </div>
                    <div className="p-4 border-t dark:border-slate-700">
                        <div className="relative">
                            <input
                                ref={userInputRef}
                                type="text"
                                placeholder={sources.length > 0 ? "Ask a question about your sources..." : "Add a source to enable chat"}
                                disabled={isLoading || sources.length === 0}
                                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                                className="w-full p-4 pr-12 border rounded-full bg-slate-100 dark:bg-slate-700 dark:border-slate-600 disabled:cursor-not-allowed"
                            />
                            <button onClick={handleSendMessage} disabled={isLoading || sources.length === 0} className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500 hover:text-blue-500 disabled:text-slate-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Studio */}
                <div className="w-full md:w-1/4 lg:w-1/4 p-4 border-l dark:border-slate-700 flex flex-col">
                    <h2 className="text-lg font-bold mb-4">Studio</h2>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <StudioButton icon={<AudioIcon />} title="Audio Overview" onClick={() => handleStudioAction('Audio')}/>
                        <StudioButton icon={<AcademicCapIcon />} title="Flashcards" onClick={() => handleStudioAction('Flashcards')}/>
                        <StudioButton icon={<QuestionMarkCircleIcon />} title="Quiz Me" onClick={() => handleStudioAction('Quiz')}/>
                        <StudioButton icon={<WriteIcon />} title="Study Guide" onClick={() => handleStudioAction('StudyGuide')}/>
                        <StudioButton icon={<PdfFileIcon />} title="Briefing Doc" onClick={() => handleStudioAction('BriefingDoc')}/>
                        <StudioButton icon={<MindMapIcon />} title="Mind Map" onClick={() => handleStudioAction('MindMap')}/>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 space-y-6">
                <section>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">What is SourceMind AI?</h2>
                    <p className="mt-2 text-slate-600 dark:text-slate-300">SourceMind AI is an intelligent research assistant designed to supercharge your learning and productivity. Instead of spending hours reading through documents, articles, or watching videos, you can simply add them as "sources" and let the AI do the heavy lifting. Ask specific questions about the content, and get instant, accurate answers with citations. SourceMind can also transform your source material into useful assets like audio summaries, flashcards, quizzes, and study guides.</p>
                </section>
                <section>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">How to Use SourceMind</h2>
                    <ol className="list-decimal list-inside mt-2 space-y-2 text-slate-600 dark:text-slate-300">
                        <li><strong>Add Your Sources:</strong> Click "+ Add Source" to upload PDFs, text files, or paste URLs from websites and YouTube.</li>
                        <li><strong>Chat with Your Documents:</strong> Once a source is added, the chat becomes active. Ask specific questions about the content (e.g., "What were the key findings of the report?"). The AI will answer based only on the documents you provided.</li>
                        <li><strong>Generate Study Materials:</strong> Use the "Studio" panel to instantly create flashcards, quizzes, audio overviews, and detailed study guides from your source material.</li>
                    </ol>
                </section>
                <section>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Frequently Asked Questions (FAQs)</h2>
                    <div className="mt-2 space-y-3 text-slate-600 dark:text-slate-300">
                        <div>
                            <h3 className="font-semibold">Where is my data stored?</h3>
                            <p>For your privacy, this version of SourceMind processes and holds your data only for your current session. When you close the browser tab, the uploaded sources and conversations are cleared.</p>
                        </div>
                        <div>
                            <h3 className="font-semibold">What file types are supported?</h3>
                            <p>You can currently upload PDF and TXT files. You can also add content from any public website URL or YouTube video link (the AI will analyze the summary/transcript).</p>
                        </div>
                         <div>
                            <h3 className="font-semibold">How accurate are the AI's answers?</h3>
                            <p>The AI is designed to answer questions based strictly on the source material you provide to ensure high accuracy and avoid making things up. However, for complex topics, it's always good practice to double-check critical information.</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

// --- MODAL & SUB-COMPONENTS ---
const StudioButton: React.FC<{icon: React.ReactElement<any>, title: string, onClick: () => void}> = ({ icon, title, onClick }) => (
    <button onClick={onClick} className="p-3 bg-white dark:bg-slate-800 rounded-lg border dark:border-slate-700 flex flex-col items-center justify-center gap-2 text-center hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer">
        {React.cloneElement(icon, { className: 'w-6 h-6 text-[var(--theme-primary)] dark:text-sky-400' })}
        <span className="font-semibold">{title}</span>
    </button>
);

const AddSourceModal: React.FC<{ onAdd: (file?: File, url?: string, type?: 'Website' | 'YouTube') => void; onClose: () => void, isLoading: boolean }> = ({ onAdd, onClose, isLoading }) => {
    const [url, setUrl] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg w-full max-w-md space-y-4" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold">Add a New Source</h2>
                <button onClick={() => fileInputRef.current?.click()} disabled={isLoading} className="w-full p-4 border-2 border-dashed rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 flex flex-col items-center justify-center">
                    <DownloadIcon className="w-8 h-8 text-slate-400" />
                    <span className="font-semibold mt-2">Upload File</span>
                    <span className="text-xs text-slate-500">PDF, TXT, MD</span>
                </button>
                <input type="file" ref={fileInputRef} onChange={e => e.target.files && onAdd(e.target.files[0])} className="hidden" accept=".pdf,.txt,.md" />
                <div className="space-y-2">
                    <p className="text-sm font-medium">Or add from URL</p>
                    <div className="flex gap-2">
                        <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com" className="flex-1 p-2 border rounded dark:bg-slate-700" />
                        <button onClick={() => onAdd(undefined, url, 'Website')} disabled={isLoading || !url} className="px-3 bg-blue-500 text-white rounded text-sm">Web</button>
                        <button onClick={() => onAdd(undefined, url, 'YouTube')} disabled={isLoading || !url} className="px-3 bg-red-500 text-white rounded text-sm">YT</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ContentModal: React.FC<{ type: string, content: any, isLoading: boolean, onClose: () => void }> = ({ type, content, isLoading, onClose }) => {
    let title = '';
    let body: React.ReactNode = null;
    
    if (isLoading) {
        body = <div className="flex justify-center items-center h-48"><SpinnerIcon className="w-10 h-10 animate-spin" /></div>;
    } else if (content) {
        switch(content.type) {
            case 'audio':
                title = 'Audio Overview';
                body = <AudioPlayer base64Audio={content.data} />;
                break;
            case 'flashcards':
                title = 'Flashcards';
                body = <FlashcardViewer flashcards={content.data} />;
                break;
            case 'quiz':
                title = 'Quiz';
                body = <QuizViewer questions={content.data} />;
                break;
            case 'document':
                 title = content.title;
                 body = <div className="prose prose-sm dark:prose-invert max-w-none p-4 bg-slate-100 dark:bg-slate-900 rounded-md" dangerouslySetInnerHTML={{ __html: content.data.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />;
                break;
             case 'mindmap':
                title = 'Mind Map';
                body = <MindMapViewer data={content.data} />;
                break;
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg w-full max-w-2xl space-y-4 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold">{title}</h2>
                <div className="flex-1 overflow-y-auto">{body}</div>
                <div className="text-right"><button onClick={onClose} className="px-4 py-2 bg-slate-200 rounded-lg dark:bg-slate-600">Close</button></div>
            </div>
        </div>
    );
};

const AudioPlayer: React.FC<{ base64Audio: string }> = ({ base64Audio }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceRef = useRef<AudioBufferSourceNode | null>(null);

    const playAudio = async () => {
        if (isPlaying || !base64Audio) return;
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }
            const audioBuffer = await decodeAudioData(decode(base64Audio), audioContextRef.current, 24000, 1);
            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current.destination);
            source.onended = () => setIsPlaying(false);
            source.start();
            sourceRef.current = source;
            setIsPlaying(true);
        } catch(e) { console.error("Error playing audio", e); }
    };
    
    return <button onClick={playAudio} className="p-4 bg-blue-500 text-white rounded-full">{isPlaying ? 'Playing...' : 'Play Podcast'}</button>;
};

const FlashcardViewer: React.FC<{ flashcards: Flashcard[] }> = ({ flashcards }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    return (
        <div className="flex flex-col items-center gap-4">
            <div onClick={() => setIsFlipped(!isFlipped)} className="w-full h-48 border rounded-lg flex items-center justify-center p-4 text-center cursor-pointer" style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : '', transition: 'transform 0.6s' }}>
                <div style={{ backfaceVisibility: 'hidden', transform: 'rotateY(0deg)' }}>{flashcards[currentIndex].term}</div>
                <div style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', position: 'absolute' }}>{flashcards[currentIndex].definition}</div>
            </div>
            <div className="flex gap-4 items-center">
                <button onClick={() => setCurrentIndex(p => Math.max(0, p - 1))}>Prev</button>
                <span>{currentIndex + 1} / {flashcards.length}</span>
                <button onClick={() => setCurrentIndex(p => Math.min(flashcards.length - 1, p + 1))}>Next</button>
            </div>
        </div>
    );
};

const QuizViewer: React.FC<{ questions: QuizQuestion[] }> = ({ questions }) => {
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [showResults, setShowResults] = useState(false);
    const score = useMemo(() => questions.reduce((acc, q, i) => acc + (answers[i] === q.correctAnswer ? 1 : 0), 0), [answers, questions, showResults]);

    return (
        <div className="space-y-4">
            {questions.map((q, i) => (
                <div key={i} className="p-3 border rounded-lg dark:border-slate-700">
                    <p className="font-semibold">{i + 1}. {q.question}</p>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        {q.options.map(opt => (
                            <button 
                                key={opt} 
                                onClick={() => setAnswers(p => ({...p, [i]: opt}))}
                                className={`p-2 text-sm rounded border ${answers[i] === opt ? 'bg-blue-200 border-blue-400 dark:bg-blue-900' : 'bg-slate-100 dark:bg-slate-900'} ${showResults ? (opt === q.correctAnswer ? 'border-green-500' : (answers[i] === opt ? 'border-red-500' : '')) : ''}`}
                                disabled={showResults}
                            >{opt}</button>
                        ))}
                    </div>
                </div>
            ))}
            {showResults ? (
                <div className="text-center font-bold text-lg">You scored {score} out of {questions.length}</div>
            ) : (
                <button onClick={() => setShowResults(true)} className="w-full p-2 bg-green-500 text-white rounded">Submit</button>
            )}
        </div>
    );
};

interface MindMapNode { topic: string; children: MindMapNode[]; }

const MindMapNodeView: React.FC<{ node: MindMapNode }> = ({ node }) => (
    <li>
        <span className="p-2 bg-slate-200 dark:bg-slate-700 rounded-md inline-block">{node.topic}</span>
        {node.children && node.children.length > 0 && (
            <ul className="pl-8 pt-2 space-y-2 border-l-2 ml-4 dark:border-slate-600">
                {node.children.map((child, index) => <MindMapNodeView key={index} node={child} />)}
            </ul>
        )}
    </li>
);

const MindMapViewer: React.FC<{ data: { root: MindMapNode } }> = ({ data }) => {
    if (!data || !data.root) return <p>No mind map data available.</p>;
    return (
        <div className="p-4">
            <ul className="space-y-2">
                <MindMapNodeView node={data.root} />
            </ul>
        </div>
    );
};

export default SourceMind;
