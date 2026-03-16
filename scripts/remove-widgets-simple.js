const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Try different database paths
const dbPaths = [
  path.join(__dirname, '..', 'local.db'),
  path.join(__dirname, '..', 'kiala.db'),
  path.join(__dirname, '..', 'data', 'kiala.db'),
  path.join(__dirname, '..', 'data', 'local.db')
];

async function findDatabase() {
  const fs = require('fs');
  for (const dbPath of dbPaths) {
    if (fs.existsSync(dbPath)) {
      console.log('Found database at:', dbPath);
      return dbPath;
    }
  }
  throw new Error('No database found');
}

async function removeUnwantedWidgets() {
  try {
    const dbPath = await findDatabase();
    const db = new sqlite3.Database(dbPath);

    // Get the article from the database
    const sql = `SELECT id, widget_config FROM articles 
                 WHERE slug = 'bloom-vs-kiala-greens-powder-comparison'`;
    
    db.get(sql, [], (err, row) => {
      if (err) {
        console.error('Error fetching article:', err);
        return;
      }

      if (!row) {
        console.log('Article not found');
        return;
      }

      console.log('Found article with ID:', row.id);
      let widgetConfig;
      
      try {
        widgetConfig = JSON.parse(row.widget_config);
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

      console.log(`Removed ${originalLength - widgetConfig.length} widgets`);
      console.log('Filtered widgets:', widgetConfig.length);
      console.log('Remaining widget types:', widgetConfig.map(w => `${w.id} (${w.type})`));

      // Update the database
      const updateSql = `UPDATE articles 
                         SET widget_config = ?, updated_at = CURRENT_TIMESTAMP
                         WHERE id = ?`;
                         
      db.run(updateSql, [JSON.stringify(widgetConfig), row.id], function(err) {
        if (err) {
          console.error('Error updating article:', err);
        } else {
          console.log('✅ Successfully removed unwanted widgets from database');
        }
        db.close();
      });
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

removeUnwantedWidgets();