export interface KeywordAnalysis {
  mainKeyword: string;
  density: number;
  occurrences: number;
  positions: number[];
  lsiKeywords: LSIKeyword[];
  suggestions: string[];
}

export interface LSIKeyword {
  word: string;
  count: number;
  relevance: number;
}

export interface ReadabilityResult {
  score: number;
  grade: string;
  stats: ReadabilityStats;
  issues: string[];
  suggestions: string[];
}

export interface ReadabilityStats {
  sentences: number;
  words: number;
  syllables: number;
  avgWordsPerSentence: number;
  avgSyllablesPerWord: number;
}

export interface IntentAnalysis {
  intent: SearchIntent;
  confidence: number;
  signals: string[];
  contentRecommendations: string[];
}

export type SearchIntent = 'informational' | 'transactional' | 'navigational' | 'commercial';

export interface SEOScore {
  overall: number;
  breakdown: {
    keywordUsage: number;
    readability: number;
    headingStructure: number;
    contentLength: number;
    metaQuality: number;
  };
  issues: SEOIssue[];
}

export interface SEOIssue {
  type: 'error' | 'warning' | 'info';
  category: string;
  message: string;
  suggestion?: string;
}
