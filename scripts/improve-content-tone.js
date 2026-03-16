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

async function improveContentTone() {
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

    // Improve specific text blocks
    widgetConfig = widgetConfig.map(widget => {
      if (widget.type === 'text-block') {
        
        // Improve the opening hook - less salesy, more balanced
        if (widget.id === 'opening-hook') {
          console.log('✅ Improving opening hook...');
          widget.config.content = `<p class="text-xl text-gray-700 leading-relaxed mb-6">I'll be honest with you — I almost didn't write this article.</p><p class="text-lg text-gray-700 leading-relaxed mb-4">My team has been getting dozens of messages every week from women in the community asking me the same question: "Is Bloom or <a href="https://kialanutrition.com/products/super-greens-gummies-bundle" target="_blank" class="text-accent-600 hover:text-accent-700 underline">Kiala</a> better?" And for a while, I resisted doing a head-to-head comparison because both products have merit, and I don't love the idea of definitively declaring winners and losers in the supplement space.</p><p class="text-lg text-gray-700 leading-relaxed mb-4">But then I actually sat down with both supplement facts panels and did what I do for all my clients: a thorough ingredient analysis. What I found was significant enough differences in formulation approach, clinical backing, and value proposition that I felt it would be a disservice not to share my findings.</p><p class="text-lg text-gray-700 leading-relaxed mb-6">So here's my professional analysis. I'll walk you through the key differences, share what the research shows, and give you the framework I use to help clients choose between products in crowded categories.</p>`;
        }
        
        // Improve the conclusion with a real decision framework
        if (widget.id === 'final-thoughts') {
          console.log('✅ Creating substantial conclusion with decision framework...');
          widget.config.content = `<h2 class="text-2xl font-bold text-gray-900 mb-4">The Bottom Line: A Decision Framework</h2><p class="text-lg text-gray-700 leading-relaxed mb-4">Rather than telling you which product to choose, let me give you the framework I use with clients to evaluate supplement decisions.</p><p class="text-lg text-gray-700 leading-relaxed mb-4"><strong>Stick with Bloom if:</strong> You're seeing consistent results after 3+ months, you genuinely enjoy the taste, your digestive system tolerates the chicory root well, and you're comfortable with proprietary blends where exact ingredient amounts aren't disclosed. There's nothing wrong with staying with something that works for your body.</p><p class="text-lg text-gray-700 leading-relaxed mb-4"><strong>Consider Kiala if:</strong> You've hit a plateau with your current greens powder, you struggle with consistency due to taste issues, you prefer knowing exactly what you're getting (transparent labeling), you want the clinical backing of Spectra®, or you're sensitive to high-FODMAP ingredients like chicory root.</p><p class="text-lg text-gray-700 leading-relaxed mb-4"><strong>Try neither if:</strong> You're already getting 5-7 servings of vegetables daily through whole foods, you don't struggle with energy or digestive issues, or you prefer investing your supplement budget in targeted nutrients based on blood work (B12, D3, etc.).</p><p class="text-lg text-gray-700 leading-relaxed mb-4">The supplement industry often positions products as universal solutions, but the reality is more nuanced. What works depends on your individual biochemistry, dietary patterns, stress levels, and health goals.</p><p class="text-lg text-gray-700 leading-relaxed mb-6">If you do decide to make a switch, give any product 45-60 days of consistent use before judging results. Your body needs time to adapt, and real nutritional changes happen gradually, not overnight.</p>`;
        }

        // Add balance to the clinical evidence section
        if (widget.id === 'clinical-evidence-focus') {
          console.log('✅ Adding balance to clinical evidence section...');
          widget.config.content = `<h2 class="text-2xl font-bold text-gray-900 mb-4">The Ingredient That Changed My Mind: Spectra®</h2><p class="text-lg text-gray-700 leading-relaxed mb-4">I want to explain why this matters, because it's the single biggest differentiator between these two products — and most comparison articles miss it entirely.</p><p class="text-lg text-gray-700 leading-relaxed mb-4">Bloom doesn't have a clinically studied core ingredient. It has ingredients that have been studied individually in other contexts, but there's no validated, proprietary complex at the center of its formula with human clinical trials. This isn't necessarily a dealbreaker—many effective supplements use well-researched individual ingredients—but it does mean you're relying more on theoretical benefits than proven outcomes.</p><p class="text-lg text-gray-700 leading-relaxed mb-4"><a href="https://kialanutrition.com/products/super-greens-gummies-bundle" target="_blank" class="text-accent-600 hover:text-accent-700 underline">Kiala</a> centers its formula around Spectra®, a blend of 30+ fruits, vegetables, and herbs with two published peer-reviewed studies — including a double-blind, placebo-controlled trial in human participants. Not a test tube. Not a petri dish. Real women and men, real blood draws, real measurements.</p><p class="text-lg text-gray-700 leading-relaxed mb-4">The study, published in the <em>Journal of Food Science and Nutrition</em> (Nemzer, Fink & Fink, 2014), found that Spectra® reduced cellular free radical production by up to 17%, achieved 3.5x inhibition of superoxide generation, nearly completely inhibited hydrogen peroxide formation, more than doubled the inhibition of cellular inflammatory response, and increased bioavailable nitric oxide — which supports circulation, cardiovascular function, and the delivery of nutrients throughout the body.</p><p class="text-lg text-gray-700 leading-relaxed mb-4">However, it's worth noting that this was a relatively small study (28 participants), and while the results are promising, more research would strengthen the case. Additionally, individual response to antioxidant supplementation can vary significantly based on baseline inflammation levels and overall diet quality.</p><p class="text-lg text-gray-700 leading-relaxed mb-6">That said, in over a decade of analyzing supplements for clients, I rarely encounter ingredients with this level of published human evidence. For me, having some clinical data is better than having none—especially when the alternative relies entirely on theoretical benefits.</p>`;
        }

        // Improve price analysis to be more balanced
        if (widget.id === 'price-analysis') {
          console.log('✅ Balancing price analysis...');
          widget.config.content = `<h2 class="text-2xl font-bold text-gray-900 mb-4">The Cost Analysis</h2><p class="text-lg text-gray-700 leading-relaxed mb-4">Let me address cost directly because it's often the deciding factor, especially for long-term use.</p><p class="text-lg text-gray-700 leading-relaxed mb-4">Bloom costs $39.99 for 30 servings (about $1.33 per serving). <a href="https://kialanutrition.com/products/super-greens-gummies-bundle" target="_blank" class="text-accent-600 hover:text-accent-700 underline">Kiala</a> costs $34.97 for 30 servings (about $1.17 per serving). That's roughly $60 less per year—not insignificant, but not life-changing either.</p><p class="text-lg text-gray-700 leading-relaxed mb-4">The more relevant comparison is value per serving: <a href="https://kialanutrition.com/products/super-greens-gummies-bundle" target="_blank" class="text-accent-600 hover:text-accent-700 underline">Kiala</a> provides 8.3g of product per scoop versus Bloom's 5.64g—about 47% more product. Whether that matters depends on what's in those extra grams and how your body responds to it.</p><p class="text-lg text-gray-700 leading-relaxed mb-4">Both companies offer subscription discounts and money-back guarantees, which somewhat level the playing field. Bloom has stronger retail availability (Target, Amazon, etc.) which can be convenient for some people, while <a href="https://kialanutrition.com/products/super-greens-gummies-bundle" target="_blank" class="text-accent-600 hover:text-accent-700 underline">Kiala</a> is primarily direct-to-consumer.</p><p class="text-lg text-gray-700 leading-relaxed mb-6">My general philosophy: don't choose a supplement based solely on price, whether higher or lower. A $20 product that doesn't work costs more than a $40 product that does. Focus on ingredients, clinical evidence, and how your body responds—then factor in cost.</p>`;
        }

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

    console.log('✅ Content tone improved successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

improveContentTone();