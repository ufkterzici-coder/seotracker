'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Badge from '@/components/ui/Badge';
import Progress from '@/components/ui/Progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';

export default function AnalyzePage() {
  const [url, setUrl] = useState('');
  const [content, setContent] = useState('');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);

  const [scrapedData, setScrapedData] = useState<any>(null);
  const [keywordAnalysis, setKeywordAnalysis] = useState<any>(null);
  const [readabilityAnalysis, setReadabilityAnalysis] = useState<any>(null);
  const [intentAnalysis, setIntentAnalysis] = useState<any>(null);

  const handleScrapeAndAnalyze = async () => {
    if (!url) return;

    setLoading(true);
    try {
      // Scrape the URL
      const scrapeRes = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: [url] }),
      });
      const scrapeData = await scrapeRes.json();

      if (scrapeData.results && scrapeData.results[0]) {
        setScrapedData(scrapeData.results[0]);
        setContent(scrapeData.results[0].content);

        // Analyze if keyword is provided
        if (keyword) {
          await analyzeContent(scrapeData.results[0].content);
        }
      }
    } catch (error) {
      console.error('Scrape error:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeContent = async (textContent: string) => {
    const contentToAnalyze = textContent || content;
    if (!contentToAnalyze) return;

    setLoading(true);
    try {
      // Keyword analysis
      if (keyword) {
        const kwRes = await fetch('/api/analyze/keywords', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: contentToAnalyze, mainKeyword: keyword }),
        });
        const kwData = await kwRes.json();
        setKeywordAnalysis(kwData.analysis);
      }

      // Readability analysis
      const readRes = await fetch('/api/analyze/readability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: contentToAnalyze }),
      });
      const readData = await readRes.json();
      setReadabilityAnalysis(readData);

      // Intent analysis
      if (keyword) {
        const intentRes = await fetch('/api/analyze/intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ keyword, content: contentToAnalyze }),
        });
        const intentData = await intentRes.json();
        setIntentAnalysis(intentData);
      }
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIntentColor = (intent: string) => {
    const colors: Record<string, string> = {
      informational: 'info',
      transactional: 'success',
      commercial: 'warning',
      navigational: 'default',
    };
    return colors[intent] || 'default';
  };

  return (
    <DashboardLayout>
      <Header
        title="Rakip Analizi"
        subtitle="URL veya metin içeriği analiz edin"
      />

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Panel */}
          <div className="space-y-6">
            <Card title="Analiz Girişi">
              <div className="space-y-4">
                <Input
                  label="URL (Opsiyonel)"
                  placeholder="https://example.com/article"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />

                <div className="flex items-center gap-4 text-slate-400">
                  <div className="flex-1 h-px bg-slate-700" />
                  <span className="text-sm">veya</span>
                  <div className="flex-1 h-px bg-slate-700" />
                </div>

                <Textarea
                  label="Metin İçerik"
                  placeholder="Analiz edilecek metni yapıştırın..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                />

                <Input
                  label="Anahtar Kelime"
                  placeholder="Ana anahtar kelime"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />

                <div className="flex gap-3">
                  {url && (
                    <Button
                      onClick={handleScrapeAndAnalyze}
                      loading={loading}
                      className="flex-1"
                    >
                      URL Tara ve Analiz Et
                    </Button>
                  )}
                  {content && (
                    <Button
                      onClick={() => analyzeContent(content)}
                      loading={loading}
                      variant={url ? 'secondary' : 'primary'}
                      className="flex-1"
                    >
                      Metni Analiz Et
                    </Button>
                  )}
                </div>
              </div>
            </Card>

            {/* Scraped Info */}
            {scrapedData && (
              <Card title="Taranan Sayfa">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-slate-400">Başlık</label>
                    <p className="text-white mt-1">{scrapedData.title}</p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Kelime Sayısı</label>
                    <p className="text-white mt-1">{scrapedData.wordCount}</p>
                  </div>
                  {scrapedData.headings?.length > 0 && (
                    <div>
                      <label className="text-sm text-slate-400 block mb-2">Başlıklar</label>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {scrapedData.headings.map((h: any, i: number) => (
                          <div key={i} className="text-sm" style={{ paddingLeft: (h.level - 1) * 12 }}>
                            <span className="text-slate-500">H{h.level}:</span>{' '}
                            <span className="text-slate-300">{h.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="keywords">
              <TabsList>
                <TabsTrigger value="keywords">Anahtar Kelimeler</TabsTrigger>
                <TabsTrigger value="readability">Okunabilirlik</TabsTrigger>
                <TabsTrigger value="intent">Arama Niyeti</TabsTrigger>
              </TabsList>

              <TabsContent value="keywords">
                {keywordAnalysis ? (
                  <div className="space-y-6">
                    <Card>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-3xl font-bold text-white">
                            {keywordAnalysis.occurrences}
                          </p>
                          <p className="text-sm text-slate-400">Kullanım</p>
                        </div>
                        <div>
                          <p className="text-3xl font-bold text-white">
                            %{keywordAnalysis.density}
                          </p>
                          <p className="text-sm text-slate-400">Yoğunluk</p>
                        </div>
                        <div>
                          <p className="text-3xl font-bold text-white">
                            {keywordAnalysis.prominence?.score || 0}
                          </p>
                          <p className="text-sm text-slate-400">Önem Skoru</p>
                        </div>
                      </div>
                    </Card>

                    {keywordAnalysis.suggestions?.length > 0 && (
                      <Card title="Öneriler">
                        <ul className="space-y-2">
                          {keywordAnalysis.suggestions.map((s: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-slate-300">
                              <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              {s}
                            </li>
                          ))}
                        </ul>
                      </Card>
                    )}

                    {keywordAnalysis.lsiKeywords?.length > 0 && (
                      <Card title="LSI Anahtar Kelimeler">
                        <div className="space-y-2">
                          {keywordAnalysis.lsiKeywords.slice(0, 10).map((kw: any, i: number) => (
                            <div key={i} className="flex items-center justify-between">
                              <span className="text-slate-300">{kw.word}</span>
                              <div className="flex items-center gap-3">
                                <span className="text-sm text-slate-500">{kw.count}x</span>
                                <div className="w-20">
                                  <Progress value={kw.relevance * 10} max={100} size="sm" />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}
                  </div>
                ) : (
                  <Card>
                    <div className="py-12 text-center text-slate-400">
                      Anahtar kelime analizi için URL tarayın veya metin girin
                    </div>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="readability">
                {readabilityAnalysis?.readability ? (
                  <div className="space-y-6">
                    <Card>
                      <div className="flex items-center justify-center py-6">
                        <div className="text-center">
                          <p className="text-6xl font-bold text-white">
                            {readabilityAnalysis.readability.score}
                          </p>
                          <p className="text-lg text-slate-400 mt-2">
                            {readabilityAnalysis.readability.grade}
                          </p>
                        </div>
                      </div>
                    </Card>

                    <Card title="İstatistikler">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-800/50 rounded-lg text-center">
                          <p className="text-2xl font-bold text-white">
                            {readabilityAnalysis.readability.stats.sentences}
                          </p>
                          <p className="text-sm text-slate-400">Cümle</p>
                        </div>
                        <div className="p-4 bg-slate-800/50 rounded-lg text-center">
                          <p className="text-2xl font-bold text-white">
                            {readabilityAnalysis.readability.stats.words}
                          </p>
                          <p className="text-sm text-slate-400">Kelime</p>
                        </div>
                        <div className="p-4 bg-slate-800/50 rounded-lg text-center">
                          <p className="text-2xl font-bold text-white">
                            {readabilityAnalysis.readability.stats.avgWordsPerSentence}
                          </p>
                          <p className="text-sm text-slate-400">Ort. Cümle Uzunluğu</p>
                        </div>
                        <div className="p-4 bg-slate-800/50 rounded-lg text-center">
                          <p className="text-2xl font-bold text-white">
                            {readabilityAnalysis.readability.stats.avgSyllablesPerWord}
                          </p>
                          <p className="text-sm text-slate-400">Ort. Hece/Kelime</p>
                        </div>
                      </div>
                    </Card>

                    {readabilityAnalysis.readability.suggestions?.length > 0 && (
                      <Card title="İyileştirme Önerileri">
                        <ul className="space-y-2">
                          {readabilityAnalysis.readability.suggestions.map((s: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-slate-300">
                              <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {s}
                            </li>
                          ))}
                        </ul>
                      </Card>
                    )}
                  </div>
                ) : (
                  <Card>
                    <div className="py-12 text-center text-slate-400">
                      Okunabilirlik analizi için URL tarayın veya metin girin
                    </div>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="intent">
                {intentAnalysis ? (
                  <div className="space-y-6">
                    <Card>
                      <div className="flex items-center justify-center py-6">
                        <div className="text-center">
                          <Badge
                            variant={getIntentColor(intentAnalysis.intent) as any}
                            className="text-lg px-4 py-2"
                          >
                            {intentAnalysis.intent === 'informational' && 'Bilgilendirici'}
                            {intentAnalysis.intent === 'transactional' && 'İşlemsel'}
                            {intentAnalysis.intent === 'commercial' && 'Ticari Araştırma'}
                            {intentAnalysis.intent === 'navigational' && 'Navigasyonel'}
                          </Badge>
                          <p className="text-slate-400 mt-3">
                            %{intentAnalysis.confidence} güven
                          </p>
                        </div>
                      </div>
                    </Card>

                    {intentAnalysis.contentRecommendations?.length > 0 && (
                      <Card title="İçerik Önerileri">
                        <ul className="space-y-2">
                          {intentAnalysis.contentRecommendations.map((r: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-slate-300">
                              <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                              {r}
                            </li>
                          ))}
                        </ul>
                      </Card>
                    )}

                    {intentAnalysis.contentSuggestions?.length > 0 && (
                      <Card title="Önerilen İçerik Tipleri">
                        <div className="flex flex-wrap gap-2">
                          {intentAnalysis.contentSuggestions.map((s: string, i: number) => (
                            <Badge key={i} variant="default">{s}</Badge>
                          ))}
                        </div>
                      </Card>
                    )}
                  </div>
                ) : (
                  <Card>
                    <div className="py-12 text-center text-slate-400">
                      Arama niyeti analizi için anahtar kelime girin
                    </div>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
