import { createClient } from '@libsql/client';

const client = createClient({
  url: 'libsql://kiala-app-db-mccmetternich.aws-us-west-2.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NjQxMjMxMzksImlkIjoiNWIwN2Q5YTItOTgxMi00NWZkLWIwNDQtNWU4OTI3ZjliZDZlIiwicmlkIjoiOTE0MWIyNmMtZTg5My00NTViLTkzOGUtMWRkMzA0N2Q0NTdjIn0.GUnVauEA3pYhuWMLPvHAZmGsb5E-NDbDm6QH0QWkq1NYYNMNp1I1ZFPtCYWiPUUYTW0CZ16-OZQVyUOO99ulAg',
});

async function fixBothIssues() {
  try {
    // Get the article
    const articleResult = await client.execute({
      sql: `SELECT id, widget_config, content FROM articles 
            WHERE slug = 'kiala-gummies-vs-seed-ritual-probiotics-comparison' 
            AND site_id = (SELECT id FROM sites WHERE subdomain = 'goodness-authority')`,
      args: []
    });

    if (articleResult.rows.length === 0) {
      console.log('Article not found');
      return;
    }

    const article = articleResult.rows[0];
    const widgetConfig = JSON.parse(article.widget_config || '[]');
    
    console.log('🔧 Fixing widget and content...');
    
    // 1. Fix widget - revert to working 2-column comparison-table
    const updatedWidgets = widgetConfig.map(widget => {
      if (widget.type === 'three-way-comparison') {
        return {
          type: 'comparison-table',  // Revert to working widget
          id: widget.id,
          config: {
            title: "Seed Daily Synbiotic vs. Kiala Super Greens Gummies",
            subtitle: "See why Kiala delivers better value and comprehensive nutrition",
            leftColumnHeader: "Seed Daily Synbiotic",
            rightColumnHeader: "Kiala Super Greens Gummies",
            rows: [
              {
                feature: "Format",
                standard: "2 Large capsules daily",
                premium: "2 Delicious gummies"
              },
              {
                feature: "Price per Serving",
                standard: "$1.67",
                premium: "$1.33"
              },
              {
                feature: "Probiotic Strains",
                standard: "24 strains, 53.6B CFU",
                premium: "2 clinically-studied strains"
              },
              {
                feature: "Contains Superfoods",
                standard: false,
                premium: "11 organic greens + antioxidants"
              },
              {
                feature: "Additional Nutrients",
                standard: "Probiotics only",
                premium: "Vitamins + minerals + greens"
              },
              {
                feature: "Convenience",
                standard: "Capsules, water needed",
                premium: "Gummies, anytime/anywhere"
              },
              {
                feature: "Taste Experience",
                standard: "No taste (capsule)",
                premium: "Natural berry flavor"
              },
              {
                feature: "Bloating Support",
                standard: "Clinical research",
                premium: "84% report improvement"
              },
              {
                feature: "Value Proposition",
                standard: "Probiotics specialist",
                premium: "Complete gut + nutrition support"
              }
            ],
            showCta: true,
            ctaText: "Try Kiala Gummies Risk-Free →",
            ctaUrl: "https://kialanutrition.com/products/super-greens-gummies",
            ctaSubtext: "45-day money-back guarantee"
          }
        };
      }
      return widget;
    });

    // 2. Fix content - convert Kiala mentions to proper hyperlinks
    let content = article.content;
    
    // Convert standalone "Kiala" mentions to hyperlinks (but preserve existing links)
    content = content.replace(/(?<!href=")(?<!>)Kiala(?![^<]*<\/a>)/g, '[Kiala](https://kialanutrition.com/products/super-greens-gummies)');
    
    // Convert "Kiala Gummies" mentions to hyperlinks
    content = content.replace(/(?<!href=")(?<!>)Kiala Gummies(?![^<]*<\/a>)/g, '[Kiala Gummies](https://kialanutrition.com/products/super-greens-gummies)');
    
    // Convert "Kiala Super Greens" mentions to hyperlinks
    content = content.replace(/(?<!href=")(?<!>)Kiala Super Greens Gummies(?![^<]*<\/a>)/g, '[Kiala Super Greens Gummies](https://kialanutrition.com/products/super-greens-gummies)');

    // Update the article
    await client.execute({
      sql: 'UPDATE articles SET widget_config = ?, content = ? WHERE id = ?',
      args: [JSON.stringify(updatedWidgets), content, article.id]
    });

    console.log('✅ Fixed both issues:');
    console.log('📊 Reverted to working 2-column comparison table');
    console.log('🔗 Converted Kiala mentions to proper hyperlinks');
    console.log('💰 Price comparison: $1.67 vs $1.33');

  } catch (error) {
    console.error('Error fixing issues:', error);
  } finally {
    client.close();
  }
}

fixBothIssues();