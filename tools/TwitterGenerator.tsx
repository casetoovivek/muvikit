import React from 'react';
import AIGenerator from '../components/AIGenerator';

const TwitterGenerator: React.FC = () => {
  return (
    <AIGenerator
      title="Tweet Generator"
      description="Enter a topic or idea to generate a short, engaging tweet."
      promptPrefix="Write a concise and engaging tweet (under 280 characters) about the following topic. Include 2-3 relevant hashtags."
      placeholder="e.g., sharing a new productivity hack, commenting on a recent tech announcement"
    />
  );
};

export default TwitterGenerator;
