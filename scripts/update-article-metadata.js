const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
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

async function updateArticleMetadata() {
  try {
    console.log('Connecting to Turso database...');
    
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    // Update the article metadata in the database
    await client.execute({
      sql: `UPDATE articles 
            SET read_time = 13, 
                views = 9730,
                category = 'Product Reviews',
                updated_at = CURRENT_TIMESTAMP
            WHERE slug = 'bloom-vs-kiala-greens-powder-comparison' 
            AND site_id = (SELECT id FROM sites WHERE subdomain = 'goodness-authority')`,
      args: []
    });

    console.log('✅ Successfully updated article metadata:');
    console.log('   - Category: Product Reviews');
    console.log('   - Read time: 13 min');
    console.log('   - Views: 9,730');

  } catch (error) {
    console.error('Error:', error);
  }
}

updateArticleMetadata();