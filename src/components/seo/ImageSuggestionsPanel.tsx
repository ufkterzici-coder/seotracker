'use client';

import React, { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

interface ImageSuggestion {
  type: string;
  title: string;
  description: string;
  prompt: string;
  altText: string;
  placement: string;
  keywords: string[];
}

interface StockKeywords {
  primary: string[];
  secondary: string[];
  styles: string[];
}

interface ImageSuggestionsPanelProps {
  title: string;
  content: string;
  mainKeyword?: string;
}

export default function ImageSuggestionsPanel({
  title,
  content,
  mainKeyword,
}: ImageSuggestionsPanelProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<ImageSuggestion[]>([]);
  const [stockKeywords, setStockKeywords] = useState<StockKeywords | null>(null);
  const [activeTab, setActiveTab] = useState<'ai' | 'stock'>('ai');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generateSuggestions = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          mainKeyword,
          count: 5,
          type: 'suggestions',
        }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setSuggestions(data.suggestions || []);
      }
    } catch (err: any) {
      setError(err.message || 'Görsel öneri hatası');
    } finally {
      setLoading(false);
    }
  };

  const generateStockKeywords = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          mainKeyword,
          type: 'stock-keywords',
        }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setStockKeywords(data.keywords || null);
      }
    } catch (err: any) {
      setError(err.message || 'Anahtar kelime önerisi hatası');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const typeLabels: Record<string, { label: string; color: string }> = {
    hero: { label: 'Hero', color: 'bg-purple-500/20 text-purple-400' },
    infographic: { label: 'Infografik', color: 'bg-blue-500/20 text-blue-400' },
    diagram: { label: 'Diyagram', color: 'bg-green-500/20 text-green-400' },
    illustration: { label: 'Ilustrasyon', color: 'bg-orange-500/20 text-orange-400' },
    photo: { label: 'Fotoğraf', color: 'bg-pink-500/20 text-pink-400' },
  };

  const placementLabels: Record<string, string> = {
    hero: 'Ana Görsel',
    'in-content': 'İçerik İçi',
    sidebar: 'Kenar Çubuğu',
    footer: 'Alt Kısım',
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-white">Görsel Önerileri</h3>
            <p className="text-sm text-slate-400">AI destekli görsel önerileri alın</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('ai')}
            className={'px-4 py-2 rounded-lg transition-colors ' +
              (activeTab === 'ai'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700')
            }
          >
            AI Görsel Prompt
          </button>
          <button
            onClick={() => setActiveTab('stock')}
            className={'px-4 py-2 rounded-lg transition-colors ' +
              (activeTab === 'stock'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700')
            }
          >
            Stok Fotoğraf
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {activeTab === 'ai' && (
          <>
            {suggestions.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
                  <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-slate-400 mb-4">
                  İçeriğiniz için AI görsel prompt önerileri alın
                </p>
                <Button onClick={generateSuggestions} loading={loading}>
                  {loading ? 'Oluşturuluyor...' : 'Öneri Al'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" onClick={generateSuggestions} loading={loading}>
                    Yenile
                  </Button>
                </div>

                {suggestions.map((suggestion, index) => (
                  <div key={index} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <span className={'text-xs px-2 py-1 rounded ' + (typeLabels[suggestion.type]?.color || 'bg-slate-600 text-slate-300')}>
                          {typeLabels[suggestion.type]?.label || suggestion.type}
                        </span>
                        <Badge size="sm" variant="default">
                          {placementLabels[suggestion.placement] || suggestion.placement}
                        </Badge>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(suggestion.prompt, index)}
                      >
                        {copiedIndex === index ? 'Kopyalandı!' : 'Prompt Kopyala'}
                      </Button>
                    </div>

                    <h4 className="text-white font-medium mb-2">{suggestion.title}</h4>
                    <p className="text-sm text-slate-400 mb-3">{suggestion.description}</p>

                    <div className="p-3 bg-slate-900 rounded text-sm text-slate-300 mb-3 font-mono">
                      {suggestion.prompt}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="text-xs text-slate-500">Alt Text:</span>
                      <span className="text-xs text-emerald-400">{suggestion.altText}</span>
                    </div>

                    {suggestion.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {suggestion.keywords.map((kw, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 bg-slate-700 text-slate-300 rounded">
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'stock' && (
          <>
            {!stockKeywords ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
                  <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-slate-400 mb-4">
                  Stok fotoğraf sitelerinde kullanabileceğiniz arama kelimeleri alın
                </p>
                <Button onClick={generateStockKeywords} loading={loading}>
                  {loading ? 'Oluşturuluyor...' : 'Anahtar Kelime Al'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" onClick={generateStockKeywords} loading={loading}>
                    Yenile
                  </Button>
                </div>

                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <h4 className="text-sm font-medium text-slate-300 mb-3">Ana Arama Kelimeleri</h4>
                  <div className="flex flex-wrap gap-2">
                    {stockKeywords.primary.map((kw, i) => (
                      <button
                        key={i}
                        onClick={() => copyToClipboard(kw, i)}
                        className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm hover:bg-emerald-500/30 transition-colors"
                      >
                        {kw}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <h4 className="text-sm font-medium text-slate-300 mb-3">İkincil Arama Kelimeleri</h4>
                  <div className="flex flex-wrap gap-2">
                    {stockKeywords.secondary.map((kw, i) => (
                      <button
                        key={i}
                        onClick={() => copyToClipboard(kw, 100 + i)}
                        className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30 transition-colors"
                      >
                        {kw}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <h4 className="text-sm font-medium text-slate-300 mb-3">Stil Filtreleri</h4>
                  <div className="flex flex-wrap gap-2">
                    {stockKeywords.styles.map((style, i) => (
                      <span key={i} className="px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg text-sm">
                        {style}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-sm text-slate-400">
                    Bu anahtar kelimeleri Unsplash, Pexels, Shutterstock gibi sitelerde kullanabilirsiniz.
                    Kelimeye tıklayarak kopyalayabilirsiniz.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
