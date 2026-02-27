'use client';

import { useEffect, useState } from 'react';
import { Site, Page } from '@/types';
import SiteLayout from '@/components/layout/SiteLayout';
import { Calendar, Clock, Eye, Share2, ArrowLeft, Sparkles, ArrowUp } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import TrackedLink from '@/components/TrackedLink';

interface SophisticatedArticlePageProps {
  site: Site;
  articlePage: Page;
  views?: number;
  readTime?: number;
  heroImage?: string;
  article?: any; // Add article for direct access to category, excerpt etc.
}

export default function SophisticatedArticlePage({
  site,
  articlePage,
  views,
  readTime,
  heroImage,
  article
}: SophisticatedArticlePageProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  
  // Scroll progress tracking and back to top visibility
  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollPx = document.documentElement.scrollTop;
      const winHeightPx = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (scrollPx / winHeightPx) * 100;
      setScrollProgress(scrolled);
      setShowBackToTop(scrollPx > 300);
    };

    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    return () => window.removeEventListener('scroll', updateScrollProgress);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  console.log('🎨 SophisticatedArticlePage RENDERING:', {
    siteName: site?.name,
    siteSubdomain: site?.subdomain,
    articleTitle: articlePage?.title,
    brandName: site?.brand?.name,
    articlePageContent: typeof articlePage?.content,
    articleContentPreview: typeof article?.content === 'string' ? article.content.substring(0, 100) : 'non-string or missing',
    rawArticle: !!article
  });
  
  const brand = site?.brand || {};
  
  // Parse article content - prioritize raw article content over page content
  const articleContent = (() => {
    // First, try to use the raw article content (most reliable)
    if (article?.content && typeof article.content === 'string' && article.content.length > 0) {
      console.log('✅ Using raw article content:', article.content.substring(0, 100));
      return { content: article.content };
    }
    
    // Then try articlePage.content
    if (typeof articlePage.content === 'string') {
      // Try to parse as JSON first (for JSON content objects)
      try {
        const parsed = JSON.parse(articlePage.content);
        console.log('✅ Using parsed JSON content:', parsed);
        return parsed;
      } catch {
        // If JSON parsing fails, treat as raw HTML content
        console.log('✅ Using raw page content as string');
        return { content: articlePage.content };
      }
    }
    
    console.log('❌ No content found, returning fallback');
    return { content: 'Article content not available' };
  })();

  // Extract hero image from widget config
  const extractedHeroImage = (() => {
    try {
      // First check if heroImage prop was passed
      if (heroImage) return heroImage;
      
      // Then try to get from article widget_config
      if (article?.widget_config && Array.isArray(article.widget_config)) {
        const heroWidget = article.widget_config.find((w: any) => 
          w && w.type === 'hero-story' && w.enabled && w.config?.image
        );
        if (heroWidget?.config?.image) {
          return heroWidget.config.image;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error extracting hero image:', error);
      return null;
    }
  })();

  return (
    <SiteLayout
      site={site}
      showSidebar={false}
      isArticle={true}
      fullWidth={true}
    >
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-secondary-200 z-50">
        <div 
          className="h-full bg-gradient-to-r from-accent-500 to-primary-500 transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
      
      <article className="min-h-screen bg-secondary-50">
        {/* Hero Section with sophisticated styling */}
        <header className="relative py-16 lg:py-24 sophisticated-gradient overflow-hidden border-b border-secondary-300 shadow-sm">
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
                  {(article?.category || articleContent?.category) && (
                    <span className="inline-flex items-center gap-2 bg-accent-100 text-accent-800 px-3 py-1.5 rounded-full font-medium tracking-wide">
                      <Sparkles className="w-3.5 h-3.5" />
                      {article?.category || articleContent?.category}
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
                {(article?.excerpt || articleContent?.excerpt) && (
                  <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-3xl">
                    {article?.excerpt || articleContent?.excerpt}
                  </p>
                )}

                {/* Author Attribution */}
                <div className="flex items-center gap-4 pt-4 border-t border-secondary-300 mt-6">
                  {brand.aboutImage && (
                    <img
                      src={brand.aboutImage}
                      alt={brand.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-accent-300 shadow-sm"
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

        {/* Hero Image Section - Enhanced with overlay and better aspect ratio */}
        {extractedHeroImage && (
          <section className="relative">
            <div className="aspect-[16/9] lg:aspect-[21/9] overflow-hidden relative">
              <img
                src={extractedHeroImage}
                alt={articlePage.title}
                className="w-full h-full object-cover"
              />
              {/* Subtle overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10"></div>
            </div>
          </section>
        )}

        {/* Article Content - Sophisticated Typography */}
        <section className="pt-6 pb-16 lg:pt-8 lg:pb-24 bg-gradient-to-b from-white via-secondary-50/20 to-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              
              {/* Article Body with sophisticated typography and enhanced widgets */}
              <div className="prose prose-lg prose-stone max-w-none">
                <div 
                  className="sophisticated-content sophisticated-widgets space-y-8"
                  dangerouslySetInnerHTML={{ 
                    __html: articleContent?.content || articlePage.content || 'Article content loading...' 
                  }} 
                />
              </div>

              {/* Article Footer */}
              <footer className="mt-16 pt-12 border-t border-secondary-200/60 bg-gradient-to-br from-secondary-50/30 via-white to-secondary-50/20 rounded-lg p-8 -mx-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div className="text-sm text-gray-600">
                    <p>Published by <span className="font-medium text-gray-900">{brand.name}</span></p>
                    <p>© 2024 {brand.name}. Evidence-based wellness content.</p>
                  </div>
                  
                  <TrackedLink
                    href={`/site/${site.subdomain}/articles`}
                    className="goop-button-secondary inline-flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-300"
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

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-40 bg-gradient-to-r from-accent-500 to-primary-500 hover:from-accent-600 hover:to-primary-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
          aria-label="Back to top"
        >
          <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform duration-200" />
        </button>
      )}
    </SiteLayout>
  );
}