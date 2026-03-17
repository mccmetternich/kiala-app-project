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

async function addArticle() {
  try {
    console.log('Loading article data...');
    
    // Read the article JSON file
    const articlePath = path.join(__dirname, 'content/goodness-authority/articles/kiala-vs-gruns-vs-lemme-greens-showdown-2025.json');
    const articleData = JSON.parse(fs.readFileSync(articlePath, 'utf8'));
    
    console.log('Article loaded:', articleData.title);
    
    // Get the goodness-authority site ID
    const siteResult = await client.execute({
      sql: 'SELECT id FROM sites WHERE subdomain = ?',
      args: ['goodness-authority']
    });
    
    if (siteResult.rows.length === 0) {
      console.error('Site goodness-authority not found');
      return;
    }
    
    const siteId = siteResult.rows[0].id;
    console.log('Site ID found:', siteId);
    
    // First check the table schema
    const schemaResult = await client.execute('PRAGMA table_info(articles)');
    console.log('Available columns:');
    schemaResult.rows.forEach(row => {
      console.log('-', row.name);
    });
    
    // Insert the article with correct column names
    await client.execute({
      sql: `INSERT INTO articles (
        id, title, excerpt, content, slug, site_id, published, published_at, created_at, updated_at, 
        image, read_time, category, widget_config, author_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        articleData.id,
        articleData.title,
        articleData.excerpt,
        JSON.stringify(articleData.sections),
        articleData.slug,
        siteId,
        1, // published
        articleData.published_date + 'T10:00:00.000Z',
        new Date().toISOString(),
        new Date().toISOString(),
        articleData.featured_image,
        articleData.reading_time,
        articleData.category,
        JSON.stringify(articleData.widget_config),
        articleData.author.name
      ]
    });
    
    console.log('✅ Article successfully added to database');
    console.log('✅ URL: https://kiala-dr-god.vercel.app/' + articleData.slug);
    
  } catch (error) {
    console.error('Error adding article:', error);
  } finally {
    client.close();
  }
}

addArticle();