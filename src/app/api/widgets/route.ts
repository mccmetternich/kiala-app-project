import { NextRequest, NextResponse } from 'next/server';
import { widgetRegistry } from '@/lib/widget-registry';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const siteId = searchParams.get('siteId');
    const pageId = searchParams.get('pageId');

    if (siteId) {
      // Get widget instances for a site/page
      const instances = await widgetRegistry.getWidgetInstances(siteId, pageId || undefined);
      return NextResponse.json({ instances });
    } else {
      // Get widget definitions
      const definitions = await widgetRegistry.getWidgetDefinitions(category);
      return NextResponse.json({ definitions });
    }
  } catch (error) {
    console.error('Error fetching widgets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch widgets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'register_widget':
        await widgetRegistry.registerWidget(data.definition);
        return NextResponse.json({ success: true });

      case 'create_instance':
        const instanceId = await widgetRegistry.createWidgetInstance(
          data.siteId,
          data.widgetId,
          data.pageId || null,
          data.settings || {}
        );
        return NextResponse.json({ instanceId });

      case 'update_instance':
        await widgetRegistry.updateWidgetInstance(data.instanceId, data.settings);
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error processing widget request:', error);
    return NextResponse.json(
      { error: 'Failed to process widget request' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const instanceId = searchParams.get('instanceId');

    if (!instanceId) {
      return NextResponse.json(
        { error: 'instanceId is required' },
        { status: 400 }
      );
    }

    await widgetRegistry.deleteWidgetInstance(instanceId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting widget instance:', error);
    return NextResponse.json(
      { error: 'Failed to delete widget instance' },
      { status: 500 }
    );
  }
}