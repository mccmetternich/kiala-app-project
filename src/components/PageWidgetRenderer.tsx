'use client';

import { Widget, WidgetType } from '@/types';
import HeroStory from '@/widgets/HeroStory';
import ArticleGrid from '@/widgets/ArticleGrid';
import SocialValidationTile from '@/widgets/SocialValidationTile';
import NewsletterSignup from '@/widgets/NewsletterSignup';
import EmailCapture from '@/widgets/EmailCapture';
import FAQAccordion from '@/widgets/FAQAccordion';
import TestimonialCarousel from '@/widgets/TestimonialCarousel';
import { Gift, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface PageWidgetRendererProps {
  widgets: Widget[];
  siteId?: string;
  siteData?: any;
  articles?: any[];
  heroArticle?: any;
  pageContext?: {
    pageType: string;
    subdomain?: string;
  };
}

/**
 * Renders a list of widgets for a page.
 * This component maps widget types to their respective React components.
 */
export default function PageWidgetRenderer({
  widgets,
  siteId,
  siteData,
  articles = [],
  heroArticle,
  pageContext,
}: PageWidgetRendererProps) {
  // Filter to enabled widgets and sort by position
  const enabledWidgets = widgets
    .filter(w => w.enabled)
    .sort((a, b) => a.position - b.position);

  if (enabledWidgets.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8">
      {enabledWidgets.map((widget) => (
        <WidgetComponent
          key={widget.id}
          widget={widget}
          siteId={siteId}
          siteData={siteData}
          articles={articles}
          heroArticle={heroArticle}
          pageContext={pageContext}
        />
      ))}
    </div>
  );
}

interface WidgetComponentProps {
  widget: Widget;
  siteId?: string;
  siteData?: any;
  articles?: any[];
  heroArticle?: any;
  pageContext?: {
    pageType: string;
    subdomain?: string;
  };
}

function WidgetComponent({
  widget,
  siteId,
  siteData,
  articles = [],
  heroArticle,
  pageContext,
}: WidgetComponentProps) {
  const config = widget.config || {};
  const brand = siteData?.brand || siteData?.brand_profile || {};
  const settings = siteData?.settings || {};
  const subdomain = pageContext?.subdomain || siteId;

  switch (widget.type) {
    case 'hero-story':
      // Use hero article if available and useHeroArticle flag is set
      if (config.useHeroArticle && heroArticle) {
        return (
          <HeroStory
            config={{
              headline: heroArticle.title,
              subheading: heroArticle.excerpt,
              image: heroArticle.image,
              buttonText: config.buttonText || 'Read My Breakthrough Story',
              buttonUrl: `/site/${subdomain}/articles/${heroArticle.slug}`,
              rating: '4.9',
              views: heroArticle.views,
              readTime: heroArticle.read_time,
              author: brand?.name || config.author,
              authorImage: brand?.authorImage || brand?.sidebarImage || brand?.profileImage,
            }}
          />
        );
      }
      return (
        <HeroStory
          config={{
            headline: config.headline,
            subheading: config.subheading,
            image: config.image,
            buttonText: config.buttonText,
            buttonUrl: config.buttonUrl,
            author: brand?.name || config.author,
            authorImage: brand?.authorImage || brand?.sidebarImage || brand?.profileImage,
          }}
        />
      );

    case 'social-validation-tile':
      return <SocialValidationTile />;

    case 'article-grid':
      const filteredArticles = config.excludeHero
        ? articles.filter((a: any) => !a.hero)
        : articles;
      return (
        <ArticleGrid
          articles={filteredArticles.slice(0, config.limit || 6)}
          siteId={subdomain}
          title={config.title || 'Latest Articles'}
          showFeatured={config.showFeatured}
        />
      );

    case 'email-capture':
      if (config.style === 'newsletter') {
        return <NewsletterSignup />;
      }
      return (
        <EmailCapture
          headline={config.headline}
          subheading={config.subheading}
          buttonText={config.buttonText}
          siteId={siteId || ''}
        />
      );

    case 'profile-hero':
      return (
        <ProfileHeroWidget
          config={config}
          brand={brand}
          settings={settings}
        />
      );

    case 'bio-section':
      return (
        <BioSectionWidget
          config={config}
          brand={brand}
        />
      );

    case 'lead-magnet-form':
      return (
        <LeadMagnetFormWidget
          config={config}
          brand={brand}
          settings={settings}
          siteId={siteId}
        />
      );

    case 'articles-header':
      return (
        <ArticlesHeaderWidget
          config={config}
          settings={settings}
        />
      );

    case 'text-block':
      return (
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: config.content || '' }}
        />
      );

    case 'top-picks-grid':
      return (
        <TopPicksGridWidget
          config={config}
          siteId={siteId}
        />
      );

    case 'success-stories-grid':
      return (
        <SuccessStoriesGridWidget
          config={config}
          siteId={siteId}
        />
      );

    case 'faq':
    case 'faq-accordion':
      return (
        <FAQAccordion
          faqs={config.items || config.faqs}
          headline={config.headline}
          subheading={config.subheading}
        />
      );

    case 'testimonial':
      return (
        <TestimonialCarousel
          testimonials={config.testimonials || []}
        />
      );

    default:
      // Fallback for unknown widget types
      return (
        <div className="bg-gray-100 rounded-lg p-6 text-center text-gray-500">
          <p>Unknown widget type: {widget.type}</p>
        </div>
      );
  }
}

// Sub-components for page-specific widgets

