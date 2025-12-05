'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import SiteLayout from '@/components/layout/SiteLayout';
import CredibilitySidebar from '@/components/CredibilitySidebar';
import ArticleTemplate from '@/components/ArticleTemplate';
import { Site, Page, Widget } from '@/types';
import { generateDefaultWidgetConfig, parseWidgetConfig } from '@/lib/article-widget-defaults';
import { TrackingProvider } from '@/contexts/TrackingContext';
import { trackViewContent } from '@/lib/meta-pixel';
import { getCommunityCount } from '@/lib/format-community-count';

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
    profileImage: '',
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
        // Use combined endpoint to fetch site + article in a single request (eliminates waterfall)
        const response = await fetch(`/api/public/article?subdomain=${siteId}&slug=${slug}`);
        if (response.ok) {
          const data = await response.json();

          if (data.site) {
            setSiteData(data.site);

            if (data.article) {
              setArticle(data.article);

              // Increment view count (fire-and-forget)
              fetch(`/api/articles/${data.article.id}/view`, {
                method: 'POST'
              }).catch(console.error);

              // Fire Meta Pixel ViewContent event
              trackViewContent({
                content_name: data.article.title,
                content_type: 'article',
                content_ids: [data.article.id],
                content_category: data.article.category || 'Health'
              });
            }
          } else {
            // Site not found or not published
            setSiteData(null);
          }
        } else {
          setSiteData(null);
        }
      } catch (error) {
        console.error('Error loading article:', error);
        setSiteData(null);
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

  // Site not found or not published - show 404
  if (!siteData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Site Not Available</h1>
          <p className="text-gray-600 mb-6">
            This site is currently unavailable. It may be temporarily offline or no longer exists.
          </p>
          <a
            href="/"
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Go Home
          </a>
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
            communityCount={getCommunityCount(transformedSite.settings)}
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
          heroImage={article.image}
        />
      </SiteLayout>
    </TrackingProvider>
  );
}
