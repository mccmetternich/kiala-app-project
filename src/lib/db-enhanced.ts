/**
 * Enhanced Database Module
 *
 * Provides Turso/LibSQL database operations with:
 * - Automatic connection management for serverless environments
 * - Built-in caching with TTL support
 * - Type-safe query helpers
 * - Multi-tenant isolation support
 *
 * @module db-enhanced
 *
 * @example
 * ```typescript
 * import { createQueries } from '@/lib/db-enhanced';
 *
 * const queries = createQueries();
 * const site = await queries.siteQueries.getBySubdomain('dr-amy');
 * ```
 */

import { createClient, type Client } from '@libsql/client/web';
import { cache, CacheTTL, withCache } from './cache';
import { v4 as uuidv4 } from 'uuid';

// Re-export database types for convenience
export type {
  SiteRow,
  ArticleRow,
  PageRow,
  MediaRow,
  EmailSubscriberRow,
  UserRow,
  TenantRow,
  ActivityLogRow,
  WidgetDefinitionRow,
  WidgetInstanceRow,
  BlockRow,
} from '@/types/database';

export { toBool, parseJSON, parseTags } from '@/types/database';

/**
 * Creates a fresh Turso client for each request.
 * In serverless environments, reusing clients across invocations can cause
 * issues with private class members, so we create a new client per request.
 *
 * @throws {Error} If TURSO_DATABASE_URL or TURSO_AUTH_TOKEN env vars are missing
 * @returns {Client} A new Turso/LibSQL client instance
 */
function getDb(): Client {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    throw new Error('Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN environment variables');
  }

  return createClient({
    url,
    authToken,
  });
}

/**
 * Database proxy that creates fresh connections per query.
 * Use db.execute({ sql, args }) for all database operations.
 */
const db = {
  execute: (query: { sql: string; args?: any[] }) => getDb().execute(query),
};

/**
 * Executes a query and returns all matching rows.
 *
 * @param sql - SQL query string with ? placeholders
 * @param args - Array of parameter values
 * @returns Promise resolving to array of row objects
 *
 * @example
 * const articles = await queryAll(
 *   'SELECT * FROM articles WHERE site_id = ?',
 *   [siteId]
 * );
 */
async function queryAll(sql: string, args: any[] = []): Promise<any[]> {
  const result = await db.execute({ sql, args });
  return result.rows as any[];
}

/**
 * Executes a query and returns the first matching row or null.
 *
 * @param sql - SQL query string with ? placeholders
 * @param args - Array of parameter values
 * @returns Promise resolving to row object or null
 *
 * @example
 * const site = await queryOne(
 *   'SELECT * FROM sites WHERE subdomain = ?',
 *   ['dr-amy']
 * );
 */
async function queryOne(sql: string, args: any[] = []): Promise<any> {
  const result = await db.execute({ sql, args });
  return result.rows[0] || null;
}

/**
 * Executes an INSERT, UPDATE, or DELETE statement.
 *
 * @param sql - SQL statement with ? placeholders
 * @param args - Array of parameter values
 * @returns Promise resolving to execution result with rowsAffected
 *
 * @example
 * await execute(
 *   'UPDATE articles SET views = views + 1 WHERE id = ?',
 *   [articleId]
 * );
 */
async function execute(sql: string, args: any[] = []) {
  return db.execute({ sql, args });
}

/**
 * Initializes the database schema with all required tables and indexes.
 * Safe to call multiple times - uses CREATE TABLE IF NOT EXISTS.
 *
 * Tables created:
 * - tenants: Multi-tenant organizations
 * - users: User accounts with roles
 * - sites: Website configurations
 * - articles: Blog/content articles
 * - pages: Static pages
 * - media: Uploaded files (Cloudinary)
 * - email_subscribers: Email list
 * - activity_log: Audit trail
 * - widget_definitions: Widget templates
 * - widget_instances: Widget placements
 * - blocks: Page builder blocks
 *
 * @example
 * // Call via /api/admin/migrate endpoint
 * await initDb();
 */
