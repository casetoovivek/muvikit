import React from 'react';
import AIGenerator from '../components/AIGenerator';

const RealEstateDescriptionGenerator: React.FC = () => {
  return (
    <AIGenerator
      title="Real Estate Description Generator"
      description="Enter key features of a property to generate a compelling listing description."
      promptPrefix="Write a compelling and persuasive real estate listing description based on the following features."
      placeholder="e.g., 3 bedroom, 2 bath, modern kitchen, large backyard, quiet neighborhood, close to schools"
    />
  );
};

export default RealEstateDescriptionGenerator;