function ProfileHeroWidget({ config, brand, settings }: any) {
  return (
    <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 rounded-3xl overflow-hidden shadow-xl border border-gray-100">
      <div className="grid md:grid-cols-2 gap-0">
        {/* Left: Large Profile Image */}
        <div className="relative h-80 md:h-auto md:min-h-[500px]">
          <img
            src={config.image || brand.aboutImage || brand.sidebarImage || brand.profileImage}
            alt={config.name || brand.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white/20 md:to-purple-50/80" />
        </div>

        {/* Right: Content */}
        <div className="p-8 lg:p-12 flex flex-col justify-center">
          <div className="mb-6">
            <p className="text-purple-600 font-semibold text-sm uppercase tracking-wide mb-2">About</p>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
              Meet {config.name || brand.name}
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              {config.tagline || brand.tagline}
            </p>
          </div>

          {/* Credentials */}
          {config.credentials && (
            <div className="flex flex-wrap gap-2 mb-6">
              {config.credentials.map((cred: string, idx: number) => (
                <span key={idx} className="inline-flex items-center gap-1.5 bg-white/80 backdrop-blur px-3 py-1.5 rounded-full text-sm text-gray-700 border border-gray-200">
                  {cred}
                </span>
              ))}
            </div>
          )}

          {/* Quote */}
          <blockquote className="relative mb-8">
            <div className="absolute -top-2 -left-2 text-5xl text-purple-200 font-serif">"</div>
            <p className="text-lg text-gray-700 italic leading-relaxed pl-6">
              {config.quote || brand.quote}
            </p>
          </blockquote>
        </div>
      </div>
    </div>
  );
}

function BioSectionWidget({ config, brand }: any) {
  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{config.headline || 'My Story'}</h2>
      <div className="prose prose-lg max-w-none">
        <p className="text-gray-700 leading-relaxed mb-6">
          {config.bio || brand.bio}
        </p>
        {config.quote && (
          <blockquote className="border-l-4 border-primary-500 pl-6 italic text-lg text-gray-800 my-8">
            "{config.quote}"
          </blockquote>
        )}
        {config.showExtendedStory && (
          <>
            <p className="text-gray-700 leading-relaxed mb-6">
              My journey began when I realized that conventional approaches
              weren't addressing the root causes of women's health challenges. Through years of
              research and practice, I've developed protocols that combine the best of
              evidence-based medicine with natural healing approaches.
            </p>
            <p className="text-gray-700 leading-relaxed mb-6">
              After helping thousands of women in my clinical practice, I noticed a pattern: most women over 40 were struggling with the same issues - stubborn weight gain, fatigue, brain fog, and hormonal imbalances that no one seemed to take seriously.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Today, I'm on a mission to share these evidence-based protocols with women everywhere. You don't have to accept feeling tired and frustrated as "just part of getting older."
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function LeadMagnetFormWidget({ config, brand, settings, siteId }: any) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      const response = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          siteId,
          source: 'lead_magnet_form',
          pageUrl: typeof window !== 'undefined' ? window.location.pathname : '',
        }),
      });

      if (response.ok) {
        setStatus('success');
        setMessage('Check your email for your free guide!');
        // Auto-download PDF if available
        if (settings?.leadMagnetPdfUrl) {
          window.open(settings.leadMagnetPdfUrl, '_blank');
        }
      } else {
        setStatus('error');
        setMessage('Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-gradient-to-br from-primary-50 to-purple-50 rounded-2xl p-8 border border-primary-100 shadow-lg">
        <div className="max-w-2xl mx-auto text-center py-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Your Guide is Ready!</h3>
          <p className="text-gray-600 mb-6">{message}</p>
          {settings?.leadMagnetPdfUrl && (
            <a
              href={settings.leadMagnetPdfUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full font-semibold transition-colors"
            >
              <Gift className="w-5 h-5" />
              <span>Download Your Free Guide</span>
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-primary-50 to-purple-50 rounded-2xl p-8 border border-primary-100 shadow-lg">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Gift className="w-4 h-4" />
            Free Instant Download
          </div>
          <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
            {config.headline || 'Get Your Free Guide'}
          </h3>
          <p className="text-gray-700 leading-relaxed">
            {config.subheading || `Get instant access to ${brand?.name || "Dr. Amy"}'s most popular health guide - absolutely free.`}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
            className="flex-1 px-4 py-3 rounded-full border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-full font-semibold transition-colors disabled:opacity-50"
          >
            {status === 'loading' ? 'Sending...' : config.buttonText || 'Get Instant Access'}
          </button>
        </form>

        {status === 'error' && (
          <p className="text-red-600 text-sm mt-3 text-center">{message}</p>
        )}
      </div>
    </div>
  );
}

function ArticlesHeaderWidget({ config, settings }: any) {
  const communityCount = settings?.communityCount || 50000;

  return (
    <div className="text-center mb-8">
      <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
        {config.headline || 'Health Articles'}
      </h1>
      <p className="text-lg text-gray-600 mb-4">{config.subheading}</p>
      {config.showCommunityCount && (
        <p className="text-sm text-gray-500">
          Join {communityCount.toLocaleString()}+ women on their wellness journey
        </p>
      )}
    </div>
  );
}

function TopPicksGridWidget({ config, siteId }: any) {
  // This would typically fetch top picks from an API
  // For now, return a placeholder
  return (
    <div className="bg-gray-50 rounded-xl p-8 text-center">
      <p className="text-gray-500">Top picks will be loaded here based on your product recommendations.</p>
    </div>
  );
}

function SuccessStoriesGridWidget({ config, siteId }: any) {
  // This would typically fetch success stories from an API
  // For now, return a placeholder
  return (
    <div className="bg-gray-50 rounded-xl p-8 text-center">
      <p className="text-gray-500">Success stories will be loaded here based on your testimonials.</p>
    </div>
  );
}
