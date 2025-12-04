import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || 'libsql://kiala-app-db-mccmetternich.aws-us-west-2.turso.io',
  authToken: process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NjQxMjMxMzksImlkIjoiNWIwN2Q5YTItOTgxMi00NWZkLWIwNDQtNWU4OTI3ZjliZDZlIiwicmlkIjoiOTE0MWIyNmMtZTg5My00NTViLTkzOGUtMWRkMzA0N2Q0NTdjIn0.GUnVauEA3pYhuWMLPvHAZmGsb5E-NDbDm6QH0QWkq1NYYNMNp1I1ZFPtCYWiPUUYTW0CZ16-OZQVyUOO99ulAg'
});

// Updated widget configuration with improved copy and flow
const updatedWidgets = [
  {
    "id": "hero-image",
    "type": "text-block",
    "enabled": true,
    "position": 0,
    "config": {
      "content": "<img src=\"https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=1200&h=600&fit=crop\" alt=\"Dr. Amy Investigation\" class=\"w-full rounded-xl shadow-lg mb-6\" />",
      "label": "Hero Image"
    }
  },
  {
    "id": "opening-hook",
    "type": "text-block",
    "enabled": true,
    "position": 1,
    "config": {
      "content": `<p class="text-xl text-gray-700 leading-relaxed mb-6 font-medium">After 18 months of research and working with thousands of women in menopause, I've discovered why weight loss becomes nearly impossible after 40—and it's not what you think.</p>
<p class="text-lg text-gray-700 leading-relaxed mb-6">But more importantly, <strong>I've found something that actually works.</strong> Not another diet. Not another exercise program. Something that addresses the ROOT CAUSE of why your body is fighting you.</p>
<p class="text-lg text-gray-700 leading-relaxed mb-6">The weight that won't budge. The bloating that never goes away. The hot flashes. The mood swings. The brain fog. The 2pm energy crashes.</p>
<p class="text-lg text-gray-700 leading-relaxed mb-6"><strong>They're all connected.</strong> And today I'm revealing exactly what's causing them—and the one solution I now recommend to every woman in my practice.</p>`,
      "label": "Opening Hook - Strengthened"
    }
  },
  {
    "id": "problem-intro",
    "type": "text-block",
    "enabled": true,
    "position": 2,
    "config": {
      "content": `<h2 class="text-2xl font-bold text-gray-900 mb-4">The Menopause Weight Trap Nobody Talks About</h2>
<p class="text-lg text-gray-700 leading-relaxed mb-4">You're intelligent. You've been diligent about your health. Yet something shifted after 40.</p>
<p class="text-lg text-gray-700 leading-relaxed mb-6">The strategies that worked before no longer apply. Weight creeps on—especially around your midsection. Bloating becomes constant. Hot flashes strike without warning. Your mood swings feel foreign to who you've always been.</p>
<p class="text-lg text-gray-700 leading-relaxed mb-6"><strong>This is not your imagination, and it's definitely not a character flaw.</strong> It's biology—and there's a specific reason it's happening.</p>`,
      "label": "The Menopause Weight Trap"
    }
  },
  {
    "id": "symptoms-checker-widget",
    "type": "symptoms-checker",
    "enabled": true,
    "position": 3,
    "config": {
      "headline": "Common Experiences Women Share With Me",
      "subheading": "Check everything that resonates with your experience:",
      "symptoms": [
        {"id": "s1", "label": "Weight that has redistributed to your midsection despite no dietary changes", "category": "Weight"},
        {"id": "s2", "label": "Persistent bloating that doesn't respond to typical interventions", "category": "Digestion"},
        {"id": "s3", "label": "Fatigue that persists even after adequate sleep", "category": "Energy"},
        {"id": "s4", "label": "Difficulty concentrating or occasional mental fogginess", "category": "Mental"},
        {"id": "s5", "label": "Mood fluctuations that feel uncharacteristic", "category": "Mood"},
        {"id": "s6", "label": "Hot flashes or night sweats disrupting your life", "category": "Temperature"},
        {"id": "s7", "label": "Digestive irregularity—constipation, gas, or unpredictable bowel movements", "category": "Digestion"},
        {"id": "s8", "label": "Increased cravings, particularly for sugar or carbohydrates", "category": "Appetite"}
      ],
      "conclusionHeadline": "If you checked 3 or more...",
      "conclusionText": "These experiences are connected. They share a common underlying mechanism that standard approaches don't address. Keep reading—because what I'm about to explain changed how I practice medicine.",
      "minSymptoms": 3
    }
  },
  {
    "id": "validation-section",
    "type": "text-block",
    "enabled": true,
    "position": 4,
    "config": {
      "content": `<p class="text-lg text-gray-700 leading-relaxed mb-6">If you checked three or more symptoms, here's what you need to understand:</p>
<p class="text-xl text-gray-900 font-bold mb-6">These aren't separate problems. They're symptoms of ONE underlying issue: a compromised gut.</p>
<div class="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
<ul class="space-y-4 text-gray-700">
<li class="flex items-start gap-3"><span class="text-purple-600 font-bold">→</span><span><strong>Your stubborn belly fat?</strong> It's not about calories—your inflamed gut triggers cortisol, which stores fat around your midsection.</span></li>
<li class="flex items-start gap-3"><span class="text-purple-600 font-bold">→</span><span><strong>The constant bloating?</strong> Your gut bacteria diversity has crashed, causing fermentation and gas with everything you eat.</span></li>
<li class="flex items-start gap-3"><span class="text-purple-600 font-bold">→</span><span><strong>Hot flashes and mood swings?</strong> 90% of your serotonin is made in your gut. When it's compromised, your entire hormonal signaling goes haywire.</span></li>
<li class="flex items-start gap-3"><span class="text-purple-600 font-bold">→</span><span><strong>The exhaustion?</strong> Chronic inflammation is stealing your cellular energy before you can use it.</span></li>
<li class="flex items-start gap-3"><span class="text-purple-600 font-bold">→</span><span><strong>Digestive irregularity?</strong> A weakened gut lining means poor nutrient absorption and unpredictable digestion.</span></li>
</ul>
</div>
<p class="text-lg text-gray-700 leading-relaxed mb-6"><strong>The solution isn't to treat each symptom separately. It's to heal the gut—and watch everything else follow.</strong></p>
<p class="text-lg text-gray-700 leading-relaxed mb-6">That's exactly what happened to Jennifer M., one of my toughest cases...</p>`,
      "label": "Symptom-Cause Connection"
    }
  },
  {
    "id": "first-testimonial-hero",
    "type": "testimonial-hero",
    "enabled": true,
    "position": 5,
    "config": {
      "quote": "I was skeptical when Dr. Amy first mentioned this. I had tried everything—keto, intermittent fasting, countless supplements. But within 3 weeks of adding this to my morning routine, the bloating that had plagued me for years just... vanished. I've lost 19 pounds, but more importantly, I feel like myself again.",
      "author": "Jennifer M.",
      "title": "Community Member, Age 52",
      "image": "https://res.cloudinary.com/dz2yrb1lc/image/upload/v1764622359/kiala/oYx9upllBN3uNyd6FMlGj/kiala/oYx9upllBN3uNyd6FMlGj/Lv69r_dZvF_HZgDFdfP7m.jpg",
      "rating": 5,
      "verified": true,
      "weightLost": "19 lbs",
      "timeframe": "8 weeks",
      "body": "\"That checklist above? I checked every box.\n\nAt 52, the weight had migrated to my midsection, the bloating was relentless, and I was exhausted by 2pm no matter how much I slept. The hot flashes were embarrassing. My mood was all over the place.\n\nI tried everything—calorie counting, cutting carbs, expensive probiotics. Nothing worked.\n\nWhen I started working with Dr. Amy, she helped me see what I'd been missing: it wasn't about trying harder. It was about healing my gut first.\n\nShe recommended something simple I could take every morning. Within the first week, the bloating stopped. By week 2, the hot flashes reduced dramatically. By week 4, the afternoon crashes were gone. And over 90 days? I lost 22 pounds—mostly from my midsection.\n\nOnce I addressed the root cause, everything followed.\"\n\n— Jennifer M., 52, Austin TX"
    }
  },
  {
    "id": "menopause-focus",
    "type": "text-block",
    "enabled": true,
    "position": 6,
    "config": {
      "content": `<div class="bg-purple-50 border border-purple-200 rounded-xl p-6 mb-6">
<h3 class="font-bold text-purple-900 text-xl mb-4">The Menopause Triple Threat—And Why Most Solutions Fail</h3>
<p class="text-gray-700 mb-4">During menopause, three biological shifts happen simultaneously:</p>
<div class="space-y-4 mb-4">
<div class="bg-white rounded-lg p-4">
<p class="font-bold text-gray-900 mb-1">1. Estrogen drops → Fat redistributes to your midsection</p>
<p class="text-gray-600 text-sm">Your body literally changes WHERE it stores fat. Diet and exercise alone can't override this biology.</p>
</div>
<div class="bg-white rounded-lg p-4">
<p class="font-bold text-gray-900 mb-1">2. Gut bacteria diversity crashes → Chronic inflammation begins</p>
<p class="text-gray-600 text-sm">Fewer healthy gut bacteria means more toxins circulating, more bloating, and systemic inflammation that affects everything.</p>
</div>
<div class="bg-white rounded-lg p-4">
<p class="font-bold text-gray-900 mb-1">3. The estrobolome weakens → Hormone metabolism breaks down</p>
<p class="text-gray-600 text-sm">Your gut bacteria are supposed to help process hormones. When they can't, hot flashes, mood swings, and weight gain spiral.</p>
</div>
</div>
<p class="text-gray-700 font-medium"><strong>Here's what most doctors miss:</strong> These three problems FEED each other. Inflammation causes weight gain. Weight gain increases inflammation. Poor gut health worsens both.</p>
<p class="text-purple-800 font-bold mt-4">To break the cycle, you must address the gut FIRST.</p>
</div>`,
      "label": "The Menopause Triple Threat"
    }
  },
  {
    "id": "gut-hormone-section",
    "type": "text-block",
    "enabled": true,
    "position": 7,
    "config": {
      "content": `<h2 id="gut-hormone-connection" class="text-2xl font-bold text-gray-900 mb-4">The Gut-Hormone Connection: The Science</h2>
<p class="text-lg text-gray-700 leading-relaxed mb-6"><strong>Your gut health directly controls your hormonal balance.</strong> This isn't speculation—it's established science that's finally getting the attention it deserves.</p>
<p class="text-lg text-gray-700 leading-relaxed mb-6">Your digestive system contains the "estrobolome"—specialized gut bacteria that metabolize estrogen. When compromised by stress, poor diet, or the natural changes of aging, it disrupts how your body processes every hormone in your system.</p>
<p class="text-lg text-gray-700 leading-relaxed mb-4">Your gut also:</p>
<ul class="space-y-3 mb-6 text-lg">
<li class="flex items-start gap-3"><span class="text-purple-600 font-bold">•</span><span><strong>Produces 90% of serotonin</strong>—regulating mood, sleep, appetite, and hot flash intensity</span></li>
<li class="flex items-start gap-3"><span class="text-purple-600 font-bold">•</span><span><strong>Houses 70% of your immune system</strong>—directly controlling inflammation levels throughout your body</span></li>
<li class="flex items-start gap-3"><span class="text-purple-600 font-bold">•</span><span><strong>Controls cortisol regulation</strong>—the stress hormone that triggers belly fat storage</span></li>
<li class="flex items-start gap-3"><span class="text-purple-600 font-bold">•</span><span><strong>Determines nutrient absorption</strong>—affecting energy production at the cellular level</span></li>
</ul>
<p class="text-lg text-gray-700 leading-relaxed mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4"><strong>Fix the gut, and the weight, hot flashes, mood swings, bloating, and energy issues often resolve together.</strong></p>`,
      "label": "The Gut-Hormone Connection"
    }
  },
  {
    "id": "before-after-early",
    "type": "before-after-comparison",
    "enabled": true,
    "position": 8,
    "config": {
      "headline": "Real Results From Our Community",
      "beforeImage": "https://res.cloudinary.com/dz2yrb1lc/image/upload/v1764622847/kiala/oYx9upllBN3uNyd6FMlGj/kiala/oYx9upllBN3uNyd6FMlGj/3lnK-mFBTKrIrx26uFk-j.jpg",
      "afterImage": "https://res.cloudinary.com/dz2yrb1lc/image/upload/v1764622860/kiala/oYx9upllBN3uNyd6FMlGj/kiala/oYx9upllBN3uNyd6FMlGj/2sTFbnNdtQu947teFUEIk.jpg",
      "name": "Margaret T.",
      "age": 54,
      "weightLost": "23 lbs",
      "timeframe": "90 days",
      "quote": "The bloating disappeared first. Then the hot flashes reduced. Then the weight started melting off my midsection. I finally feel comfortable in my own skin again."
    }
  },
  {
    "id": "investigation-intro",
    "type": "text-block",
    "enabled": true,
    "position": 9,
    "config": {
      "content": `<h2 class="text-2xl font-bold text-gray-900 mb-4">My 18-Month Investigation</h2>
<p class="text-lg text-gray-700 leading-relaxed mb-6">Understanding the gut-hormone connection is one thing. Finding a solution that actually works is another.</p>
<p class="text-lg text-gray-700 leading-relaxed mb-6">A quality greens powder is one of the most efficient ways to support gut health—delivering concentrated nutrition that heals the gut lining, reduces inflammation, and restores bacterial diversity. The problem: <strong>most greens powders are ineffective garbage.</strong></p>
<p class="text-lg text-gray-700 leading-relaxed mb-6">I evaluated 47 products with strict criteria:</p>
<div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-6">
<ul class="space-y-3">
<li class="flex items-start gap-3"><span class="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">1</span><span class="text-gray-700"><strong>Clinical validation:</strong> Human studies proving benefits, not just lab research or marketing claims</span></li>
<li class="flex items-start gap-3"><span class="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">2</span><span class="text-gray-700"><strong>Therapeutic dosing:</strong> Real amounts that create real change, not label decoration</span></li>
<li class="flex items-start gap-3"><span class="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">3</span><span class="text-gray-700"><strong>Menopause-specific benefits:</strong> Targeting gut health, inflammation, AND hormonal support</span></li>
<li class="flex items-start gap-3"><span class="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">4</span><span class="text-gray-700"><strong>Clean formulation:</strong> No artificial additives, hidden sugars, or cheap fillers</span></li>
</ul>
</div>
<p class="text-lg text-gray-700 leading-relaxed mb-6">46 products failed. <strong>One passed.</strong></p>`,
      "label": "18-Month Investigation"
    }
  },
  {
    "id": "solution-intro",
    "type": "text-block",
    "enabled": true,
    "position": 10,
    "config": {
      "content": `<h2 class="text-2xl font-bold text-gray-900 mb-4">Kiala Greens: Why It Addresses Every Part of the Menopause Triple Threat</h2>
<p class="text-lg text-gray-700 leading-relaxed mb-6"><strong>Kiala Greens is the only greens powder I recommend.</strong> This isn't a paid endorsement—I found them through my own research after seeing consistent, remarkable results from women in my community.</p>
<p class="text-lg text-gray-700 leading-relaxed mb-6">Here's why it works where others fail:</p>
<div class="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mb-6">
<ul class="space-y-4">
<li class="flex items-start gap-3"><span class="text-green-600 font-bold text-xl">✓</span><span><strong>For stubborn belly fat:</strong> Green tea extract with EGCG supports metabolism and fat oxidation—clinically shown to help where hormonal shifts make weight management hardest.</span></li>
<li class="flex items-start gap-3"><span class="text-green-600 font-bold text-xl">✓</span><span><strong>For bloating and digestive issues:</strong> Chlorella and spirulina soothe gut inflammation while the Spectra® blend rebuilds gut lining integrity.</span></li>
<li class="flex items-start gap-3"><span class="text-green-600 font-bold text-xl">✓</span><span><strong>For hot flashes and mood:</strong> The formula supports serotonin production and cortisol regulation—both manufactured in and controlled by the gut.</span></li>
<li class="flex items-start gap-3"><span class="text-green-600 font-bold text-xl">✓</span><span><strong>For energy crashes:</strong> Cellular-level nutrition your body can actually absorb, unlike cheap multivitamins that pass right through.</span></li>
<li class="flex items-start gap-3"><span class="text-green-600 font-bold text-xl">✓</span><span><strong>For digestive regularity:</strong> Prebiotic fibers and gut-healing compounds restore healthy, predictable digestion.</span></li>
</ul>
</div>
<p class="text-lg text-gray-700 leading-relaxed mb-6"><strong>This isn't a band-aid. It's root-cause medicine in a scoop.</strong></p>`,
      "label": "Why Kiala Works"
    }
  },
  {
    "id": "endorsement-section",
    "type": "text-block",
    "enabled": true,
    "position": 11,
    "config": {
      "content": `<div class="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-8 mb-6">
<div class="flex flex-col md:flex-row items-start gap-6">
<img src="/uploads/oYx9upllBN3uNyd6FMlGj/WXPCOJ8PPZxy1Mt8H4AYm.jpg" alt="Dr. Amy" class="w-24 h-24 rounded-full border-4 border-white shadow-lg flex-shrink-0" />
<div>
<h3 class="text-xl font-bold text-gray-900 mb-2">My Professional Assessment</h3>
<p class="text-gray-700 mb-4">In 15 years of practice, I've never endorsed a specific supplement—until now. The industry's history of overpromising made me fiercely protective of my reputation and your trust.</p>
<p class="text-gray-700 mb-4"><strong>Kiala Greens earned my recommendation through rigorous evaluation and consistent results from thousands of women dealing with menopause weight gain, hot flashes, mood swings, and digestive issues.</strong></p>
<p class="text-gray-700 mb-4">I've watched women who "tried everything" finally see results. The bloating resolves. The hot flashes diminish. The weight starts moving. The energy returns.</p>
<p class="text-purple-700 font-semibold">— Dr. Amy Heart</p>
</div>
</div>
</div>`,
      "label": "Professional Assessment"
    }
  },
  {
    "id": "data-overview-widget",
    "type": "data-overview",
    "enabled": true,
    "position": 12,
    "config": {
      "headline": "Community Survey Results",
      "subheading": "Based on feedback from 10,000+ verified community members after 90 days",
      "stats": [
        {"value": "94%", "label": "Reported improved energy levels", "icon": "energy"},
        {"value": "89%", "label": "Noticed reduced bloating", "icon": "stomach"},
        {"value": "87%", "label": "Experienced better mental clarity", "icon": "brain"},
        {"value": "82%", "label": "Saw visible midsection changes", "icon": "scale"}
      ],
      "source": "Data from 10,273 Community Respondents"
    }
  },
  {
    "id": "exclusive-product-widget",
    "type": "exclusive-product",
    "enabled": true,
    "position": 13,
    "config": {
      "badge": "Dr. Amy's #1 Pick",
      "headline": "Kiala Greens",
      "subheadline": "The Clinically-Backed Greens Powder for Women 40+",
      "image": "https://res.cloudinary.com/dz2yrb1lc/image/upload/v1764629639/kiala/oYx9upllBN3uNyd6FMlGj/kiala/oYx9upllBN3uNyd6FMlGj/hw_6yka1Hz0xJuc8K0ZJ2.png",
      "rating": 4.9,
      "reviewCount": 47284,
      "name": "The All-In-One Menopause Solution",
      "description": "The only greens powder I recommend for women dealing with menopause weight, bloating, hot flashes, mood swings, and energy crashes. One scoop daily targets the root cause.",
      "price": 59,
      "originalPrice": 120,
      "benefits": [
        "Targets stubborn menopause belly fat at the source",
        "Eliminates bloating within days, not weeks",
        "Reduces hot flash frequency and intensity",
        "Supports mood stability and mental clarity",
        "Restores all-day energy without caffeine jitters"
      ],
      "buttonText": "Claim Your Exclusive Offer →",
      "buttonUrl": "https://trygreens.com/dr-amy",
      "target": "_blank",
      "testimonialAvatar": "https://res.cloudinary.com/dz2yrb1lc/image/upload/v1764630671/kiala/oYx9upllBN3uNyd6FMlGj/kiala/oYx9upllBN3uNyd6FMlGj/EOXGeKAqgF9KcwxH_SNm3.jpg",
      "testimonialName": "Sandra E., 49",
      "testimonialQuote": "This community introduced me to so many insights—but this is the only supplement that actually worked. I take it daily and the difference in my bloating and energy is remarkable.",
      "showTestimonial": true
    }
  },
  {
    "id": "day-in-life",
    "type": "text-block",
    "enabled": true,
    "position": 14,
    "config": {
      "content": `<div class="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 mb-6">
<h3 class="font-bold text-gray-900 text-xl mb-4">What Taking Kiala Actually Looks Like</h3>
<div class="flex flex-col md:flex-row gap-6 items-center">
<div class="flex-1">
<p class="text-gray-700 mb-4"><strong>It's one scoop. Every morning. That's it.</strong></p>
<p class="text-gray-700 mb-4">Mix it with 8oz of water (or add it to your smoothie). Takes about 30 seconds. The tropical splash flavor actually tastes good—women tell me it's something they look forward to, not something they force down.</p>
<p class="text-gray-700 mb-4">No complicated protocols. No timing around meals. No remembering 12 different pills.</p>
<p class="text-gray-700 font-medium">Just one simple morning ritual that addresses the root cause of your menopause symptoms.</p>
</div>
</div>
</div>`,
      "label": "Day in the Life"
    }
  },
  {
    "id": "timeline-widget",
    "type": "timeline",
    "enabled": true,
    "position": 15,
    "config": {
      "headline": "What to Expect: Your 90-Day Transformation",
      "subheadline": "Based on community feedback from thousands of women",
      "milestones": [
        {
          "timeframe": "Days 1-7",
          "title": "Gut Reset Begins",
          "description": "Most women notice reduced bloating within the first week. The uncomfortable fullness after meals starts to fade. Energy may begin to stabilize.",
          "icon": "stomach"
        },
        {
          "timeframe": "Weeks 2-3",
          "title": "Inflammation Drops",
          "description": "Hot flash frequency often decreases. Mood becomes more stable. The afternoon energy crash starts to disappear. Digestive regularity improves.",
          "icon": "flame"
        },
        {
          "timeframe": "Weeks 4-6",
          "title": "Metabolism Responds",
          "description": "Weight starts to shift—especially from the midsection. Cravings reduce. Sleep quality improves. Mental clarity sharpens.",
          "icon": "scale"
        },
        {
          "timeframe": "Days 60-90",
          "title": "Full Transformation",
          "description": "Sustained weight loss. Consistent energy throughout the day. Dramatically reduced menopause symptoms. Women report feeling like themselves again.",
          "icon": "sparkles"
        }
      ]
    }
  },
  {
    "id": "spectra-section",
    "type": "text-block",
    "enabled": true,
    "position": 16,
    "config": {
      "content": `<div class="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mb-6">
<h3 class="font-bold text-gray-900 text-xl mb-4">The Spectra® Difference: Real Science, Real Results</h3>
<p class="text-gray-700 mb-4">Most supplements claim benefits. Spectra® has <strong>published human clinical trials</strong> proving them.</p>
<p class="text-gray-700 mb-4">This proprietary blend of 29 fruits, vegetables, and herbs specifically targets the issues menopause creates:</p>
<ul class="space-y-2 mb-4">
<li class="flex items-start gap-2"><span class="text-green-600 font-bold">✓</span><span><strong>Reduces cellular inflammation</strong>—the hidden driver of weight gain and fatigue</span></li>
<li class="flex items-start gap-2"><span class="text-green-600 font-bold">✓</span><span><strong>Supports healthy inflammatory response</strong>—calming the systemic fire that worsens every symptom</span></li>
<li class="flex items-start gap-2"><span class="text-green-600 font-bold">✓</span><span><strong>Boosts mitochondrial function</strong>—restoring energy at the cellular level</span></li>
<li class="flex items-start gap-2"><span class="text-green-600 font-bold">✓</span><span><strong>Repairs gut lining integrity</strong>—healing the source of bloating and digestive issues</span></li>
</ul>
<p class="text-gray-700 font-medium">This is why Kiala works when other greens powders don't. The Spectra® blend isn't marketing—it's medicine.</p>
</div>`,
      "label": "The Spectra Difference"
    }
  },
  {
    "id": "widget-1764629326861",
    "type": "before-after-side-by-side",
    "enabled": true,
    "position": 17,
    "config": {
      "headline": "Nancy S.'s Transformation",
      "beforeImage": "https://res.cloudinary.com/dz2yrb1lc/image/upload/v1764629365/kiala/oYx9upllBN3uNyd6FMlGj/kiala/oYx9upllBN3uNyd6FMlGj/zioyf-XQpNZy4VdxDejo4.jpg",
      "afterImage": "https://res.cloudinary.com/dz2yrb1lc/image/upload/v1764629377/kiala/oYx9upllBN3uNyd6FMlGj/kiala/oYx9upllBN3uNyd6FMlGj/4Vg1yy5Ntv7lvxI682gLd.jpg",
      "name": "Nancy S.",
      "age": "49",
      "location": "New York, NY",
      "timeframe": "90 Days",
      "testimonial": "I was the ultimate skeptic. I'd wasted money on so many supplements that promised the world and delivered nothing. But my hot flashes were unbearable, the bloating made me miserable, and I was desperate. Within two weeks, the bloating was gone. Within a month, my hot flashes had reduced by half. After 90 days, I'd lost 18 pounds—mostly from my midsection—and I finally felt like myself again."
    }
  },
  {
    "id": "us-vs-them-comparison",
    "type": "us-vs-them-comparison",
    "enabled": true,
    "position": 18,
    "config": {
      "headline": "Why Kiala Users Get Results Others Don't",
      "column1Image": "https://res.cloudinary.com/dz2yrb1lc/image/upload/v1764623037/kiala/oYx9upllBN3uNyd6FMlGj/kiala/oYx9upllBN3uNyd6FMlGj/wVM_GjnHpvrfLrkHpmz8J.avif",
      "column1Title": "Kiala Greens",
      "column1Features": [
        "Results in days, not months",
        "89% report reduced bloating within 2 weeks",
        "Targets the ROOT CAUSE—gut health",
        "Clinically-proven Spectra® blend",
        "Specifically formulated for women 40+",
        "Addresses weight, hot flashes, mood, AND energy"
      ],
      "column2Image": "https://res.cloudinary.com/dz2yrb1lc/image/upload/v1764623074/kiala/oYx9upllBN3uNyd6FMlGj/kiala/oYx9upllBN3uNyd6FMlGj/Mvy00fT9TLPcUMpcLKuJM.webp",
      "column2Title": "Generic Supplements",
      "column2Features": [
        "Takes months to maybe notice anything",
        "Most women feel no difference at all",
        "Only masks symptoms temporarily",
        "Unproven ingredients at useless doses",
        "One-size-fits-all formulas",
        "Addresses one symptom at best"
      ],
      "ctaText": "Try Kiala Greens Risk-Free →",
      "ctaUrl": "https://trygreens.com/dr-amy",
      "target": "_blank",
      "guaranteeBadge": "90-Day Money Back Guarantee",
      "satisfactionBadge": "100% Satisfaction Guarantee"
    }
  },
  {
    "id": "ingredients-intro",
    "type": "text-block",
    "enabled": true,
    "position": 19,
    "config": {
      "content": `<h3 class="font-bold text-gray-900 text-xl mb-4">The Complete Formula: How Each Ingredient Targets Your Symptoms</h3>
<p class="text-lg text-gray-700 leading-relaxed mb-4">Beyond the Spectra® blend, Kiala Greens contains six premium organic ingredients—each selected specifically for menopause gut health and hormonal support:</p>`,
      "label": "Ingredients Introduction"
    }
  },
  {
    "id": "ingredients-grid",
    "type": "ingredient-list-grid",
    "enabled": true,
    "position": 20,
    "config": {
      "style": "simple",
      "columns": 2,
      "ingredients": [
        {
          "name": "Organic Spirulina",
          "description": "Complete plant protein that supports stable blood sugar—key for managing the cravings and energy crashes that worsen during menopause. B-vitamins help your body convert food to energy while supporting the stress response that feels overwhelmed when hormones fluctuate.",
          "image": "https://res.cloudinary.com/dz2yrb1lc/image/upload/v1764624158/kiala/oYx9upllBN3uNyd6FMlGj/kiala/oYx9upllBN3uNyd6FMlGj/SsOENo2umJPtRpMYOAf1o.webp"
        },
        {
          "name": "Organic Chlorella",
          "description": "Gentle daily detox that binds to toxins your body encounters. High chlorophyll content soothes the gut inflammation driving your bloating, while supporting the liver function that becomes crucial for hormone balance after 40.",
          "image": "https://res.cloudinary.com/dz2yrb1lc/image/upload/v1764624189/kiala/oYx9upllBN3uNyd6FMlGj/kiala/oYx9upllBN3uNyd6FMlGj/RHHvHwNHhGg8-SiAvi8lN.webp"
        },
        {
          "name": "Organic Green Tea Extract",
          "description": "Contains EGCG, which research shows supports metabolism and fat oxidation—especially helpful when hormonal shifts make midsection weight nearly impossible to lose. L-theanine provides calm, focused energy without jitters, helping balance the cortisol that's storing fat around your belly.",
          "image": "https://res.cloudinary.com/dz2yrb1lc/image/upload/v1764624259/kiala/oYx9upllBN3uNyd6FMlGj/kiala/oYx9upllBN3uNyd6FMlGj/dbNTX3V4OVKrWNEJPcVSp.webp"
        },
        {
          "name": "Coconut Water Powder",
          "description": "Natural electrolyte support that helps reduce the water retention and bloating that makes you feel puffy. Potassium-rich formula supports healthy blood pressure and combats the fatigue from even mild dehydration—a common but overlooked cause of low energy.",
          "image": "https://res.cloudinary.com/dz2yrb1lc/image/upload/v1764624287/kiala/oYx9upllBN3uNyd6FMlGj/kiala/oYx9upllBN3uNyd6FMlGj/BUjMK0vITSSPd5MaPDdIb.webp"
        },
        {
          "name": "Acai Powder",
          "description": "Antioxidant powerhouse that supports brain health and mood regulation—crucial when menopause brain fog and mood swings strike. Polyphenols fight inflammation while supporting the gut health increasingly linked to emotional stability.",
          "image": "https://res.cloudinary.com/dz2yrb1lc/image/upload/v1764624329/kiala/oYx9upllBN3uNyd6FMlGj/kiala/oYx9upllBN3uNyd6FMlGj/7fQJwGHKe6ylBa-b6AlMF.webp"
        },
        {
          "name": "Spectra®",
          "description": "The clinically-studied antioxidant blend that ties everything together. Manages the oxidative stress that increases with age, supports cellular energy production, and reduces the inflammation directly linked to stubborn belly fat and worsening menopause symptoms.",
          "image": "https://res.cloudinary.com/dz2yrb1lc/image/upload/v1764624439/kiala/oYx9upllBN3uNyd6FMlGj/kiala/oYx9upllBN3uNyd6FMlGj/ynRu69-GtWYtgLyNRGleG.webp"
        }
      ]
    }
  },
  {
    "id": "ingredients-closing",
    "type": "text-block",
    "enabled": true,
    "position": 21,
    "config": {
      "content": `<p class="text-lg text-gray-700 leading-relaxed mb-6">Every ingredient serves a purpose. No filler. No "fairy dusting" of trendy compounds at useless doses. Just a thoughtfully designed formula that delivers what women over 40 actually need.</p>
<p class="text-lg text-gray-700 leading-relaxed mb-6">And here's something the taste-testers in my community consistently mention: <strong>it actually tastes good.</strong> The tropical splash flavor makes it something you look forward to rather than something you force down. Compliance is everything—the best supplement in the world is useless if it sits in your cabinet.</p>`,
      "label": "Ingredients Closing"
    }
  },
  {
    "id": "exclusive-offer-intro",
    "type": "text-block",
    "enabled": true,
    "position": 22,
    "config": {
      "content": `<h2 class="text-2xl font-bold text-gray-900 mb-4">Exclusive Community Pricing</h2>
<p class="text-lg text-gray-700 leading-relaxed mb-6">I negotiated exclusive savings for our community:</p>
<ul class="space-y-3 mb-6">
<li class="flex items-start gap-3"><span class="text-purple-600 font-bold text-xl">✓</span><span class="text-lg"><strong>Up to 50% off</strong> retail pricing</span></li>
<li class="flex items-start gap-3"><span class="text-purple-600 font-bold text-xl">✓</span><span class="text-lg"><strong>Free shipping</strong> on every order</span></li>
<li class="flex items-start gap-3"><span class="text-purple-600 font-bold text-xl">✓</span><span class="text-lg"><strong>90-day money-back guarantee</strong>—if you don't see results, you pay nothing</span></li>
</ul>
<p class="text-lg text-gray-700 leading-relaxed mb-6">The 90-day supply is what I recommend clinically—this timeframe allows your gut to fully heal and hormones to rebalance. But even the 30-day supply will show you whether this works for your body.</p>`,
      "label": "Exclusive Pricing Intro"
    }
  },
  {
    "id": "shop-now-widget-top",
    "type": "shop-now",
    "enabled": true,
    "position": 23,
    "config": {
      "headline": "Choose Your Supply",
      "subheadline": "Free shipping on all orders • 90-day money-back guarantee",
      "name": "Kiala Greens Super Gut Reset",
      "description": "The #1 doctor-backed daily ritual for menopause weight, bloating, hot flashes, and low energy. One scoop daily helps women feel flatter, lighter, cooler, and more energized—often in just days.",
      "buttonText": "Start My Transformation →",
      "buttonUrl": "https://trygreens.com/dr-amy",
      "target": "_blank",
      "guarantee": "90-Day Satisfaction Guarantee: If you're not completely satisfied, we'll refund every penny. No questions asked.",
      "pricingOptions": [
        {"id": "option-1", "label": "Buy 1 Get 1 FREE", "quantity": 1, "price": 97, "originalPrice": 167, "perUnit": 97, "savings": "Save $70", "popular": false, "gifts": [{"name": "Free Shipping", "value": "$10.00"}]},
        {"id": "option-2", "label": "Buy 2 Get 2 FREE", "quantity": 2, "price": 167, "originalPrice": 287, "perUnit": 83.50, "savings": "Save $120", "popular": true, "gifts": [{"name": "Free Shipping", "value": "$10.00"}, {"name": "Free Frother", "value": "$10.00"}]},
        {"id": "option-3", "label": "Buy 3 Get 3 FREE", "quantity": 3, "price": 227, "originalPrice": 377, "perUnit": 75.67, "savings": "Save $150", "popular": false, "gifts": [{"name": "Free Shipping", "value": "$10.00"}, {"name": "Free Frother", "value": "$10.00"}, {"name": "Free Wellness Guide", "value": "$10.00"}]}
      ],
      "images": [
        "https://res.cloudinary.com/dz2yrb1lc/image/upload/v1764629435/kiala/oYx9upllBN3uNyd6FMlGj/kiala/oYx9upllBN3uNyd6FMlGj/w55O7TnVoypkgCQfG_W-4.webp",
        "https://res.cloudinary.com/dz2yrb1lc/image/upload/v1764629434/kiala/oYx9upllBN3uNyd6FMlGj/kiala/oYx9upllBN3uNyd6FMlGj/NoNu4NJG02yOR7NAIyort.webp",
        "https://res.cloudinary.com/dz2yrb1lc/image/upload/v1764629432/kiala/oYx9upllBN3uNyd6FMlGj/kiala/oYx9upllBN3uNyd6FMlGj/JaRqGgHyiM-THb5DN5x2K.webp",
        "https://res.cloudinary.com/dz2yrb1lc/image/upload/v1764629430/kiala/oYx9upllBN3uNyd6FMlGj/kiala/oYx9upllBN3uNyd6FMlGj/pJ8bka2v1UW4nDiOkCiUf.webp",
        "https://res.cloudinary.com/dz2yrb1lc/image/upload/v1764629433/kiala/oYx9upllBN3uNyd6FMlGj/kiala/oYx9upllBN3uNyd6FMlGj/HyVNkl-Y6V4QG5xBEtKws.webp",
        "https://res.cloudinary.com/dz2yrb1lc/image/upload/v1764629431/kiala/oYx9upllBN3uNyd6FMlGj/kiala/oYx9upllBN3uNyd6FMlGj/eErMb2p86_CxRlzEpZQsP.webp"
      ]
    }
  },
  {
    "id": "before-after-slider",
    "type": "before-after-side-by-side",
    "enabled": true,
    "position": 24,
    "config": {
      "headline": "Hilary N.'s Transformation",
      "beforeImage": "https://res.cloudinary.com/dz2yrb1lc/image/upload/v1764629580/kiala/oYx9upllBN3uNyd6FMlGj/kiala/oYx9upllBN3uNyd6FMlGj/hilary-before.jpg",
      "afterImage": "https://res.cloudinary.com/dz2yrb1lc/image/upload/v1764629590/kiala/oYx9upllBN3uNyd6FMlGj/kiala/oYx9upllBN3uNyd6FMlGj/hilary-after.jpg",
      "name": "Hilary N.",
      "age": "56",
      "location": "Denver, CO",
      "timeframe": "12 Weeks",
      "testimonial": "At 56, I thought this was just my new normal—the weight, the hot flashes waking me up at night, the constant bloating. My doctor said it was 'just menopause.' But after 12 weeks with Kiala, I've lost 21 pounds, my hot flashes are rare, and I sleep through the night. This isn't just a supplement—it gave me my quality of life back."
    }
  },
  {
    "id": "final-cta",
    "type": "text-block",
    "enabled": true,
    "position": 25,
    "config": {
      "content": `<div class="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl p-8 mb-6 text-center">
<h2 class="text-2xl md:text-3xl font-bold mb-4">Your Transformation Is Waiting</h2>
<p class="text-lg text-purple-100 mb-6">You can keep trying the same things—cutting more calories, pushing through exhaustion, accepting that "this is just how it is after 40."</p>
<p class="text-lg text-white mb-6"><strong>Or you can address the root cause.</strong></p>
<p class="text-lg text-purple-100 mb-6">One scoop. Every morning. That's all it takes to start healing your gut, rebalancing your hormones, and finally getting results from your efforts.</p>
<p class="text-lg text-white font-medium">Thousands of women in our community have made this choice. The bloating stopped. The hot flashes diminished. The weight started moving. The energy came back.</p>
</div>`,
      "label": "Final CTA"
    }
  },
  {
    "id": "closing-word",
    "type": "text-block",
    "enabled": true,
    "position": 26,
    "config": {
      "content": `<div class="bg-gray-50 border border-gray-200 rounded-xl p-8 mb-6">
<div class="flex flex-col md:flex-row items-start gap-6">
<img src="/uploads/oYx9upllBN3uNyd6FMlGj/WXPCOJ8PPZxy1Mt8H4AYm.jpg" alt="Dr. Amy" class="w-20 h-20 rounded-full border-4 border-white shadow-lg flex-shrink-0" />
<div>
<h3 class="text-xl font-bold text-gray-900 mb-3">A Final Word From Dr. Amy</h3>
<p class="text-gray-700 mb-4">I know how frustrating this journey can be. You've tried so many things. You've been told it's "just aging" or "just menopause." You've wondered if you're doing something wrong.</p>
<p class="text-gray-700 mb-4"><strong>You're not.</strong> Your body is responding to real biological changes—and you deserve a solution that addresses the real cause.</p>
<p class="text-gray-700 mb-4">I've seen thousands of women transform their health by healing their gut first. The weight, the hot flashes, the mood swings, the bloating, the exhaustion—they're all connected to the same root cause. Address that, and everything else follows.</p>
<p class="text-gray-700 mb-4">Kiala Greens is the only product I've found that does this comprehensively, safely, and effectively. I stake my professional reputation on it.</p>
<p class="text-gray-700 mb-4">Give it 90 days. If it doesn't work for you, you get every penny back. But I'm confident you'll feel the difference long before then.</p>
<p class="text-purple-700 font-semibold">Here's to your health,</p>
<p class="text-purple-700 font-bold">— Dr. Amy Heart</p>
</div>
</div>
</div>`,
      "label": "Dr. Amy Closing Word"
    }
  }
];

async function updateArticle() {
  try {
    const widgetConfigJson = JSON.stringify(updatedWidgets);

    await client.execute({
      sql: `UPDATE articles SET widget_config = ? WHERE id = ?`,
      args: [widgetConfigJson, 'k2IxMEsu9zzsw_Hd3BaU4']
    });

    console.log('Article updated successfully!');
    console.log(`Updated ${updatedWidgets.length} widgets`);
  } catch (error) {
    console.error('Error updating article:', error);
  }
}

updateArticle();
