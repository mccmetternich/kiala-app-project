import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function updateComparisonTable() {
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
    
    console.log('Current widgets:', widgetConfig.length);

    // Find and update the comparison table widget
    const updatedWidgets = widgetConfig.map(widget => {
      if (widget.type === 'comparison-table') {
        return {
          ...widget,
          props: {
            ...widget.props,
            title: "Kiala Gummies vs. Seed vs. Ritual: Side-by-Side Comparison",
            subtitle: "See how Kiala Gummies delivers more comprehensive gut health support",
            leftColumnHeader: "Seed DS-01",
            rightColumnHeader: "Kiala Gummies",
            rows: [
              {
                feature: "Serving Format",
                standard: "2 Capsules",
                premium: "2 Tasty Gummies"
              },
              {
                feature: "Price per Serving",
                standard: "$1.67",
                premium: "$1.33"
              },
              {
                feature: "Probiotic Count",
                standard: "53.6B CFU (24 strains)",
                premium: "Clinically-studied strains"
              },
              {
                feature: "Contains Greens",
                standard: false,
                premium: "11 Organic Superfoods"
              },
              {
                feature: "Prebiotics",
                standard: true,
                premium: true
              },
              {
                feature: "Antioxidant Support",
                standard: false,
                premium: "Elderberry, Cranberry, Turmeric"
              },
              {
                feature: "Taste Experience",
                standard: "Capsule (no taste)",
                premium: "Delicious natural flavor"
              },
              {
                feature: "Additional Nutrients",
                standard: false,
                premium: "Multivitamin support"
              },
              {
                feature: "Bloating Relief",
                standard: "Clinical studies",
                premium: "84% report less bloating"
              },
              {
                feature: "Made in USA",
                standard: true,
                premium: true
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

    // Update the article
    await client.execute({
      sql: 'UPDATE articles SET widget_config = ? WHERE id = ?',
      args: [JSON.stringify(updatedWidgets), article.id]
    });

    console.log('✅ Updated comparison table with Kiala vs Seed competitive advantages');
    console.log('📊 Added 10 key comparison points highlighting Kiala advantages');

  } catch (error) {
    console.error('Error updating comparison table:', error);
  } finally {
    client.close();
  }
}

updateComparisonTable();