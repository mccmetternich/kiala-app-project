/**
 * High-Performance Caching Layer for Direct Response Sites
 * Optimized for fast page loads and reduced database queries
 */

// Cache TTL configurations (in seconds)
export const CacheTTL = {
  SITE_DATA: 60,            // 1 minute - site configuration
  ARTICLE_CONTENT: 30,      // 30 seconds - article content (reduced for faster updates)
  DASHBOARD_STATS: 60,      // 1 minute - dashboard metrics
  PAGE_BLOCKS: 60,          // 1 minute - page block configuration
  EMAIL_STATS: 300,         // 5 minutes - email subscriber counts
  BRAND_PROFILE: 300,       // 5 minutes - brand profile data
  WIDGET_CONFIG: 30         // 30 seconds - widget configurations (reduced for faster updates)
} as const;

interface CacheEntry {
  data: any;
  expires: number;
}

class CacheManager {
  private memoryCache: Map<string, CacheEntry> = new Map();

  /**
   * Get cached data
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const entry = this.memoryCache.get(key);
      
      if (!entry) {
        return null;
      }

      // Check if expired
      if (entry.expires <= Date.now()) {
        this.memoryCache.delete(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error(`📦 Cache: Error getting ${key}:`, error);
      return null;
    }
  }

  /**
   * Set cached data with TTL
   */
  async set<T>(key: string, data: T, ttlSeconds: number): Promise<void> {
    try {
      this.memoryCache.set(key, {
        data,
        expires: Date.now() + (ttlSeconds * 1000)
      });
    } catch (error) {
      console.error(`📦 Cache: Error setting ${key}:`, error);
    }
  }

  /**
   * Delete cached data
   */
  async delete(key: string): Promise<void> {
    try {
      this.memoryCache.delete(key);
    } catch (error) {
      console.error(`📦 Cache: Error deleting ${key}:`, error);
    }
  }

  /**
   * Get or set cached data with automatic loading
   */
  async getOrSet<T>(
    key: string, 
    loader: () => Promise<T>, 
    ttlSeconds: number
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Load fresh data
    const data = await loader();
    
    // Cache the result
    await this.set(key, data, ttlSeconds);
    
    return data;
  }

  /**
   * Generate cache keys with consistent patterns
   */
  keys = {
    siteData: (siteId: string) => `site:${siteId}:data`,
    siteBySubdomain: (subdomain: string) => `site:subdomain:${subdomain}`,
    siteStats: (siteId: string, timeframe: string) => `site:${siteId}:stats:${timeframe}`,
    articleContent: (siteId: string, slug: string) => `site:${siteId}:article:${slug}`,
    articleById: (articleId: string) => `article:${articleId}`,
    articleList: (siteId: string) => `site:${siteId}:articles:list`,
    pageBlocks: (siteId: string, pageId: string) => `site:${siteId}:blocks:${pageId}`,
    brandProfile: (siteId: string) => `site:${siteId}:brand`,
    globalStats: (timeframe: string) => `global:stats:${timeframe}`,
    emailCount: (siteId: string) => `site:${siteId}:emails:count`,
    publicArticle: (subdomain: string, slug: string) => `public:${subdomain}:article:${slug}`,
    sitesBulk: () => `sites:bulk`
  };

  /**
   * Targeted invalidation: Only invalidate what's actually affected
   * Much more efficient than blanket site invalidation
   */

  /**
   * Invalidate when an article is created/updated/deleted
   */
  async invalidateArticleUpdate(siteId: string, articleId: string, slug?: string): Promise<void> {
    const keysToDelete = [
      this.keys.articleById(articleId),
      this.keys.articleList(siteId),
      `site:${siteId}:stats:*`, // Stats need refresh
      'global:stats:*',         // Global stats too
      `analytics:*`             // Analytics cache
    ];

    if (slug) {
      keysToDelete.push(this.keys.articleContent(siteId, slug));
      // Also invalidate the public article cache
      // We need to find the subdomain - for now invalidate all public article caches for this site
    }

    for (const pattern of keysToDelete) {
      if (pattern.includes('*')) {
        await this.delPattern(pattern);
      } else {
        this.memoryCache.delete(pattern);
      }
    }
  }

  /**
   * Invalidate when site settings are updated (not full wipe)
   */
  async invalidateSiteSettings(siteId: string, subdomain?: string): Promise<void> {
    const keysToDelete = [
      this.keys.siteData(siteId),
      this.keys.brandProfile(siteId),
      this.keys.sitesBulk()
    ];

    if (subdomain) {
      keysToDelete.push(this.keys.siteBySubdomain(subdomain));
    }

    for (const key of keysToDelete) {
      this.memoryCache.delete(key);
    }
  }

  /**
   * Invalidate when email signup occurs
   */
  async invalidateEmailSignup(siteId: string): Promise<void> {
    const keysToDelete = [
      this.keys.emailCount(siteId),
      `site:${siteId}:stats:*`,
      'global:stats:*'
    ];

    for (const pattern of keysToDelete) {
      if (pattern.includes('*')) {
        await this.delPattern(pattern);
      } else {
        this.memoryCache.delete(pattern);
      }
    }
  }

  /**
   * Invalidate dashboard/analytics caches only
   */
  async invalidateAnalytics(): Promise<void> {
    await this.delPattern('global:stats:*');
    await this.delPattern('analytics:*');
    await this.delPattern('site:*:stats:*');
  }

  /**
   * Site-specific cache invalidation (full wipe - use sparingly)
   */
  async invalidateSite(siteId: string): Promise<void> {
    const regex = new RegExp(`site:${siteId}:.*`);

    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        this.memoryCache.delete(key);
      }
    }

    // Also invalidate the bulk sites cache
    this.memoryCache.delete(this.keys.sitesBulk());
  }

  /**
   * Delete all keys matching a pattern
   */
  async delPattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));

    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        this.memoryCache.delete(key);
      }
    }
  }

  /**
   * Article-specific cache invalidation
   */
  async invalidateArticle(articleId: string): Promise<void> {
    const regex = new RegExp(`.*article.*${articleId}.*`);

    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        this.memoryCache.delete(key);
      }
    }
  }

  /**
   * Page-specific cache invalidation
   */
  async invalidatePage(pageId: string): Promise<void> {
    const regex = new RegExp(`.*page.*${pageId}.*`);

    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        this.memoryCache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics for debugging
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.memoryCache.size,
      keys: Array.from(this.memoryCache.keys())
    };
  }

  /**
   * Clear all cache entries
   */
  async clearAll(): Promise<void> {
    this.memoryCache.clear();
  }
}

// Singleton cache instance  
export const cache = new CacheManager();

/**
 * Cache middleware for API routes
 */
export function withCache<T>(
  key: string,
  ttl: number,
  handler: () => Promise<T>
): Promise<T> {
  return cache.getOrSet(key, handler, ttl);
}