import { NextRequest, NextResponse } from 'next/server';
import { createQueries } from '@/lib/db-enhanced';
import { requirePermission, getSecurityHeaders, checkRateLimit } from '@/lib/auth';
import { cache, withCache, CacheTTL } from '@/lib/cache';

interface PerformanceMetrics {
  averageResponseTime: number;
  totalRequests: number;
  errorRate: number;
  cacheHitRate: number;
}

interface ActivityData {
  date: string;
  sites_created: number;
  articles_created: number;
  total_views: number;
  active_users: number;
}

export async function GET(request: NextRequest) {
  try {
    const headers = getSecurityHeaders();
    
    // Rate limiting for analytics
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimit = checkRateLimit(`analytics:${clientIp}`, { windowMs: 60000, maxRequests: 20 });
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded for analytics', resetTime: rateLimit.resetTime },
        { 
          status: 429,
          headers: {
            ...headers,
            'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString()
          }
        }
      );
    }

    // Require admin permission
    try {
      await requirePermission('read', 'admin' as any)(request);
    } catch (error) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 401, headers }
      );
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '7d';
    const includeDetails = searchParams.get('details') === 'true';

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case '24h':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    const cacheKey = `analytics:${timeRange}:${includeDetails}`;

    const data = await withCache(cacheKey, CacheTTL.DASHBOARD_STATS, async () => {
      const queries = createQueries();

      // Get basic metrics
      const [sites, articles]: [any[], any[]] = await Promise.all([
        queries.siteQueries.getAll(),
        queries.articleQueries.getAll()
      ]);

      // Calculate total views across all articles
      const totalViews = articles.reduce((sum: number, article: { views: number; }) => sum + (article.views || 0), 0);
      
      // Sites analytics
      const siteAnalytics = {
        total: sites.length,
        published: sites.filter((site: { status: string; }) => site.status === 'published').length,
        draft: sites.filter((site: { status: string; }) => site.status === 'draft').length,
        byTheme: sites.reduce((acc: { [x: string]: number; }, site: { theme: string | number; }) => {
          acc[site.theme] = (acc[site.theme] || 0) + 1;
          return acc;
        }, {}),
        createdInTimeRange: sites.filter((site: { created_at: string | number | Date; }) => {
          const createdDate = new Date(site.created_at);
          return createdDate >= startDate && createdDate <= endDate;
        }).length
      };

      // Articles analytics
      const articleAnalytics = {
        total: articles.length,
        published: articles.filter((article: { published: boolean; }) => article.published).length,
        draft: articles.filter((article: { published: boolean; }) => !article.published).length,
        featured: articles.filter((article: { featured: boolean; }) => article.featured).length,
        trending: articles.filter((article: { trending: boolean; }) => article.trending).length,
        totalViews,
        averageViews: articles.length > 0 ? Math.round(totalViews / articles.length) : 0,
        byCategory: articles.reduce((acc: { [x: string]: number; }, article: { category: string | number; }) => {
          const category = article.category || 'uncategorized';
          acc[category] = (acc[category] || 0) + 1;
          return acc;
        }, {}),
        createdInTimeRange: articles.filter((article: { created_at: string | number | Date; }) => {
          const createdDate = new Date(article.created_at);
          return createdDate >= startDate && createdDate <= endDate;
        }).length
      };

      // Performance metrics (simulated - would come from monitoring in production)
      const performanceMetrics: PerformanceMetrics = {
        averageResponseTime: Math.random() * 500 + 100, // 100-600ms
        totalRequests: Math.floor(Math.random() * 10000) + 5000,
        errorRate: Math.random() * 2, // 0-2%
        cacheHitRate: Math.random() * 20 + 80 // 80-100%
      };

      // Activity timeline (simulated daily data)
      const activityTimeline: ActivityData[] = [];
      for (let i = parseInt(timeRange.replace('d', '')) - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        activityTimeline.push({
          date: date.toISOString().split('T')[0],
          sites_created: Math.floor(Math.random() * 5),
          articles_created: Math.floor(Math.random() * 20),
          total_views: Math.floor(Math.random() * 1000) + 500,
          active_users: Math.floor(Math.random() * 50) + 20
        });
      }

      // Top performing content
      const topArticles = articles
        .sort((a: { views: number; }, b: { views: number; }) => (b.views || 0) - (a.views || 0))
        .slice(0, 10)
        .map((article: { id: any; title: any; views: any; site_id: any; published: any; category: any; }) => ({
          id: article.id,
          title: article.title,
          views: article.views || 0,
          site_id: article.site_id,
          published: article.published,
          category: article.category
        }));

      const topSites = sites
        .map((site: { id: any; name: any; domain: any; subdomain: any; status: any; }) => {
          const siteArticles = articles.filter((article: { site_id: any; }) => article.site_id === site.id);
          const siteViews = siteArticles.reduce((sum: number, article: { views: number; }) => sum + (article.views || 0), 0);
          return {
            id: site.id,
            name: site.name,
            domain: site.domain,
            subdomain: site.subdomain,
            views: siteViews,
            articleCount: siteArticles.length,
            status: site.status
          };
        })
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

      // Growth metrics
      const previousPeriodStart = new Date(startDate);
      previousPeriodStart.setTime(previousPeriodStart.getTime() - (endDate.getTime() - startDate.getTime()));
      
      const previousSitesCount = sites.filter((site: any) => {
        const createdDate = new Date(site.created_at);
        return createdDate >= previousPeriodStart && createdDate < startDate;
      }).length;

      const previousArticlesCount = articles.filter((article: { created_at: string | number | Date; }) => {
        const createdDate = new Date(article.created_at);
        return createdDate >= previousPeriodStart && createdDate < startDate;
      }).length;

      const growthMetrics = {
        sitesGrowth: previousSitesCount > 0 ? 
          ((siteAnalytics.createdInTimeRange - previousSitesCount) / previousSitesCount * 100) : 
          siteAnalytics.createdInTimeRange > 0 ? 100 : 0,
        articlesGrowth: previousArticlesCount > 0 ? 
          ((articleAnalytics.createdInTimeRange - previousArticlesCount) / previousArticlesCount * 100) : 
          articleAnalytics.createdInTimeRange > 0 ? 100 : 0
      };

      const response = {
        timeRange,
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        },
        summary: {
          totalSites: siteAnalytics.total,
          totalArticles: articleAnalytics.total,
          totalViews: articleAnalytics.totalViews,
          publishedSites: siteAnalytics.published,
          publishedArticles: articleAnalytics.published
        },
        sites: siteAnalytics,
        articles: articleAnalytics,
        performance: performanceMetrics,
        growth: growthMetrics,
        activity: activityTimeline,
        generatedAt: new Date().toISOString()
      };

      // Include detailed breakdowns if requested
      if (includeDetails) {
        (response as any).topContent = {
          articles: topArticles,
          sites: topSites
        };
      }

      return response;
    });

    return NextResponse.json(data, { headers });

  } catch (error) {
    console.error('Error in analytics endpoint:', error);
    return NextResponse.json(
      { 
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