import { getDatabase } from './index';
import { Content, Template, ScrapedCache } from '@/types/content';
import { nanoid } from 'nanoid';

// Content queries
export function getAllContents(status?: string): Content[] {
  const db = getDatabase();
  if (status) {
    const stmt = db.prepare('SELECT * FROM contents WHERE status = ? ORDER BY created_at DESC');
    return stmt.all(status) as Content[];
  }
  const stmt = db.prepare('SELECT * FROM contents ORDER BY created_at DESC');
  return stmt.all() as Content[];
}

export function getContentById(id: string): Content | undefined {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM contents WHERE id = ?');
  return stmt.get(id) as Content | undefined;
}

export function createContent(data: Partial<Content>): Content {
  const db = getDatabase();
  const id = data.id || nanoid();
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO contents (
      id, title, slug, meta_title, meta_description, content, html_content,
      main_keyword, lsi_keywords, search_intent, headings, schema_markup,
      readability_score, seo_score, word_count, competitor_urls, competitor_data,
      featured_image, image_alt_text, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    data.title || 'Untitled',
    data.slug || null,
    data.meta_title || null,
    data.meta_description || null,
    data.content || null,
    data.html_content || null,
    data.main_keyword || null,
    data.lsi_keywords || null,
    data.search_intent || null,
    data.headings || null,
    data.schema_markup || null,
    data.readability_score || null,
    data.seo_score || null,
    data.word_count || null,
    data.competitor_urls || null,
    data.competitor_data || null,
    data.featured_image || null,
    data.image_alt_text || null,
    data.status || 'draft',
    now,
    now
  );

  return getContentById(id)!;
}

export function updateContent(id: string, data: Partial<Content>): Content | undefined {
  const db = getDatabase();
  const existing = getContentById(id);
  if (!existing) return undefined;

  const updates: string[] = [];
  const values: unknown[] = [];

  const fields = [
    'title', 'slug', 'meta_title', 'meta_description', 'content', 'html_content',
    'main_keyword', 'lsi_keywords', 'search_intent', 'headings', 'schema_markup',
    'readability_score', 'seo_score', 'word_count', 'competitor_urls', 'competitor_data',
    'featured_image', 'image_alt_text', 'status'
  ];

  for (const field of fields) {
    if (field in data) {
      updates.push(`${field} = ?`);
      values.push((data as Record<string, unknown>)[field]);
    }
  }

  if (updates.length === 0) return existing;

  updates.push('updated_at = ?');
  values.push(new Date().toISOString());
  values.push(id);

  const stmt = db.prepare(`UPDATE contents SET ${updates.join(', ')} WHERE id = ?`);
  stmt.run(...values);

  return getContentById(id);
}

export function deleteContent(id: string): boolean {
  const db = getDatabase();
  const stmt = db.prepare('DELETE FROM contents WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

// Template queries
export function getAllTemplates(): Template[] {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM templates ORDER BY is_default DESC, name ASC');
  return stmt.all() as Template[];
}

export function getTemplateById(id: string): Template | undefined {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM templates WHERE id = ?');
  return stmt.get(id) as Template | undefined;
}

export function createTemplate(data: Partial<Template>): Template {
  const db = getDatabase();
  const id = data.id || nanoid();
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO templates (id, name, description, structure, prompts, is_default, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    data.name || 'Untitled Template',
    data.description || null,
    data.structure || null,
    data.prompts || null,
    data.is_default || 0,
    now
  );

  return getTemplateById(id)!;
}

export function deleteTemplate(id: string): boolean {
  const db = getDatabase();
  const stmt = db.prepare('DELETE FROM templates WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

// Cache queries
export function getCachedScrape(url: string): ScrapedCache | undefined {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT * FROM scraped_cache
    WHERE url = ? AND (expires_at IS NULL OR expires_at > datetime('now'))
  `);
  return stmt.get(url) as ScrapedCache | undefined;
}

export function setCachedScrape(data: Omit<ScrapedCache, 'id' | 'scraped_at'>): void {
  const db = getDatabase();
  const id = nanoid();

  const stmt = db.prepare(`
    INSERT OR REPLACE INTO scraped_cache (id, url, title, content, headings, word_count, scraped_at, expires_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'), ?)
  `);

  stmt.run(
    id,
    data.url,
    data.title || null,
    data.content || null,
    data.headings || null,
    data.word_count || null,
    data.expires_at || null
  );
}

export function clearExpiredCache(): number {
  const db = getDatabase();
  const stmt = db.prepare(`DELETE FROM scraped_cache WHERE expires_at < datetime('now')`);
  const result = stmt.run();
  return result.changes;
}

// Stats
export function getContentStats(): {
  total: number;
  drafts: number;
  published: number;
  todayCount: number;
  avgWordCount: number;
  avgSeoScore: number;
} {
  const db = getDatabase();

  const totalStmt = db.prepare('SELECT COUNT(*) as count FROM contents');
  const draftsStmt = db.prepare("SELECT COUNT(*) as count FROM contents WHERE status = 'draft'");
  const publishedStmt = db.prepare("SELECT COUNT(*) as count FROM contents WHERE status = 'published'");
  const todayStmt = db.prepare("SELECT COUNT(*) as count FROM contents WHERE date(created_at) = date('now')");
  const avgWordStmt = db.prepare('SELECT AVG(word_count) as avg FROM contents WHERE word_count IS NOT NULL');
  const avgSeoStmt = db.prepare('SELECT AVG(seo_score) as avg FROM contents WHERE seo_score IS NOT NULL');

  return {
    total: (totalStmt.get() as { count: number }).count,
    drafts: (draftsStmt.get() as { count: number }).count,
    published: (publishedStmt.get() as { count: number }).count,
    todayCount: (todayStmt.get() as { count: number }).count,
    avgWordCount: Math.round((avgWordStmt.get() as { avg: number | null }).avg || 0),
    avgSeoScore: Math.round((avgSeoStmt.get() as { avg: number | null }).avg || 0),
  };
}
