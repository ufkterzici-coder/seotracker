import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { schema, defaultTemplates } from './schema';

const dbPath = path.join(process.cwd(), 'data', 'seo-panel.db');

let db: SqlJsDatabase | null = null;
let initPromise: Promise<SqlJsDatabase> | null = null;

async function initSQL(): Promise<SqlJsDatabase> {
  // Locate the WASM file in node_modules
  const wasmPath = path.join(
    process.cwd(),
    'node_modules',
    'sql.js',
    'dist',
    'sql-wasm.wasm'
  );

  const SQL = await initSqlJs({
    locateFile: () => wasmPath,
  });

  // Ensure data directory exists
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Load existing database or create new one
  let database: SqlJsDatabase;
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    database = new SQL.Database(buffer);
  } else {
    database = new SQL.Database();
  }

  // Initialize tables
  database.run(schema);

  // Insert default templates if not exists
  for (const template of defaultTemplates) {
    database.run(
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

  // Save to file
  const data = database.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);

  return database;
}

export async function getDatabase(): Promise<SqlJsDatabase> {
  if (db) return db;

  // Prevent multiple simultaneous initializations
  if (!initPromise) {
    initPromise = initSQL().then((database) => {
      db = database;
      return database;
    });
  }

  return initPromise;
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
