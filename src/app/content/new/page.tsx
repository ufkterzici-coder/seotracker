'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Badge from '@/components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import SEOAnalysisPanel from '@/components/seo/SEOAnalysisPanel';

interface KeywordSuggestion {
  keyword: string;
  intent: string;
}

interface KeywordSuggestions {
  mainKeyword: string;
  relatedKeywords: KeywordSuggestion[];
  longTailKeywords: KeywordSuggestion[];
}

export default function NewContentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [suggestingKeywords, setSuggestingKeywords] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [mainKeywords, setMainKeywords] = useState<string[]>([]);
  const [secondaryKeywords, setSecondaryKeywords] = useState<string[]>([]);
  const [competitorUrls, setCompetitorUrls] = useState('');
  const [wordCount, setWordCount] = useState(1500);
  const [searchIntent, setSearchIntent] = useState('informational');

  // Keyword suggestions
  const [keywordSuggestions, setKeywordSuggestions] = useState<KeywordSuggestions | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Scraped content
  const [scrapedContent, setScrapedContent] = useState<any[]>([]);

  // Generated content
  const [generatedContent, setGeneratedContent] = useState<any>(null);

  // Debounced keyword fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      if (title.trim().length >= 5) {
        fetchKeywordSuggestions(title);
      } else {
        setKeywordSuggestions(null);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [title]);

  const fetchKeywordSuggestions = async (topic: string) => {
    setSuggestingKeywords(true);
    try {
      const response = await fetch('/api/generate/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });

      const data = await response.json();

      if (response.ok && data.keywords) {
        setKeywordSuggestions(data.keywords);
        setShowSuggestions(true);

        // Auto-fill main keyword if empty
        if (mainKeywords.length === 0 && data.keywords.mainKeyword) {
          setMainKeywords([data.keywords.mainKeyword]);
        }
      }
    } catch (err) {
      console.error('Keyword suggestion error:', err);
    } finally {
      setSuggestingKeywords(false);
    }
  };

  const toggleMainKeyword = (keyword: string, intent?: string) => {
    setMainKeywords((prev) => {
      if (prev.includes(keyword)) {
        return prev.filter((k) => k !== keyword);
      }
      if (prev.length >= 3) {
        return prev; // Max 3 main keywords
      }
      return [...prev, keyword];
    });
    if (intent) {
      setSearchIntent(intent);
    }
  };

  const removeMainKeyword = (keyword: string) => {
    setMainKeywords((prev) => prev.filter((k) => k !== keyword));
  };

  const selectKeyword = (keyword: string, intent?: string, asMain = true) => {
    if (asMain) {
      toggleMainKeyword(keyword, intent);
    }
    setShowSuggestions(false);
  };

  const toggleSecondaryKeyword = (keyword: string) => {
    setSecondaryKeywords((prev) =>
      prev.includes(keyword)
        ? prev.filter((k) => k !== keyword)
        : [...prev, keyword]
    );
  };

  const removeSecondaryKeyword = (keyword: string) => {
    setSecondaryKeywords((prev) => prev.filter((k) => k !== keyword));
  };

  const handleScrape = async () => {
    const urls = competitorUrls.split('\n').filter((url) => url.trim());

    setScraping(true);
    setError(null);

    try {
      if (urls.length > 0) {
        const response = await fetch('/api/scrape', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ urls }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Tarama hatası');
        }

        if (data.results) {
          setScrapedContent(data.results);
        }
      }
      setStep(2);
    } catch (err: any) {
      console.error('Scrape error:', err);
      setError(err.message || 'Sayfa tarama hatası');
    } finally {
      setScraping(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/generate/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: title,
          mainKeyword: mainKeywords[0] || '',
          secondaryKeywords: [...mainKeywords.slice(1), ...secondaryKeywords],
          competitorContents: scrapedContent.map((c) => c.content).filter(Boolean),
          wordCount,
          searchIntent,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'İçerik oluşturma hatası');
      }

      if (data.result) {
        setGeneratedContent(data.result);
        setStep(3);
      } else {
        throw new Error('İçerik oluşturulamadı. Lütfen tekrar deneyin.');
      }
    } catch (err: any) {
      console.error('Generate error:', err);
      setError(err.message || 'İçerik oluşturma hatası');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      const allKeywords = [
        ...(generatedContent?.lsiKeywords || []),
        ...secondaryKeywords,
      ].filter((v, i, a) => a.indexOf(v) === i); // Remove duplicates

      const response = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: generatedContent?.meta?.title || title,
          slug: generatedContent?.meta?.slug,
          meta_title: generatedContent?.meta?.title,
          meta_description: generatedContent?.meta?.description,
          content: generatedContent?.content,
          main_keyword: mainKeywords.join(', '),
          lsi_keywords: JSON.stringify(allKeywords),
          search_intent: searchIntent,
          headings: JSON.stringify(generatedContent?.headings || {}),
          word_count: generatedContent?.content?.split(/\s+/).length || 0,
          competitor_urls: JSON.stringify(competitorUrls.split('\n').filter(Boolean)),
          status: 'draft',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Kaydetme hatası');
      }

      if (data.content) {
        router.push(`/content/${data.content.id}`);
      }
    } catch (err: any) {
      console.error('Save error:', err);
      setError(err.message || 'İçerik kaydetme hatası');
    } finally {
      setLoading(false);
    }
  };

  const intentLabels: Record<string, string> = {
    informational: 'Bilgilendirici',
    transactional: 'İşlemsel',
    commercial: 'Ticari',
    navigational: 'Navigasyonel',
  };

  const intentColors: Record<string, string> = {
    informational: 'bg-blue-500/20 text-blue-400',
    transactional: 'bg-green-500/20 text-green-400',
    commercial: 'bg-purple-500/20 text-purple-400',
    navigational: 'bg-orange-500/20 text-orange-400',
  };

  return (
    <DashboardLayout>
      <Header
        title="Yeni İçerik"
        subtitle="AI destekli SEO içerik oluşturucu"
      />

      <div className="p-6">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${
                  step >= s
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={`w-20 h-1 mx-2 rounded-full transition-colors ${
                    step > s ? 'bg-emerald-600' : 'bg-slate-800'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Step 1: Input */}
          {step === 1 && (
            <Card title="Adım 1: İçerik Bilgileri" description="Hedef konu ve rakip URL'leri girin">
              <div className="space-y-6">
                <div>
                  <Input
                    label="Konu / Başlık"
                    placeholder="Örn: En İyi SEO Araçları 2024"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  {suggestingKeywords && (
                    <p className="text-sm text-slate-400 mt-2 flex items-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Anahtar kelimeler öneriliyor...
                    </p>
                  )}
                </div>

                {/* Selected Main Keywords Display */}
                {mainKeywords.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Seçili Ana Anahtar Kelimeler ({mainKeywords.length}/3)
                    </label>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {mainKeywords.map((kw, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium"
                        >
                          {idx === 0 && <span className="text-xs bg-blue-500/30 px-1 rounded mr-1">Ana</span>}
                          {kw}
                          <button
                            onClick={() => removeMainKeyword(kw)}
                            className="hover:text-blue-300 ml-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="relative">
                  <Input
                    label={`Ana Anahtar Kelimeler (${mainKeywords.length}/3 seçili)`}
                    placeholder="Örn: seo araçları (max 3 adet seçebilirsiniz)"
                    onFocus={() => keywordSuggestions && setShowSuggestions(true)}
                    readOnly
                  />

                  {/* Keyword Suggestions Dropdown */}
                  {showSuggestions && keywordSuggestions && (
                    <div className="absolute z-10 w-full mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-96 overflow-y-auto">
                      <div className="p-3 border-b border-slate-700">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-300">Önerilen Anahtar Kelimeler</span>
                          <button
                            onClick={() => setShowSuggestions(false)}
                            className="text-slate-500 hover:text-slate-300"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Tıklayarak ana kelime seçin, checkbox ile ikincil kelime ekleyin</p>
                      </div>

                      {/* Main Keyword */}
                      <div className="p-2">
                        <p className="text-xs text-slate-500 uppercase tracking-wider px-2 mb-1">Önerilen Ana Kelime (max 3 seçebilirsiniz)</p>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors">
                          <input
                            type="checkbox"
                            checked={mainKeywords.includes(keywordSuggestions.mainKeyword)}
                            onChange={() => toggleMainKeyword(keywordSuggestions.mainKeyword)}
                            disabled={!mainKeywords.includes(keywordSuggestions.mainKeyword) && mainKeywords.length >= 3}
                            className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
                          />
                          <span className="text-white font-medium flex-1">{keywordSuggestions.mainKeyword}</span>
                          <Badge size="sm" className="bg-emerald-500/20 text-emerald-400">Önerilen</Badge>
                        </div>
                      </div>

                      {/* Related Keywords */}
                      {keywordSuggestions.relatedKeywords?.length > 0 && (
                        <div className="p-2 border-t border-slate-700">
                          <p className="text-xs text-slate-500 uppercase tracking-wider px-2 mb-1">İlişkili Kelimeler (Ana veya İkincil olarak seçin)</p>
                          {keywordSuggestions.relatedKeywords.map((kw, idx) => (
                            <div key={idx} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors">
                              <input
                                type="checkbox"
                                checked={mainKeywords.includes(kw.keyword)}
                                onChange={() => toggleMainKeyword(kw.keyword, kw.intent)}
                                disabled={!mainKeywords.includes(kw.keyword) && mainKeywords.length >= 3}
                                className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
                                title="Ana kelime olarak ekle"
                              />
                              <input
                                type="checkbox"
                                checked={secondaryKeywords.includes(kw.keyword)}
                                onChange={() => toggleSecondaryKeyword(kw.keyword)}
                                className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-emerald-500"
                                title="İkincil kelime olarak ekle"
                              />
                              <span className="text-slate-300 flex-1">{kw.keyword}</span>
                              <span className={`text-xs px-2 py-0.5 rounded ${intentColors[kw.intent] || 'bg-slate-600 text-slate-300'}`}>
                                {intentLabels[kw.intent] || kw.intent}
                              </span>
                            </div>
                          ))}
                          <p className="text-xs text-slate-600 px-2 mt-1">Mavi = Ana, Yeşil = İkincil</p>
                        </div>
                      )}

                      {/* Long-tail Keywords */}
                      {keywordSuggestions.longTailKeywords?.length > 0 && (
                        <div className="p-2 border-t border-slate-700">
                          <p className="text-xs text-slate-500 uppercase tracking-wider px-2 mb-1">Uzun Kuyruk Kelimeler</p>
                          {keywordSuggestions.longTailKeywords.map((kw, idx) => (
                            <div key={idx} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors">
                              <input
                                type="checkbox"
                                checked={mainKeywords.includes(kw.keyword)}
                                onChange={() => toggleMainKeyword(kw.keyword, kw.intent)}
                                disabled={!mainKeywords.includes(kw.keyword) && mainKeywords.length >= 3}
                                className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
                                title="Ana kelime olarak ekle"
                              />
                              <input
                                type="checkbox"
                                checked={secondaryKeywords.includes(kw.keyword)}
                                onChange={() => toggleSecondaryKeyword(kw.keyword)}
                                className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-emerald-500"
                                title="İkincil kelime olarak ekle"
                              />
                              <span className="text-slate-300 text-sm flex-1">{kw.keyword}</span>
                              <span className={`text-xs px-2 py-0.5 rounded ${intentColors[kw.intent] || 'bg-slate-600 text-slate-300'}`}>
                                {intentLabels[kw.intent] || kw.intent}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Selected Secondary Keywords */}
                {secondaryKeywords.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Seçili İkincil Anahtar Kelimeler ({secondaryKeywords.length})
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {secondaryKeywords.map((kw, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm"
                        >
                          {kw}
                          <button
                            onClick={() => removeSecondaryKeyword(kw)}
                            className="hover:text-emerald-300"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <Textarea
                  label="Rakip URL'ler (Her satıra bir URL - opsiyonel)"
                  placeholder="https://example.com/article1&#10;https://example.com/article2"
                  value={competitorUrls}
                  onChange={(e) => setCompetitorUrls(e.target.value)}
                  rows={4}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Hedef Kelime Sayısı"
                    type="number"
                    value={wordCount}
                    onChange={(e) => setWordCount(parseInt(e.target.value) || 1500)}
                  />

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                      Arama Niyeti
                    </label>
                    <select
                      value={searchIntent}
                      onChange={(e) => setSearchIntent(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="informational">Bilgilendirici</option>
                      <option value="transactional">İşlemsel</option>
                      <option value="commercial">Ticari Araştırma</option>
                      <option value="navigational">Navigasyonel</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    onClick={handleScrape}
                    loading={scraping}
                    disabled={!title || mainKeywords.length === 0}
                  >
                    {competitorUrls.trim() ? 'Rakipleri Tara ve Devam Et' : 'Devam Et'}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Step 2: Scraped Content Review */}
          {step === 2 && (
            <Card title="Adım 2: Rakip Analizi" description="Taranan içerikleri inceleyin">
              <div className="space-y-4">
                {scrapedContent.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">
                    Rakip URL girilmedi. İçerik üretimine devam edebilirsiniz.
                  </p>
                ) : (
                  scrapedContent.map((content, index) => (
                    <div key={index} className="p-4 bg-slate-800/50 rounded-lg">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-medium text-white">{content.title || 'Başlık bulunamadı'}</h3>
                          <p className="text-sm text-slate-400 truncate mt-1">{content.url}</p>
                        </div>
                        <Badge>{content.wordCount || 0} kelime</Badge>
                      </div>
                      {content.content && (
                        <p className="text-sm text-slate-400 mt-3 line-clamp-3">
                          {content.content.substring(0, 300)}...
                        </p>
                      )}
                    </div>
                  ))
                )}

                <div className="flex justify-between gap-3 pt-4">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Geri
                  </Button>
                  <Button onClick={handleGenerate} loading={generating}>
                    {generating ? 'İçerik Oluşturuluyor...' : 'İçerik Oluştur'}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Step 3: Generated Content */}
          {step === 3 && generatedContent && (
            <Card title="Adım 3: Oluşturulan İçerik" description="İçeriği inceleyin ve kaydedin">
              <Tabs defaultValue="preview">
                <TabsList>
                  <TabsTrigger value="preview">Önizleme</TabsTrigger>
                  <TabsTrigger value="content">Kaynak Kod</TabsTrigger>
                  <TabsTrigger value="meta">Meta Bilgileri</TabsTrigger>
                  <TabsTrigger value="keywords">Anahtar Kelimeler</TabsTrigger>
                  <TabsTrigger value="seo">SEO Analizi</TabsTrigger>
                </TabsList>

                <TabsContent value="preview">
                  <div className="bg-white rounded-lg p-6 overflow-auto max-h-[600px]">
                    <article className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-a:text-blue-600 prose-strong:text-slate-900 prose-li:text-slate-700">
                      <h1 className="text-2xl font-bold text-slate-900 mb-4 border-b pb-2">
                        {generatedContent.headings?.h1 || generatedContent.meta?.title || title}
                      </h1>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: (generatedContent.content || generatedContent.raw || '')
                            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                            .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/\*(.*?)\*/g, '<em>$1</em>')
                            .replace(/^\* (.*$)/gim, '<li>$1</li>')
                            .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
                            .replace(/\n\n/g, '</p><p>')
                            .replace(/\n/g, '<br>')
                        }}
                      />
                    </article>
                  </div>
                  <div className="mt-4 p-3 bg-slate-800/50 rounded-lg flex items-center justify-between">
                    <span className="text-sm text-slate-400">
                      Bu önizleme, içeriğin yayınlandığında nasıl görüneceğini gösterir
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedContent.content || generatedContent.raw || '');
                      }}
                    >
                      İçeriği Kopyala
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="content">
                  <div className="prose prose-invert max-w-none">
                    <div className="p-4 bg-slate-800/50 rounded-lg">
                      <h1 className="text-xl font-bold text-white mb-4">
                        {generatedContent.headings?.h1 || generatedContent.meta?.title || title}
                      </h1>
                      <pre className="text-slate-300 whitespace-pre-wrap text-sm font-mono overflow-auto max-h-[500px]">
                        {generatedContent.content || generatedContent.raw || 'İçerik oluşturuldu'}
                      </pre>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="meta">
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-800/50 rounded-lg">
                      <label className="text-sm text-slate-400">Meta Başlık</label>
                      <p className="text-white mt-1">{generatedContent.meta?.title || '-'}</p>
                    </div>
                    <div className="p-4 bg-slate-800/50 rounded-lg">
                      <label className="text-sm text-slate-400">Meta Açıklama</label>
                      <p className="text-white mt-1">{generatedContent.meta?.description || '-'}</p>
                    </div>
                    <div className="p-4 bg-slate-800/50 rounded-lg">
                      <label className="text-sm text-slate-400">URL Slug</label>
                      <p className="text-white mt-1">{generatedContent.meta?.slug || '-'}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="keywords">
                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <label className="text-sm text-slate-400 block mb-2">LSI Anahtar Kelimeler</label>
                    <div className="flex flex-wrap gap-2">
                      {generatedContent.lsiKeywords?.length > 0 ? (
                        generatedContent.lsiKeywords.map((keyword: string, index: number) => (
                          <Badge key={index}>{keyword}</Badge>
                        ))
                      ) : (
                        <span className="text-slate-500">Anahtar kelime bulunamadı</span>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="seo">
                  <SEOAnalysisPanel
                    title={generatedContent.meta?.title || title}
                    content={generatedContent.content || generatedContent.raw || ''}
                    mainKeyword={mainKeywords[0] || ''}
                    metaTitle={generatedContent.meta?.title}
                    metaDescription={generatedContent.meta?.description}
                    slug={generatedContent.meta?.slug}
                    autoAnalyze={true}
                    onContentFixed={(fixedContent) => {
                      setGeneratedContent((prev: any) => ({
                        ...prev,
                        content: fixedContent.content,
                        meta: fixedContent.meta,
                      }));
                    }}
                  />
                </TabsContent>
              </Tabs>

              <div className="flex justify-between gap-3 mt-6 pt-4 border-t border-slate-800">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Geri
                </Button>
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={handleGenerate} loading={generating}>
                    Yeniden Oluştur
                  </Button>
                  <Button onClick={handleSave} loading={loading}>
                    Kaydet
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
