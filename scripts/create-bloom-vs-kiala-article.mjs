/**
 * Script to create the "Bloom vs Kiala" competitive comparison article
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
    const articlePath = join(__dirname, '../content/articles/bloom-vs-kiala-greens-powder-comparison.json');
    const articleData = JSON.parse(readFileSync(articlePath, 'utf-8'));

    // Find the Dr. Amy Heart site
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

    // Check if article already exists
    const existingArticle = await db.execute({
      sql: "SELECT id FROM articles WHERE slug = ? AND site_id = ?",
      args: [articleData.slug, siteId]
    });

    if (existingArticle.rows.length > 0) {
      console.log('Article already exists, updating...');
      
      // Update existing article
      await db.execute({
        sql: `UPDATE articles SET 
              title = ?, 
              excerpt = ?, 
              category = ?, 
              featured = ?, 
              boosted = ?,
              hero = ?,
              widget_config = ?,
              updated_at = datetime('now')
              WHERE slug = ? AND site_id = ?`,
        args: [
          articleData.title,
          articleData.excerpt,
          articleData.category,
          articleData.featured ? 1 : 0,
          articleData.boosted ? 1 : 0,
          articleData.hero ? 1 : 0,
          JSON.stringify(articleData.widget_config),
          articleData.slug,
          siteId
        ]
      });

      console.log('✅ Article updated successfully!');
    } else {
      console.log('Creating new article...');
      
      // Create new article
      const articleId = nanoid();
      await db.execute({
        sql: `INSERT INTO articles (
          id, 
          site_id, 
          title, 
          slug, 
          excerpt, 
          category, 
          featured, 
          boosted,
          hero,
          widget_config,
          created_at, 
          updated_at,
          published
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), 1)`,
        args: [
          articleId,
          siteId,
          articleData.title,
          articleData.slug,
          articleData.excerpt,
          articleData.category,
          articleData.featured ? 1 : 0,
          articleData.boosted ? 1 : 0,
          articleData.hero ? 1 : 0,
          JSON.stringify(articleData.widget_config)
        ]
      });

      console.log('✅ Article created successfully!');
      console.log('Article ID:', articleId);
    }

    // Verify the article was created/updated
    const verifyResult = await db.execute({
      sql: "SELECT id, title, slug FROM articles WHERE slug = ? AND site_id = ?",
      args: [articleData.slug, siteId]
    });

    if (verifyResult.rows.length > 0) {
      const article = verifyResult.rows[0];
      console.log('✅ Verification successful:');
      console.log('  - Title:', article.title);
      console.log('  - Slug:', article.slug);
      console.log('  - URL: /site/' + siteId + '/articles/' + article.slug);
    }

  } catch (error) {
    console.error('Error creating article:', error);
    process.exit(1);
  }
}

createArticle();