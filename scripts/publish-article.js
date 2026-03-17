const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');

// Load environment variables
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
    }
  });
}

async function publishArticle() {
  try {
    console.log('📢 Publishing the article...');
    
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    // Set published = 1 to make the article live
    const result = await client.execute({
      sql: `UPDATE articles 
            SET published = 1, 
                updated_at = ?
            WHERE slug = 'kiala-gummies-vs-seed-ritual-probiotics-comparison'`,
      args: [new Date().toISOString()]
    });

    console.log('✅ Article published successfully!');

    // Verify the change
    const verification = await client.execute({
      sql: `SELECT id, title, slug, published, published_at FROM articles 
            WHERE slug = 'kiala-gummies-vs-seed-ritual-probiotics-comparison'`,
      args: []
    });

    if (verification.rows.length > 0) {
      const article = verification.rows[0];
      console.log('🔍 Verification:');
      console.log(`   Title: ${article.title}`);
      console.log(`   Slug: ${article.slug}`);
      console.log(`   Published: ${article.published} (should be 1)`);
      console.log(`   Published At: ${article.published_at}`);
      console.log(`   ID: ${article.id}`);
      console.log('');
      console.log('🔗 Article should now be live at:');
      console.log(`   https://www.goodnessauthority.com/articles/${article.slug}`);
    }

  } catch (error) {
    console.error('❌ Error publishing article:', error);
  }
}

publishArticle();