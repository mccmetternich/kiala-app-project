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

async function debugRouting() {
  try {
    console.log('🔍 Deep debugging routing issue...');
    
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    // Check site configuration
    const siteResult = await client.execute({
      sql: `SELECT * FROM sites WHERE subdomain = 'goodness-authority'`,
      args: []
    });

    if (siteResult.rows.length > 0) {
      const site = siteResult.rows[0];
      console.log('🌐 Site Configuration:');
      console.log(`   ID: ${site.id}`);
      console.log(`   Name: ${site.name}`);
      console.log(`   Subdomain: ${site.subdomain}`);
      console.log(`   Status: ${site.status || 'not set'}`);
      console.log(`   Settings: ${site.settings ? 'present' : 'missing'}`);
    }

    // Check all articles for this site to see URL patterns
    const articlesResult = await client.execute({
      sql: `SELECT id, title, slug, published_at, created_at FROM articles 
            WHERE site_id = (SELECT id FROM sites WHERE subdomain = 'goodness-authority')
            ORDER BY created_at DESC LIMIT 5`,
      args: []
    });

    console.log('\n📚 All articles for goodness-authority:');
    articlesResult.rows.forEach((article, i) => {
      console.log(`${i + 1}. "${article.title}"`);
      console.log(`   Slug: ${article.slug}`);
      console.log(`   ID: ${article.id}`);
      console.log(`   Published: ${article.published_at}`);
      console.log(`   URL: https://www.goodnessauthority.com/articles/${article.slug}`);
      console.log('');
    });

    // Specifically check our new article
    const newArticle = await client.execute({
      sql: `SELECT * FROM articles WHERE slug = 'kiala-gummies-vs-seed-ritual-probiotics-comparison'`,
      args: []
    });

    if (newArticle.rows.length > 0) {
      const article = newArticle.rows[0];
      console.log('🎯 New Article Full Details:');
      Object.keys(article).forEach(key => {
        const value = article[key];
        if (key === 'widget_config' && value) {
          console.log(`   ${key}: ${value.length} chars (JSON)`);
        } else {
          console.log(`   ${key}: ${value}`);
        }
      });
    }

    // Check if there's a pages table or different routing
    try {
      const pagesResult = await client.execute({
        sql: `SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%page%'`,
        args: []
      });
      
      if (pagesResult.rows.length > 0) {
        console.log('\n📄 Page-related tables found:');
        pagesResult.rows.forEach(row => {
          console.log(`   - ${row.name}`);
        });
      }
    } catch (e) {
      console.log('\n📄 No additional page tables found');
    }

    // Test if the working bloom article is actually accessible
    const bloomCheck = await client.execute({
      sql: `SELECT id, slug FROM articles WHERE slug = 'bloom-vs-kiala-greens-powder-comparison'`,
      args: []
    });

    if (bloomCheck.rows.length > 0) {
      console.log('\n✅ Bloom article exists in database:');
      console.log(`   Slug: ${bloomCheck.rows[0].slug}`);
      console.log(`   URL: https://www.goodnessauthority.com/articles/${bloomCheck.rows[0].slug}`);
      console.log('   👆 Try this URL to confirm the working pattern');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugRouting();