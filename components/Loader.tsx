import React from 'react';

interface LoaderProps {
  topic: string;
}

const Loader: React.FC<LoaderProps> = ({ topic }) => {
  // Extract clean name if it's our long formatted string
  const displayTopic = topic.includes(' - ') ? topic.split(' - ')[1].split('(')[0] : topic;

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
           <span className="text-2xl">🇹🇷</span>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Hazırlanıyor...</h2>
      <p className="text-slate-500 max-w-xs">
        Yapay zeka <span className="font-semibold text-indigo-600">"{displayTopic}"</span> için en önemli kelimeleri seçiyor.
      </p>
    </div>
  );
};

export default Loader;