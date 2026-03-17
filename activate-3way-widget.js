import { createClient } from '@libsql/client';

const client = createClient({
  url: 'libsql://kiala-app-db-mccmetternich.aws-us-west-2.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NjQxMjMxMzksImlkIjoiNWIwN2Q5YTItOTgxMi00NWZkLWIwNDQtNWU4OTI3ZjliZDZlIiwicmlkIjoiOTE0MWIyNmMtZTg5My00NTViLTkzOGUtMWRkMzA0N2Q0NTdjIn0.GUnVauEA3pYhuWMLPvHAZmGsb5E-NDbDm6QH0QWkq1NYYNMNp1I1ZFPtCYWiPUUYTW0CZ16-OZQVyUOO99ulAg',
});

async function activateThreeWayWidget() {
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
    
    // Convert comparison-table to three-way-comparison with proper 3-column data
    const updatedWidgets = widgetConfig.map(widget => {
      if (widget.type === 'comparison-table') {
        return {
          type: 'three-way-comparison',  // Change widget type
          id: widget.id,
          config: {
            title: "Gummies vs. Capsules: Complete Comparison",
            subtitle: "See why Kiala Gummies outperform both leading probiotic capsules",
            products: [
              {
                name: "Seed Daily Synbiotic",
                price: "$1.67",
                image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop"
              },
              {
                name: "Ritual Synbiotic+", 
                price: "$1.00+",
                image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop"
              },
              {
                name: "Kiala Super Greens Gummies",
                price: "$1.33",
                image: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=300&h=300&fit=crop"
              }
            ],
            features: [
              {
                name: "Format",
                values: ["2 Large capsules", "1 Capsule", "2 Delicious gummies"],
                winner: 2
              },
              {
                name: "Price per Serving", 
                values: ["$1.67", "$1.00+", "$1.33"],
                winner: 2
              },
              {
                name: "Contains Greens",
                values: [false, false, "11 Organic superfoods"],
                winner: 2
              },
              {
                name: "Probiotic Strains",
                values: ["24 strains", "2 strains", "2 clinically-studied"],
                winner: 0
              },
              {
                name: "Antioxidants",
                values: [false, false, "Elderberry, cranberry, turmeric"],
                winner: 2
              },
              {
                name: "Additional Vitamins",
                values: [false, false, "Multivitamin support"],
                winner: 2
              },
              {
                name: "Convenience",
                values: ["Water required", "Water required", "Anytime, anywhere"],
                winner: 2
              },
              {
                name: "Taste",
                values: ["No taste", "No taste", "Natural berry flavor"],
                winner: 2
              },
              {
                name: "Bloating Support",
                values: ["Clinical studies", "Occasional support", "84% report improvement"],
                winner: 2
              }
            ],
            showCta: true,
            ctaText: "Try Kiala Gummies Risk-Free →",
            ctaUrl: "https://kialanutrition.com/products/super-greens-gummies",
            ctaSubtext: "45-day money-back guarantee",
            winnerIndex: 2
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

    console.log('✅ Activated 3-way comparison widget!');
    console.log('📊 Shows: Seed vs. Ritual vs. Kiala');
    console.log('🏆 Winner: Kiala (index 2)');
    console.log('💰 Prices: $1.67 vs $1.00+ vs $1.33');

  } catch (error) {
    console.error('Error activating 3-way widget:', error);
  } finally {
    client.close();
  }
}

activateThreeWayWidget();