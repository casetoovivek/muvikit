import React from 'react';
import AIGenerator from '../components/AIGenerator';

const HeadlineGenerator: React.FC = () => {
  return (
    <AIGenerator
      title="Headline Generator"
      description="Enter a topic for your article or blog post to generate a list of catchy headlines."
      promptPrefix="Generate 5 catchy and effective headlines for a blog post about the following topic."
      placeholder="e.g., The benefits of remote work"
    />
  );
};

export default HeadlineGenerator;
