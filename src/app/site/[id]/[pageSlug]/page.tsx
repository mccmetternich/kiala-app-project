'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import SiteLayout from '@/components/layout/SiteLayout';
import CredibilitySidebar from '@/components/CredibilitySidebar';
import PageBuilder from '@/components/blocks/PageBuilder';
import { clientAPI } from '@/lib/api';
import { getCommunityCount } from '@/lib/format-community-count';

/**
 * Dynamic page route for custom pages
 * Handles any page slug that doesn't match hardcoded routes
 * Automatically respects site publish status (publishedOnly=true)
 */
export default function DynamicPage() {
  const params = useParams();
  const siteId = params?.id as string;
  const pageSlug = params?.pageSlug as string;

  const [siteData, setSiteData] = useState<any>(null);
  const [pageData, setPageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!siteId || !pageSlug) {
        setLoading(false);
        return;
      }

      try {
        // Fetch site data (publishedOnly=true for public pages)
        const site = await clientAPI.getSiteBySubdomain(siteId, true);

        if (!site) {
          // Site not found or not published
          setNotFound(true);
          setLoading(false);
          return;
        }

        setSiteData(site);

        // Fetch the page by slug
        const response = await fetch(`/api/pages?siteId=${site.id}&slug=${pageSlug}`);
        if (response.ok) {
          const pages = await response.json();
          if (pages.length > 0 && pages[0].published) {
            setPageData(pages[0]);
          } else {
            // Page not found or not published
            setNotFound(true);
          }
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error('Error loading page:', error);
        setNotFound(true);
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

  // Site or page not found - show 404
  if (notFound || !siteData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Page Not Found</h1>
          <p className="text-gray-600 mb-6">
            This page doesn't exist or is currently unavailable.
          </p>
          <a
            href={`/site/${siteId}`}
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Go to Homepage
          </a>
        </div>
      </div>
    );
  }

  // Transform site data
  const transformedSite = {
    ...siteData,
    brand: typeof siteData.brand_profile === 'string'
      ? JSON.parse(siteData.brand_profile)
      : siteData.brand_profile,
    settings: typeof siteData.settings === 'string'
      ? JSON.parse(siteData.settings)
      : siteData.settings
  };

  return (
    <SiteLayout
      site={transformedSite}
      showSidebar={true}
      pageSlug={`/${pageSlug}`}
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
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{pageData?.title}</h1>
        </div>

        {/* Page Content - using PageBuilder for block-based content */}
        {pageData?.widget_config ? (
          <PageBuilder
            pageId={pageData.id}
            siteId={siteData.id}
            pageType="custom"
            isEditing={false}
          />
        ) : (
          // Fallback to raw content if no widget config
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: pageData?.content || '' }}
          />
        )}
      </div>
    </SiteLayout>
  );
}
