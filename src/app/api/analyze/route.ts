import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { calculateSEOScore, getSEOScoreLabel } from '@/lib/analysis/seo-score';
import { analyzeKeywords, calculateKeywordProminence, getKeywordDensityGrade } from '@/lib/analysis/keywords';
import { analyzeReadability, analyzeContentStructure } from '@/lib/analysis/readability';

export async function POST(request: NextRequest) {
  const isAuth = await verifyAuth();
  if (!isAuth) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      title,
      content,
      mainKeyword,
      metaTitle,
      metaDescription,
      slug,
    } = body;

    if (!content || content.trim().length < 50) {
      return NextResponse.json(
        { error: 'İçerik en az 50 karakter olmalı' },
        { status: 400 }
      );
    }

    if (!mainKeyword || mainKeyword.trim().length < 2) {
      return NextResponse.json(
        { error: 'Ana anahtar kelime gerekli' },
        { status: 400 }
      );
    }

    // Strip HTML tags for analysis
    const plainText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

    // Extract headings from HTML content
    const headingMatches = content.matchAll(/<h([1-6])[^>]*>([^<]*)<\/h[1-6]>/gi);
    const headings = Array.from(headingMatches).map((match) => ({
      level: parseInt(match[1]),
      text: match[2].trim(),
    }));

    // Calculate SEO Score
    const seoScore = calculateSEOScore({
      title: title || '',
      metaTitle: metaTitle || '',
      metaDescription: metaDescription || '',
      content: plainText,
      mainKeyword: mainKeyword.trim(),
      headings,
      slug: slug || '',
    });

    // Keyword Analysis
    const keywordAnalysis = analyzeKeywords(plainText, mainKeyword.trim());
    const keywordProminence = calculateKeywordProminence(plainText, mainKeyword.trim());
    const densityGrade = getKeywordDensityGrade(keywordAnalysis.density);

    // Readability Analysis
    const readability = analyzeReadability(plainText);
    const contentStructure = analyzeContentStructure(plainText);

    // Word count and reading time
    const wordCount = plainText.split(/\s+/).filter(Boolean).length;
    const readingTime = Math.ceil(wordCount / 200); // 200 words per minute

    return NextResponse.json({
      analysis: {
        seoScore: {
          overall: seoScore.overall,
          label: getSEOScoreLabel(seoScore.overall),
          breakdown: seoScore.breakdown,
          issues: seoScore.issues,
        },
        keywords: {
          main: mainKeyword,
          density: keywordAnalysis.density,
          densityGrade,
          occurrences: keywordAnalysis.occurrences,
          prominence: keywordProminence,
          lsiKeywords: keywordAnalysis.lsiKeywords.slice(0, 10),
          suggestions: keywordAnalysis.suggestions,
        },
        readability: {
          score: readability.score,
          grade: readability.grade,
          stats: readability.stats,
          issues: readability.issues,
          suggestions: readability.suggestions,
        },
        structure: {
          headings,
          headingCount: {
            h1: headings.filter((h) => h.level === 1).length,
            h2: headings.filter((h) => h.level === 2).length,
            h3: headings.filter((h) => h.level === 3).length,
            h4: headings.filter((h) => h.level === 4).length,
          },
          ...contentStructure,
        },
        meta: {
          wordCount,
          readingTime,
          titleLength: (title || '').length,
          metaTitleLength: (metaTitle || '').length,
          metaDescriptionLength: (metaDescription || '').length,
        },
      },
    });
  } catch (error: any) {
    console.error('Analyze error:', error);
    return NextResponse.json(
      { error: error.message || 'Analiz hatası' },
      { status: 500 }
    );
  }
}
