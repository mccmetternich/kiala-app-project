import { NextRequest, NextResponse } from 'next/server';
import { createQueries } from '@/lib/db-enhanced';
import db from '@/lib/db-enhanced';
import crypto from 'crypto';

// Hash IP for privacy
function hashIP(ip: string): string {
  return crypto.createHash('sha256').update(ip + 'kiala-salt').digest('hex').substring(0, 16);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Get article to find site_id
    const tenantId = request.headers.get('X-Tenant-Id') || undefined;
    const queries = createQueries(tenantId);
    const article = await queries.articleQueries.getById(id);

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Get request metadata for tracking
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown';
    const ipHash = hashIP(ip);
    const userAgent = request.headers.get('user-agent') || null;
    const referrer = request.headers.get('referer') || null;

    // Log real view to article_views table (for admin analytics)
    await db.execute({
      sql: `INSERT INTO article_views (article_id, site_id, ip_hash, user_agent, referrer)
            VALUES (?, ?, ?, ?, ?)`,
      args: [id, article.site_id, ipHash, userAgent, referrer]
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging view:', error);
    return NextResponse.json({ error: 'Failed to log view' }, { status: 500 });
  }
}