import React from 'react';
import AIGenerator from '../components/AIGenerator';

const ContentImprover: React.FC = () => {
  return (
    <AIGenerator
      title="Content Improver"
      description="Paste your text below to have the AI improve its wording, tone, and overall quality."
      promptPrefix="Please improve the following text. Rephrase it to be more clear, engaging, and professional. Fix any grammatical errors."
      placeholder="e.g., The meeting was good. We talked about sales. The numbers went up."
    />
  );
};

export default ContentImprover;
