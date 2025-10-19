import React from 'react';
import AIGenerator from '../components/AIGenerator';

const ColdEmailWriter: React.FC = () => {
  return (
    <AIGenerator
      title="Cold Email Writer"
      description="Describe your goal, target, and offer to generate a persuasive cold email."
      promptPrefix="Write a professional and persuasive cold email with the following goal, target audience, and offer. Make it concise and include a clear call to action."
      placeholder="Goal: Schedule a demo. Target: Marketing managers at tech startups. Offer: A free trial of our new analytics software."
    />
  );
};

export default ColdEmailWriter;
