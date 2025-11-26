import { NextRequest, NextResponse } from 'next/server';
import { createQueries } from '@/lib/db-enhanced';
import { nanoid } from 'nanoid';
import { requirePermission } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await requirePermission('read', 'site')(request); // Assuming widget instances are tied to site management

    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get('siteId');
    const pageId = searchParams.get('pageId');
    
    const queries = createQueries(); // Global context, but instance queries are site/page specific
    const instances = await queries.widgetQueries.getWidgetInstances(siteId || '', pageId || undefined);

    return NextResponse.json(instances);
  } catch (error: any) {
    console.error('Error fetching widget instances:', error);
    if (error.message.includes('Permission denied')) {
      return NextResponse.json({ message: 'Permission denied' }, { status: 403 });
    }
    return NextResponse.json({ message: 'Failed to fetch widget instances', error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requirePermission('create', 'site')(request); // Assuming widget instances are tied to site management

    const body = await request.json();
    const id = nanoid();
    
    const { widget_id, site_id, page_id, settings } = body;

    const queries = createQueries();
    const instanceId = await queries.widgetQueries.createWidgetInstance(widget_id, site_id, page_id, settings);

    return NextResponse.json({ id: instanceId, ...body }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating widget instance:', error);
    if (error.message.includes('Permission denied')) {
      return NextResponse.json({ message: 'Permission denied' }, { status: 403 });
    }
    return NextResponse.json({ message: 'Failed to create widget instance', error: error.message }, { status: 500 });
  }
}
