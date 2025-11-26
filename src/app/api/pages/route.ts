import { NextRequest, NextResponse } from 'next/server';
import { createQueries } from '@/lib/db-enhanced';
import { nanoid } from 'nanoid';

// GET /api/pages
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get('siteId');
    const slug = searchParams.get('slug');
    const tenantId = request.headers.get('X-Tenant-Id') || undefined;

    if (!siteId) {
      return NextResponse.json({ error: 'Site ID is required' }, { status: 400 });
    }

    const queries = createQueries(tenantId);

    if (slug) {
      // Get specific page by slug
      const page = await queries.pageQueries.getBySlug(siteId, slug);
      return NextResponse.json(page ? [page] : []);
    }

    // Get all pages for site
    const pages = await queries.pageQueries.getAllBySite(siteId);
    return NextResponse.json(pages);
  } catch (error) {
    console.error('Error fetching pages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/pages
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { siteId, title, slug, content, template = 'default', published = false } = body;
    const tenantId = request.headers.get('X-Tenant-Id') || undefined;

    if (!siteId || !title || !slug) {
      return NextResponse.json({ error: 'Site ID, title, and slug are required' }, { status: 400 });
    }

    const queries = createQueries(tenantId);
    const id = nanoid();
    const pageData = {
      id,
      site_id: siteId,
      title,
      slug,
      content: content || '',
      template,
      published,
    };
    await queries.pageQueries.create(pageData);

    return NextResponse.json({ id, ...body }, { status: 201 });
  } catch (error) {
    console.error('Error creating page:', error);
    if ((error as any).message?.includes('UNIQUE constraint')) {
      return NextResponse.json({ error: 'Page with this slug already exists for this site' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}