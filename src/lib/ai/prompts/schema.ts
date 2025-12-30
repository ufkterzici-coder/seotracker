export const SCHEMA_PROMPTS = {
  article: `Generate Article schema markup for this content:
- Include headline, description, author, dates
- Add image if available
- Include word count and keywords
- Use proper JSON-LD format`,

  faq: `Extract FAQ pairs from this content and generate FAQPage schema:
- Find all question-answer pairs
- Format as proper FAQ schema
- Ensure answers are comprehensive
- Use proper JSON-LD format`,

  howto: `Generate HowTo schema markup for this content:
- Extract step-by-step instructions
- Include estimated time if mentioned
- Add tools/supplies if applicable
- Use proper JSON-LD format`,

  product: `Generate Product schema markup for this content:
- Include name, description, image
- Add price and availability
- Include ratings if available
- Use proper JSON-LD format`,

  breadcrumb: `Generate BreadcrumbList schema for this page:
- Include all navigation levels
- Use proper position ordering
- Include item URLs
- Use proper JSON-LD format`,
};

export const SCHEMA_TEMPLATES = {
  organization: (data: { name: string; url: string; logo?: string; sameAs?: string[] }) => ({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: data.name,
    url: data.url,
    logo: data.logo,
    sameAs: data.sameAs,
  }),

  website: (data: { name: string; url: string; searchUrl?: string }) => ({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: data.name,
    url: data.url,
    potentialAction: data.searchUrl
      ? {
          '@type': 'SearchAction',
          target: `${data.searchUrl}?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        }
      : undefined,
  }),

  breadcrumb: (items: { name: string; url: string }[]) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }),

  localBusiness: (data: {
    name: string;
    address: {
      street: string;
      city: string;
      region: string;
      postalCode: string;
      country: string;
    };
    phone: string;
    url: string;
    openingHours?: string[];
  }) => ({
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: data.name,
    address: {
      '@type': 'PostalAddress',
      streetAddress: data.address.street,
      addressLocality: data.address.city,
      addressRegion: data.address.region,
      postalCode: data.address.postalCode,
      addressCountry: data.address.country,
    },
    telephone: data.phone,
    url: data.url,
    openingHours: data.openingHours,
  }),
};

export function generateMultipleSchemas(schemas: object[]): string {
  if (schemas.length === 1) {
    return `<script type="application/ld+json">
${JSON.stringify(schemas[0], null, 2)}
</script>`;
  }

  return `<script type="application/ld+json">
${JSON.stringify(schemas, null, 2)}
</script>`;
}
