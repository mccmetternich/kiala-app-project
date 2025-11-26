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

db.exec(`
  CREATE TABLE IF NOT EXISTS pages (
    id TEXT PRIMARY KEY,
    site_id TEXT NOT NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    content TEXT,
    template TEXT DEFAULT 'default',
    published BOOLEAN DEFAULT 0,
    author_id TEXT,
    seo_title TEXT,
    seo_description TEXT,
    published_at DATETIME,
    version INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
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

const pageInsert = db.prepare(`
  INSERT INTO pages (id, site_id, title, slug, content, template, published)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

// Create a sample site
const siteId = nanoid();
const brandProfile = {
  name: 'Dr. Amy',
  tagline: 'Women\'s Health & Wellness',
  bio: 'Leading expert in women\'s health with over 15 years of experience.',
  logo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face',
  profileImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face',
  quote: 'Every woman deserves to feel vibrant, energized, and in control of her health.'
};

const settings = {
  primaryColor: '#ec4899',
  secondaryColor: '#7c3aed',
  headerStyle: 'modern',
  navigation: [
    { label: 'Home', url: '/site/dr-amy', type: 'internal' },
    { label: 'Articles', url: '/site/dr-amy/articles', type: 'internal' },
    { label: 'My Top Picks', url: '/site/dr-amy/top-picks', type: 'internal' },
    { label: 'Success Stories', url: '/site/dr-amy/success-stories', type: 'internal' },
    { label: 'About', url: '/site/dr-amy/about', type: 'internal' }
  ]
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

// Create 16 articles
const articles = [
  {
    title: 'The Hidden Hormone That\'s Sabotaging Your Weight Loss After 40',
    excerpt: 'Discover the surprising hormone that could be preventing you from losing weight, and the simple steps to fix it naturally.',
    content: `# The Hidden Hormone That's Sabotaging Your Weight Loss After 40\n\nAs women age, many notice that losing weight becomes increasingly difficult, even when following the same diet and exercise routines that worked in their 20s and 30s. The culprit? A hormone that most women have never heard of, yet it plays a crucial role in metabolism, fat storage, and overall health.\n\n## What Is This Mysterious Hormone?\n\nThe hormone in question is leptin - often called the "satiety hormone." Leptin is produced by your fat cells and signals to your brain when you've had enough to eat. However, as women age, especially after 40, leptin resistance can develop.\n\n## Signs of Leptin Resistance\n\n- Difficulty feeling full after meals\n- Intense cravings for high-calorie foods\n- Weight gain around the midsection\n- Fatigue and low energy\n- Difficulty losing weight despite diet and exercise\n\n## Take Action Today\n\nDon't let leptin resistance continue to sabotage your health goals. Start implementing these strategies today, and within 2-4 weeks, you should notice improved appetite control and easier weight management.`,
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
    content: `# 5 Foods That Naturally Balance Your Hormones\n\nHormonal imbalances can wreak havoc on your body, affecting everything from your energy levels to your weight and mood.`,
    slug: 'foods-naturally-balance-hormones',
    category: 'Nutrition',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=600&fit=crop',
    featured: 1,
    trending: 1,
    published: 1,
    read_time: 6,
    views: 8934
  },
  {
    title: 'The 2-Minute Morning Ritual That Transforms Your Energy',
    excerpt: 'This simple morning practice can dramatically improve your energy levels and hormone balance throughout the day.',
    content: `# The 2-Minute Morning Ritual That Transforms Your Energy\n\nWhat if I told you that just 2 minutes every morning could dramatically improve your energy levels, balance your hormones, and set you up for a successful day?`,
    slug: 'morning-ritual-transforms-energy',
    category: 'Wellness',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    featured: 1,
    trending: 1,
    published: 1,
    read_time: 5,
    views: 15782
  },
  {
    title: 'Why Your Thyroid Might Be Sabotaging Your Metabolism',
    excerpt: 'Millions of women have undiagnosed thyroid issues. Learn the warning signs and natural solutions.',
    content: `# Why Your Thyroid Might Be Sabotaging Your Metabolism\n\nYour thyroid is a small butterfly-shaped gland in your neck, but it has an enormous impact on your metabolism, energy levels, and overall health.`,
    slug: 'thyroid-sabotaging-metabolism',
    category: 'Thyroid Health',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=600&fit=crop',
    featured: 0,
    trending: 1,
    published: 1,
    read_time: 7,
    views: 9876
  },
  {
    title: 'The Sleep Hack That Balances Blood Sugar Overnight',
    excerpt: 'This bedtime routine can help stabilize your blood sugar and improve insulin sensitivity while you sleep.',
    content: `# The Sleep Hack That Balances Blood Sugar Overnight\n\nDiscover how optimizing your sleep can naturally balance your blood sugar levels and improve your metabolic health.`,
    slug: 'sleep-hack-balances-blood-sugar',
    category: 'Sleep',
    image: 'https://images.unsplash.com/photo-1511295742362-92c96b1cf484?w=800&h=600&fit=crop',
    featured: 1,
    trending: 0,
    published: 1,
    read_time: 6,
    views: 7234
  },
  {
    title: 'How Stress Is Making You Gain Weight (And What To Do)',
    excerpt: 'The cortisol-weight connection explained, plus 5 proven strategies to break the cycle.',
    content: `# How Stress Is Making You Gain Weight\n\nChronic stress triggers cortisol release, which can lead to stubborn weight gain, especially around the midsection.`,
    slug: 'stress-weight-gain-solutions',
    category: 'Stress Management',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=600&fit=crop',
    featured: 0,
    trending: 1,
    published: 1,
    read_time: 9,
    views: 11245
  },
  {
    title: 'The Gut-Hormone Connection You Need to Know',
    excerpt: 'Your gut health directly impacts your hormones. Here\'s how to optimize both for better health.',
    content: `# The Gut-Hormone Connection\n\nEmerging research shows that gut health and hormone balance are intimately connected through the gut-brain axis.`,
    slug: 'gut-hormone-connection',
    category: 'Gut Health',
    image: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=800&h=600&fit=crop',
    featured: 1,
    trending: 0,
    published: 1,
    read_time: 8,
    views: 6892
  },
  {
    title: 'Intermittent Fasting for Women Over 40: What You Need to Know',
    excerpt: 'Fasting can be powerful, but women need a different approach. Here\'s your complete guide.',
    content: `# Intermittent Fasting for Women Over 40\n\nIntermittent fasting can be a powerful tool for weight loss and metabolic health, but women over 40 need to approach it differently.`,
    slug: 'intermittent-fasting-women-over-40',
    category: 'Nutrition',
    image: 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800&h=600&fit=crop',
    featured: 0,
    trending: 1,
    published: 1,
    read_time: 10,
    views: 13567
  },
  {
    title: 'The Vitamin Deficiency Behind Your Fatigue',
    excerpt: 'This common deficiency affects 80% of women and could be the reason you\'re always tired.',
    content: `# The Vitamin Deficiency Behind Your Fatigue\n\nIf you're constantly tired despite getting enough sleep, you might have a vitamin D deficiency.`,
    slug: 'vitamin-deficiency-fatigue',
    category: 'Nutrition',
    image: 'https://images.unsplash.com/photo-1505576391880-b3f9d713dc4f?w=800&h=600&fit=crop',
    featured: 0,
    trending: 1,
    published: 1,
    read_time: 7,
    views: 9123
  },
  {
    title: 'Perimenopause vs Menopause: What\'s Really Happening',
    excerpt: 'Understanding the stages of menopause and what you can do at each phase to feel your best.',
    content: `# Perimenopause vs Menopause: Understanding the Transition\n\nMany women don't realize perimenopause can start in your late 30s or early 40s.`,
    slug: 'perimenopause-vs-menopause',
    category: 'Menopause',
    image: 'https://images.unsplash.com/photo-1524863479829-916d8e77f114?w=800&h=600&fit=crop',
    featured: 1,
    trending: 0,
    published: 1,
    read_time: 11,
    views: 14789
  },
  {
    title: 'The Exercise Mistake That\'s Hurting Your Hormones',
    excerpt: 'Too much of this popular workout can actually make your hormone imbalance worse.',
    content: `# The Exercise Mistake That's Hurting Your Hormones\n\nHigh-intensity exercise can stress your adrenals and worsen hormone imbalance if you're not careful.`,
    slug: 'exercise-mistake-hurting-hormones',
    category: 'Fitness',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=600&fit=crop',
    featured: 0,
    trending: 1,
    published: 1,
    read_time: 8,
    views: 8456
  },
  {
    title: 'Natural Solutions for Hot Flashes That Actually Work',
    excerpt: 'Science-backed natural remedies to reduce hot flashes without hormone replacement therapy.',
    content: `# Natural Solutions for Hot Flashes\n\nHot flashes affect up to 75% of menopausal women, but there are natural solutions that can help.`,
    slug: 'natural-solutions-hot-flashes',
    category: 'Menopause',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
    featured: 1,
    trending: 1,
    published: 1,
    read_time: 9,
    views: 16234
  },
  {
    title: 'The Blood Sugar Rollercoaster: How to Get Off',
    excerpt: 'Stable blood sugar is the key to sustained energy, better mood, and easier weight management.',
    content: `# The Blood Sugar Rollercoaster\n\nBlood sugar swings create a cascade of hormonal imbalances that affect everything from your energy to your weight.`,
    slug: 'blood-sugar-rollercoaster',
    category: 'Nutrition',
    image: 'https://images.unsplash.com/photo-1587496679742-bad3dbe5b346?w=800&h=600&fit=crop',
    featured: 0,
    trending: 1,
    published: 1,
    read_time: 7,
    views: 7891
  },
  {
    title: 'Magnesium: The Mineral That Fixes Everything',
    excerpt: 'Why 68% of Americans are deficient in this crucial mineral and how to fix it.',
    content: `# Magnesium: The Miracle Mineral\n\nMagnesium is involved in over 300 biochemical reactions in your body, yet most women don't get enough.`,
    slug: 'magnesium-miracle-mineral',
    category: 'Nutrition',
    image: 'https://images.unsplash.com/photo-1628163180080-ca6c2c12e724?w=800&h=600&fit=crop',
    featured: 1,
    trending: 0,
    published: 1,
    read_time: 6,
    views: 10567
  },
  {
    title: 'The Truth About Adrenal Fatigue',
    excerpt: 'Is adrenal fatigue real? Here\'s what science says and what you should do instead.',
    content: `# The Truth About Adrenal Fatigue\n\nWhile "adrenal fatigue" isn't an official medical diagnosis, the symptoms are very real.`,
    slug: 'truth-about-adrenal-fatigue',
    category: 'Stress Management',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop',
    featured: 0,
    trending: 1,
    published: 1,
    read_time: 10,
    views: 12456
  },
  {
    title: 'How to Read Your Hormone Test Results',
    excerpt: 'A complete guide to understanding your lab work and knowing what numbers really matter.',
    content: `# How to Read Your Hormone Test Results\n\nGetting hormone tests is great, but understanding what the numbers mean is crucial for taking action.`,
    slug: 'read-hormone-test-results',
    category: 'Testing',
    image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&h=600&fit=crop',
    featured: 1,
    trending: 1,
    published: 1,
    read_time: 12,
    views: 18923
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

// Create pages
const pages = [
  {
    title: 'My Top Picks',
    slug: 'top-picks',
    content: JSON.stringify({
      heading: 'My Top Picks',
      subheading: 'After testing hundreds of products, these are the ones I personally recommend and use.',
      intro: 'As a health professional, I\'ve spent years researching and testing products to find the ones that truly deliver results. These are my top recommendations based on efficacy, quality, and value.'
    }),
    template: 'top-picks',
    published: 1
  },
  {
    title: 'Success Stories',
    slug: 'success-stories',
    content: JSON.stringify({
      heading: 'Success Stories',
      subheading: 'Real women, real results',
      intro: 'These are the stories that inspire me every day. Real women who took control of their health and transformed their lives.'
    }),
    template: 'success-stories',
    published: 1
  },
  // About page removed - using default rich media layout from page.tsx instead
  {
    title: 'Join Our Community',
    slug: 'join-community',
    content: JSON.stringify({
      heading: 'Join Our Community',
      subheading: 'Connect with 47,284+ women on the same journey',
      benefits: [
        'Free weekly health tips and protocols',
        'Exclusive access to my latest research',
        'Supportive community of like-minded women',
        'Early access to new programs and products',
        'Monthly live Q&A sessions'
      ]
    }),
    template: 'community',
    published: 1
  }
];

// Insert pages
pages.forEach(page => {
  const pageId = nanoid();
  pageInsert.run(
    pageId,
    siteId,
    page.title,
    page.slug,
    page.content,
    page.template,
    page.published
  );
});

console.log('Database seeded successfully!');
console.log(`Created site: ${siteId}`);
console.log(`Created ${articles.length} articles`);
console.log(`Created ${pages.length} pages`);

db.close();
