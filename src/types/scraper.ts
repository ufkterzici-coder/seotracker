export interface ScrapedPage {
  url: string;
  title: string;
  content: string;
  headings: HeadingItem[];
  wordCount: number;
  images: ImageItem[];
}

export interface HeadingItem {
  level: number;
  text: string;
}

export interface ImageItem {
  src: string;
  alt: string;
}

export interface ScrapeRequest {
  urls: string[];
}

export interface ScrapeResponse {
  results: ScrapedPage[];
  errors?: ScrapeError[];
}

export interface ScrapeError {
  url: string;
  error: string;
}
