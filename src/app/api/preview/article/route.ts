import { NextRequest, NextResponse } from 'next/server';
import { createQueries } from '@/lib/db-enhanced';

/**
 * Preview endpoint for articles - bypasses published check
 * Requires a valid preview token (article ID) for security
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subdomain = searchParams.get('subdomain');
    const slug = searchParams.get('slug');
    const previewToken = searchParams.get('preview');

    if (!subdomain || !slug) {
      return NextResponse.json(
        { error: 'subdomain and slug are required' },
        { status: 400 }
      );
    }

    // Preview token is required for draft articles
    if (!previewToken) {
      return NextResponse.json(
        { error: 'Preview token required' },
        { status: 401 }
      );
    }

    const queries = createQueries();

    // Fetch site by subdomain
    const site = await queries.siteQueries.getBySubdomain(subdomain);

    if (!site) {
      return NextResponse.json({ site: null, article: null });
    }

    // For preview, we don't check site.status - allow previewing on unpublished sites too

    // Fetch the article without checking published status
    const article = await queries.articleQueries.getBySlug(site.id, slug);

    if (!article) {
      return NextResponse.json({ site, article: null });
    }

    // Validate preview token matches the article ID
    if (previewToken !== article.id) {
      return NextResponse.json(
        { error: 'Invalid preview token' },
        { status: 403 }
      );
    }

    // Return the article regardless of published status
    return NextResponse.json({
      site,
      article,
      isPreview: true
    });
  } catch (error) {
    console.error('Error fetching preview article:', error);
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}
