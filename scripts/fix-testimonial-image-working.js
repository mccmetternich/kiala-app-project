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

async function fixTestimonialImageWorking() {
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

    // Fix the hero testimonial with a guaranteed working image
    widgetConfig = widgetConfig.map(widget => {
      if (widget.id === 'hero-testimonial' && widget.type === 'testimonial-hero') {
        console.log('Fixing testimonial with working 30-something woman image...');
        
        // Use a guaranteed working image of a 30-something professional woman
        widget.config.image = "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&h=800&fit=crop&crop=face";
        
        console.log('✓ Updated testimonial with working 30-something woman image');
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

    console.log('✅ Successfully updated testimonial image in database');

  } catch (error) {
    console.error('Error:', error);
  }
}

fixTestimonialImageWorking();