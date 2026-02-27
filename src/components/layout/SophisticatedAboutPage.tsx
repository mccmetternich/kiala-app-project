'use client';

import { Site, Page } from '@/types';
import SiteLayout from '@/components/layout/SiteLayout';
import PageWidgetRenderer from '@/components/PageWidgetRenderer';

interface SophisticatedAboutPageProps {
  site: Site;
  page: any; // Database page object
  siteId: string;
}

export default function SophisticatedAboutPage({
  site,
  page,
  siteId
}: SophisticatedAboutPageProps) {
  // Parse page content
  const pageContent = typeof page.content === 'string' 
    ? JSON.parse(page.content) 
    : page.content;

  return (
    <SiteLayout
      site={site}
      showSidebar={false}
      pageSlug={page.slug}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Sophisticated Header */}
        <div className="text-center mb-12 pt-8">
          <h1 className="goop-heading text-2xl sm:text-3xl lg:text-5xl mb-6">{page.title}</h1>
          
          {/* Brand Profile Image */}
          {site.brand?.aboutImage && (
            <div className="mb-8">
              <img
                src={site.brand.aboutImage}
                alt={site.brand.name}
                className="w-32 h-32 lg:w-40 lg:h-40 rounded-full mx-auto object-cover shadow-lg border-4 border-secondary-100"
              />
            </div>
          )}

          {/* Tagline */}
          {site.brand?.tagline && (
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 font-light mb-6 max-w-2xl mx-auto">
              {site.brand.tagline}
            </p>
          )}

          {/* Quote */}
          {site.brand?.quote && (
            <blockquote className="text-base sm:text-lg lg:text-xl text-gray-700 italic mb-8 max-w-3xl mx-auto leading-relaxed">
              "{site.brand.quote}"
            </blockquote>
          )}
        </div>

        {/* Content Widgets */}
        <div className="space-y-12">
          <PageWidgetRenderer
            widgets={pageContent?.widgets || []}
            siteId={siteId}
            siteData={site}
            pageContext={{
              pageType: 'about',
              subdomain: siteId
            }}
          />
        </div>

        {/* Bio Section */}
        {site.brand?.bio && (
          <div className="mt-16 mb-12">
            <div className="elegant-card text-center">
              <div className="prose prose-lg mx-auto">
                <p className="text-gray-700 leading-relaxed text-lg">
                  {site.brand.bio}
                </p>
              </div>
              
              {/* Credentials */}
              {site.brand?.credentials && site.brand.credentials.length > 0 && (
                <div className="flex flex-wrap justify-center gap-3 mt-8">
                  {site.brand.credentials.map((credential, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-secondary-100 text-primary-700 rounded-full text-sm font-medium"
                    >
                      {credential}
                    </span>
                  ))}
                </div>
              )}
              
              {/* Years Experience */}
              {site.brand?.yearsExperience && (
                <div className="mt-6 text-center">
                  <span className="text-3xl font-bold text-primary-600">
                    {site.brand.yearsExperience}+
                  </span>
                  <p className="text-gray-600 mt-1">Years of Experience</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}