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

async function updateCtaLinks() {
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
    const newUrl = 'https://kialanutrition.com/products/super-greens-gummies-bundle';

    // Update all CTA URLs in widgets
    widgetConfig = widgetConfig.map(widget => {
      let updated = false;
      
      // Update hero testimonial CTA
      if (widget.id === 'hero-testimonial' && widget.type === 'testimonial-hero') {
        if (widget.config && widget.config.ctaUrl) {
          widget.config.ctaUrl = newUrl;
          console.log('✓ Updated hero testimonial CTA URL');
          updated = true;
        }
      }
      
      // Update us-vs-them comparison CTA
      if (widget.type === 'us-vs-them-comparison') {
        if (widget.config && widget.config.showCta && widget.config.ctaUrl) {
          widget.config.ctaUrl = newUrl;
          console.log('✓ Updated us-vs-them comparison CTA URL');
          updated = true;
        }
      }
      
      // Update stacked quotes CTA
      if (widget.id === 'community-testimonials' && widget.type === 'stacked-quotes') {
        if (widget.config && widget.config.ctaUrl && widget.config.ctaUrl !== '#') {
          widget.config.ctaUrl = newUrl;
          console.log('✓ Updated stacked quotes CTA URL');
          updated = true;
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

    console.log('✅ Successfully updated all CTA links in database');

  } catch (error) {
    console.error('Error:', error);
  }
}

updateCtaLinks();