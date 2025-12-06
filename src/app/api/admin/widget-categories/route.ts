import { NextRequest, NextResponse } from 'next/server';
import { createQueries } from '@/lib/db-enhanced';
import { nanoid } from 'nanoid';

const queries = createQueries();

/**
 * GET /api/admin/widget-categories
 * Get all widget categories (global + site-specific if siteId provided)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get('siteId');

    // Get global categories
    const globalCategories = await queries.queryAll(
      'SELECT * FROM widget_categories WHERE is_global = 1 ORDER BY sort_order ASC'
    );

    // Get site-specific categories if siteId provided
    let siteCategories: any[] = [];
    if (siteId) {
      siteCategories = await queries.queryAll(
        'SELECT * FROM widget_categories WHERE site_id = ? AND is_global = 0 ORDER BY sort_order ASC',
        [siteId]
      );
    }

    return NextResponse.json({
      success: true,
      global: globalCategories,
      site: siteCategories,
    });
  } catch (error) {
    console.error('Error fetching widget categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch widget categories' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/widget-categories
 * Create a new widget category
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      siteId,
      description,
      colorBg = 'bg-gray-500/10',
      colorText = 'text-gray-400',
      colorBorder = 'border-gray-500/30',
      icon,
      isGlobal = false,
    } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Category name is required' },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    // Get max sort order
    const maxOrderResult = await queries.queryOne(
      'SELECT MAX(sort_order) as max_order FROM widget_categories WHERE site_id IS ? OR (? IS NULL AND is_global = 1)',
      [siteId || null, siteId || null]
    );
    const sortOrder = (maxOrderResult?.max_order || 0) + 1;

    const id = nanoid();
    await queries.execute(
      `INSERT INTO widget_categories (id, site_id, name, slug, description, color_bg, color_text, color_border, icon, sort_order, is_global)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, isGlobal ? null : siteId, name, slug, description, colorBg, colorText, colorBorder, icon, sortOrder, isGlobal ? 1 : 0]
    );

    return NextResponse.json({
      success: true,
      category: {
        id,
        name,
        slug,
        description,
        colorBg,
        colorText,
        colorBorder,
        icon,
        sortOrder,
        isGlobal,
        siteId: isGlobal ? null : siteId,
      },
    });
  } catch (error) {
    console.error('Error creating widget category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create widget category' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/widget-categories
 * Reorder categories
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { categories } = body; // Array of { id, sortOrder }

    if (!categories || !Array.isArray(categories)) {
      return NextResponse.json(
        { success: false, error: 'Categories array is required' },
        { status: 400 }
      );
    }

    // Update sort orders
    for (const cat of categories) {
      await queries.execute(
        'UPDATE widget_categories SET sort_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [cat.sortOrder, cat.id]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering widget categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reorder widget categories' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/widget-categories
 * Delete a category (widgets in it become uncategorized)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Category ID is required' },
        { status: 400 }
      );
    }

    // Don't allow deleting global default categories
    const category = await queries.queryOne(
      'SELECT * FROM widget_categories WHERE id = ?',
      [id]
    );

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    // Move widgets in this category to null (uncategorized)
    await queries.execute(
      'UPDATE site_widget_settings SET category_id = NULL WHERE category_id = ?',
      [id]
    );

    // Delete the category
    await queries.execute('DELETE FROM widget_categories WHERE id = ?', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting widget category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete widget category' },
      { status: 500 }
    );
  }
}
