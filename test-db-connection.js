import { createClient } from '@libsql/client';

const client = createClient({
  url: 'libsql://kiala-app-db-mccmetternich.aws-us-west-2.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NjQxMjMxMzksImlkIjoiNWIwN2Q5YTItOTgxMi00NWZkLWIwNDQtNWU4OTI3ZjliZDZlIiwicmlkIjoiOTE0MWIyNmMtZTg5My00NTViLTkzOGUtMWRkMzA0N2Q0NTdjIn0.GUnVauEA3pYhuWMLPvHAZmGsb5E-NDbDm6QH0QWkq1NYYNMNp1I1ZFPtCYWiPUUYTW0CZ16-OZQVyUOO99ulAg',
});

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const result = await client.execute('SELECT 1 as test');
    console.log('✅ Database connection successful');
    
    // Test site lookup
    const siteResult = await client.execute(`
      SELECT id, subdomain, status FROM sites 
      WHERE subdomain = 'goodness-authority'
    `);
    
    if (siteResult.rows.length > 0) {
      console.log('✅ Site found:', siteResult.rows[0]);
      const siteId = siteResult.rows[0].id;
      
      // Test article lookup
      const articleResult = await client.execute(`
        SELECT id, title, slug, published, widget_config 
        FROM articles 
        WHERE slug = 'kiala-gummies-vs-seed-ritual-probiotics-comparison' 
        AND site_id = ?
      `, [siteId]);
      
      if (articleResult.rows.length > 0) {
        const article = articleResult.rows[0];
        console.log('✅ Article found:', {
          id: article.id,
          title: article.title,
          published: article.published,
          widgetCount: JSON.parse(article.widget_config || '[]').length
        });
        
        // Check widget config
        const widgets = JSON.parse(article.widget_config || '[]');
        const comparisonWidget = widgets.find(w => w.type === 'comparison-table');
        if (comparisonWidget) {
          console.log('✅ Comparison table widget found with', comparisonWidget.props?.rows?.length || 0, 'rows');
          console.log('   Title:', comparisonWidget.props?.title);
        } else {
          console.log('❌ No comparison table widget found');
        }
      } else {
        console.log('❌ Article not found');
      }
    } else {
      console.log('❌ Site not found');
    }
    
  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    client.close();
  }
}

testConnection();