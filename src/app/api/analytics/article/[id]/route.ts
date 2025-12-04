import { NextRequest, NextResponse } from 'next/server';
import { createQueries } from '@/lib/db-enhanced';
import db from '@/lib/db-enhanced';

// Helper to execute queries
async function queryAll(sql: string, args: any[] = []): Promise<any[]> {
  const result = await db.execute({ sql, args });
  return result.rows as any[];
}

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

    // Get email signups from this article page
    const articleSlug = article.slug;
    const emailSignups = await queryAll(
      `SELECT * FROM email_subscribers
       WHERE site_id = ?
       AND (page_url LIKE ? OR page_url LIKE ?)
       ORDER BY created_at DESC`,
      [article.site_id, `%/articles/${articleSlug}%`, `%/articles/${articleSlug}`]
    );

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
        emailSignups: emailSignups.length,
        emails: emailSignups.slice(0, 10).map((e: any) => ({
          id: e.id,
          email: e.email,
          source: e.source,
          createdAt: e.created_at
        })),
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
