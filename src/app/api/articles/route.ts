import { NextRequest, NextResponse } from 'next/server';
import { createQueries } from '@/lib/db-enhanced';
import { nanoid } from 'nanoid';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get('siteId');
    const published = searchParams.get('published');
    const slug = searchParams.get('slug');
    const includeRealViews = searchParams.get('includeRealViews') === 'true';
    const tenantId = request.headers.get('X-Tenant-Id') || undefined;
    const queries = createQueries(tenantId);

    // If no siteId provided, fetch all articles (admin view)
    if (!siteId) {
      const allArticles = await queries.articleQueries.getAll();

      // For admin view, include real view counts
      if (includeRealViews) {
        const realViewsData = await queries.analyticsQueries.getArticlesWithRealViews('');
        const realViewsMap = new Map(realViewsData.map((r: any) => [r.id, r.real_views || 0]));
        const articlesWithRealViews = allArticles.map((a: any) => ({
          ...a,
          realViews: realViewsMap.get(a.id) || 0
        }));
        return NextResponse.json({ articles: articlesWithRealViews });
      }

      return NextResponse.json({ articles: allArticles });
    }

    // If slug is provided, fetch single article by slug
    if (slug) {
      const article = await queries.articleQueries.getBySlug(siteId, slug);

      // For public-facing requests (published=true), only return if article is published
      if (published === 'true' && article && !article.published) {
        return NextResponse.json({ article: null });
      }

      return NextResponse.json({ article });
    }

    // Otherwise fetch all articles for the site
    let articles = published === 'true'
      ? await queries.articleQueries.getPublishedBySite(siteId)
      : await queries.articleQueries.getAllBySite(siteId);

    // Include real views if requested
    if (includeRealViews) {
      const realViewsData = await queries.analyticsQueries.getArticlesWithRealViews(siteId);
      const realViewsMap = new Map(realViewsData.map((r: any) => [r.id, r.real_views || 0]));
      articles = articles.map((a: any) => ({
        ...a,
        realViews: realViewsMap.get(a.id) || 0
      }));
    }

    return NextResponse.json({ articles });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tenantId = request.headers.get('X-Tenant-Id') || undefined;
    const queries = createQueries(tenantId);
    
    const id = nanoid();
    const articleData = { id, ...body };

    if (!articleData.site_id || !articleData.title || !articleData.slug) {
      return NextResponse.json({ error: 'site_id, title, and slug are required' }, { status: 400 });
    }

    await queries.articleQueries.create(articleData);

    const article = await queries.articleQueries.getById(id);
    return NextResponse.json({ article }, { status: 201 });
  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json({ error: 'Failed to create article' }, { status: 500 });
  }
}