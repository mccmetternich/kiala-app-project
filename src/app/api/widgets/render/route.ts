import { NextRequest, NextResponse } from 'next/server';
import { widgetRegistry } from '@/lib/widget-registry';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const instanceId = searchParams.get('instanceId');

    if (!instanceId) {
      return NextResponse.json(
        { error: 'instanceId is required' },
        { status: 400 }
      );
    }

    const html = await widgetRegistry.renderWidget(instanceId);
    
    // Return HTML content with appropriate headers
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=300' // 5 minute cache
      }
    });
  } catch (error) {
    console.error('Error rendering widget:', error);
    return new Response(
      `<!-- Error rendering widget: ${error} -->`,
      {
        headers: {
          'Content-Type': 'text/html'
        },
        status: 500
      }
    );
  }
}