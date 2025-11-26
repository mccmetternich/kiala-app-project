/**
 * High-Performance Caching Layer for Direct Response Sites
 * Optimized for fast page loads and reduced database queries
 */

// Cache TTL configurations (in seconds)
export const CacheTTL = {
  SITE_DATA: 300,           // 5 minutes - site configuration
  ARTICLE_CONTENT: 1800,    // 30 minutes - article content  
  DASHBOARD_STATS: 60,      // 1 minute - dashboard metrics
  PAGE_BLOCKS: 900,         // 15 minutes - page block configuration
  EMAIL_STATS: 300,         // 5 minutes - email subscriber counts
  BRAND_PROFILE: 3600,     // 1 hour - brand profile data
  WIDGET_CONFIG: 1800       // 30 minutes - widget configurations
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
    siteStats: (siteId: string, timeframe: string) => `site:${siteId}:stats:${timeframe}`,
    articleContent: (siteId: string, slug: string) => `site:${siteId}:article:${slug}`,
    pageBlocks: (siteId: string, pageId: string) => `site:${siteId}:blocks:${pageId}`,
    brandProfile: (siteId: string) => `site:${siteId}:brand`,
    globalStats: (timeframe: string) => `global:stats:${timeframe}`,
    emailCount: (siteId: string) => `site:${siteId}:emails:count`
  };

  /**
   * Site-specific cache invalidation
   */
  async invalidateSite(siteId: string): Promise<void> {
    const regex = new RegExp(`site:${siteId}:.*`);

    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        this.memoryCache.delete(key);
      }
    }
    console.log(`📦 Cache: Invalidated all cache for site ${siteId}`);
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
    console.log(`📦 Cache: Invalidated pattern ${pattern}`);
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
    console.log(`📦 Cache: Invalidated article ${articleId}`);
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
    console.log(`📦 Cache: Invalidated page ${pageId}`);
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