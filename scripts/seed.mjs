import Database from 'better-sqlite3';
import { nanoid } from 'nanoid';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'data', 'kiala.db');
const db = new Database(dbPath);

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS sites (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    domain TEXT UNIQUE,
    subdomain TEXT UNIQUE,
    theme TEXT NOT NULL DEFAULT 'medical',
    settings TEXT NOT NULL DEFAULT '{}',
    brand_profile TEXT NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'draft',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS articles (
    id TEXT PRIMARY KEY,
    site_id TEXT NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT,
    slug TEXT NOT NULL,
    category TEXT,
    image TEXT,
    featured BOOLEAN DEFAULT 0,
    trending BOOLEAN DEFAULT 0,
    published BOOLEAN DEFAULT 0,
    read_time INTEGER DEFAULT 5,
    views INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    published_at DATETIME,
    FOREIGN KEY (site_id) REFERENCES sites (id),
    UNIQUE(site_id, slug)
  )
`);

// Prepare statements
const siteInsert = db.prepare(`
  INSERT INTO sites (id, name, domain, subdomain, theme, settings, brand_profile, status)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const articleInsert = db.prepare(`
  INSERT INTO articles (id, site_id, title, excerpt, content, slug, category, image, featured, trending, published, read_time, views)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// Create a sample site
const siteId = nanoid();
const brandProfile = {
  name: 'Dr. Amy',
  tagline: 'Women\'s Health & Wellness',
  bio: 'Leading expert in women\'s health with over 15 years of experience.',
  logo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face',
  profileImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face'
};

const settings = {
  primaryColor: '#ec4899',
  secondaryColor: '#7c3aed',
  headerStyle: 'modern'
};

siteInsert.run(
  siteId,
  'Dr. Amy - Women\'s Health Authority', 
  'dr-amy.com',
  'dr-amy',
  'medical',
  JSON.stringify(settings),
  JSON.stringify(brandProfile),
  'active'
);

// Create sample articles for the site
const articles = [
  {
    title: 'The Hidden Hormone That\'s Sabotaging Your Weight Loss After 40',
    excerpt: 'Discover the surprising hormone that could be preventing you from losing weight, and the simple steps to fix it naturally.',
    content: `# The Hidden Hormone That's Sabotaging Your Weight Loss After 40

As women age, many notice that losing weight becomes increasingly difficult, even when following the same diet and exercise routines that worked in their 20s and 30s. The culprit? A hormone that most women have never heard of, yet it plays a crucial role in metabolism, fat storage, and overall health.

## What Is This Mysterious Hormone?

The hormone in question is leptin - often called the "satiety hormone." Leptin is produced by your fat cells and signals to your brain when you've had enough to eat. However, as women age, especially after 40, leptin resistance can develop.

## Signs of Leptin Resistance

- Difficulty feeling full after meals
- Intense cravings for high-calorie foods
- Weight gain around the midsection
- Fatigue and low energy
- Difficulty losing weight despite diet and exercise

## Take Action Today

Don't let leptin resistance continue to sabotage your health goals. Start implementing these strategies today, and within 2-4 weeks, you should notice improved appetite control and easier weight management.`,
    slug: 'hidden-hormone-sabotaging-weight-loss',
    category: 'Weight Loss',
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&h=600&fit=crop',
    featured: 1,
    trending: 1,
    published: 1,
    read_time: 8,
    views: 12847
  },
  {
    title: '5 Foods That Naturally Balance Your Hormones',
    excerpt: 'These common foods can help regulate your hormones and improve your energy, mood, and metabolism.',
    content: `# 5 Foods That Naturally Balance Your Hormones

Hormonal imbalances can wreak havoc on your body, affecting everything from your energy levels to your weight and mood. Fortunately, certain foods can help naturally support hormone production and balance.

## 1. Avocados - The Hormone Helper

Rich in healthy monounsaturated fats, avocados provide the building blocks your body needs to produce hormones like estrogen and progesterone.

## 2. Cruciferous Vegetables - Natural Detoxifiers

Broccoli, cauliflower, and Brussels sprouts contain compounds that help your liver process and eliminate excess hormones.

## Simple Daily Protocol

Include at least 2-3 of these foods in your daily diet to start seeing improvements in your hormone balance within 2-3 weeks.`,
    slug: 'foods-naturally-balance-hormones',
    category: 'Nutrition',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=600&fit=crop',
    featured: 0,
    trending: 1,
    published: 1,
    read_time: 6,
    views: 8934
  },
  {
    title: 'The 2-Minute Morning Ritual That Transforms Your Energy',
    excerpt: 'This simple morning practice can dramatically improve your energy levels and hormone balance throughout the day.',
    content: `# The 2-Minute Morning Ritual That Transforms Your Energy

What if I told you that just 2 minutes every morning could dramatically improve your energy levels, balance your hormones, and set you up for a successful day?

## The Power of Morning Light Exposure

The ritual is simple: step outside within 30 minutes of waking up and expose your eyes to natural sunlight for 2-5 minutes.

## Expected Results

Most women notice improved energy and better sleep within 3-7 days of consistent practice.`,
    slug: 'morning-ritual-transforms-energy',
    category: 'Wellness',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    featured: 1,
    trending: 0,
    published: 1,
    read_time: 5,
    views: 15782
  },
  {
    title: 'Why Your Thyroid Might Be Sabotaging Your Metabolism',
    excerpt: 'Millions of women have undiagnosed thyroid issues. Learn the warning signs and natural solutions.',
    content: `# Why Your Thyroid Might Be Sabotaging Your Metabolism

Your thyroid is a small butterfly-shaped gland in your neck, but it has an enormous impact on your metabolism, energy levels, and overall health.

## Warning Signs of Thyroid Dysfunction

- Unexplained weight gain or inability to lose weight
- Constant fatigue, even after adequate sleep
- Cold hands and feet

## Take Action

If you recognize these symptoms, don't ignore them. Request comprehensive thyroid testing from your healthcare provider.`,
    slug: 'thyroid-sabotaging-metabolism',
    category: 'Thyroid Health',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=600&fit=crop',
    featured: 0,
    trending: 1,
    published: 1,
    read_time: 7,
    views: 9876
  }
];

