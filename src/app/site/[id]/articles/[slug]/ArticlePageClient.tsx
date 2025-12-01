'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import SiteLayout from '@/components/layout/SiteLayout';
import CredibilitySidebar from '@/components/CredibilitySidebar';
import ArticleTemplate from '@/components/ArticleTemplate';
import { Site, Page, Widget } from '@/types';
import { generateDefaultWidgetConfig, parseWidgetConfig } from '@/lib/article-widget-defaults';
import { TrackingProvider } from '@/contexts/TrackingContext';

// Fallback site data (same as other dynamic pages)
const fallbackSite: Site = {
  id: 'fallback-site',
  name: 'Health Authority',
  domain: 'example.com',
  theme: {
    name: 'Medical Authority',
    colors: {
      primary: '#1e40af',
      secondary: '#059669',
      accent: '#dc2626',
      trust: '#0369a1',
      background: '#fefefe',
      text: '#374151'
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Inter'
    },
    style: 'medical'
  },
  brand: {
    name: 'Health Authority',
    tagline: 'Your trusted source for health information',
    bio: 'We are a team of health experts dedicated to providing you with the most accurate and up-to-date health information.',
    logo: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=100&h=100&fit=crop',
    profileImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop',
    quote: 'True wellness comes from understanding your body\'s unique needs.'
  },
  settings: {
    navigation: [
      { label: 'Home', url: '/', type: 'internal' },
      { label: 'Articles', url: '/articles', type: 'internal' },
      { label: 'My Top Picks', url: '/top-picks', type: 'internal' },
      { label: 'Success Stories', url: '/success-stories', type: 'internal' },
      { label: 'About', url: '/about', type: 'internal' }
    ],
    footer: {
      disclaimer: 'This information is for educational purposes only.',
      privacyPolicy: '/privacy',
      termsOfService: '/terms',
      contact: {
        email: 'hello@example.com',
        phone: '(555) 123-4567'
      }
    },
    emailCapture: {
      provider: 'convertkit',
      apiKey: 'test-key',
      listId: 'test-list'
    },
    social: {}
  },
  pages: [],
  createdAt: new Date(),
  updatedAt: new Date()
};

export default function ArticlePageClient() {
  const params = useParams();
  const siteId = params?.id as string;
  const slug = params?.slug as string;

  const [siteData, setSiteData] = useState<any>(null);
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!siteId || !slug) return;

      try {
        // Fetch site data by subdomain (same pattern as other pages)
        const siteResponse = await fetch(`/api/sites?subdomain=${siteId}`);
        if (siteResponse.ok) {
          const siteResult = await siteResponse.json();
          const site = siteResult.site;
          if (site) {
            setSiteData(site);

            // Fetch specific article using actual site ID
            const articleResponse = await fetch(`/api/articles?siteId=${site.id}&slug=${slug}`);
            if (articleResponse.ok) {
              const articleData = await articleResponse.json();
              // API returns { article } for single article fetch by slug
              const fetchedArticle = articleData.article || (articleData.articles && articleData.articles[0]);
              if (fetchedArticle) {
                setArticle(fetchedArticle);

                // Increment view count
                fetch(`/api/articles/${fetchedArticle.id}/view`, {
                  method: 'POST'
                }).catch(console.error);
              }
            }
          } else {
            setSiteData(fallbackSite);
          }
        } else {
          setSiteData(fallbackSite);
        }
      } catch (error) {
        console.error('Error loading article:', error);
        setSiteData(fallbackSite);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [siteId, slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
          <p className="text-gray-600">The article you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  // Transform database site data to match the Site interface
  const transformedSite = siteData ? {
    ...fallbackSite,
    ...siteData,
    brand: typeof siteData.brand_profile === 'string'
      ? JSON.parse(siteData.brand_profile)
      : siteData.brand_profile || fallbackSite.brand,
    settings: typeof siteData.settings === 'string'
      ? { ...fallbackSite.settings, ...JSON.parse(siteData.settings) }
      : { ...fallbackSite.settings, ...siteData.settings }
  } : fallbackSite;

  // Get widgets from database (widget_config) or generate defaults
  // Priority: 1. Stored widget_config, 2. Generated defaults based on article content
  const articleWidgets: Widget[] = (() => {
    // Try to parse stored widget_config from database
    const storedWidgets = parseWidgetConfig(article.widget_config);
    if (storedWidgets && storedWidgets.length > 0) {
      return storedWidgets;
    }

    // Generate default widgets based on article content
    return generateDefaultWidgetConfig({
      id: article.id,
      title: article.title,
      excerpt: article.excerpt || '',
      content: article.content || '',
      category: article.category || 'Health',
      image: article.image || '',
      siteId: siteId,
      siteBrandName: transformedSite.brand?.name
    });
  })();

  // Create page object for ArticleTemplate
  const articlePage: Page = {
    id: article.id,
    slug: article.slug,
    title: article.title,
    type: 'article',
    content: {
      widgets: articleWidgets as any,
      layout: {
        type: 'with-sidebar',
        maxWidth: '1200px'
      }
    },
    seo: {
      title: `${article.title} | ${transformedSite.name}`,
      description: article.excerpt || 'Read this insightful health article.',
      keywords: [article.category || 'health']
    },
    published: true,
    publishedAt: new Date(article.published_at || article.created_at)
  };

  return (
    <TrackingProvider config={article.tracking_config}>
      <SiteLayout
        site={transformedSite}
        showSidebar={true}
        isArticle={true}
        sidebar={
          <CredibilitySidebar
            doctor={transformedSite.brand}
            leadMagnet={transformedSite.settings?.emailCapture?.leadMagnet}
            communityCount={47284}
            showLeadMagnet={true}
            siteId={siteId}
            audioTrackUrl={transformedSite.settings?.audioUrl || "/audio/dr-amy-welcome.mp3"}
          />
        }
      >
        <ArticleTemplate
          page={articlePage}
          site={transformedSite}
          views={article.views}
          readTime={article.read_time}
        />
      </SiteLayout>
    </TrackingProvider>
  );
}
