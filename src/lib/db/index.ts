import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { schema, defaultTemplates } from './schema';

const dbPath = path.join(process.cwd(), 'data', 'seo-panel.db');

let db: SqlJsDatabase | null = null;
let SQL: Awaited<ReturnType<typeof initSqlJs>> | null = null;

async function initSQL() {
  if (!SQL) {
    SQL = await initSqlJs();
  }
  return SQL;
}

export async function getDatabase(): Promise<SqlJsDatabase> {
  if (db) return db;

  const SqlJs = await initSQL();

  // Ensure data directory exists
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Load existing database or create new one
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SqlJs.Database(buffer);
  } else {
    db = new SqlJs.Database();
  }

  // Initialize tables
  db.run(schema);

  // Insert default templates if not exists
  initializeDefaultTemplates();

  // Save to file
  saveDatabase();

  return db;
}

function initializeDefaultTemplates() {
  if (!db) return;

  for (const template of defaultTemplates) {
    db.run(
      `INSERT OR IGNORE INTO templates (id, name, description, structure, prompts, is_default)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        template.id,
        template.name,
        template.description,
        template.structure,
        template.prompts,
        template.is_default,
      ]
    );
  }
}

export function saveDatabase() {
  if (!db) return;

  const data = db.export();
  const buffer = Buffer.from(data);

  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.writeFileSync(dbPath, buffer);
}

export default getDatabase;
