import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';

// Database connection
const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
const db = drizzle(client);

async function removeUnwantedWidgets() {
  try {
    // Get the article from the database
    const result = await client.execute({
      sql: `SELECT id, widget_config FROM articles 
            WHERE slug = 'bloom-vs-kiala-greens-powder-comparison' 
            AND site_id = (SELECT id FROM sites WHERE subdomain = 'goodness-authority')`,
      args: []
    });

    if (result.rows.length === 0) {
      console.log('Article not found');
      return;
    }

    const article = result.rows[0];
    let widgetConfig = JSON.parse(article.widget_config);

    console.log('Original widgets:', widgetConfig.length);
    console.log('Widget types:', widgetConfig.map(w => `${w.id} (${w.type})`));

    // Remove unwanted widgets
    const unwantedTypes = ['doctor-assessment', 'exclusive-product', 'doctor-closing-word'];
    const unwantedIds = ['doctor-assessment', 'product-recommendation', 'doctor-closing-word'];
    
    widgetConfig = widgetConfig.filter(widget => {
      const shouldRemove = unwantedTypes.includes(widget.type) || unwantedIds.includes(widget.id);
      if (shouldRemove) {
        console.log(`Removing widget: ${widget.id} (${widget.type})`);
      }
      return !shouldRemove;
    });

    // Update widget config to fix testimonial body and remove Sarah references
    widgetConfig = widgetConfig.map(widget => {
      if (widget.id === 'hero-testimonial' && widget.type === 'testimonial-hero') {
        // Fix the testimonial body to remove "Sarah was right"
        if (widget.config && widget.config.body) {
          widget.config.body = widget.config.body.replace('Sarah was right.', 'the formula is just different.');
          widget.config.ctaText = 'Get the Same Results Margaret Did';
        }
      }
      
      // Fix opening hook to remove Sarah reference
      if (widget.id === 'opening-hook' && widget.type === 'text-block') {
        if (widget.config && widget.config.content) {
          widget.config.content = widget.config.content.replace('"Sarah, is Bloom or Kiala better?"', '"Is Bloom or Kiala better?"');
        }
      }

      return widget;
    });

    console.log('Filtered widgets:', widgetConfig.length);
    console.log('Remaining widget types:', widgetConfig.map(w => `${w.id} (${w.type})`));

    // Update the database
    await client.execute({
      sql: `UPDATE articles 
            SET widget_config = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?`,
      args: [JSON.stringify(widgetConfig), article.id]
    });

    console.log('✅ Successfully removed unwanted widgets from database');

  } catch (error) {
    console.error('Error removing widgets:', error);
  }
}

removeUnwantedWidgets();