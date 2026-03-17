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

async function debugArticle() {
  try {
    console.log('🔍 Debugging article visibility issue...');
    
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    // Check full article details
    const result = await client.execute({
      sql: `SELECT id, title, slug, published_at, created_at, content, 
                   (SELECT name FROM sites WHERE id = articles.site_id) as site_name,
                   (SELECT subdomain FROM sites WHERE id = articles.site_id) as site_subdomain
            FROM articles 
            WHERE slug = 'kiala-gummies-vs-seed-ritual-probiotics-comparison'`,
      args: []
    });

    if (result.rows.length === 0) {
      console.log('❌ Article not found at all');
      return;
    }

    const article = result.rows[0];
    console.log('📄 Article Details:');
    console.log(`   ID: ${article.id}`);
    console.log(`   Title: ${article.title}`);
    console.log(`   Slug: ${article.slug}`);
    console.log(`   Site: ${article.site_name} (${article.site_subdomain})`);
    console.log(`   Published: ${article.published_at}`);
    console.log(`   Created: ${article.created_at}`);
    console.log(`   Content length: ${article.content?.length || 0} chars`);

    // Compare with working Bloom article
    const bloomArticle = await client.execute({
      sql: `SELECT id, title, slug, published_at FROM articles 
            WHERE slug = 'bloom-vs-kiala-greens-powder-comparison' 
            AND site_id = (SELECT id FROM sites WHERE subdomain = 'goodness-authority')`,
      args: []
    });

    if (bloomArticle.rows.length > 0) {
      console.log('\n✅ Working Bloom article for comparison:');
      console.log(`   ID: ${bloomArticle.rows[0].id}`);
      console.log(`   Title: ${bloomArticle.rows[0].title}`);
      console.log(`   Slug: ${bloomArticle.rows[0].slug}`);
      console.log(`   Published: ${bloomArticle.rows[0].published_at}`);
    }

    // Check if there are any NULL ID issues or database constraints
    console.log('\n🔍 Checking for potential issues:');
    
    if (article.id === null || article.id === undefined) {
      console.log('❌ ISSUE FOUND: Article ID is NULL - this could cause routing problems');
    }
    
    if (!article.published_at) {
      console.log('❌ ISSUE FOUND: No published_at date');
    }
    
    if (article.content === null || article.content === '') {
      console.log('❌ ISSUE FOUND: No content (but we used widget_config instead)');
    }

    // Try to manually set a proper ID if it's NULL
    if (article.id === null) {
      console.log('\n🔧 Attempting to fix NULL ID issue...');
      
      // Get the site ID first
      const siteResult = await client.execute({
        sql: `SELECT id FROM sites WHERE subdomain = 'goodness-authority'`,
        args: []
      });
      
      if (siteResult.rows.length > 0) {
        const siteId = siteResult.rows[0].id;
        
        // Delete the problematic record and recreate it properly
        await client.execute({
          sql: `DELETE FROM articles WHERE slug = 'kiala-gummies-vs-seed-ritual-probiotics-comparison' AND site_id = ?`,
          args: [siteId]
        });
        
        console.log('🗑️ Deleted problematic article record');
        console.log('💡 You may need to re-run the creation script');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugArticle();