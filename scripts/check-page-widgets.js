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

async function checkPageWidgets() {
  try {
    console.log('Connecting to Turso database...');
    
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    // Get the article and its widgets
    const result = await client.execute({
      sql: `SELECT id, slug, title, widget_config FROM articles 
            WHERE slug = 'bloom-vs-kiala-greens-powder-comparison' 
            AND site_id = (SELECT id FROM sites WHERE subdomain = 'goodness-authority')`,
      args: []
    });

    if (result.rows.length === 0) {
      console.log('❌ Article not found');
      return;
    }

    const article = result.rows[0];
    console.log('✅ Found article:', article.title);
    
    let widgetConfig = JSON.parse(article.widget_config);
    console.log('\n📋 WIDGETS ON THIS PAGE:');
    console.log('Total widgets:', widgetConfig.length);
    
    widgetConfig.forEach((widget, index) => {
      console.log(`\n${index + 1}. ${widget.type} (ID: ${widget.id})`);
      console.log(`   Enabled: ${widget.enabled !== false ? 'YES' : 'NO'}`);
      
      if (widget.type === 'stacked-quotes') {
        console.log(`   🎯 FOUND STACKED QUOTES!`);
        if (widget.config && widget.config.quotes) {
          console.log(`   Quotes count: ${widget.config.quotes.length}`);
          widget.config.quotes.forEach((quote, qIndex) => {
            console.log(`     ${qIndex + 1}. ${quote.name} - ${quote.location || 'No location'}`);
          });
        }
      }
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkPageWidgets();