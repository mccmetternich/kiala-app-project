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

async function testArticleAccess() {
  try {
    console.log('🔍 Testing article access and routing...');
    
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    // Verify the article exists and is published
    const result = await client.execute({
      sql: `SELECT 
              a.id, a.title, a.slug, a.published, a.published_at,
              s.subdomain, s.name as site_name
            FROM articles a 
            JOIN sites s ON a.site_id = s.id
            WHERE a.slug = 'kiala-gummies-vs-seed-ritual-probiotics-comparison'`,
      args: []
    });

    if (result.rows.length === 0) {
      console.log('❌ Article not found in database');
      return;
    }

    const article = result.rows[0];
    console.log('📄 Article Status:');
    console.log(`   Title: ${article.title}`);
    console.log(`   Slug: ${article.slug}`);
    console.log(`   Site: ${article.site_name} (${article.subdomain})`);
    console.log(`   Published: ${article.published} (1 = live, 0 = draft)`);
    console.log(`   Published Date: ${article.published_at}`);
    console.log(`   ID: ${article.id}`);

    if (article.published !== 1) {
      console.log('❌ Article is not published! Setting published = 1...');
      await client.execute({
        sql: `UPDATE articles SET published = 1 WHERE id = ?`,
        args: [article.id]
      });
      console.log('✅ Article published status updated');
    }

    console.log('\n🔗 URLs that should work:');
    console.log(`   Production: https://www.goodnessauthority.com/articles/${article.slug}`);
    console.log(`   Alt Production: https://goodnessauthority.com/articles/${article.slug}`);
    console.log(`   Development: http://localhost:3000/site/${article.subdomain}/articles/${article.slug}`);

    console.log('\n💡 If production URLs don\'t work, check:');
    console.log('   1. DNS configuration for goodnessauthority.com');
    console.log('   2. Vercel deployment status');
    console.log('   3. Environment variables in production');
    console.log('   4. Middleware domain mapping');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testArticleAccess();