import type { SEOScore, SEOIssue } from '@/types/analysis';
import { analyzeKeywords } from './keywords';
import { analyzeReadability } from './readability';

export interface SEOScoreInput {
  title: string;
  metaTitle?: string;
  metaDescription?: string;
  content: string;
  mainKeyword: string;
  headings?: { level: number; text: string }[];
  slug?: string;
  imageAltTexts?: string[];
}

export function calculateSEOScore(input: SEOScoreInput): SEOScore {
  const issues: SEOIssue[] = [];
  let totalScore = 0;
  const breakdown = {
    keywordUsage: 0,
    readability: 0,
    headingStructure: 0,
    contentLength: 0,
    metaQuality: 0,
  };

  // 1. Keyword Usage (25 points)
  const keywordAnalysis = analyzeKeywords(input.content, input.mainKeyword);

  if (keywordAnalysis.density >= 1 && keywordAnalysis.density <= 2) {
    breakdown.keywordUsage = 25;
  } else if (keywordAnalysis.density >= 0.5 && keywordAnalysis.density < 1) {
    breakdown.keywordUsage = 18;
    issues.push({
      type: 'warning',
      category: 'Anahtar Kelime',
      message: 'Anahtar kelime yoğunluğu biraz düşük',
      suggestion: 'Ana anahtar kelimeyi birkaç kez daha kullanın',
    });
  } else if (keywordAnalysis.density > 2 && keywordAnalysis.density <= 3) {
    breakdown.keywordUsage = 15;
    issues.push({
      type: 'warning',
      category: 'Anahtar Kelime',
      message: 'Anahtar kelime yoğunluğu biraz yüksek',
      suggestion: 'Aşırı optimizasyondan kaçının',
    });
  } else if (keywordAnalysis.density < 0.5) {
    breakdown.keywordUsage = 10;
    issues.push({
      type: 'error',
      category: 'Anahtar Kelime',
      message: 'Anahtar kelime yoğunluğu çok düşük',
      suggestion: 'İçerikte ana anahtar kelimeyi daha sık kullanın',
    });
  } else {
    breakdown.keywordUsage = 5;
    issues.push({
      type: 'error',
      category: 'Anahtar Kelime',
      message: 'Anahtar kelime aşırı kullanılmış (keyword stuffing riski)',
      suggestion: 'Anahtar kelime kullanımını azaltın',
    });
  }

  // Check keyword in title
  if (input.title && !input.title.toLowerCase().includes(input.mainKeyword.toLowerCase())) {
    issues.push({
      type: 'warning',
      category: 'Anahtar Kelime',
      message: 'Başlıkta ana anahtar kelime yok',
      suggestion: 'Ana anahtar kelimeyi başlığa ekleyin',
    });
    breakdown.keywordUsage -= 5;
  }

  // 2. Readability (20 points)
  const readabilityResult = analyzeReadability(input.content);

  if (readabilityResult.score >= 60) {
    breakdown.readability = 20;
  } else if (readabilityResult.score >= 50) {
    breakdown.readability = 15;
    issues.push({
      type: 'info',
      category: 'Okunabilirlik',
      message: 'Okunabilirlik iyileştirilebilir',
      suggestion: 'Cümleleri kısaltın ve basit kelimeler kullanın',
    });
  } else if (readabilityResult.score >= 30) {
    breakdown.readability = 10;
    issues.push({
      type: 'warning',
      category: 'Okunabilirlik',
      message: 'İçerik okumak zor',
      suggestion: 'Daha kısa cümleler ve basit kelimeler kullanın',
    });
  } else {
    breakdown.readability = 5;
    issues.push({
      type: 'error',
      category: 'Okunabilirlik',
      message: 'İçerik çok karmaşık',
      suggestion: 'İçeriği tamamen yeniden yazın, hedef kitleyi düşünün',
    });
  }

  // 3. Heading Structure (15 points)
  if (input.headings && input.headings.length > 0) {
    const h1Count = input.headings.filter((h) => h.level === 1).length;
    const h2Count = input.headings.filter((h) => h.level === 2).length;
    const h3Count = input.headings.filter((h) => h.level === 3).length;

    if (h1Count === 1 && h2Count >= 2) {
      breakdown.headingStructure = 15;
    } else if (h1Count === 1) {
      breakdown.headingStructure = 12;
      if (h2Count < 2) {
        issues.push({
          type: 'warning',
          category: 'Başlık Yapısı',
          message: 'Yeterli alt başlık (H2) yok',
          suggestion: 'En az 2-3 H2 başlık ekleyin',
        });
      }
    } else if (h1Count === 0) {
      breakdown.headingStructure = 5;
      issues.push({
        type: 'error',
        category: 'Başlık Yapısı',
        message: 'Ana başlık (H1) eksik',
        suggestion: 'Her sayfada bir H1 başlık olmalı',
      });
    } else {
      breakdown.headingStructure = 8;
      issues.push({
        type: 'warning',
        category: 'Başlık Yapısı',
        message: 'Birden fazla H1 başlık var',
        suggestion: 'Sayfada yalnızca bir H1 olmalı',
      });
    }

    // Check keyword in headings
    const keywordInHeadings = input.headings.some((h) =>
      h.text.toLowerCase().includes(input.mainKeyword.toLowerCase())
    );
    if (!keywordInHeadings) {
      issues.push({
        type: 'info',
        category: 'Başlık Yapısı',
        message: 'Başlıklarda anahtar kelime yok',
        suggestion: 'En az bir başlıkta ana anahtar kelimeyi kullanın',
      });
    }
  } else {
    breakdown.headingStructure = 0;
    issues.push({
      type: 'error',
      category: 'Başlık Yapısı',
      message: 'Başlık yapısı eksik',
      suggestion: 'H1, H2 ve H3 başlıklar ekleyin',
    });
  }

  // 4. Content Length (20 points)
  const wordCount = input.content.split(/\s+/).filter((w) => w.length > 0).length;

  if (wordCount >= 1500) {
    breakdown.contentLength = 20;
  } else if (wordCount >= 1000) {
    breakdown.contentLength = 15;
    issues.push({
      type: 'info',
      category: 'İçerik Uzunluğu',
      message: 'İçerik yeterli uzunlukta',
      suggestion: 'Daha kapsamlı içerik için 1500+ kelime hedefleyin',
    });
  } else if (wordCount >= 500) {
    breakdown.contentLength = 10;
    issues.push({
      type: 'warning',
      category: 'İçerik Uzunluğu',
      message: 'İçerik biraz kısa',
      suggestion: 'SEO için en az 1000-1500 kelime önerilir',
    });
  } else {
    breakdown.contentLength = 5;
    issues.push({
      type: 'error',
      category: 'İçerik Uzunluğu',
      message: 'İçerik çok kısa',
      suggestion: 'Rekabet edebilmek için içeriği genişletin',
    });
  }

  // 5. Meta Quality (20 points)
  let metaScore = 0;

  // Meta title check
  if (input.metaTitle) {
    const metaTitleLen = input.metaTitle.length;
    if (metaTitleLen >= 30 && metaTitleLen <= 60) {
      metaScore += 5;
    } else if (metaTitleLen > 0) {
      metaScore += 2;
      issues.push({
        type: 'warning',
        category: 'Meta',
        message: `Meta başlık ${metaTitleLen > 60 ? 'çok uzun' : 'çok kısa'}`,
        suggestion: 'Meta başlık 30-60 karakter arasında olmalı',
      });
    }

    if (input.metaTitle.toLowerCase().includes(input.mainKeyword.toLowerCase())) {
      metaScore += 5;
    } else {
      issues.push({
        type: 'warning',
        category: 'Meta',
        message: 'Meta başlıkta anahtar kelime yok',
        suggestion: 'Ana anahtar kelimeyi meta başlığa ekleyin',
      });
    }
  } else {
    issues.push({
      type: 'error',
      category: 'Meta',
      message: 'Meta başlık eksik',
      suggestion: 'Benzersiz ve anahtar kelime içeren meta başlık ekleyin',
    });
  }

  // Meta description check
  if (input.metaDescription) {
    const metaDescLen = input.metaDescription.length;
    if (metaDescLen >= 120 && metaDescLen <= 155) {
      metaScore += 5;
    } else if (metaDescLen > 0) {
      metaScore += 2;
      issues.push({
        type: 'warning',
        category: 'Meta',
        message: `Meta açıklama ${metaDescLen > 155 ? 'çok uzun' : 'çok kısa'}`,
        suggestion: 'Meta açıklama 120-155 karakter arasında olmalı',
      });
    }

    if (input.metaDescription.toLowerCase().includes(input.mainKeyword.toLowerCase())) {
      metaScore += 5;
    } else {
      issues.push({
        type: 'info',
        category: 'Meta',
        message: 'Meta açıklamada anahtar kelime yok',
        suggestion: 'Meta açıklamada ana anahtar kelimeyi kullanın',
      });
    }
  } else {
    issues.push({
      type: 'error',
      category: 'Meta',
      message: 'Meta açıklama eksik',
      suggestion: 'Etkileyici ve anahtar kelime içeren meta açıklama ekleyin',
    });
  }

  breakdown.metaQuality = Math.min(20, metaScore);

  // Calculate total
  totalScore = Object.values(breakdown).reduce((a, b) => a + b, 0);

  return {
    overall: Math.max(0, Math.min(100, totalScore)),
    breakdown,
    issues: issues.sort((a, b) => {
      const order = { error: 0, warning: 1, info: 2 };
      return order[a.type] - order[b.type];
    }),
  };
}

export function getSEOScoreLabel(score: number): string {
  if (score >= 80) return 'Mükemmel';
  if (score >= 60) return 'İyi';
  if (score >= 40) return 'Orta';
  if (score >= 20) return 'Zayıf';
  return 'Kritik';
}

export function getSEOScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-400';
  if (score >= 60) return 'text-lime-400';
  if (score >= 40) return 'text-yellow-400';
  if (score >= 20) return 'text-orange-400';
  return 'text-red-400';
}
