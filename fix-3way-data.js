import { createClient } from '@libsql/client';

const client = createClient({
  url: 'libsql://kiala-app-db-mccmetternich.aws-us-west-2.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NjQxMjMxMzksImlkIjoiNWIwN2Q5YTItOTgxMi00NWZkLWIwNDQtNWU4OTI3ZjliZDZlIiwicmlkIjoiOTE0MWIyNmMtZTg5My00NTViLTkzOGUtMWRkMzA0N2Q0NTdjIn0.GUnVauEA3pYhuWMLPvHAZmGsb5E-NDbDm6QH0QVyUOO99ulAg',
});

async function fix3WayData() {
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
    
    // Fix the three-way-comparison widget data to match widget interface
    const updatedWidgets = widgetConfig.map(widget => {
      if (widget.type === 'three-way-comparison') {
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

    // Update the article
    await client.execute({
      sql: 'UPDATE articles SET widget_config = ? WHERE id = ?',
      args: [JSON.stringify(updatedWidgets), article.id]
    });

    console.log('✅ Fixed 3-way comparison data structure!');
    console.log('📊 Proper widget interface with rows: kiala, seed, ritual');
    console.log('💰 Pricing: $1.33 vs $1.67 vs $1.00+');
    console.log('🏆 Kiala highlighted as winner in first column');

  } catch (error) {
    console.error('Error fixing 3-way data:', error);
  } finally {
    client.close();
  }
}

fix3WayData();