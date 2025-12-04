/**
 * Default Widget Configuration Generator for Pages
 *
 * This module generates default widget configurations for different page types.
 * These are stored in the widget_config column and rendered dynamically.
 */

import { Widget, WidgetType } from '@/types';

export type PageType = 'homepage' | 'about' | 'articles' | 'top-picks' | 'success-stories' | 'custom';

export interface PageContext {
  pageType: PageType;
  siteId: string;
  siteBrandName?: string;
  siteBrandTagline?: string;
  siteBrandBio?: string;
  siteBrandQuote?: string;
  siteBrandImage?: string;
  siteSubdomain?: string;
}

/**
 * Generate default widget configuration for a page based on its type.
 */
export function generateDefaultPageWidgets(context: PageContext): Widget[] {
  const { pageType, siteId, siteBrandName, siteSubdomain } = context;
  const brandName = siteBrandName || 'Dr. Amy';

  switch (pageType) {
    case 'homepage':
      return generateHomepageWidgets(context);
    case 'about':
      return generateAboutWidgets(context);
    case 'articles':
      return generateArticlesWidgets(context);
    case 'top-picks':
      return generateTopPicksWidgets(context);
    case 'success-stories':
      return generateSuccessStoriesWidgets(context);
    default:
      return generateCustomPageWidgets(context);
  }
}

/**
 * Homepage: Hero story, social validation, article grid, newsletter
 */
function generateHomepageWidgets(context: PageContext): Widget[] {
  const { siteSubdomain, siteBrandName } = context;

  return [
    {
      id: 'homepage-hero',
      type: 'hero-story',
      enabled: true,
      position: 1,
      config: {
        headline: 'Transform Your Health Today',
        subheading: 'Discover evidence-based approaches to wellness that actually work',
        image: 'https://images.unsplash.com/photo-1506629905270-11674e167d6f?w=600&h=400&fit=crop',
        buttonText: 'Read My Breakthrough Story',
        buttonUrl: `/site/${siteSubdomain}/articles`,
        author: siteBrandName || 'Dr. Amy',
        useHeroArticle: true, // Special flag: tells renderer to use the hero article
      }
    },
    {
      id: 'homepage-social-validation',
      type: 'social-validation-tile',
      enabled: true,
      position: 2,
      config: {
        headline: 'Join Our Community',
        showCommunityCount: true,
      }
    },
    {
      id: 'homepage-article-grid',
      type: 'article-grid',
      enabled: true,
      position: 3,
      config: {
        title: 'Latest Health Breakthroughs',
        showFeatured: true,
        excludeHero: true,
        limit: 6,
      }
    },
    {
      id: 'homepage-newsletter',
      type: 'email-capture',
      enabled: true,
      position: 4,
      config: {
        headline: 'Get Exclusive Health Tips',
        subheading: 'Join thousands of women on their wellness journey',
        buttonText: 'Subscribe Now',
        style: 'newsletter',
      }
    },
  ];
}

/**
 * About page: Profile hero, bio, lead magnet, recent articles
 */
function generateAboutWidgets(context: PageContext): Widget[] {
  const { siteBrandName, siteBrandTagline, siteBrandBio, siteBrandQuote, siteBrandImage, siteSubdomain } = context;

  return [
    {
      id: 'about-profile-hero',
      type: 'profile-hero',
      enabled: true,
      position: 1,
      config: {
        name: siteBrandName || 'Dr. Amy',
        tagline: siteBrandTagline || 'Your trusted health advisor',
        quote: siteBrandQuote || 'True wellness comes from understanding your body\'s unique needs.',
        image: siteBrandImage,
        credentials: [
          'Board Certified',
          'MS Nutrition',
          '15+ Years Experience'
        ],
        showAudioPlayer: true,
      }
    },
    {
      id: 'about-bio',
      type: 'bio-section',
      enabled: true,
      position: 2,
      config: {
        headline: 'My Story',
        bio: siteBrandBio || 'I am dedicated to helping women achieve optimal health through evidence-based approaches.',
        quote: siteBrandQuote,
        showExtendedStory: true,
      }
    },
    {
      id: 'about-lead-magnet',
      type: 'lead-magnet-form',
      enabled: true,
      position: 3,
      config: {
        headline: 'Get "The Complete Hormone Balance Guide"',
        subheading: 'Get instant access to my most popular health guide - absolutely free.',
        buttonText: 'Get Instant Access',
        showPdfDownload: true,
      }
    },
    {
      id: 'about-recent-articles',
      type: 'article-grid',
      enabled: true,
      position: 4,
      config: {
        title: 'Latest From ' + (siteBrandName || 'Dr. Amy'),
        limit: 4,
        showFeatured: false,
      }
    },
  ];
}

