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

      // Get basic metrics - all in parallel
      const [sites, articles, realViewCounts, viewsByDate]: [any[], any[], any[], any[]] = await Promise.all([
        queries.siteQueries.getAll(),
        queries.articleQueries.getAll(),
        queries.analyticsQueries.getArticlesWithRealViews(''),
        queries.analyticsQueries.getViewsByDateRange(
          '',  // All sites
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
        )
      ]);
      const realViewsMap = new Map(realViewCounts.map((r: any) => [r.id, r.real_views || 0]));

      // Calculate total REAL views
      const totalRealViews = Array.from(realViewsMap.values()).reduce((sum: number, views: any) => sum + views, 0);

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

      // Articles analytics - using REAL views
      const articleAnalytics = {
        total: articles.length,
        published: articles.filter((article: { published: boolean; }) => article.published).length,
        draft: articles.filter((article: { published: boolean; }) => !article.published).length,
        featured: articles.filter((article: { featured: boolean; }) => article.featured).length,
        trending: articles.filter((article: { trending: boolean; }) => article.trending).length,
        totalViews: totalRealViews,  // Real views from article_views table
        averageViews: articles.length > 0 ? Math.round(totalRealViews / articles.length) : 0,
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

      // Views by date map was already fetched in the initial parallel query
      const viewsByDateMap = new Map(viewsByDate.map((v: any) => [v.date, v.views]));

      // Performance metrics (placeholder until we add real monitoring)
      const performanceMetrics: PerformanceMetrics = {
        averageResponseTime: 150,
        totalRequests: totalRealViews,  // Use real view count as proxy
        errorRate: 0.5,
        cacheHitRate: 85
      };

      // Activity timeline with real view data
      const activityTimeline: ActivityData[] = [];
      const days = timeRange === '24h' ? 1 : parseInt(timeRange.replace('d', ''));
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        // Count sites/articles created on this date
        const sitesCreatedOnDate = sites.filter((s: any) =>
          s.created_at && s.created_at.split('T')[0] === dateStr
        ).length;
        const articlesCreatedOnDate = articles.filter((a: any) =>
          a.created_at && a.created_at.split(' ')[0] === dateStr
        ).length;

        activityTimeline.push({
          date: dateStr,
          sites_created: sitesCreatedOnDate,
          articles_created: articlesCreatedOnDate,
          total_views: viewsByDateMap.get(dateStr) || 0,  // Real views!
          active_users: 0  // Would need session tracking for this
        });
      }

      // Top performing content - using REAL views
      const topArticles = articles
        .map((article: any) => ({
          ...article,
          realViews: realViewsMap.get(article.id) || 0
        }))
        .sort((a: any, b: any) => b.realViews - a.realViews)
        .slice(0, 10)
        .map((article: any) => ({
          id: article.id,
          title: article.title,
          views: article.realViews,  // Real views!
          displayViews: article.views,  // Fake display views
          site_id: article.site_id,
          published: article.published,
          category: article.category
        }));

      // Top sites by real views - fetch all site views in parallel
      const siteViewsPromises = sites.map((site: any) => queries.analyticsQueries.getSiteViews(site.id));
      const siteViewsResults = await Promise.all(siteViewsPromises);
      const siteViewsMap = new Map(sites.map((site: any, i: number) => [site.id, siteViewsResults[i]]));

      const topSites = sites
        .map((site: any) => {
          const siteArticles = articles.filter((a: any) => a.site_id === site.id);
          return {
            id: site.id,
            name: site.name,
            domain: site.domain,
            subdomain: site.subdomain,
            views: siteViewsMap.get(site.id) || 0,  // Real views!
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