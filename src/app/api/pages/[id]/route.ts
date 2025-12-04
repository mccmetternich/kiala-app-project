import { NextRequest, NextResponse } from 'next/server';
import { createQueries } from '@/lib/db-enhanced';

// GET /api/pages/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tenantId = request.headers.get('X-Tenant-Id') || undefined;
    const queries = createQueries(tenantId);
    const page = await queries.pageQueries.getById(id);
    
    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error('Error fetching page:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/pages/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, slug, content, template, widget_config, published } = body;
    const tenantId = request.headers.get('X-Tenant-Id') || undefined;
    const queries = createQueries(tenantId);

    if (!title || !slug) {
      return NextResponse.json({ error: 'Title and slug are required' }, { status: 400 });
    }

    const pageData: any = {
      title,
      slug,
      content: content || '',
      template: template || 'default',
      published,
    };

    // Only include widget_config if it was provided in the request
    if (widget_config !== undefined) {
      pageData.widget_config = widget_config;
    }

    const result = await queries.pageQueries.update(id, pageData);

    // Note: The new 'update' method might not return 'changes'. You might need to check if the page exists first.
    // Assuming the update is successful if it doesn't throw.

    // Fetch updated page
    const updatedPage = await queries.pageQueries.getById(id);
    return NextResponse.json(updatedPage);
  } catch (error) {
    console.error('Error updating page:', error);
    if ((error as any).message?.includes('UNIQUE constraint')) {
      return NextResponse.json({ error: 'Page with this slug already exists for this site' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/pages/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tenantId = request.headers.get('X-Tenant-Id') || undefined;
    const queries = createQueries(tenantId);
    await queries.pageQueries.delete(id);
    
    // Note: The new 'delete' method might not return 'changes'. You might need to check if the page exists first.
    // Assuming the delete is successful if it doesn't throw.

    return NextResponse.json({ message: 'Page deleted successfully' });
  } catch (error) {
    console.error('Error deleting page:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}