/**
 * Articles page: Header with community count, article grid
 */
function generateArticlesWidgets(context: PageContext): Widget[] {
  const { siteBrandName } = context;

  return [
    {
      id: 'articles-header',
      type: 'articles-header',
      enabled: true,
      position: 1,
      config: {
        headline: 'Health Articles',
        subheading: `Evidence-based insights from ${siteBrandName || 'Dr. Amy'}`,
        showCommunityCount: true,
      }
    },
    {
      id: 'articles-grid',
      type: 'article-grid',
      enabled: true,
      position: 2,
      config: {
        showFeatured: false,
        showCategories: true,
        showSearch: true,
        limit: 12,
      }
    },
  ];
}

/**
 * Top Picks page: Header, product grid
 */
function generateTopPicksWidgets(context: PageContext): Widget[] {
  const { siteBrandName } = context;

  return [
    {
      id: 'top-picks-header',
      type: 'text-block',
      enabled: true,
      position: 1,
      config: {
        content: `
          <div class="text-center mb-8">
            <h1 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">${siteBrandName || "Dr. Amy"}'s Top Picks</h1>
            <p class="text-lg text-gray-600">Products I personally recommend and trust</p>
          </div>
        `,
      }
    },
    {
      id: 'top-picks-grid',
      type: 'top-picks-grid',
      enabled: true,
      position: 2,
      config: {
        showRatings: true,
        showBadges: true,
      }
    },
    {
      id: 'top-picks-disclaimer',
      type: 'text-block',
      enabled: true,
      position: 3,
      config: {
        content: `
          <div class="bg-gray-50 rounded-xl p-6 mt-8 text-sm text-gray-600">
            <p><strong>Disclaimer:</strong> These recommendations are based on my personal research and clinical experience. Some links may be affiliate links, which help support this site at no additional cost to you.</p>
          </div>
        `,
      }
    },
  ];
}

/**
 * Success Stories page: Header, stories grid
 */
function generateSuccessStoriesWidgets(context: PageContext): Widget[] {
  const { siteBrandName } = context;

  return [
    {
      id: 'success-stories-header',
      type: 'text-block',
      enabled: true,
      position: 1,
      config: {
        content: `
          <div class="text-center mb-8">
            <h1 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">Success Stories</h1>
            <p class="text-lg text-gray-600">Real transformations from women just like you</p>
          </div>
        `,
      }
    },
    {
      id: 'success-stories-grid',
      type: 'success-stories-grid',
      enabled: true,
      position: 2,
      config: {
        showTestimonials: true,
        showBeforeAfter: true,
      }
    },
    {
      id: 'success-stories-cta',
      type: 'email-capture',
      enabled: true,
      position: 3,
      config: {
        headline: 'Ready to Start Your Transformation?',
        subheading: 'Join our community and get the support you need',
        buttonText: 'Get Started',
        style: 'prominent',
      }
    },
  ];
}

/**
 * Custom page: Basic text content
 */
function generateCustomPageWidgets(context: PageContext): Widget[] {
  return [
    {
      id: 'custom-content',
      type: 'text-block',
      enabled: true,
      position: 1,
      config: {
        content: '<p>Add your content here...</p>',
      }
    },
  ];
}

/**
 * Parse widget config from JSON string to Widget array
 */
export function parsePageWidgetConfig(widgetConfigJson: string | null): Widget[] | null {
  if (!widgetConfigJson) return null;
  try {
    const parsed = JSON.parse(widgetConfigJson);
    return Array.isArray(parsed) ? parsed : parsed.widgets || null;
  } catch (e) {
    console.error('Failed to parse page widget_config:', e);
    return null;
  }
}

/**
 * Get count of enabled widgets for a page
 */
export function getEnabledWidgetCount(widgetConfig: Widget[] | string | null): number {
  if (!widgetConfig) return 0;

  const widgets = typeof widgetConfig === 'string'
    ? parsePageWidgetConfig(widgetConfig)
    : widgetConfig;

  if (!widgets) return 0;
  return widgets.filter(w => w.enabled).length;
}

/**
 * Map page type to default widget types for display
 */
export const PAGE_TYPE_WIDGETS: Record<PageType, WidgetType[]> = {
  homepage: ['hero-story', 'social-validation-tile', 'article-grid', 'email-capture'],
  about: ['profile-hero', 'bio-section', 'lead-magnet-form', 'article-grid'],
  articles: ['articles-header', 'article-grid'],
  'top-picks': ['text-block', 'top-picks-grid', 'text-block'],
  'success-stories': ['text-block', 'success-stories-grid', 'email-capture'],
  custom: ['text-block'],
};
