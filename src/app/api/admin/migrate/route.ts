import { NextRequest, NextResponse } from 'next/server';
import { initDb } from '@/lib/db-enhanced';
import { requirePermission } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Protect this route
    // await requirePermission('update', 'tenant')(request);

    await initDb();

    return NextResponse.json({ success: true, message: 'Database migration completed successfully.' });
  } catch (error: any) {
    console.error('Error running migration:', error);
    if (error.message.includes('Permission denied')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }
    return NextResponse.json({ success: false, message: 'Migration failed.', error: error.message }, { status: 500 });
  }
}
