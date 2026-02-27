import Database from 'better-sqlite3';
import { nanoid } from 'nanoid';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'data', 'kiala.db');
const db = new Database(dbPath);

// Initialize database schema if not exists
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
    meta_title TEXT,
    meta_description TEXT,
    tags TEXT,
    author_name TEXT,
    author_bio TEXT,
    author_avatar TEXT,
    author_credentials TEXT,
    published_date TEXT,
    widget_config TEXT,
    sections TEXT,
    related_articles TEXT,
    word_count INTEGER,
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

// Check if Goodness Authority site already exists
const existingSite = db.prepare('SELECT id FROM sites WHERE subdomain = ?').get('goodness-authority');
let siteId;

if (existingSite) {
  siteId = existingSite.id;
  console.log('Using existing Goodness Authority site:', siteId);
} else {
  // Create Goodness Authority site
  siteId = nanoid();
  
  const brandProfile = {
    name: 'Goodness Authority',
    tagline: 'Evidence-Based Wellness for Women',
    bio: 'Trusted source for science-backed health information, helping women make informed decisions about their wellness journey.',
    logo: '/images/logos/goodness-authority-logo.png',
    profileImage: '/images/logos/goodness-authority-logo.png',
    quote: 'Empowering women with evidence-based wellness information for informed health decisions.'
  };

  const settings = {
    primaryColor: '#059669', // Green theme for wellness/health authority
    secondaryColor: '#0891b2', // Teal
    accentColor: '#7c3aed', // Purple for highlights
    trustColor: '#dc2626', // Red for trust signals
    headerStyle: 'clean',
    theme: {
      colors: {
        primary: '#059669',
        secondary: '#0891b2',
        accent: '#7c3aed',
        trust: '#dc2626'
      },
      fonts: {
        heading: 'Inter',
        body: 'Inter'
      }
    },
    navigation: [
      { label: 'Home', url: '/site/goodness-authority', type: 'internal' },
      { label: 'Articles', url: '/site/goodness-authority/articles', type: 'internal' },
      { label: 'Research', url: '/site/goodness-authority/research', type: 'internal' },
      { label: 'Guides', url: '/site/goodness-authority/guides', type: 'internal' },
      { label: 'About', url: '/site/goodness-authority/about', type: 'internal' }
    ]
  };

  const siteInsert = db.prepare(`
    INSERT INTO sites (id, name, domain, subdomain, theme, settings, brand_profile, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  siteInsert.run(
    siteId,
    'Goodness Authority - Evidence-Based Wellness',
    'goodnessauthority.com',
    'goodness-authority',
    'wellness',
    JSON.stringify(settings),
    JSON.stringify(brandProfile),
    'active'
  );

  console.log('Created Goodness Authority site:', siteId);
}

// Create homepage
const homepageContent = {
  widgets: [
    {
      type: 'hero-story',
      config: {
        image: '/images/articles/wellness-hero.jpg',
        category: 'EVIDENCE-BASED WELLNESS',
        readTime: '5',
        views: '47284',
        headline: 'Transform Your Health With Science-Backed Strategies',
        subheading: 'Discover evidence-based protocols that help women over 40 reclaim their energy, balance their hormones, and feel incredible in their bodies.',
        authorImage: '/images/authors/goodness-authority-team.jpg',
        authorName: 'Goodness Authority Team',
        authorTitle: 'Evidence-Based Research',
        buttonUrl: '/site/goodness-authority/articles',
        buttonText: 'Explore Our Research →',
        rating: '4.9'
      }
    },
    {
      type: 'article-grid',
      config: {
        title: 'Latest Evidence-Based Articles',
        subheading: 'Research-backed insights for optimal health',
        showFeatured: true
      }
    },
    {
      type: 'community-stats',
      config: {
        title: 'Join Women Who Trust Evidence-Based Wellness',
        subheading: 'See why thousands choose science-backed health information',
        stats: JSON.stringify([
          { icon: '👥', value: '47,284', label: 'Women Informed' },
          { icon: '📚', value: '347', label: 'Research Studies' },
          { icon: '⭐', value: '4.9/5', label: 'Trust Rating' },
          { icon: '⚡', value: '89%', label: 'Report Improvements' }
        ])
      }
    },
    {
      type: 'newsletter-signup',
      config: {
        rating: '4.9/5',
        reviewCount: '47,284',
        headline: 'Get Evidence-Based Health Insights Delivered Weekly',
        subheading: 'Join thousands of women who rely on our research-backed wellness protocols and breakthrough health discoveries.',
        benefits: JSON.stringify([
          { icon: '🔬', title: 'Latest Research', description: 'First access to new health studies and findings' },
          { icon: '📋', title: 'Proven Protocols', description: 'Step-by-step guides backed by science' },
          { icon: '👥', title: 'Expert Community', description: 'Connect with health-conscious women' }
        ]),
        buttonText: 'Get Free Updates',
        footerText: 'Evidence-based • No spam • Unsubscribe anytime'
      }
    }
  ]
};

const pageInsert = db.prepare(`
  INSERT OR REPLACE INTO pages (id, site_id, title, slug, content, template, published)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const homepageId = nanoid();
pageInsert.run(
  homepageId,
  siteId,
  'Home',
  'index',
  JSON.stringify(homepageContent),
  'homepage',
  1
);

console.log('Created homepage for Goodness Authority');

// Read and import all articles from the goodness-authority directory
const articlesDir = path.join(__dirname, '..', 'content', 'goodness-authority', 'articles');
const articleFiles = fs.readdirSync(articlesDir).filter(file => file.endsWith('.json'));

const articleInsert = db.prepare(`
  INSERT OR REPLACE INTO articles (
    id, site_id, title, excerpt, content, slug, category, image, 
    featured, trending, published, read_time, views, meta_title, 
    meta_description, tags, author_name, author_bio, author_avatar, 
    author_credentials, published_date, widget_config, sections, 
    related_articles, word_count
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

console.log(`Found ${articleFiles.length} articles to import`);

let importedCount = 0;
articleFiles.forEach(filename => {
  try {
    const filePath = path.join(articlesDir, filename);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const article = JSON.parse(fileContent);

    // Generate article ID from the JSON id or create new one
    const articleId = article.id || nanoid();
    
    // Convert content array to markdown string if needed
    let contentStr = '';
    if (article.content && Array.isArray(article.content)) {
      contentStr = article.content.map(item => item.content).join('\n\n');
    } else if (typeof article.content === 'string') {
      contentStr = article.content;
    }
    
    // Add sections content to main content
    if (article.sections && Array.isArray(article.sections)) {
      article.sections.forEach(section => {
        contentStr += `\n\n## ${section.heading}\n\n`;
        if (section.content && Array.isArray(section.content)) {
          contentStr += section.content.map(item => item.content).join('\n\n');
        }
      });
    }

    articleInsert.run(
      articleId,
      siteId,
      article.title,
      article.excerpt,
      contentStr,
      article.slug,
      article.category,
      article.featured_image,
      article.featured ? 1 : 0,
      article.trending ? 1 : 0,
      1, // published
      article.reading_time || 10,
      article.views || Math.floor(Math.random() * 15000) + 5000, // Random views if not specified
      article.meta_title,
      article.meta_description,
      JSON.stringify(article.tags),
      article.author?.name,
      article.author?.bio,
      article.author?.avatar,
      article.author?.credentials,
      article.published_date,
      JSON.stringify(article.widget_config),
      JSON.stringify(article.sections),
      JSON.stringify(article.related_articles),
      article.word_count
    );
    
    importedCount++;
    console.log(`Imported: ${article.title}`);
  } catch (error) {
    console.error(`Error importing ${filename}:`, error.message);
  }
});

console.log(`\nSuccessfully imported ${importedCount} articles to Goodness Authority`);
console.log(`Site ID: ${siteId}`);
console.log('Import complete!');

db.close();