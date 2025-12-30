import type { ReadabilityResult } from '@/types/analysis';

export function analyzeReadability(text: string): ReadabilityResult {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const syllables = words.reduce((sum, word) => sum + countSyllables(word), 0);

  if (sentences.length === 0 || words.length === 0) {
    return {
      score: 0,
      grade: 'N/A',
      stats: {
        sentences: 0,
        words: 0,
        syllables: 0,
        avgWordsPerSentence: 0,
        avgSyllablesPerWord: 0,
      },
      issues: ['İçerik çok kısa veya boş'],
      suggestions: ['Daha fazla içerik ekleyin'],
    };
  }

  const avgWordsPerSentence = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;

  // Flesch Reading Ease Score (adapted for Turkish)
  const score = Math.round(
    206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord
  );

  // Determine grade
  let grade: string;
  if (score >= 90) grade = 'Çok Kolay';
  else if (score >= 80) grade = 'Kolay';
  else if (score >= 70) grade = 'Oldukça Kolay';
  else if (score >= 60) grade = 'Standart';
  else if (score >= 50) grade = 'Oldukça Zor';
  else if (score >= 30) grade = 'Zor';
  else grade = 'Çok Zor';

  // Find issues
  const issues: string[] = [];
  const suggestions: string[] = [];

  // Check for long sentences
  const longSentences = sentences.filter((s) => s.split(/\s+/).length > 25).length;
  if (longSentences > 0) {
    issues.push(`${longSentences} uzun cümle (>25 kelime)`);
    suggestions.push('Uzun cümleleri daha kısa cümlelere bölün.');
  }

  // Check for very short sentences
  const shortSentences = sentences.filter((s) => s.split(/\s+/).length < 5).length;
  if (shortSentences > sentences.length * 0.3) {
    issues.push('Çok fazla kısa cümle');
    suggestions.push('Bazı kısa cümleleri birleştirin.');
  }

  // Check for complex words
  const complexWords = words.filter((w) => countSyllables(w) >= 4).length;
  const complexPercent = (complexWords / words.length) * 100;
  if (complexPercent > 15) {
    issues.push(`%${complexPercent.toFixed(1)} karmaşık kelime`);
    suggestions.push('Mümkün olduğunca basit kelimeler kullanın.');
  }

  // Check average sentence length
  if (avgWordsPerSentence > 20) {
    issues.push('Yüksek ortalama cümle uzunluğu');
    suggestions.push('Ortalama cümle uzunluğunu 15-20 kelime arasına indirin.');
  }

  // Check paragraph length
  const paragraphs = text.split(/\n\n+/);
  const longParagraphs = paragraphs.filter((p) => p.split(/\s+/).length > 150).length;
  if (longParagraphs > 0) {
    issues.push(`${longParagraphs} uzun paragraf`);
    suggestions.push('Uzun paragrafları bölün, her paragraf bir fikri ele almalı.');
  }

  // Passive voice check (basic Turkish passive detection)
  const passivePatterns = [/ılmak|ilmek|ulmak|ülmek|ınmak|inmek|unmak|ünmek/gi];
  let passiveCount = 0;
  for (const pattern of passivePatterns) {
    const matches = text.match(pattern);
    if (matches) passiveCount += matches.length;
  }
  if (passiveCount > words.length * 0.1) {
    issues.push('Fazla edilgen yapı kullanımı');
    suggestions.push('Etken cümle yapısını tercih edin.');
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    grade,
    stats: {
      sentences: sentences.length,
      words: words.length,
      syllables,
      avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
      avgSyllablesPerWord: Math.round(avgSyllablesPerWord * 100) / 100,
    },
    issues,
    suggestions,
  };
}

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-zığüşöç]/g, '');
  if (word.length <= 3) return 1;

  // Turkish vowels
  const vowels = /[aeıioöuü]/gi;
  const matches = word.match(vowels);
  return matches ? matches.length : 1;
}

export function getReadabilityColor(score: number): string {
  if (score >= 70) return 'text-emerald-400';
  if (score >= 50) return 'text-yellow-400';
  if (score >= 30) return 'text-orange-400';
  return 'text-red-400';
}

export function getReadabilityBgColor(score: number): string {
  if (score >= 70) return 'bg-emerald-500/20';
  if (score >= 50) return 'bg-yellow-500/20';
  if (score >= 30) return 'bg-orange-500/20';
  return 'bg-red-500/20';
}

export function calculateFleschKincaidGrade(text: string): number {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const syllables = words.reduce((sum, word) => sum + countSyllables(word), 0);

  if (sentences.length === 0 || words.length === 0) return 0;

  const grade =
    0.39 * (words.length / sentences.length) +
    11.8 * (syllables / words.length) -
    15.59;

  return Math.max(0, Math.round(grade * 10) / 10);
}

export function analyzeContentStructure(text: string): {
  hasBulletPoints: boolean;
  hasNumberedLists: boolean;
  paragraphCount: number;
  averageParagraphLength: number;
  suggestions: string[];
} {
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 0);
  const bulletPoints = text.match(/^[\s]*[-•*]\s/gm);
  const numberedLists = text.match(/^[\s]*\d+[.)]\s/gm);

  const avgParagraphLength =
    paragraphs.reduce((sum, p) => sum + p.split(/\s+/).length, 0) / paragraphs.length;

  const suggestions: string[] = [];

  if (!bulletPoints && !numberedLists) {
    suggestions.push('Okunabilirliği artırmak için madde işaretleri veya numaralı listeler ekleyin.');
  }

  if (avgParagraphLength > 100) {
    suggestions.push('Paragrafları daha kısa tutun (ideal: 50-100 kelime).');
  }

  if (paragraphs.length < 5) {
    suggestions.push('İçeriği daha fazla paragrafa bölün.');
  }

  return {
    hasBulletPoints: !!bulletPoints,
    hasNumberedLists: !!numberedLists,
    paragraphCount: paragraphs.length,
    averageParagraphLength: Math.round(avgParagraphLength),
    suggestions,
  };
}
