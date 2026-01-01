'use client';

import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { CircularProgress } from '@/components/ui/Progress';

interface SEOIssue {
  type: 'error' | 'warning' | 'info';
  category: string;
  message: string;
  suggestion: string;
}

interface LSIKeyword {
  word: string;
  count: number;
  relevance: number;
}

interface AnalysisData {
  seoScore: {
    overall: number;
    label: string;
    breakdown: {
      keywordUsage: number;
      readability: number;
      headingStructure: number;
      contentLength: number;
      metaQuality: number;
    };
    issues: SEOIssue[];
  };
  keywords: {
    main: string;
    density: number;
    densityGrade: { grade: string; message: string };
    occurrences: number;
    prominence: { score: number; positions: { section: string; found: boolean }[] };
    lsiKeywords: LSIKeyword[];
    suggestions: string[];
  };
  readability: {
    score: number;
    grade: string;
    stats: {
      sentences: number;
      words: number;
      avgWordsPerSentence: number;
      avgSyllablesPerWord: number;
    };
    issues: string[];
    suggestions: string[];
  };
  structure: {
    headings: { level: number; text: string }[];
    headingCount: { h1: number; h2: number; h3: number; h4: number };
    hasBulletPoints: boolean;
    hasNumberedLists: boolean;
    paragraphCount: number;
    averageParagraphLength: number;
    suggestions: string[];
  };
  meta: {
    wordCount: number;
    readingTime: number;
    titleLength: number;
    metaTitleLength: number;
    metaDescriptionLength: number;
  };
}

interface SEOAnalysisPanelProps {
  title: string;
  content: string;
  mainKeyword: string;
  metaTitle?: string;
  metaDescription?: string;
  slug?: string;
  autoAnalyze?: boolean;
}

