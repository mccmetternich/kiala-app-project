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

      // Fetch all site-specific data in parallel
      const [site, allSiteArticles, allSiteEmails, realSiteViews, topArticlesWithRealViews] = await Promise.all([
        queries.siteQueries.getById(siteId),
        queries.articleQueries.getAllBySite(siteId),
        queries.emailQueries.getAllBySite(siteId),
        queries.analyticsQueries.getSiteViews(siteId),
        queries.analyticsQueries.getTopArticles(siteId, 5)
      ]);

      if (!site) {
        throw new Error('Site not found');
      }

      const publishedSiteArticles = allSiteArticles.filter((article: { published: boolean; }) => article.published);

      // Only count ACTIVE subscribers for metrics
      const activeSiteEmails = allSiteEmails.filter((email: any) => email.status === 'active');
      const recentSiteEmails = activeSiteEmails.filter((email: { created_at: string | number | Date; }) =>
        new Date(email.created_at) >= new Date(startDate)
      );
      const previousSiteEmails = activeSiteEmails.filter((email: { created_at: string | number | Date; }) =>
        new Date(email.created_at) >= new Date(previousStartDate) &&
        new Date(email.created_at) < new Date(startDate)
      );

      // PDF download sources - only count ACTIVE subscribers
      const pdfDownloadSources = ['hormone_guide_widget', 'exit_intent_popup', 'community_popup', 'lead_magnet', 'guide_download', 'pdf_download', 'wellness_guide', 'lead_magnet_form'];
      const sitePdfDownloads = activeSiteEmails.filter((email: any) =>
        pdfDownloadSources.some(src => email.source?.toLowerCase().includes(src.toLowerCase())) ||
        (email.tags && JSON.stringify(email.tags).includes('lead_magnet'))
      ).length;

      const totalSiteArticles = publishedSiteArticles.length;
      const totalSiteEmails = activeSiteEmails.length; // Only active emails

      // Calculate growth rates
      const emailGrowth = previousSiteEmails.length > 0
        ? ((recentSiteEmails.length - previousSiteEmails.length) / recentSiteEmails.length * 100).toFixed(1)
        : recentSiteEmails.length > 0 ? '+100' : '0';

      const siteStats = {
        totalArticles: totalSiteArticles,
        totalViews: realSiteViews,  // REAL views from article_views table
        totalEmails: totalSiteEmails,
        pdfDownloads: sitePdfDownloads,
        recentEmails: recentSiteEmails.length,
        emailGrowth: `${emailGrowth}%`,
        conversionRate: realSiteViews > 0 ? Math.min((totalSiteEmails / realSiteViews) * 100, 100).toFixed(1) : '0',
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
      // Run all independent queries in parallel for better performance
      const queries = createQueries();

      // Phase 1: Fetch all base data in parallel
      const [allSites, allArticles, allEmails, articlesWithRealViews, topWidgetsGlobal, totalCtaClicks] = await Promise.all([
        queries.siteQueries.getAll(),
        queries.articleQueries.getAll(),
        (queries as any).emailQueries.getAll(),
        queries.analyticsQueries.getArticlesWithRealViews(''),
        queries.analyticsQueries.getTopWidgetsGlobal(20),
        queries.analyticsQueries.getTotalWidgetClicks()
      ]);

      // Only count ACTIVE subscribers for metrics
      const activeEmails = allEmails.filter((email: any) => email.status === 'active');

      // Filter by timeframe - using active emails only
      const recentEmails = activeEmails.filter((email: { created_at: string | number | Date; }) =>
        new Date(email.created_at) >= new Date(startDate)
      );
      const previousEmails = activeEmails.filter((email: { created_at: string | number | Date; }) =>
        new Date(email.created_at) >= new Date(previousStartDate) &&
        new Date(email.created_at) < new Date(startDate)
      );

      const recentArticles = allArticles.filter((article: { created_at: string | number | Date; }) =>
        new Date(article.created_at) >= new Date(startDate)
      );

      // Build views map from already-fetched data
      const realViewsMap = new Map(articlesWithRealViews.map((a: any) => [a.id, a.real_views || 0]));
      const totalRealViews = Array.from(realViewsMap.values()).reduce((sum: number, v: any) => sum + v, 0);

      const publishedArticles = allArticles.filter((article: { published: boolean; }) => article.published);
      const boostedArticles = allArticles.filter((article: any) => article.boosted);
      const publishedSites = allSites.filter((site: any) => site.published || site.status === 'published');

      // PDF download sources (global) - only count ACTIVE subscribers
      const pdfDownloadSources = ['hormone_guide_widget', 'exit_intent_popup', 'community_popup', 'lead_magnet', 'guide_download', 'pdf_download', 'wellness_guide', 'lead_magnet_form'];
      const totalPdfDownloads = activeEmails.filter((email: any) =>
        pdfDownloadSources.some(src => email.source?.toLowerCase().includes(src.toLowerCase())) ||
        (email.tags && JSON.stringify(email.tags).includes('lead_magnet'))
      ).length;

      // Calculate growth rates
      const emailGrowth = previousEmails.length > 0
        ? ((recentEmails.length - previousEmails.length) / previousEmails.length * 100).toFixed(1)
        : recentEmails.length > 0 ? '+100' : '0';

      const articleGrowth = recentArticles.length > 0 ? `+${recentArticles.length}` : '0';

      // Phase 2: Get site views in parallel (now that we have allSites)
      const siteViewsPromises = allSites.map((site: { id: string; }) =>
        queries.analyticsQueries.getSiteViews(site.id)
      );
      const siteViewsResults = await Promise.all(siteViewsPromises);
      const siteViewsMap = new Map(allSites.map((site: { id: string; }, i: number) => [site.id, siteViewsResults[i]]));

      // Site performance breakdown with REAL views - use active emails only (no more N+1)
      const sitePerformance = allSites.map((site: { name: string; id: string; }) => {
        const siteArticles = allArticles.filter((article: { site_id: string; }) => article.site_id === site.id);
        const siteActiveEmails = activeEmails.filter((email: { site_id: string; }) => email.site_id === site.id);
        const realSiteViews = siteViewsMap.get(site.id) || 0;

        return {
          siteName: site.name,
          siteId: site.id,
          articlesCount: siteArticles.filter((article: { published: boolean; }) => article.published).length,
          viewsCount: realSiteViews,  // REAL views
          emailsCount: siteActiveEmails.length, // Only active emails
          conversionRate: realSiteViews > 0 ? Math.min((siteActiveEmails.length / realSiteViews) * 100, 100).toFixed(1) : '0'
        };
      }).sort((a: { viewsCount: number; }, b: { viewsCount: number; }) => b.viewsCount - a.viewsCount);

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
        activeSites: publishedSites.length,
        totalArticles: publishedArticles.length,
        boostedArticles: boostedArticles.length,
        totalViews: totalRealViews,  // REAL views
        totalCtaClicks,  // Total CTA clicks for click conversion calculation
        totalEmails: activeEmails.length, // Only active emails
        totalEmailsIncludingUnsubscribed: allEmails.length, // For "Total Emails" display
        pdfDownloads: totalPdfDownloads,
        recentEmails: recentEmails.length,
        emailGrowth: `${emailGrowth}%`,
        articleGrowth: `${articleGrowth} this ${timeframe}`,
        avgConversionRate: totalRealViews > 0 ? Math.min((activeEmails.length / totalRealViews) * 100, 100).toFixed(1) : '0',
        clickConversionRate: totalRealViews > 0 ? Math.min((totalCtaClicks / totalRealViews) * 100, 100).toFixed(1) : '0',
        sitePerformance,
        topArticlesGlobal: topArticlesWithRealViews.map((article: any) => {
          const site = allSites.find((s: { id: string; }) => s.id === article.site_id);
          return {
            id: article.id,
            title: article.title,
            views: article.realViews,  // REAL views
            displayViews: article.views,  // Fake display views
            slug: article.slug,
            siteName: site?.name || 'Unknown',
            siteId: article.site_id,
            boosted: article.boosted
          };
        }),
        topWidgetsGlobal: topWidgetsGlobal.map((widget: any) => {
          const site = allSites.find((s: { id: string; }) => s.id === widget.site_id);
          // Calculate CTR for this widget if we have views data
          const articleViews = widget.article_id ? (realViewsMap.get(widget.article_id) || 0) : 0;
          const ctr = articleViews > 0 ? Math.min((widget.clicks / articleViews) * 100, 100).toFixed(1) : '0';
          return {
            type: widget.widget_type,
            name: widget.widget_name || widget.widget_type,
            clicks: widget.clicks,
            ctr,
            articleId: widget.article_id,
            articleTitle: widget.article_title || 'Unknown',
            siteName: site?.name || 'Unknown',
            siteId: widget.site_id
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