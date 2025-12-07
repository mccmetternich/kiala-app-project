'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import SiteLayout from '@/components/layout/SiteLayout';
import CredibilitySidebar from '@/components/CredibilitySidebar';
import ArticleTemplate from '@/components/ArticleTemplate';
import { Site, Page, Widget } from '@/types';
import { generateDefaultWidgetConfig, parseWidgetConfig } from '@/lib/article-widget-defaults';
import { getCommunityCount } from '@/lib/format-community-count';
import { TrackingProvider } from '@/contexts/TrackingContext';

// Fallback site data
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

export default function PreviewArticlePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const siteId = params?.id as string;
  const slug = params?.slug as string;
  const previewToken = searchParams?.get('token');

  const [siteData, setSiteData] = useState<any>(null);
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!siteId || !slug) return;

      if (!previewToken) {
        setError('Preview token required. Access this page from the article editor.');
        setLoading(false);
        return;
      }

      try {
        // Use preview endpoint that bypasses published check
        const response = await fetch(
          `/api/preview/article?subdomain=${siteId}&slug=${slug}&preview=${previewToken}`
        );

        if (response.ok) {
          const data = await response.json();

          if (data.site) {
            setSiteData(data.site);
            if (data.article) {
              setArticle(data.article);
            }
          } else {
            setSiteData(null);
          }
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to load preview');
          setSiteData(null);
        }
      } catch (err) {
        console.error('Error loading preview:', err);
        setError('Failed to load preview');
        setSiteData(null);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [siteId, slug, previewToken]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading preview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Preview Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
        </div>
      </div>
    );
  }

  if (!siteData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Site Not Found</h1>
          <p className="text-gray-600">The site you're looking for doesn't exist.</p>
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
  const articleWidgets: Widget[] = (() => {
    const storedWidgets = parseWidgetConfig(article.widget_config);
    if (storedWidgets && storedWidgets.length > 0) {
      return storedWidgets;
    }

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
      {/* Preview Banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-amber-900 py-2 px-4 text-center text-sm font-medium shadow-md">
        <span className="inline-flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Preview Mode — {article.published ? 'Live' : 'Draft'} Article
        </span>
      </div>

      <div className="pt-10">
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
      </div>
    </TrackingProvider>
  );
}
