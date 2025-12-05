import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env file manually
const envPath = join(dirname(fileURLToPath(import.meta.url)), '../.env');
const envContent = readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    let value = valueParts.join('=').trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key.trim()] = value;
  }
});

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const ARTICLE_ID = 's46BRDv72F2SeqT-ruHby';

async function updateArticle() {
  // Fetch current article
  const result = await client.execute({
    sql: 'SELECT widget_config FROM articles WHERE id = ?',
    args: [ARTICLE_ID]
  });

  if (!result.rows[0]) {
    console.error('Article not found');
    return;
  }

  let widgets = JSON.parse(result.rows[0].widget_config);

  // ============================================
  // 1. ADD TESTIMONIAL-HERO AFTER timeline-reaction (before breaking-cycle)
  // ============================================
  const newTestimonialHero = {
    id: 'resolution-failure-hero',
    type: 'testimonial-hero-no-cta',
    position: 15.5, // Between timeline-reaction (15) and breaking-cycle (16)
    enabled: true,
    config: {
      headline: '"I Was Exactly the Woman Dr. Amy Described"',
      body: `"Reading that timeline? I could have written it myself. Every January, same story.

2023: Keto. Made it 6 weeks before the brain fog got unbearable.
2024: Intermittent fasting. Lasted until my energy crashed at 2pm every day.

I'd researched everything. Tried everything. And blamed myself for everything.

Then my sister sent me one of Dr. Amy's articles about the gut-hormone connection. For the first time, someone explained WHY my body was fighting me—not just telling me to try harder.

I started the protocol in September. Nothing dramatic at first. But by week 3, I noticed I wasn't craving sugar after dinner. By week 6, I was waking up before my alarm. By 90 days, I'd lost 19 pounds—not from willpower, but because my body finally stopped working against me.

The difference wasn't discipline. It was understanding that after 45, you can't out-willpower your biology. You have to work WITH it."

— Deborah M., 54, Denver CO`,
      image: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&h=400&fit=crop&crop=face',
      name: 'Deborah M.',
      age: '54',
      location: 'Denver, CO',
      rating: 5
    }
  };

  // Add the testimonial hero widget
  widgets.push(newTestimonialHero);
  console.log('✓ Added testimonial-hero after timeline-reaction (resolution-failure-hero)');

  // ============================================
  // 2. ADD COPY BETWEEN product-reveal AND ingredients
  // ============================================
  const ingredientsIntro = {
    id: 'ingredients-intro',
    type: 'text-block',
    position: 16.7, // Between product-reveal (16.5) and ingredients-grid (17)
    enabled: true,
    config: {
      content: `<h3 class="text-2xl font-bold text-gray-900 mb-4 text-center">Alright, But What's Actually In It?</h3>
<p class="text-lg text-gray-700 leading-relaxed mb-4 text-center">And more importantly—<strong>why does it matter for women over 40?</strong></p>
<p class="text-lg text-gray-700 leading-relaxed mb-6">After vetting dozens of formulas, this is the first one I found that actually addresses the gut-hormone connection with <strong>clinically-studied ingredients at effective doses</strong>. Not pixie-dusted marketing claims. Real science.</p>
<p class="text-lg text-gray-700 leading-relaxed">Here are the key players in the formula—and why each one matters for your foundation:</p>`
    }
  };
  widgets.push(ingredientsIntro);
  console.log('✓ Added ingredients introduction copy');

  // ============================================
  // 3. UPDATE ingredients-grid WITH +XX ADDITIONAL FEATURE
  // ============================================
  const ingredientsGrid = widgets.find(w => w.id === 'ingredients-grid');
  if (ingredientsGrid) {
    ingredientsGrid.config = {
      ...ingredientsGrid.config,
      style: 'simple',
      columns: 2,
      showAdditional: true,
      additionalCount: 20,
      additionalText: 'gut-healing, hormone-supporting superfoods in every scoop',
      ingredients: [
        {
          name: 'Spectra®',
          description: 'The only antioxidant blend with published human clinical trials—not just lab studies. Shown to reduce oxidative stress markers by up to 40%.',
          image: ''
        },
        {
          name: 'Organic Spirulina + Chlorella',
          description: 'Supports beneficial gut bacteria diversity—the microbiome foundation your estrobolome needs to properly metabolize hormones.',
          image: ''
        },
        {
          name: 'Ashwagandha KSM-66®',
          description: 'Clinically shown to reduce cortisol by 27.9%. Lower cortisol = better sleep, less belly fat storage, more balanced hormones.',
          image: ''
        },
        {
          name: 'Prebiotic Fiber Blend',
          description: 'Feeds the good bacteria that help regulate estrogen. A healthy gut means hormones get processed properly—not recirculated.',
          image: ''
        },
        {
          name: 'Digestive Enzyme Complex',
          description: 'Ensures you actually absorb what you eat. After 40, enzyme production drops—this supports optimal nutrient uptake.',
          image: ''
        },
        {
          name: 'Adaptogen Stack',
          description: 'Maca, rhodiola, and ginger root work together to support your stress response—crucial for hormonal balance.',
          image: ''
        }
      ]
    };
    console.log('✓ Updated ingredients-grid with +20 additional callout');
  }

  // ============================================
  // 4. ADD PROTOCOL SECTION AFTER INGREDIENTS
  // ============================================
  const protocolSection = {
    id: 'protocol-section',
    type: 'text-block',
    position: 17.5, // Between ingredients-grid (17) and ingredients-reaction (18)
    enabled: true,
    config: {
      content: `<h3 class="text-2xl font-bold text-gray-900 mb-4 text-center">But How Do You Take It?</h3>
<p class="text-lg text-gray-700 leading-relaxed mb-4 text-center">What's the protocol? <strong>It's incredibly simple.</strong></p>
<p class="text-lg text-gray-700 leading-relaxed mb-6 text-center">One scoop. Mixed with water or your morning smoothie. That's it.</p>

<div class="bg-gradient-to-r from-purple-100 via-pink-100 to-purple-100 rounded-2xl p-8 border-2 border-purple-200 text-center">
  <p class="text-xl font-bold text-purple-900 mb-3">But Here's What Matters Most:</p>
  <p class="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">90 Days of Consistency</p>
  <p class="text-lg text-purple-800">This is what yields <strong>true transformative results</strong>. Not 7 days. Not 21 days. <strong>90 days</strong> of supporting your foundation.</p>
  <p class="text-md text-purple-700 mt-4 italic">That's why we offer a full 90-day money-back guarantee. We want you to experience the real transformation.</p>
</div>`
    }
  };
  widgets.push(protocolSection);
  console.log('✓ Added protocol section with 90-day consistency message');

  // ============================================
  // 5. UPDATE ALL 60-DAY REFERENCES TO 90 DAYS
  // ============================================

  // Update two-approaches widget
  const twoApproaches = widgets.find(w => w.id === 'approach-comparison');
  if (twoApproaches && twoApproaches.config.rightColumn) {
    twoApproaches.config.rightColumn.result = '83% still going at 90 days';
    console.log('✓ Updated two-approaches: 60 days → 90 days');
  }

  // Update community-survey-results
  const surveyResults = widgets.find(w => w.id === 'community-survey-results');
  if (surveyResults && surveyResults.config.results) {
    surveyResults.config.results = surveyResults.config.results.map(r => {
      if (r.label && r.label.includes('60 days')) {
        return { ...r, label: r.label.replace('60 days', '90 days') };
      }
      return r;
    });
    console.log('✓ Updated community-survey-results: 60 days → 90 days');
  }

  // Update any text blocks that mention 60 days
  widgets.forEach(w => {
    if (w.type === 'text-block' && w.config.content) {
      if (w.config.content.includes('60 day') || w.config.content.includes('60-day')) {
        w.config.content = w.config.content
          .replace(/60 days?/gi, '90 days')
          .replace(/60-day/gi, '90-day');
        console.log(`✓ Updated text-block ${w.id}: 60 days → 90 days`);
      }
    }
  });

  // ============================================
  // 6. UPDATE ingredients-reaction TO FLOW BETTER
  // ============================================
  const ingredientsReaction = widgets.find(w => w.id === 'ingredients-reaction');
  if (ingredientsReaction) {
    ingredientsReaction.position = 18; // Keep same position
    ingredientsReaction.config.content = `<p class="text-lg text-gray-700 leading-relaxed mb-4">Compare that formula to the greens powders you see on Amazon—most of them are just dried vegetables with zero clinical backing and doses too small to do anything.</p>
<p class="text-lg text-gray-700 leading-relaxed"><strong>But here's the real question:</strong> Does it actually work for women like you?</p>`;
    console.log('✓ Updated ingredients-reaction copy');
  }

  // ============================================
  // 7. UPDATE poll-results-reaction TO REFERENCE 90 DAYS
  // ============================================
  const pollResultsReaction = widgets.find(w => w.id === 'poll-results-reaction');
  if (pollResultsReaction) {
    pollResultsReaction.config.content = `<div class="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-2xl p-6 mb-6">
<p class="text-xl font-bold text-emerald-900 mb-2">Compare that 83% to the 8% who succeed with traditional resolutions.</p>
<p class="text-emerald-800">When you fix the foundation first, the numbers flip completely. <strong>90 days of consistency</strong> is all it takes.</p>
</div>
<p class="text-lg text-gray-700 leading-relaxed">But don't just take my word for it. Here's what happened when real women—just like you—tried the foundation-first approach:</p>`;
    console.log('✓ Updated poll-results-reaction with 90-day reference');
  }

  // Sort by position and save
  widgets.sort((a, b) => a.position - b.position);

  await client.execute({
    sql: 'UPDATE articles SET widget_config = ?, updated_at = datetime("now") WHERE id = ?',
    args: [JSON.stringify(widgets), ARTICLE_ID]
  });

  console.log('\n✅ Article updated successfully with all changes!');
  console.log('\nNew widget order:');
  widgets.forEach((w, i) => console.log(`${i + 1}. [${w.position}] ${w.type} - ${w.id}`));
}

updateArticle().catch(console.error);
