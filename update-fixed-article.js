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

async function updateArticleStructure() {
  try {
    console.log('Loading corrected article structure...');
    
    const articlePath = path.join(__dirname, 'content/goodness-authority/articles/kiala-vs-gruns-vs-lemme-greens-showdown-2025.json');
    const articleData = JSON.parse(fs.readFileSync(articlePath, 'utf8'));
    
    console.log('Article loaded:', articleData.title);
    console.log('Sections found:', articleData.sections ? articleData.sections.length : 0);
    console.log('Main widget config length:', articleData.widget_config ? articleData.widget_config.length : 0);
    
    // Update the existing article with correct structure
    await client.execute({
      sql: `UPDATE articles SET 
        content = ?, 
        excerpt = ?, 
        updated_at = ?, 
        widget_config = ? 
      WHERE slug = ? AND site_id = (SELECT id FROM sites WHERE subdomain = ?)`,
      args: [
        JSON.stringify(articleData.sections),  // Use sections as content
        articleData.excerpt,
        new Date().toISOString(),
        JSON.stringify(articleData.widget_config), // Main widget config (just hero)
        articleData.slug,
        'goodness-authority'
      ]
    });
    
    console.log('✅ Article structure successfully updated!');
    console.log('✅ Fixed content structure:');
    console.log('  - Moved from sections_backup to sections array');
    console.log('  - Moved comparison table and FAQ into proper sections');
    console.log('  - Each section now has heading + content + widget_config');
    console.log('  - Matches working Bloom vs Kiala article pattern');
    console.log('');
    console.log('🎯 Article should now display full content instead of just basic info!');
    
  } catch (error) {
    console.error('Error updating article:', error);
  } finally {
    client.close();
  }
}

updateArticleStructure();