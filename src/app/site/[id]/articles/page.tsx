'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import SiteLayout from '@/components/layout/SiteLayout';
import CredibilitySidebar from '@/components/CredibilitySidebar';
import ArticleGrid from '@/widgets/ArticleGrid';
import { Site } from '@/types';

// Fallback site data (same as homepage)
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

export default function DynamicArticlesPage() {
  const params = useParams();
  const siteId = params?.id as string;
  
  const [siteData, setSiteData] = useState<any>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!siteId) return;

      try {
        // Fetch site data by subdomain (same as homepage)
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
              setArticles(articlesData.articles || []);
            }
          } else {
            setSiteData(fallbackSite);
          }
        } else {
          setSiteData(fallbackSite);
        }
      } catch (error) {
        console.error('Error loading articles:', error);
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
          <p className="text-gray-600">Loading articles...</p>
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
          communityCount={47284}
          showLeadMagnet={true}
          siteId={siteId}
          audioTrackUrl={transformedSite.settings?.audioUrl || "/audio/dr-amy-welcome.mp3"}
        />
      }
    >
      <div className="space-y-8">
        {/* Header - like top-picks */}
        <div className="text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <div className="flex -space-x-1">
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=32&h=32&fit=crop&crop=face" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" alt="" />
              <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" alt="" />
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=32&h=32&fit=crop&crop=face" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" alt="" />
              <div className="w-8 h-8 bg-primary-500 text-white rounded-full border-2 border-white flex items-center justify-center text-xs font-bold">
                47k+
              </div>
            </div>
            <span className="text-gray-600 font-medium">readers worldwide</span>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-2">Latest Articles</h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Fresh insights, hot tips, and the wellness secrets women are raving about.
          </p>
          <p className="text-lg text-primary-600 font-semibold max-w-3xl mx-auto mb-6">
            Ready to feel amazing? Let's dive in! ✨
          </p>
        </div>

        {/* Articles Grid */}
        <ArticleGrid
          articles={articles}
          siteId={siteId}
          title=""
          showFeatured={false}
          showProductTile={false}
        />
      </div>
    </SiteLayout>
  );
}