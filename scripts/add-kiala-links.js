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

async function addKialaLinks() {
  try {
    console.log('Connecting to Turso database...');
    
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    // Get the article from the database
    const result = await client.execute({
      sql: `SELECT id, slug, title, widget_config FROM articles 
            WHERE slug = 'kiala-gummies-vs-seed-ritual-probiotics-comparison' 
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
    const kialaUrl = 'https://kialanutrition.com/products/super-greens-gummies';

    // Function to add links to Kiala mentions in text content
    function addLinksToKiala(text) {
      // Simple replacement - add links to "Kiala" mentions that aren't already linked
      if (text.includes('<a') && text.includes('Kiala')) {
        // If there are already links in the text, be more careful
        return text.replace(/\bKiala\b/g, (match, offset, string) => {
          // Check if this Kiala is already inside a link tag
          const before = string.substring(0, offset);
          const openTags = (before.match(/<a\b/g) || []).length;
          const closeTags = (before.match(/<\/a>/g) || []).length;
          
          if (openTags > closeTags) {
            // We're inside a link tag, don't add another link
            return match;
          } else {
            return `<a href="${kialaUrl}" target="_blank" class="text-accent-600 hover:text-accent-700 underline">${match}</a>`;
          }
        });
      } else {
        // No existing links, simple replacement
        return text.replace(/\bKiala\b/g, 
          `<a href="${kialaUrl}" target="_blank" class="text-accent-600 hover:text-accent-700 underline">Kiala</a>`);
      }
    }

    // Update text blocks with Kiala links
    let linksAdded = 0;
    widgetConfig = widgetConfig.map(widget => {
      if (widget.type === 'text-block' && widget.config && widget.config.content) {
        const originalContent = widget.config.content;
        const updatedContent = addLinksToKiala(originalContent);
        
        if (originalContent !== updatedContent) {
          widget.config.content = updatedContent;
          linksAdded++;
          console.log(`✓ Added Kiala links to ${widget.id || 'text-block'}`);
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

    console.log(`✅ Successfully added Kiala links to ${linksAdded} text blocks in database`);

  } catch (error) {
    console.error('Error:', error);
  }
}

addKialaLinks();