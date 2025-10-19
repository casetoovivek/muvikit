import React from 'react';
import AIGenerator from '../components/AIGenerator';

const EssayWriter: React.FC = () => {
  return (
    <AIGenerator
      title="AI Essay Writer"
      description="Provide a topic or thesis statement, and the AI will generate a well-structured essay for you."
      promptPrefix="Write a detailed, multi-paragraph essay on the following topic. Ensure it has a clear introduction, body, and conclusion."
      placeholder="e.g., The impact of renewable energy on the global economy"
    />
  );
};

export default EssayWriter;
