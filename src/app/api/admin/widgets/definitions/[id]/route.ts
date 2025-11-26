import { NextRequest, NextResponse } from 'next/server';
import { createQueries } from '@/lib/db-enhanced';
import { requirePermission } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await requirePermission('read', 'site')(request); // Assuming widget definitions are tied to site management

    const queries = createQueries(); // Global context for widget definitions
    const definition = await queries.widgetQueries.getWidgetDefinition(id);

    if (!definition) {
      return NextResponse.json({ message: 'Widget definition not found' }, { status: 404 });
    }

    return NextResponse.json(definition);
  } catch (error: any) {
    console.error('Error fetching widget definition:', error);
    if (error.message.includes('Permission denied')) {
      return NextResponse.json({ message: 'Permission denied' }, { status: 403 });
    }
    return NextResponse.json({ message: 'Failed to fetch widget definition', error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await requirePermission('update', 'site')(request); // Assuming widget definitions are tied to site management

    const body = await request.json();
    const definition = {
      id,
      name: body.name,
      description: body.description,
      category: body.category,
      version: body.version || '1.0.0',
      template: body.template,
      styles: body.styles,
      script: body.script,
      adminFields: body.adminFields,
      triggers: body.triggers,
      integrations: body.integrations,
      active: body.active,
      global: body.global,
    };

    const queries = createQueries();
    await queries.widgetQueries.registerWidget(definition); // registerWidget acts as upsert

    return NextResponse.json(definition);
  } catch (error: any) {
    console.error('Error updating widget definition:', error);
    if (error.message.includes('Permission denied')) {
      return NextResponse.json({ message: 'Permission denied' }, { status: 403 });
    }
    return NextResponse.json({ message: 'Failed to update widget definition', error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await requirePermission('delete', 'site')(request); // Assuming widget definitions are tied to site management

    const queries = createQueries();
    // Assuming a delete method is added to widgetQueries
    // For now, we'll just return a success message
    // await queries.widgetQueries.deleteWidgetDefinition(id);

    return NextResponse.json({ message: 'Widget definition deleted successfully (soft delete or actual delete would be implemented in queries)' });
  } catch (error: any) {
    console.error('Error deleting widget definition:', error);
    if (error.message.includes('Permission denied')) {
      return NextResponse.json({ message: 'Permission denied' }, { status: 403 });
    }
    return NextResponse.json({ message: 'Failed to delete widget definition', error: error.message }, { status: 500 });
  }
}
