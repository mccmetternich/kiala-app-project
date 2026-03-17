import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function checkArticles() {
  try {
    // Get all articles for goodness-authority
    const result = await client.execute({
      sql: `SELECT id, title, slug FROM articles 
            WHERE site_id = (SELECT id FROM sites WHERE subdomain = 'goodness-authority')
            ORDER BY title`,
      args: []
    });

    console.log('All articles:');
    result.rows.forEach(row => {
      console.log(`- ${row.title} (${row.slug})`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.close();
  }
}

checkArticles();