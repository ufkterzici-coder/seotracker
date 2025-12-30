export interface ArticleSchemaInput {
  title: string;
  description: string;
  content: string;
  authorName: string;
  publishDate: string;
  modifiedDate?: string;
  imageUrl?: string;
  url: string;
  organizationName?: string;
  organizationLogo?: string;
  keywords?: string[];
}

export function generateArticleSchema(input: ArticleSchemaInput): object {
  const wordCount = input.content.split(/\s+/).filter((w) => w.length > 0).length;

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.title,
    description: input.description,
    image: input.imageUrl || undefined,
    author: {
      '@type': 'Person',
      name: input.authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: input.organizationName || 'SEO Content Panel',
      logo: input.organizationLogo
        ? {
            '@type': 'ImageObject',
            url: input.organizationLogo,
          }
        : undefined,
    },
    datePublished: input.publishDate,
    dateModified: input.modifiedDate || input.publishDate,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': input.url,
    },
    wordCount,
    keywords: input.keywords?.join(', '),
  };
}

export function generateNewsArticleSchema(
  input: ArticleSchemaInput & { dateline?: string }
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: input.title,
    description: input.description,
    image: input.imageUrl,
    author: {
      '@type': 'Person',
      name: input.authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: input.organizationName || 'News Publisher',
      logo: {
        '@type': 'ImageObject',
        url: input.organizationLogo || '',
      },
    },
    datePublished: input.publishDate,
    dateModified: input.modifiedDate || input.publishDate,
    mainEntityOfPage: input.url,
    dateline: input.dateline,
  };
}

export function generateBlogPostSchema(input: ArticleSchemaInput): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: input.title,
    description: input.description,
    image: input.imageUrl,
    author: {
      '@type': 'Person',
      name: input.authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: input.organizationName || 'Blog',
      logo: input.organizationLogo
        ? {
            '@type': 'ImageObject',
            url: input.organizationLogo,
          }
        : undefined,
    },
    datePublished: input.publishDate,
    dateModified: input.modifiedDate || input.publishDate,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': input.url,
    },
    wordCount: input.content.split(/\s+/).filter((w) => w.length > 0).length,
    keywords: input.keywords?.join(', '),
    articleBody: input.content.substring(0, 1000),
  };
}
