export const ANALYSIS_PROMPTS = {
  competitorAnalysis: `Analyze the competitor content and identify:
1. Main topics covered
2. Keywords being targeted
3. Content structure (headings, lists, etc.)
4. Strengths to learn from
5. Weaknesses to exploit
6. Content gaps we can fill`,

  contentGap: `Compare our content with competitor content and identify:
1. Topics they cover that we don't
2. Keywords they target that we miss
3. Questions they answer that we don't
4. Depth differences in coverage
5. Opportunities for us to provide better content`,

  featuredSnippet: `Optimize this content section for featured snippet position:
1. Provide a clear, concise definition (40-60 words)
2. Create a bulleted list version (5-7 items)
3. Format as a step-by-step guide if applicable
4. Include the target keyword naturally
5. Answer the question directly and completely`,

  intentMatch: `Analyze how well this content matches the search intent:
1. Identify the primary search intent
2. Rate intent match (0-100)
3. Suggest improvements for better intent matching
4. Recommend content format changes
5. Identify missing elements for the intent`,
};

export const COMPETITOR_ANALYSIS_TEMPLATE = `
## Rakip Analizi: {competitor_url}

### Genel Bakış
- **Kelime Sayısı:** {word_count}
- **Başlık Yapısı:** {heading_count} başlık
- **Okunabilirlik:** {readability_score}

### Güçlü Yönler
{strengths}

### Zayıf Yönler
{weaknesses}

### Hedeflenen Anahtar Kelimeler
{keywords}

### İçerik Yapısı
{structure}

### Öneriler
{suggestions}
`;

export function buildCompetitorAnalysisPrompt(urls: string[]): string {
  return `Analyze these competitor URLs and provide a comprehensive SEO analysis:

URLs to analyze:
${urls.map((url, i) => `${i + 1}. ${url}`).join('\n')}

For each competitor, identify:
1. Content topic and main keyword focus
2. Heading structure and content organization
3. Estimated word count and content depth
4. Strengths we should learn from
5. Weaknesses we can exploit
6. Unique angles or information they provide

Finally, provide recommendations for creating superior content that:
- Covers all important topics from competitors
- Fills content gaps
- Provides unique value
- Is better optimized for SEO

Return the analysis in a structured JSON format.`;
}
