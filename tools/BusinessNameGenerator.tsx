import React from 'react';
import AIGenerator from '../components/AIGenerator';

const BusinessNameGenerator: React.FC = () => {
  return (
    <AIGenerator
      title="Business Name Generator"
      description="Describe your business or industry to generate a list of creative name ideas."
      promptPrefix="Generate a list of 10 creative and memorable business names for a company in the following industry or with the following description."
      placeholder="e.g., an eco-friendly cleaning service, a subscription box for coffee lovers, a mobile app for dog walkers"
    />
  );
};

export default BusinessNameGenerator;
