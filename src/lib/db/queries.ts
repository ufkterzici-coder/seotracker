import { getDatabase, saveDatabase } from './index';
import { Content, Template, ScrapedCache } from '@/types/content';
import { nanoid } from 'nanoid';

// Helper to convert sql.js result to object array
function resultToObjects<T>(result: { columns: string[]; values: unknown[][] } | undefined): T[] {
  if (!result || !result.values.length) return [];
  return result.values.map((row) => {
    const obj: Record<string, unknown> = {};
    result.columns.forEach((col, i) => {
      obj[col] = row[i];
    });
    return obj as T;
  });
}

// Content queries
export async function getAllContents(status?: string): Promise<Content[]> {
  const db = await getDatabase();
  let result;
  if (status) {
    result = db.exec('SELECT * FROM contents WHERE status = ? ORDER BY created_at DESC', [status]);
  } else {
    result = db.exec('SELECT * FROM contents ORDER BY created_at DESC');
  }
  return resultToObjects<Content>(result[0]);
}

export async function getContentById(id: string): Promise<Content | undefined> {
  const db = await getDatabase();
  const result = db.exec('SELECT * FROM contents WHERE id = ?', [id]);
  const contents = resultToObjects<Content>(result[0]);
  return contents[0];
}

export async function createContent(data: Partial<Content>): Promise<Content> {
  const db = await getDatabase();
  const id = data.id || nanoid();
  const now = new Date().toISOString();

  db.run(
    `INSERT INTO contents (
      id, title, slug, meta_title, meta_description, content, html_content,
      main_keyword, lsi_keywords, search_intent, headings, schema_markup,
      readability_score, seo_score, word_count, competitor_urls, competitor_data,
      featured_image, image_alt_text, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
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
      now,
    ]
  );

  saveDatabase();
  return (await getContentById(id))!;
}

export async function updateContent(id: string, data: Partial<Content>): Promise<Content | undefined> {
  const db = await getDatabase();
  const existing = await getContentById(id);
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

  db.run(`UPDATE contents SET ${updates.join(', ')} WHERE id = ?`, values);
  saveDatabase();

  return getContentById(id);
}

export async function deleteContent(id: string): Promise<boolean> {
  const db = await getDatabase();
  const before = db.exec('SELECT COUNT(*) as count FROM contents WHERE id = ?', [id]);
  const countBefore = before[0]?.values[0]?.[0] as number || 0;

  if (countBefore === 0) return false;

  db.run('DELETE FROM contents WHERE id = ?', [id]);
  saveDatabase();
  return true;
}

// Template queries
export async function getAllTemplates(): Promise<Template[]> {
  const db = await getDatabase();
  const result = db.exec('SELECT * FROM templates ORDER BY is_default DESC, name ASC');
  return resultToObjects<Template>(result[0]);
}

export async function getTemplateById(id: string): Promise<Template | undefined> {
  const db = await getDatabase();
  const result = db.exec('SELECT * FROM templates WHERE id = ?', [id]);
  const templates = resultToObjects<Template>(result[0]);
  return templates[0];
}

export async function createTemplate(data: Partial<Template>): Promise<Template> {
  const db = await getDatabase();
  const id = data.id || nanoid();
  const now = new Date().toISOString();

  db.run(
    `INSERT INTO templates (id, name, description, structure, prompts, is_default, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.name || 'Untitled Template',
      data.description || null,
      data.structure || null,
      data.prompts || null,
      data.is_default || 0,
      now,
    ]
  );

  saveDatabase();
  return (await getTemplateById(id))!;
}

export async function deleteTemplate(id: string): Promise<boolean> {
  const db = await getDatabase();
  const before = db.exec('SELECT COUNT(*) as count FROM templates WHERE id = ?', [id]);
  const countBefore = before[0]?.values[0]?.[0] as number || 0;

  if (countBefore === 0) return false;

  db.run('DELETE FROM templates WHERE id = ?', [id]);
  saveDatabase();
  return true;
}

// Cache queries
export async function getCachedScrape(url: string): Promise<ScrapedCache | undefined> {
  const db = await getDatabase();
  const result = db.exec(
    `SELECT * FROM scraped_cache
     WHERE url = ? AND (expires_at IS NULL OR expires_at > datetime('now'))`,
    [url]
  );
  const caches = resultToObjects<ScrapedCache>(result[0]);
  return caches[0];
}

export async function setCachedScrape(data: Omit<ScrapedCache, 'id' | 'scraped_at'>): Promise<void> {
  const db = await getDatabase();
  const id = nanoid();

  db.run(
    `INSERT OR REPLACE INTO scraped_cache (id, url, title, content, headings, word_count, scraped_at, expires_at)
     VALUES (?, ?, ?, ?, ?, ?, datetime('now'), ?)`,
    [
      id,
      data.url,
      data.title || null,
      data.content || null,
      data.headings || null,
      data.word_count || null,
      data.expires_at || null,
    ]
  );

  saveDatabase();
}

export async function clearExpiredCache(): Promise<number> {
  const db = await getDatabase();
  const before = db.exec(`SELECT COUNT(*) as count FROM scraped_cache WHERE expires_at < datetime('now')`);
  const countBefore = before[0]?.values[0]?.[0] as number || 0;

  db.run(`DELETE FROM scraped_cache WHERE expires_at < datetime('now')`);
  saveDatabase();

  return countBefore;
}

// Stats
export async function getContentStats(): Promise<{
  total: number;
  drafts: number;
  published: number;
  todayCount: number;
  avgWordCount: number;
  avgSeoScore: number;
}> {
  const db = await getDatabase();

  const totalResult = db.exec('SELECT COUNT(*) as count FROM contents');
  const draftsResult = db.exec("SELECT COUNT(*) as count FROM contents WHERE status = 'draft'");
  const publishedResult = db.exec("SELECT COUNT(*) as count FROM contents WHERE status = 'published'");
  const todayResult = db.exec("SELECT COUNT(*) as count FROM contents WHERE date(created_at) = date('now')");
  const avgWordResult = db.exec('SELECT AVG(word_count) as avg FROM contents WHERE word_count IS NOT NULL');
  const avgSeoResult = db.exec('SELECT AVG(seo_score) as avg FROM contents WHERE seo_score IS NOT NULL');

  return {
    total: (totalResult[0]?.values[0]?.[0] as number) || 0,
    drafts: (draftsResult[0]?.values[0]?.[0] as number) || 0,
    published: (publishedResult[0]?.values[0]?.[0] as number) || 0,
    todayCount: (todayResult[0]?.values[0]?.[0] as number) || 0,
    avgWordCount: Math.round((avgWordResult[0]?.values[0]?.[0] as number) || 0),
    avgSeoScore: Math.round((avgSeoResult[0]?.values[0]?.[0] as number) || 0),
  };
}
