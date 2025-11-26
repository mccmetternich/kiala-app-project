import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db-enhanced';
import { v4 as uuidv4 } from 'uuid';

// Helper to execute queries
async function queryOne(sql: string, args: any[] = []): Promise<any> {
  const result = await db.execute({ sql, args });
  return result.rows[0] || null;
}

async function execute(sql: string, args: any[] = []) {
  return db.execute({ sql, args });
}

// This is an alias for /api/subscribers to support the NewsletterSignup widget
// which calls /api/emails
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, siteId: providedSiteId, source = 'newsletter_widget', name, tags, pageUrl } = body;

    if (!email || !providedSiteId) {
      return NextResponse.json({ error: 'Email and siteId are required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Resolve siteId - it could be either the actual ID or a subdomain
    let siteId = providedSiteId;

    // Check if providedSiteId is a subdomain and resolve to actual ID
    const siteBySubdomain = await queryOne(
      'SELECT id FROM sites WHERE subdomain = ?',
      [providedSiteId]
    ) as { id: string } | null;

    if (siteBySubdomain) {
      siteId = siteBySubdomain.id;
    } else {
      // Verify the siteId exists
      const siteById = await queryOne(
        'SELECT id FROM sites WHERE id = ?',
        [providedSiteId]
      ) as { id: string } | null;

      if (!siteById) {
        return NextResponse.json({ error: 'Invalid site' }, { status: 400 });
      }
    }

    // Get request metadata
    const userAgent = request.headers.get('user-agent') || '';
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';

    // Check if subscriber already exists
    const existingSubscriber = await queryOne(
      'SELECT * FROM email_subscribers WHERE site_id = ? AND email = ?',
      [siteId, email.toLowerCase()]
    ) as any;

    if (existingSubscriber) {
      // If they unsubscribed before, reactivate them
      if (existingSubscriber.status === 'unsubscribed') {
        await execute(
          `UPDATE email_subscribers
           SET status = 'active',
               unsubscribed_at = NULL,
               source = ?,
               tags = ?,
               page_url = ?
           WHERE id = ?`,
          [
            source || existingSubscriber.source,
            JSON.stringify(tags || []),
            pageUrl || existingSubscriber.page_url,
            existingSubscriber.id
          ]
        );

        return NextResponse.json({
          success: true,
          message: 'Welcome back! You have been resubscribed.',
          subscriber: { id: existingSubscriber.id, email: existingSubscriber.email }
        });
      }

      return NextResponse.json({
        success: true,
        message: 'You are already subscribed!',
        subscriber: { id: existingSubscriber.id, email: existingSubscriber.email }
      });
    }

    // Create new subscriber
    const id = uuidv4();
    await execute(
      `INSERT INTO email_subscribers (id, site_id, email, name, source, tags, ip_address, user_agent, page_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        siteId,
        email.toLowerCase(),
        name || null,
        source || 'website',
        JSON.stringify(tags || []),
        ipAddress,
        userAgent,
        pageUrl || null
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed!'
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating subscriber:', error);

    // Handle unique constraint violation gracefully
    if (error.message?.includes('UNIQUE constraint')) {
      return NextResponse.json({
        success: true,
        message: 'You are already subscribed!'
      });
    }

    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    );
  }
}
