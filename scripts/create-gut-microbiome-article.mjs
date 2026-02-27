#!/usr/bin/env node

import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Database setup
const DATABASE_URL = process.env.TURSO_DATABASE_URL || 'file:local.db';
const client = createClient({
  url: DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN || undefined,
});

async function createGutMicrobiomeArticle() {
  try {
    console.log('Creating gut microbiome article for WellnessCore...');

    // Load article content
    const articlePath = join(__dirname, '../content/articles/gut-microbiome-complete-guide-women-45.json');
    const articleContent = JSON.parse(readFileSync(articlePath, 'utf8'));

    // Find WellnessCore site
    const siteResult = await client.execute({
      sql: 'SELECT id, name FROM sites WHERE name = ? OR subdomain = ?',
      args: ['WellnessCore', 'wellnesscore']
    });

    if (siteResult.rows.length === 0) {
      throw new Error('WellnessCore site not found. Create the site first.');
    }

    const siteId = siteResult.rows[0].id;
    console.log(`Found WellnessCore site: ${siteId}`);

    // Check if article already exists
    const existingResult = await client.execute({
      sql: 'SELECT id, title FROM articles WHERE site_id = ? AND slug = ?',
      args: [siteId, articleContent.slug]
    });

    const articleId = crypto.randomUUID();
    const now = new Date().toISOString();

    if (existingResult.rows.length > 0) {
      // Update existing article
      const existingId = existingResult.rows[0].id;
      console.log(`Updating existing article: ${existingId}`);

      await client.execute({
        sql: `UPDATE articles SET 
          title = ?, excerpt = ?, category = ?, content = ?, 
          featured = ?, boosted = ?, hero = ?, 
          meta_title = ?, meta_description = ?, 
          status = 'published', updated_at = ?
          WHERE id = ?`,
        args: [
          articleContent.title,
          articleContent.excerpt,
          articleContent.category,
          JSON.stringify(articleContent.widget_config),
          articleContent.featured ? 1 : 0,
          articleContent.boosted ? 1 : 0,
          articleContent.hero ? 1 : 0,
          articleContent.meta_title || articleContent.title,
          articleContent.meta_description || articleContent.excerpt,
          now,
          existingId
        ]
      });

      console.log('✅ Gut microbiome article updated successfully!');
      console.log(`✅ URL: /site/${siteId}/articles/${articleContent.slug}`);
      
      return { siteId, articleId: existingId };
    } else {
      // Create new article
      await client.execute({
        sql: `INSERT INTO articles (
          id, site_id, title, slug, excerpt, category, content,
          featured, boosted, hero, meta_title, meta_description,
          status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?, ?)`,
        args: [
          articleId,
          siteId,
          articleContent.title,
          articleContent.slug,
          articleContent.excerpt,
          articleContent.category,
          JSON.stringify(articleContent.widget_config),
          articleContent.featured ? 1 : 0,
          articleContent.boosted ? 1 : 0,
          articleContent.hero ? 1 : 0,
          articleContent.meta_title || articleContent.title,
          articleContent.meta_description || articleContent.excerpt,
          now,
          now
        ]
      });

      console.log('✅ Gut microbiome article created successfully!');
      console.log(`✅ Article ID: ${articleId}`);
      console.log(`✅ URL: /site/${siteId}/articles/${articleContent.slug}`);
      
      return { siteId, articleId };
    }
  } catch (error) {
    console.error('❌ Error creating gut microbiome article:', error);
    throw error;
  }
}

// Run the creation
createGutMicrobiomeArticle()
  .then(({ siteId, articleId }) => {
    console.log('\\n🎉 Gut microbiome article setup complete!');
    console.log(`Access your article at: http://localhost:3000/site/${siteId}/articles/gut-microbiome-complete-guide-women-45`);
    console.log(`Admin edit: http://localhost:3000/admin/articles/${articleId}/edit`);
  })
  .catch((error) => {
    console.error('Failed to create gut microbiome article:', error);
    process.exit(1);
  });