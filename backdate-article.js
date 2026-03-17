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

async function updateDate() {
  try {
    console.log('Updating article date to January 12, 2026...');
    
    await client.execute({
      sql: 'UPDATE articles SET published_at = ?, updated_at = ? WHERE slug = ? AND site_id = (SELECT id FROM sites WHERE subdomain = ?)',
      args: ['2026-01-12T10:00:00.000Z', new Date().toISOString(), 'kiala-gummies-vs-seed-ritual-probiotics-comparison', 'goodness-authority']
    });
    
    console.log('✅ Article backdated to January 12, 2026');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.close();
  }
}

updateDate();