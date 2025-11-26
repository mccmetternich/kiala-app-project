import { NextRequest, NextResponse } from 'next/server';
import { createQueries } from '@/lib/db-enhanced';
import { requirePermission } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await requirePermission('read', 'site')(request); // Assuming widget instances are tied to site management

    const queries = createQueries(); // Global context, but instance queries are site/page specific
    const instance = await queries.widgetQueries.getWidgetInstance(id);

    if (!instance) {
      return NextResponse.json({ message: 'Widget instance not found' }, { status: 404 });
    }

    return NextResponse.json(instance);
  } catch (error: any) {
    console.error('Error fetching widget instance:', error);
    if (error.message.includes('Permission denied')) {
      return NextResponse.json({ message: 'Permission denied' }, { status: 403 });
    }
    return NextResponse.json({ message: 'Failed to fetch widget instance', error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await requirePermission('update', 'site')(request); // Assuming widget instances are tied to site management

    const body = await request.json();
    const { settings } = body;

    const queries = createQueries();
    await queries.widgetQueries.updateWidgetInstance(id, settings);

    const updatedInstance = await queries.widgetQueries.getWidgetInstance(id);
    return NextResponse.json(updatedInstance);
  } catch (error: any) {
    console.error('Error updating widget instance:', error);
    if (error.message.includes('Permission denied')) {
      return NextResponse.json({ message: 'Permission denied' }, { status: 403 });
    }
    return NextResponse.json({ message: 'Failed to update widget instance', error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await requirePermission('delete', 'site')(request); // Assuming widget instances are tied to site management

    const queries = createQueries();
    await queries.widgetQueries.deleteWidgetInstance(id);

    return NextResponse.json({ message: 'Widget instance deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting widget instance:', error);
    if (error.message.includes('Permission denied')) {
      return NextResponse.json({ message: 'Permission denied' }, { status: 403 });
    }
    return NextResponse.json({ message: 'Failed to delete widget instance', error: error.message }, { status: 500 });
  }
}
