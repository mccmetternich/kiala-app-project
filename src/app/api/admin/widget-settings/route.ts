import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db-enhanced';
import { nanoid } from 'nanoid';

// Helper functions for raw SQL queries
async function queryAll(sql: string, args: any[] = []): Promise<any[]> {
  const result = await db.execute({ sql, args });
  return result.rows as any[];
}

async function queryOne(sql: string, args: any[] = []): Promise<any> {
  const result = await db.execute({ sql, args });
  return result.rows[0] || null;
}

async function execute(sql: string, args: any[] = []) {
  return db.execute({ sql, args });
}

/**
 * GET /api/admin/widget-settings
 * Get widget settings for a site (ordering, hidden widgets, custom names)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get('siteId');

    if (!siteId) {
      return NextResponse.json(
        { success: false, error: 'Site ID is required' },
        { status: 400 }
      );
    }

    const settings = await queryAll(
      'SELECT * FROM site_widget_settings WHERE site_id = ? ORDER BY sort_order ASC',
      [siteId]
    );

    return NextResponse.json({
      success: true,
      settings: settings.map((s: any) => ({
        id: s.id,
        siteId: s.site_id,
        widgetType: s.widget_type,
        categoryId: s.category_id,
        sortOrder: s.sort_order,
        hidden: s.hidden === 1,
        customName: s.custom_name,
      })),
    });
  } catch (error) {
    console.error('Error fetching widget settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch widget settings' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/widget-settings
 * Update widget settings (move to category, reorder, hide, rename)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { siteId, widgetType, categoryId, sortOrder, hidden, customName } = body;

    if (!siteId || !widgetType) {
      return NextResponse.json(
        { success: false, error: 'Site ID and widget type are required' },
        { status: 400 }
      );
    }

    // Check if setting exists
    const existing = await queryOne(
      'SELECT id FROM site_widget_settings WHERE site_id = ? AND widget_type = ?',
      [siteId, widgetType]
    );

    if (existing) {
      // Update existing setting
      const updates: string[] = [];
      const values: any[] = [];

      if (categoryId !== undefined) {
        updates.push('category_id = ?');
        values.push(categoryId);
      }
      if (sortOrder !== undefined) {
        updates.push('sort_order = ?');
        values.push(sortOrder);
      }
      if (hidden !== undefined) {
        updates.push('hidden = ?');
        values.push(hidden ? 1 : 0);
      }
      if (customName !== undefined) {
        updates.push('custom_name = ?');
        values.push(customName);
      }
      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(existing.id);

      await execute(
        `UPDATE site_widget_settings SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    } else {
      // Create new setting
      const id = nanoid();
      await execute(
        `INSERT INTO site_widget_settings (id, site_id, widget_type, category_id, sort_order, hidden, custom_name)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, siteId, widgetType, categoryId || null, sortOrder || 0, hidden ? 1 : 0, customName || null]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating widget settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update widget settings' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/widget-settings
 * Batch update widget ordering (for drag and drop)
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { siteId, updates } = body; // updates: Array of { widgetType, categoryId, sortOrder }

    if (!siteId || !updates || !Array.isArray(updates)) {
      return NextResponse.json(
        { success: false, error: 'Site ID and updates array are required' },
        { status: 400 }
      );
    }

    // Process each update
    for (const update of updates) {
      const { widgetType, categoryId, sortOrder } = update;

      // Check if setting exists
      const existing = await queryOne(
        'SELECT id FROM site_widget_settings WHERE site_id = ? AND widget_type = ?',
        [siteId, widgetType]
      );

      if (existing) {
        await execute(
          `UPDATE site_widget_settings
           SET category_id = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [categoryId, sortOrder, existing.id]
        );
      } else {
        const id = nanoid();
        await execute(
          `INSERT INTO site_widget_settings (id, site_id, widget_type, category_id, sort_order)
           VALUES (?, ?, ?, ?, ?)`,
          [id, siteId, widgetType, categoryId, sortOrder]
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error batch updating widget settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to batch update widget settings' },
      { status: 500 }
    );
  }
}
