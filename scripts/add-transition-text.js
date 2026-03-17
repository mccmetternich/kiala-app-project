const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');

// Load environment variables
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

async function addTransitionText() {
  try {
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    // Get the current article
    const result = await client.execute({
      sql: 'SELECT widget_config FROM articles WHERE slug = ?',
      args: ['kiala-gummies-vs-seed-ritual-probiotics-comparison']
    });

    if (result.rows.length === 0) {
      console.log('Article not found');
      return;
    }

    const widgets = JSON.parse(result.rows[0].widget_config);
    
    // Find the comparison widget position and add transition text
    const comparisonIndex = widgets.findIndex(w => w.type === 'three-way-comparison');
    
    if (comparisonIndex !== -1) {
      // Add intro text before comparison
      const introWidget = {
        id: 'comparison-intro',
        type: 'text-block',
        enabled: true,
        config: {
          content: '<p class="text-lg text-gray-700 leading-relaxed mb-4">Based on my analysis of the clinical evidence, pricing, and real-world factors, here\'s how these three approaches stack up across the metrics that matter most for women seeking digestive health solutions:</p>'
        }
      };
      
      // Add conclusion text after comparison
      const conclusionWidget = {
        id: 'comparison-conclusion',
        type: 'text-block',
        enabled: true,
        config: {
          content: '<p class="text-lg text-gray-700 leading-relaxed mb-6"><em>*Effective daily cost accounts for real-world adherence rates from clinical studies. When people don\'t consistently take their supplements, the cost per actual benefit increases significantly.</em></p><p class="text-lg text-gray-700 leading-relaxed mb-6">The data reveals that while all three products have scientific merit, the practical advantages of gummy delivery—combined with comprehensive nutritional support and superior cost-effectiveness—create a compelling case for why I\'ve shifted my professional recommendation.</p><p class="text-lg text-gray-700 leading-relaxed mb-4">But beyond the numbers and studies, what really matters is how real women experience these products in their daily lives. Here\'s what I\'ve observed:</p>'
        }
      };
      
      // Insert intro before comparison
      widgets.splice(comparisonIndex, 0, introWidget);
      
      // Insert conclusion after comparison (accounting for the intro we just added)
      widgets.splice(comparisonIndex + 2, 0, conclusionWidget);
      
      console.log('Added transition text around comparison table');
    }
    
    // Update the article with new widget config
    await client.execute({
      sql: 'UPDATE articles SET widget_config = ?, updated_at = ? WHERE slug = ?',
      args: [
        JSON.stringify(widgets), 
        new Date().toISOString(),
        'kiala-gummies-vs-seed-ritual-probiotics-comparison'
      ]
    });
    
    console.log('✅ Added smooth transitions around comparison table');
    console.log('📝 Flow now: Analysis intro → Comparison table → Cost explanation → Real-world transition → Testimonials');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

addTransitionText();