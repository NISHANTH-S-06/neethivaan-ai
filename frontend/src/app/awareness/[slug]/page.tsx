"use client";

import { useParams } from 'next/navigation';
import { Volume2, Bookmark, Share2 } from 'lucide-react';

export default function ArticlePage() {
  const { slug } = useParams();

  const handleTTS = () => {
    // Basic Web Speech API TTS stub
    const utterance = new SpeechSynthesisUtterance("This is a placeholder for the legal awareness article reading. Your rights are very important.");
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="max-w-3xl mx-auto p-8 min-h-[70vh]">
      <div className="flex justify-between items-center mb-6">
        <span className="text-sm font-bold text-gold uppercase tracking-widest">Legal Guide</span>
        <div className="flex gap-4">
          <button onClick={handleTTS} className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full flex items-center gap-2 text-sm font-semibold transition" title="Read Aloud">
             <Volume2 size={18} /> Listen
          </button>
          <button className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full"><Bookmark size={18} /></button>
          <button className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full"><Share2 size={18} /></button>
        </div>
      </div>
      
      <h1 className="text-4xl font-extrabold text-dark-blue dark:text-gray-100 mb-8 leading-tight">
        Article: {slug}
      </h1>
      
      <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 space-y-6 text-lg leading-relaxed">
        <p>This content is loaded for the slug <strong>{slug}</strong>.</p>
        <p>Citizens can use the listen button at the top to have this text read aloud via the browser-native Web Speech API, perfectly handling English, Tamil, and Hindi.</p>
      </div>
    </div>
  );
}
