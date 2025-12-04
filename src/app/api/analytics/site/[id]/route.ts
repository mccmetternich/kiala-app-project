import { NextRequest, NextResponse } from 'next/server';
import { createQueries } from '@/lib/db-enhanced';

// Get detailed analytics for a site
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: siteId } = await params;
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d';

    const queries = createQueries();

    // Get site conversion metrics (with fallback for missing columns)
    let conversionMetrics = { totalViews: 0, totalClicks: 0, totalEmails: 0, clickThroughRate: '0', emailConversionRate: '0' };
    try {
      conversionMetrics = await queries.analyticsQueries.getSiteConversionMetrics(siteId);
    } catch (err) {
      console.error('Error getting conversion metrics:', err);
    }

    // Get articles with full analytics - fallback to basic article list if analytics query fails
    let articlesWithAnalytics: any[] = [];
    try {
      articlesWithAnalytics = await queries.analyticsQueries.getArticlesWithAnalytics(siteId);
    } catch (err) {
      console.error('Error getting articles with analytics, falling back to basic list:', err);
      // Fallback: get articles without widget click stats
      const basicArticles = await queries.articleQueries.getAllBySite(siteId);
      articlesWithAnalytics = basicArticles.map((a: any) => ({
        ...a,
        real_views: 0,
        widget_clicks: 0,
        conversion_rate: 0
      }));
    }

    // Get email signups per article
    let emailSignupsPerArticle: any[] = [];
    try {
      emailSignupsPerArticle = await queries.analyticsQueries.getEmailSignupsPerArticle(siteId);
    } catch (err) {
      console.error('Error getting email signups per article:', err);
    }
    const emailSignupsMap = new Map(emailSignupsPerArticle.map((e: any) => [e.article_id, { signups: e.email_signups || 0, pdfDownloads: e.pdf_downloads || 0 }]));

    // Get top widgets for this site (with fallback)
    let topWidgets: any[] = [];
    try {
      topWidgets = await queries.analyticsQueries.getTopWidgets(siteId, 10);
    } catch (err) {
      console.error('Error getting top widgets:', err);
    }

    // Calculate time-based metrics
    const daysMap: Record<string, number> = { '24h': 1, '7d': 7, '30d': 30, '90d': 90 };
    const days = daysMap[timeRange] || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get views by date for chart (with fallback)
    const endDate = new Date().toISOString();
    let viewsByDate: any[] = [];
    try {
      viewsByDate = await queries.analyticsQueries.getViewsByDateRange(
        siteId,
        startDate.toISOString(),
        endDate
      ) || [];
    } catch (err) {
      console.error('Error getting views by date:', err);
    }

    // Get clicks by date for chart (with fallback)
    let clicksByDate: any[] = [];
    try {
      clicksByDate = await queries.analyticsQueries.getClicksByDateRange(
        siteId,
        startDate.toISOString(),
        endDate
      ) || [];
    } catch (err) {
      console.error('Error getting clicks by date:', err);
    }

    return NextResponse.json({
      siteId,
      timeRange,
      summary: {
        totalViews: conversionMetrics.totalViews,
        totalClicks: conversionMetrics.totalClicks,
        totalEmails: conversionMetrics.totalEmails,
        clickThroughRate: conversionMetrics.clickThroughRate,
        emailConversionRate: conversionMetrics.emailConversionRate,
        averageConversionRate: articlesWithAnalytics.length > 0
          ? Math.min(articlesWithAnalytics.reduce((sum: number, a: any) => sum + parseFloat(a.conversion_rate || 0), 0) / articlesWithAnalytics.length, 100).toFixed(2)
          : '0'
      },
      articles: articlesWithAnalytics.map((article: any) => {
        const emailData = emailSignupsMap.get(article.id) || { signups: 0, pdfDownloads: 0 };
        return {
          id: article.id,
          title: article.title,
          slug: article.slug,
          published: article.published,
          boosted: article.boosted,
          realViews: article.real_views || 0,
          widgetClicks: article.widget_clicks || 0,
          conversionRate: Math.min(parseFloat(article.conversion_rate || 0), 100),
          emailSignups: emailData.signups,
          pdfDownloads: emailData.pdfDownloads,
          createdAt: article.created_at
        };
      }),
      topWidgets: topWidgets.map((widget: any) => ({
        type: widget.widget_type,
        name: widget.widget_name || widget.widget_type,
        clicks: widget.clicks
      })),
      charts: {
        viewsByDate: viewsByDate || [],
        clicksByDate: clicksByDate || []
      }
    });
  } catch (error) {
    console.error('Error fetching site analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
