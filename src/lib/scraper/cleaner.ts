export function cleanContent(text: string): string {
  return text
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Remove common unwanted patterns
    .replace(/Share on (Facebook|Twitter|LinkedIn|WhatsApp)/gi, '')
    .replace(/Read more\.\.\.?/gi, '')
    .replace(/Advertisement/gi, '')
    .replace(/Sponsored/gi, '')
    .replace(/Click here to/gi, '')
    .replace(/Subscribe to our newsletter/gi, '')
    .replace(/Follow us on/gi, '')
    .replace(/Leave a comment/gi, '')
    .replace(/Related articles?:?/gi, '')
    .replace(/Related posts?:?/gi, '')
    // Remove URLs
    .replace(/https?:\/\/[^\s]+/g, '')
    // Remove email addresses
    .replace(/[\w.-]+@[\w.-]+\.\w+/g, '')
    // Remove phone numbers
    .replace(/\+?[\d\s()-]{10,}/g, '')
    // Clean up
    .trim();
}

export function cleanHTML(html: string): string {
  return html
    // Remove script tags
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    // Remove style tags
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    // Remove comments
    .replace(/<!--[\s\S]*?-->/g, '')
    // Remove noscript
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')
    // Remove iframe
    .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
    // Remove svg
    .replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, '');
}

export function extractMainContent(html: string): string {
  // Remove non-content elements
  let clean = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
    .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '')
    .replace(/<form[^>]*>[\s\S]*?<\/form>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');

  // Remove HTML tags but keep text
  clean = clean.replace(/<[^>]+>/g, ' ');

  return cleanContent(clean);
}

export function normalizeWhitespace(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

export function removeBoilerplate(text: string): string {
  const boilerplatePatterns = [
    /copyright\s*©?\s*\d{4}/gi,
    /all rights reserved/gi,
    /privacy policy/gi,
    /terms of service/gi,
    /terms and conditions/gi,
    /cookie policy/gi,
    /powered by/gi,
    /website by/gi,
    /designed by/gi,
    /built with/gi,
  ];

  let cleaned = text;
  for (const pattern of boilerplatePatterns) {
    cleaned = cleaned.replace(pattern, '');
  }

  return cleaned;
}

export function extractSentences(text: string): string[] {
  return text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);
}

export function extractParagraphs(text: string): string[] {
  return text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 50);
}
