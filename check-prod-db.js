import { createClient } from '@libsql/client';

// This is the PRODUCTION database URL from the health endpoint
const client = createClient({
  url: 'libsql://kiala-app-db-mccmetternich.aws-us-west-2.turso.io', // Production DB
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NjQxMjMxMzksImlkIjoiNWIwN2Q5YTItOTgxMi00NWZkLWIwNDQtNWU4OTI3ZjliZDZlIiwicmlkIjoiOTE0MWIyNmMtZTg5My00NTViLTkzOGUtMWRkMzA0N2Q0NTdjIn0.GUnVauEA3pYhuWMLPvHAZmGsb5E-NDbDm6QH0QWkq1NYYNMNp1I1ZFPtCYWiPUUYTW0CZ16-OZQVyUOO99ulAg',
});

async function checkProdDb() {
  try {
    console.log('🔍 Checking PRODUCTION database...');
    
    // Check site
    const siteResult = await client.execute(`
      SELECT id, subdomain FROM sites WHERE subdomain = 'goodness-authority'
    `);
    
    if (siteResult.rows.length > 0) {
      const siteId = siteResult.rows[0].id;
      console.log('✅ Production site ID:', siteId);
      
      // Check if the article exists
      const articleResult = await client.execute(`
        SELECT id, title, slug, published, widget_config
        FROM articles 
        WHERE slug = 'kiala-gummies-vs-seed-ritual-probiotics-comparison'
        AND site_id = ?
      `, [siteId]);
      
      if (articleResult.rows.length > 0) {
        const article = articleResult.rows[0];
        console.log('✅ Article found in production:', article.title);
        console.log('   Widget count:', JSON.parse(article.widget_config || '[]').length);
        
        // Check comparison table
        const widgets = JSON.parse(article.widget_config || '[]');
        const comparisonWidget = widgets.find(w => w.type === 'comparison-table');
        
        if (comparisonWidget) {
          console.log('📊 Comparison widget found!');
          console.log('   Title:', comparisonWidget.props?.title);
          console.log('   Rows:', comparisonWidget.props?.rows?.length);
          
          if (comparisonWidget.props?.rows?.length > 0) {
            console.log('   First row:', comparisonWidget.props.rows[0]);
          }
        } else {
          console.log('❌ No comparison widget found in production');
        }
      } else {
        console.log('❌ Article NOT found in production database');
      }
    } else {
      console.log('❌ Site not found in production');
    }
    
  } catch (error) {
    console.error('❌ Error checking production database:', error);
  } finally {
    client.close();
  }
}

checkProdDb();