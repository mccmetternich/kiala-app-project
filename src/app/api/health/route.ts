import { NextResponse } from 'next/server';
import { createClient } from '@libsql/client/web';

export async function GET() {
  const checks = {
    timestamp: new Date().toISOString(),
    env: {
      TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL ? 'SET (' + process.env.TURSO_DATABASE_URL.substring(0, 30) + '...)' : 'NOT SET',
      TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN ? 'SET (length: ' + process.env.TURSO_AUTH_TOKEN.length + ')' : 'NOT SET',
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ? 'SET' : 'NOT SET',
    },
    database: 'not tested',
    error: null as string | null,
  };

  // Test database connection
  if (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) {
    try {
      const db = createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN,
      });

      const result = await db.execute('SELECT COUNT(*) as count FROM sites');
      checks.database = `Connected! Sites count: ${result.rows[0]?.count ?? 0}`;
    } catch (error: any) {
      checks.database = 'FAILED';
      checks.error = error.message || String(error);
    }
  } else {
    checks.database = 'SKIPPED - missing env vars';
  }

  return NextResponse.json(checks, {
    status: checks.error ? 500 : 200
  });
}
