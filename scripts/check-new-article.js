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

async function checkNewArticle() {
  try {
    console.log('Checking if article was created...');
    
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    // Check if the article exists
    const result = await client.execute({
      sql: `SELECT id, title, slug, published_at FROM articles 
            WHERE slug = 'kiala-gummies-vs-seed-ritual-probiotics-comparison' 
            AND site_id = (SELECT id FROM sites WHERE subdomain = 'goodness-authority')`,
      args: []
    });

    if (result.rows.length === 0) {
      console.log('❌ Article not found in database');
      
      // Let's check what articles do exist for this site
      const existingArticles = await client.execute({
        sql: `SELECT title, slug FROM articles 
              WHERE site_id = (SELECT id FROM sites WHERE subdomain = 'goodness-authority')
              ORDER BY created_at DESC LIMIT 5`,
        args: []
      });
      
      console.log('\n📋 Recent articles for goodness-authority:');
      existingArticles.rows.forEach((article, i) => {
        console.log(`${i + 1}. ${article.title} (slug: ${article.slug})`);
      });
      
      return;
    }

    const article = result.rows[0];
    console.log('✅ Article found in database:');
    console.log(`   Title: ${article.title}`);
    console.log(`   Slug: ${article.slug}`);
    console.log(`   Published: ${article.published_at}`);
    console.log(`   ID: ${article.id}`);

    // Check the site configuration
    const siteCheck = await client.execute({
      sql: `SELECT subdomain, name FROM sites WHERE subdomain = 'goodness-authority'`,
      args: []
    });
    
    if (siteCheck.rows.length > 0) {
      console.log(`\n✅ Site exists: ${siteCheck.rows[0].name} (${siteCheck.rows[0].subdomain})`);
      console.log(`\n🔗 Try these URLs:`);
      console.log(`   https://www.goodnessauthority.com/articles/${article.slug}`);
      console.log(`   https://goodnessauthority.com/articles/${article.slug}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkNewArticle();