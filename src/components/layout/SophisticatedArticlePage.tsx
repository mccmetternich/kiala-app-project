'use client';

import { Site, Page } from '@/types';
import SiteLayout from '@/components/layout/SiteLayout';
import { Calendar, Clock, Eye, Share2, ArrowLeft, Sparkles } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import TrackedLink from '@/components/TrackedLink';

interface SophisticatedArticlePageProps {
  site: Site;
  articlePage: Page;
  views?: number;
  readTime?: number;
  heroImage?: string;
}

export default function SophisticatedArticlePage({
  site,
  articlePage,
  views,
  readTime,
  heroImage
}: SophisticatedArticlePageProps) {
  const brand = site?.brand || {};
  
  // Parse article content if it's a string
  const articleContent = typeof articlePage.content === 'string' 
    ? JSON.parse(articlePage.content) 
    : articlePage.content;

  return (
    <SiteLayout
      site={site}
      showSidebar={false}
      isArticle={true}
      fullWidth={true}
    >
      <article className="min-h-screen bg-white">
        {/* Hero Section with sophisticated styling */}
        <header className="relative py-16 lg:py-24 bg-gradient-to-br from-secondary-50 via-white to-secondary-100 overflow-hidden">
          {/* Subtle pattern overlay */}
          <div 
            className="absolute inset-0 opacity-30" 
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f7f3f0' fill-opacity='0.4'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zM0 30c0-11.046 8.954-20 20-20'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}
          ></div>

          <div className="relative container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Breadcrumb Navigation */}
              <nav className="mb-8">
                <TrackedLink 
                  href={`/site/${site.subdomain}/articles`}
                  className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-accent-700 transition-colors"
                  widgetType="breadcrumb"
                  widgetName="back-to-articles"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Wellness Journal</span>
                </TrackedLink>
              </nav>

              {/* Article Category & Meta */}
              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  {articleContent?.category && (
                    <span className="inline-flex items-center gap-2 bg-accent-100 text-accent-800 px-3 py-1.5 rounded-full font-medium tracking-wide">
                      <Sparkles className="w-3.5 h-3.5" />
                      {articleContent.category}
                    </span>
                  )}
                  <div className="flex items-center gap-4 text-gray-600">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {readTime || 8} min read
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Eye className="w-4 h-4" />
                      {views?.toLocaleString() || '2,847'} views
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {formatDate(articlePage.publishedAt || new Date())}
                    </span>
                  </div>
                </div>

                {/* Article Title - Goop-style typography */}
                <h1 className="goop-heading text-3xl sm:text-4xl lg:text-6xl leading-tight max-w-4xl">
                  {articlePage.title}
                </h1>

                {/* Article Excerpt/Subtitle */}
                {articleContent?.excerpt && (
                  <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-3xl">
                    {articleContent.excerpt}
                  </p>
                )}

                {/* Author Attribution */}
                <div className="flex items-center gap-4 pt-6 border-t border-secondary-200">
                  {brand.aboutImage && (
                    <img
                      src={brand.aboutImage}
                      alt={brand.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-accent-200"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{brand.name || 'Wellness Authority'}</p>
                    <p className="text-sm text-gray-600">{brand.tagline || 'Evidence-Based Wellness'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Image Section */}
        {heroImage && (
          <section className="relative">
            <div className="aspect-[16/9] lg:aspect-[21/9] overflow-hidden">
              <img
                src={heroImage}
                alt={articlePage.title}
                className="w-full h-full object-cover"
              />
            </div>
          </section>
        )}

        {/* Article Content - Sophisticated Typography */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              
              {/* Article Body with sophisticated typography */}
              <div className="prose prose-lg prose-stone max-w-none">
                <div 
                  className="sophisticated-content"
                  dangerouslySetInnerHTML={{ 
                    __html: articleContent?.content || articlePage.content || 'Article content loading...' 
                  }} 
                />
              </div>

              {/* Article Footer */}
              <footer className="mt-16 pt-12 border-t border-secondary-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div className="text-sm text-gray-600">
                    <p>Published by <span className="font-medium text-gray-900">{brand.name}</span></p>
                    <p>© 2024 {brand.name}. Evidence-based wellness content.</p>
                  </div>
                  
                  <TrackedLink
                    href={`/site/${site.subdomain}/articles`}
                    className="goop-button-secondary inline-flex items-center gap-2"
                    widgetType="article-footer"
                    widgetName="more-articles"
                  >
                    <span>More Articles</span>
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </TrackedLink>
                </div>
              </footer>

            </div>
          </div>
        </section>

      </article>
    </SiteLayout>
  );
}