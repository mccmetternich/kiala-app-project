import { NextRequest, NextResponse } from 'next/server';

// This route is a thin proxy to /api/subscribers for backwards compatibility
// Widgets like NewsletterSignup, ArticleGrid, StackedQuotes use /api/emails
// The actual logic lives in /api/subscribers/route.ts

const SUBSCRIBERS_URL = '/api/subscribers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Forward to subscribers API with same body
    const subscribersUrl = new URL(SUBSCRIBERS_URL, request.url);
    const response = await fetch(subscribersUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': request.headers.get('user-agent') || '',
        'X-Forwarded-For': request.headers.get('x-forwarded-for') || '',
      },
      body: JSON.stringify({
        ...body,
        source: body.source || 'newsletter_widget' // Default source for widget signups
      }),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.error('Error in /api/emails proxy:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    );
  }
}
