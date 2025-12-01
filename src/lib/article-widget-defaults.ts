/**
 * Default Widget Configuration Generator for Articles
 *
 * This module generates rich default widget configurations for articles.
 * These can be customized per-article and stored in the widget_config column.
 */

import { Widget } from '@/types';

export interface ArticleContext {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image: string;
  siteId: string;
  siteBrandName?: string;
}

/**
 * Generate a complete default widget configuration for an article.
 * This creates a rich, conversion-optimized article layout with all widgets.
 */
export function generateDefaultWidgetConfig(article: ArticleContext): Widget[] {
  const siteId = article.siteId;
  const brandName = article.siteBrandName || 'Dr. Amy';
  const categoryLower = article.category?.toLowerCase() || 'health';

  return [
    // Hero image is now rendered directly from article.image in ArticleTemplate
    // No longer needs to be a widget

    // 1. Opening hook with warning
    {
      id: 'opening-hook',
      type: 'text-block',
      enabled: true,
      position: 1,
      config: {
        content: `
          <p class="text-xl text-gray-700 leading-relaxed mb-6 font-medium">${article.excerpt}</p>
          <div class="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg mb-6">
            <p class="text-amber-800 font-medium">⚠️ Warning: What you're about to discover could change everything you thought you knew about ${categoryLower}...</p>
          </div>
        `
      }
    },

    // 2. Before/After Comparison
    {
      id: 'before-after-widget',
      type: 'before-after',
      enabled: true,
      position: 2,
      config: {
        headline: 'Real Results From Real Women',
        name: 'Sarah M.',
        age: '47',
        location: 'Denver, CO',
        beforeImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
        afterImage: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop',
        beforeStats: [
          { label: 'Energy Level', value: '3/10' },
          { label: 'Weight', value: '167 lbs' },
          { label: 'Sleep Quality', value: 'Poor' },
          { label: 'Mood', value: 'Low' }
        ],
        afterStats: [
          { label: 'Energy Level', value: '9/10' },
          { label: 'Weight', value: '142 lbs' },
          { label: 'Sleep Quality', value: 'Excellent' },
          { label: 'Mood', value: 'Vibrant' }
        ],
        testimonial: `I never thought I could feel this good again. Within 6 weeks of following ${brandName}'s protocol, I lost 25 lbs and my energy is through the roof!`,
        timeframe: '6 weeks',
        style: 'detailed'
      }
    },

    // 3. Before/After Side by Side
    {
      id: 'before-after-side-by-side-widget',
      type: 'before-after-side-by-side',
      enabled: true,
      position: 3,
      config: {
        headline: "Michelle's Incredible Transformation",
        name: 'Michelle R.',
        age: '52',
        location: 'Seattle, WA',
        beforeImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
        afterImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
        beforeStats: [
          { label: 'Energy', value: '2/10' },
          { label: 'Sleep', value: 'Poor' },
          { label: 'Weight', value: '+18 lbs' },
          { label: 'Mood', value: 'Struggling' }
        ],
        afterStats: [
          { label: 'Energy', value: '9/10' },
          { label: 'Sleep', value: 'Amazing' },
          { label: 'Weight', value: '-22 lbs' },
          { label: 'Mood', value: 'Thriving' }
        ],
        testimonial: 'I went from exhausted and frustrated to feeling like my 30-year-old self again. This program is life-changing!',
        timeframe: '8 weeks',
        style: 'cards'
      }
    },

    // 4. Data Overview
    {
      id: 'data-overview-widget',
      type: 'data-overview',
      enabled: true,
      position: 4,
      config: {
        headline: 'The Hormone Crisis By The Numbers',
        subheading: 'Why millions of women are struggling with their health',
        stats: [
          { value: '80%', label: 'of women over 35 have hormonal imbalances', icon: 'users' },
          { value: '47M', label: 'women currently in perimenopause', icon: 'trending-up' },
          { value: '93%', label: 'see improvement with proper protocol', icon: 'check-circle' },
          { value: '6 weeks', label: 'average time to see results', icon: 'clock' }
        ],
        source: 'Journal of Clinical Endocrinology, 2023',
        style: 'grid'
      }
    },

    // 5. Main Article Content
    {
      id: 'main-content',
      type: 'text-block',
      enabled: true,
      position: 5,
      config: {
        content: `
          <div class="prose prose-lg max-w-none">
            ${article.content?.replace(/^#.*\n/, '') || ''}

            <h2>The Science Behind Hormonal Balance</h2>
            <p>Research published in the <em>Journal of Clinical Endocrinology</em> shows that certain foods can directly influence your hormone levels. When you understand how these foods work, you can take control of your health naturally.</p>

            <p>The key is consistency and choosing the right combination of nutrients that support your body's natural hormone production. This isn't about restrictive dieting—it's about nourishing your body with what it needs to thrive.</p>
          </div>
        `
      }
    },

    // 7. Symptoms Checker
    {
      id: 'symptoms-checker-widget',
      type: 'symptoms-checker',
      enabled: true,
      position: 7,
      config: {
        headline: 'Could Your Hormones Be Out of Balance?',
        subheading: "Check the symptoms you're experiencing:",
        symptoms: [
          { id: 's1', label: "Fatigue that doesn't improve with rest", category: 'Energy' },
          { id: 's2', label: 'Unexplained weight gain, especially around the middle', category: 'Weight' },
          { id: 's3', label: 'Difficulty falling or staying asleep', category: 'Sleep' },
          { id: 's4', label: 'Mood swings or irritability', category: 'Mood' },
          { id: 's5', label: 'Brain fog or difficulty concentrating', category: 'Mental' },
          { id: 's6', label: 'Hot flashes or night sweats', category: 'Temperature' },
          { id: 's7', label: 'Low libido', category: 'Intimacy' },
          { id: 's8', label: 'Thinning hair or skin changes', category: 'Appearance' }
        ],
        results: {
          low: { threshold: 2, message: 'Your symptoms suggest mild hormonal fluctuation. Prevention is key!', urgency: 'low' },
          medium: { threshold: 4, message: "You're showing signs of moderate hormonal imbalance. Time to take action.", urgency: 'medium' },
          high: { threshold: 6, message: 'Your symptoms indicate significant hormonal disruption. Immediate intervention recommended.', urgency: 'high' }
        },
        buttonText: 'Get Your Personalized Protocol',
        buttonUrl: `/site/${siteId}/top-picks`
      }
    },

    // 8. Timeline
    {
      id: 'timeline-widget',
      type: 'timeline',
      enabled: true,
      position: 8,
      config: {
        headline: 'Your Transformation Journey',
        subheading: 'What to expect when you start the Hormone Reset Protocol',
        events: [
          {
            week: 'Week 1-2',
            title: 'Foundation Phase',
            description: 'Your body begins to adjust. You may notice improved sleep quality and reduced cravings.',
            icon: 'seedling'
          },
          {
            week: 'Week 3-4',
            title: 'Acceleration Phase',
            description: 'Energy levels rise dramatically. Weight starts to shift. Mental clarity improves.',
            icon: 'rocket'
          },
          {
            week: 'Week 5-6',
            title: 'Transformation Phase',
            description: 'Full hormonal rebalancing occurs. Dramatic improvements in energy, mood, and body composition.',
            icon: 'star'
          },
          {
            week: 'Week 7+',
            title: 'Maintenance Phase',
            description: 'Your new hormone-healthy lifestyle becomes second nature. Results continue to compound.',
            icon: 'crown'
          }
        ],
        style: 'vertical'
      }
    },

    // 9. Mid-article testimonial
    {
      id: 'testimonial-1',
      type: 'testimonial',
      enabled: true,
      position: 9,
      config: {
        headline: 'Success Stories',
        subheading: 'Real results from real women',
        style: 'featured'
      }
    },

    // 9.5. Scrolling Photo Wall - Social Proof
    {
      id: 'scrolling-thumbnails',
      type: 'scrolling-thumbnails',
      enabled: true,
      position: 9.5,
      config: {
        headline: 'Join 47,000+ Women Transforming Their Health',
        speed: 30,
        imageHeight: 100
      }
    },

    // 10. Top Ten List
    {
      id: 'top-ten-widget',
      type: 'top-ten',
      enabled: true,
      position: 10,
      config: {
        headline: 'Top 10 Foods for Hormone Balance',
        subheading: `${brandName}'s research-backed recommendations`,
        items: [
          { rank: 1, title: 'Wild-Caught Salmon', description: 'Rich in omega-3s that reduce inflammation and support hormone production', badge: 'ESSENTIAL' },
          { rank: 2, title: 'Cruciferous Vegetables', description: 'Broccoli, cauliflower, and kale help metabolize excess estrogen', badge: 'TOP PICK' },
          { rank: 3, title: 'Avocados', description: 'Healthy fats provide building blocks for hormone synthesis' },
          { rank: 4, title: 'Flax Seeds', description: 'Lignans help balance estrogen levels naturally' },
          { rank: 5, title: 'Fermented Foods', description: 'Support gut health which is critical for hormone metabolism' },
          { rank: 6, title: 'Grass-Fed Beef', description: 'High-quality protein and zinc for optimal hormone function' },
          { rank: 7, title: 'Sweet Potatoes', description: 'Complex carbs that support thyroid and cortisol balance' },
          { rank: 8, title: 'Berries', description: 'Antioxidants protect hormone-producing glands' },
          { rank: 9, title: 'Eggs', description: 'Complete protein with cholesterol needed for hormone production' },
          { rank: 10, title: 'Bone Broth', description: 'Collagen and minerals support overall hormonal health' }
        ],
        style: 'numbered'
      }
    },

    // 11. Countdown timer
    {
      id: 'countdown',
      type: 'countdown-timer',
      enabled: true,
      position: 11,
      config: {
        headline: 'Special Offer Expires Soon',
        subheading: 'Get my complete Hormone Reset Protocol at 60% off',
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        style: 'urgent'
      }
    },

    // 12. Shop Now Widget (pricing tiers)
    {
      id: 'shop-now-widget',
      type: 'shop-now',
      enabled: true,
      position: 12,
      config: {
        name: 'Complete Hormone Reset',
        description: 'The all-in-one solution for naturally balancing your hormones and boosting your metabolism after 40.',
        images: [
          { url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&h=500&fit=crop', alt: 'Product main view' },
          { url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop', alt: 'Product angle view' },
          { url: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=500&h=500&fit=crop', alt: 'Product contents' },
          { url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop', alt: 'Product in use' },
          { url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500&h=500&fit=crop', alt: 'Product detail' },
          { url: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=500&h=500&fit=crop', alt: 'Product lifestyle' }
        ],
        rating: 4.9,
        reviewCount: 2847,
        pricingOptions: [
          {
            id: 'single',
            label: 'Buy 1 Get 1 FREE',
            quantity: 1,
            price: 97,
            originalPrice: 167,
            perUnit: 97,
            savings: 'Save $70',
            gifts: [
              { name: 'Free Shipping', value: '$10.00' }
            ]
          },
          {
            id: 'double',
            label: 'Buy 2 Get 2 FREE',
            quantity: 2,
            price: 167,
            originalPrice: 287,
            perUnit: 83.50,
            savings: 'Save $120',
            popular: true,
            gifts: [
              { name: 'Free Shipping', value: '$10.00' },
              { name: 'Free Frother', value: '$10.00' }
            ]
          },
          {
            id: 'triple',
            label: 'Buy 3 Get 3 FREE',
            quantity: 3,
            price: 227,
            originalPrice: 377,
            perUnit: 75.67,
            savings: 'Save $150',
            gifts: [
              { name: 'Free Shipping', value: '$10.00' },
              { name: 'Free Frother', value: '$10.00' },
              { name: 'Free Wellness Guide', value: '$10.00' }
            ]
          }
        ],
        benefits: [
          'Clinically-backed formula',
          '90-day transformation protocol',
          'Free shipping',
          'Expert support included'
        ],
        buttonText: 'Add to Cart',
        buttonUrl: `/site/${siteId}/top-picks`
      }
    },

    // 13. Product showcase
    {
      id: 'product',
      type: 'product-showcase',
      enabled: true,
      position: 13,
      config: {
        name: 'Complete Hormone Reset',
        description: 'Everything you need to naturally balance your hormones and boost your metabolism—backed by science and proven by 47,000+ women.',
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop',
        price: 97,
        originalPrice: 197,
        rating: '4.9',
        reviews: 2847,
        badge: 'BEST SELLER',
        benefits: [
          'Clinically-proven hormone support formula',
          '90-day transformation meal plan',
          'Weekly coaching videos',
          'Private community access',
          'Money-back guarantee'
        ],
        buttonText: 'Get Instant Access →',
        buttonUrl: `/site/${siteId}/top-picks`,
        size: 'large',
        style: 'featured'
      }
    },

    // 14. FAQ Accordion
    {
      id: 'faq-widget',
      type: 'faq',
      enabled: true,
      position: 14,
      config: {
        headline: 'Frequently Asked Questions',
        subheading: 'Everything you need to know about the Hormone Reset Protocol',
        questions: [
          {
            question: 'How quickly will I see results?',
            answer: 'Most women notice improvements in energy and sleep within the first 2 weeks. Significant changes in weight and mood typically occur between weeks 4-6.'
          },
          {
            question: "Is this safe if I'm on medication?",
            answer: 'Our protocol uses natural, food-based approaches. However, we always recommend consulting with your healthcare provider before starting any new health regimen.'
          },
          {
            question: "What if it doesn't work for me?",
            answer: "We offer a 60-day money-back guarantee. If you're not completely satisfied with your results, we'll refund your purchase in full."
          },
          {
            question: 'Do I need to buy supplements?',
            answer: 'The core protocol focuses on diet and lifestyle changes. Supplements are optional and recommended only for those who want to accelerate their results.'
          },
          {
            question: "Is this program right for me if I'm in menopause?",
            answer: 'Absolutely! Our protocol is designed for women at all stages of hormonal transition, from perimenopause through post-menopause.'
          }
        ],
        style: 'accordion'
      }
    },

    // 15. Email capture
    {
      id: 'email-capture',
      type: 'email-capture',
      enabled: true,
      position: 15,
      config: {
        headline: 'Get My Free Hormone Balance Checklist',
        subheading: 'Plus weekly tips that have helped 47,000+ women transform their health',
        buttonText: 'Send Me The Checklist'
      }
    },

    // 16. Social proof bar
    {
      id: 'social-proof-widget',
      type: 'social-proof',
      enabled: true,
      position: 16,
      config: {
        message: '🔥 247 women joined in the last 24 hours',
        recentSignups: [
          { name: 'Jennifer M.', location: 'Austin, TX', timeAgo: '2 minutes ago' },
          { name: 'Sarah K.', location: 'Denver, CO', timeAgo: '5 minutes ago' },
          { name: 'Michelle R.', location: 'Seattle, WA', timeAgo: '8 minutes ago' }
        ],
        style: 'ticker'
      }
    },

    // 17. Final CTA
    {
      id: 'final-cta',
      type: 'cta-button',
      enabled: true,
      position: 17,
      config: {
        buttonText: 'Yes! I Want to Balance My Hormones →',
        buttonUrl: `/site/${siteId}/top-picks`,
        style: 'primary'
      }
    }
  ];
}

/**
 * Generate a minimal widget config for a simple article (just content)
 */
export function generateMinimalWidgetConfig(article: ArticleContext): Widget[] {
  // Hero image is now rendered directly from article.image in ArticleTemplate
  return [
    {
      id: 'intro',
      type: 'text-block',
      enabled: true,
      position: 1,
      config: {
        content: `<p class="text-xl text-gray-700 leading-relaxed mb-6 font-medium">${article.excerpt}</p>`
      }
    },
    {
      id: 'main-content',
      type: 'text-block',
      enabled: true,
      position: 2,
      config: {
        content: `<div class="prose prose-lg max-w-none">${article.content || ''}</div>`
      }
    },
    {
      id: 'email-capture',
      type: 'email-capture',
      enabled: true,
      position: 3,
      config: {
        headline: 'Want More Tips Like This?',
        subheading: 'Join thousands getting weekly health insights',
        buttonText: 'Subscribe'
      }
    }
  ];
}

/**
 * Parse widget_config from database (JSON string to Widget array)
 */
export function parseWidgetConfig(widgetConfigJson: string | null): Widget[] | null {
  if (!widgetConfigJson) return null;

  try {
    const parsed = JSON.parse(widgetConfigJson);
    // Handle both array format and object with widgets property
    return Array.isArray(parsed) ? parsed : parsed.widgets || null;
  } catch (e) {
    console.error('Failed to parse widget_config:', e);
    return null;
  }
}

/**
 * Serialize widget config for database storage
 */
export function serializeWidgetConfig(widgets: Widget[]): string {
  return JSON.stringify(widgets);
}
