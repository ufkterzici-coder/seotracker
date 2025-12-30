import Database from 'better-sqlite3';
import path from 'path';
import { schema, defaultTemplates } from './schema';

const dbPath = path.join(process.cwd(), 'data', 'seo-panel.db');

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    db = new Database(dbPath);
    // Enable WAL mode for better performance
    db.pragma('journal_mode = WAL');
    // Initialize tables
    db.exec(schema);
    // Insert default templates if not exists
    initializeDefaultTemplates();
  }
  return db;
}

function initializeDefaultTemplates() {
  if (!db) return;

  const insertTemplate = db.prepare(`
    INSERT OR IGNORE INTO templates (id, name, description, structure, prompts, is_default)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const template of defaultTemplates) {
    insertTemplate.run(
      template.id,
      template.name,
      template.description,
      template.structure,
      template.prompts,
      template.is_default
    );
  }
}

export default getDatabase;
