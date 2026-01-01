'use client';

import React, { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';

interface FAQItem {
  question: string;
  answer: string;
}

interface HowToStep {
  name: string;
  text: string;
}

interface SchemaMarkupPanelProps {
  title: string;
  description?: string;
  content: string;
  author?: string;
  datePublished?: string;
  dateModified?: string;
  imageUrl?: string;
  url?: string;
  keywords?: string[];
}

export default function SchemaMarkupPanel({
  title,
  description,
  content,
  author,
  datePublished,
  dateModified,
  imageUrl,
  url,
  keywords,
}: SchemaMarkupPanelProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<'article' | 'faq' | 'howto' | 'combined'>('article');
  const [generatedSchema, setGeneratedSchema] = useState<string | null>(null);
  const [scriptTag, setScriptTag] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [faqItems, setFaqItems] = useState<FAQItem[]>([{ question: '', answer: '' }]);
  const [howToSteps, setHowToSteps] = useState<HowToStep[]>([{ name: 'Adım 1', text: '' }]);

  const generateSchema = async () => {
    setLoading(true);
    setError(null);

    try {
      const body: any = {
        type: activeType,
        title,
        description: description || '',
        content,
        author,
        datePublished,
        dateModified,
        imageUrl,
        url,
        keywords,
        autoExtract: true,
      };

      if (activeType === 'faq') {
        body.faqItems = faqItems.filter((item) => item.question && item.answer);
      }

      if (activeType === 'howto') {
        body.howToSteps = howToSteps.filter((step) => step.text);
      }

      const response = await fetch('/api/generate/schema', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        if (data.extractedData?.faqItems) {
          setFaqItems(data.extractedData.faqItems);
        }
        if (data.extractedData?.howToSteps) {
          setHowToSteps(data.extractedData.howToSteps);
        }
      } else {
        setGeneratedSchema(JSON.stringify(data.schema, null, 2));
        setScriptTag(data.scriptTag);

        if (data.extractedData?.faqItems && data.extractedData.faqItems.length > 0) {
          setFaqItems(data.extractedData.faqItems);
        }
        if (data.extractedData?.howToSteps && data.extractedData.howToSteps.length > 0) {
          setHowToSteps(data.extractedData.howToSteps);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Schema oluşturma hatası');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const addFaqItem = () => {
    setFaqItems([...faqItems, { question: '', answer: '' }]);
  };

  const removeFaqItem = (index: number) => {
    setFaqItems(faqItems.filter((_, i) => i !== index));
  };

  const updateFaqItem = (index: number, field: 'question' | 'answer', value: string) => {
    const updated = [...faqItems];
    updated[index][field] = value;
    setFaqItems(updated);
  };

  const addHowToStep = () => {
    setHowToSteps([...howToSteps, { name: 'Adım ' + (howToSteps.length + 1), text: '' }]);
  };

  const removeHowToStep = (index: number) => {
    setHowToSteps(howToSteps.filter((_, i) => i !== index));
  };

  const updateHowToStep = (index: number, field: 'name' | 'text', value: string) => {
    const updated = [...howToSteps];
    updated[index][field] = value;
    setHowToSteps(updated);
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-white">Schema Markup Oluşturucu</h3>
            <p className="text-sm text-slate-400">JSON-LD yapılandırılmış veri oluşturun</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          {[
            { id: 'article', label: 'Article', icon: '📄' },
            { id: 'faq', label: 'FAQ', icon: '❓' },
            { id: 'howto', label: 'HowTo', icon: '📝' },
            { id: 'combined', label: 'Kombine', icon: '🔗' },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => {
                setActiveType(type.id as any);
                setGeneratedSchema(null);
              }}
              className={'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ' +
                (activeType === type.id
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700')
              }
            >
              <span>{type.icon}</span>
              <span>{type.label}</span>
            </button>
          ))}
        </div>

        {activeType === 'faq' && (
          <div className="mb-6 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-slate-300">Soru-Cevap Çiftleri</h4>
              <Button variant="outline" size="sm" onClick={addFaqItem}>
                + Soru Ekle
              </Button>
            </div>
            {faqItems.map((item, index) => (
              <div key={index} className="p-4 bg-slate-800/50 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <Badge size="sm">Soru {index + 1}</Badge>
                  {faqItems.length > 1 && (
                    <button
                      onClick={() => removeFaqItem(index)}
                      className="text-slate-500 hover:text-red-400"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                <Input
                  placeholder="Soru..."
                  value={item.question}
                  onChange={(e) => updateFaqItem(index, 'question', e.target.value)}
                />
                <Textarea
                  placeholder="Cevap..."
                  value={item.answer}
                  onChange={(e) => updateFaqItem(index, 'answer', e.target.value)}
                  rows={2}
                />
              </div>
            ))}
          </div>
        )}

        {activeType === 'howto' && (
          <div className="mb-6 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-slate-300">Adımlar</h4>
              <Button variant="outline" size="sm" onClick={addHowToStep}>
                + Adım Ekle
              </Button>
            </div>
            {howToSteps.map((step, index) => (
              <div key={index} className="p-4 bg-slate-800/50 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <Badge size="sm" variant="success">Adım {index + 1}</Badge>
                  {howToSteps.length > 1 && (
                    <button
                      onClick={() => removeHowToStep(index)}
                      className="text-slate-500 hover:text-red-400"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                <Input
                  placeholder="Adım başlığı..."
                  value={step.name}
                  onChange={(e) => updateHowToStep(index, 'name', e.target.value)}
                />
                <Textarea
                  placeholder="Adım açıklaması..."
                  value={step.text}
                  onChange={(e) => updateHowToStep(index, 'text', e.target.value)}
                  rows={2}
                />
              </div>
            ))}
          </div>
        )}

        {activeType === 'combined' && (
          <div className="mb-6 p-4 bg-slate-800/50 rounded-lg">
            <p className="text-sm text-slate-400">
              Kombine mod, içeriğinizi analiz ederek Article, FAQ ve HowTo schemalarını
              otomatik olarak birleştirir. İçerikte soru-cevap formatı veya numaralı
              adımlar varsa bunlar otomatik olarak tespit edilir.
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <Button onClick={generateSchema} loading={loading} className="w-full">
          {loading ? 'Oluşturuluyor...' : 'Schema Oluştur'}
        </Button>
      </Card>

      {generatedSchema && (
        <Card title="Oluşturulan Schema">
          <Tabs defaultValue="json">
            <TabsList>
              <TabsTrigger value="json">JSON-LD</TabsTrigger>
              <TabsTrigger value="script">Script Tag</TabsTrigger>
            </TabsList>

            <TabsContent value="json">
              <div className="relative">
                <pre className="p-4 bg-slate-900 rounded-lg text-sm text-slate-300 overflow-x-auto max-h-96">
                  {generatedSchema}
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(generatedSchema)}
                >
                  {copied ? 'Kopyalandı!' : 'Kopyala'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="script">
              <div className="relative">
                <pre className="p-4 bg-slate-900 rounded-lg text-sm text-slate-300 overflow-x-auto max-h-96">
                  {scriptTag}
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(scriptTag || '')}
                >
                  {copied ? 'Kopyalandı!' : 'Kopyala'}
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <h4 className="text-sm font-medium text-blue-400 mb-2">Kullanım</h4>
            <p className="text-sm text-slate-400">
              Bu script etiketini sayfanızın {'<head>'} veya {'<body>'} bölümüne ekleyin.
              Google ve diğer arama motorları bu yapılandırılmış veriyi zengin sonuçlar için kullanacaktır.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
