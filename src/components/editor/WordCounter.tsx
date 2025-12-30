'use client';

import React from 'react';

interface WordCounterProps {
  content: string;
  target?: number;
}

export default function WordCounter({ content, target = 1500 }: WordCounterProps) {
  const text = content.replace(/<[^>]*>/g, ' ').trim();
  const words = text.split(/\s+/).filter((w) => w.length > 0).length;
  const characters = text.length;
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
  const paragraphs = content.split(/<\/p>|<br\s*\/?>/i).filter((p) => p.trim().length > 0).length;
  const readingTime = Math.ceil(words / 200); // 200 words per minute

  const progress = Math.min(100, (words / target) * 100);

  const getProgressColor = () => {
    if (progress < 50) return 'bg-red-500';
    if (progress < 80) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="p-4 bg-slate-800/50 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-slate-400">Kelime Sayısı</span>
        <span className="text-lg font-semibold text-white">
          {words} / {target}
        </span>
      </div>

      <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-4">
        <div
          className={`h-full rounded-full transition-all duration-300 ${getProgressColor()}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-400">Karakter</span>
          <span className="text-slate-300">{characters}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Cümle</span>
          <span className="text-slate-300">{sentences}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Paragraf</span>
          <span className="text-slate-300">{paragraphs}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Okuma Süresi</span>
          <span className="text-slate-300">{readingTime} dk</span>
        </div>
      </div>
    </div>
  );
}
