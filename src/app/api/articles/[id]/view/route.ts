import { NextRequest, NextResponse } from 'next/server';
import { createQueries } from '@/lib/db-enhanced';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const tenantId = request.headers.get('X-Tenant-Id') || undefined;
    const queries = createQueries(tenantId);
    await queries.articleQueries.incrementViews(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error incrementing views:', error);
    return NextResponse.json({ error: 'Failed to increment views' }, { status: 500 });
  }
}