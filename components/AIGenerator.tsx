import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { SpinnerIcon } from './icons';

interface AIGeneratorProps {
  title: string;
  description: string;
  promptPrefix: string;
  placeholder: string;
}

const AIGenerator: React.FC<AIGeneratorProps> = ({ title, description, promptPrefix, placeholder }) => {
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!userInput.trim()) {
      setError('Please enter some text to get started.');
      return;
    }
    setIsLoading(true);
    setResult('');
    setError('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const fullPrompt = `${promptPrefix}: "${userInput}"`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
      });
      setResult(response.text);
    } catch (err) {
      setError('An error occurred while generating content. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{title}</h2>
        <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">{description}</p>
      </div>

      <div className="space-y-4">
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder={placeholder}
          className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] transition-shadow duration-200 resize-none dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400"
          disabled={isLoading}
        />
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="px-6 py-3 w-full sm:w-auto bg-[var(--theme-primary)] text-white font-semibold rounded-lg shadow-md hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center dark:disabled:bg-slate-600"
        >
          {isLoading ? <><SpinnerIcon className="w-5 h-5 mr-2 animate-spin"/> Generating...</> : 'Generate'}
        </button>
      </div>

      {error && <div className="p-4 bg-red-100 text-red-800 border border-red-200 rounded-lg dark:bg-red-900/50 dark:text-red-300 dark:border-red-800">{error}</div>}
      
      {result && (
        <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2 dark:text-slate-200">Generated Content</h3>
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-lg whitespace-pre-wrap text-md leading-relaxed dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-200">
                {result}
            </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 space-y-6">
        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">About the {title}</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">The {title} is a powerful tool that leverages advanced AI models to {description.toLowerCase().replace(/^./, c => c.toUpperCase())}. Whether you're a student, writer, marketer, or professional, this tool helps you generate high-quality content instantly, saving you time and overcoming creative blocks.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">How to Use This AI Tool</h2>
          <ol className="list-decimal list-inside mt-2 space-y-2 text-slate-600 dark:text-slate-300">
            <li><strong>Provide Input:</strong> In the text area, enter the topic, keywords, or existing text you want the AI to work with. Be as specific as possible for the best results.</li>
            <li><strong>Click Generate:</strong> Press the "Generate" button to send your request to the AI.</li>
            <li><strong>Review and Use:</strong> The AI-generated content will appear below. You can copy it, refine it, or use it as a starting point for your work.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Benefits of AI Content Generation</h2>
            <ul className="list-disc list-inside mt-2 space-y-2 text-slate-600 dark:text-slate-300">
                <li><strong>Boosts Productivity:</strong> Generate drafts, ideas, or complete pieces of content in seconds, not hours.</li>
                <li><strong>Overcomes Writer's Block:</strong> Provides a creative starting point when you're feeling stuck.</li>
                <li><strong>Enhances Quality:</strong> Can help improve grammar, style, and clarity in your writing.</li>
                <li><strong>Versatile Applications:</strong> Useful for everything from academic essays and blog posts to marketing copy and social media updates.</li>
            </ul>
        </section>

        <section>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Frequently Asked Questions (FAQs)</h2>
            <div className="mt-2 space-y-3 text-slate-600 dark:text-slate-300">
              <div>
                <h3 className="font-semibold">Is the generated content original?</h3>
                <p>Yes, the AI generates unique content based on your prompt. However, for academic or professional work, it's always a good practice to check for plagiarism and add your own voice and perspective.</p>
              </div>
              <div>
                <h3 className="font-semibold">Is my data saved?</h3>
                <p>No. Your prompts and the generated content are not stored by our service. Your session is private and secure.</p>
              </div>
               <div>
                <h3 className="font-semibold">How can I get the best results?</h3>
                <p>Provide clear and specific instructions. For example, instead of "write about dogs," try "write a blog post introduction about the benefits of adopting a rescue dog."</p>
              </div>
            </div>
        </section>
      </div>
    </div>
  );
};

export default AIGenerator;
