import React from 'react';
import AIGenerator from '../components/AIGenerator';

const InstagramCaptionGenerator: React.FC = () => {
  return (
    <AIGenerator
      title="Instagram Caption Generator"
      description="Describe your photo, and the AI will generate a caption with relevant emojis and hashtags."
      promptPrefix="Write 3 engaging Instagram captions for a photo with the following description. Include relevant emojis and hashtags."
      placeholder="e.g., a photo of me hiking in the mountains at sunrise"
    />
  );
};

export default InstagramCaptionGenerator;
