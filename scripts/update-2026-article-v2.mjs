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

  // 1. Update opening hook - tighter, faster to the point
  const openingHook = widgets.find(w => w.id === 'opening-hook');
  if (openingHook) {
    openingHook.config.content = `<p class="text-xl text-gray-700 leading-relaxed mb-6 font-medium">Every January, the same thing happens. Women walk into my practice with their lists. <em>Lose weight. Sleep better. Get my energy back.</em></p>
<p class="text-lg text-gray-700 leading-relaxed mb-4">By February, most have quietly given up.</p>
<p class="text-lg text-gray-700 leading-relaxed mb-4">For years, I thought they just needed better strategies. More discipline. A different diet.</p>
<p class="text-xl font-bold text-purple-800 mb-6">I was completely wrong.</p>
<p class="text-lg text-gray-700 leading-relaxed">What I've discovered over the past 18 months has fundamentally changed how I approach New Year's resolutions with my patients over 45. And I'm about to share it with you.</p>`;
    console.log('✓ Updated opening hook - tighter intro');
  }

  // 2. Update poll setup text
  const pollSetup = widgets.find(w => w.id === 'poll-setup');
  if (pollSetup) {
    pollSetup.config.content = `<p class="text-lg text-gray-700 leading-relaxed mb-4">But first, I need to ask you something. <strong>Be honest.</strong></p>`;
    console.log('✓ Updated poll setup');
  }

  // 3. Update poll results message to use a more dynamic feel
  const openingPoll = widgets.find(w => w.id === 'opening-poll');
  if (openingPoll) {
    openingPoll.config.resultsMessage = "You're not alone. {winner_percentage}% of our community has been making the same resolution for 6+ years. If that's you—keep reading. This is exactly why I wrote this.";
    console.log('✓ Updated poll results message');
  }

  // 4. Tighten poll reaction text
  const pollReaction = widgets.find(w => w.id === 'poll-reaction');
  if (pollReaction) {
    pollReaction.config.content = `<div class="bg-purple-50 border-l-4 border-purple-500 p-5 rounded-r-xl mb-6">
<p class="text-lg text-purple-900 font-semibold mb-2">If you picked that last option, I need you to hear this:</p>
<p class="text-xl text-purple-800 font-bold">This isn't a willpower problem.</p>
</div>
<p class="text-lg text-gray-700 leading-relaxed mb-4">The women who've been fighting this battle for years? They're not weak. They're some of the most determined, disciplined people I know.</p>
<p class="text-lg text-gray-700 leading-relaxed mb-6">So why does a simple resolution—eat better, move more—collapse by Valentine's Day?</p>
<p class="text-lg text-gray-700 font-semibold">Look at the numbers:</p>`;
    console.log('✓ Updated poll reaction');
  }

  // 5. Fix the data-overview to definitely have 4 stats
  const resolutionStats = widgets.find(w => w.id === 'resolution-stats');
  if (resolutionStats) {
    resolutionStats.config.stats = [
      {
        value: "73%",
        label: "abandon resolutions by February",
        icon: "calendar"
      },
      {
        value: "92%",
        label: "have failed completely by March",
        icon: "trending-down"
      },
      {
        value: "8%",
        label: "actually achieve their goals",
        icon: "target"
      },
      {
        value: "45+",
        label: "is when willpower stops working",
        icon: "clock"
      }
    ];
    resolutionStats.config.headline = "The Resolution Reality";
    resolutionStats.config.subheading = "What the research tells us";
    console.log('✓ Fixed data-overview with 4 stats');
  }

  // 6. Update stats reaction - move faster to the reveal
  const statsReaction = widgets.find(w => w.id === 'stats-reaction');
  if (statsReaction) {
    statsReaction.config.content = `<p class="text-lg text-gray-700 leading-relaxed mb-4"><strong>8%.</strong> That's it.</p>
<p class="text-lg text-gray-700 leading-relaxed mb-4">We've been told the problem is <em>us</em>. Not enough discipline. Not trying hard enough.</p>
<div class="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
<p class="text-lg text-amber-900 font-semibold">But what if the problem was never you?</p>
<p class="text-amber-800 mt-2">What if you've been building on a foundation that was already cracked?</p>
</div>
<p class="text-lg text-gray-700 leading-relaxed mb-4">Take this 30-second assessment. I want to show you something.</p>`;
    console.log('✓ Updated stats reaction');
  }

  // 7. Update comparison setup - make it clearer
  const comparisonSetup = widgets.find(w => w.id === 'comparison-setup');
  if (comparisonSetup) {
    comparisonSetup.config.content = `<h2 class="text-2xl font-bold text-gray-900 mb-4">Two Paths Into 2026</h2>
<p class="text-lg text-gray-700 leading-relaxed mb-2">This is the choice I put in front of every patient in January.</p>
<p class="text-lg text-gray-700 leading-relaxed mb-6 font-semibold">One leads to the same cycle. One breaks it.</p>`;
    console.log('✓ Updated comparison setup');
  }

  // 8. Update the comparison table content to make more sense
  const approachComparison = widgets.find(w => w.id === 'approach-comparison');
  if (approachComparison) {
    approachComparison.config = {
      headline: "Two Paths Into 2026",
      leftColumn: {
        header: "The Willpower Path",
        subheader: "What you've been trying",
        items: [
          { text: "Set ambitious weight loss goals", icon: "x-circle", negative: true },
          { text: "Start a strict diet January 1st", icon: "x-circle", negative: true },
          { text: "Force yourself to exercise", icon: "x-circle", negative: true },
          { text: "White-knuckle through cravings", icon: "x-circle", negative: true },
          { text: "Feel guilty when you slip", icon: "x-circle", negative: true }
        ],
        result: "92% fail by March"
      },
      rightColumn: {
        header: "The Foundation Path",
        subheader: "What actually works after 45",
        items: [
          { text: "Fix what's broken first", icon: "check-circle", positive: true },
          { text: "Support your gut-hormone axis", icon: "check-circle", positive: true },
          { text: "Let energy return naturally", icon: "check-circle", positive: true },
          { text: "Watch cravings diminish", icon: "check-circle", positive: true },
          { text: "Build habits that stick", icon: "check-circle", positive: true }
        ],
        result: "83% still going at 60 days"
      },
      style: "contrast"
    };
    console.log('✓ Updated comparison table content');
  }

  // 9. Update comparison reaction
  const comparisonReaction = widgets.find(w => w.id === 'comparison-reaction');
  if (comparisonReaction) {
    comparisonReaction.config.content = `<p class="text-lg text-gray-700 leading-relaxed mb-4">The difference isn't motivation. It isn't discipline.</p>
<p class="text-xl text-gray-900 font-bold mb-6">The difference is <em>where you start</em>.</p>`;
    console.log('✓ Updated comparison reaction');
  }

  // 10. Update timeline setup to be a transition
  const timelineSetup = widgets.find(w => w.id === 'timeline-setup');
  if (timelineSetup) {
    timelineSetup.config.content = `<p class="text-lg text-gray-700 leading-relaxed mb-4">Let me show you what's <em>actually</em> happening inside your body when a resolution fails.</p>
<p class="text-lg text-gray-700 leading-relaxed mb-6">Not the story we tell ourselves—the <strong>real sequence</strong>. See if this sounds familiar:</p>`;
    console.log('✓ Updated timeline setup');
  }

  // 11. Hide the warning box since we have the timeline (or vice versa - let's keep timeline, hide warning)
  const warningBox = widgets.find(w => w.id === 'failure-cascade-warning');
  if (warningBox) {
    warningBox.enabled = false; // Hide it - the timeline covers this better
    console.log('✓ Hid warning box (timeline covers this better)');
  }

  // 12. Update timeline reaction - transition to the solution
  const timelineReaction = widgets.find(w => w.id === 'timeline-reaction');
  if (timelineReaction) {
    timelineReaction.config.content = `<p class="text-lg text-gray-700 leading-relaxed mb-4">Sound familiar? I've heard this story hundreds of times.</p>
<p class="text-lg text-gray-700 leading-relaxed mb-4">And every time, the woman thinks <em>it's her fault</em>.</p>
<p class="text-xl font-bold text-purple-800 mb-6">It's not. It was never her fault.</p>
<div class="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-2xl p-6 mb-4">
<p class="text-lg text-emerald-900 font-semibold mb-2">Here's what I've learned:</p>
<p class="text-emerald-800">The timeline is broken before you even start. Fix the foundation, and everything changes.</p>
</div>`;
    console.log('✓ Updated timeline reaction');
  }

  // 13. Update breaking-cycle to be THE REVEAL
  const breakingCycle = widgets.find(w => w.id === 'breaking-cycle');
  if (breakingCycle) {
    breakingCycle.config.content = `<h2 class="text-3xl font-bold text-gray-900 mb-6 text-center">What If You Just... Stopped?</h2>
<p class="text-lg text-gray-700 leading-relaxed mb-4 text-center">Not stopped trying. <strong>Stopped fighting your biology.</strong></p>
<div class="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-8 mb-8 text-center">
<p class="text-xl text-purple-900 font-semibold mb-4">What if your <em>only</em> resolution for 2026 was this:</p>
<p class="text-2xl font-bold text-purple-800">Fix the foundation first.</p>
<p class="text-purple-700 mt-4">One thing. One habit. Let your body cooperate instead of resist.</p>
</div>
<p class="text-lg text-gray-700 leading-relaxed mb-4">I spent most of last year searching for the simplest way to give my patients that foundation. Something they'd actually stick with.</p>
<p class="text-lg text-gray-700 leading-relaxed mb-4">I wasn't looking at greens powders. I'd dismissed most of them years ago—proprietary blends, weak doses, sugar alcohols that irritate the gut.</p>
<p class="text-lg text-gray-700 leading-relaxed mb-6">But one formula kept crossing my desk. And when I finally looked at the research behind <strong>Spectra®</strong>, I realized this wasn't like the others.</p>
<p class="text-xl font-bold text-gray-900 text-center mb-4">Here's what I found:</p>`;
    console.log('✓ Updated breaking-cycle as THE REVEAL');
  }

  // 14. Update product reveal config
  const productReveal = widgets.find(w => w.id === 'product-reveal');
  if (productReveal) {
    productReveal.config.headline = "My #1 Recommendation for 2026";
    productReveal.config.subheadline = "After 18 months of research, this is the one formula I stand behind";
    productReveal.config.badge = "Dr. Amy's Foundation Pick";
    console.log('✓ Updated product reveal');
  }

  // 15. Update ingredients reaction
  const ingredientsReaction = widgets.find(w => w.id === 'ingredients-reaction');
  if (ingredientsReaction) {
    ingredientsReaction.config.content = `<div class="bg-gray-50 rounded-xl p-6 mb-6">
<p class="text-xl font-bold text-gray-900 mb-2">One scoop. Once a day.</p>
<p class="text-gray-700">That's the entire ask. Not a 47-step protocol. Just one simple habit that supports everything else.</p>
</div>
<p class="text-lg text-gray-700 leading-relaxed mb-4">I asked my community to make this their "one resolution" and track their results.</p>
<p class="text-lg text-gray-700 font-semibold">Here's what they reported:</p>`;
    console.log('✓ Updated ingredients reaction');
  }

  // 16. Update poll results reaction
  const pollResultsReaction = widgets.find(w => w.id === 'poll-results-reaction');
  if (pollResultsReaction) {
    pollResultsReaction.config.content = `<div class="bg-purple-50 border-l-4 border-purple-500 p-5 rounded-r-xl mb-6">
<p class="text-xl font-bold text-purple-900">83% still consistent at 60 days.</p>
<p class="text-purple-800 mt-2">Compare that to the 8% who succeed with traditional resolutions.</p>
</div>
<p class="text-lg text-gray-700 leading-relaxed mb-4">Sticking with something through February. Through the excuses. Through the days when motivation disappears.</p>
<p class="text-lg text-gray-700 leading-relaxed mb-6">That's when real change becomes possible. Here's what it actually looks like:</p>`;
    console.log('✓ Updated poll results reaction');
  }

  // 17. Update final thought
  const finalThought = widgets.find(w => w.id === 'final-thought');
  if (finalThought) {
    finalThought.config.content = `<p class="text-lg text-gray-700 leading-relaxed mb-4">I'm not going to promise this fixes everything. Menopause is complex. Your body is unique.</p>
<p class="text-lg text-gray-700 leading-relaxed mb-4">But I've watched too many women blame themselves for failed resolutions when the real problem was a broken foundation.</p>
<div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-6 text-center">
<p class="text-lg text-gray-700 mb-2">You're not undisciplined. You're not lazy.</p>
<p class="text-xl font-bold text-purple-800">You've just been building on sand.</p>
</div>
<p class="text-xl font-bold text-gray-900 text-center">2026 can be different. Not because of willpower—because you finally start in the right place.</p>`;
    console.log('✓ Updated final thought');
  }

  // Sort and save
  widgets.sort((a, b) => a.position - b.position);

  await client.execute({
    sql: 'UPDATE articles SET widget_config = ?, updated_at = datetime("now") WHERE id = ?',
    args: [JSON.stringify(widgets), ARTICLE_ID]
  });

  console.log('\n✅ Article updated successfully!');
}

updateArticle().catch(console.error);
