import React from 'react';
import AIGenerator from '../components/AIGenerator';

const GrammarFixer: React.FC = () => {
  return (
    <AIGenerator
      title="Grammar Fixer"
      description="Paste your text to automatically correct spelling, grammar, and punctuation errors."
      promptPrefix="Please correct the grammar and spelling of the following text. Only return the corrected text."
      placeholder="e.g., i is a good writter and i makes no misteaks."
    />
  );
};

export default GrammarFixer;
