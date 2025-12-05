'use client';

import { useEffect, useState } from 'react';
import { useSiteId } from '@/hooks/useSiteId';
import SiteLayout from '@/components/layout/SiteLayout';
import CredibilitySidebar from '@/components/CredibilitySidebar';
import HeroStory from '@/widgets/HeroStory';
import ArticleGrid from '@/widgets/ArticleGrid';
import SocialValidationTile from '@/widgets/SocialValidationTile';
import NewsletterSignup from '@/widgets/NewsletterSignup';
import { Site, WidgetConfig } from '@/types';
import { clientAPI } from '@/lib/api';
import { getCommunityCount } from '@/lib/format-community-count';

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
      listId: 'test-list',
      leadMagnet: {
        title: 'Health Guide',
        description: 'Get your free health guide',
        downloadUrl: '/downloads/guide.pdf',
        image: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=100&h=100&fit=crop'
      }
    },
    social: {
      instagram: 'https://instagram.com/example',
      facebook: 'https://facebook.com/example',
      youtube: 'https://youtube.com/example'
    }
  },
  pages: [],
  createdAt: new Date(),
  updatedAt: new Date()
};

export default function DynamicSiteHomepage() {
  const siteId = useSiteId();
  
  const [siteData, setSiteData] = useState<any>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [heroArticle, setHeroArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!siteId) return;

      try {
        // Fetch site data by subdomain (publishedOnly=true for public pages)
        const response = await fetch(`/api/sites?subdomain=${siteId}&publishedOnly=true`);

        if (response.ok) {
          const data = await response.json();
          const site = data.site;
          if (site) {
            setSiteData(site);

            // Fetch articles for this site using actual site ID
            const articlesResponse = await fetch(`/api/articles?siteId=${site.id}&published=true`);
            if (articlesResponse.ok) {
              const articlesData = await articlesResponse.json();
              const siteArticles = articlesData.articles || [];
              setArticles(siteArticles);

              // Find hero article (use hero flag, fallback to first article)
              const heroArt = siteArticles.find((article: any) => article.hero);
              setHeroArticle(heroArt || siteArticles[0]);
            }
          } else {
            // Site not found or not published - set to null to trigger 404
            setSiteData(null);
          }
        } else {
          setSiteData(null);
        }
      } catch {
        setSiteData(null);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [siteId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
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

  // Transform database site data to match the Site interface
  const transformedSite = siteData ? {
    ...fallbackSite,
    ...siteData,
    brand: typeof siteData.brand_profile === 'string'
      ? JSON.parse(siteData.brand_profile)
      : siteData.brand_profile || fallbackSite.brand,
    settings: typeof siteData.settings === 'string'
      ? { ...fallbackSite.settings, ...JSON.parse(siteData.settings) }
      : { ...fallbackSite.settings, ...siteData.settings },
    page_config: typeof siteData.page_config === 'string'
      ? JSON.parse(siteData.page_config || '{}')
      : siteData.page_config || {}
  } : fallbackSite;

  return (
    <SiteLayout
      site={transformedSite}
      showSidebar={true}
      pageSlug="/"
      sidebar={
        <CredibilitySidebar
          doctor={transformedSite.brand}
          leadMagnet={transformedSite.settings?.emailCapture?.leadMagnet}
          communityCount={getCommunityCount(transformedSite.settings)}
          showLeadMagnet={true}
          siteId={siteData?.id || siteId || undefined}
          audioTrackUrl={transformedSite.settings?.audioUrl || "/audio/dr-amy-welcome.mp3"}
        />
      }
    >
      <div className="space-y-8">
        {/* Hero Story */}
        {heroArticle ? (
          <HeroStory config={{
            headline: heroArticle.title,
            subheading: heroArticle.excerpt,
            image: heroArticle.image,
            buttonText: 'Read My Breakthrough Story →',
            buttonUrl: `/site/${siteId}/articles/${heroArticle.slug}`,
            rating: '4.9',
            views: heroArticle.views,
            readTime: heroArticle.read_time,
            author: transformedSite.brand?.name || 'Dr. Heart',
            authorImage: transformedSite.brand?.authorImage || transformedSite.brand?.sidebarImage || transformedSite.brand?.profileImage
          }} />
        ) : (
          <HeroStory config={{
            headline: 'Transform Your Health Today',
            subheading: 'Discover evidence-based approaches to wellness that actually work',
            image: 'https://images.unsplash.com/photo-1506629905270-11674e167d6f?w=600&h=400&fit=crop',
            buttonText: 'Learn More →',
            author: transformedSite.brand?.name || 'Dr. Heart',
            authorImage: transformedSite.brand?.authorImage || transformedSite.brand?.sidebarImage || transformedSite.brand?.profileImage
          }} />
        )}
        
        {/* Social Validation Tile */}
        <SocialValidationTile />
        
        {/* Article Grid - exclude hero article */}
        <ArticleGrid
          articles={articles.filter((a: any) => !a.hero)}
          siteId={siteId || undefined}
          title="Latest Health Breakthroughs"
          showFeatured={true}
        />
        
        {/* Newsletter Signup */}
        <NewsletterSignup />
      </div>
    </SiteLayout>
  );
}