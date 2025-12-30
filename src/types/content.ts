export interface Content {
  id: string;
  title: string;
  slug: string | null;
  meta_title: string | null;
  meta_description: string | null;
  content: string | null;
  html_content: string | null;
  main_keyword: string | null;
  lsi_keywords: string | null; // JSON array
  search_intent: SearchIntent | null;
  headings: string | null; // JSON object
  schema_markup: string | null; // JSON-LD
  readability_score: number | null;
  seo_score: number | null;
  word_count: number | null;
  competitor_urls: string | null; // JSON array
  competitor_data: string | null; // JSON object
  featured_image: string | null;
  image_alt_text: string | null;
  status: ContentStatus;
  created_at: string;
  updated_at: string;
}

export type ContentStatus = 'draft' | 'published';

export type SearchIntent = 'informational' | 'transactional' | 'navigational' | 'commercial';

export interface Template {
  id: string;
  name: string;
  description: string | null;
  structure: string | null; // JSON
  prompts: string | null; // JSON
  is_default: number;
  created_at: string;
}

export interface ScrapedCache {
  id: string;
  url: string;
  title: string | null;
  content: string | null;
  headings: string | null; // JSON
  word_count: number | null;
  scraped_at: string;
  expires_at: string | null;
}

export interface ContentFormData {
  title: string;
  mainKeyword: string;
  competitorUrls: string[];
  targetWordCount: number;
  searchIntent: SearchIntent;
  language: string;
}

export interface GeneratedContent {
  meta: {
    title: string;
    description: string;
    slug: string;
  };
  headings: {
    h1: string;
    h2: string[];
    h3: string[];
  };
  content: string;
  lsiKeywords: string[];
  featuredSnippet: string;
  imageAltSuggestions: string[];
}

export interface Heading {
  level: number;
  text: string;
}
