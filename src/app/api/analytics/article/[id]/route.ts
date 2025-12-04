import { NextRequest, NextResponse } from 'next/server';
import { createQueries } from '@/lib/db-enhanced';

// Get detailed analytics for an article
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: articleId } = await params;

    const queries = createQueries();

    // Get article analytics with widget breakdown
    const analytics = await queries.analyticsQueries.getArticleAnalytics(articleId);

    // Get the article details
    const article = await queries.articleQueries.getById(articleId);

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    return NextResponse.json({
      articleId,
      title: article.title,
      slug: article.slug,
      published: article.published,
      boosted: article.boosted,
      analytics: {
        views: analytics.views,
        clicks: analytics.clicks,
        conversionRate: analytics.conversionRate,
        widgetBreakdown: analytics.widgetBreakdown.map((w: any) => ({
          type: w.widget_type,
          name: w.widget_name || w.widget_type,
          clicks: w.clicks
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching article analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
