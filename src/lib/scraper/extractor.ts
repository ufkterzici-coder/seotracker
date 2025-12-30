import { JSDOM } from 'jsdom';
import type { HeadingItem, ImageItem } from '@/types/scraper';

export interface ExtractedMeta {
  title: string;
  description: string;
  keywords: string[];
  author: string;
  publishDate: string | null;
  modifiedDate: string | null;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  canonicalUrl: string;
  language: string;
}

export function extractMetaData(html: string): ExtractedMeta {
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  const getMeta = (name: string): string => {
    const meta = doc.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
    return meta?.getAttribute('content') || '';
  };

  const keywords = getMeta('keywords')
    .split(',')
    .map((k) => k.trim())
    .filter((k) => k.length > 0);

  return {
    title: doc.querySelector('title')?.textContent || '',
    description: getMeta('description'),
    keywords,
    author: getMeta('author'),
    publishDate: getMeta('article:published_time') || getMeta('datePublished') || null,
    modifiedDate: getMeta('article:modified_time') || getMeta('dateModified') || null,
    ogTitle: getMeta('og:title'),
    ogDescription: getMeta('og:description'),
    ogImage: getMeta('og:image'),
    canonicalUrl:
      doc.querySelector('link[rel="canonical"]')?.getAttribute('href') || '',
    language: doc.documentElement.getAttribute('lang') || 'tr',
  };
}

export function extractMainContent(html: string): string {
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  // Try to find main content area
  const contentSelectors = [
    'article',
    '[role="main"]',
    'main',
    '.post-content',
    '.article-content',
    '.entry-content',
    '.content',
    '#content',
  ];

  for (const selector of contentSelectors) {
    const element = doc.querySelector(selector);
    if (element && element.textContent && element.textContent.length > 500) {
      return element.textContent.trim();
    }
  }

  // Fallback to body
  return doc.body?.textContent?.trim() || '';
}

export function extractHeadingsFromHTML(html: string): HeadingItem[] {
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  const headings: HeadingItem[] = [];

  doc.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h) => {
    const level = parseInt(h.tagName[1]);
    const text = h.textContent?.trim() || '';
    if (text && text.length > 2) {
      headings.push({ level, text });
    }
  });

  return headings;
}

export function extractImagesFromHTML(html: string, baseUrl: string): ImageItem[] {
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  const images: ImageItem[] = [];

  doc.querySelectorAll('img').forEach((img) => {
    let src = img.getAttribute('src') || img.getAttribute('data-src') || '';
    const alt = img.getAttribute('alt') || '';

    // Skip data URIs and tiny images
    if (src.startsWith('data:') || src.includes('1x1') || src.includes('pixel')) {
      return;
    }

    // Convert relative URLs to absolute
    if (src && !src.startsWith('http')) {
      try {
        src = new URL(src, baseUrl).href;
      } catch {
        return;
      }
    }

    if (src) {
      images.push({ src, alt });
    }
  });

  return images;
}

export function extractLinks(html: string, baseUrl: string): { href: string; text: string }[] {
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  const links: { href: string; text: string }[] = [];

  doc.querySelectorAll('a[href]').forEach((a) => {
    let href = a.getAttribute('href') || '';
    const text = a.textContent?.trim() || '';

    // Skip anchors and javascript
    if (href.startsWith('#') || href.startsWith('javascript:')) {
      return;
    }

    // Convert relative URLs to absolute
    if (href && !href.startsWith('http')) {
      try {
        href = new URL(href, baseUrl).href;
      } catch {
        return;
      }
    }

    if (href && text) {
      links.push({ href, text });
    }
  });

  return links;
}

export function extractSchemaMarkup(html: string): object[] {
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  const schemas: object[] = [];

  doc.querySelectorAll('script[type="application/ld+json"]').forEach((script) => {
    try {
      const data = JSON.parse(script.textContent || '');
      if (Array.isArray(data)) {
        schemas.push(...data);
      } else {
        schemas.push(data);
      }
    } catch {
      // Invalid JSON, skip
    }
  });

  return schemas;
}

export function extractWordFrequency(text: string): Map<string, number> {
  const words = text
    .toLowerCase()
    .replace(/[^\wğüşıöçĞÜŞİÖÇ\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const frequency = new Map<string, number>();

  for (const word of words) {
    frequency.set(word, (frequency.get(word) || 0) + 1);
  }

  return frequency;
}

export function getReadingLevel(text: string): {
  averageWordsPerSentence: number;
  averageSyllablesPerWord: number;
  complexity: 'easy' | 'medium' | 'hard';
} {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const words = text.split(/\s+/).filter((w) => w.length > 0);

  if (sentences.length === 0 || words.length === 0) {
    return {
      averageWordsPerSentence: 0,
      averageSyllablesPerWord: 0,
      complexity: 'easy',
    };
  }

  const avgWords = words.length / sentences.length;
  const syllables = words.reduce((sum, word) => sum + countSyllables(word), 0);
  const avgSyllables = syllables / words.length;

  let complexity: 'easy' | 'medium' | 'hard' = 'medium';
  if (avgWords < 15 && avgSyllables < 1.5) {
    complexity = 'easy';
  } else if (avgWords > 25 || avgSyllables > 2) {
    complexity = 'hard';
  }

  return {
    averageWordsPerSentence: Math.round(avgWords * 10) / 10,
    averageSyllablesPerWord: Math.round(avgSyllables * 100) / 100,
    complexity,
  };
}

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-zğüşıöç]/g, '');
  if (word.length <= 3) return 1;

  // Turkish vowels
  const vowels = /[aeıioöuü]/gi;
  const matches = word.match(vowels);
  return matches ? matches.length : 1;
}
