import React from 'react';
import AIGenerator from '../components/AIGenerator';

const LinkedInPostGenerator: React.FC = () => {
  return (
    <AIGenerator
      title="LinkedIn Post Generator"
      description="Enter a topic or update to generate a professional post for your LinkedIn profile."
      promptPrefix="Write a professional and engaging LinkedIn post about the following topic. Include relevant hashtags."
      placeholder="e.g., successfully launching a new project, key takeaways from a recent conference, thoughts on the future of AI"
    />
  );
};

export default LinkedInPostGenerator;
