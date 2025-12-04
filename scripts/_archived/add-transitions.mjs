import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || 'libsql://kiala-app-db-mccmetternich.aws-us-west-2.turso.io',
  authToken: process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NjQxMjMxMzksImlkIjoiNWIwN2Q5YTItOTgxMi00NWZkLWIwNDQtNWU4OTI3ZjliZDZlIiwicmlkIjoiOTE0MWIyNmMtZTg5My00NTViLTkzOGUtMWRkMzA0N2Q0NTdjIn0.GUnVauEA3pYhuWMLPvHAZmGsb5E-NDbDm6QH0QWkq1NYYNMNp1I1ZFPtCYWiPUUYTW0CZ16-OZQVyUOO99ulAg'
});

async function addTransitions() {
  const articleId = 'k2IxMEsu9zzsw_Hd3BaU4';

  // Fetch the article
  const result = await client.execute({
    sql: 'SELECT widget_config FROM articles WHERE id = ?',
    args: [articleId]
  });

  if (!result.rows.length) {
    console.log('Article not found');
    return;
  }

  let widgets = JSON.parse(result.rows[0].widget_config);
  console.log('Current widgets:', widgets.length);

  // Find positions by widget ID
  const findWidgetIndex = (id) => widgets.findIndex(w => w.id === id);

  // 1. Update solution-intro (position 10) to add transition to Hilary
  const solutionIntroIdx = findWidgetIndex('solution-intro');
  if (solutionIntroIdx !== -1) {
    widgets[solutionIntroIdx].config.content = `<h2 class="text-2xl font-bold text-gray-900 mb-4">Why I Recommend Kiala Greens</h2>
<p class="text-lg text-gray-700 leading-relaxed mb-6"><strong>Kiala Greens is the only greens powder I recommend to my patients.</strong> I found them through my own research—and the results from my community have been remarkable.</p>
<div class="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mb-6">
<ul class="space-y-3">
<li class="flex items-start gap-3"><span class="text-green-600 font-bold text-xl">✓</span><span><strong>For belly fat:</strong> Green tea EGCG supports metabolism where hormonal shifts make weight hardest to lose.</span></li>
<li class="flex items-start gap-3"><span class="text-green-600 font-bold text-xl">✓</span><span><strong>For bloating:</strong> Chlorella and spirulina soothe gut inflammation while Spectra® rebuilds gut lining.</span></li>
<li class="flex items-start gap-3"><span class="text-green-600 font-bold text-xl">✓</span><span><strong>For hot flashes/mood:</strong> Supports serotonin production and cortisol regulation.</span></li>
<li class="flex items-start gap-3"><span class="text-green-600 font-bold text-xl">✓</span><span><strong>For energy:</strong> Cellular-level nutrition your body can actually absorb.</span></li>
</ul>
</div>
<p class="text-lg text-gray-700 leading-relaxed mb-4"><strong>As a physician, I call this root-cause medicine in a scoop.</strong></p>
<p class="text-lg text-gray-700 leading-relaxed mb-6">And the results from my community have been consistent. Take Hilary N., aged 56 from Denver, CO—who saw incredible results after just 12 weeks...</p>`;
    console.log('Updated solution-intro with Hilary transition');
  }

  // 2. Add transition AFTER before-after-slider (Hilary) and BEFORE endorsement-section
  const beforeAfterSliderIdx = findWidgetIndex('before-after-slider');
  const endorsementIdx = findWidgetIndex('endorsement-section');

  if (beforeAfterSliderIdx !== -1 && endorsementIdx !== -1) {
    // Insert new text widget between them
    const transitionToEndorsement = {
      id: 'transition-to-endorsement',
      type: 'text-block',
      enabled: true,
      position: beforeAfterSliderIdx + 1,
      config: {
        content: `<p class="text-lg text-gray-700 leading-relaxed mb-6">Hilary's story is one of thousands. And here's the thing—as a physician, I've been reluctant to put my name and professional reputation behind any supplement. Too many products overpromise and underdeliver. Too many are backed by marketing claims instead of clinical evidence.</p>
<p class="text-lg text-gray-700 leading-relaxed mb-6">But after 18 months of reviewing the research, studying the formulation, and watching the results pour in from my community—<strong>I'm comfortable taking this leap.</strong></p>`,
        label: 'Transition to Professional Assessment'
      }
    };

    // Insert after before-after-slider
    widgets.splice(beforeAfterSliderIdx + 1, 0, transitionToEndorsement);
    console.log('Added transition to endorsement');
  }

  // Re-find indices after insertion
  const endorsementIdxNew = widgets.findIndex(w => w.id === 'endorsement-section');
  const dataOverviewIdx = widgets.findIndex(w => w.id === 'data-overview-widget');

  // 3. Add transition AFTER endorsement-section and BEFORE data-overview
  if (endorsementIdxNew !== -1 && dataOverviewIdx !== -1) {
    const transitionToStats = {
      id: 'transition-to-stats',
      type: 'text-block',
      enabled: true,
      position: endorsementIdxNew + 1,
      config: {
        content: `<p class="text-lg text-gray-700 leading-relaxed mb-6">I'm comfortable taking this leap because <strong>over 10,000 members of my community</strong> have shared their results with my recommendation. And the statistics are genuinely eye-opening.</p>
<p class="text-lg text-gray-700 leading-relaxed mb-6">Here's what the data shows...</p>`,
        label: 'Transition to Community Stats'
      }
    };

    widgets.splice(endorsementIdxNew + 1, 0, transitionToStats);
    console.log('Added transition to stats');
  }

  // Re-find indices after insertion
  const dataOverviewIdxNew = widgets.findIndex(w => w.id === 'data-overview-widget');
  const exclusiveProductIdx = widgets.findIndex(w => w.id === 'exclusive-product-widget');

  // 4. Add transition AFTER data-overview and BEFORE exclusive-product
  if (dataOverviewIdxNew !== -1 && exclusiveProductIdx !== -1) {
    const transitionToOffer = {
      id: 'transition-to-offer',
      type: 'text-block',
      enabled: true,
      position: dataOverviewIdxNew + 1,
      config: {
        content: `<p class="text-lg text-gray-700 leading-relaxed mb-6">Because of these results, my team reached out to Kiala to see if they would be open to putting together an exclusive deal for our community.</p>
<p class="text-lg text-gray-700 leading-relaxed mb-6"><strong>For a limited time, they agreed.</strong> As we head into 2025, here's the community-exclusive offer they've put together—if this is something you want to try...</p>`,
        label: 'Transition to Exclusive Offer'
      }
    };

    widgets.splice(dataOverviewIdxNew + 1, 0, transitionToOffer);
    console.log('Added transition to offer');
  }

  // Re-find indices after insertion
  const exclusiveProductIdxNew = widgets.findIndex(w => w.id === 'exclusive-product-widget');
  const dayInLifeIdx = widgets.findIndex(w => w.id === 'day-in-life');

  // 5. Add transition AFTER exclusive-product and BEFORE day-in-life
  if (exclusiveProductIdxNew !== -1 && dayInLifeIdx !== -1) {
    const transitionToProtocol = {
      id: 'transition-to-protocol',
      type: 'text-block',
      enabled: true,
      position: exclusiveProductIdxNew + 1,
      config: {
        content: `<p class="text-lg text-gray-700 leading-relaxed mb-4"><strong>But wait—how do you actually take it? And how does it work over time?</strong></p>
<p class="text-lg text-gray-700 leading-relaxed mb-6">Here's the protocol. It's dead simple. And here's what the evidence shows you can expect...</p>`,
        label: 'Transition to Protocol'
      }
    };

    widgets.splice(exclusiveProductIdxNew + 1, 0, transitionToProtocol);
    console.log('Added transition to protocol');
  }

  // 6. Update ingredients-intro to add science intro
  const ingredientsIntroIdx = widgets.findIndex(w => w.id === 'ingredients-intro');
  if (ingredientsIntroIdx !== -1) {
    widgets[ingredientsIntroIdx].config.content = `<h3 class="font-bold text-gray-900 text-xl mb-4">So Let's Get Into the Science—What's Actually in Kiala?</h3>
<p class="text-lg text-gray-700 leading-relaxed mb-4">Let's take a closer look at the formula. Based on my clinical research, these six premium organic ingredients target menopause gut health:</p>`;
    console.log('Updated ingredients-intro with science intro');
  }

  // Re-number all positions
  widgets.forEach((w, idx) => {
    w.position = idx;
  });

  console.log('Total widgets after additions:', widgets.length);

  // Update the article
  await client.execute({
    sql: 'UPDATE articles SET widget_config = ? WHERE id = ?',
    args: [JSON.stringify(widgets), articleId]
  });

  console.log('Article updated successfully!');
}

addTransitions().catch(console.error);
