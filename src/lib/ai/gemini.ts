import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function generateImagePrompt(topic: string, style?: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `Create a detailed image generation prompt for a blog post thumbnail about: "${topic}"

  Style: ${style || 'professional, modern, clean'}

  The prompt should be suitable for AI image generators like DALL-E or Midjourney.
  Return ONLY the image prompt, nothing else.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function analyzeImageForAlt(imageUrl: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `Analyze this image and provide an SEO-optimized alt text description in Turkish.
  The alt text should be:
  - Descriptive but concise (max 125 characters)
  - Include relevant keywords naturally
  - Accessible for screen readers

  Image URL: ${imageUrl}

  Return ONLY the alt text, nothing else.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function generateContentIdeas(params: {
  niche: string;
  mainTopic: string;
  count?: number;
}): Promise<string[]> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `Generate ${params.count || 10} SEO-friendly content ideas for the ${params.niche} niche, related to "${params.mainTopic}".

  Each idea should be:
  1. A potential article title
  2. In Turkish language
  3. Targeting a specific keyword
  4. Answering a user intent

  Return as a JSON array of strings:
  ["Title 1", "Title 2", ...]`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error('Failed to parse content ideas:', e);
  }

  return [];
}

export async function analyzeCompetitorContent(content: string): Promise<{
  strengths: string[];
  weaknesses: string[];
  keywords: string[];
  suggestions: string[];
}> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `Analyze this competitor content from an SEO perspective:

${content.substring(0, 3000)}

Provide analysis in JSON format:
{
  "strengths": ["strength1", "strength2", ...],
  "weaknesses": ["weakness1", "weakness2", ...],
  "keywords": ["keyword1", "keyword2", ...],
  "suggestions": ["suggestion1", "suggestion2", ...]
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error('Failed to parse competitor analysis:', e);
  }

  return { strengths: [], weaknesses: [], keywords: [], suggestions: [] };
}

export async function rewriteForSEO(params: {
  content: string;
  targetKeyword: string;
  tone?: string;
}): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `Rewrite the following content for better SEO performance.

Target Keyword: ${params.targetKeyword}
Tone: ${params.tone || 'professional'}

Original Content:
${params.content}

Requirements:
1. Naturally include the target keyword (1-2% density)
2. Improve readability
3. Maintain the original meaning
4. Use proper heading structure
5. Keep it in Turkish

Return the rewritten content in Markdown format.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function generateSchemaRecommendation(params: {
  contentType: string;
  title: string;
  description: string;
}): Promise<{
  recommendedSchemas: string[];
  primarySchema: string;
  reason: string;
}> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `Based on this content, recommend appropriate Schema.org markup types:

Content Type: ${params.contentType}
Title: ${params.title}
Description: ${params.description}

Return in JSON format:
{
  "recommendedSchemas": ["Article", "FAQPage", ...],
  "primarySchema": "Article",
  "reason": "Why this schema is best"
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error('Failed to parse schema recommendation:', e);
  }

  return {
    recommendedSchemas: ['Article'],
    primarySchema: 'Article',
    reason: 'Default recommendation',
  };
}