export default function SEOAnalysisPanel({
  title,
  content,
  mainKeyword,
  metaTitle,
  metaDescription,
  slug,
  autoAnalyze = false,
}: SEOAnalysisPanelProps) {
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'keywords' | 'readability' | 'issues'>('overview');

  const runAnalysis = async () => {
    if (!content || content.length < 50) {
      setError('İçerik en az 50 karakter olmalı');
      return;
    }

    if (!mainKeyword || mainKeyword.length < 2) {
      setError('Ana anahtar kelime gerekli');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          mainKeyword,
          metaTitle,
          metaDescription,
          slug,
        }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setAnalysis(data.analysis);
      }
    } catch (err: any) {
      setError(err.message || 'Analiz sırasında hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoAnalyze && content && mainKeyword) {
      runAnalysis();
    }
  }, [autoAnalyze]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-lime-400';
    if (score >= 40) return 'text-yellow-400';
    if (score >= 20) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-emerald-500/20';
    if (score >= 60) return 'bg-lime-500/20';
    if (score >= 40) return 'bg-yellow-500/20';
    if (score >= 20) return 'bg-orange-500/20';
    return 'bg-red-500/20';
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  if (!analysis && !loading) {
    return (
      <Card>
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">SEO Analizi</h3>
          <p className="text-slate-400 mb-4">
            İçeriğinizi analiz ederek SEO önerileri alın
          </p>
          {error && (
            <p className="text-red-400 text-sm mb-4">{error}</p>
          )}
          <Button onClick={runAnalysis} disabled={loading}>
            {loading ? 'Analiz Ediliyor...' : 'Analiz Et'}
          </Button>
        </div>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <div className="text-center py-12">
          <div className="animate-spin w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-400">SEO analizi yapılıyor...</p>
        </div>
      </Card>
    );
  }

  if (!analysis) return null;

  return (
    <div className="space-y-4">
      {/* Score Overview */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <CircularProgress
              value={analysis.seoScore.overall}
              size={80}
              strokeWidth={6}
            />
            <div>
              <h3 className="text-xl font-bold text-white">
                {analysis.seoScore.label}
              </h3>
              <p className="text-slate-400 text-sm">
                SEO Skoru: {analysis.seoScore.overall}/100
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={runAnalysis}>
            Yeniden Analiz
          </Button>
        </div>

        {/* Score Breakdown */}
        <div className="grid grid-cols-5 gap-2">
          {[
            { key: 'keywordUsage', label: 'Anahtar Kelime', max: 25 },
            { key: 'readability', label: 'Okunabilirlik', max: 20 },
            { key: 'headingStructure', label: 'Başlıklar', max: 15 },
            { key: 'contentLength', label: 'Uzunluk', max: 20 },
            { key: 'metaQuality', label: 'Meta', max: 20 },
          ].map(({ key, label, max }) => {
            const value = analysis.seoScore.breakdown[key as keyof typeof analysis.seoScore.breakdown];
            const percent = (value / max) * 100;
            return (
              <div key={key} className="text-center">
                <div className={`text-lg font-bold ${getScoreColor(percent)}`}>
                  {value}/{max}
                </div>
                <div className="text-xs text-slate-500">{label}</div>
                <div className="mt-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${percent >= 70 ? 'bg-emerald-500' : percent >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800/50 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Genel' },
          { id: 'keywords', label: 'Anahtar Kelimeler' },
          { id: 'readability', label: 'Okunabilirlik' },
          { id: 'issues', label: `Sorunlar (${analysis.seoScore.issues.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 px-4 py-2 text-sm rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <Card title="İçerik Özeti">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-800/50 rounded-lg">
              <div className="text-2xl font-bold text-white">{analysis.meta.wordCount}</div>
              <div className="text-sm text-slate-400">Kelime Sayısı</div>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-lg">
              <div className="text-2xl font-bold text-white">{analysis.meta.readingTime} dk</div>
              <div className="text-sm text-slate-400">Okuma Süresi</div>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-lg">
              <div className="text-2xl font-bold text-white">{analysis.structure.paragraphCount}</div>
              <div className="text-sm text-slate-400">Paragraf</div>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-lg">
              <div className="text-2xl font-bold text-white">
                {analysis.structure.headingCount.h1 + analysis.structure.headingCount.h2 + analysis.structure.headingCount.h3}
              </div>
              <div className="text-sm text-slate-400">Başlık</div>
            </div>
          </div>

          {/* Heading Structure */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-slate-300 mb-3">Başlık Yapısı</h4>
            <div className="flex gap-4">
              {['h1', 'h2', 'h3', 'h4'].map((h) => {
                const count = analysis.structure.headingCount[h as keyof typeof analysis.structure.headingCount];
                return (
                  <div key={h} className="text-center">
                    <span className="inline-block px-3 py-1 bg-slate-700 rounded text-white font-mono text-sm">
                      {h.toUpperCase()}: {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Content Features */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-slate-300 mb-3">İçerik Özellikleri</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant={analysis.structure.hasBulletPoints ? 'success' : 'default'}>
                {analysis.structure.hasBulletPoints ? '✓' : '✗'} Madde İşaretleri
              </Badge>
              <Badge variant={analysis.structure.hasNumberedLists ? 'success' : 'default'}>
                {analysis.structure.hasNumberedLists ? '✓' : '✗'} Numaralı Liste
              </Badge>
              <Badge variant={analysis.meta.metaTitleLength > 0 ? 'success' : 'warning'}>
                {analysis.meta.metaTitleLength > 0 ? '✓' : '✗'} Meta Başlık
              </Badge>
              <Badge variant={analysis.meta.metaDescriptionLength > 0 ? 'success' : 'warning'}>
                {analysis.meta.metaDescriptionLength > 0 ? '✓' : '✗'} Meta Açıklama
              </Badge>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'keywords' && (
        <Card title="Anahtar Kelime Analizi">
          {/* Main Keyword */}
          <div className="p-4 bg-slate-800/50 rounded-lg mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">Ana Anahtar Kelime</span>
              <Badge variant="primary">{analysis.keywords.main}</Badge>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center">
                <div className={`text-xl font-bold ${
                  analysis.keywords.densityGrade.grade === 'excellent' ? 'text-emerald-400' :
                  analysis.keywords.densityGrade.grade === 'good' ? 'text-lime-400' :
                  analysis.keywords.densityGrade.grade === 'low' ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  %{analysis.keywords.density.toFixed(2)}
                </div>
                <div className="text-xs text-slate-500">Yoğunluk</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-white">{analysis.keywords.occurrences}</div>
                <div className="text-xs text-slate-500">Kullanım</div>
              </div>
              <div className="text-center">
                <div className={`text-xl font-bold ${getScoreColor(analysis.keywords.prominence.score)}`}>
                  %{analysis.keywords.prominence.score}
                </div>
                <div className="text-xs text-slate-500">Önem</div>
              </div>
            </div>
            <p className="text-sm text-slate-400 mt-3">{analysis.keywords.densityGrade.message}</p>
          </div>

          {/* Keyword Positions */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-slate-300 mb-2">Anahtar Kelime Konumu</h4>
            <div className="flex flex-wrap gap-2">
              {analysis.keywords.prominence.positions.map((pos, i) => (
                <Badge key={i} variant={pos.found ? 'success' : 'default'}>
                  {pos.found ? '✓' : '✗'} {pos.section}
                </Badge>
              ))}
            </div>
          </div>

          {/* LSI Keywords */}
          {analysis.keywords.lsiKeywords.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-2">İlişkili Kelimeler (LSI)</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.keywords.lsiKeywords.map((kw, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-slate-700 rounded text-sm text-slate-300"
                  >
                    {kw.word} <span className="text-slate-500">({kw.count})</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {analysis.keywords.suggestions.length > 0 && (
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <h4 className="text-sm font-medium text-yellow-400 mb-2">Öneriler</h4>
              <ul className="text-sm text-slate-300 space-y-1">
                {analysis.keywords.suggestions.map((s, i) => (
                  <li key={i}>• {s}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}

      {activeTab === 'readability' && (
        <Card title="Okunabilirlik Analizi">
          {/* Score */}
          <div className="flex items-center gap-6 mb-6">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center ${getScoreBg(analysis.readability.score)}`}>
              <span className={`text-2xl font-bold ${getScoreColor(analysis.readability.score)}`}>
                {analysis.readability.score}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">{analysis.readability.grade}</h3>
              <p className="text-sm text-slate-400">Flesch Okuma Kolaylığı Skoru</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-3 bg-slate-800/50 rounded-lg">
              <div className="text-lg font-medium text-white">{analysis.readability.stats.sentences}</div>
              <div className="text-xs text-slate-500">Cümle Sayısı</div>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-lg">
              <div className="text-lg font-medium text-white">{analysis.readability.stats.avgWordsPerSentence}</div>
              <div className="text-xs text-slate-500">Ort. Cümle Uzunluğu</div>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-lg">
              <div className="text-lg font-medium text-white">{analysis.readability.stats.avgSyllablesPerWord}</div>
              <div className="text-xs text-slate-500">Ort. Hece/Kelime</div>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-lg">
              <div className="text-lg font-medium text-white">{analysis.structure.averageParagraphLength}</div>
              <div className="text-xs text-slate-500">Ort. Paragraf Uzunluğu</div>
            </div>
          </div>

          {/* Issues */}
          {analysis.readability.issues.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-slate-300 mb-2">Tespit Edilen Sorunlar</h4>
              <ul className="space-y-1">
                {analysis.readability.issues.map((issue, i) => (
                  <li key={i} className="text-sm text-orange-400 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestions */}
          {(analysis.readability.suggestions.length > 0 || analysis.structure.suggestions.length > 0) && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <h4 className="text-sm font-medium text-blue-400 mb-2">İyileştirme Önerileri</h4>
              <ul className="text-sm text-slate-300 space-y-1">
                {[...analysis.readability.suggestions, ...analysis.structure.suggestions].map((s, i) => (
                  <li key={i}>• {s}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}

      {activeTab === 'issues' && (
        <Card title="SEO Sorunları ve Öneriler">
          {analysis.seoScore.issues.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Harika!</h3>
              <p className="text-slate-400">Önemli bir SEO sorunu tespit edilmedi.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {analysis.seoScore.issues.map((issue, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-lg border ${
                    issue.type === 'error'
                      ? 'bg-red-500/10 border-red-500/20'
                      : issue.type === 'warning'
                      ? 'bg-yellow-500/10 border-yellow-500/20'
                      : 'bg-blue-500/10 border-blue-500/20'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getIssueIcon(issue.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-slate-400">{issue.category}</span>
                        <Badge
                          size="sm"
                          variant={issue.type === 'error' ? 'danger' : issue.type === 'warning' ? 'warning' : 'default'}
                        >
                          {issue.type === 'error' ? 'Kritik' : issue.type === 'warning' ? 'Uyarı' : 'Bilgi'}
                        </Badge>
                      </div>
                      <p className="text-white font-medium">{issue.message}</p>
                      <p className="text-sm text-slate-400 mt-1">
                        <span className="text-emerald-400">→</span> {issue.suggestion}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
