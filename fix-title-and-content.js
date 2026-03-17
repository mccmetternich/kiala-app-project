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

async function fixTitleAndContent() {
  try {
    console.log('Loading corrected article data...');
    
    const articlePath = path.join(__dirname, 'content/goodness-authority/articles/kiala-vs-gruns-vs-lemme-greens-showdown-2025.json');
    const articleData = JSON.parse(fs.readFileSync(articlePath, 'utf8'));
    
    console.log('JSON file title:', articleData.title);
    console.log('Sections found:', articleData.sections ? articleData.sections.length : 0);
    
    // Update EVERYTHING - title, content, excerpt, widget_config
    await client.execute({
      sql: `UPDATE articles SET 
        title = ?,
        content = ?, 
        excerpt = ?, 
        meta_title = ?,
        meta_description = ?,
        updated_at = ?, 
        widget_config = ? 
      WHERE slug = ? AND site_id = (SELECT id FROM sites WHERE subdomain = ?)`,
      args: [
        articleData.title,                          // Fix the title
        JSON.stringify(articleData.sections),      // Use sections as content  
        articleData.excerpt,                       // Update excerpt
        articleData.meta_title,                    // Update meta title
        articleData.meta_description,              // Update meta description
        new Date().toISOString(),
        JSON.stringify(articleData.widget_config), // Main widget config (hero)
        articleData.slug,
        'goodness-authority'
      ]
    });
    
    console.log('✅ EVERYTHING updated successfully!');
    console.log('✅ Fixed:');
    console.log('  - Title: "The $312 Greens Scam" → "' + articleData.title + '"');
    console.log('  - Content: Full sections structure with widgets');
    console.log('  - Excerpt: Updated to match new focus');
    console.log('  - Meta tags: Professional comparison focus');
    
    // Verify the update
    const result = await client.execute({
      sql: 'SELECT title, length(content) as content_length FROM articles WHERE slug = ? AND site_id = (SELECT id FROM sites WHERE subdomain = ?)',
      args: ['kiala-vs-gruns-vs-lemme-greens-showdown-2025', 'goodness-authority']
    });
    
    if (result.rows.length > 0) {
      console.log('');
      console.log('🔍 VERIFICATION:');
      console.log('Database title:', result.rows[0].title);
      console.log('Content length:', result.rows[0].content_length, 'characters');
    }
    
  } catch (error) {
    console.error('Error updating article:', error);
  } finally {
    client.close();
  }
}

fixTitleAndContent();