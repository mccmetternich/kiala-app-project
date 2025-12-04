const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Load .env
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

async function run() {
  // Run via tsx to use the existing db setup
  const scriptContent = `
import db from '../src/lib/db-enhanced.ts';

async function migrate() {
  console.log('Adding new article fields...');

  const columns = [
    "ALTER TABLE articles ADD COLUMN tracking_config TEXT DEFAULT '{}'",
    "ALTER TABLE articles ADD COLUMN author_name TEXT",
    "ALTER TABLE articles ADD COLUMN author_image TEXT",
    "ALTER TABLE articles ADD COLUMN display_views INTEGER DEFAULT 0",
    "ALTER TABLE articles ADD COLUMN display_likes INTEGER DEFAULT 0"
  ];

  for (const sql of columns) {
    try {
      await db.execute(sql);
      console.log('✅ Executed:', sql.substring(0, 60) + '...');
    } catch (error: any) {
      if (error.message?.includes('duplicate') || error.message?.includes('already exists')) {
        console.log('⏭️  Column already exists');
      } else {
        console.error('❌ Error:', error.message);
      }
    }
  }

  console.log('\\n✅ Migration complete!');
  process.exit(0);
}

migrate();
`;

  fs.writeFileSync(path.join(__dirname, 'temp-migrate.ts'), scriptContent);

  try {
    execSync('npx tsx scripts/temp-migrate.ts', {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit'
    });
  } finally {
    fs.unlinkSync(path.join(__dirname, 'temp-migrate.ts'));
  }
}

run().catch(console.error);
