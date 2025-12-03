import type { Metadata, ResolvingMetadata } from 'next';
import ArticlePageClient from './ArticlePageClient';
import db from '@/lib/db-enhanced';

type Props = {
  params: Promise<{ id: string; slug: string }>;
};

async function getArticleData(subdomain: string, slug: string) {
  try {
    // Query database directly instead of API call (more reliable for SSR)
    const siteResult = await db.execute({
      sql: 'SELECT * FROM sites WHERE subdomain = ?',
      args: [subdomain]
    });

    const site = siteResult.rows[0] as any;
    if (!site) return null;

    // Get the article
    const articleResult = await db.execute({
      sql: 'SELECT * FROM articles WHERE site_id = ? AND slug = ? AND published = 1',
      args: [site.id, slug]
    });

    const article = articleResult.rows[0] as any;
    if (!article) return null;

    // Parse brand profile
    const brand = site.brand_profile
      ? (typeof site.brand_profile === 'string' ? JSON.parse(site.brand_profile) : site.brand_profile)
      : null;

    return { article, site, brand };
  } catch (error) {
    console.error('Error fetching article data for metadata:', error);
    return null;
  }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id: subdomain, slug } = await params;
  const data = await getArticleData(subdomain, slug);

  if (!data?.article) {
    return {
      title: 'Article Not Found',
      description: 'The article you\'re looking for doesn\'t exist.',
    };
  }

  const { article, brand } = data;

  // For OG/social sharing: Always use Dr. Amy's about image (not the article hero)
  // This ensures a consistent brand presence when articles are shared
  const ogImagePath = brand?.sidebarImage ||
                      brand?.aboutImage ||
                      brand?.profileImage;

  // Ensure image URL is absolute - use Vercel URL for deployed environment
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
                  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://kiala-app-project.vercel.app');

  const ogImage = ogImagePath.startsWith('http')
    ? ogImagePath
    : `${baseUrl}${ogImagePath}`;

  const authorName = brand?.name || 'Dr. Amy Heart';
  const title = article.title;
  const description = article.excerpt ||
                      `Read this insightful article from ${authorName} about health and wellness for women over 40.`;

  return {
    title,
    description,
    authors: [{ name: authorName }],
    creator: authorName,
    keywords: [
      article.category || 'health',
      'women\'s health',
      'hormone balance',
      'menopause',
      'wellness',
      authorName
    ],
    openGraph: {
      type: 'article',
      locale: 'en_US',
      siteName: `${authorName} - Women's Health Authority`,
      title,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      publishedTime: article.published_at || article.created_at,
      authors: [authorName],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
      creator: '@dramyheart',
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function ArticlePage() {
  return <ArticlePageClient />;
}
