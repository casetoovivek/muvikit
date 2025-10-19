import React from 'react';
import AIGenerator from '../components/AIGenerator';

const YouTubeScriptWriter: React.FC = () => {
  return (
    <AIGenerator
      title="YouTube Script Writer"
      description="Enter a topic for your video, and the AI will help you generate an engaging script."
      promptPrefix="Write an engaging YouTube video script for the following topic. Include an interesting hook at the beginning, main content points, and a call to action at the end."
      placeholder="e.g., A review of the latest smartphone, a tutorial on how to bake sourdough bread, the history of the Roman Empire"
    />
  );
};

export default YouTubeScriptWriter;
