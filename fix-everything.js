import { createClient } from '@libsql/client';

// Try the working database connection
const client = createClient({
  url: 'libsql://kiala-app-db-mccmetternich.aws-us-west-2.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NjQxMjMxMzksImlkIjoiNWIwN2Q5YTItOTgxMi00NWZkLWIwNDQtNWU4OTI3ZjliZDZlIiwicmlkIjoiOTE0MWIyNmMtZTg5My00NTViLTkzOGUtMWRkMzA0N2Q0NTdjIn0.GUnVauEA3pYhuWMLPvHAZmGsb5E-NDbDm6QH0QWkq1NYYNMNp1I1ZFPtCYWiPUUYTW0CZ16-OZQVyUOO99ulAg',
});

async function fixEverything() {
  try {
    console.log('🔧 Fixing all issues...\n');

    // 1. First check if we can connect
    const testResult = await client.execute('SELECT 1 as test');
    console.log('✅ Database connection successful');

    // 2. Get the article
    const articleResult = await client.execute({
      sql: `SELECT id, title, slug, widget_config, content FROM articles 
            WHERE slug = 'kiala-gummies-vs-seed-ritual-probiotics-comparison' 
            AND site_id = (SELECT id FROM sites WHERE subdomain = 'goodness-authority')`,
      args: []
    });

    if (articleResult.rows.length === 0) {
      console.log('❌ Article not found in this database');
      
      // Try to find all articles to see what's available
      const allArticles = await client.execute({
        sql: `SELECT slug, title FROM articles WHERE site_id = (SELECT id FROM sites WHERE subdomain = 'goodness-authority') LIMIT 10`,
        args: []
      });
      
      console.log('\n📋 Available articles:');
      allArticles.rows.forEach(row => {
        console.log(`   - ${row.slug}`);
      });
      return;
    }

    const article = articleResult.rows[0];
    console.log(`✅ Found article: "${article.title}"`);

    // 3. Fix the widget configuration
    const widgetConfig = JSON.parse(article.widget_config || '[]');
    console.log(`📊 Current widgets: ${widgetConfig.length}`);

    const updatedWidgets = widgetConfig.map(widget => {
      if (widget.type === 'three-way-comparison') {
        console.log('🔧 Updating three-way-comparison widget...');
        return {
          type: 'three-way-comparison',
          id: widget.id,
          config: {
            title: "Gummies vs. Capsules: 3-Way Comparison",
            subtitle: "See why Kiala Gummies outperform both leading probiotic capsules",
            kialaHeader: "Kiala Super Greens Gummies",
            seedHeader: "Seed Daily Synbiotic", 
            ritualHeader: "Ritual Synbiotic+",
            rows: [
              {
                feature: "Format",
                kiala: "2 Delicious gummies",
                seed: "2 Large capsules",
                ritual: "1 Capsule"
              },
              {
                feature: "Price per Serving",
                kiala: "$1.33",
                seed: "$1.67", 
                ritual: "$1.00+"
              },
              {
                feature: "Contains Superfoods",
                kiala: "11 organic greens + antioxidants",
                seed: false,
                ritual: false
              },
              {
                feature: "Probiotic Strains",
                kiala: "2 clinically-studied strains",
                seed: "24 strains, 53.6B CFU",
                ritual: "2 strains (LGG, BB-12)"
              },
              {
                feature: "Additional Vitamins",
                kiala: "Multivitamin support",
                seed: false,
                ritual: false
              },
              {
                feature: "Convenience",
                kiala: "Anytime, anywhere",
                seed: "Water required",
                ritual: "Water required"
              },
              {
                feature: "Taste Experience", 
                kiala: "Natural berry flavor",
                seed: "No taste",
                ritual: "No taste"
              },
              {
                feature: "Bloating Support",
                kiala: "84% report improvement",
                seed: "Clinical studies",
                ritual: "Occasional support"
              },
              {
                feature: "Overall Value",
                kiala: "Complete gut + nutrition",
                seed: "Probiotics specialist", 
                ritual: "Basic probiotic support"
              }
            ],
            showCta: true,
            ctaText: "Try Kiala Gummies Risk-Free →",
            ctaUrl: "https://kialanutrition.com/products/super-greens-gummies",
            ctaSubtext: "45-day money-back guarantee",
            ctaType: "external",
            target: "_self"
          }
        };
      }
      return widget;
    });

    // 4. Fix content - convert Kiala mentions to proper hyperlinks
    let content = article.content || '';
    console.log('🔗 Converting Kiala mentions to hyperlinks...');
    
    if (content) {
      // Convert standalone "Kiala" mentions to hyperlinks (preserve existing links)
      content = content.replace(/(?<!href=")(?<!\[)(?<!>)Kiala(?!\]|\([^\)]*\))(?![^<]*<\/a>)/g, '[Kiala](https://kialanutrition.com/products/super-greens-gummies)');
      
      // Convert "Kiala Gummies" mentions to hyperlinks
      content = content.replace(/(?<!href=")(?<!\[)(?<!>)Kiala Gummies(?!\]|\([^\)]*\))(?![^<]*<\/a>)/g, '[Kiala Gummies](https://kialanutrition.com/products/super-greens-gummies)');
      
      // Convert "Kiala Super Greens Gummies" mentions to hyperlinks
      content = content.replace(/(?<!href=")(?<!\[)(?<!>)Kiala Super Greens Gummies(?!\]|\([^\)]*\))(?![^<]*<\/a>)/g, '[Kiala Super Greens Gummies](https://kialanutrition.com/products/super-greens-gummies)');
    }

    // 5. Update the article
    await client.execute({
      sql: 'UPDATE articles SET widget_config = ?, content = ? WHERE id = ?',
      args: [JSON.stringify(updatedWidgets), content, article.id]
    });

    console.log('\n✅ ALL FIXES COMPLETED:');
    console.log('📊 3-way comparison widget updated with proper data structure');
    console.log('🔗 Kiala mentions converted to hyperlinks');
    console.log('💰 Pricing: $1.33 vs $1.67 vs $1.00+');
    console.log('🏆 Kiala highlighted as winner in first column');

  } catch (error) {
    console.error('❌ Error fixing issues:', error);
  } finally {
    client.close();
  }
}

fixEverything();