import { NextRequest, NextResponse } from 'next/server';
import { createQueries } from '@/lib/db-enhanced';
import { requirePermission, getSecurityHeaders, checkRateLimit } from '@/lib/auth';
import { cache } from '@/lib/cache';

interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency?: number;
  details?: any;
  lastChecked: string;
}

export async function GET(request: NextRequest) {
  try {
    const headers = getSecurityHeaders();
    
    // Rate limiting for health checks
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimit = checkRateLimit(`health:${clientIp}`, { windowMs: 60000, maxRequests: 30 });
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded for health checks', resetTime: rateLimit.resetTime },
        { 
          status: 429,
          headers: {
            ...headers,
            'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString()
          }
        }
      );
    }

    // Require admin permission for health checks
    try {
      await requirePermission('read', 'admin' as any)(request);
    } catch (error) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 401, headers }
      );
    }

    const healthChecks: HealthCheck[] = [];
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    // Database Health Check
    try {
      const dbStart = Date.now();
      const queries = createQueries();
      await queries.siteQueries.getAll();
      const dbLatency = Date.now() - dbStart;
      
      healthChecks.push({
        service: 'database',
        status: dbLatency < 1000 ? 'healthy' : dbLatency < 3000 ? 'degraded' : 'unhealthy',
        latency: dbLatency,
        details: {
          type: 'SQLite',
          latency: `${dbLatency}ms`
        },
        lastChecked: new Date().toISOString()
      });

      if (dbLatency >= 1000) overallStatus = 'degraded';
      if (dbLatency >= 3000) overallStatus = 'unhealthy';
    } catch (error: any) {
      healthChecks.push({
        service: 'database',
        status: 'unhealthy',
        details: {
          error: error.message
        },
        lastChecked: new Date().toISOString()
      });
      overallStatus = 'unhealthy';
    }

    // Cache Health Check (Redis)
    try {
      const cacheStart = Date.now();
      const cacheHealthy = await (cache as any).ping();
      const cacheLatency = Date.now() - cacheStart;
      
      healthChecks.push({
        service: 'cache',
        status: cacheHealthy && cacheLatency < 500 ? 'healthy' : cacheHealthy ? 'degraded' : 'unhealthy',
        latency: cacheLatency,
        details: {
          type: 'Redis',
          connected: cacheHealthy,
          latency: `${cacheLatency}ms`
        },
        lastChecked: new Date().toISOString()
      });

      if (!cacheHealthy || cacheLatency >= 500) {
        if (overallStatus === 'healthy') overallStatus = 'degraded';
      }
    } catch (error: any) {
      healthChecks.push({
        service: 'cache',
        status: 'unhealthy',
        details: {
          error: error.message
        },
        lastChecked: new Date().toISOString()
      });
      overallStatus = 'unhealthy';
    }

    // System Metrics
    const systemMetrics = {
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024)
      },
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch
    };

    // Application Metrics
    try {
      const queries = createQueries();
      const [sites, articles]: [any[], any[]] = await Promise.all([
        queries.siteQueries.getAll(),
        queries.articleQueries.getAll()
      ]);

      const appMetrics = {
        totalSites: sites.length,
        totalArticles: articles.length,
        publishedSites: sites.filter((site: any) => site.status === 'published').length,
        publishedArticles: articles.filter((article: any) => article.published).length
      };

      return NextResponse.json({
        status: overallStatus,
        timestamp: new Date().toISOString(),
        checks: healthChecks,
        system: systemMetrics,
        application: appMetrics,
        version: process.env.APP_VERSION || '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      }, { headers });

    } catch (error: any) {
      console.error('Error getting application metrics:', error);
      
      return NextResponse.json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        checks: healthChecks,
        system: systemMetrics,
        error: 'Failed to fetch application metrics'
      }, { 
        status: 503,
        headers 
      });
    }

  } catch (error) {
    console.error('Error in health check:', error);
    return NextResponse.json(
      { 
        status: 'unhealthy',
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      },
      { 
        status: 500,
        headers: getSecurityHeaders()
      }
    );
  }
}