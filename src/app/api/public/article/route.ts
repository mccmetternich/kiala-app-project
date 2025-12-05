import { NextRequest, NextResponse } from 'next/server';
import { createQueries } from '@/lib/db-enhanced';

/**
 * Combined endpoint for fetching site + article in a single request
 * Eliminates waterfall loading on article pages
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subdomain = searchParams.get('subdomain');
    const slug = searchParams.get('slug');

    if (!subdomain || !slug) {
      return NextResponse.json(
        { error: 'subdomain and slug are required' },
        { status: 400 }
      );
    }

    const queries = createQueries();

    // Fetch site by subdomain first (we need the ID for the article query)
    const site = await queries.siteQueries.getBySubdomain(subdomain);

    // Check if site exists and is published
    if (!site) {
      return NextResponse.json({ site: null, article: null });
    }

    if (site.status !== 'published') {
      return NextResponse.json({ site: null, article: null });
    }

    // Now fetch the article with the actual site.id
    const article = await queries.articleQueries.getBySlug(site.id, slug);

    // Only return if article is published
    if (!article || !article.published) {
      return NextResponse.json({ site, article: null });
    }

    return NextResponse.json({ site, article });
  } catch (error) {
    console.error('Error fetching public article:', error);
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}
