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

async function fixQuoteAvatars() {
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

    // Fix the community testimonials widget
    widgetConfig = widgetConfig.map(widget => {
      if (widget.id === 'community-testimonials' && widget.type === 'stacked-quotes') {
        console.log('Fixing community testimonials widget...');
        
        // Update the quotes with proper avatar images and better content
        widget.config.quotes = [
          {
            "id": "1",
            "name": "Diane R.",
            "location": "San Diego, CA",
            "image": "https://images.unsplash.com/photo-1494790108755-2616b332c449?w=100&h=100&fit=crop&crop=face",
            "content": "I've tried 6 different greens powders over the years - Athletic Greens, Bloom, Amazing Grass, you name it. Kiala is honestly the first one I actually look forward to drinking in the morning. The Miami Vice flavor tastes like vacation in a glass, and I've noticed my afternoon energy crashes are completely gone.",
            "rating": 5,
            "verified": true
          },
          {
            "id": "2", 
            "name": "Linda M.",
            "location": "Austin, TX",
            "image": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
            "content": "My 16-year-old daughter literally stole my Watermelon Slush container and finished it in three days. Now she has her own subscription and asks me every morning if I've had my 'green smoothie' yet. If it passes the teenager taste test, that says everything.",
            "rating": 5,
            "verified": true
          },
          {
            "id": "3",
            "name": "Rachel P.", 
            "location": "Denver, CO",
            "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
            "content": "I was a Bloom loyalist for over a year because I thought 'healthy has to taste terrible.' Switched to Kiala on a friend's recommendation and within a week noticed two things: my persistent bloating finally started improving, AND I actually enjoy my morning routine now instead of dreading that chalky aftertaste.",
            "rating": 5,
            "verified": true
          }
        ];
        
        console.log('✓ Updated community testimonials with proper avatars');
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

    console.log('✅ Successfully fixed quote avatars in database');

  } catch (error) {
    console.error('Error:', error);
  }
}

fixQuoteAvatars();