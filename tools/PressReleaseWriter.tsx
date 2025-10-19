import React from 'react';
import AIGenerator from '../components/AIGenerator';

const PressReleaseWriter: React.FC = () => {
  return (
    <AIGenerator
      title="Press Release Writer"
      description="Provide the key information about your announcement to generate a professional press release."
      promptPrefix="Write a professional press release in the standard format based on the following information. Include a headline, dateline, introduction, body, boilerplate, and contact information."
      placeholder="e.g., Company X is launching a new AI-powered product on July 1st. The product helps businesses automate customer service."
    />
  );
};

export default PressReleaseWriter;