export async function initDb() {
  // Enable foreign keys
  await execute('PRAGMA foreign_keys = ON');

  // Tenants table (for multi-tenancy)
  await execute(`
    CREATE TABLE IF NOT EXISTS tenants (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      subscription_tier TEXT NOT NULL DEFAULT 'starter',
      settings TEXT DEFAULT '{}',
      max_sites INTEGER DEFAULT 10,
      max_users INTEGER DEFAULT 5,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Users table
  await execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'editor',
      permissions TEXT DEFAULT '[]',
      last_login DATETIME,
      email_verified BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE
    )
  `);

  // Sites table
  await execute(`
    CREATE TABLE IF NOT EXISTS sites (
      id TEXT PRIMARY KEY,
      tenant_id TEXT,
      name TEXT NOT NULL,
      domain TEXT UNIQUE,
      subdomain TEXT UNIQUE,
      theme TEXT NOT NULL DEFAULT 'medical',
      settings TEXT NOT NULL DEFAULT '{}',
      brand_profile TEXT NOT NULL DEFAULT '{}',
      content_profile TEXT NOT NULL DEFAULT '{}',
      page_config TEXT NOT NULL DEFAULT '{}',
      status TEXT NOT NULL DEFAULT 'draft',
      created_by TEXT,
      published_at DATETIME,
      version INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Add content_profile column if it doesn't exist (for existing databases)
  try {
    await execute(`ALTER TABLE sites ADD COLUMN content_profile TEXT NOT NULL DEFAULT '{}'`);
  } catch {
    // Column already exists, ignore error
  }

  // Add page_config column if it doesn't exist (for existing databases)
  try {
    await execute(`ALTER TABLE sites ADD COLUMN page_config TEXT NOT NULL DEFAULT '{}'`);
  } catch {
    // Column already exists, ignore error
  }

  // Articles table
  await execute(`
    CREATE TABLE IF NOT EXISTS articles (
      id TEXT PRIMARY KEY,
      site_id TEXT NOT NULL,
      title TEXT NOT NULL,
      excerpt TEXT,
      content TEXT,
      slug TEXT NOT NULL,
      category TEXT,
      image TEXT,
      featured BOOLEAN DEFAULT 0,
      trending BOOLEAN DEFAULT 0,
      hero BOOLEAN DEFAULT 0,
      boosted BOOLEAN DEFAULT 0,
      published BOOLEAN DEFAULT 0,
      read_time INTEGER DEFAULT 5,
      views INTEGER DEFAULT 0,
      author_id TEXT,
      tags TEXT DEFAULT '[]',
      seo_title TEXT,
      seo_description TEXT,
      canonical_url TEXT,
      widget_config TEXT,
      published_at DATETIME,
      version INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (site_id) REFERENCES sites (id) ON DELETE CASCADE,
      UNIQUE(site_id, slug)
    )
  `);

  // Add boosted column if it doesn't exist (for existing databases)
  try {
    await execute(`ALTER TABLE articles ADD COLUMN boosted BOOLEAN DEFAULT 0`);
  } catch {
    // Column already exists, ignore error
  }

  // Pages table
  await execute(`
    CREATE TABLE IF NOT EXISTS pages (
      id TEXT PRIMARY KEY,
      site_id TEXT NOT NULL,
      title TEXT NOT NULL,
      slug TEXT NOT NULL,
      content TEXT,
      template TEXT DEFAULT 'default',
      widget_config TEXT,
      published BOOLEAN DEFAULT 0,
      author_id TEXT,
      seo_title TEXT,
      seo_description TEXT,
      published_at DATETIME,
      version INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (site_id) REFERENCES sites (id) ON DELETE CASCADE,
      UNIQUE(site_id, slug)
    )
  `);

  // Add widget_config column if it doesn't exist (for existing databases)
  try {
    await execute(`ALTER TABLE pages ADD COLUMN widget_config TEXT`);
  } catch {
    // Column already exists, ignore error
  }

  // Activity log table
  await execute(`
    CREATE TABLE IF NOT EXISTS activity_log (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      user_id TEXT,
      action TEXT NOT NULL,
      resource_type TEXT NOT NULL,
      resource_id TEXT,
      details TEXT DEFAULT '{}',
      ip_address TEXT,
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Media files table
  await execute(`
    CREATE TABLE IF NOT EXISTS media (
      id TEXT PRIMARY KEY,
      site_id TEXT NOT NULL,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      file_type TEXT NOT NULL DEFAULT 'image',
      size INTEGER NOT NULL,
      url TEXT NOT NULL,
      width INTEGER,
      height INTEGER,
      alt TEXT,
      tags TEXT DEFAULT '[]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (site_id) REFERENCES sites (id) ON DELETE CASCADE
    )
  `);

  // Email subscribers table
  await execute(`
    CREATE TABLE IF NOT EXISTS email_subscribers (
      id TEXT PRIMARY KEY,
      site_id TEXT NOT NULL,
      email TEXT NOT NULL,
      name TEXT,
      source TEXT DEFAULT 'website',
      tags TEXT DEFAULT '[]',
      status TEXT DEFAULT 'active',
      ip_address TEXT,
      user_agent TEXT,
      page_url TEXT,
      subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      unsubscribed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (site_id) REFERENCES sites (id) ON DELETE CASCADE,
      UNIQUE(site_id, email)
    )
  `);

  // Widget definitions table (from widget-registry)
  await execute(`
    CREATE TABLE IF NOT EXISTS widget_definitions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      version TEXT NOT NULL DEFAULT '1.0.0',
      template TEXT NOT NULL,
      styles TEXT,
      script TEXT,
      admin_fields TEXT NOT NULL,
      triggers TEXT,
      integrations TEXT,
      active BOOLEAN DEFAULT 1,
      global BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Widget instances table
  await execute(`
    CREATE TABLE IF NOT EXISTS widget_instances (
      id TEXT PRIMARY KEY,
      widget_id TEXT NOT NULL,
      site_id TEXT NOT NULL,
      page_id TEXT,
      position INTEGER NOT NULL DEFAULT 0,
      settings TEXT NOT NULL DEFAULT '{}',
      active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (widget_id) REFERENCES widget_definitions(id)
    )
  `);

  // Blocks table (for page builder)
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

  // Article views table (for real traffic tracking - separate from display views)
  await execute(`
    CREATE TABLE IF NOT EXISTS article_views (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      article_id TEXT NOT NULL,
      site_id TEXT NOT NULL,
      viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      ip_hash TEXT,
      user_agent TEXT,
      referrer TEXT
    )
  `);

  // Widget clicks table (for CTA/widget conversion tracking)
  // widget_id: unique identifier for this widget instance within an article (e.g., "shop-now-1", "cta-button-2")
  // session_id: for tracking unique conversions (visitor only counted once per session)
  // is_external: 1 = external URL (counts for conversion), 0 = anchor/internal (doesn't count)
  await execute(`
    CREATE TABLE IF NOT EXISTS widget_clicks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      site_id TEXT NOT NULL,
      article_id TEXT,
      widget_id TEXT,
      widget_type TEXT NOT NULL,
      widget_name TEXT,
      click_type TEXT DEFAULT 'cta',
      destination_url TEXT,
      is_external INTEGER DEFAULT 1,
      clicked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      ip_hash TEXT,
      session_id TEXT,
      user_agent TEXT
    )
  `);

  // Add new columns to widget_clicks if they don't exist (migration for existing databases)
  try {
    await execute(`ALTER TABLE widget_clicks ADD COLUMN widget_id TEXT`);
  } catch { /* Column already exists */ }
  try {
    await execute(`ALTER TABLE widget_clicks ADD COLUMN is_external INTEGER DEFAULT 1`);
  } catch { /* Column already exists */ }
  try {
    await execute(`ALTER TABLE widget_clicks ADD COLUMN session_id TEXT`);
  } catch { /* Column already exists */ }

  // Widget categories table - for custom category organization
  // Global categories have site_id = NULL, site-specific have site_id set
  await execute(`
    CREATE TABLE IF NOT EXISTS widget_categories (
      id TEXT PRIMARY KEY,
      site_id TEXT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      description TEXT,
      color_bg TEXT DEFAULT 'bg-gray-500/10',
      color_text TEXT DEFAULT 'text-gray-400',
      color_border TEXT DEFAULT 'border-gray-500/30',
      icon TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_global INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE
    )
  `);

  // Site-specific widget settings - for per-site widget organization
  // Allows sites to reorder widgets within categories, hide certain widgets, etc.
  await execute(`
    CREATE TABLE IF NOT EXISTS site_widget_settings (
      id TEXT PRIMARY KEY,
      site_id TEXT NOT NULL,
      widget_type TEXT NOT NULL,
      category_id TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      hidden INTEGER DEFAULT 0,
      custom_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES widget_categories(id) ON DELETE SET NULL,
      UNIQUE(site_id, widget_type)
    )
  `);

  // Create indexes for performance
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_sites_domain ON sites (domain)',
    'CREATE INDEX IF NOT EXISTS idx_sites_subdomain ON sites (subdomain)',
    'CREATE INDEX IF NOT EXISTS idx_sites_status ON sites (status)',
    'CREATE INDEX IF NOT EXISTS idx_articles_site_published ON articles (site_id, published)',
    'CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles (site_id, slug)',
    'CREATE INDEX IF NOT EXISTS idx_articles_category ON articles (category)',
    'CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles (published_at)',
    'CREATE INDEX IF NOT EXISTS idx_pages_site_published ON pages (site_id, published)',
    'CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages (site_id, slug)',
    'CREATE INDEX IF NOT EXISTS idx_users_email ON users (email)',
    'CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log (created_at)',
    'CREATE INDEX IF NOT EXISTS idx_email_subscribers_site ON email_subscribers (site_id)',
    'CREATE INDEX IF NOT EXISTS idx_email_subscribers_email ON email_subscribers (email)',
    'CREATE INDEX IF NOT EXISTS idx_media_site ON media (site_id)',
    'CREATE INDEX IF NOT EXISTS idx_media_file_type ON media (file_type)',
    // Widget/block indexes
    'CREATE INDEX IF NOT EXISTS idx_widget_instances_site ON widget_instances(site_id)',
    'CREATE INDEX IF NOT EXISTS idx_widget_instances_page ON widget_instances(page_id)',
    'CREATE INDEX IF NOT EXISTS idx_widget_definitions_category ON widget_definitions(category)',
    'CREATE INDEX IF NOT EXISTS idx_blocks_page_site ON blocks(page_id, site_id)',
    'CREATE INDEX IF NOT EXISTS idx_blocks_position ON blocks(position)',
    // Article views indexes for analytics
    'CREATE INDEX IF NOT EXISTS idx_article_views_article ON article_views(article_id)',
    'CREATE INDEX IF NOT EXISTS idx_article_views_site ON article_views(site_id)',
    'CREATE INDEX IF NOT EXISTS idx_article_views_date ON article_views(viewed_at)',
    // Widget clicks indexes for conversion tracking
    'CREATE INDEX IF NOT EXISTS idx_widget_clicks_site ON widget_clicks(site_id)',
    'CREATE INDEX IF NOT EXISTS idx_widget_clicks_article ON widget_clicks(article_id)',
    'CREATE INDEX IF NOT EXISTS idx_widget_clicks_widget ON widget_clicks(widget_id)',
    'CREATE INDEX IF NOT EXISTS idx_widget_clicks_type ON widget_clicks(widget_type)',
    'CREATE INDEX IF NOT EXISTS idx_widget_clicks_date ON widget_clicks(clicked_at)',
    'CREATE INDEX IF NOT EXISTS idx_widget_clicks_external ON widget_clicks(is_external)',
    'CREATE INDEX IF NOT EXISTS idx_widget_clicks_session ON widget_clicks(session_id)',
    // Widget categories indexes
    'CREATE INDEX IF NOT EXISTS idx_widget_categories_site ON widget_categories(site_id)',
    'CREATE INDEX IF NOT EXISTS idx_widget_categories_global ON widget_categories(is_global)',
    'CREATE INDEX IF NOT EXISTS idx_widget_categories_sort ON widget_categories(sort_order)',
    // Site widget settings indexes
    'CREATE INDEX IF NOT EXISTS idx_site_widget_settings_site ON site_widget_settings(site_id)',
    'CREATE INDEX IF NOT EXISTS idx_site_widget_settings_widget ON site_widget_settings(widget_type)',
  ];

  for (const idx of indexes) {
    await execute(idx);
  }

  // Database initialized
}

/**
 * Enhanced query class providing cached, type-safe database operations.
 *
 * Includes query methods for:
 * - Sites (getById, getByDomain, getBySubdomain, create, update, delete)
 * - Articles (getAll, getPublished, getBySlug, create, update, delete)
 * - Pages (getAllBySite, getBySlug, create, update, delete)
 * - Media (getAllBySite, create, update, delete)
 * - Email subscribers (getAllBySite, create, unsubscribe)
 * - Activity logging
 *
 * @example
 * ```typescript
 * const queries = createQueries();
 *
 * // Get site by subdomain (cached)
 * const site = await queries.siteQueries.getBySubdomain('dr-amy');
 *
 * // Get published articles (cached)
 * const articles = await queries.articleQueries.getPublishedBySite(site.id);
 *
 * // Create subscriber (invalidates cache)
 * await queries.emailQueries.create({
 *   id: nanoid(),
 *   siteId: site.id,
 *   email: 'user@example.com',
 *   source: 'popup'
 * });
 * ```
 */
export class EnhancedQueries {
  private tenantId?: string;

  /**
   * @param tenantId - Optional tenant ID for multi-tenant isolation
   */
  constructor(tenantId?: string) {
    this.tenantId = tenantId;
  }

  // Tenant operations
  static tenantQueries = {
    getById: async (id: string) => queryOne('SELECT * FROM tenants WHERE id = ?', [id]),
    getByName: async (name: string) => queryOne('SELECT * FROM tenants WHERE name = ?', [name]),
    create: async (id: string, name: string, tier: string, settings: string, maxSites: number, maxUsers: number) =>
      execute('INSERT INTO tenants (id, name, subscription_tier, settings, max_sites, max_users) VALUES (?, ?, ?, ?, ?, ?)', [id, name, tier, settings, maxSites, maxUsers]),
    update: async (name: string, tier: string, settings: string, maxSites: number, maxUsers: number, id: string) =>
      execute('UPDATE tenants SET name = ?, subscription_tier = ?, settings = ?, max_sites = ?, max_users = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [name, tier, settings, maxSites, maxUsers, id]),
    delete: async (id: string) => execute('DELETE FROM tenants WHERE id = ?', [id])
  };

  // User operations
  userQueries = {
    getById: async (id: string) => queryOne('SELECT * FROM users WHERE id = ? AND tenant_id = ?', [id, this.tenantId]),
    getByEmail: async (email: string) => queryOne('SELECT * FROM users WHERE email = ? AND tenant_id = ?', [email, this.tenantId]),
    getAllByTenant: async () => queryAll('SELECT * FROM users WHERE tenant_id = ? ORDER BY created_at DESC', [this.tenantId]),
    create: async (id: string, email: string, passwordHash: string, name: string, role: string, permissions: string) =>
      execute('INSERT INTO users (id, tenant_id, email, password_hash, name, role, permissions) VALUES (?, ?, ?, ?, ?, ?, ?)', [id, this.tenantId, email, passwordHash, name, role, permissions]),
    update: async (email: string, name: string, role: string, permissions: string, id: string) =>
      execute('UPDATE users SET email = ?, name = ?, role = ?, permissions = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND tenant_id = ?', [email, name, role, permissions, id, this.tenantId]),
    updatePassword: async (passwordHash: string, id: string) =>
      execute('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND tenant_id = ?', [passwordHash, id, this.tenantId]),
    updateLastLogin: async (id: string) =>
      execute('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ? AND tenant_id = ?', [id, this.tenantId]),
    delete: async (id: string) => execute('DELETE FROM users WHERE id = ? AND tenant_id = ?', [id, this.tenantId])
  };

  // Enhanced site operations with caching
  siteQueries = {
    getById: async (id: string) => {
      return withCache(
        `site:${id}`,
        CacheTTL.SITE_DATA,
        async () => queryOne('SELECT * FROM sites WHERE id = ?', [id])
      );
    },

    getByDomain: async (domain: string) => {
      return withCache(
        `site:domain:${domain}`,
        CacheTTL.SITE_DATA,
        async () => queryOne('SELECT * FROM sites WHERE domain = ?', [domain])
      );
    },

    getBySubdomain: async (subdomain: string) => {
      return withCache(
        `site:subdomain:${subdomain}`,
        CacheTTL.SITE_DATA,
        async () => queryOne('SELECT * FROM sites WHERE subdomain = ?', [subdomain])
      );
    },

    getAll: async () => {
      return withCache(
        `sites:all`,
        CacheTTL.SITE_DATA,
        async () => queryAll('SELECT * FROM sites ORDER BY updated_at DESC')
      );
    },

    create: async (data: any) => {
      const result = await execute(`
        INSERT INTO sites (id, name, domain, subdomain, theme, settings, brand_profile, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        data.id,
        data.name,
        data.domain,
        data.subdomain,
        data.theme,
        JSON.stringify(data.settings),
        JSON.stringify(data.brand_profile),
        data.status
      ]);

      // Invalidate cache
      await cache.delPattern(`sites:*`);

      return result;
    },

    update: async (id: string, data: any) => {
      // Handle settings - only stringify if it's an object
      const settingsStr = typeof data.settings === 'string'
        ? data.settings
        : JSON.stringify(data.settings);

      // Handle brand_profile - only stringify if it's an object
      const brandProfileStr = typeof data.brand_profile === 'string'
        ? data.brand_profile
        : JSON.stringify(data.brand_profile);

      // Handle content_profile - only stringify if it's an object
      const contentProfileStr = typeof data.content_profile === 'string'
        ? data.content_profile
        : JSON.stringify(data.content_profile || {});

      // Handle page_config - only stringify if it's an object
      const pageConfigStr = typeof data.page_config === 'string'
        ? data.page_config
        : JSON.stringify(data.page_config || {});

      const result = await execute(`
        UPDATE sites SET name = ?, domain = ?, subdomain = ?, theme = ?,
        settings = ?, brand_profile = ?, content_profile = ?, page_config = ?, status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [
        data.name,
        data.domain,
        data.subdomain,
        data.theme,
        settingsStr,
        brandProfileStr,
        contentProfileStr,
        pageConfigStr,
        data.status,
        id
      ]);

      // Invalidate cache
      await cache.invalidateSite(id);
      await cache.delPattern(`sites:*`);
      await cache.delPattern(`site:subdomain:*`);
      await cache.delPattern(`site:domain:*`);
      await cache.delPattern(`site:id:*`);

      return result;
    },

    delete: async (id: string) => {
      // Delete all related data first (foreign key constraints)
      await execute('DELETE FROM articles WHERE site_id = ?', [id]);
      await execute('DELETE FROM pages WHERE site_id = ?', [id]);
      await execute('DELETE FROM subscribers WHERE site_id = ?', [id]);
      await execute('DELETE FROM site_widget_settings WHERE site_id = ?', [id]);
      await execute('DELETE FROM widget_categories WHERE site_id = ?', [id]);

      // Delete the site itself
      const result = await execute('DELETE FROM sites WHERE id = ?', [id]);

      // Invalidate cache
      await cache.invalidateSite(id);
      await cache.delPattern(`sites:*`);
      await cache.delPattern(`site:subdomain:*`);
      await cache.delPattern(`site:domain:*`);
      await cache.delPattern(`site:id:*`);
      await cache.delPattern(`articles:site:${id}:*`);
      await cache.delPattern(`pages:site:${id}:*`);

      return result;
    }
  };

  // Enhanced article operations
  articleQueries = {
    getAll: async () => {
      return withCache(
        `articles:all`,
        CacheTTL.ARTICLE_CONTENT,
        async () => queryAll('SELECT * FROM articles ORDER BY updated_at DESC')
      );
    },

    getAllBySite: async (siteId: string) => {
      return withCache(
        `articles:site:${siteId}:all`,
        CacheTTL.ARTICLE_CONTENT,
        async () => queryAll('SELECT * FROM articles WHERE site_id = ? ORDER BY updated_at DESC', [siteId])
      );
    },

    getPublishedBySite: async (siteId: string) => {
      return withCache(
        `articles:site:${siteId}:published`,
        CacheTTL.ARTICLE_CONTENT,
        async () => queryAll('SELECT * FROM articles WHERE site_id = ? AND published = 1 ORDER BY published_at DESC', [siteId])
      );
    },

    getById: async (id: string) => {
      return withCache(
        `article:${id}`,
        CacheTTL.ARTICLE_CONTENT,
        async () => queryOne('SELECT * FROM articles WHERE id = ?', [id])
      );
    },

    getBySlug: async (siteId: string, slug: string) => {
      return withCache(
        `article:slug:${siteId}:${slug}`,
        CacheTTL.ARTICLE_CONTENT,
        async () => queryOne('SELECT * FROM articles WHERE site_id = ? AND slug = ?', [siteId, slug])
      );
    },

    create: async (data: any) => {
      // If this article is being set as hero, unset hero on all other articles for this site
      if (data.hero) {
        await execute('UPDATE articles SET hero = 0 WHERE site_id = ?', [data.site_id]);
      }

      // Handle widget_config - stringify if it's an object
      const widgetConfigStr = data.widget_config
        ? (typeof data.widget_config === 'string' ? data.widget_config : JSON.stringify(data.widget_config))
        : null;

      // Handle tracking_config - stringify if it's an object
      const trackingConfigStr = data.tracking_config
        ? (typeof data.tracking_config === 'string' ? data.tracking_config : JSON.stringify(data.tracking_config))
        : null;

      const result = await execute(`
        INSERT INTO articles (id, site_id, title, excerpt, content, slug, category, image, featured, trending, hero, boosted, published, read_time, views, widget_config, tracking_config, published_at, author_name, author_image, display_views, display_likes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        data.id,
        data.site_id,
        data.title,
        data.excerpt || null,
        data.content || null,
        data.slug,
        data.category || null,
        data.image || null,
        data.featured ? 1 : 0,
        data.trending ? 1 : 0,
        data.hero ? 1 : 0,
        data.boosted ? 1 : 0,
        data.published ? 1 : 0,
        data.read_time || 5,
        data.views || 0,
        widgetConfigStr,
        trackingConfigStr,
        data.published_at || null,
        data.author_name || null,
        data.author_image || null,
        data.display_views || 0,
        data.display_likes || 0
      ]);

      // Invalidate cache
      await cache.delPattern(`articles:*`);
      await cache.delPattern(`article:*`);

      return result;
    },

    update: async (id: string, data: any) => {
      // Fetch existing article to support partial updates
      const existing = await queryOne('SELECT * FROM articles WHERE id = ?', [id]);
      if (!existing) {
        throw new Error('Article not found');
      }

      // Merge existing data with updates (data takes precedence)
      const merged = { ...existing, ...data };

      // If this article is being set as hero, unset hero on all other articles for this site
      if (merged.hero && merged.site_id) {
        await execute('UPDATE articles SET hero = 0 WHERE site_id = ? AND id != ?', [merged.site_id, id]);
      }

      // Handle widget_config - stringify if it's an object
      const widgetConfigStr = merged.widget_config
        ? (typeof merged.widget_config === 'string' ? merged.widget_config : JSON.stringify(merged.widget_config))
        : null;

      // Handle tracking_config - stringify if it's an object
      const trackingConfigStr = merged.tracking_config
        ? (typeof merged.tracking_config === 'string' ? merged.tracking_config : JSON.stringify(merged.tracking_config))
        : null;

      const result = await execute(`
        UPDATE articles SET title = ?, excerpt = ?, content = ?, slug = ?, category = ?,
        image = ?, featured = ?, trending = ?, hero = ?, boosted = ?, published = ?, read_time = ?,
        views = ?, widget_config = ?, tracking_config = ?,
        author_name = ?, author_image = ?, display_views = ?, display_likes = ?,
        updated_at = CURRENT_TIMESTAMP,
        published_at = CASE
          WHEN ? IS NOT NULL THEN ?
          WHEN ? = 1 THEN COALESCE(published_at, CURRENT_TIMESTAMP)
          ELSE published_at
        END
        WHERE id = ?
      `, [
        merged.title,
        merged.excerpt || null,
        merged.content || null,
        merged.slug,
        merged.category || null,
        merged.image || null,
        merged.featured ? 1 : 0,
        merged.trending ? 1 : 0,
        merged.hero ? 1 : 0,
        merged.boosted ? 1 : 0,
        merged.published ? 1 : 0,
        merged.read_time || 5,
        merged.views !== undefined ? merged.views : 0,
        widgetConfigStr,
        trackingConfigStr,
        merged.author_name || null,
        merged.author_image || null,
        merged.display_views || 0,
        merged.display_likes || 0,
        data.published_at || null,  // Only use explicitly passed published_at
        data.published_at || null,
        merged.published ? 1 : 0,
        id
      ]);

      // Invalidate cache
      cache.delPattern(`articles:*`);
      cache.delPattern(`article:*`);
      if (merged.slug && merged.site_id) {
        cache.delPattern(`article:slug:${merged.site_id}:${merged.slug}`);
      }
      cache.invalidateArticle(id);

      return result;
    },

    delete: async (id: string) => {
      const result = await execute('DELETE FROM articles WHERE id = ?', [id]);
      await cache.invalidateArticle(id);
      return result;
    },

    incrementViews: async (id: string) => {
      const result = await execute('UPDATE articles SET views = views + 1 WHERE id = ?', [id]);
      await cache.invalidateArticle(id);
      return result;
    },

    deleteBySite: async (siteId: string) => {
      const result = await execute('DELETE FROM articles WHERE site_id = ?', [siteId]);
      await cache.delPattern(`articles:site:${siteId}:*`);
      return result;
    }
  };

  // Analytics queries for real traffic data
  analyticsQueries = {
    // Get real view count for an article
    getArticleViews: async (articleId: string) => {
      const result = await queryOne(
        'SELECT COUNT(*) as count FROM article_views WHERE article_id = ?',
        [articleId]
      );
      return result?.count || 0;
    },

    // Get real view count for a site (all articles)
    getSiteViews: async (siteId: string) => {
      const result = await queryOne(
        'SELECT COUNT(*) as count FROM article_views WHERE site_id = ?',
        [siteId]
      );
      return result?.count || 0;
    },

    // Get total views across ALL sites (global)
    getTotalViews: async () => {
      const result = await queryOne(
        'SELECT COUNT(*) as count FROM article_views'
      );
      return result?.count || 0;
    },

    // Get total external widget clicks across ALL sites (global)
    getTotalWidgetClicks: async () => {
      const result = await queryOne(
        'SELECT COUNT(*) as count FROM widget_clicks WHERE is_external = 1'
      );
      return result?.count || 0;
    },

    // Get views by date range
    getViewsByDateRange: async (siteId: string, startDate: string, endDate: string) => {
      return queryAll(
        `SELECT DATE(viewed_at) as date, COUNT(*) as views
         FROM article_views
         WHERE site_id = ? AND viewed_at >= ? AND viewed_at <= ?
         GROUP BY DATE(viewed_at)
         ORDER BY date ASC`,
        [siteId, startDate, endDate]
      );
    },

    // Get top articles by real views
    getTopArticles: async (siteId: string, limit: number = 10) => {
      return queryAll(
        `SELECT av.article_id, a.title, a.slug, COUNT(*) as real_views
         FROM article_views av
         JOIN articles a ON a.id = av.article_id
         WHERE av.site_id = ?
         GROUP BY av.article_id
         ORDER BY real_views DESC
         LIMIT ?`,
        [siteId, limit]
      );
    },

    // Get views for today
    getTodayViews: async (siteId: string) => {
      const result = await queryOne(
        `SELECT COUNT(*) as count FROM article_views
         WHERE site_id = ? AND DATE(viewed_at) = DATE('now')`,
        [siteId]
      );
      return result?.count || 0;
    },

    // Get views for last 7 days
    getWeeklyViews: async (siteId: string) => {
      const result = await queryOne(
        `SELECT COUNT(*) as count FROM article_views
         WHERE site_id = ? AND viewed_at >= DATE('now', '-7 days')`,
        [siteId]
      );
      return result?.count || 0;
    },

    // Get unique visitors (by IP hash)
    getUniqueVisitors: async (siteId: string, days: number = 7) => {
      const result = await queryOne(
        `SELECT COUNT(DISTINCT ip_hash) as count FROM article_views
         WHERE site_id = ? AND viewed_at >= DATE('now', '-' || ? || ' days')`,
        [siteId, days]
      );
      return result?.count || 0;
    },

    // Get article views with real count
    // If siteId is empty string, returns all articles (global view)
    getArticlesWithRealViews: async (siteId: string) => {
      if (siteId === '') {
        // Global query - all sites
        return queryAll(
          `SELECT a.*, COALESCE(av.real_views, 0) as real_views
           FROM articles a
           LEFT JOIN (
             SELECT article_id, COUNT(*) as real_views
             FROM article_views
             GROUP BY article_id
           ) av ON av.article_id = a.id
           ORDER BY av.real_views DESC`
        );
      }
      return queryAll(
        `SELECT a.*, COALESCE(av.real_views, 0) as real_views
         FROM articles a
         LEFT JOIN (
           SELECT article_id, COUNT(*) as real_views
           FROM article_views
           GROUP BY article_id
         ) av ON av.article_id = a.id
         WHERE a.site_id = ?
         ORDER BY a.created_at DESC`,
        [siteId]
      );
    },

    // Record a widget click
    // widget_id: unique identifier for this widget instance (e.g., "shop-now-1")
    // session_id: for tracking unique conversions
    // is_external: true = external URL (counts for conversion), false = anchor/internal
    recordWidgetClick: async (data: {
      site_id: string;
      article_id?: string;
      widget_id?: string;
      widget_type: string;
      widget_name?: string;
      click_type?: string;
      destination_url?: string;
      is_external?: boolean;
      ip_hash?: string;
      session_id?: string;
      user_agent?: string;
    }) => {
      return execute(
        `INSERT INTO widget_clicks (site_id, article_id, widget_id, widget_type, widget_name, click_type, destination_url, is_external, ip_hash, session_id, user_agent)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [data.site_id, data.article_id || null, data.widget_id || null, data.widget_type, data.widget_name || null,
         data.click_type || 'cta', data.destination_url || null, data.is_external !== false ? 1 : 0,
         data.ip_hash || null, data.session_id || null, data.user_agent || null]
      );
    },

    // Get total EXTERNAL widget clicks for a site (only counts external URL clicks)
    getSiteWidgetClicks: async (siteId: string) => {
      const result = await queryOne(
        'SELECT COUNT(*) as count FROM widget_clicks WHERE site_id = ? AND is_external = 1',
        [siteId]
      );
      return result?.count || 0;
    },

    // Get EXTERNAL widget clicks by article
    getArticleWidgetClicks: async (articleId: string) => {
      const result = await queryOne(
        'SELECT COUNT(*) as count FROM widget_clicks WHERE article_id = ? AND is_external = 1',
        [articleId]
      );
      return result?.count || 0;
    },

    // Get top performing widgets by EXTERNAL clicks (grouped by widget_id for uniqueness)
    getTopWidgets: async (siteId: string, limit: number = 10) => {
      return queryAll(
        `SELECT widget_type, widget_name, widget_id, article_id, COUNT(*) as clicks
         FROM widget_clicks
         WHERE site_id = ? AND is_external = 1
         GROUP BY widget_type, COALESCE(widget_id, widget_name), article_id
         ORDER BY clicks DESC
         LIMIT ?`,
        [siteId, limit]
      );
    },

    // Get top performing widgets globally (only external clicks)
    // Includes article title for context
    getTopWidgetsGlobal: async (limit: number = 10) => {
      return queryAll(
        `SELECT wc.widget_type, wc.widget_name, wc.widget_id, wc.site_id, wc.article_id,
                COUNT(*) as clicks, a.title as article_title
         FROM widget_clicks wc
         LEFT JOIN articles a ON a.id = wc.article_id
         WHERE wc.is_external = 1
         GROUP BY wc.widget_type, COALESCE(wc.widget_id, wc.widget_name), wc.site_id, wc.article_id
         ORDER BY clicks DESC
         LIMIT ?`,
        [limit]
      );
    },

    // Get article analytics with unique views and external clicks
    // Conversion = unique external clicks / unique views
    getArticleAnalytics: async (articleId: string) => {
      const [uniqueViews, uniqueClicks, widgetBreakdown] = await Promise.all([
        // Count unique visitors (by ip_hash)
        queryOne('SELECT COUNT(DISTINCT ip_hash) as count FROM article_views WHERE article_id = ?', [articleId]),
        // Count unique external clicks (by session_id or ip_hash)
        queryOne('SELECT COUNT(DISTINCT COALESCE(session_id, ip_hash)) as count FROM widget_clicks WHERE article_id = ? AND is_external = 1', [articleId]),
        // Widget breakdown by widget_id for per-widget stats
        queryAll(
          `SELECT widget_type, widget_name, widget_id, COUNT(*) as clicks,
                  COUNT(DISTINCT COALESCE(session_id, ip_hash)) as unique_clicks
           FROM widget_clicks
           WHERE article_id = ? AND is_external = 1
           GROUP BY widget_type, COALESCE(widget_id, widget_name)
           ORDER BY clicks DESC`,
          [articleId]
        )
      ]);
      const views = uniqueViews?.count || 0;
      const clicks = uniqueClicks?.count || 0;
      return {
        views,
        clicks,
        conversionRate: views > 0 ? Math.min((clicks / views) * 100, 100).toFixed(2) : '0',
        widgetBreakdown
      };
    },

    // Get site-wide conversion metrics (unique visitors, external clicks only)
    getSiteConversionMetrics: async (siteId: string) => {
      const [totalViewsResult, uniqueClicks, activeEmails] = await Promise.all([
        // Total views (not unique) to match dashboard display
        queryOne('SELECT COUNT(*) as count FROM article_views WHERE site_id = ?', [siteId]),
        // Unique external click conversions
        queryOne('SELECT COUNT(DISTINCT COALESCE(session_id, ip_hash)) as count FROM widget_clicks WHERE site_id = ? AND is_external = 1', [siteId]),
        // Only count ACTIVE subscribers for email metrics
        queryOne("SELECT COUNT(*) as count FROM email_subscribers WHERE site_id = ? AND status = 'active'", [siteId])
      ]);
      const totalViews = totalViewsResult?.count || 0;
      const totalClicks = uniqueClicks?.count || 0;
      const totalEmails = activeEmails?.count || 0;
      return {
        totalViews,
        totalClicks,
        totalEmails,
        clickThroughRate: totalViews > 0 ? Math.min((totalClicks / totalViews) * 100, 100).toFixed(2) : '0',
        emailConversionRate: totalViews > 0 ? Math.min((totalEmails / totalViews) * 100, 100).toFixed(2) : '0'
      };
    },

    // Get articles with full analytics (unique views, external clicks, conversion)
    getArticlesWithAnalytics: async (siteId: string) => {
      return queryAll(
        `SELECT
           a.id, a.title, a.slug, a.published, a.boosted, a.created_at,
           COALESCE(av.unique_views, 0) as real_views,
           COALESCE(wc.unique_clicks, 0) as widget_clicks,
           CASE WHEN COALESCE(av.unique_views, 0) > 0
             THEN MIN(ROUND(COALESCE(wc.unique_clicks, 0) * 100.0 / av.unique_views, 2), 100)
             ELSE 0
           END as conversion_rate
         FROM articles a
         LEFT JOIN (
           SELECT article_id, COUNT(DISTINCT ip_hash) as unique_views FROM article_views GROUP BY article_id
         ) av ON av.article_id = a.id
         LEFT JOIN (
           SELECT article_id, COUNT(DISTINCT COALESCE(session_id, ip_hash)) as unique_clicks
           FROM widget_clicks WHERE is_external = 1 GROUP BY article_id
         ) wc ON wc.article_id = a.id
         WHERE a.site_id = ?
         ORDER BY real_views DESC`,
        [siteId]
      );
    },

    // Get external clicks by date range
    getClicksByDateRange: async (siteId: string, startDate: string, endDate: string) => {
      return queryAll(
        `SELECT DATE(clicked_at) as date, COUNT(*) as clicks
         FROM widget_clicks
         WHERE site_id = ? AND is_external = 1 AND clicked_at >= ? AND clicked_at <= ?
         GROUP BY DATE(clicked_at)
         ORDER BY date ASC`,
        [siteId, startDate, endDate]
      );
    },

    // Get email signups per article for a site
    // Matches emails by page_url containing the article slug
    getEmailSignupsPerArticle: async (siteId: string) => {
      return queryAll(
        `SELECT
           a.id as article_id,
           a.slug,
           COUNT(CASE WHEN es.status = 'active' THEN 1 END) as email_signups,
           COUNT(CASE WHEN es.status = 'active' AND (
             es.source IN ('hormone_guide_widget', 'exit_intent_popup', 'community_popup', 'lead_magnet', 'guide_download', 'pdf_download', 'wellness_guide', 'lead_magnet_form')
             OR es.tags LIKE '%lead_magnet%'
           ) THEN 1 END) as pdf_downloads
         FROM articles a
         LEFT JOIN email_subscribers es ON es.site_id = a.site_id
           AND (es.page_url LIKE '%/articles/' || a.slug || '%' OR es.page_url LIKE '%/articles/' || a.slug)
         WHERE a.site_id = ?
         GROUP BY a.id, a.slug`,
        [siteId]
      );
    }
  };

  // Page operations
  pageQueries = {
    getAll: async () => {
      return withCache(
        `pages:all`,
        CacheTTL.PAGE_BLOCKS,
        async () => queryAll('SELECT * FROM pages ORDER BY updated_at DESC')
      );
    },

    getAllBySite: async (siteId: string) => {
      return withCache(
        `pages:site:${siteId}:all`,
        CacheTTL.PAGE_BLOCKS,
        async () => queryAll('SELECT * FROM pages WHERE site_id = ? ORDER BY created_at DESC', [siteId])
      );
    },

    getById: async (id: string) => {
      return withCache(
        `page:${id}`,
        CacheTTL.PAGE_BLOCKS,
        async () => queryOne('SELECT * FROM pages WHERE id = ?', [id])
      );
    },

    getBySlug: async (siteId: string, slug: string) => {
      return withCache(
        `page:slug:${siteId}:${slug}`,
        CacheTTL.PAGE_BLOCKS,
        async () => queryOne('SELECT * FROM pages WHERE site_id = ? AND slug = ?', [siteId, slug])
      );
    },

    create: async (data: any) => {
      const widgetConfigStr = data.widget_config
        ? (typeof data.widget_config === 'string' ? data.widget_config : JSON.stringify(data.widget_config))
        : null;

      const result = await execute(`
        INSERT INTO pages (id, site_id, title, slug, content, template, widget_config, published)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        data.id,
        data.site_id,
        data.title,
        data.slug,
        data.content,
        data.template || 'default',
        widgetConfigStr,
        data.published ? 1 : 0
      ]);

      await cache.delPattern(`pages:site:${data.site_id}:*`);
      return result;
    },

    update: async (id: string, data: any) => {
      const widgetConfigStr = data.widget_config !== undefined
        ? (typeof data.widget_config === 'string' ? data.widget_config : JSON.stringify(data.widget_config))
        : undefined;

      // Build dynamic update query based on what fields are provided
      const updates: string[] = [];
      const values: any[] = [];

      if (data.title !== undefined) { updates.push('title = ?'); values.push(data.title); }
      if (data.slug !== undefined) { updates.push('slug = ?'); values.push(data.slug); }
      if (data.content !== undefined) { updates.push('content = ?'); values.push(data.content); }
      if (data.template !== undefined) { updates.push('template = ?'); values.push(data.template); }
      if (widgetConfigStr !== undefined) { updates.push('widget_config = ?'); values.push(widgetConfigStr); }
      if (data.published !== undefined) { updates.push('published = ?'); values.push(data.published ? 1 : 0); }

      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);

      const result = await execute(`
        UPDATE pages SET ${updates.join(', ')}
        WHERE id = ?
      `, values);

      await cache.invalidatePage(id);
      return result;
    },

    delete: async (id: string) => {
      const result = await execute('DELETE FROM pages WHERE id = ?', [id]);
      await cache.invalidatePage(id);
      return result;
    },

    deleteBySite: async (siteId: string) => {
      const result = await execute('DELETE FROM pages WHERE site_id = ?', [siteId]);
      await cache.delPattern(`pages:site:${siteId}:*`);
      return result;
    }
  };

  // Widget definition operations (stub for scaffolded admin UI)
  widgetQueries = {
    getWidgetDefinition: async (id: string) => null,
    getAllWidgetDefinitions: async () => [],
    getWidgetDefinitions: async (category?: string) => [],
    registerWidget: async (definition: any) => definition,
    getWidgetInstance: async (id: string) => null,
    getAllWidgetInstances: async (siteId: string) => [],
    getWidgetInstances: async (siteId: string, pageId?: string) => [],
    createWidgetInstance: async (widgetId: string, siteId: string, pageId: string, settings: any) => `instance-${Date.now()}`,
    updateWidgetInstance: async (id: string, data: any) => data,
    deleteWidgetInstance: async (id: string) => true
  };

  // Media file operations (sync for compatibility with existing code)
  mediaQueries = {
    getAllBySite: (siteId: string, fileType?: string) => {
      // This needs to be called with await in calling code
      if (fileType && fileType !== 'all') {
        return queryAll('SELECT * FROM media WHERE site_id = ? AND file_type = ? ORDER BY created_at DESC', [siteId, fileType]);
      }
      return queryAll('SELECT * FROM media WHERE site_id = ? ORDER BY created_at DESC', [siteId]);
    },

    getById: (id: string) => {
      return queryOne('SELECT * FROM media WHERE id = ?', [id]);
    },

    create: (data: {
      id: string;
      siteId: string;
      filename: string;
      originalName: string;
      mimeType: string;
      fileType: string;
      size: number;
      url: string;
      width?: number;
      height?: number;
      alt?: string;
      tags?: string[];
    }) => {
      return execute(`
        INSERT INTO media (id, site_id, filename, original_name, mime_type, file_type, size, url, width, height, alt, tags)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        data.id,
        data.siteId,
        data.filename,
        data.originalName,
        data.mimeType,
        data.fileType,
        data.size,
        data.url,
        data.width || null,
        data.height || null,
        data.alt || null,
        JSON.stringify(data.tags || [])
      ]);
    },

    update: (id: string, data: { alt?: string; tags?: string[] }) => {
      return execute(`
        UPDATE media SET alt = ?, tags = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [
        data.alt || null,
        JSON.stringify(data.tags || []),
        id
      ]);
    },

    delete: (id: string) => {
      return execute('DELETE FROM media WHERE id = ?', [id]);
    }
  };

  // Email subscriber operations
  emailQueries = {
    // Get all email subscribers across all sites (for global admin)
    getAll: () => {
      return queryAll('SELECT * FROM email_subscribers ORDER BY created_at DESC');
    },

    getAllBySite: (siteId: string) => {
      return queryAll('SELECT * FROM email_subscribers WHERE site_id = ? ORDER BY created_at DESC', [siteId]);
    },

    getById: (id: string) => {
      return queryOne('SELECT * FROM email_subscribers WHERE id = ?', [id]);
    },

    getByEmail: (email: string, siteId: string) => {
      return queryOne('SELECT * FROM email_subscribers WHERE email = ? AND site_id = ?', [email, siteId]);
    },

    getActiveCount: async (siteId: string) => {
      const result = await queryOne('SELECT COUNT(*) as count FROM email_subscribers WHERE site_id = ? AND status = ?', [siteId, 'active']);
      return result?.count || 0;
    },

    create: (data: { id: string; siteId: string; email: string; name?: string; source?: string; tags?: string[]; pageUrl?: string }) => {
      return execute(`
        INSERT INTO email_subscribers (id, site_id, email, name, source, tags, page_url, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
      `, [
        data.id,
        data.siteId,
        data.email,
        data.name || null,
        data.source || 'website',
        JSON.stringify(data.tags || []),
        data.pageUrl || null
      ]);
    },

    unsubscribe: (email: string, siteId: string) => {
      return execute(`
        UPDATE email_subscribers SET status = 'unsubscribed', unsubscribed_at = CURRENT_TIMESTAMP
        WHERE email = ? AND site_id = ?
      `, [email, siteId]);
    },

    delete: (email: string, siteId: string) => {
      return execute('DELETE FROM email_subscribers WHERE email = ? AND site_id = ?', [email, siteId]);
    }
  };

  // Activity logging
  logActivity = async (action: string, resourceType: string, resourceId?: string, details?: any) => {
    return execute(`
      INSERT INTO activity_log (id, tenant_id, user_id, action, resource_type, resource_id, details, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `, [
      uuidv4(),
      this.tenantId,
      null, // user_id would come from context
      action,
      resourceType,
      resourceId,
      JSON.stringify(details || {})
    ]);
  };
}

/**
 * Factory function to create an EnhancedQueries instance.
 *
 * @param tenantId - Optional tenant ID for multi-tenant isolation
 * @returns EnhancedQueries instance with all query methods
 *
 * @example
 * ```typescript
 * // In an API route
 * const queries = createQueries();
 * const site = await queries.siteQueries.getBySubdomain('dr-amy');
 *
 * // With tenant isolation
 * const queries = createQueries(tenantId);
 * const users = await queries.userQueries.getAllByTenant();
 * ```
 */
export const createQueries = (tenantId?: string) => new EnhancedQueries(tenantId);

export default db;
