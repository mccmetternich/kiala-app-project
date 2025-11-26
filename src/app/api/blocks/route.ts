import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db-enhanced';
import { v4 as uuidv4 } from 'uuid';

// Helper to execute queries
async function queryAll(sql: string, args: any[] = []): Promise<any[]> {
  const result = await db.execute({ sql, args });
  return result.rows as any[];
}

async function execute(sql: string, args: any[] = []) {
  return db.execute({ sql, args });
}

// Initialize blocks table on first use
async function initBlocksTable() {
  await execute(`
    CREATE TABLE IF NOT EXISTS blocks (
      id TEXT PRIMARY KEY,
      page_id TEXT NOT NULL,
      site_id TEXT NOT NULL,
      type TEXT NOT NULL,
      position INTEGER NOT NULL,
      visible BOOLEAN DEFAULT 1,
      settings TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await execute(`CREATE INDEX IF NOT EXISTS idx_blocks_page_site ON blocks(page_id, site_id)`);
  await execute(`CREATE INDEX IF NOT EXISTS idx_blocks_position ON blocks(position)`);
}

// Flag to track initialization
let initialized = false;

export async function GET(request: NextRequest) {
  try {
    // Initialize table if needed
    if (!initialized) {
      await initBlocksTable();
      initialized = true;
    }

    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get('pageId');
    const siteId = searchParams.get('siteId');

    if (!pageId || !siteId) {
      return NextResponse.json(
        { error: 'pageId and siteId are required' },
        { status: 400 }
      );
    }

    const blocks = await queryAll(
      'SELECT * FROM blocks WHERE page_id = ? AND site_id = ? ORDER BY position ASC',
      [pageId, siteId]
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
    // Initialize table if needed
    if (!initialized) {
      await initBlocksTable();
      initialized = true;
    }

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

    // Insert new blocks
    for (const block of blocks) {
      await execute(
        `INSERT INTO blocks (id, page_id, site_id, type, position, visible, settings)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          block.id || uuidv4(),
          pageId,
          siteId,
          block.type,
          block.position,
          block.visible ? 1 : 0,
          JSON.stringify(block.settings)
        ]
      );
    }

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
    // Initialize table if needed
    if (!initialized) {
      await initBlocksTable();
      initialized = true;
    }

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
    // Initialize table if needed
    if (!initialized) {
      await initBlocksTable();
      initialized = true;
    }

    const { searchParams } = new URL(request.url);
    const blockId = searchParams.get('blockId');

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

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting block:', error);
    return NextResponse.json(
      { error: 'Failed to delete block' },
      { status: 500 }
    );
  }
}
