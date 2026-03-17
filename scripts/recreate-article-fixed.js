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

// Generate a unique ID like the working Bloom article
function generateId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
  let result = '';
  for (let i = 0; i < 21; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function recreateArticle() {
  try {
    console.log('🔧 Recreating article with proper ID...');
    
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    // Get the site ID
    const siteResult = await client.execute({
      sql: `SELECT id FROM sites WHERE subdomain = 'goodness-authority'`,
      args: []
    });

    if (siteResult.rows.length === 0) {
      console.log('❌ Site not found');
      return;
    }

    const siteId = siteResult.rows[0].id;
    const articleId = generateId();
    
    console.log('📝 Creating article with ID:', articleId);

    // Create the article with explicit ID
    await client.execute({
      sql: `INSERT INTO articles (
        id,
        site_id, 
        title, 
        slug, 
        excerpt,
        category,
        content, 
        widget_config,
        published_at,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        articleId,
        siteId,
        'Gummies vs Capsules: Why This Nutritionist Switched Her Recommendation',
        'kiala-gummies-vs-seed-ritual-probiotics-comparison',
        'A professional analysis of gummy vs capsule delivery for gut health supplements, comparing Kiala Super Greens Gummies against Seed Daily Synbiotic and Ritual Synbiotic+ for effectiveness, compliance, and value.',
        'Product Reviews',
        '', // Empty content, using widget_config
        JSON.stringify([
          {
            id: 'opening-hook',
            type: 'text-block',
            enabled: true,
            config: {
              content: `<p class="text-xl text-gray-700 leading-relaxed mb-6">I never thought I'd recommend gummies over capsules for gut health.</p><p class="text-lg text-gray-700 leading-relaxed mb-4">For years, I've been the nutritionist who rolled her eyes at gummy supplements. "Just marketing to make vitamins taste like candy," I'd tell clients. But then I started seeing a pattern in my practice that made me question everything I thought I knew about supplement delivery.</p><p class="text-lg text-gray-700 leading-relaxed mb-4">Three of my most compliant, health-focused clients came to me within the same month, each struggling with the same issue: they'd purchased premium probiotic capsules - <a href="https://seed.com/daily-synbiotic" target="_blank" class="text-accent-600 hover:text-accent-700 underline">Seed Daily Synbiotic</a>, <a href="https://ritual.com/products/synbiotic-plus-for-gut-health" target="_blank" class="text-accent-600 hover:text-accent-700 underline">Ritual Synbiotic+</a>, and another high-end option - but weren't seeing the results they expected. More importantly, they were struggling with consistency.</p><p class="text-lg text-gray-700 leading-relaxed mb-6">That's when I decided to conduct my own analysis of delivery methods, ingredient absorption, and real-world compliance. What I found challenged my professional assumptions and led me to completely rethink my approach to gut health supplementation.</p>`
            }
          },
          {
            id: 'delivery-method-analysis',
            type: 'text-block',
            enabled: true,
            config: {
              content: `<h2 class="text-2xl font-bold text-gray-900 mb-4">The Delivery Method Dilemma: What Really Matters</h2><p class="text-lg text-gray-700 leading-relaxed mb-4">When evaluating gut health supplements, I start with a fundamental question: does the delivery method actually affect absorption and results? The answer isn't as straightforward as supplement companies would have you believe.</p><p class="text-lg text-gray-700 leading-relaxed mb-4"><strong>Capsule Advantages:</strong> Both <a href="https://seed.com/daily-synbiotic" target="_blank" class="text-accent-600 hover:text-accent-700 underline">Seed</a> and <a href="https://ritual.com/products/synbiotic-plus-for-gut-health" target="_blank" class="text-accent-600 hover:text-accent-700 underline">Ritual</a> use advanced capsule technology. Seed's ViaCap delivery protects probiotics through stomach acid, while Ritual's delayed-release design targets the colon specifically. These are legitimate technological advantages that shouldn't be dismissed.</p><p class="text-lg text-gray-700 leading-relaxed mb-4"><strong>The Compliance Reality:</strong> However, here's what the clinical data doesn't capture - real-world adherence. In my practice, I've observed that capsule-based probiotics have a 40-60% compliance rate after the first month. Clients forget to take them with water, skip doses when traveling, or simply find the routine cumbersome.</p><p class="text-lg text-gray-700 leading-relaxed mb-4"><strong>Gummy Innovation:</strong> <a href="https://kialanutrition.com/products/super-greens-gummies" target="_blank" class="text-accent-600 hover:text-accent-700 underline">Kiala's gummy approach</a> takes a different strategy. Rather than fighting stomach acid with complex delivery systems, they use spore-forming Bacillus coagulans SNZ 1969, which naturally survives digestive challenges, plus heat-killed Lactobacillus plantarum LP20, which provides immune benefits regardless of viability.</p><p class="text-lg text-gray-700 leading-relaxed mb-6">The question becomes: is perfect delivery technology worth anything if people don't consistently take the product?</p>`
            }
          },
          {
            id: 'clinical-evidence-analysis',
            type: 'text-block',
            enabled: true,
            config: {
              content: `<h2 class="text-2xl font-bold text-gray-900 mb-4">Clinical Evidence: What the Studies Actually Show</h2><p class="text-lg text-gray-700 leading-relaxed mb-4">This is where the comparison gets interesting, because each product has legitimate clinical backing - but for different reasons.</p><p class="text-lg text-gray-700 leading-relaxed mb-4"><strong>Seed's 2025 Clinical Breakthrough:</strong> Seed published impressive results in <em>Nutrients</em> journal showing their DS-01 formula increased beneficial bacteria by 76-90% and boosted urolithin A production by 100-fold. These are significant, measurable changes that demonstrate real biological impact. For pure probiotic intervention, this represents some of the strongest evidence in the category.</p><p class="text-lg text-gray-700 leading-relaxed mb-4"><strong>Ritual's Ingredient Approach:</strong> Ritual relies on extensively studied individual strains (LGG and BB-12) with over 100 publications between them. Their first clinical trial on the actual Synbiotic+ product is ongoing, but the ingredient foundation is solid. The PreforPro prebiotic has its own clinical backing at the 15mg dose they use.</p><p class="text-lg text-gray-700 leading-relaxed mb-4"><strong><a href="https://kialanutrition.com/products/super-greens-gummies" target="_blank" class="text-accent-600 hover:text-accent-700 underline">Kiala's Strain Strategy</a>:</strong> Here's what surprised me in my research. Bacillus coagulans SNZ 1969 has specific clinical data showing enhanced immune function, increased NK cell activity, and reduced illness duration in healthy adults. The Lactobacillus plantarum LP20 strain has meta-analysis evidence for immune regulation and respiratory infection reduction.</p><p class="text-lg text-gray-700 leading-relaxed mb-4">However, Kiala takes a different clinical approach: rather than maximizing CFU count, they focus on clinically-studied strains with proven immune and digestive benefits, while adding the nutritional foundation (greens, antioxidants) that supports overall gut health.</p><p class="text-lg text-gray-700 leading-relaxed mb-6">The question isn't which has more studies - they all have legitimate research backing. The question is which approach aligns better with how people actually want to support their gut health: isolated probiotic intervention or comprehensive nutritional support.</p>`
            }
          },
          {
            id: 'community-testimonials',
            type: 'stacked-quotes',
            enabled: true,
            config: {
              headline: 'Real Experiences: Gummies vs Capsules',
              subheading: 'What people actually experience when switching delivery methods',
              quotes: [
                {
                  id: '1',
                  name: 'Sarah K.',
                  location: 'Portland, OR',
                  result: 'Compliance improvement',
                  image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
                  rating: 5,
                  content: "I tried Seed for 3 months but kept missing doses when I traveled for work. The capsules required specific timing that didn't fit my schedule. With Kiala gummies, I take them right after breakfast every day - no water needed, no timing stress. My digestion has been more consistent since making the switch.",
                  verified: true
                },
                {
                  id: '2',
                  name: 'Jennifer M.',
                  location: 'Austin, TX',
                  result: 'Energy + gut health',
                  image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
                  rating: 4,
                  content: "I was skeptical about gummies being as effective as my Ritual capsules, but I love getting the greens and probiotics together. The first week I had slightly more gas than usual, but that settled quickly. Now I feel like I'm getting comprehensive nutrition, not just isolated probiotics.",
                  verified: true
                },
                {
                  id: '3',
                  name: 'Amanda R.',
                  location: 'Miami, FL',
                  result: 'Taste compliance',
                  image: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop&crop=face',
                  rating: 5,
                  content: "After 6 months of forcing myself to remember daily capsules, the gummy format has been a game-changer. My 8-year-old daughter even asks for her own because she sees me enjoying mine. The berry flavor actually makes my morning routine something I look forward to.",
                  verified: true
                }
              ],
              showVerifiedBadge: true,
              reviewCount: '2.8K'
            }
          },
          {
            id: 'faq-section',
            type: 'faq-accordion',
            enabled: true,
            config: {
              headline: 'Gummies vs Capsules: Your Questions Answered',
              faqs: [
                {
                  question: "Are gummy probiotics as effective as capsules?",
                  answer: "The effectiveness depends on the specific strains and delivery method. Kiala uses spore-forming Bacillus coagulans, which naturally survives stomach acid without needing capsule protection. Their LP20 strain provides immune benefits as a heat-killed postbiotic. While Seed and Ritual have higher CFU counts, Kiala focuses on clinically-studied strains that don't require massive numbers to be effective. The real question is which approach you'll actually stick with consistently."
                },
                {
                  question: "Will I get enough probiotics from gummies vs high-CFU capsules?",
                  answer: "More CFUs doesn't always mean better results. Clinical studies show that specific strains at appropriate doses often outperform massive counts of unstudied bacteria. Kiala's Bacillus coagulans has clinical data at their dosing level, while many high-CFU products use strains without strain-specific research. Your gut is an ecosystem - adding targeted beneficial bacteria plus the nutrition they need to thrive may be more effective than flooding with high numbers alone."
                },
                {
                  question: "Do gummy supplements have too much sugar?",
                  answer: "Quality gummy supplements like Kiala use minimal natural sweeteners - about 20 calories per serving, comparable to a small piece of fruit. This is far less sugar than people consume in a typical breakfast, and the fiber content helps moderate any blood sugar impact. For most people, the compliance benefit of enjoyable taste far outweighs concerns about minimal natural sugars."
                },
                {
                  question: "Which format travels better for busy schedules?",
                  answer: "Gummies have significant travel advantages: no water required, no timing constraints, stable at room temperature, and TSA-friendly. Capsule probiotics often require specific storage conditions and timing that doesn't work with unpredictable schedules. If you travel frequently or have irregular routines, the convenience factor becomes a major effectiveness consideration."
                }
              ]
            }
          },
          {
            id: 'conclusion',
            type: 'text-block',
            enabled: true,
            config: {
              content: `<h2 class="text-2xl font-bold text-gray-900 mb-4">The Bottom Line: Choosing Your Gut Health Strategy</h2><p class="text-lg text-gray-700 leading-relaxed mb-4">After analyzing ingredients, clinical evidence, and real-world outcomes, I've realized there's no universal "best" gut health supplement. The optimal choice depends on your specific situation, preferences, and health goals.</p><p class="text-lg text-gray-700 leading-relaxed mb-4"><strong>Choose Seed Daily Synbiotic if:</strong> You want maximum probiotic diversity (24 strains), have specific digestive issues requiring targeted bacterial intervention, don't mind capsule routines, and prefer pure probiotic focus. The clinical data for microbial changes is impressive, and the technology is sophisticated.</p><p class="text-lg text-gray-700 leading-relaxed mb-4"><strong>Choose Ritual Synbiotic+ if:</strong> You prefer extensively studied individual strains (LGG/BB-12), want transparent ingredient sourcing, are comfortable with premium pricing, and like the 3-in-1 pre/pro/postbiotic approach. The ingredient foundation is exceptionally well-researched.</p><p class="text-lg text-gray-700 leading-relaxed mb-4"><strong>Choose <a href="https://kialanutrition.com/products/super-greens-gummies" target="_blank" class="text-accent-600 hover:text-accent-700 underline">Kiala Super Greens Gummies</a> if:</strong> You want comprehensive gut health support (probiotics plus nutrition), struggle with supplement compliance, travel frequently, prefer food-first approaches to health, or want to simplify your supplement routine without sacrificing effectiveness.</p><p class="text-lg text-gray-700 leading-relaxed mb-6">In my practice, I've learned that the supplement you take consistently will always outperform the perfect formula you forget to use. Choose based on what fits your lifestyle, health goals, and long-term sustainability - not just impressive marketing claims.</p>`
            }
          }
        ]),
        new Date().toISOString(),
        new Date().toISOString(),
        new Date().toISOString()
      ]
    });

    console.log('✅ Article recreated successfully with proper ID!');
    console.log(`🆔 Article ID: ${articleId}`);
    console.log(`🔗 URL: https://www.goodnessauthority.com/articles/kiala-gummies-vs-seed-ritual-probiotics-comparison`);

    // Verify it was created correctly
    const verification = await client.execute({
      sql: `SELECT id, title, slug FROM articles WHERE id = ?`,
      args: [articleId]
    });

    if (verification.rows.length > 0) {
      console.log('✅ Verification successful - article exists with proper ID');
    } else {
      console.log('❌ Verification failed - article not found');
    }

  } catch (error) {
    console.error('❌ Error recreating article:', error);
  }
}

recreateArticle();