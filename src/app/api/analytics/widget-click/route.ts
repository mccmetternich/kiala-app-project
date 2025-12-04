import { NextRequest, NextResponse } from 'next/server';
import { createQueries } from '@/lib/db-enhanced';
import crypto from 'crypto';

// Record a widget click (only external clicks count for conversion)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      site_id,
      article_id,
      widget_id,
      widget_type,
      widget_name,
      click_type,
      destination_url,
      is_external,
      session_id
    } = body;

    if (!site_id || !widget_type) {
      return NextResponse.json({ error: 'site_id and widget_type are required' }, { status: 400 });
    }

    // Get IP and hash it for privacy (used for unique visitor tracking)
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = forwarded?.split(',')[0] || realIp || 'unknown';
    const ipHash = crypto.createHash('sha256').update(ip + 'kiala-salt').digest('hex').substring(0, 16);

    const userAgent = request.headers.get('user-agent') || '';

    const queries = createQueries();
    await queries.analyticsQueries.recordWidgetClick({
      site_id,
      article_id,
      widget_id,
      widget_type,
      widget_name,
      click_type: click_type || 'cta',
      destination_url,
      is_external: is_external !== false, // Default to true if not specified
      ip_hash: ipHash,
      session_id: session_id || ipHash, // Fall back to IP hash if no session ID
      user_agent: userAgent.substring(0, 500)
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error recording widget click:', error);
    return NextResponse.json({ error: 'Failed to record click' }, { status: 500 });
  }
}
