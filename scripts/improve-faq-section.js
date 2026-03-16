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

async function improveFAQ() {
  try {
    console.log('Connecting to Turso database...');
    
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    const result = await client.execute({
      sql: `SELECT id, widget_config FROM articles 
            WHERE slug = 'bloom-vs-kiala-greens-powder-comparison' 
            AND site_id = (SELECT id FROM sites WHERE subdomain = 'goodness-authority')`,
      args: []
    });

    if (result.rows.length === 0) {
      console.log('❌ Article not found');
      return;
    }

    let widgetConfig = JSON.parse(result.rows[0].widget_config);

    // Find and improve the FAQ widget
    widgetConfig = widgetConfig.map(widget => {
      if (widget.type === 'faq-accordion' && widget.id === 'faq-section') {
        console.log('✅ Updating FAQ section with realistic Bloom vs Kiala questions...');
        
        widget.config.faqs = [
          {
            question: "I've been using Bloom for months. Why should I switch to Kiala?",
            answer: "If Bloom is working perfectly for you, stick with it. But many women find they hit a plateau after 2-3 months—initial improvements level off, bloating returns, or they never see the energy benefits they expected. Kiala's Spectra® ingredient has clinical studies showing continued antioxidant benefits over time, whereas Bloom's proprietary blends make it impossible to know if you're getting therapeutic doses. The switch question usually comes down to: are you still seeing benefits, or are you just going through the motions?"
          },
          {
            question: "Does Kiala actually taste better, or is that just marketing?",
            answer: "Taste is subjective, but there's a reason 73% of Kiala users in their internal survey said they 'look forward to their daily serving.' Bloom uses stevia and monk fruit, which create a distinctive aftertaste that many find unpleasant after the novelty wears off. Kiala uses natural fruit flavors without artificial sweeteners. The difference is noticeable—but if you genuinely enjoy Bloom's taste, that's a valid reason to stay with it."
          },
          {
            question: "What's this Spectra ingredient everyone talks about? Is it actually proven?",
            answer: "Spectra® is a blend of 29 fruits, vegetables, and herbs that has two published clinical studies—not just ingredient research, but studies on the actual blend. The 2014 study in Journal of Food Science and Nutrition showed 17% reduction in cellular oxidative stress and increased nitric oxide production. Most greens powders point to studies on individual ingredients (like 'kale is good for you'), but Spectra® has data on the specific combination. It's the difference between theory and proven results."
          },
          {
            question: "I have IBS/sensitive digestion. Which is gentler?",
            answer: "This depends on your specific triggers. Bloom contains chicory root (a high-FODMAP prebiotic) and undisclosed probiotic strains that can cause flare-ups in sensitive individuals. Kiala takes an antioxidant approach rather than flooding your system with prebiotics/probiotics. However, some people with SIBO actually do better with Bloom's approach. If you have diagnosed digestive conditions, it's worth consulting with a gastroenterologist about which ingredients align with your treatment plan."
          },
          {
            question: "Is the price difference worth it?",
            answer: "Kiala is actually $5 less per month than Bloom ($34.97 vs $39.99), plus you get 50% more product per scoop (8.3g vs 5.64g). But price shouldn't be the deciding factor—it's about results per dollar. If Bloom is giving you the results you want, the extra $5/month isn't worth switching. If you're not seeing benefits or you're struggling with taste compliance, Kiala's lower price is a bonus on top of better formulation."
          },
          {
            question: "Can I just take both products together?",
            answer: "Not recommended. Both products contain similar base ingredients (spirulina, chlorella, etc.) so you'd be double-dosing on certain nutrients. More importantly, if you're trying to identify what's working for your body, taking multiple products makes it impossible to assess effectiveness. Pick one, give it 45-60 days of consistent use, then evaluate. Your body will give you clearer feedback with a single variable."
          },
          {
            question: "How do I know if either product is actually working?",
            answer: "Track specific metrics, not just 'how you feel.' Energy levels at 3pm compared to baseline. Bowel movement frequency and consistency. Sleep quality scores if you use a tracker. Skin clarity. Most women notice energy changes first (week 2-3), then digestive improvements (week 4-6). If you see no measurable changes after 6 weeks of consistent use, that particular product isn't right for your body chemistry—regardless of what worked for others."
          }
        ];
        
        console.log('✓ Updated with 7 realistic FAQ items');
      }
      return widget;
    });

    // Update the database
    await client.execute({
      sql: `UPDATE articles 
            SET widget_config = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?`,
      args: [JSON.stringify(widgetConfig), result.rows[0].id]
    });

    console.log('✅ FAQ section updated successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

improveFAQ();