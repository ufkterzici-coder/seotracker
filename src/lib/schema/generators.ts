// JSON-LD Schema Markup Generators

export interface ArticleSchemaInput {
  title: string;
  description: string;
  content: string;
  author?: string;
  datePublished?: string;
  dateModified?: string;
  imageUrl?: string;
  url?: string;
  keywords?: string[];
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface HowToStep {
  name: string;
  text: string;
  imageUrl?: string;
}

export interface HowToSchemaInput {
  name: string;
  description: string;
  steps: HowToStep[];
  totalTime?: string;
  estimatedCost?: {
    currency: string;
    value: string;
  };
  supply?: string[];
  tool?: string[];
  imageUrl?: string;
}

export function generateArticleSchema(input: ArticleSchemaInput): object {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.title,
    description: input.description,
    articleBody: input.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(),
  };

  if (input.author) {
    schema.author = {
      '@type': 'Person',
      name: input.author,
    };
  }

  if (input.datePublished) {
    schema.datePublished = input.datePublished;
  }

  if (input.dateModified) {
    schema.dateModified = input.dateModified;
  }

  if (input.imageUrl) {
    schema.image = input.imageUrl;
  }

  if (input.url) {
    schema.mainEntityOfPage = {
      '@type': 'WebPage',
      '@id': input.url,
    };
  }

  if (input.keywords && input.keywords.length > 0) {
    schema.keywords = input.keywords.join(', ');
  }

  return schema;
}

export function generateFAQSchema(items: FAQItem[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function generateHowToSchema(input: HowToSchemaInput): object {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: input.name,
    description: input.description,
    step: input.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      ...(step.imageUrl && { image: step.imageUrl }),
    })),
  };

  if (input.totalTime) {
    schema.totalTime = input.totalTime;
  }

  if (input.estimatedCost) {
    schema.estimatedCost = {
      '@type': 'MonetaryAmount',
      currency: input.estimatedCost.currency,
      value: input.estimatedCost.value,
    };
  }

  if (input.supply && input.supply.length > 0) {
    schema.supply = input.supply.map((s) => ({
      '@type': 'HowToSupply',
      name: s,
    }));
  }

  if (input.tool && input.tool.length > 0) {
    schema.tool = input.tool.map((t) => ({
      '@type': 'HowToTool',
      name: t,
    }));
  }

  if (input.imageUrl) {
    schema.image = input.imageUrl;
  }

  return schema;
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateWebPageSchema(input: {
  title: string;
  description: string;
  url?: string;
  datePublished?: string;
  dateModified?: string;
}): object {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: input.title,
    description: input.description,
  };

  if (input.url) {
    schema.url = input.url;
  }

  if (input.datePublished) {
    schema.datePublished = input.datePublished;
  }

  if (input.dateModified) {
    schema.dateModified = input.dateModified;
  }

  return schema;
}

// Helper to format schema as script tag
export function formatSchemaAsScript(schema: object): string {
  return `<script type="application/ld+json">
${JSON.stringify(schema, null, 2)}
</script>`;
}

// Combine multiple schemas
export function combineSchemas(schemas: object[]): object {
  if (schemas.length === 1) {
    return schemas[0];
  }

  return {
    '@context': 'https://schema.org',
    '@graph': schemas.map((s) => {
      const { '@context': _, ...rest } = s as any;
      return rest;
    }),
  };
}

// Extract FAQ items from content (simple pattern matching)
export function extractFAQFromContent(content: string): FAQItem[] {
  const items: FAQItem[] = [];

  // Match patterns like "Soru: ... Cevap: ..." or "Q: ... A: ..."
  const qaPattern = /(?:soru|question|q)\s*[:\-]?\s*(.+?)(?:cevap|answer|a)\s*[:\-]?\s*(.+?)(?=(?:soru|question|q)\s*[:\-]?|$)/gi;

  let match;
  while ((match = qaPattern.exec(content)) !== null) {
    items.push({
      question: match[1].trim(),
      answer: match[2].trim(),
    });
  }

  // Also try to extract from HTML heading + paragraph structure
  const htmlPattern = /<h[2-4][^>]*>(.+?)<\/h[2-4]>\s*<p[^>]*>(.+?)<\/p>/gi;

  while ((match = htmlPattern.exec(content)) !== null) {
    const heading = match[1].replace(/<[^>]*>/g, '').trim();
    const para = match[2].replace(/<[^>]*>/g, '').trim();

    // Only include if heading ends with ? (likely a question)
    if (heading.endsWith('?')) {
      items.push({
        question: heading,
        answer: para,
      });
    }
  }

  return items;
}

// Extract HowTo steps from content
export function extractHowToFromContent(content: string): HowToStep[] {
  const steps: HowToStep[] = [];

  // Match numbered lists
  const numberedPattern = /(?:^|\n)\s*(\d+)[.)]\s*(.+?)(?=\n\s*\d+[.)]|\n\n|$)/g;

  let match;
  while ((match = numberedPattern.exec(content)) !== null) {
    const text = match[2].replace(/<[^>]*>/g, '').trim();
    if (text.length > 10) {
      steps.push({
        name: `Adım ${match[1]}`,
        text,
      });
    }
  }

  // Also try HTML ordered lists
  const liPattern = /<li[^>]*>(.+?)<\/li>/gi;
  let stepNum = 1;

  while ((match = liPattern.exec(content)) !== null) {
    const text = match[1].replace(/<[^>]*>/g, '').trim();
    if (text.length > 10) {
      steps.push({
        name: `Adım ${stepNum++}`,
        text,
      });
    }
  }

  return steps;
}
