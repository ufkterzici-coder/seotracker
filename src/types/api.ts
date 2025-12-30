export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface GenerateContentRequest {
  topic: string;
  mainKeyword: string;
  competitorContents?: string[];
  wordCount?: number;
  searchIntent?: string;
  language?: string;
}

export interface GenerateMetaRequest {
  title: string;
  content: string;
  mainKeyword: string;
}

export interface GenerateSchemaRequest {
  type: 'article' | 'faq' | 'howto' | 'product';
  data: Record<string, unknown>;
}

export interface AnalyzeKeywordsRequest {
  content: string;
  mainKeyword: string;
}

export interface AnalyzeReadabilityRequest {
  content: string;
}

export interface AnalyzeIntentRequest {
  keyword: string;
  content?: string;
}

export interface AuthRequest {
  password: string;
}

export interface AuthResponse {
  success: boolean;
  error?: string;
}
