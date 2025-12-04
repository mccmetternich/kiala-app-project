import { cache } from './cache';

// Query optimization utilities
export class QueryOptimizer {
  private static queryCache = new Map<string, any>();
  private static readonly CACHE_TTL = 300000; // 5 minutes

  // Memoize expensive query results
  static memoizeQuery<T>(key: string, queryFn: () => Promise<T>, ttl: number = this.CACHE_TTL): Promise<T> {
    const cacheKey = `query:${key}`;
    
    if (this.queryCache.has(cacheKey)) {
      const { data, timestamp } = this.queryCache.get(cacheKey);
      if (Date.now() - timestamp < ttl) {
        return Promise.resolve(data);
      }
    }

    return queryFn().then(result => {
      this.queryCache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    });
  }

  // Clear memoized queries
  static clearQueryCache(pattern?: string) {
    if (pattern) {
      for (const [key] of this.queryCache) {
        if (key.includes(pattern)) {
          this.queryCache.delete(key);
        }
      }
    } else {
      this.queryCache.clear();
    }
  }

  // Batch database operations
  static async batchOperations<T>(
    operations: Array<() => Promise<T>>,
    batchSize: number = 10
  ): Promise<T[]> {
    const results: T[] = [];
    
    for (let i = 0; i < operations.length; i += batchSize) {
      const batch = operations.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(op => op()));
      results.push(...batchResults);
    }
    
    return results;
  }

  // Database connection pooling simulation
  private static connectionPool: Array<{ id: number; inUse: boolean; lastUsed: number }> = [];
  private static readonly MAX_CONNECTIONS = 10;

  static getConnection() {
    // Find available connection
    let connection = this.connectionPool.find(conn => !conn.inUse);
    
    if (!connection && this.connectionPool.length < this.MAX_CONNECTIONS) {
      // Create new connection
      connection = {
        id: this.connectionPool.length,
        inUse: false,
        lastUsed: Date.now()
      };
      this.connectionPool.push(connection);
    }

    if (connection) {
      connection.inUse = true;
      connection.lastUsed = Date.now();
    }

    return connection;
  }

  static releaseConnection(connectionId: number) {
    const connection = this.connectionPool.find(conn => conn.id === connectionId);
    if (connection) {
      connection.inUse = false;
      connection.lastUsed = Date.now();
    }
  }

  // Clean up old unused connections
  static cleanupConnections() {
    const now = Date.now();
    const timeout = 300000; // 5 minutes
    
    this.connectionPool = this.connectionPool.filter(conn => {
      return conn.inUse || (now - conn.lastUsed) < timeout;
    });
  }
}

// Performance monitoring utilities
export class PerformanceMonitor {
  private static metrics: Map<string, Array<{ timestamp: number; duration: number; success: boolean }>> = new Map();

  // Track operation performance
  static async trackOperation<T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    let success = true;
    
    try {
      const result = await operation();
      return result;
    } catch (error) {
      success = false;
      throw error;
    } finally {
      const duration = Date.now() - startTime;
      
      if (!this.metrics.has(operationName)) {
        this.metrics.set(operationName, []);
      }
      
      const operationMetrics = this.metrics.get(operationName)!;
      operationMetrics.push({ timestamp: Date.now(), duration, success });
      
      // Keep only last 100 metrics per operation
      if (operationMetrics.length > 100) {
        operationMetrics.splice(0, operationMetrics.length - 100);
      }

      // Log slow operations
      if (duration > 1000) {
        console.warn(`Slow operation detected: ${operationName} took ${duration}ms`);
      }
    }
  }

  // Get performance statistics
  static getOperationStats(operationName: string) {
    const metrics = this.metrics.get(operationName) || [];
    if (metrics.length === 0) return null;

    const durations = metrics.map(m => m.duration);
    const successCount = metrics.filter(m => m.success).length;
    
    return {
      count: metrics.length,
      averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      successRate: (successCount / metrics.length) * 100,
      recentMetrics: metrics.slice(-10)
    };
  }

  // Get all performance statistics
  static getAllStats() {
    const stats: Record<string, any> = {};
    for (const [operationName] of this.metrics) {
      stats[operationName] = this.getOperationStats(operationName);
    }
    return stats;
  }

  // Clear performance metrics
  static clearMetrics(operationName?: string) {
    if (operationName) {
      this.metrics.delete(operationName);
    } else {
      this.metrics.clear();
    }
  }
}

