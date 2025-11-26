import { NextRequest, NextResponse } from 'next/server';
import { createQueries } from '@/lib/db-enhanced';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    const { email, siteId, source = 'community' } = await request.json();
    const tenantId = request.headers.get('X-Tenant-Id') || undefined;

    if (!email || !siteId) {
      return NextResponse.json({ error: 'Email and siteId are required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const queries = createQueries(tenantId);

    // Check if email already exists for this site
    const existingSignup = await queries.emailQueries.getByEmail(email, siteId);
    if (existingSignup) {
      return NextResponse.json({
        message: 'Email already registered',
        alreadyExists: true
      }, { status: 200 });
    }

    // Create new signup using the subscribers API format
    const id = nanoid();
    await queries.emailQueries.create({
      id,
      siteId,
      email,
      source
    });

    return NextResponse.json({
      success: true,
      message: 'Email successfully registered'
    });

  } catch (error) {
    console.error('Error creating email signup:', error);
    return NextResponse.json({
      error: 'Failed to register email'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get('siteId');
    const format = searchParams.get('format');
    const tenantId = request.headers.get('X-Tenant-Id') || undefined;
    const queries = createQueries(tenantId);

    if (!siteId) {
      return NextResponse.json({ error: 'siteId is required' }, { status: 400 });
    }

    const signups = await queries.emailQueries.getAllBySite(siteId) as any[];

    // If CSV format requested, return CSV
    if (format === 'csv') {
      const headers = ['Email', 'Source', 'IP Address', 'User Agent', 'Created At'];
      const csvRows = [
        headers.join(','),
        ...signups.map(signup => [
          signup.email,
          signup.source,
          signup.ip_address || 'unknown',
          `"${(signup.user_agent || 'unknown').replace(/"/g, '""')}"`, // Escape quotes
          new Date(signup.created_at).toISOString()
        ].join(','))
      ];

      const csv = csvRows.join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="email-signups-${siteId || 'all'}-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }

    return NextResponse.json({ signups });

  } catch (error) {
    console.error('Error fetching email signups:', error);
    return NextResponse.json({
      error: 'Failed to fetch email signups'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { email, siteId } = await request.json();
    const tenantId = request.headers.get('X-Tenant-Id') || undefined;

    if (!email || !siteId) {
      return NextResponse.json({ error: 'Email and siteId are required' }, { status: 400 });
    }

    const queries = createQueries(tenantId);
    await queries.emailQueries.delete(email, siteId);

    return NextResponse.json({
      success: true,
      message: 'Email signup deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting email signup:', error);
    return NextResponse.json({
      error: 'Failed to delete email signup'
    }, { status: 500 });
  }
}
