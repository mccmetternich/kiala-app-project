'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { notFound } from 'next/navigation';
import SiteLayout from '@/components/layout/SiteLayout';
import CredibilitySidebar from '@/components/CredibilitySidebar';
import PageWidgetRenderer from '@/components/PageWidgetRenderer';
import { Site, Page, PageType } from '@/types';
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

export default function DynamicPage() {
  const params = useParams();
  const siteId = params?.id as string;
  const pageSlug = params?.pageSlug as string;

  const [siteData, setSiteData] = useState<any>(null);
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!siteId || !pageSlug) return;

      try {
        // Fetch site data by subdomain
        const siteResponse = await fetch(`/api/sites?subdomain=${siteId}&publishedOnly=true`);
        if (siteResponse.ok) {
          const siteData = await siteResponse.json();
          const site = siteData.site;
          if (site) {
            setSiteData(site);

            // Fetch page data for this site and slug
            const pageResponse = await fetch(`/api/pages?siteId=${site.id}`);
            if (pageResponse.ok) {
              const pagesData = await pageResponse.json();
              const foundPage = pagesData.find((p: any) => p.slug === pageSlug);
              if (foundPage && foundPage.published) {
                setPage(foundPage);
              } else {
                // Page not found or not published
                setPage(null);
              }
            }
          } else {
            setSiteData(null);
          }
        } else {
          setSiteData(null);
        }
      } catch (error) {
        console.error('Error loading page:', error);
        setSiteData(null);
        setPage(null);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [siteId, pageSlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading page...</p>
        </div>
      </div>
    );
  }

  // Site not found or not published
  if (!siteData) {
    notFound();
  }

  // Page not found or not published
  if (!page) {
    notFound();
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

  // Parse page content
  const pageContent = typeof page.content === 'string' 
    ? JSON.parse(page.content) 
    : page.content;

  // Determine page type based on slug
  const getPageType = (slug: string): PageType => {
    if (slug === 'index') return 'homepage';
    if (slug === 'about') return 'about';
    if (slug === 'top-picks') return 'top-picks';
    if (slug === 'success-stories') return 'success-stories';
    if (slug === 'contact') return 'contact';
    return 'about'; // fallback for custom pages
  };

  // Create page object for rendering
  const pageData: Page = {
    id: page.id,
    slug: page.slug,
    title: page.title,
    type: getPageType(page.slug),
    content: pageContent,
    seo: {
      title: `${page.title} | ${transformedSite.name}`,
      description: `${page.title} page for ${transformedSite.name}`,
      keywords: [page.title.toLowerCase()]
    },
    published: true,
    publishedAt: new Date(page.created_at)
  };

  return (
    <SiteLayout
      site={transformedSite}
      showSidebar={true}
      pageSlug={pageSlug}
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
      <div className="space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{page.title}</h1>
        </div>

        <PageWidgetRenderer
          page={pageData}
          site={transformedSite}
        />
      </div>
    </SiteLayout>
  );
}