import React from 'react';
import AIGenerator from '../components/AIGenerator';

const ParagraphWriter: React.FC = () => {
  return (
    <AIGenerator
      title="Paragraph Writer"
      description="Enter a topic or a sentence, and the AI will generate a complete paragraph for you."
      promptPrefix="Write a detailed and coherent paragraph about the following topic."
      placeholder="e.g., The importance of bees in the ecosystem"
    />
  );
};

export default ParagraphWriter;
