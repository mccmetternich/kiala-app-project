import { NextResponse } from 'next/server';
import { createClient } from '@libsql/client/web';

export async function GET() {
  try {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url || !authToken) {
      return NextResponse.json({ error: 'Missing env vars' }, { status: 500 });
    }

    const db = createClient({ url, authToken });

    const result = await db.execute('SELECT * FROM sites');

    return NextResponse.json({
      success: true,
      rowCount: result.rows.length,
      sites: result.rows
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error?.message || String(error),
      stack: error?.stack
    }, { status: 500 });
  }
}
