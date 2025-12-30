export const META_PROMPTS = {
  title: `Generate an SEO-optimized meta title that:
- Is under 60 characters
- Includes the main keyword naturally
- Is compelling and encourages clicks
- Uses power words when appropriate
- Matches the search intent`,

  description: `Generate an SEO-optimized meta description that:
- Is between 120-155 characters
- Includes the main keyword naturally
- Creates curiosity or urgency
- Includes a subtle call-to-action
- Accurately summarizes the content`,

  slug: `Generate a URL-friendly slug that:
- Is short and descriptive
- Includes the main keyword
- Uses hyphens to separate words
- Is lowercase
- Avoids stop words when possible`,
};

export const META_TEMPLATES = {
  blog: {
    title: '[Keyword]: [Benefit/Promise] | [Brand]',
    description:
      '[Compelling hook about the topic]. [What they will learn/gain]. [CTA like "Hemen okuyun!"]',
  },
  product: {
    title: '[Product Name] - [Key Feature] | [Price/Offer] | [Brand]',
    description:
      '[Product benefit]. [Key features]. [Trust signal]. [CTA like "Hemen satın alın!"]',
  },
  howto: {
    title: '[Keyword] Nasıl Yapılır? [Year] Rehberi | [Brand]',
    description:
      'Adım adım [keyword] rehberi. [What they will achieve]. [Time/difficulty]. [CTA]',
  },
  listicle: {
    title: '[Number] En İyi [Keyword] [Year] | [Brand]',
    description:
      '[Year] için en iyi [keyword] listesi. [What makes it special]. [CTA]',
  },
};

export function generateMetaPrompt(type: keyof typeof META_TEMPLATES, params: {
  keyword: string;
  topic: string;
  brand?: string;
  year?: number;
}) {
  const template = META_TEMPLATES[type];
  const { keyword, topic, brand = 'SEO Panel', year = new Date().getFullYear() } = params;

  return {
    title: template.title
      .replace('[Keyword]', keyword)
      .replace('[Brand]', brand)
      .replace('[Year]', year.toString()),
    description: template.description
      .replace(/\[keyword\]/gi, keyword)
      .replace('[Year]', year.toString()),
  };
}
