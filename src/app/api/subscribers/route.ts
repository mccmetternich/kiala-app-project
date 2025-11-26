import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db-enhanced';
import { v4 as uuidv4 } from 'uuid';

// Helper to execute queries
async function queryAll(sql: string, args: any[] = []): Promise<any[]> {
  const result = await db.execute({ sql, args });
  return result.rows as any[];
}

async function queryOne(sql: string, args: any[] = []): Promise<any> {
  const result = await db.execute({ sql, args });
  return result.rows[0] || null;
}

async function execute(sql: string, args: any[] = []) {
  return db.execute({ sql, args });
}

// GET - Fetch subscribers for a site (admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get('siteId');
    const format = searchParams.get('format'); // 'json' or 'csv'

    if (!siteId) {
      return NextResponse.json({ error: 'siteId is required' }, { status: 400 });
    }

    const subscribers = await queryAll(
      'SELECT * FROM email_subscribers WHERE site_id = ? ORDER BY created_at DESC',
      [siteId]
    );

    // Return CSV if requested
    if (format === 'csv') {
      const csvHeaders = ['Email', 'Name', 'Source', 'Tags', 'Status', 'Page URL', 'Subscribed At'];
      const csvRows = subscribers.map(sub => [
        sub.email,
        sub.name || '',
        sub.source || 'website',
        sub.tags || '[]',
        sub.status,
        sub.page_url || '',
        sub.subscribed_at
      ]);

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="subscribers-${siteId}-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    // Return JSON with stats
    const totalCount = subscribers.length;
    const activeCount = subscribers.filter(s => s.status === 'active').length;
    const thisWeek = subscribers.filter(s => {
      const subDate = new Date(s.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return subDate >= weekAgo;
    }).length;

    return NextResponse.json({
      subscribers,
      stats: {
        total: totalCount,
        active: activeCount,
        thisWeek,
        unsubscribed: totalCount - activeCount
      }
    });
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
  }
}

// POST - Subscribe a new email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, siteId, source, tags, pageUrl } = body;

    if (!email || !siteId) {
      return NextResponse.json(
        { error: 'Email and siteId are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
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
      message: 'Successfully subscribed!',
      subscriber: { id, email: email.toLowerCase() }
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

// DELETE - Unsubscribe
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const siteId = searchParams.get('siteId');

    if (!email || !siteId) {
      return NextResponse.json(
        { error: 'Email and siteId are required' },
        { status: 400 }
      );
    }

    const result = await execute(
      `UPDATE email_subscribers
       SET status = 'unsubscribed', unsubscribed_at = CURRENT_TIMESTAMP
       WHERE site_id = ? AND email = ?`,
      [siteId, email.toLowerCase()]
    );

    if (result.rowsAffected === 0) {
      return NextResponse.json(
        { error: 'Subscriber not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed'
    });

  } catch (error) {
    console.error('Error unsubscribing:', error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
      { status: 500 }
    );
  }
}