// Insert articles
articles.forEach(article => {
  const articleId = nanoid();
  articleInsert.run(
    articleId,
    siteId,
    article.title,
    article.excerpt,
    article.content,
    article.slug,
    article.category,
    article.image,
    article.featured,
    article.trending,
    article.published,
    article.read_time,
    article.views
  );
});

console.log('Database seeded successfully!');
console.log(`Created site: ${siteId}`);
console.log(`Created ${articles.length} articles`);

const { widgetRegistry } = await import('../src/lib/widget-registry.ts');

async function seedWidgets() {
  await widgetRegistry.registerWidget({
    id: 'article-grid',
    name: 'Article Grid',
    description: 'Displays a grid of articles, optionally with a featured article.',
    category: 'content',
    version: '1.0.0',
    template: `
      <section class="py-12">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">{{title}}</h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">{{subheading}}</p>
        </div>
        <!-- The rest of the template will be more complex and will require looping over articles -->
        <!-- This is a simplified example -->
        <div>
          {{#each articles}}
            <div class="article-card">
              <h3>{{this.title}}</h3>
              <p>{{this.excerpt}}</p>
            </div>
          {{/each}}
        </div>
      </section>
    `,
    styles: `
      .article-card {
        border: 1px solid #eee;
        padding: 1rem;
        margin-bottom: 1rem;
      }
    `,
    adminFields: [
      { key: 'title', label: 'Title', type: 'text', required: true, defaultValue: 'Latest Articles' },
      { key: 'subheading', label: 'Subheading', type: 'textarea', required: false },
      { key: 'showFeatured', label: 'Show Featured Article', type: 'checkbox', required: false, defaultValue: true },
    ],
    active: true,
    global: true,
  });
  await widgetRegistry.registerWidget({
    id: 'community-stats',
    name: 'Community Stats',
    description: 'Displays community statistics in a visually appealing way.',
    category: 'social',
    version: '1.0.0',
    template: `
      <section class="py-8 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl">
        <div class="max-w-6xl mx-auto px-6">
          <div class="text-center mb-6">
            <h2 class="text-2xl font-bold text-gray-900 mb-2">{{title}}</h2>
            <p class="text-lg text-gray-600">{{subheading}}</p>
          </div>
          <div class="grid md:grid-cols-4 gap-4 mb-6">
            {{#each stats}}
              <div class="bg-white rounded-xl shadow-lg p-4 text-center border-2">
                <div class="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span class="text-white text-xl">{{this.icon}}</span>
                </div>
                <div class="text-2xl font-bold text-gray-900 mb-1">{{this.value}}</div>
                <div class="text-xs text-gray-600">{{this.label}}</div>
              </div>
            {{/each}}
          </div>
        </div>
      </section>
    `,
    styles: `
      /* Add any specific styles for the community stats widget here */
    `,
    adminFields: [
      { key: 'title', label: 'Title', type: 'text', required: true, defaultValue: 'Join a Community That\'s Changing Lives' },
      { key: 'subheading', label: 'Subheading', type: 'textarea', required: false, defaultValue: 'See why thousands of people trust our brand for their wellness journey' },
      { key: 'stats', label: 'Statistics', type: 'textarea', required: true, defaultValue: '[{"icon":"👥","value":"47,284","label":"People Transformed"},{"icon":"❤️","value":"98.7%","label":"Satisfaction Rate"},{"icon":"⭐","value":"4.9/5","label":"Average Rating"},{"icon":"⚡","value":"156%","label":"Energy Increase"}]' },
    ],
    active: true,
    global: true,
  });
  await widgetRegistry.registerWidget({
    id: 'comparison-table',
    name: 'Comparison Table',
    description: 'Displays a comparison table between two products.',
    category: 'content',
    version: '1.0.0',
    template: `
      <div class="widget-container bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200">
        <div class="text-center mb-8">
          <h3 class="text-2xl font-bold text-gray-900 mb-2">{{headline}}</h3>
          <p class="text-gray-600">{{subheading}}</p>
        </div>
        <!-- Product Headers -->
        <!-- Comparison Table -->
        <!-- Savings Summary -->
        <!-- CTA Section -->
        <!-- Brand's Note -->
      </div>
    `,
    styles: `
      /* Add any specific styles for the comparison table widget here */
    `,
    adminFields: [
      { key: 'headline', label: 'Headline', type: 'text', required: true, defaultValue: 'Independent Comparison Analysis' },
      { key: 'subheading', label: 'Subheading', type: 'textarea', required: false, defaultValue: 'See how our recommended solution compares to the leading alternative' },
      { key: 'ourProduct', label: 'Our Product', type: 'textarea', required: true, defaultValue: '{"name":"Our Product","image":"","price":0,"originalPrice":0,"rating":0,"reviewCount":0,"affiliateUrl":"","badges":[],"brandNote":""}' },
      { key: 'competitorName', label: 'Competitor Name', type: 'text', required: true, defaultValue: 'Leading Brand' },
      { key: 'competitorPrice', label: 'Competitor Price', type: 'number', required: false },
      { key: 'competitorImage', label: 'Competitor Image', type: 'text', required: false },
      { key: 'comparisons', label: 'Comparisons', type: 'textarea', required: true, defaultValue: '[]' },
      { key: 'buttonText', label: 'Button Text', type: 'text', required: false, defaultValue: 'Get Our #1 Recommendation' },
      { key: 'brandName', label: 'Brand Name', type: 'text', required: false, defaultValue: 'The Team' },
    ],
    active: true,
    global: true,
  });
  await widgetRegistry.registerWidget({
    id: 'countdown-timer',
    name: 'Countdown Timer',
    description: 'Displays a countdown timer to create urgency.',
    category: 'conversion',
    version: '1.0.0',
    template: `
      <div class="widget-container bg-gradient-to-r from-red-500 to-orange-500 text-white">
        <div class="text-center py-8">
          <h3 class="text-xl font-bold mb-2">{{headline}}</h3>
          <p class="text-red-100 mb-6">{{subheading}}</p>
          <div class="grid grid-cols-3 gap-4 max-w-xs mx-auto mb-6">
            <div class="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <div class="text-3xl font-bold">{{hours}}</div>
              <div class="text-sm text-red-200">Hours</div>
            </div>
            <div class="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <div class="text-3xl font-bold">{{minutes}}</div>
              <div class="text-sm text-red-200">Minutes</div>
            </div>
            <div class="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <div class="text-3xl font-bold animate-pulse">{{seconds}}</div>
              <div class="text-sm text-red-200">Seconds</div>
            </div>
          </div>
        </div>
      </div>
    `,
    styles: `
      /* Add any specific styles for the countdown timer widget here */
    `,
    adminFields: [
      { key: 'headline', label: 'Headline', type: 'text', required: true, defaultValue: 'Limited Time Offer' },
      { key: 'subheading', label: 'Subheading', type: 'textarea', required: false, defaultValue: 'Special pricing ends in:' },
      { key: 'timer', label: 'Timer (ms)', type: 'number', required: true, defaultValue: 86400000 },
    ],
    active: true,
    global: true,
  });
  await widgetRegistry.registerWidget({
    id: 'credibility-badges',
    name: 'Credibility Badges',
    description: 'Displays a set of credibility badges to build trust.',
    category: 'social',
    version: '1.0.0',
    template: `
      <div class="widget-container bg-gray-50 flex items-center justify-center gap-6">
        {{#each badges}}
          <div class="flex items-center gap-2 text-sm text-gray-600">
            <span class="text-2xl">{{this.icon}}</span>
            <span class="font-medium">{{this.label}}</span>
          </div>
        {{/each}}
      </div>
    `,
    styles: `
      /* Add any specific styles for the credibility badges widget here */
    `,
    adminFields: [
      { key: 'badges', label: 'Badges', type: 'textarea', required: true, defaultValue: '[{"icon":"🛡️","label":"FDA Registered"},{"icon":"🧪","label":"Clinically Tested"},{"icon":"🏆","label":"Expert Recommended"},{"icon":"💰","label":"Money-Back Guarantee"}]' },
    ],
    active: true,
    global: true,
  });
  await widgetRegistry.registerWidget({
    id: 'featured-product-tile',
    name: 'Featured Product Tile',
    description: 'Displays a featured product in a visually appealing tile.',
    category: 'content',
    version: '1.0.0',
    template: `
      <div class="bg-gradient-to-br from-accent-50 to-primary-100 rounded-2xl border-2 border-accent-200 shadow-xl overflow-hidden relative">
        <!-- Urgency banner -->
        <div class="bg-gradient-to-r from-accent-500 to-accent-600 text-white text-center py-2 px-4 relative">
          <div class="flex items-center justify-center gap-2 text-sm font-bold">
            <span class="animate-pulse">⚡</span>
            <span>{{urgencyText}}</span>
            <span class="animate-pulse">⚡</span>
          </div>
        </div>
        <div class="p-8">
          <div class="flex items-start gap-6">
            <!-- Product image - bigger, takes up 1/3 -->
            <div class="relative flex-shrink-0" style="width: 33%;">
              <img 
                src="{{productImage}}" 
                alt="{{productName}}"
                class="w-full h-40 rounded-xl object-cover shadow-lg"
              />
              <div class="absolute -top-2 -right-2 bg-accent-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                #1 Pick
              </div>
            </div>
            
            <!-- Product info - left aligned -->
            <div class="flex-1 text-left">
              <div class="flex items-center gap-2 mb-2">
                <span class="bg-secondary-100 text-secondary-700 px-3 py-1 rounded-full text-xs font-semibold">
                  {{topPickText}}
                </span>
                <div class="flex">
                  <!-- Stars should be dynamically generated based on rating -->
                </div>
                <span class="text-sm text-gray-600">({{reviewCount}} reviews)</span>
              </div>
              
              <h3 class="text-xl font-bold text-gray-900 mb-2">
                {{productName}}
              </h3>
              
              <p class="text-gray-700 text-sm mb-4 leading-relaxed">
                {{productDescription}}
              </p>
              
              <!-- Social proof -->
              <div class="flex items-center gap-4 mb-4 text-sm">
                <!-- Social proof icons and text -->
              </div>
              
              <!-- Pricing -->
              <div class="flex items-center gap-3 mb-4">
                <div class="text-2xl font-bold text-gray-900">{{price}}</div>
                <div class="text-lg text-gray-500 line-through">{{originalPrice}}</div>
                <div class="bg-accent-100 text-accent-700 px-3 py-1 rounded-full text-sm font-bold">
                  Save {{savings}}
                </div>
              </div>
              
              <!-- CTA -->
              <a 
                href="{{ctaUrl}}"
                class="inline-flex items-center gap-2 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-bold px-6 py-3 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                {{ctaText}}
                <span>→</span>
              </a>
            </div>
          </div>
          
          <!-- Trust signals -->
          <div class="mt-6 pt-6 border-t border-gray-200">
            <!-- Trust signals content -->
          </div>
          
          <!-- Recent purchases -->
          <div class="mt-4 bg-white/60 rounded-lg p-3">
            <!-- Recent purchases content -->
          </div>
        </div>
      </div>
    `,
    styles: `
      /* Add any specific styles for the featured product tile widget here */
    `,
    adminFields: [
      { key: 'urgencyText', label: 'Urgency Text', type: 'text', required: false, defaultValue: 'LIMITED TIME: 40% OFF - Only 72 hours left!' },
      { key: 'productImage', label: 'Product Image', type: 'text', required: true },
      { key: 'productName', label: 'Product Name', type: 'text', required: true },
      { key: 'topPickText', label: 'Top Pick Text', type: 'text', required: false, defaultValue: 'MY TOP PICK' },
      { key: 'reviewCount', label: 'Review Count', type: 'number', required: false, defaultValue: 0 },
      { key: 'productDescription', label: 'Product Description', type: 'textarea', required: true },
      { key: 'price', label: 'Price', type: 'text', required: true },
      { key: 'originalPrice', label: 'Original Price', type: 'text', required: false },
      { key: 'savings', label: 'Savings', type: 'text', required: false },
      { key: 'ctaUrl', label: 'CTA URL', type: 'text', required: true },
      { key: 'ctaText', label: 'CTA Text', type: 'text', required: true, defaultValue: 'Get Instant Access' },
    ],
    active: true,
    global: true,
  });
  await widgetRegistry.registerWidget({
    id: 'hero-story',
    name: 'Hero Story',
    description: 'A hero section with a story.',
    category: 'content',
    version: '1.0.0',
    template: `
      <section class="bg-white border-2 border-gray-100 rounded-xl shadow-lg overflow-hidden">
        <div class="grid md:grid-cols-2 gap-0">
          <!-- Hero Image -->
          <div class="relative aspect-[4/3] md:aspect-auto">
            <div 
              class="w-full h-full bg-cover bg-center relative"
              style="background-image: url({{image}})"
            >
              <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              <div class="absolute top-4 left-4">
                <span class="bg-primary-500 text-white px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
                  ✨ FEATURED STORY
                </span>
              </div>
            </div>
          </div>

          <!-- Hero Content -->
          <div class="p-8 flex flex-col justify-center bg-gradient-to-br from-primary-50 to-white">
            <div class="space-y-4">
              <div class="flex items-center gap-2 text-sm text-gray-500">
                <span>{{category}}</span>
                <span class="text-primary-500">•</span>
                <span>{{readTime}} MIN READ</span>
                <span class="text-primary-500">•</span>
                <div class="flex items-center gap-1">
                  <span class="text-accent-500">❤️</span>
                  <span>{{views}}</span>
                </div>
              </div>
              
              <h1 class="text-3xl md:text-4xl font-bold text-gray-900 text-balance leading-tight">
                {{headline}}
              </h1>
              
              <p class="text-lg text-gray-600 leading-relaxed">
                {{subheading}}
              </p>

              <div class="flex items-center gap-4 pt-2">
                <div class="flex items-center gap-2">
                  <img 
                    src="{{authorImage}}" 
                    alt="{{authorName}}"
                    class="w-10 h-10 rounded-full border-2 border-primary-200"
                  />
                  <div>
                    <div class="font-semibold text-gray-900">{{authorName}}</div>
                    <div class="text-sm text-gray-500">{{authorTitle}}</div>
                  </div>
                </div>
              </div>

              <div class="space-y-3 pt-4">
                <a 
                  href="{{buttonUrl}}"
                  class="inline-block bg-gradient-to-r from-primary-500 to-primary-600 text-white px-12 py-3 rounded-full font-bold hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 whitespace-nowrap"
                >
                  {{buttonText}}
                </a>
                <div class="flex items-center gap-1 text-sm text-gray-500">
                  <span class="text-accent-500">⭐</span>
                  <span>{{rating}} rating</span>
                  <span class="text-gray-300">•</span>
                  <span>{{views}} reads</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `,
    styles: `
      /* Add any specific styles for the hero story widget here */
    `,
    adminFields: [
      { key: 'image', label: 'Image URL', type: 'text', required: true },
      { key: 'category', label: 'Category', type: 'text', required: false, defaultValue: 'WELLNESS' },
      { key: 'readTime', label: 'Read Time (minutes)', type: 'number', required: false, defaultValue: 8 },
      { key: 'views', label: 'Views', type: 'number', required: false, defaultValue: 0 },
      { key: 'headline', label: 'Headline', type: 'text', required: true, defaultValue: 'The Morning Ritual That Melted 47 Pounds' },
      { key: 'subheading', label: 'Subheading', type: 'textarea', required: true, defaultValue: 'How I discovered the 90-second morning habit that helped me (and 10,847 women) finally lose stubborn belly fat after age 40' },
      { key: 'authorImage', label: 'Author Image URL', type: 'text', required: false },
      { key: 'authorName', label: 'Author Name', type: 'text', required: false },
      { key: 'authorTitle', label: 'Author Title', type: 'text', required: false },
      { key: 'buttonUrl', label: 'Button URL', type: 'text', required: true },
      { key: 'buttonText', label: 'Button Text', type: 'text', required: true, defaultValue: 'Read My Story →' },
      { key: 'rating', label: 'Rating', type: 'text', required: false, defaultValue: '4.9' },
    ],
    active: true,
    global: true,
  });
  await widgetRegistry.registerWidget({
    id: 'live-activity-feed',
    name: 'Live Activity Feed',
    description: 'Displays a live feed of user activity to create social proof.',
    category: 'social',
    version: '1.0.0',
    template: `
      <div class="fixed bottom-6 left-6 z-50 max-w-sm">
        <div class="bg-white border border-gray-200 rounded-xl shadow-lg p-4 transform transition-all duration-300 hover:scale-105">
          <div class="flex items-center gap-3">
            <div class="relative">
              <img
                src="{{avatar}}"
                alt="{{name}}"
                class="w-10 h-10 rounded-full object-cover"
              />
              <div class="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="font-semibold text-gray-900 text-sm">{{name}}</span>
                <span class="text-xs text-gray-500 flex items-center gap-1">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path></svg>
                  {{location}}
                </span>
              </div>
              
              <p class="text-sm text-gray-700">{{action}}</p>
              
              <div class="flex items-center gap-1 text-xs text-gray-500 mt-1">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path></svg>
                {{timeAgo}}
              </div>
            </div>
            
            <div class="text-green-500">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path></svg>
            </div>
          </div>
          
          <div class="mt-3 flex items-center justify-between text-xs">
            <span class="text-green-600 font-medium">✓ Verified order</span>
            <span class="text-gray-500">{{viewingCount}} people viewing</span>
          </div>
        </div>
      </div>
    `,
    styles: `
      /* Add any specific styles for the live activity feed widget here */
    `,
    adminFields: [
      { key: 'avatar', label: 'Avatar URL', type: 'text', required: true },
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'location', label: 'Location', type: 'text', required: false },
      { key: 'action', label: 'Action', type: 'text', required: true },
      { key: 'timeAgo', label: 'Time Ago', type: 'text', required: true },
      { key: 'viewingCount', label: 'Viewing Count', type: 'number', required: false, defaultValue: 0 },
    ],
    active: true,
    global: true,
  });
  await widgetRegistry.registerWidget({
    id: 'newsletter-signup',
    name: 'Newsletter Signup',
    description: 'A newsletter signup form with social proof.',
    category: 'conversion',
    version: '1.0.0',
    template: `
      <section class="py-12 bg-gradient-to-r from-primary-100 to-secondary-100 relative overflow-hidden rounded-2xl">
        <div class="max-w-4xl mx-auto px-4 relative z-10">
          <div class="text-center text-gray-900">
            <div class="flex justify-center items-center gap-1 mb-4">
              <!-- Stars should be dynamically generated based on rating -->
              <span class="ml-2 text-gray-700 font-semibold">{{rating}} from {{reviewCount}} women</span>
            </div>
            <h2 class="text-3xl md:text-4xl font-bold mb-4 leading-tight">
              {{headline}}
            </h2>
            <p class="text-xl text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">
              {{subheading}}
            </p>
            <div class="grid md:grid-cols-3 gap-6 mb-10">
              {{#each benefits}}
                <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center border border-gray-200">
                  <div class="text-3xl mx-auto mb-3">{{this.icon}}</div>
                  <h3 class="font-bold mb-2">{{this.title}}</h3>
                  <p class="text-sm text-gray-600">{{this.description}}</p>
                </div>
              {{/each}}
            </div>
            <form class="max-w-md mx-auto">
              <div class="flex flex-col sm:flex-row gap-3 mb-4">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  class="flex-1 px-6 py-4 rounded-full text-gray-700 placeholder-gray-500 border-0 focus:ring-4 focus:ring-accent-300 font-medium"
                  required
                />
                <button
                  type="submit"
                  class="bg-accent-500 hover:bg-accent-600 text-white font-bold px-8 py-4 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 2.25l7.997 3.634A1 1 0 0017 7.93l-3 9A1 1 0 0013 18H7a1 1 0 00-.997-1.07l-3-9A1 1 0 002.003 5.884zM10 5.25L4.04 7.93l2.625 7.875h6.67l2.625-7.875L10 5.25z"></path></svg>
                  {{buttonText}}
                </button>
              </div>
              <div class="flex items-center justify-center gap-2 text-gray-600 text-sm">
                <span>✓</span>
                <span>{{footerText}}</span>
              </div>
            </form>
          </div>
        </div>
      </section>
    `,
    styles: `
      /* Add any specific styles for the newsletter signup widget here */
    `,
    adminFields: [
      { key: 'rating', label: 'Rating', type: 'text', required: false, defaultValue: '4.9/5' },
      { key: 'reviewCount', label: 'Review Count', type: 'text', required: false, defaultValue: '47,284 women' },
      { key: 'headline', label: 'Headline', type: 'text', required: true, defaultValue: 'Join 47,284+ Women Who\'ve Already Transformed Their Lives' },
      { key: 'subheading', label: 'Subheading', type: 'textarea', required: false, defaultValue: 'Get instant access to our proven protocols, exclusive research, and a supportive community of women just like you.' },
      { key: 'benefits', label: 'Benefits', type: 'textarea', required: false, defaultValue: '[{"icon":"🎁","title":"Free 7-Day Guide","description":"The Hormone Reset Protocol (valued at $47)"},{"icon":"👥","title":"Exclusive Community","description":"Connect with 47k+ women on the same journey"},{"icon":"✅","title":"Weekly Insights","description":"Latest research & breakthrough protocols"}]' },
      { key: 'buttonText', label: 'Button Text', type: 'text', required: true, defaultValue: 'Join Free Now' },
      { key: 'footerText', label: 'Footer Text', type: 'text', required: false, defaultValue: 'Free forever • No spam • Unsubscribe anytime' },
    ],
    active: true,
    global: true,
  });
  await widgetRegistry.registerWidget({
    id: 'product-showcase',
    name: 'Product Showcase',
    description: 'Displays a product with its details and a call to action.',
    category: 'content',
    version: '1.0.0',
    template: `
      <div class="widget-container">
        <div class="grid md:grid-cols-3 gap-6 items-center">
          <div class="relative">
            <div class="aspect-square relative">
              <img
                src="{{productImage}}"
                alt="{{productName}}"
                class="object-cover rounded-xl"
              />
            </div>
            {{#if badgeText}}
            <div class="absolute top-3 left-3">
              <span class="bg-accent-500 text-white px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
                {{badgeText}}
              </span>
            </div>
            {{/if}}
          </div>
          <div class="md:col-span-2 space-y-4">
            <div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">{{productName}}</h3>
              <p class="text-gray-600 leading-relaxed">{{productDescription}}</p>
            </div>
            <div class="flex items-center gap-4">
              <div class="flex text-yellow-400">
                <!-- Stars should be dynamically generated based on rating -->
              </div>
              <span class="text-gray-600">{{rating}}/5</span>
              <span class="text-sm text-gray-500">({{reviewCount}} reviews)</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-2xl font-bold text-primary-600">{{price}}</span>
              {{#if originalPrice}}
                <span class="text-gray-500 line-through">{{originalPrice}}</span>
                <span class="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">Save {{savings}}</span>
              {{/if}}
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
              <span>90-day money-back guarantee</span>
            </div>
            <div class="flex gap-3">
              <a 
                href="{{ctaUrl}}"
                target="_blank"
                rel="noopener noreferrer"
                class="btn-primary flex items-center gap-2"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"></path><path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"></path></svg>
                {{buttonText}}
              </a>
              <button class="btn-secondary">
                Read Reviews
              </button>
            </div>
            {{#if brandNote}}
            <div class="bg-gray-50 rounded-lg p-3 border-l-4 border-primary-500">
              <p class="text-sm italic text-gray-700">"{{brandNote}}"</p>
              <p class="text-xs text-primary-600 font-medium mt-1">- {{brandName}}</p>
            </div>
            {{/if}}
          </div>
        </div>
      </div>
    `,
    styles: `
      /* Add any specific styles for the product showcase widget here */
    `,
    adminFields: [
      { key: 'productImage', label: 'Product Image URL', type: 'text', required: true },
      { key: 'productName', label: 'Product Name', type: 'text', required: true },
      { key: 'productDescription', label: 'Product Description', type: 'textarea', required: true },
      { key: 'badgeText', label: 'Badge Text', type: 'text', required: false },
      { key: 'rating', label: 'Rating', type: 'number', required: false, defaultValue: 0 },
      { key: 'reviewCount', label: 'Review Count', type: 'number', required: false, defaultValue: 0 },
      { key: 'price', label: 'Price', type: 'text', required: true },
      { key: 'originalPrice', label: 'Original Price', type: 'text', required: false },
      { key: 'savings', label: 'Savings', type: 'text', required: false },
      { key: 'ctaUrl', label: 'CTA URL', type: 'text', required: true },
      { key: 'buttonText', label: 'Button Text', type: 'text', required: false, defaultValue: 'Shop Now' },
      { key: 'brandNote', label: 'Brand Note', type: 'textarea', required: false },
      { key: 'brandName', label: 'Brand Name', type: 'text', required: false, defaultValue: 'The Team' },
    ],
    active: true,
    global: true,
  });
  await widgetRegistry.registerWidget({
    id: 'risk-reversal',
    name: 'Risk Reversal',
    description: 'A widget that displays a money-back guarantee to reduce purchase risk.',
    category: 'conversion',
    version: '1.0.0',
    template: `
      <div class="widget-container bg-gradient-to-r from-gray-50 to-green-50 border-green-200">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
          </div>
          <div class="flex-1">
            <h4 class="font-semibold text-gray-900 mb-2">{{title}}</h4>
            <p class="text-gray-700 text-sm mb-3">{{description}}</p>
          </div>
        </div>
      </div>
    `,
    styles: `
      /* Add any specific styles for the risk reversal widget here */
    `,
    adminFields: [
      { key: 'title', label: 'Title', type: 'text', required: true, defaultValue: '90-Day Money-Back Guarantee' },
      { key: 'description', label: 'Description', type: 'textarea', required: false, defaultValue: 'If you\'re not completely satisfied with your results, simply return the product within 90 days for a full refund. No questions, no hassle.' },
    ],
    active: true,
    global: true,
  });
  await widgetRegistry.registerWidget({
    id: 'scarcity-alert',
    name: 'Scarcity Alert',
    description: 'Displays a scarcity alert to create urgency.',
    category: 'conversion',
    version: '1.0.0',
    template: `
      <div class="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-lg p-4 mb-6">
        <div class="flex items-start gap-3">
          <div class="flex-shrink-0">
            <svg class="w-5 h-5 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099a.75.75 0 01.986 0l7.5 9.25a.75.75 0 01-.59 1.151H1.841a.75.75 0 01-.59-1.151l7.5-9.25zM10 12.75a.75.75 0 01.75.75v.008a.75.75 0 01-1.5 0V13.5a.75.75 0 01.75-.75z" clip-rule="evenodd" /></svg>
          </div>
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <h4 class="font-semibold text-red-800">{{headline}}</h4>
              <span class="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                Only {{stock}} left
              </span>
            </div>
            <p class="text-red-700 text-sm">
              {{description}}
            </p>
          </div>
        </div>
      </div>
    `,
    styles: `
      /* Add any specific styles for the scarcity alert widget here */
    `,
    adminFields: [
      { key: 'headline', label: 'Headline', type: 'text', required: true, defaultValue: 'Low Stock Alert' },
      { key: 'stock', label: 'Stock', type: 'number', required: true, defaultValue: 23 },
      { key: 'description', label: 'Description', type: 'textarea', required: false, defaultValue: 'We\'re running low on this product! High demand means limited availability. Reserve yours while supplies last.' },
    ],
    active: true,
    global: true,
  });
  await widgetRegistry.registerWidget({
    id: 'testimonial-carousel',
    name: 'Testimonial Carousel',
    description: 'Displays a carousel of testimonials.',
    category: 'social',
    version: '1.0.0',
    template: `
      <div class="widget-container bg-gradient-to-br from-primary-50 to-secondary-50">
        <div class="text-center mb-8">
          <h3 class="text-2xl font-bold text-gray-900 mb-2">{{headline}}</h3>
          <p class="text-gray-600">{{subheading}}</p>
        </div>
        <div class="max-w-4xl mx-auto">
          <div class="relative bg-white rounded-2xl p-8 shadow-lg">
            <div class="absolute top-4 left-4 w-8 h-8 text-primary-300">"</div>
            <blockquote class="text-xl text-gray-700 leading-relaxed mb-6 text-center italic pl-8">
              {{#with (lookup testimonials currentIndex)}}
                {{this.content}}
              {{/with}}
            </blockquote>
            <div class="flex items-center justify-center gap-4">
              <div class="relative w-16 h-16">
                <img
                  src="{{#with (lookup testimonials currentIndex)}}{{this.avatar}}{{/with}}"
                  alt="{{#with (lookup testimonials currentIndex)}}{{this.name}}{{/with}}"
                  class="object-cover rounded-full"
                />
              </div>
              <div class="text-center">
                <div class="flex items-center gap-2 justify-center mb-1">
                  <div class="font-semibold text-gray-900">{{#with (lookup testimonials currentIndex)}}{{this.name}}{{/with}}</div>
                  {{#if (lookup testimonials currentIndex).verified}}
                    <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">✓ Verified</span>
                  {{/if}}
                </div>
                {{#if (lookup testimonials currentIndex).location}}
                  <div class="text-sm text-gray-500 mb-2">{{#with (lookup testimonials currentIndex)}}{{this.location}}{{/with}}</div>
                {{/if}}
                <div class="flex justify-center text-yellow-400">
                  <!-- Stars -->
                </div>
              </div>
            </div>
          </div>
          <div class="flex items-center justify-center gap-4 mt-6">
            <!-- Navigation buttons -->
          </div>
        </div>
      </div>
    `,
    styles: `
      /* Add any specific styles for the testimonial carousel widget here */
    `,
    adminFields: [
      { key: 'headline', label: 'Headline', type: 'text', required: true, defaultValue: 'Success Stories' },
      { key: 'subheading', label: 'Subheading', type: 'textarea', required: false, defaultValue: 'Hear from women who transformed their health' },
      { key: 'testimonials', label: 'Testimonials', type: 'textarea', required: true, defaultValue: '[]' },
    ],
    active: true,
    global: true,
  });
  console.log('Testimonial Carousel widget seeded successfully!');
  console.log('Scarcity Alert widget seeded successfully!');
  console.log('Risk Reversal widget seeded successfully!');
  console.log('Product Showcase widget seeded successfully!');
  console.log('Newsletter Signup widget seeded successfully!');
  console.log('Live Activity Feed widget seeded successfully!');
  console.log('Hero Story widget seeded successfully!');
  console.log('Featured Product Tile widget seeded successfully!');
  console.log('Credibility Badges widget seeded successfully!');
  console.log('Countdown Timer widget seeded successfully!');
  console.log('Comparison Table widget seeded successfully!');
  console.log('Community Stats widget seeded successfully!');
  console.log('Article Grid widget seeded successfully!');
}

seedWidgets().then(() => {
  db.close();
});