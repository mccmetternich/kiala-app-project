import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db-enhanced';
import { cache, CacheTTL, withCache } from '@/lib/cache';
import { v4 as uuidv4 } from 'uuid';

// Helper to execute queries
async function queryAll(sql: string, args: any[] = []): Promise<any[]> {
  const result = await db.execute({ sql, args });
  return result.rows as any[];
}

async function execute(sql: string, args: any[] = []) {
  return db.execute({ sql, args });
}

// Note: Blocks table is created in db-enhanced.ts initDb()
// No lazy initialization needed

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get('pageId');
    const siteId = searchParams.get('siteId');

    if (!pageId || !siteId) {
      return NextResponse.json(
        { error: 'pageId and siteId are required' },
        { status: 400 }
      );
    }

    // Use caching for block queries
    const blocks = await withCache(
      `blocks:${siteId}:${pageId}`,
      CacheTTL.PAGE_BLOCKS,
      async () => queryAll(
        'SELECT * FROM blocks WHERE page_id = ? AND site_id = ? ORDER BY position ASC',
        [pageId, siteId]
      )
    );

    // Parse settings JSON
    const parsedBlocks = blocks.map((block: any) => ({
      ...block,
      settings: JSON.parse(block.settings),
      visible: Boolean(block.visible)
    }));

    return NextResponse.json({ blocks: parsedBlocks });

  } catch (error) {
    console.error('Error fetching blocks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blocks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pageId, siteId, blocks } = body;

    if (!pageId || !siteId || !Array.isArray(blocks)) {
      return NextResponse.json(
        { error: 'pageId, siteId, and blocks array are required' },
        { status: 400 }
      );
    }

    // Delete existing blocks for this page
    await execute('DELETE FROM blocks WHERE page_id = ? AND site_id = ?', [pageId, siteId]);

    // Insert new blocks using batch insert for better performance
    if (blocks.length > 0) {
      const values = blocks.map((block: any) => [
        block.id || uuidv4(),
        pageId,
        siteId,
        block.type,
        block.position,
        block.visible ? 1 : 0,
        JSON.stringify(block.settings)
      ]);

      // Insert blocks in parallel for better performance
      await Promise.all(values.map(v =>
        execute(
          `INSERT INTO blocks (id, page_id, site_id, type, position, visible, settings)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          v
        )
      ));
    }

    // Invalidate cache
    await cache.delete(`blocks:${siteId}:${pageId}`);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error saving blocks:', error);
    return NextResponse.json(
      { error: 'Failed to save blocks' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { block } = body;

    if (!block || !block.id) {
      return NextResponse.json(
        { error: 'Block data with id is required' },
        { status: 400 }
      );
    }

    const result = await execute(
      `UPDATE blocks
       SET type = ?, position = ?, visible = ?, settings = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        block.type,
        block.position,
        block.visible ? 1 : 0,
        JSON.stringify(block.settings),
        block.id
      ]
    );

    if (result.rowsAffected === 0) {
      return NextResponse.json(
        { error: 'Block not found' },
        { status: 404 }
      );
    }

    // Invalidate cache for this block's page
    if (block.site_id && block.page_id) {
      await cache.delete(`blocks:${block.site_id}:${block.page_id}`);
    } else {
      // Fallback: invalidate all block caches
      await cache.delPattern('blocks:*');
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error updating block:', error);
    return NextResponse.json(
      { error: 'Failed to update block' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const blockId = searchParams.get('blockId');
    const siteId = searchParams.get('siteId');
    const pageId = searchParams.get('pageId');

    if (!blockId) {
      return NextResponse.json(
        { error: 'blockId is required' },
        { status: 400 }
      );
    }

    const result = await execute('DELETE FROM blocks WHERE id = ?', [blockId]);

    if (result.rowsAffected === 0) {
      return NextResponse.json(
        { error: 'Block not found' },
        { status: 404 }
      );
    }

    // Invalidate cache
    if (siteId && pageId) {
      await cache.delete(`blocks:${siteId}:${pageId}`);
    } else {
      await cache.delPattern('blocks:*');
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting block:', error);
    return NextResponse.json(
      { error: 'Failed to delete block' },
      { status: 500 }
    );
  }
}
