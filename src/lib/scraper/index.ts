import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import { cleanContent } from './cleaner';
import type { ScrapedPage, HeadingItem, ImageItem } from '@/types/scraper';

// Fetch-based scraper that works on all platforms (no Puppeteer required)
export async function scrapePage(url: string): Promise<ScrapedPage> {
  try {
    // Fetch the page
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      // @ts-ignore - Next.js fetch supports this
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();

    // Parse with JSDOM and Readability
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article) {
      // Fallback to basic extraction if Readability fails
      const doc = dom.window.document;
      const title = doc.querySelector('title')?.textContent || '';
      const bodyText = doc.body?.textContent || '';
      const cleanedContent = cleanContent(bodyText);

      return {
        url,
        title,
        content: cleanedContent,
        headings: extractHeadings(doc),
        wordCount: cleanedContent.split(/\s+/).filter((w) => w.length > 0).length,
        images: extractImages(doc),
      };
    }

    // Extract headings
    const headings = extractHeadings(dom.window.document);

    // Extract images
    const images = extractImages(dom.window.document);

    // Clean content
    const cleanedContent = cleanContent(article.textContent);

    return {
      url,
      title: article.title,
      content: cleanedContent,
      headings,
      wordCount: cleanedContent.split(/\s+/).filter((w) => w.length > 0).length,
      images,
    };
  } catch (error) {
    console.error(`Failed to scrape ${url}:`, error);
    throw error;
  }
}

function extractHeadings(doc: Document): HeadingItem[] {
  const headings: HeadingItem[] = [];

  doc.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h) => {
    const level = parseInt(h.tagName[1]);
    const text = h.textContent?.trim() || '';
    if (text) {
      headings.push({ level, text });
    }
  });

  return headings;
}

function extractImages(doc: Document): ImageItem[] {
  const images: ImageItem[] = [];

  doc.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src') || '';
    const alt = img.getAttribute('alt') || '';
    if (src && !src.startsWith('data:')) {
      images.push({ src, alt });
    }
  });

  return images;
}

export async function scrapeMultiplePages(urls: string[]): Promise<ScrapedPage[]> {
  const results: ScrapedPage[] = [];

  for (const url of urls) {
    try {
      const result = await scrapePage(url);
      results.push(result);
      // Add delay between requests to be polite
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Failed to scrape ${url}:`, error);
      // Add a placeholder for failed scrapes
      results.push({
        url,
        title: 'Taranamadı',
        content: '',
        headings: [],
        wordCount: 0,
        images: [],
      });
    }
  }

  return results;
}

export async function scrapePageLight(url: string): Promise<{
  title: string;
  description: string;
  headings: HeadingItem[];
}> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    const html = await response.text();
    const dom = new JSDOM(html, { url });
    const doc = dom.window.document;

    const title = doc.querySelector('title')?.textContent || '';
    const description =
      doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const headings = extractHeadings(doc);

    return { title, description, headings };
  } catch (error) {
    console.error(`Light scrape failed for ${url}:`, error);
    return { title: '', description: '', headings: [] };
  }
}

export { cleanContent } from './cleaner';
export { extractMainContent, extractMetaData } from './extractor';
