#!/usr/bin/env node

import { createClient } from '@libsql/client';

// Get database URL from environment or use local
const DATABASE_URL = process.env.TURSO_DATABASE_URL || 'file:local.db';

const client = createClient({
  url: DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN || undefined,
});

// WellnessCore site configuration
const wellnessCoreConfig = {
  name: 'WellnessCore',
  subdomain: 'wellnesscore',
  domain: 'wellnesscore.com',
  theme: 'wellness-core',
  theme_colors: {
    primary: '#16a34a',      // Modern green for trust and health
    secondary: '#0369a1',    // Professional blue for authority
    accent: '#dc2626',       // Red for alerts/warnings
    trust: '#059669',        // Emerald for trustworthiness
    background: '#ffffff',   // Clean white
    text: '#111827',         // Near black for readability
  },
  theme_fonts: {
    heading: 'Inter',        // Clean, modern sans-serif
    body: 'Inter',          // Consistent, highly readable
  },
  brand_profile: {
    name: 'WellnessCore',
    tagline: 'Evidence-Based Wellness Content for Modern Women',
    bio: 'WellnessCore is your trusted source for science-backed wellness information. Our editorial team of nutrition experts, researchers, and wellness professionals deliver thoroughly researched content to help women over 45 optimize their health and vitality.',
    logo: '/api/placeholder/200/200',
    profileImage: '/api/placeholder/200/200',
    quote: 'Empowering women with evidence-based wellness solutions that actually work.',
  },
  settings: {
    navigation: [
      { label: 'Home', url: '/', type: 'internal' },
      { label: 'Articles', url: '/articles', type: 'internal' }
    ],
    emailCapture: {
      provider: 'convertkit',
      leadMagnet: {
        title: 'The Complete Gut Health Guide',
        description: 'Evidence-based strategies to optimize your digestive health and reduce bloating',
        image: '/api/placeholder/100/100'
      }
    },
    social: {
      instagram: '',
      facebook: '',
      youtube: ''
    },
    theme: {
      primaryColor: '#16a34a',
      secondaryColor: '#0369a1', 
      accentColor: '#dc2626',
      trustColor: '#059669'
    }
  },
  status: 'published'
};

async function createWellnessCoreSite() {
  try {
    console.log('Creating WellnessCore site...');

    // Check if site already exists
    const existingResult = await client.execute({
      sql: 'SELECT id, name FROM sites WHERE subdomain = ? OR name = ?',
      args: [wellnessCoreConfig.subdomain, wellnessCoreConfig.name]
    });

    if (existingResult.rows.length > 0) {
      const existingSite = existingResult.rows[0];
      console.log(`Found existing site: ${existingSite.name} (ID: ${existingSite.id})`);
      console.log('Updating existing site...');

      // Update existing site
      await client.execute({
        sql: `UPDATE sites SET 
          theme = ?, 
          theme_colors = ?, 
          theme_fonts = ?, 
          settings = ?, 
          brand_profile = ?, 
          status = ?, 
          updated_at = CURRENT_TIMESTAMP
          WHERE id = ?`,
        args: [
          wellnessCoreConfig.theme,
          JSON.stringify(wellnessCoreConfig.theme_colors),
          JSON.stringify(wellnessCoreConfig.theme_fonts),
          JSON.stringify(wellnessCoreConfig.settings),
          JSON.stringify(wellnessCoreConfig.brand_profile),
          wellnessCoreConfig.status,
          existingSite.id
        ]
      });

      console.log('✅ WellnessCore site updated successfully!');
      console.log(`✅ Site ID: ${existingSite.id}`);
      console.log(`✅ URL: /site/${existingSite.id}`);
      
      return existingSite.id;
    } else {
      // Create new site
      const siteId = crypto.randomUUID();
      
      await client.execute({
        sql: `INSERT INTO sites (
          id, name, subdomain, domain, theme, theme_colors, theme_fonts, 
          settings, brand_profile, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        args: [
          siteId,
          wellnessCoreConfig.name,
          wellnessCoreConfig.subdomain,
          wellnessCoreConfig.domain,
          wellnessCoreConfig.theme,
          JSON.stringify(wellnessCoreConfig.theme_colors),
          JSON.stringify(wellnessCoreConfig.theme_fonts),
          JSON.stringify(wellnessCoreConfig.settings),
          JSON.stringify(wellnessCoreConfig.brand_profile),
          wellnessCoreConfig.status
        ]
      });

      console.log('✅ WellnessCore site created successfully!');
      console.log(`✅ Site ID: ${siteId}`);
      console.log(`✅ URL: /site/${siteId}`);
      
      return siteId;
    }
  } catch (error) {
    console.error('❌ Error creating WellnessCore site:', error);
    throw error;
  }
}

// Run the creation
createWellnessCoreSite()
  .then((siteId) => {
    console.log('\n🎉 WellnessCore site setup complete!');
    console.log(`Access your site at: http://localhost:3000/site/${siteId}`);
    console.log(`Admin panel: http://localhost:3000/admin/sites/${siteId}/dashboard`);
  })
  .catch((error) => {
    console.error('Failed to create WellnessCore site:', error);
    process.exit(1);
  });