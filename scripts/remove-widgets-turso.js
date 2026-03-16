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

async function removeUnwantedWidgets() {
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
      console.log('Article not found, searching for similar...');
      const searchResult = await client.execute({
        sql: `SELECT id, slug, title FROM articles 
              WHERE title LIKE '%Bloom%' OR slug LIKE '%bloom%'`,
        args: []
      });
      
      console.log('Similar articles found:');
      searchResult.rows.forEach(r => console.log(`  ${r.id}: ${r.slug} - ${r.title}`));
      return;
    }

    const article = result.rows[0];
    console.log('Found article:', article.title);
    console.log('Article ID:', article.id);

    let widgetConfig;
    
    try {
      widgetConfig = JSON.parse(article.widget_config);
    } catch (parseErr) {
      console.error('Error parsing widget_config:', parseErr);
      return;
    }

    console.log('Original widgets:', widgetConfig.length);
    console.log('Widget types:', widgetConfig.map(w => `${w.id} (${w.type})`));

    // Remove unwanted widgets
    const unwantedTypes = ['doctor-assessment', 'exclusive-product', 'doctor-closing-word'];
    const unwantedIds = ['doctor-assessment', 'product-recommendation', 'doctor-closing-word'];
    
    const originalLength = widgetConfig.length;
    widgetConfig = widgetConfig.filter(widget => {
      const shouldRemove = unwantedTypes.includes(widget.type) || unwantedIds.includes(widget.id);
      if (shouldRemove) {
        console.log(`✗ Removing widget: ${widget.id} (${widget.type})`);
      }
      return !shouldRemove;
    });

    // Update widget config to fix testimonial body and remove Sarah references
    widgetConfig = widgetConfig.map(widget => {
      if (widget.id === 'hero-testimonial' && widget.type === 'testimonial-hero') {
        // Fix the testimonial body to remove "Sarah was right"
        if (widget.config && widget.config.body) {
          const oldBody = widget.config.body;
          widget.config.body = widget.config.body.replace('Sarah was right.', 'the formula is just different.');
          widget.config.ctaText = 'Get the Same Results Margaret Did';
          if (oldBody !== widget.config.body) {
            console.log('✓ Fixed testimonial body to remove Sarah reference');
          }
        }
      }
      
      // Fix opening hook to remove Sarah reference
      if (widget.id === 'opening-hook' && widget.type === 'text-block') {
        if (widget.config && widget.config.content) {
          const oldContent = widget.config.content;
          widget.config.content = widget.config.content.replace('"Sarah, is Bloom or Kiala better?"', '"Is Bloom or Kiala better?"');
          if (oldContent !== widget.config.content) {
            console.log('✓ Fixed opening hook to remove Sarah reference');
          }
        }
      }

      return widget;
    });

    console.log(`Removed ${originalLength - widgetConfig.length} widgets`);
    console.log('Remaining widgets:', widgetConfig.length);
    console.log('Final widget types:', widgetConfig.map(w => `${w.id} (${w.type})`));

    // Update the database
    await client.execute({
      sql: `UPDATE articles 
            SET widget_config = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?`,
      args: [JSON.stringify(widgetConfig), article.id]
    });

    console.log('✅ Successfully removed unwanted widgets and fixed content in database');
    
    // Also update the research data to add the missing 4th data point
    const updatedWidgetConfig = widgetConfig.map(widget => {
      if (widget.id === 'research-data' && widget.type === 'data-overview') {
        if (widget.config && widget.config.stats) {
          // Add the 4th data point if it doesn't exist
          const hasNitricOxide = widget.config.stats.some(stat => stat.label.includes('nitric oxide'));
          if (!hasNitricOxide) {
            widget.config.stats.push({
              "value": "95%",
              "label": "increase in bioavailable nitric oxide",
              "icon": "activity",
              "color": "blue"
            });
            console.log('✓ Added missing 4th research data point');
          }
        }
      }
      return widget;
    });

    // Update with the research data fix
    await client.execute({
      sql: `UPDATE articles 
            SET widget_config = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?`,
      args: [JSON.stringify(updatedWidgetConfig), article.id]
    });

    console.log('✅ Updated research data with 4th data point');

  } catch (error) {
    console.error('Error:', error);
  }
}

removeUnwantedWidgets();