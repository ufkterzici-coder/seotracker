export const schema = `
CREATE TABLE IF NOT EXISTS contents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT,
    meta_title TEXT,
    meta_description TEXT,
    content TEXT,
    html_content TEXT,
    main_keyword TEXT,
    lsi_keywords TEXT,
    search_intent TEXT,
    headings TEXT,
    schema_markup TEXT,
    readability_score REAL,
    seo_score REAL,
    word_count INTEGER,
    competitor_urls TEXT,
    competitor_data TEXT,
    featured_image TEXT,
    image_alt_text TEXT,
    status TEXT DEFAULT 'draft',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    structure TEXT,
    prompts TEXT,
    is_default INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS scraped_cache (
    id TEXT PRIMARY KEY,
    url TEXT UNIQUE NOT NULL,
    title TEXT,
    content TEXT,
    headings TEXT,
    word_count INTEGER,
    scraped_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME
);

CREATE INDEX IF NOT EXISTS idx_contents_status ON contents(status);
CREATE INDEX IF NOT EXISTS idx_contents_created ON contents(created_at);
CREATE INDEX IF NOT EXISTS idx_scraped_url ON scraped_cache(url);
`;

export const defaultTemplates = [
  {
    id: 'template-blog-post',
    name: 'Blog Post',
    description: 'Standard blog post template with introduction, body, and conclusion',
    structure: JSON.stringify({
      sections: ['introduction', 'main_points', 'examples', 'conclusion', 'faq'],
      minWords: 1500,
      maxWords: 2500,
    }),
    prompts: JSON.stringify({
      tone: 'professional yet engaging',
      style: 'informative with practical examples',
    }),
    is_default: 1,
  },
  {
    id: 'template-product-review',
    name: 'Product Review',
    description: 'Product review template with pros, cons, and verdict',
    structure: JSON.stringify({
      sections: ['overview', 'features', 'pros', 'cons', 'verdict', 'alternatives'],
      minWords: 1200,
      maxWords: 2000,
    }),
    prompts: JSON.stringify({
      tone: 'objective and helpful',
      style: 'detailed analysis with practical insights',
    }),
    is_default: 0,
  },
  {
    id: 'template-how-to-guide',
    name: 'How-To Guide',
    description: 'Step-by-step tutorial template',
    structure: JSON.stringify({
      sections: ['introduction', 'prerequisites', 'steps', 'tips', 'troubleshooting', 'conclusion'],
      minWords: 1000,
      maxWords: 2000,
    }),
    prompts: JSON.stringify({
      tone: 'instructional and clear',
      style: 'step-by-step with visual descriptions',
    }),
    is_default: 0,
  },
  {
    id: 'template-listicle',
    name: 'Listicle',
    description: 'List-based article template',
    structure: JSON.stringify({
      sections: ['introduction', 'list_items', 'conclusion'],
      minWords: 1500,
      maxWords: 3000,
    }),
    prompts: JSON.stringify({
      tone: 'engaging and scannable',
      style: 'numbered list with detailed explanations',
    }),
    is_default: 0,
  },
];
