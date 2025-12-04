import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || 'libsql://kiala-app-db-mccmetternich.aws-us-west-2.turso.io',
  authToken: process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NjQxMjMxMzksImlkIjoiNWIwN2Q5YTItOTgxMi00NWZkLWIwNDQtNWU4OTI3ZjliZDZlIiwicmlkIjoiOTE0MWIyNmMtZTg5My00NTViLTkzOGUtMWRkMzA0N2Q0NTdjIn0.GUnVauEA3pYhuWMLPvHAZmGsb5E-NDbDm6QH0QWkq1NYYNMNp1I1ZFPtCYWiPUUYTW0CZ16-OZQVyUOO99ulAg'
});

const newTitle = "The Hidden Hormone Disruptor: Why Your Gut Is Sabotaging Your Menopause Journey (And the Simple Fix Doctors Are Now Recommending)";

const result = await client.execute({
  sql: 'UPDATE articles SET title = ? WHERE slug = ?',
  args: [newTitle, 'foods-naturally-balance-hormones']
});

console.log('Title updated! Rows affected:', result.rowsAffected);
