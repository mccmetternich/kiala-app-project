/**
 * Script to create the "Mortifying Menopause Moment at Daughter's Wedding" article
 */

import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { nanoid } from 'nanoid';

// Load environment variables from .env file manually
const envPath = join(dirname(fileURLToPath(import.meta.url)), '../.env');
const envContent = readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    let value = valueParts.join('=').trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key.trim()] = value;
  }
});

const __dirname = dirname(fileURLToPath(import.meta.url));

const db = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:local.db',
  authToken: process.env.TURSO_AUTH_TOKEN
});

async function createArticle() {
  try {
    const articlePath = join(__dirname, '../content/articles/mortifying-menopause-wedding.json');
    const articleData = JSON.parse(readFileSync(articlePath, 'utf-8'));

    const siteResult = await db.execute({
      sql: "SELECT id FROM sites WHERE subdomain = 'dr-amy' OR name LIKE '%Amy%Heart%' LIMIT 1",
      args: []
    });

    if (!siteResult.rows.length) {
      console.error('Could not find Dr. Amy Heart site');
      process.exit(1);
    }

    const siteId = siteResult.rows[0].id;
    console.log('Found site:', siteId);

    const existingArticle = await db.execute({
      sql: "SELECT id FROM articles WHERE site_id = ? AND slug = ?",
      args: [siteId, articleData.slug]
    });

    if (existingArticle.rows.length > 0) {
      console.log('Article already exists, updating...');

      await db.execute({
        sql: `UPDATE articles SET
          title = ?,
          excerpt = ?,
          category = ?,
          featured = ?,
          boosted = ?,
          widget_config = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        args: [
          articleData.title,
          articleData.excerpt,
          articleData.category,
          articleData.featured ? 1 : 0,
          articleData.boosted ? 1 : 0,
          JSON.stringify(articleData.widget_config),
          existingArticle.rows[0].id
        ]
      });

      console.log('Article updated successfully!');
      console.log('Article ID:', existingArticle.rows[0].id);
    } else {
      const articleId = nanoid();

      await db.execute({
        sql: `INSERT INTO articles (
          id, site_id, title, slug, excerpt, content, category, image,
          featured, boosted, published, widget_config, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        args: [
          articleId,
          siteId,
          articleData.title,
          articleData.slug,
          articleData.excerpt,
          '',
          articleData.category,
          'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&h=630&fit=crop',
          articleData.featured ? 1 : 0,
          articleData.boosted ? 1 : 0,
          1,
          JSON.stringify(articleData.widget_config)
        ]
      });

      console.log('Article created successfully!');
      console.log('Article ID:', articleId);
      console.log('Slug:', articleData.slug);
    }

    console.log('\nView article at:');
    console.log(`http://localhost:3000/site/dr-amy/articles/${articleData.slug}`);

  } catch (error) {
    console.error('Error creating article:', error);
    process.exit(1);
  }
}

createArticle();
