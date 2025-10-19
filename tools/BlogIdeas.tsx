import React from 'react';
import AIGenerator from '../components/AIGenerator';

const BlogIdeas: React.FC = () => {
  return (
    <AIGenerator
      title="Blog Post Ideas"
      description="Stuck on what to write? Enter a keyword or topic to generate a list of blog post ideas."
      promptPrefix="Generate a list of 10 engaging blog post ideas and titles about the following topic."
      placeholder="e.g., sustainable living, digital marketing for beginners, healthy breakfast recipes"
    />
  );
};

export default BlogIdeas;
