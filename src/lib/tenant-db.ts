import db from './db-enhanced';

/**
 * Secure Tenant-Aware Database Wrapper
 * Automatically injects site_id filtering to prevent data leakage between tenants
 * Updated to use LibSQL/Turso for serverless compatibility
 */
export class TenantDB {
  private tenantId: string;

  constructor(tenantId: string) {
    if (!tenantId) {
      throw new Error('TenantDB requires a valid tenantId');
    }
    this.tenantId = tenantId;
  }

  /**
   * Execute a SELECT query with automatic tenant filtering
   * Automatically adds WHERE site_id = ? condition to prevent cross-tenant data access
   */
  async select<T = any>(query: string, params: any[] = []): Promise<T[]> {
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

    const result = await db.execute({ sql: tenantQuery, args: tenantParams });
    return result.rows as T[];
  }

  /**
   * Execute a single SELECT query with automatic tenant filtering
   */
  async selectOne<T = any>(query: string, params: any[] = []): Promise<T | undefined> {
    const results = await this.select<T>(query, params);
    return results[0];
  }

  /**
   * Execute an INSERT with automatic site_id injection
   */
  async insert(table: string, data: Record<string, any>): Promise<any> {
    // Automatically inject site_id
    const insertData = { ...data, site_id: this.tenantId };

    const columns = Object.keys(insertData);
    const placeholders = columns.map(() => '?').join(', ');
    const values = Object.values(insertData);

    const query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;

    return db.execute({ sql: query, args: values });
  }

  /**
   * Execute an UPDATE with automatic tenant filtering
   */
  async update(table: string, data: Record<string, any>, whereClause: string, whereParams: any[] = []): Promise<any> {
    const setClause = Object.keys(data)
      .map(key => `${key} = ?`)
      .join(', ');

    const values = Object.values(data);

    // Add tenant isolation to WHERE clause
    const tenantWhereClause = `${whereClause} AND site_id = ?`;
    const tenantParams = [...whereParams, this.tenantId];

    const query = `UPDATE ${table} SET ${setClause} WHERE ${tenantWhereClause}`;

    return db.execute({ sql: query, args: [...values, ...tenantParams] });
  }

  /**
   * Execute a DELETE with automatic tenant filtering
   */
  async delete(table: string, whereClause: string, whereParams: any[] = []): Promise<any> {
    // Add tenant isolation to WHERE clause
    const tenantWhereClause = `${whereClause} AND site_id = ?`;
    const tenantParams = [...whereParams, this.tenantId];

    const query = `DELETE FROM ${table} WHERE ${tenantWhereClause}`;

    return db.execute({ sql: query, args: tenantParams });
  }

  /**
   * Execute raw query (for admin/cross-tenant operations)
   * Use with extreme caution - bypasses tenant isolation
   */
  async raw(query: string, params: any[] = []): Promise<any[]> {
    console.warn('🚨 TenantDB.raw() bypasses tenant isolation - use with caution');
    const result = await db.execute({ sql: query, args: params });
    return result.rows as any[];
  }

  /**
   * Get tenant-specific count
   */
  async count(table: string, whereClause?: string, whereParams: any[] = []): Promise<number> {
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

    const result = await db.execute({ sql: query, args: params });
    const row = result.rows[0] as any;
    return row?.count || 0;
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
  async getAllArticles() {
    return this.tenantDb.select(`
      SELECT * FROM articles
      ORDER BY created_at DESC
    `);
  }

  async getPublishedArticles() {
    return this.tenantDb.select(`
      SELECT * FROM articles
      WHERE published = 1
      ORDER BY created_at DESC
    `);
  }

  async getArticleBySlug(slug: string) {
    return this.tenantDb.selectOne(`
      SELECT * FROM articles
      WHERE slug = ?
    `, [slug]);
  }

  // Email subscribers
  async getAllEmails() {
    return this.tenantDb.select(`
      SELECT * FROM emails
      ORDER BY created_at DESC
    `);
  }

  async getRecentEmails(days: number = 30) {
    return this.tenantDb.select(`
      SELECT * FROM emails
      WHERE created_at >= datetime('now', '-${days} days')
      ORDER BY created_at DESC
    `);
  }

  // Blocks
  async getPageBlocks(pageId: string) {
    return this.tenantDb.select(`
      SELECT * FROM blocks
      WHERE page_id = ?
      ORDER BY position ASC
    `, [pageId]);
  }

  // Site info
  async getSiteStats() {
    const articles = await this.tenantDb.count('articles', 'published = 1');
    const emails = await this.tenantDb.count('emails');
    const viewsResult = await this.tenantDb.select(`
      SELECT SUM(views) as total FROM articles WHERE published = 1
    `);
    const totalViews = (viewsResult[0] as any)?.total || 0;

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
