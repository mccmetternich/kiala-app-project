import { NextRequest, NextResponse } from 'next/server';
import { createQueries } from '@/lib/db-enhanced';

// GET - Fetch a specific navigation template
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tenantId = request.headers.get('X-Tenant-Id') || undefined;
    const queries = createQueries(tenantId);

    const template = await queries.navigationTemplateQueries.getById(id);

    if (!template) {
      return NextResponse.json({ error: 'Navigation template not found' }, { status: 404 });
    }

    return NextResponse.json({
      template: {
        ...template,
        config: typeof template.config === 'string' ? JSON.parse(template.config) : template.config,
        is_system: Boolean(template.is_system)
      }
    });
  } catch (error: any) {
    console.error('Error fetching navigation template:', error);
    return NextResponse.json({
      error: 'Failed to fetch navigation template',
      details: error?.message || String(error)
    }, { status: 500 });
  }
}

// PUT - Update a navigation template
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const tenantId = request.headers.get('X-Tenant-Id') || undefined;
    const queries = createQueries(tenantId);

    // Check if template exists
    const existing = await queries.navigationTemplateQueries.getById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Navigation template not found' }, { status: 404 });
    }

    // System templates can only have their config updated, not name/baseType
    if (existing.is_system && (body.name || body.baseType)) {
      return NextResponse.json({
        error: 'System templates can only have their config updated'
      }, { status: 400 });
    }

    const { name, description, baseType, config } = body;

    // Validate baseType if provided
    if (baseType) {
      const validBaseTypes = ['global', 'direct-response', 'minimal'];
      if (!validBaseTypes.includes(baseType)) {
        return NextResponse.json({
          error: `Invalid baseType. Must be one of: ${validBaseTypes.join(', ')}`
        }, { status: 400 });
      }
    }

    await queries.navigationTemplateQueries.update(id, {
      name,
      description,
      baseType,
      config
    });

    const template = await queries.navigationTemplateQueries.getById(id);

    return NextResponse.json({
      template: {
        ...template,
        config: typeof template?.config === 'string' ? JSON.parse(template.config) : template?.config,
        is_system: Boolean(template?.is_system)
      }
    });
  } catch (error: any) {
    console.error('Error updating navigation template:', error);
    return NextResponse.json({
      error: 'Failed to update navigation template',
      details: error?.message || String(error)
    }, { status: 500 });
  }
}

// DELETE - Delete a navigation template
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tenantId = request.headers.get('X-Tenant-Id') || undefined;
    const queries = createQueries(tenantId);

    // Check if template exists
    const existing = await queries.navigationTemplateQueries.getById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Navigation template not found' }, { status: 404 });
    }

    // Cannot delete system templates
    if (existing.is_system) {
      return NextResponse.json({
        error: 'Cannot delete system templates'
      }, { status: 400 });
    }

    await queries.navigationTemplateQueries.delete(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting navigation template:', error);
    return NextResponse.json({
      error: 'Failed to delete navigation template',
      details: error?.message || String(error)
    }, { status: 500 });
  }
}
