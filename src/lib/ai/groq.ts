// Use fetch directly to avoid ESM module issues on Windows
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

function getApiKey(): string {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY ortam değişkeni tanımlanmamış. Lütfen .env.local dosyasına ekleyin.');
  }
  return apiKey;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GenerateOptions {
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
}

export async function generateWithGroq(options: GenerateOptions): Promise<string> {
  const { prompt, systemPrompt, maxTokens = 4096, temperature = 0.7 } = options;

  const messages: ChatMessage[] = [];

  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }

  messages.push({ role: 'user', content: prompt });

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getApiKey()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        max_tokens: maxTokens,
        temperature,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 401) {
        throw new Error('Geçersiz GROQ API anahtarı. Lütfen .env.local dosyasındaki GROQ_API_KEY değerini kontrol edin.');
      }
      if (response.status === 429) {
        throw new Error('API istek limiti aşıldı. Lütfen birkaç dakika bekleyip tekrar deneyin.');
      }
      throw new Error(errorData.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  } catch (error: any) {
    console.error('Groq API error:', error);
    if (error.message.includes('GROQ_API_KEY') || error.message.includes('API')) {
      throw error;
    }
    throw new Error(`AI içerik oluşturma hatası: ${error.message || 'Bilinmeyen hata'}`);
  }
}

export async function generateSEOContent(params: {
  topic: string;
  mainKeyword: string;
  competitorContents: string[];
  wordCount: number;
  searchIntent: string;
  language?: string;
}) {
  const systemPrompt = `You are a professional SEO content writer. Your task is to create high-quality, SEO-optimized content in Turkish language.

Rules:
1. Content must be 100% original - never copy from competitors
2. Naturally incorporate the main keyword (density: 1-2%)
3. Maintain proper H1, H2, H3 heading hierarchy
4. Optimize for featured snippets
5. Include LSI (semantically related) keywords
6. Write approximately ${params.wordCount} words
7. Use professional but engaging tone
8. Follow Turkish grammar rules perfectly`;

  const competitorContext = params.competitorContents
    .map((c, i) => `--- Competitor ${i + 1} ---\n${c.substring(0, 2000)}`)
    .join('\n\n');

  const prompt = `Topic: ${params.topic}
Main Keyword: ${params.mainKeyword}
Search Intent: ${params.searchIntent}
Target Word Count: ${params.wordCount}

Competitor Contents (for reference only - DO NOT COPY):
${competitorContext}

Please generate content in the following JSON format:
{
  "meta": {
    "title": "SEO title (max 60 chars)",
    "description": "Meta description (max 155 chars)",
    "slug": "url-friendly-slug"
  },
  "headings": {
    "h1": "Main heading",
    "h2": ["Subheading 1", "Subheading 2", ...],
    "h3": ["Sub-subheading 1", ...]
  },
  "content": "Full article content in Markdown format",
  "lsiKeywords": ["keyword1", "keyword2", ...],
  "featuredSnippet": "Optimized paragraph for position zero",
  "imageAltSuggestions": ["alt text 1", "alt text 2", ...]
}`;

  const response = await generateWithGroq({
    prompt,
    systemPrompt,
    maxTokens: 4096,
    temperature: 0.7,
  });

  // Parse JSON response
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error('Failed to parse AI response:', e);
  }

  return { raw: response };
}

export async function generateMetaTags(params: {
  title: string;
  content: string;
  mainKeyword: string;
}) {
  const prompt = `Based on the following content, generate SEO-optimized meta tags in Turkish.

Title: ${params.title}
Main Keyword: ${params.mainKeyword}
Content Summary: ${params.content.substring(0, 1000)}

Generate in JSON format:
{
  "metaTitle": "SEO title (max 60 chars, include main keyword)",
  "metaDescription": "Meta description (max 155 chars, compelling and keyword-rich)",
  "slug": "url-friendly-slug"
}`;

  const response = await generateWithGroq({
    prompt,
    maxTokens: 500,
    temperature: 0.5,
  });

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error('Failed to parse meta tags response:', e);
  }

  return null;
}

export async function generateFAQs(params: { topic: string; mainKeyword: string; count?: number }) {
  const prompt = `Generate ${params.count || 5} frequently asked questions (FAQs) about "${params.topic}" with the main keyword "${params.mainKeyword}".

The FAQs should be:
1. Natural questions people would actually ask
2. In Turkish language
3. SEO-optimized
4. With comprehensive answers

Return in JSON format:
{
  "faqs": [
    {"question": "...", "answer": "..."},
    ...
  ]
}`;

  const response = await generateWithGroq({
    prompt,
    maxTokens: 2000,
    temperature: 0.6,
  });

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error('Failed to parse FAQs response:', e);
  }

  return { faqs: [] };
}

export async function improveContent(params: { content: string; instruction: string }) {
  const prompt = `Improve the following content based on this instruction: "${params.instruction}"

Original Content:
${params.content}

Return the improved content in Markdown format.`;

  const response = await generateWithGroq({
    prompt,
    maxTokens: 4096,
    temperature: 0.6,
  });

  return response;
}

export async function generateOutline(params: { topic: string; mainKeyword: string }) {
  const prompt = `Create a detailed content outline for an SEO article about "${params.topic}" targeting the keyword "${params.mainKeyword}".

The outline should include:
1. H1 (main title)
2. H2 sections (main points)
3. H3 subsections where appropriate
4. Brief notes on what each section should cover

Return in JSON format:
{
  "h1": "Main title",
  "sections": [
    {
      "h2": "Section title",
      "notes": "What to cover",
      "subsections": [
        {"h3": "Subsection title", "notes": "What to cover"}
      ]
    }
  ]
}`;

  const response = await generateWithGroq({
    prompt,
    maxTokens: 1500,
    temperature: 0.7,
  });

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error('Failed to parse outline response:', e);
  }

  return null;
}
