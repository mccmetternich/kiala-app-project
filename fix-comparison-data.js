import { createClient } from '@libsql/client';

const client = createClient({
  url: 'libsql://kiala-app-db-mccmetternich.aws-us-west-2.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NjQxMjMxMzksImlkIjoiNWIwN2Q5YTItOTgxMi00NWZkLWIwNDQtNWU4OTI3ZjliZDZlIiwicmlkIjoiOTE0MWIyNmMtZTg5My00NTViLTkzOGUtMWRkMzA0N2Q0NTdjIn0.GUnVauEA3pYhuWMLPvHAZmGsb5E-NDbDm6QH0QWkq1NYYNMNp1I1ZFPtCYWiPUUYTW0CZ16-OZQVyUOO99ulAg',
});

async function fixComparisonData() {
  try {
    // Get the article
    const articleResult = await client.execute({
      sql: `SELECT id, widget_config FROM articles 
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
    
    // Fix the comparison table widget
    const updatedWidgets = widgetConfig.map(widget => {
      if (widget.type === 'comparison-table') {
        return {
          ...widget,
          props: {
            ...widget.props,
            // Fix the title to match 2-column format
            title: "Seed Daily Synbiotic vs. Kiala Gummies: Head-to-Head Comparison",
            subtitle: "See why Kiala Gummies delivers better value and comprehensive nutrition",
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
                feature: "Prebiotics Included",
                standard: true,
                premium: true
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
            ctaSubtext: "45-day money-back guarantee • Free shipping"
          }
        };
      }
      return widget;
    });

    // Update the article
    await client.execute({
      sql: 'UPDATE articles SET widget_config = ? WHERE id = ?',
      args: [JSON.stringify(updatedWidgets), article.id]
    });

    console.log('✅ Fixed comparison table to proper 2-column format');
    console.log('📊 Title: "Seed Daily Synbiotic vs. Kiala Gummies"');
    console.log('💰 Price comparison: $1.67 vs $1.33');
    console.log('🌱 Value prop: Probiotics only vs Complete nutrition');

  } catch (error) {
    console.error('Error fixing comparison data:', error);
  } finally {
    client.close();
  }
}

fixComparisonData();