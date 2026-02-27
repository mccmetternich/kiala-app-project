import { createClient } from '@libsql/client/web';
import { nanoid } from 'nanoid';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
    }
  });
}

// Get Turso credentials from environment
const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error('Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN environment variables');
  process.exit(1);
}

console.log('Connecting to Turso database...');
const client = createClient({ url, authToken });

// Check if Goodness Authority site already exists
const existingSiteResult = await client.execute({
  sql: 'SELECT id FROM sites WHERE subdomain = ?',
  args: ['goodness-authority']
});

let siteId;

if (existingSiteResult.rows.length > 0) {
  siteId = existingSiteResult.rows[0].id;
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

  await client.execute({
    sql: `
      INSERT OR REPLACE INTO sites (id, name, domain, subdomain, theme, settings, brand_profile, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      siteId,
      'Goodness Authority - Evidence-Based Wellness',
      'goodnessauthority.com',
      'goodness-authority',
      'wellness',
      JSON.stringify(settings),
      JSON.stringify(brandProfile),
      'published'
    ]
  });

  console.log('Created Goodness Authority site:', siteId);
}

// Update site status to published (whether existing or new)
await client.execute({
  sql: 'UPDATE sites SET status = ? WHERE id = ?',
  args: ['published', siteId]
});

console.log('Updated site status to published');

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

const homepageId = nanoid();
await client.execute({
  sql: `
    INSERT OR REPLACE INTO pages (id, site_id, title, slug, content, template, published)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `,
  args: [
    homepageId,
    siteId,
    'Home',
    'index',
    JSON.stringify(homepageContent),
    'homepage',
    1
  ]
});

console.log('Created homepage for Goodness Authority');

// Create About page for Goodness Authority
const aboutContent = {
  widgets: [
    {
      type: 'hero-story',
      config: {
        image: '/images/about/goodness-authority-mission.jpg',
        category: 'ABOUT US',
        headline: 'Evidence-Based Wellness You Can Trust',
        subheading: 'Our mission is to provide women with science-backed health information that empowers informed decisions about their wellness journey.',
        authorImage: '/images/authors/goodness-authority-team.jpg',
        authorName: 'Goodness Authority Team',
        authorTitle: 'Evidence-Based Research',
        buttonUrl: '/site/goodness-authority/articles',
        buttonText: 'Explore Our Research →',
        rating: '4.9'
      }
    },
    {
      type: 'text-block',
      config: {
        title: 'Our Commitment to Evidence-Based Health',
        content: 'At Goodness Authority, we cut through the noise of conflicting health advice to bring you research-backed insights. Every article is thoroughly researched, fact-checked, and designed to help women over 40 make informed decisions about their health and wellness.'
      }
    }
  ]
};

const aboutPageId = nanoid();
await client.execute({
  sql: `
    INSERT OR REPLACE INTO pages (id, site_id, title, slug, content, template, published)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `,
  args: [
    aboutPageId,
    siteId,
    'About',
    'about',
    JSON.stringify(aboutContent),
    'page',
    1
  ]
});

console.log('Created About page for Goodness Authority');

// Read and import all articles from the goodness-authority directory
const articlesDir = path.join(__dirname, '..', 'content', 'goodness-authority', 'articles');
const articleFiles = fs.readdirSync(articlesDir).filter(file => file.endsWith('.json'));

console.log(`Found ${articleFiles.length} articles to import`);

// First clear existing articles for this site
await client.execute({
  sql: 'DELETE FROM articles WHERE site_id = ?',
  args: [siteId]
});

let importedCount = 0;
for (const filename of articleFiles) {
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

    // Use the correct schema for the articles table
    await client.execute({
      sql: `
        INSERT INTO articles (
          id, site_id, title, excerpt, content, slug, category, image, 
          featured, trending, published, read_time, views, 
          widget_config, tracking_config, published_at, author_name, author_image,
          hero, boosted, display_views, display_likes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        articleId,
        siteId,
        article.title || '',
        article.excerpt || '',
        contentStr,
        article.slug || '',
        article.category || '',
        article.featured_image || article.image || '',
        article.featured ? 1 : 0,
        article.trending ? 1 : 0,
        1, // published
        parseInt(article.reading_time) || parseInt(article.read_time) || 10,
        parseInt(article.views) || Math.floor(Math.random() * 15000) + 5000,
        JSON.stringify(article.widget_config || []),
        JSON.stringify({}), // empty tracking_config
        article.published_date || article.published_at || new Date().toISOString().split('T')[0],
        article.author?.name || article.author_name || 'Goodness Authority Team',
        article.author?.avatar || article.author_image || '/images/authors/goodness-authority-team.jpg',
        article.hero ? 1 : 0,
        article.boosted ? 1 : 0,
        1, // display_views
        1  // display_likes
      ]
    });
    
    importedCount++;
    console.log(`Imported: ${article.title}`);
  } catch (error) {
    console.error(`Error importing ${filename}:`, error.message);
  }
}

console.log(`\nSuccessfully imported ${importedCount} articles to Goodness Authority`);
console.log(`Site ID: ${siteId}`);
console.log('Import complete!');

// Close the client connection
client.close();