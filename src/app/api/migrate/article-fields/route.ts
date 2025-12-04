import { NextResponse } from 'next/server';
import db from '@/lib/db-enhanced';

export async function GET() {
  const results: string[] = [];

  const columns = [
    "ALTER TABLE articles ADD COLUMN tracking_config TEXT DEFAULT '{}'",
    "ALTER TABLE articles ADD COLUMN author_name TEXT",
    "ALTER TABLE articles ADD COLUMN author_image TEXT",
    "ALTER TABLE articles ADD COLUMN display_views INTEGER DEFAULT 0",
    "ALTER TABLE articles ADD COLUMN display_likes INTEGER DEFAULT 0"
  ];

  for (const sql of columns) {
    try {
      await db.execute(sql);
      results.push(`✅ ${sql.substring(26, 60)}`);
    } catch (error: any) {
      if (error.message?.includes('duplicate') || error.message?.includes('already exists')) {
        results.push(`⏭️ Already exists: ${sql.substring(26, 60)}`);
      } else {
        results.push(`❌ Error: ${error.message}`);
      }
    }
  }

  return NextResponse.json({ success: true, results });
}
