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

    // Get site conversion metrics
    const conversionMetrics = await queries.analyticsQueries.getSiteConversionMetrics(siteId);

    // Get articles with full analytics (views, clicks, conversion)
    const articlesWithAnalytics = await queries.analyticsQueries.getArticlesWithAnalytics(siteId);

    // Get top widgets for this site
    const topWidgets = await queries.analyticsQueries.getTopWidgets(siteId, 10);

    // Get email count for conversion rates
    const emailCount = conversionMetrics.totalEmails;

    // Calculate time-based metrics
    const daysMap: Record<string, number> = { '24h': 1, '7d': 7, '30d': 30, '90d': 90 };
    const days = daysMap[timeRange] || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get views by date for chart
    const endDate = new Date().toISOString();
    const viewsByDate = await queries.analyticsQueries.getViewsByDateRange(
      siteId,
      startDate.toISOString(),
      endDate
    );

    // Get clicks by date for chart
    const clicksByDate = await queries.analyticsQueries.getClicksByDateRange(
      siteId,
      startDate.toISOString(),
      endDate
    );

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
          ? (articlesWithAnalytics.reduce((sum: number, a: any) => sum + parseFloat(a.conversion_rate || 0), 0) / articlesWithAnalytics.length).toFixed(2)
          : '0'
      },
      articles: articlesWithAnalytics.map((article: any) => ({
        id: article.id,
        title: article.title,
        slug: article.slug,
        published: article.published,
        boosted: article.boosted,
        realViews: article.real_views || 0,
        widgetClicks: article.widget_clicks || 0,
        conversionRate: article.conversion_rate || 0,
        createdAt: article.created_at
      })),
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
