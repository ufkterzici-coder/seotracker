import type { KeywordAnalysis, LSIKeyword } from '@/types/analysis';

// Turkish stop words
const STOP_WORDS = new Set([
  'bir', 've', 'ile', 'için', 'bu', 'da', 'de', 'olan', 'olarak', 'gibi',
  'çok', 'daha', 'en', 'her', 'ne', 'hem', 'ya', 'ama', 'ancak', 'fakat',
  'veya', 'ki', 'mi', 'mu', 'mü', 'mı', 'dır', 'dir', 'dur', 'dür',
  'tır', 'tir', 'tur', 'tür', 'den', 'dan', 'ten', 'tan', 'nin', 'nın',
  'nun', 'nün', 'ın', 'in', 'un', 'ün', 'ler', 'lar', 'lik', 'lık',
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
  'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
  'can', 'this', 'that', 'these', 'those', 'it', 'its', 'of', 'by', 'with',
]);

export function analyzeKeywords(content: string, mainKeyword: string): KeywordAnalysis {
  const words = content.toLowerCase().split(/\s+/);
  const totalWords = words.length;
  const keywordLower = mainKeyword.toLowerCase();
  const keywordWords = keywordLower.split(' ');

  // Count main keyword occurrences
  let occurrences = 0;
  const positions: number[] = [];

  for (let i = 0; i <= words.length - keywordWords.length; i++) {
    const slice = words.slice(i, i + keywordWords.length).join(' ');
    if (slice === keywordLower) {
      occurrences++;
      positions.push(i);
    }
  }

  const density = (occurrences * keywordWords.length / totalWords) * 100;

  // Find LSI keywords (word frequency analysis)
  const wordFreq: Record<string, number> = {};

  words.forEach((word) => {
    const cleanWord = word.replace(/[^\wğüşıöçĞÜŞİÖÇ]/g, '');
    if (cleanWord.length > 3 && !STOP_WORDS.has(cleanWord) && !keywordLower.includes(cleanWord)) {
      wordFreq[cleanWord] = (wordFreq[cleanWord] || 0) + 1;
    }
  });

  const lsiKeywords: LSIKeyword[] = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([word, count]) => ({
      word,
      count,
      relevance: Math.round((count / totalWords) * 1000) / 10,
    }));

  // Generate suggestions
  const suggestions: string[] = [];

  if (density < 0.5) {
    suggestions.push(`Anahtar kelime yoğunluğu düşük (${density.toFixed(2)}%). %1-2 arasını hedefleyin.`);
  } else if (density > 3) {
    suggestions.push(`Anahtar kelime yoğunluğu yüksek (${density.toFixed(2)}%). Aşırı optimizasyondan kaçının.`);
  }

  if (positions.length > 0 && positions[0] > 100) {
    suggestions.push('Ana anahtar kelimeyi içeriğin başında kullanmayı düşünün.');
  }

  if (occurrences < 3) {
    suggestions.push('Ana anahtar kelimeyi içerik boyunca en az 3-5 kez kullanın.');
  }

  // Check keyword in first 100 words
  const first100Words = words.slice(0, 100).join(' ');
  if (!first100Words.includes(keywordLower)) {
    suggestions.push('Anahtar kelimeyi ilk 100 kelime içinde kullanın.');
  }

  return {
    mainKeyword,
    density: Math.round(density * 100) / 100,
    occurrences,
    positions,
    lsiKeywords,
    suggestions,
  };
}

export function findKeywordVariations(keyword: string, content: string): string[] {
  const words = content.toLowerCase().split(/\s+/);
  const keywordParts = keyword.toLowerCase().split(' ');
  const variations: Set<string> = new Set();

  // Find variations containing any part of the keyword
  for (let i = 0; i < words.length - 1; i++) {
    for (let len = 2; len <= 4; len++) {
      if (i + len > words.length) break;
      const phrase = words.slice(i, i + len).join(' ');
      if (keywordParts.some((part) => phrase.includes(part))) {
        variations.add(phrase);
      }
    }
  }

  return Array.from(variations).slice(0, 10);
}

export function calculateKeywordProminence(
  content: string,
  keyword: string
): { score: number; positions: { section: string; found: boolean }[] } {
  const keywordLower = keyword.toLowerCase();
  const sections = [
    { name: 'title', weight: 5 },
    { name: 'first_paragraph', weight: 4 },
    { name: 'headings', weight: 3 },
    { name: 'body', weight: 2 },
    { name: 'conclusion', weight: 3 },
  ];

  const paragraphs = content.split(/\n\n+/);
  const firstParagraph = paragraphs[0]?.toLowerCase() || '';
  const lastParagraph = paragraphs[paragraphs.length - 1]?.toLowerCase() || '';

  const positions: { section: string; found: boolean }[] = [];
  let totalScore = 0;
  let maxScore = 0;

  // Check first paragraph
  const inFirstPara = firstParagraph.includes(keywordLower);
  positions.push({ section: 'İlk Paragraf', found: inFirstPara });
  if (inFirstPara) totalScore += 4;
  maxScore += 4;

  // Check body
  const inBody = content.toLowerCase().includes(keywordLower);
  positions.push({ section: 'İçerik', found: inBody });
  if (inBody) totalScore += 2;
  maxScore += 2;

  // Check conclusion
  const inConclusion = lastParagraph.includes(keywordLower);
  positions.push({ section: 'Sonuç', found: inConclusion });
  if (inConclusion) totalScore += 3;
  maxScore += 3;

  return {
    score: Math.round((totalScore / maxScore) * 100),
    positions,
  };
}

export function suggestLSIKeywords(
  mainKeyword: string,
  existingLSI: string[]
): string[] {
  // This would ideally use an API or database of related keywords
  // For now, return empty - will be populated by AI
  return [];
}

export function getKeywordDensityGrade(density: number): {
  grade: 'excellent' | 'good' | 'low' | 'high';
  message: string;
} {
  if (density >= 1 && density <= 2) {
    return { grade: 'excellent', message: 'Mükemmel anahtar kelime yoğunluğu' };
  } else if (density >= 0.5 && density < 1) {
    return { grade: 'good', message: 'İyi, biraz daha anahtar kelime ekleyebilirsiniz' };
  } else if (density < 0.5) {
    return { grade: 'low', message: 'Düşük yoğunluk, daha fazla anahtar kelime kullanın' };
  } else {
    return { grade: 'high', message: 'Yüksek yoğunluk, aşırı optimizasyon riski' };
  }
}
