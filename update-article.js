const fs = require('fs');
const path = require('path');
const { createClient } = require('@libsql/client');

// Read .env file manually
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n');

const env = {};
envLines.forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    let value = valueParts.join('=').trim();
    // Remove quotes if present
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    env[key.trim()] = value;
  }
});

const client = createClient({
  url: env.TURSO_DATABASE_URL,
  authToken: env.TURSO_AUTH_TOKEN
});

async function updateArticle() {
  try {
    console.log('Loading improved article data...');
    
    const articlePath = path.join(__dirname, 'content/goodness-authority/articles/kiala-vs-gruns-vs-lemme-greens-showdown-2025.json');
    const articleData = JSON.parse(fs.readFileSync(articlePath, 'utf8'));
    
    console.log('Article loaded:', articleData.title);
    
    // Update the existing article
    await client.execute({
      sql: `UPDATE articles SET 
        title = ?,
        content = ?, 
        excerpt = ?, 
        updated_at = ?, 
        widget_config = ? 
      WHERE slug = ? AND site_id = (SELECT id FROM sites WHERE subdomain = ?)`,
      args: [
        articleData.title,
        JSON.stringify(articleData.sections),
        articleData.excerpt,
        new Date().toISOString(),
        JSON.stringify(articleData.widget_config),
        articleData.slug,
        'goodness-authority'
      ]
    });
    
    console.log('✅ Article successfully updated with improvements');
    console.log('✅ Enhanced with:');
    console.log('  - Removed all em-dashes');
    console.log('  - Added robust participant quotes from 16-week trial');
    console.log('  - Strengthened investigatory tone matching proven template');
    console.log('  - Enhanced FAQ with data-driven, non-salesy responses');
    console.log('  - Improved evidence-based claims and references');
    
  } catch (error) {
    console.error('Error updating article:', error);
  } finally {
    client.close();
  }
}

updateArticle();