import React from 'react';
import AIGenerator from '../components/AIGenerator';

const ListicleWriter: React.FC = () => {
  return (
    <AIGenerator
      title="Listicle Writer"
      description="Enter a topic, and the AI will generate a list-based article (a 'listicle') for you."
      promptPrefix="Write a listicle with an introduction and several numbered points about the following topic."
      placeholder="e.g., 7 surprising benefits of drinking water"
    />
  );
};

export default ListicleWriter;
