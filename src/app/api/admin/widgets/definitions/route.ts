import { NextRequest, NextResponse } from 'next/server';
import { createQueries } from '@/lib/db-enhanced';
import { nanoid } from 'nanoid';
import { requirePermission } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await requirePermission('read', 'site')(request); // Assuming widget definitions are tied to site management

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    const queries = createQueries(); // Global context for widget definitions
    const definitions = await queries.widgetQueries.getWidgetDefinitions(category || undefined);

    return NextResponse.json(definitions);
  } catch (error: any) {
    console.error('Error fetching widget definitions:', error);
    if (error.message.includes('Permission denied')) {
      return NextResponse.json({ message: 'Permission denied' }, { status: 403 });
    }
    return NextResponse.json({ message: 'Failed to fetch widget definitions', error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requirePermission('create', 'site')(request); // Assuming widget definitions are tied to site management

    const body = await request.json();
    const id = nanoid();
    
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
    await queries.widgetQueries.registerWidget(definition);

    return NextResponse.json(definition, { status: 201 });
  } catch (error: any) {
    console.error('Error creating widget definition:', error);
    if (error.message.includes('Permission denied')) {
      return NextResponse.json({ message: 'Permission denied' }, { status: 403 });
    }
    return NextResponse.json({ message: 'Failed to create widget definition', error: error.message }, { status: 500 });
  }
}
