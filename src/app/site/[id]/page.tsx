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
        // Fetch site data by subdomain (the ID in URL is actually the subdomain)
        const response = await fetch(`/api/sites?subdomain=${siteId}`);

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
            setSiteData(fallbackSite);
          }
        } else {
          // Use fallback site
          setSiteData(fallbackSite);
        }
      } catch {
        setSiteData(fallbackSite);
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

  return (
    <SiteLayout
      site={transformedSite}
      showSidebar={true}
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