// Memory optimization utilities
export class MemoryManager {
  // Monitor memory usage
  static getMemoryUsage() {
    const usage = process.memoryUsage();
    return {
      rss: Math.round(usage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
      external: Math.round(usage.external / 1024 / 1024), // MB
      arrayBuffers: Math.round(usage.arrayBuffers / 1024 / 1024) // MB
    };
  }

  // Force garbage collection if available
  static forceGC() {
    if (global.gc) {
      global.gc();
      return true;
    }
    return false;
  }

  // Check if memory usage is high
  static isMemoryHigh(threshold: number = 80): boolean {
    const usage = this.getMemoryUsage();
    const totalSystemMemory = 1024; // Assume 1GB for demo - would get from OS in production
    return (usage.heapUsed / totalSystemMemory) * 100 > threshold;
  }

  // Clean up large objects
  static async cleanupLargeObjects() {
    // Clear query cache if memory is high
    if (this.isMemoryHigh(70)) {
      QueryOptimizer.clearQueryCache();
      QueryOptimizer.cleanupConnections();
      
      // Clear old cache entries
      await cache.delPattern('temp:*');
      
      // Force GC if available
      this.forceGC();
      
      // Memory cleanup performed
    }
  }
}

// Response compression utilities
export class CompressionUtils {
  // Compress large JSON responses
  static compressResponse(data: any): { compressed: boolean; data: any; originalSize: number; compressedSize: number } {
    const originalSize = JSON.stringify(data).length;
    
    // Simple compression simulation - in production would use gzip/brotli
    if (originalSize > 10000) { // 10KB threshold
      const compressedData = this.simulateCompression(data);
      return {
        compressed: true,
        data: compressedData,
        originalSize,
        compressedSize: JSON.stringify(compressedData).length
      };
    }
    
    return {
      compressed: false,
      data,
      originalSize,
      compressedSize: originalSize
    };
  }

  private static simulateCompression(data: any): any {
    // Simple field compression simulation
    if (Array.isArray(data)) {
      return data.map(item => this.simulateCompression(item));
    }
    
    if (typeof data === 'object' && data !== null) {
      const compressed: any = {};
      for (const [key, value] of Object.entries(data)) {
        // Compress long strings
        if (typeof value === 'string' && value.length > 100) {
          compressed[key] = value.substring(0, 100) + '...';
        } else {
          compressed[key] = this.simulateCompression(value);
        }
      }
      return compressed;
    }
    
    return data;
  }
}

// Request optimization middleware
export class RequestOptimizer {
  private static requestCounts = new Map<string, number>();
  
  // Rate limiting with sliding window
  static checkRateLimit(
    clientId: string, 
    windowMs: number = 60000, 
    maxRequests: number = 100
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const windowStart = now - windowMs;
    const key = `${clientId}:${Math.floor(now / windowMs)}`;
    
    const currentCount = this.requestCounts.get(key) || 0;
    
    if (currentCount >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: Math.ceil(now / windowMs) * windowMs
      };
    }
    
    this.requestCounts.set(key, currentCount + 1);
    
    // Cleanup old entries
    for (const [k] of this.requestCounts) {
      const timestamp = parseInt(k.split(':')[1]) * windowMs;
      if (timestamp < windowStart) {
        this.requestCounts.delete(k);
      }
    }
    
    return {
      allowed: true,
      remaining: maxRequests - currentCount - 1,
      resetTime: Math.ceil(now / windowMs) * windowMs
    };
  }

  // Request deduplication
  private static pendingRequests = new Map<string, Promise<any>>();
  
  static async deduplicateRequest<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!;
    }
    
    const promise = requestFn().finally(() => {
      this.pendingRequests.delete(key);
    });
    
    this.pendingRequests.set(key, promise);
    return promise;
  }
}

// Export performance optimization wrapper
export const withPerformanceOptimization = <T extends any[], R>(
  operationName: string,
  fn: (...args: T) => Promise<R>
) => {
  return async (...args: T): Promise<R> => {
    return PerformanceMonitor.trackOperation(operationName, () => fn(...args));
  };
};

// Automatic cleanup interval
if (typeof window === 'undefined') {
  setInterval(() => {
    MemoryManager.cleanupLargeObjects();
    QueryOptimizer.cleanupConnections();
  }, 300000); // Every 5 minutes
}