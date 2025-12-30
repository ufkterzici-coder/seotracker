export const SYSTEM_PROMPTS = {
  seoWriter: `You are a professional SEO content writer specializing in Turkish content. Your writing is:
- Highly engaging and reader-friendly
- Optimized for search engines without keyword stuffing
- Structured with proper heading hierarchy (H1, H2, H3)
- Rich with valuable information and examples
- Following Turkish grammar and style conventions perfectly`,

  metaOptimizer: `You are an SEO specialist focused on crafting compelling meta titles and descriptions that:
- Maximize click-through rates
- Include target keywords naturally
- Stay within character limits (60 chars for title, 155 for description)
- Create urgency or curiosity
- Match search intent`,

  contentAnalyzer: `You are an SEO analyst who evaluates content for:
- Keyword optimization
- Readability and engagement
- Heading structure
- Internal linking opportunities
- Featured snippet potential`,
};

export const CONTENT_PROMPTS = {
  blogPost: (params: { topic: string; keyword: string; wordCount: number }) => `
Write a comprehensive blog post about "${params.topic}" targeting the keyword "${params.keyword}".

Requirements:
- Word count: approximately ${params.wordCount} words
- Include an engaging introduction with a hook
- Use H2 and H3 headings to structure content
- Add practical examples and actionable tips
- Include a FAQ section with 3-5 questions
- End with a compelling conclusion and CTA
- Naturally incorporate the keyword (1-2% density)

Return in Markdown format.`,

  productReview: (params: { product: string; keyword: string }) => `
Write a comprehensive product review for "${params.product}" targeting the keyword "${params.keyword}".

Structure:
1. Introduction and overview
2. Key features and specifications
3. Pros and cons (in bullet points)
4. User experience and testing
5. Price and value analysis
6. Comparison with alternatives
7. Final verdict and rating
8. FAQ section

Requirements:
- Be objective and balanced
- Include specific details and examples
- Add trust-building elements
- Optimize for featured snippets

Return in Markdown format.`,

  howToGuide: (params: { task: string; keyword: string }) => `
Create a step-by-step how-to guide for "${params.task}" targeting the keyword "${params.keyword}".

Structure:
1. Introduction explaining what will be learned
2. Prerequisites or requirements
3. Step-by-step instructions (numbered)
4. Tips and best practices
5. Common mistakes to avoid
6. Troubleshooting section
7. Conclusion

Requirements:
- Clear, actionable steps
- Each step should be detailed but concise
- Include helpful tips within steps
- Optimize for featured snippets (position zero)

Return in Markdown format.`,

  listArticle: (params: { topic: string; keyword: string; itemCount: number }) => `
Write a listicle article: "${params.itemCount} Best ${params.topic}" targeting the keyword "${params.keyword}".

Structure:
1. Introduction (why this list matters)
2. ${params.itemCount} items, each with:
   - H2 heading with item name/number
   - Description (100-200 words)
   - Key benefits or features
   - Potential drawbacks
3. Conclusion with summary and recommendations

Requirements:
- Start with the best/most important items
- Make each item scannable
- Include practical insights
- Add comparison elements

Return in Markdown format.`,
};

export const META_PROMPTS = {
  title: (params: { topic: string; keyword: string }) => `
Generate 5 SEO-optimized title options for an article about "${params.topic}" with keyword "${params.keyword}".

Each title should:
- Be under 60 characters
- Include the keyword naturally
- Be compelling and click-worthy
- Use power words when appropriate

Return as JSON array: ["Title 1", "Title 2", ...]`,

  description: (params: { title: string; keyword: string; content: string }) => `
Generate a meta description for:
Title: ${params.title}
Keyword: ${params.keyword}
Content Summary: ${params.content.substring(0, 500)}

Requirements:
- Under 155 characters
- Include the keyword naturally
- Create curiosity or urgency
- Include a subtle CTA

Return only the meta description text.`,
};

export const ANALYSIS_PROMPTS = {
  contentGap: (params: { myContent: string; competitorContent: string }) => `
Analyze the gap between my content and competitor content:

My Content:
${params.myContent.substring(0, 1500)}

Competitor Content:
${params.competitorContent.substring(0, 1500)}

Identify:
1. Topics covered by competitor but missing in my content
2. Keywords competitor is targeting that I'm not
3. Content depth differences
4. Structural improvements needed

Return in JSON format:
{
  "missingTopics": [...],
  "missingKeywords": [...],
  "depthIssues": [...],
  "structuralSuggestions": [...]
}`,

  featuredSnippet: (params: { keyword: string; content: string }) => `
Optimize this content section for featured snippet position for keyword "${params.keyword}":

${params.content.substring(0, 1000)}

Provide:
1. A definition-style paragraph (40-60 words)
2. A bulleted list version (5-7 items)
3. A table format if applicable

Return in JSON format:
{
  "definitionParagraph": "...",
  "bulletedList": ["item1", "item2", ...],
  "tableData": null or {headers: [...], rows: [[...]]}
}`,
};
