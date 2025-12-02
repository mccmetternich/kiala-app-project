import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || 'libsql://kiala-app-db-mccmetternich.aws-us-west-2.turso.io',
  authToken: process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NjQxMjMxMzksImlkIjoiNWIwN2Q5YTItOTgxMi00NWZkLWIwNDQtNWU4OTI3ZjliZDZlIiwicmlkIjoiOTE0MWIyNmMtZTg5My00NTViLTkzOGUtMWRkMzA0N2Q0NTdjIn0.GUnVauEA3pYhuWMLPvHAZmGsb5E-NDbDm6QH0QWkq1NYYNMNp1I1ZFPtCYWiPUUYTW0CZ16-OZQVyUOO99ulAg'
});

async function checkWidgets() {
  const result = await client.execute({
    sql: `SELECT widget_config FROM articles WHERE id = ?`,
    args: ['k2IxMEsu9zzsw_Hd3BaU4']
  });

  if (!result.rows[0]) {
    console.log('Article not found!');
    return;
  }

  const widgets = JSON.parse(result.rows[0].widget_config);

  console.log('Total widgets:', widgets.length);
  console.log('\nLooking for doctor widgets...\n');

  widgets.forEach((w, i) => {
    if (w.type === 'doctor-assessment' || w.type === 'doctor-closing-word' || w.id === 'endorsement-section' || w.id === 'closing-word') {
      console.log(`Position ${i}: ${w.type} (id: ${w.id})`);
      console.log('  Config:', JSON.stringify(w.config, null, 2).substring(0, 200) + '...');
    }
  });
}

checkWidgets();
