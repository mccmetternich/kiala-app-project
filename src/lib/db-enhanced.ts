import { createClient, type Client } from '@libsql/client/web';
import { cache, CacheTTL, withCache } from './cache';
import { v4 as uuidv4 } from 'uuid';

// Create a fresh client for each request in serverless environment
// This avoids issues with private class members across invocations
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

// Create a proxy that creates fresh connections
const db = {
  execute: (query: { sql: string; args?: any[] }) => getDb().execute(query),
};

// Helper to run a query and return all rows
async function queryAll(sql: string, args: any[] = []): Promise<any[]> {
  const result = await db.execute({ sql, args });
  return result.rows as any[];
}

// Helper to run a query and return first row
async function queryOne(sql: string, args: any[] = []): Promise<any> {
  const result = await db.execute({ sql, args });
  return result.rows[0] || null;
}

// Helper to run an insert/update/delete and return result info
async function execute(sql: string, args: any[] = []) {
  return db.execute({ sql, args });
}

// Initialize enhanced database schema
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
      status TEXT NOT NULL DEFAULT 'draft',
      created_by TEXT,
      published_at DATETIME,
      version INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

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

  // Pages table
  await execute(`
    CREATE TABLE IF NOT EXISTS pages (
      id TEXT PRIMARY KEY,
      site_id TEXT NOT NULL,
      title TEXT NOT NULL,
      slug TEXT NOT NULL,
      content TEXT,
      template TEXT DEFAULT 'default',
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
  ];

  for (const idx of indexes) {
    await execute(idx);
  }

  console.log('✅ Enhanced database initialized successfully');
}

// Enhanced query operations with caching and tenant isolation
export class EnhancedQueries {
  private tenantId?: string;
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

      const result = await execute(`
        UPDATE sites SET name = ?, domain = ?, subdomain = ?, theme = ?,
        settings = ?, brand_profile = ?, status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [
        data.name,
        data.domain,
        data.subdomain,
        data.theme,
        settingsStr,
        brandProfileStr,
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
      const result = await execute('DELETE FROM sites WHERE id = ?', [id]);

      // Invalidate cache
      await cache.invalidateSite(id);
      await cache.delPattern(`sites:*`);
      await cache.delPattern(`site:subdomain:*`);
      await cache.delPattern(`site:domain:*`);
      await cache.delPattern(`site:id:*`);

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
        INSERT INTO articles (id, site_id, title, excerpt, content, slug, category, image, featured, trending, hero, published, read_time, views, widget_config, tracking_config, published_at, author_name, author_image, display_views, display_likes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      console.log(`📦 Cache: Invalidating after article create, site_id=${data.site_id}`);
      await cache.delPattern(`articles:*`);
      await cache.delPattern(`article:*`);
      console.log(`📦 Cache: Completed cache invalidation for article create`);

      return result;
    },

    update: async (id: string, data: any) => {
      // If this article is being set as hero, unset hero on all other articles for this site
      if (data.hero && data.site_id) {
        await execute('UPDATE articles SET hero = 0 WHERE site_id = ? AND id != ?', [data.site_id, id]);
      }

      // Handle widget_config - stringify if it's an object
      const widgetConfigStr = data.widget_config
        ? (typeof data.widget_config === 'string' ? data.widget_config : JSON.stringify(data.widget_config))
        : null;

      // Handle tracking_config - stringify if it's an object
      const trackingConfigStr = data.tracking_config
        ? (typeof data.tracking_config === 'string' ? data.tracking_config : JSON.stringify(data.tracking_config))
        : null;

      // Handle published_at - use provided date or auto-set on first publish
      const publishedAtValue = data.published_at
        ? data.published_at
        : (data.published ? 'COALESCE(published_at, CURRENT_TIMESTAMP)' : null);

      const result = await execute(`
        UPDATE articles SET title = ?, excerpt = ?, content = ?, slug = ?, category = ?,
        image = ?, featured = ?, trending = ?, hero = ?, published = ?, read_time = ?,
        widget_config = ?, tracking_config = ?,
        author_name = ?, author_image = ?, display_views = ?, display_likes = ?,
        updated_at = CURRENT_TIMESTAMP,
        published_at = CASE
          WHEN ? IS NOT NULL THEN ?
          WHEN ? = 1 THEN COALESCE(published_at, CURRENT_TIMESTAMP)
          ELSE published_at
        END
        WHERE id = ?
      `, [
        data.title,
        data.excerpt || null,
        data.content || null,
        data.slug,
        data.category || null,
        data.image || null,
        data.featured ? 1 : 0,
        data.trending ? 1 : 0,
        data.hero ? 1 : 0,
        data.published ? 1 : 0,
        data.read_time || 5,
        widgetConfigStr,
        trackingConfigStr,
        data.author_name || null,
        data.author_image || null,
        data.display_views || 0,
        data.display_likes || 0,
        data.published_at || null,
        data.published_at || null,
        data.published ? 1 : 0,
        id
      ]);

      // Invalidate cache
      console.log(`📦 Cache: Invalidating article ${id}, site_id=${data.site_id}, slug=${data.slug}`);
      cache.delPattern(`articles:*`);
      cache.delPattern(`article:*`);
      if (data.slug && data.site_id) {
        cache.delPattern(`article:slug:${data.site_id}:${data.slug}`);
      }
      cache.invalidateArticle(id);
      console.log(`📦 Cache: Completed cache invalidation for article ${id}`);

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

  // Page operations
  pageQueries = {
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
      const result = await execute(`
        INSERT INTO pages (id, site_id, title, slug, content, template, published)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        data.id,
        data.site_id,
        data.title,
        data.slug,
        data.content,
        data.template || 'default',
        data.published ? 1 : 0
      ]);

      await cache.delPattern(`pages:site:${data.site_id}:*`);
      return result;
    },

    update: async (id: string, data: any) => {
      const result = await execute(`
        UPDATE pages SET title = ?, slug = ?, content = ?, template = ?,
        published = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [
        data.title,
        data.slug,
        data.content,
        data.template,
        data.published ? 1 : 0,
        id
      ]);

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

// Create enhanced query instances
export const createQueries = (tenantId?: string) => new EnhancedQueries(tenantId);

export default db;
