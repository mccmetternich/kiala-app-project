import { NextRequest, NextResponse } from 'next/server';
import { createQueries } from '@/lib/db-enhanced';
import { withCache, cache, CacheTTL } from '@/lib/cache';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get('siteId'); // If provided, get site-specific stats
    const timeframe = searchParams.get('timeframe') || '7d';

    // Generate cache key
    const cacheKey = siteId 
      ? cache.keys.siteStats(siteId, timeframe)
      : cache.keys.globalStats(timeframe);

    // Use cache wrapper for performance
    const stats = await withCache(cacheKey, CacheTTL.DASHBOARD_STATS, async () => {
      return await generateDashboardStats(siteId, timeframe);
    });

    return NextResponse.json({ 
      stats, 
      siteSpecific: !!siteId,
      cached: true 
    });
    
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch dashboard statistics' 
    }, { status: 500 });
  }
}

async function generateDashboardStats(siteId: string | null, timeframe: string) {
  // Calculate date ranges based on timeframe
  const now = new Date();
  const getDateOffset = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString();
  };
    
    const timeframeDays = {
      '24h': 1,
      '7d': 7,
      '30d': 30,
      '90d': 90
    };
    
    const daysBack = timeframeDays[timeframe as keyof typeof timeframeDays] || 7;
    const startDate = getDateOffset(daysBack);
    const previousStartDate = getDateOffset(daysBack * 2);

    if (siteId) {
      // SITE-SPECIFIC METRICS - Using secure tenant isolation
      const queries = createQueries(siteId);
      const site = await queries.siteQueries.getById(siteId);
      if (!site) {
        throw new Error('Site not found');
      }

      // Get site-specific articles (automatically filtered by site_id)
      const allSiteArticles: any[] = await queries.articleQueries.getAllBySite(siteId);
      const publishedSiteArticles = allSiteArticles.filter((article: { published: boolean; }) => article.published);

      // Get site-specific email signups (automatically filtered by site_id)
      const allSiteEmails: any[] = await queries.emailQueries.getAllBySite(siteId);
      const recentSiteEmails = allSiteEmails.filter((email: { created_at: string | number | Date; }) =>
        new Date(email.created_at) >= new Date(startDate)
      );
      const previousSiteEmails = allSiteEmails.filter((email: { created_at: string | number | Date; }) =>
        new Date(email.created_at) >= new Date(previousStartDate) &&
        new Date(email.created_at) < new Date(startDate)
      );

      // Get REAL views from article_views table
      const realSiteViews = await queries.analyticsQueries.getSiteViews(siteId);
      const topArticlesWithRealViews = await queries.analyticsQueries.getTopArticles(siteId, 5);

      const totalSiteArticles = publishedSiteArticles.length;
      const totalSiteEmails = allSiteEmails.length;

      // Calculate growth rates
      const emailGrowth = previousSiteEmails.length > 0
        ? ((recentSiteEmails.length - previousSiteEmails.length) / recentSiteEmails.length * 100).toFixed(1)
        : recentSiteEmails.length > 0 ? '+100' : '0';

      const siteStats = {
        totalArticles: totalSiteArticles,
        totalViews: realSiteViews,  // REAL views from article_views table
        totalEmails: totalSiteEmails,
        recentEmails: recentSiteEmails.length,
        emailGrowth: `${emailGrowth}%`,
        conversionRate: realSiteViews > 0 ? ((totalSiteEmails / realSiteViews) * 100).toFixed(1) : '0',
        topArticles: topArticlesWithRealViews.map((article: any) => ({
          title: article.title,
          views: article.real_views || 0,  // REAL views
          slug: article.slug
        })),
        recentActivity: [
          ...recentSiteEmails.slice(0, 3).map((email: { email: string; created_at: string; }) => ({
            type: 'email_signup',
            description: `New email signup: ${email.email}`,
            timestamp: email.created_at
          })),
          ...allSiteArticles
            .filter((article: { created_at: string | number | Date; }) => new Date(article.created_at) >= new Date(startDate))
            .slice(0, 2)
            .map((article: { title: string; created_at: string; }) => ({
              type: 'article_created',
              description: `Article published: ${article.title}`,
              timestamp: article.created_at
            }))
        ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5)
      };

      return siteStats;

    } else {
      // GLOBAL ADMIN METRICS (aggregated across all sites)
      const queries = createQueries();
      const allSites: any[] = await queries.siteQueries.getAll();
      const allArticles: any[] = await queries.articleQueries.getAll();
      const allEmails: any[] = await (queries as any).emailQueries.getAll();

      // Filter by timeframe
      const recentEmails = allEmails.filter((email: { created_at: string | number | Date; }) =>
        new Date(email.created_at) >= new Date(startDate)
      );
      const previousEmails = allEmails.filter((email: { created_at: string | number | Date; }) =>
        new Date(email.created_at) >= new Date(previousStartDate) &&
        new Date(email.created_at) < new Date(startDate)
      );

      const recentArticles = allArticles.filter((article: { created_at: string | number | Date; }) =>
        new Date(article.created_at) >= new Date(startDate)
      );

      // Get REAL view counts from article_views table
      const articlesWithRealViews = await queries.analyticsQueries.getArticlesWithRealViews('');
      const realViewsMap = new Map(articlesWithRealViews.map((a: any) => [a.id, a.real_views || 0]));
      const totalRealViews = Array.from(realViewsMap.values()).reduce((sum: number, v: any) => sum + v, 0);

      const publishedArticles = allArticles.filter((article: { published: boolean; }) => article.published);

      // Calculate growth rates
      const emailGrowth = previousEmails.length > 0
        ? ((recentEmails.length - previousEmails.length) / previousEmails.length * 100).toFixed(1)
        : recentEmails.length > 0 ? '+100' : '0';

      const articleGrowth = recentArticles.length > 0 ? `+${recentArticles.length}` : '0';

      // Site performance breakdown with REAL views
      const sitePerformancePromises = allSites.map(async (site: { name: string; id: string; }) => {
        const siteArticles = allArticles.filter((article: { site_id: string; }) => article.site_id === site.id);
        const siteEmails = allEmails.filter((email: { site_id: string; }) => email.site_id === site.id);
        const realSiteViews = await queries.analyticsQueries.getSiteViews(site.id);

        return {
          siteName: site.name,
          siteId: site.id,
          articlesCount: siteArticles.filter((article: { published: boolean; }) => article.published).length,
          viewsCount: realSiteViews,  // REAL views
          emailsCount: siteEmails.length,
          conversionRate: realSiteViews > 0 ? ((siteEmails.length / realSiteViews) * 100).toFixed(1) : '0'
        };
      });
      const sitePerformance = (await Promise.all(sitePerformancePromises))
        .sort((a: { viewsCount: number; }, b: { viewsCount: number; }) => b.viewsCount - a.viewsCount);

      // Top articles by REAL views
      const topArticlesWithRealViews = allArticles
        .map((article: any) => ({
          ...article,
          realViews: realViewsMap.get(article.id) || 0
        }))
        .sort((a: any, b: any) => b.realViews - a.realViews)
        .slice(0, 10);

      const globalStats = {
        totalSites: allSites.length,
        totalArticles: publishedArticles.length,
        totalViews: totalRealViews,  // REAL views
        totalEmails: allEmails.length,
        recentEmails: recentEmails.length,
        emailGrowth: `${emailGrowth}%`,
        articleGrowth: `${articleGrowth} this ${timeframe}`,
        avgConversionRate: totalRealViews > 0 ? ((allEmails.length / totalRealViews) * 100).toFixed(1) : '0',
        sitePerformance,
        topArticlesGlobal: topArticlesWithRealViews.map((article: any) => {
          const site = allSites.find((s: { id: string; }) => s.id === article.site_id);
          return {
            title: article.title,
            views: article.realViews,  // REAL views
            displayViews: article.views,  // Fake display views
            slug: article.slug,
            siteName: site?.name || 'Unknown',
            siteId: article.site_id
          };
        }),
        recentActivity: [
          ...recentEmails.slice(0, 5).map((email: { site_id: string; created_at: string; email: string; }) => {
            const site = allSites.find((s: { id: string; }) => s.id === email.site_id);
            return {
              type: 'email_signup',
              description: `New signup on ${site?.name || 'Unknown'}: ${email.email}`,
              timestamp: email.created_at,
              siteId: email.site_id
            };
          }),
          ...recentArticles.slice(0, 3).map((article: { site_id: string; created_at: string; title: string; }) => {
            const site = allSites.find((s: { id: string; }) => s.id === article.site_id);
            return {
              type: 'article_created',
              description: `Article published on ${site?.name || 'Unknown'}: ${article.title}`,
              timestamp: article.created_at,
              siteId: article.site_id
            };
          })
        ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 8)
      };

      return globalStats;
    }
}