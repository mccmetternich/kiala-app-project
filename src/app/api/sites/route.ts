import { NextRequest, NextResponse } from 'next/server';
import { createQueries } from '@/lib/db-enhanced';
import { nanoid } from 'nanoid';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subdomain = searchParams.get('subdomain');
    const domain = searchParams.get('domain');
    const publishedOnly = searchParams.get('publishedOnly') === 'true';
    const tenantId = request.headers.get('X-Tenant-Id') || undefined;
    const queries = createQueries(tenantId);

    if (subdomain) {
      // Fetch site by subdomain
      const site = await queries.siteQueries.getBySubdomain(subdomain);

      // For public requests, only return published sites
      if (publishedOnly && site && site.status !== 'published') {
        return NextResponse.json({ site: null });
      }

      return NextResponse.json({ site });
    }

    if (domain) {
      // Fetch site by custom domain
      const site = await queries.siteQueries.getByDomain(domain);

      // For public requests, only return published sites
      if (publishedOnly && site && site.status !== 'published') {
        return NextResponse.json({ site: null });
      }

      return NextResponse.json({ site });
    }

    // Fetch all sites
    const sites = await queries.siteQueries.getAll();
    return NextResponse.json({ sites });
  } catch (error: any) {
    console.error('Error fetching sites:', error);
    return NextResponse.json({
      error: 'Failed to fetch sites',
      details: error?.message || String(error)
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tenantId = request.headers.get('X-Tenant-Id') || undefined;
    const queries = createQueries(tenantId);
    const { name, domain, subdomain, theme = 'medical', settings = {}, brand_profile = {}, status = 'draft' } = body;

    const id = nanoid();
    const siteData = {
      id,
      name,
      domain,
      subdomain,
      theme,
      settings,
      brand_profile,
      status
    };
    
    await queries.siteQueries.create(siteData);

    const site = await queries.siteQueries.getById(id);
    return NextResponse.json({ site }, { status: 201 });
  } catch (error) {
    console.error('Error creating site:', error);
    return NextResponse.json({ error: 'Failed to create site' }, { status: 500 });
  }
}