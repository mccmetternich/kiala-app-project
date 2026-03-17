import { createClient } from '@libsql/client';

const client = createClient({
  url: 'libsql://kiala-app-db-mccmetternich.aws-us-west-2.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NjQxMjMxMzksImlkIjoiNWIwN2Q5YTItOTgxMi00NWZkLWIwNDQtNWU4OTI3ZjliZDZlIiwicmlkIjoiOTE0MWIyNmMtZTg5My00NTViLTkzOGUtMWRkMzA0N2Q0NTdjIn0.GUnVauEA3pYhuWMLPvHAZmGsb5E-NDbDm6QH0QWkq1NYYNMNp1I1ZFPtCYWiPUUYTW0CZ16-OZQVyUOO99ulAg',
});

async function checkWidgets() {
  try {
    // Get the specific article
    const result = await client.execute({
      sql: `SELECT title, widget_config FROM articles WHERE slug = 'kiala-gummies-vs-seed-ritual-probiotics-comparison' AND site_id = (SELECT id FROM sites WHERE subdomain = 'goodness-authority')`,
      args: []
    });

    if (result.rows.length === 0) {
      console.log('❌ Article not found!');
      return;
    }

    const article = result.rows[0];
    const widgets = JSON.parse(article.widget_config || '[]');
    
    console.log('📄 Article:', article.title);
    console.log('📊 Total widgets:', widgets.length);
    console.log('');

    widgets.forEach((widget, i) => {
      console.log(`Widget ${i + 1}: ${widget.type}`);
      if (widget.type === 'comparison-table') {
        console.log('  Title:', widget.props?.title || 'No title');
        console.log('  Rows:', widget.props?.rows?.length || 0);
        if (widget.props?.rows?.length > 0) {
          widget.props.rows.forEach((row, j) => {
            console.log(`    Row ${j + 1}: ${row.feature}`);
            console.log(`      Standard: ${row.standard}`);
            console.log(`      Premium: ${row.premium}`);
          });
        }
      }
      console.log('');
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.close();
  }
}

checkWidgets();