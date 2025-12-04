import { NextRequest, NextResponse } from 'next/server';
import { createQueries } from '@/lib/db-enhanced';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const tenantId = request.headers.get('X-Tenant-Id') || undefined;
    const queries = createQueries(tenantId);
    const site = await queries.siteQueries.getById(id);
    
    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    return NextResponse.json({ site });
  } catch (error) {
    console.error('Error fetching site:', error);
    return NextResponse.json({ error: 'Failed to fetch site' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const tenantId = request.headers.get('X-Tenant-Id') || undefined;
    const queries = createQueries(tenantId);
    
    const { name, domain, subdomain, theme, settings, brand_profile, content_profile, status } = body;

    const siteData = {
      name,
      domain,
      subdomain,
      theme,
      settings,
      brand_profile,
      content_profile,
      status,
    };
    await queries.siteQueries.update(id, siteData);

    const updatedSite = await queries.siteQueries.getById(id);
    return NextResponse.json({ site: updatedSite });
  } catch (error) {
    console.error('Error updating site:', error);
    return NextResponse.json({ error: 'Failed to update site' }, { status: 500 });
  }
}