import { createClient } from '@libsql/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env manually
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  });
}

const db = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:local.db',
  authToken: process.env.TURSO_AUTH_TOKEN
});

async function migrate() {
  console.log('Adding new article fields...');

  // Add new columns to articles table
  const columns = [
    { name: 'tracking_config', type: 'TEXT DEFAULT \'{}\'', existing: 'widget_config' },
    { name: 'author_name', type: 'TEXT', existing: null },
    { name: 'author_image', type: 'TEXT', existing: null },
    { name: 'display_views', type: 'INTEGER DEFAULT 0', existing: null },
    { name: 'display_likes', type: 'INTEGER DEFAULT 0', existing: null }
  ];

  for (const col of columns) {
    try {
      await db.execute(`ALTER TABLE articles ADD COLUMN ${col.name} ${col.type}`);
      console.log(`✅ Added column: ${col.name}`);
    } catch (error) {
      if (error.message?.includes('duplicate column') || error.message?.includes('already exists')) {
        console.log(`⏭️  Column already exists: ${col.name}`);
      } else {
        console.error(`❌ Error adding column ${col.name}:`, error.message);
      }
    }
  }

  console.log('\n✅ Migration complete!');
}

migrate().catch(console.error);
