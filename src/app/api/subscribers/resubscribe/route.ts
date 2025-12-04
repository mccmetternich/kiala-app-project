import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db-enhanced';

async function execute(sql: string, args: any[] = []) {
  return db.execute({ sql, args });
}

// POST - Re-subscribe an unsubscribed email (admin action)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, siteId } = body;

    if (!email || !siteId) {
      return NextResponse.json(
        { error: 'Email and siteId are required' },
        { status: 400 }
      );
    }

    const result = await execute(
      `UPDATE email_subscribers
       SET status = 'active', unsubscribed_at = NULL
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
      message: 'Successfully re-subscribed'
    });

  } catch (error) {
    console.error('Error re-subscribing:', error);
    return NextResponse.json(
      { error: 'Failed to re-subscribe' },
      { status: 500 }
    );
  }
}
