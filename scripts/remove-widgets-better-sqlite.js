const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Try different database paths
const dbPaths = [
  path.join(__dirname, '..', 'local.db'),
  path.join(__dirname, '..', 'kiala.db'),
  path.join(__dirname, '..', 'data', 'kiala.db'),
  path.join(__dirname, '..', 'data', 'local.db')
];

async function findDatabase() {
  for (const dbPath of dbPaths) {
    if (fs.existsSync(dbPath)) {
      console.log('Found database at:', dbPath);
      return dbPath;
    }
  }
  throw new Error('No database found. Searched paths: ' + dbPaths.join(', '));
}

async function removeUnwantedWidgets() {
  try {
    const dbPath = await findDatabase();
    const db = new Database(dbPath);

    // Check if tables exist
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log('Available tables:', tables.map(t => t.name));

    // Get the article from the database
    let sql = `SELECT id, slug, widget_config FROM articles 
               WHERE slug = 'bloom-vs-kiala-greens-powder-comparison'`;
    
    let stmt = db.prepare(sql);
    let row = stmt.get();

    if (!row) {
      // Try finding any article with similar slug
      console.log('Exact match not found, searching for similar articles...');
      sql = `SELECT id, slug, title, widget_config FROM articles 
             WHERE slug LIKE '%bloom%' OR title LIKE '%Bloom%'`;
      stmt = db.prepare(sql);
      const similarRows = stmt.all();
      console.log('Similar articles found:');
      similarRows.forEach(r => console.log(`  ${r.id}: ${r.slug} - ${r.title}`));
      
      if (similarRows.length === 0) {
        console.log('No articles found');
        db.close();
        return;
      }
      
      // Use the first matching article
      row = similarRows[0];
      console.log(`Using article: ${row.slug}`);
    }

    console.log('Found article with ID:', row.id);
    console.log('Article slug:', row.slug);

    let widgetConfig;
    
    try {
      widgetConfig = JSON.parse(row.widget_config);
    } catch (parseErr) {
      console.error('Error parsing widget_config:', parseErr);
      console.log('Raw widget_config:', row.widget_config.substring(0, 200));
      db.close();
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
          console.log('Fixed testimonial CTA text');
        }
      }
      
      // Fix opening hook to remove Sarah reference
      if (widget.id === 'opening-hook' && widget.type === 'text-block') {
        if (widget.config && widget.config.content) {
          widget.config.content = widget.config.content.replace('"Sarah, is Bloom or Kiala better?"', '"Is Bloom or Kiala better?"');
          console.log('Fixed opening hook Sarah reference');
        }
      }

      return widget;
    });

    console.log(`Removed ${originalLength - widgetConfig.length} widgets`);
    console.log('Filtered widgets:', widgetConfig.length);
    console.log('Remaining widget types:', widgetConfig.map(w => `${w.id} (${w.type})`));

    // Update the database
    const updateStmt = db.prepare(`UPDATE articles 
                                   SET widget_config = ?, updated_at = CURRENT_TIMESTAMP
                                   WHERE id = ?`);
                         
    const result = updateStmt.run(JSON.stringify(widgetConfig), row.id);
    
    if (result.changes > 0) {
      console.log('✅ Successfully removed unwanted widgets from database');
    } else {
      console.log('❌ No changes made to database');
    }
    
    db.close();

  } catch (error) {
    console.error('Error:', error);
  }
}

removeUnwantedWidgets();