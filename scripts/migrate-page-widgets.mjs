/**
 * Migration Script: Populate existing pages with default widgets
 *
 * This script:
 * 1. Fetches all sites
 * 2. For each site, creates default pages (home, about, articles, top-picks, success-stories) if they don't exist
 * 3. Populates each page's widget_config with default widgets based on page type
 *
 * Run with: node scripts/migrate-page-widgets.mjs
 */

import { createClient } from '@libsql/client';
import { nanoid } from 'nanoid';
import 'dotenv/config';

// Database connection
const db = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:local.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Page type to widget config mapping
const PAGE_WIDGET_CONFIGS = {
  homepage: (context) => [
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
        buttonUrl: `/site/${context.subdomain}/articles`,
        author: context.brandName || 'Dr. Amy',
        useHeroArticle: true,
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
  ],
  about: (context) => [
    {
      id: 'about-profile-hero',
      type: 'profile-hero',
      enabled: true,
      position: 1,
      config: {
        name: context.brandName || 'Dr. Amy',
        tagline: context.tagline || 'Your trusted health advisor',
        quote: context.quote || "True wellness comes from understanding your body's unique needs.",
        image: context.profileImage,
        credentials: ['Board Certified', 'MS Nutrition', '15+ Years Experience'],
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
        bio: context.bio || 'I am dedicated to helping women achieve optimal health through evidence-based approaches.',
        quote: context.quote,
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
        subheading: "Get instant access to my most popular health guide - absolutely free.",
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
        title: `Latest From ${context.brandName || 'Dr. Amy'}`,
        limit: 4,
        showFeatured: false,
      }
    },
  ],
  articles: (context) => [
    {
      id: 'articles-header',
      type: 'articles-header',
      enabled: true,
      position: 1,
      config: {
        headline: 'Health Articles',
        subheading: `Evidence-based insights from ${context.brandName || 'Dr. Amy'}`,
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
  ],
  'top-picks': (context) => [
    {
      id: 'top-picks-header',
      type: 'text-block',
      enabled: true,
      position: 1,
      config: {
        content: `
          <div class="text-center mb-8">
            <h1 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">${context.brandName || "Dr. Amy"}'s Top Picks</h1>
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
  ],
  'success-stories': (context) => [
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
  ],
};

// Default page definitions
const DEFAULT_PAGES = [
  { type: 'homepage', slug: '/', title: 'Home' },
  { type: 'about', slug: '/about', title: 'About' },
  { type: 'articles', slug: '/articles', title: 'Articles' },
  { type: 'top-picks', slug: '/top-picks', title: 'Top Picks' },
  { type: 'success-stories', slug: '/success-stories', title: 'Success Stories' },
];

async function queryAll(sql, args = []) {
  const result = await db.execute({ sql, args });
  return result.rows;
}

async function execute(sql, args = []) {
  return await db.execute({ sql, args });
}

async function migratePageWidgets() {
  console.log('🚀 Starting page widget migration...\n');

  // Add widget_config column if it doesn't exist
  try {
    await execute('ALTER TABLE pages ADD COLUMN widget_config TEXT');
    console.log('✅ Added widget_config column to pages table');
  } catch (e) {
    console.log('ℹ️  widget_config column already exists');
  }

  // Get all sites
  const sites = await queryAll('SELECT * FROM sites');
  console.log(`\n📦 Found ${sites.length} sites to process\n`);

  for (const site of sites) {
    console.log(`\n🌐 Processing site: ${site.name} (${site.subdomain})`);

    // Parse brand profile
    let brandProfile = {};
    try {
      brandProfile = typeof site.brand_profile === 'string'
        ? JSON.parse(site.brand_profile)
        : site.brand_profile || {};
    } catch (e) {
      console.log('  ⚠️  Could not parse brand_profile');
    }

    const context = {
      siteId: site.id,
      subdomain: site.subdomain,
      brandName: brandProfile.name || site.name,
      tagline: brandProfile.tagline,
      bio: brandProfile.bio,
      quote: brandProfile.quote,
      profileImage: brandProfile.aboutImage || brandProfile.sidebarImage || brandProfile.profileImage,
    };

    // Get existing pages for this site
    const existingPages = await queryAll(
      'SELECT * FROM pages WHERE site_id = ?',
      [site.id]
    );
    const existingSlugs = new Set(existingPages.map(p => p.slug));

    // Create or update pages
    for (const pageDef of DEFAULT_PAGES) {
      const widgetConfigGenerator = PAGE_WIDGET_CONFIGS[pageDef.type];
      if (!widgetConfigGenerator) {
        console.log(`  ⚠️  No widget config for page type: ${pageDef.type}`);
        continue;
      }

      const widgetConfig = widgetConfigGenerator(context);
      const widgetConfigStr = JSON.stringify(widgetConfig);

      if (existingSlugs.has(pageDef.slug)) {
        // Update existing page
        const existingPage = existingPages.find(p => p.slug === pageDef.slug);
        if (existingPage && !existingPage.widget_config) {
          await execute(
            'UPDATE pages SET widget_config = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [widgetConfigStr, existingPage.id]
          );
          console.log(`  ✅ Updated ${pageDef.title} page with ${widgetConfig.length} widgets`);
        } else if (existingPage?.widget_config) {
          console.log(`  ℹ️  ${pageDef.title} page already has widget config`);
        }
      } else {
        // Create new page
        const pageId = nanoid();
        await execute(
          `INSERT INTO pages (id, site_id, title, slug, content, template, widget_config, published)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [pageId, site.id, pageDef.title, pageDef.slug, '', pageDef.type, widgetConfigStr, 1]
        );
        console.log(`  ✅ Created ${pageDef.title} page with ${widgetConfig.length} widgets`);
      }
    }
  }

  console.log('\n\n🎉 Migration complete!');
  console.log('\nSummary:');
  const totalPages = await queryAll('SELECT COUNT(*) as count FROM pages WHERE widget_config IS NOT NULL');
  console.log(`  - Pages with widget configs: ${totalPages[0]?.count || 0}`);

  process.exit(0);
}

// Run migration
migratePageWidgets().catch((error) => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});
