import type { Metadata, ResolvingMetadata } from 'next';
import ArticlePageClient from './ArticlePageClient';

type Props = {
  params: Promise<{ id: string; slug: string }>;
};

async function getArticleData(subdomain: string, slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
                    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

    // First get the site to get actual site ID
    const siteResponse = await fetch(`${baseUrl}/api/sites?subdomain=${subdomain}`, {
      next: { revalidate: 60 }
    });

    if (!siteResponse.ok) return null;

    const siteData = await siteResponse.json();
    const site = siteData.site;
    if (!site) return null;

    // Then get the article
    const articleResponse = await fetch(`${baseUrl}/api/articles?siteId=${site.id}&slug=${slug}`, {
      next: { revalidate: 60 }
    });

    if (!articleResponse.ok) return null;

    const articleData = await articleResponse.json();
    const article = articleData.article || (articleData.articles && articleData.articles[0]);

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

  // Use article hero image, or fall back to article image, or brand image
  const heroImage = article.image ||
                    brand?.profileImage ||
                    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=1200&h=630&fit=crop';

  // Ensure image URL is absolute
  const ogImage = heroImage.startsWith('http')
    ? heroImage
    : `${process.env.NEXT_PUBLIC_BASE_URL || 'https://dramyheart.com'}${heroImage}`;

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
