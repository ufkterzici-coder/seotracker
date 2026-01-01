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
  secondaryKeywords?: string[];
  competitorContents: string[];
  wordCount: number;
  searchIntent: string;
  language?: string;
}) {
  const keywordsList = params.secondaryKeywords?.length
    ? `Main Keyword: ${params.mainKeyword}\nSecondary Keywords: ${params.secondaryKeywords.join(', ')}`
    : `Main Keyword: ${params.mainKeyword}`;

  const systemPrompt = `Sen profesyonel bir SEO içerik yazarısın. Görevin Türkçe dilinde yüksek kaliteli, SEO uyumlu içerik oluşturmak.

Kurallar:
1. İçerik %100 özgün olmalı - rakiplerden kopyalama
2. Ana anahtar kelimeyi doğal şekilde kullan (yoğunluk: %1-2)
3. İkincil anahtar kelimeleri de içerikte kullan
4. Düzgün H1, H2, H3 başlık hiyerarşisi kullan
5. Featured snippet için optimize et
6. LSI (semantik olarak ilişkili) anahtar kelimeler ekle
7. Yaklaşık ${params.wordCount} kelime yaz
8. Profesyonel ama ilgi çekici ton kullan
9. Türkçe dilbilgisi kurallarına uy
10. SADECE JSON formatında yanıt ver, başka açıklama ekleme`;

  const competitorContext = params.competitorContents.length > 0
    ? params.competitorContents
        .map((c, i) => `--- Rakip ${i + 1} ---\n${c.substring(0, 1500)}`)
        .join('\n\n')
    : 'Rakip içerik yok';

  const prompt = `Konu: ${params.topic}
${keywordsList}
Arama Niyeti: ${params.searchIntent}
Hedef Kelime Sayısı: ${params.wordCount}

Rakip İçerikler (sadece referans için - KOPYALAMA):
${competitorContext}

Aşağıdaki JSON formatında içerik oluştur (SADECE JSON döndür, başka bir şey yazma):
{
  "meta": {
    "title": "SEO başlığı (max 60 karakter, ana anahtar kelimeyi içermeli)",
    "description": "Meta açıklama (max 155 karakter, dikkat çekici ve anahtar kelime içeren)",
    "slug": "url-uyumlu-slug"
  },
  "headings": {
    "h1": "Ana başlık",
    "h2": ["Alt başlık 1", "Alt başlık 2"],
    "h3": ["Alt-alt başlık 1"]
  },
  "content": "Markdown formatında tam makale içeriği...",
  "lsiKeywords": ["ilişkili kelime 1", "ilişkili kelime 2", "ilişkili kelime 3", "ilişkili kelime 4", "ilişkili kelime 5"],
  "featuredSnippet": "Google sıfır pozisyonu için optimize edilmiş paragraf",
  "imageAltSuggestions": ["görsel alt text 1", "görsel alt text 2"]
}`;

  const response = await generateWithGroq({
    prompt,
    systemPrompt,
    maxTokens: 4096,
    temperature: 0.7,
  });

  console.log('Raw AI response:', response.substring(0, 500));

  // Parse JSON response - try multiple methods
  try {
    // Method 1: Direct JSON parse
    const cleaned = response.trim();
    if (cleaned.startsWith('{')) {
      try {
        return JSON.parse(cleaned);
      } catch {}
    }

    // Method 2: Extract JSON from markdown code block
    const codeBlockMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      try {
        return JSON.parse(codeBlockMatch[1].trim());
      } catch {}
    }

    // Method 3: Find JSON object in response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {}
    }

    console.error('Failed to parse AI response as JSON');
  } catch (e) {
    console.error('Failed to parse AI response:', e);
  }

  // Return raw response with default structure if parsing fails
  return {
    meta: {
      title: params.topic.substring(0, 60),
      description: `${params.topic} hakkında kapsamlı rehber. ${params.mainKeyword} ile ilgili bilmeniz gereken her şey.`.substring(0, 155),
      slug: params.topic.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').substring(0, 50),
    },
    headings: {
      h1: params.topic,
      h2: [],
      h3: [],
    },
    content: response,
    lsiKeywords: [params.mainKeyword],
    featuredSnippet: '',
    imageAltSuggestions: [],
  };
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

export interface SEOIssue {
  type: 'error' | 'warning' | 'info';
  category: string;
  message: string;
  suggestion: string;
}

export async function fixSEOIssues(params: {
  content: string;
  title: string;
  metaTitle?: string;
  metaDescription?: string;
  mainKeyword: string;
  issues: SEOIssue[];
}) {
  const issuesList = params.issues
    .map((issue, i) => `${i + 1}. [${issue.category}] ${issue.message} - Öneri: ${issue.suggestion}`)
    .join('\n');

  const systemPrompt = `Sen bir SEO uzmanısın. Verilen içeriği SEO sorunlarını düzelterek optimize et.
Kurallar:
1. İçeriğin anlamını koru
2. Türkçe dilbilgisine uy
3. Ana anahtar kelimeyi doğal kullan (%1-2 yoğunluk)
4. Başlık yapısını düzelt (H1, H2, H3)
5. Meta bilgilerini optimize et
6. SADECE JSON döndür`;

  const prompt = `Mevcut İçerik:
${params.content.substring(0, 3000)}

Başlık: ${params.title}
Meta Başlık: ${params.metaTitle || 'Yok'}
Meta Açıklama: ${params.metaDescription || 'Yok'}
Ana Anahtar Kelime: ${params.mainKeyword}

Tespit Edilen SEO Sorunları:
${issuesList}

Bu sorunları düzelterek içeriği yeniden oluştur. JSON formatında döndür:
{
  "meta": {
    "title": "Optimize edilmiş SEO başlığı (max 60 karakter)",
    "description": "Optimize edilmiş meta açıklama (max 155 karakter)",
    "slug": "optimize-edilmis-slug"
  },
  "content": "SEO optimize edilmiş tam içerik...",
  "headings": {
    "h1": "Ana başlık",
    "h2": ["Alt başlık 1", "Alt başlık 2"],
    "h3": []
  },
  "fixedIssues": ["Düzeltilen sorun 1", "Düzeltilen sorun 2"]
}`;

  const response = await generateWithGroq({
    prompt,
    systemPrompt,
    maxTokens: 4096,
    temperature: 0.5,
  });

  try {
    const cleaned = response.trim();
    if (cleaned.startsWith('{')) {
      return JSON.parse(cleaned);
    }

    const codeBlockMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      return JSON.parse(codeBlockMatch[1].trim());
    }

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error('Failed to parse SEO fix response:', e);
  }

  return null;
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
