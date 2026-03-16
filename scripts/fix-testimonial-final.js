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

async function fixTestimonialFinal() {
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

    // Fix the hero testimonial with proper 30-something woman image and age
    widgetConfig = widgetConfig.map(widget => {
      if (widget.id === 'hero-testimonial' && widget.type === 'testimonial-hero') {
        console.log('Fixing testimonial with 30-something woman and updating age to 32...');
        
        // Use a proper 30-something professional woman image
        widget.config.image = "https://images.unsplash.com/photo-1494790108755-2616b332c449?w=600&h=800&fit=crop&crop=face";
        
        // Update the testimonial body to reflect age 32 instead of 56
        widget.config.body = `Margaret, 32 — Community Member, Verified

"I was on Bloom for 8 months and thought my bloating was just 'how I am now.' My daughter told me about Kiala and I switched on a whim. Within 5 days the bloating I'd accepted as permanent started to lift. It's been 3 months and I feel like I have my body back. I genuinely didn't think a greens powder could make this much difference — the formula is just different."`;
        
        console.log('✓ Updated testimonial with 30-something woman image and age 32');
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

    console.log('✅ Successfully updated testimonial image and age in database');

  } catch (error) {
    console.error('Error:', error);
  }
}

fixTestimonialFinal();