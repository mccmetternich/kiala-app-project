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

async function changeLindaAvatar() {
  try {
    console.log('Connecting to Turso database...');
    
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    // Get the article from the database
    const result = await client.execute({
      sql: `SELECT id, slug, title, widget_config FROM articles 
            WHERE slug = 'bloom-vs-kiala-greens-powder-comparison' 
            AND site_id = (SELECT id FROM sites WHERE subdomain = 'goodness-authority')`,
      args: []
    });

    if (result.rows.length === 0) {
      console.log('Article not found');
      return;
    }

    const article = result.rows[0];
    console.log('Found article:', article.title);

    let widgetConfig = JSON.parse(article.widget_config);

    // Find and update Linda's/Lisa's avatar in stacked quotes
    widgetConfig = widgetConfig.map(widget => {
      if (widget.type === 'stacked-quotes') {
        console.log('Found stacked quotes widget...');
        
        if (widget.config.quotes) {
          widget.config.quotes = widget.config.quotes.map(quote => {
            if (quote.name.includes('Lisa') || quote.name.includes('Linda')) {
              console.log(`Changing avatar for ${quote.name}...`);
              // Use a different woman's image
              quote.image = "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop&crop=face";
              console.log(`✓ Updated ${quote.name}'s avatar`);
            }
            return quote;
          });
        }
      }
      
      return widget;
    });

    // Update the database
    await client.execute({
      sql: `UPDATE articles 
            SET widget_config = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?`,
      args: [JSON.stringify(widgetConfig), article.id]
    });

    console.log('✅ Successfully updated Linda/Lisa avatar in database');

  } catch (error) {
    console.error('Error:', error);
  }
}

changeLindaAvatar();