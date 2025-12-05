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

  // 1. Fix the opening poll - change style from 'highlighted' to 'highlighted' but remove showResults
  const openingPoll = widgets.find(w => w.id === 'opening-poll');
  if (openingPoll) {
    openingPoll.config.showResults = false; // Let users vote first
    console.log('✓ Fixed opening poll - users can now vote');
  }

  // 2. Fix data-overview - add 4th data point
  const resolutionStats = widgets.find(w => w.id === 'resolution-stats');
  if (resolutionStats && resolutionStats.config.stats?.length === 3) {
    resolutionStats.config.stats.push({
      value: "45+",
      label: "is when traditional approaches stop working",
      icon: "clock",
      source: "American Menopause Society"
    });
    console.log('✓ Added 4th data point to resolution stats');
  }

  // 3. Update warning-box copy to be more relatable
  const warningBox = widgets.find(w => w.id === 'failure-cascade-warning');
  if (warningBox) {
    warningBox.config.warnings = [
      {
        text: "You wake up tired even after 8 hours of sleep",
        severity: "low"
      },
      {
        text: "By 2pm, you're reaching for sugar or caffeine just to function",
        severity: "low"
      },
      {
        text: "Cravings hit hard—and willpower doesn't stand a chance",
        severity: "medium"
      },
      {
        text: "Exercise feels impossible when you're already running on empty",
        severity: "medium"
      },
      {
        text: "You quietly give up—and the guilt spiral begins",
        severity: "high"
      }
    ];
    warningBox.config.headline = "The Real Reason Resolutions Fail After 45";
    warningBox.config.content = "Sound familiar? Each stage leads to the next:";
    console.log('✓ Updated warning box with relatable symptoms');
  }

  // 4. Update the second poll to be results-only style (community survey results)
  const communityPoll = widgets.find(w => w.id === 'community-poll-results');
  if (communityPoll) {
    communityPoll.config.style = 'results-only';
    communityPoll.config.showResults = true;
    console.log('✓ Updated community poll to results-only style');
  }

  // 5. Update the comparison table setup text
  const comparisonSetup = widgets.find(w => w.id === 'comparison-setup');
  if (comparisonSetup) {
    comparisonSetup.config.content = `<h2 class="text-2xl font-bold text-gray-900 mb-4">The Choice That Changes Everything</h2><p class="text-lg text-gray-700 leading-relaxed mb-6">Every January, I see women make the same choice. Here's what I tell them:</p>`;
    console.log('✓ Updated comparison setup text');
  }

  // 6. Hide the timeline widget since warning-box covers similar ground, or add transition
  const timelineSetup = widgets.find(w => w.id === 'timeline-setup');
  if (timelineSetup) {
    timelineSetup.config.content = `<p class="text-lg text-gray-700 leading-relaxed mb-4"><strong>Now let me show you what this looks like week by week.</strong> Because once you see the pattern, you'll understand why nothing has worked—and what will.</p>`;
    console.log('✓ Added transition before timeline');
  }

  // 7. Update Dr Amy's closing message to connect to 2026
  const drClosing = widgets.find(w => w.id === 'dr-closing');
  if (drClosing) {
    drClosing.config.message = "2026 doesn't have to be another year of broken promises to yourself. You deserve a year where the habits stick. Where your body cooperates. Where you stop fighting and start building. This could be that year—the year everything finally changes.";
    drClosing.config.signoff = "Here's to making 2026 different,";
    console.log('✓ Updated Dr Amy closing message for 2026 theme');
  }

  // 8. Update some text blocks for better flow and faster reveal
  const quizReveal = widgets.find(w => w.id === 'quiz-reveal');
  if (quizReveal) {
    quizReveal.config.content = `<div class="bg-purple-50 border-l-4 border-purple-500 p-6 rounded-r-xl mb-6">
<p class="text-lg text-gray-700 leading-relaxed mb-4">If you checked 3 or more boxes, here's the truth most doctors won't tell you:</p>
<p class="text-xl font-bold text-purple-900 mb-4">Your biology is sabotaging your resolutions before you even start.</p>
</div>
<p class="text-lg text-gray-700 leading-relaxed mb-4">Menopause has fundamentally altered how your body works. At the center of it all is your <strong>gut</strong>—specifically, the estrobolome: gut bacteria that regulate estrogen.</p>
<p class="text-lg text-gray-700 leading-relaxed mb-4">When menopause disrupts this system, willpower doesn't stand a chance.</p>
<p class="text-lg text-gray-700 leading-relaxed mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4"><strong>But here's the good news:</strong> Fix the gut, and everything else becomes possible. I've seen it happen hundreds of times.</p>`;
    console.log('✓ Updated quiz reveal with better styling');
  }

  // 9. Update the breaking-cycle section to be the reveal moment
  const breakingCycle = widgets.find(w => w.id === 'breaking-cycle');
  if (breakingCycle) {
    breakingCycle.config.content = `<div class="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-2xl p-6 mb-6">
<h2 class="text-2xl font-bold text-emerald-900 mb-4">What If There Was a Different Way?</h2>
<p class="text-lg text-gray-700 leading-relaxed mb-4">Not another diet. Not another exercise program. Not more willpower.</p>
<p class="text-lg text-gray-700 leading-relaxed mb-4"><strong>What if your only resolution was to fix the foundation first?</strong></p>
<p class="text-lg text-gray-700 leading-relaxed">One thing. One habit. Let your body cooperate instead of resist.</p>
</div>
<p class="text-lg text-gray-700 leading-relaxed mb-4">I spent most of last year searching for the simplest way to give my patients that foundation. Something they'd actually stick with—because compliance matters more than perfection.</p>
<p class="text-lg text-gray-700 leading-relaxed mb-4">I wasn't looking at greens powders. I'd dismissed most of them years ago. But one formula kept crossing my desk...</p>
<p class="text-lg text-gray-700 leading-relaxed mb-6">And when I finally looked at the research behind <strong>Spectra®</strong>, I realized this wasn't like the others.</p>`;
    console.log('✓ Updated breaking-cycle as the reveal moment');
  }

  // 10. Replace the community-poll-results with community-survey-results widget
  const communityPollIndex = widgets.findIndex(w => w.id === 'community-poll-results');
  if (communityPollIndex !== -1) {
    widgets[communityPollIndex] = {
      id: 'community-survey-results',
      type: 'community-survey-results',
      enabled: true,
      position: widgets[communityPollIndex].position,
      config: {
        headline: "What Our Community Reported",
        subheading: "Results from women who tried the 'foundation first' approach",
        results: [
          { label: "Reported more consistent energy by week 3", percentage: 78 },
          { label: "Said healthy habits became easier to maintain", percentage: 71 },
          { label: "Still taking it daily after 60 days", percentage: 83, highlighted: true },
          { label: "Would recommend to a friend over 40", percentage: 91 }
        ],
        totalRespondents: "612",
        source: "Dr. Amy Heart Community Challenge, 2024",
        highlightText: "Compare that 83% to the 8% who succeed with traditional New Year resolutions.",
        style: "featured"
      }
    };
    console.log('✓ Replaced community poll with community-survey-results widget');
  }

  // 11. Add Product Reveal widget before the ingredients grid
  const ingredientsIndex = widgets.findIndex(w => w.id === 'ingredients-grid');
  if (ingredientsIndex !== -1) {
    const productRevealWidget = {
      id: 'product-reveal',
      type: 'product-reveal',
      enabled: true,
      position: widgets[ingredientsIndex].position - 0.5,
      config: {
        headline: "After 18 Months of Research, I Found It",
        subheadline: "The one formula I can confidently recommend to every woman in my practice",
        productName: "Kiala Greens",
        productDescription: "The clinically-backed greens powder designed specifically for women over 40. One scoop daily addresses the root cause—not just the symptoms.",
        productImage: "https://kialanutrition.com/cdn/shop/files/1_89f1b0f3-3095-4bf4-a700-d7be3f09d2a5.png?v=1730842541",
        doctorQuote: "In 15 years of practice, I've never endorsed a specific supplement—until now. The results from my community have been remarkable.",
        rating: 4.8,
        reviewCount: "47,000+",
        keyBenefits: [
          "Supports the gut-hormone axis during menopause",
          "Spectra® clinically-studied antioxidant blend",
          "No sugar alcohols that undermine gut health",
          "One simple daily habit that changes everything"
        ],
        socialProofStats: [
          { value: "83%", label: "still taking after 60 days" },
          { value: "10K+", label: "women in community" },
          { value: "4.8", label: "average rating" }
        ],
        ctaText: "See Why Women Are Choosing Kiala →",
        ctaUrl: "https://kialanutrition.com/pages/greens?utm_source=dramyheart&utm_medium=article&utm_campaign=2026_resolution",
        badge: "Dr. Amy's #1 Pick for 2026"
      }
    };
    widgets.splice(ingredientsIndex, 0, productRevealWidget);
    console.log('✓ Added Product Reveal widget before ingredients');
  }

  // Re-sort widgets by position
  widgets.sort((a, b) => a.position - b.position);

  // Save updated widgets
  await client.execute({
    sql: 'UPDATE articles SET widget_config = ?, updated_at = datetime("now") WHERE id = ?',
    args: [JSON.stringify(widgets), ARTICLE_ID]
  });

  console.log('\n✅ Article updated successfully!');
}

updateArticle().catch(console.error);
