import Database from 'better-sqlite3';
import { join } from 'path';

const dbPath = join(process.cwd(), 'data', 'kiala.db');

/**
 * Secure Tenant-Aware Database Wrapper
 * Automatically injects site_id filtering to prevent data leakage between tenants
 */
export class TenantDB {
  private db: Database.Database;
  private tenantId: string;

  constructor(tenantId: string) {
    if (!tenantId) {
      throw new Error('TenantDB requires a valid tenantId');
    }
    this.tenantId = tenantId;
    this.db = new Database(dbPath);
  }

  /**
   * Execute a SELECT query with automatic tenant filtering
   * Automatically adds WHERE site_id = ? condition to prevent cross-tenant data access
   */
  select<T = any>(query: string, params: any[] = []): T[] {
    // Validate that this is a SELECT query
    if (!query.trim().toLowerCase().startsWith('select')) {
      throw new Error('select() method only accepts SELECT queries');
    }

    // Check if query already has a WHERE clause
    const hasWhere = /\bwhere\b/i.test(query);
    
    // Add tenant isolation
    const tenantQuery = hasWhere
      ? query.replace(/\bwhere\b/i, `WHERE site_id = ? AND`)
      : query + ' WHERE site_id = ?';
    
    const tenantParams = [this.tenantId, ...params];
    
    return this.db.prepare(tenantQuery).all(...tenantParams) as T[];
  }

  /**
   * Execute a single SELECT query with automatic tenant filtering
   */
  selectOne<T = any>(query: string, params: any[] = []): T | undefined {
    const results = this.select<T>(query, params);
    return results[0];
  }

  /**
   * Execute an INSERT with automatic site_id injection
   */
  insert(table: string, data: Record<string, any>): Database.RunResult {
    // Automatically inject site_id
    const insertData = { ...data, site_id: this.tenantId };
    
    const columns = Object.keys(insertData);
    const placeholders = columns.map(() => '?').join(', ');
    const values = Object.values(insertData);
    
    const query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;
    
    return this.db.prepare(query).run(...values);
  }

  /**
   * Execute an UPDATE with automatic tenant filtering
   */
  update(table: string, data: Record<string, any>, whereClause: string, whereParams: any[] = []): Database.RunResult {
    const setClause = Object.keys(data)
      .map(key => `${key} = ?`)
      .join(', ');
    
    const values = Object.values(data);
    
    // Add tenant isolation to WHERE clause
    const tenantWhereClause = `${whereClause} AND site_id = ?`;
    const tenantParams = [...whereParams, this.tenantId];
    
    const query = `UPDATE ${table} SET ${setClause} WHERE ${tenantWhereClause}`;
    
    return this.db.prepare(query).run(...values, ...tenantParams);
  }

  /**
   * Execute a DELETE with automatic tenant filtering
   */
  delete(table: string, whereClause: string, whereParams: any[] = []): Database.RunResult {
    // Add tenant isolation to WHERE clause
    const tenantWhereClause = `${whereClause} AND site_id = ?`;
    const tenantParams = [...whereParams, this.tenantId];
    
    const query = `DELETE FROM ${table} WHERE ${tenantWhereClause}`;
    
    return this.db.prepare(query).run(...tenantParams);
  }

  /**
   * Execute raw query (for admin/cross-tenant operations)
   * Use with extreme caution - bypasses tenant isolation
   */
  raw(query: string, params: any[] = []): any[] {
    console.warn('🚨 TenantDB.raw() bypasses tenant isolation - use with caution');
    return this.db.prepare(query).all(...params);
  }

  /**
   * Get tenant-specific count
   */
  count(table: string, whereClause?: string, whereParams: any[] = []): number {
    const baseQuery = `SELECT COUNT(*) as count FROM ${table}`;
    
    let query: string;
    let params: any[];
    
    if (whereClause) {
      query = `${baseQuery} WHERE ${whereClause} AND site_id = ?`;
      params = [...whereParams, this.tenantId];
    } else {
      query = `${baseQuery} WHERE site_id = ?`;
      params = [this.tenantId];
    }
    
    const result = this.db.prepare(query).get(...params) as { count: number };
    return result.count;
  }

  /**
   * Close database connection
   */
  close() {
    this.db.close();
  }

  /**
   * Get the tenant ID for this instance
   */
  getTenantId(): string {
    return this.tenantId;
  }
}

/**
 * Utility functions for common database patterns
 */
export class TenantQueries {
  constructor(private tenantDb: TenantDB) {}

  // Articles
  getAllArticles() {
    return this.tenantDb.select(`
      SELECT * FROM articles 
      ORDER BY created_at DESC
    `);
  }

  getPublishedArticles() {
    return this.tenantDb.select(`
      SELECT * FROM articles 
      WHERE published = 1 
      ORDER BY created_at DESC
    `);
  }

  getArticleBySlug(slug: string) {
    return this.tenantDb.selectOne(`
      SELECT * FROM articles 
      WHERE slug = ?
    `, [slug]);
  }

  // Email subscribers
  getAllEmails() {
    return this.tenantDb.select(`
      SELECT * FROM emails 
      ORDER BY created_at DESC
    `);
  }

  getRecentEmails(days: number = 30) {
    return this.tenantDb.select(`
      SELECT * FROM emails 
      WHERE created_at >= datetime('now', '-${days} days') 
      ORDER BY created_at DESC
    `);
  }

  // Blocks
  getPageBlocks(pageId: string) {
    return this.tenantDb.select(`
      SELECT * FROM blocks 
      WHERE page_id = ? 
      ORDER BY position ASC
    `, [pageId]);
  }

  // Site info
  getSiteStats() {
    const articles = this.tenantDb.count('articles', 'published = 1');
    const emails = this.tenantDb.count('emails');
    const totalViews = this.tenantDb.select(`
      SELECT SUM(views) as total FROM articles WHERE published = 1
    `)[0]?.total || 0;

    return {
      totalArticles: articles,
      totalEmails: emails,
      totalViews: totalViews,
      conversionRate: totalViews > 0 ? ((emails / totalViews) * 100).toFixed(1) : '0'
    };
  }
}

/**
 * Factory function to create tenant-specific database instances
 */
export function createTenantDB(siteId: string): TenantDB {
  return new TenantDB(siteId);
}

export function createTenantQueries(siteId: string): TenantQueries {
  return new TenantQueries(new TenantDB(siteId));
}