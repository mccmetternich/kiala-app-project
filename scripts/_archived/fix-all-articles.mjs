// Fix all articles (except hero) with proper HTML-formatted widgets
// This ensures consistent rendering with the hero article format

const SITE_ID = 'oYx9upllBN3uNyd6FMlGj';
const BASE_URL = 'https://kiala-app-project.vercel.app';
const HERO_SLUG = 'foods-naturally-balance-hormones';

// Helper to convert markdown to HTML
function mdToHtml(text) {
  if (!text) return '';
  return text
    // Headers
    .replace(/^### (.*?)$/gm, '<h3 class="text-xl font-semibold text-gray-900 mt-6 mb-3">$1</h3>')
    .replace(/^## (.*?)$/gm, '<h2 class="text-2xl font-bold text-gray-900 mt-8 mb-4">$1</h2>')
    // Bold and italic
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Lists - handle multi-line
    .replace(/^- (.*?)$/gm, '<li class="ml-4 mb-2">$1</li>')
    // Paragraphs
    .split('\n\n')
    .map(p => {
      p = p.trim();
      if (!p) return '';
      if (p.startsWith('<h') || p.startsWith('<li') || p.startsWith('<ul') || p.startsWith('<div')) return p;
      if (p.includes('<li')) return `<ul class="list-disc pl-6 my-4 space-y-1">${p}</ul>`;
      return `<p class="text-gray-700 leading-relaxed mb-4">${p}</p>`;
    })
    .join('\n');
}

// Article definitions with unique images and full content
const articleFixes = {
  'perimenopause-complete-guide': {
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&h=630&fit=crop',
    title: "The Complete Perimenopause Guide: What to Expect, When to Expect It, and What Actually Helps",
    excerpt: "Perimenopause can start in your late 30s and last a decade. Here's everything you need to know about this transformative transition.",
    category: "Perimenopause",
    read_time: 12
  },
  'hormone-replacement-therapy-guide': {
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&h=630&fit=crop',
    title: "HRT Demystified: The Evidence-Based Guide to Hormone Replacement Therapy",
    excerpt: "Confused about HRT? Here's what the latest research actually shows about benefits, risks, and how to decide if it's right for you.",
    category: "Medical Treatments",
    read_time: 12
  },
  'menopause-libido-intimacy-guide': {
    image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=1200&h=630&fit=crop',
    title: "Reclaiming Desire: The Complete Guide to Libido and Intimacy During Menopause",
    excerpt: "Low libido and intimacy changes aren't inevitable. Here's the science and evidence-based solutions.",
    category: "Intimacy & Wellness",
    read_time: 10
  },
  'menopause-anxiety-mood-swings-guide': {
    image: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=1200&h=630&fit=crop',
    title: "The Menopause Mood Crisis: Understanding Anxiety, Irritability, and Emotional Changes",
    excerpt: "Those mood swings and sudden anxiety aren't 'in your head'—they're in your hormones. Here's your path to emotional stability.",
    category: "Mental Wellness",
    read_time: 10
  },
  'menopause-heart-health-guide': {
    image: 'https://images.unsplash.com/photo-1559757175-7cb036e0e69a?w=1200&h=630&fit=crop',
    title: "Protecting Your Heart After 40: The Menopause-Heart Disease Connection Every Woman Must Know",
    excerpt: "Heart disease risk increases dramatically after menopause. Understanding why—and what to do—could save your life.",
    category: "Heart Health",
    read_time: 9
  },
  'menopause-bone-health-osteoporosis': {
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&h=630&fit=crop',
    title: "Building Bones for Life: The Complete Guide to Preventing Osteoporosis After 40",
    excerpt: "Bone loss accelerates after menopause. Here's how to measure your risk and build strong bones for life.",
    category: "Bone Health",
    read_time: 9
  },
  'cortisol-stress-menopause-reset': {
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&h=630&fit=crop',
    title: "The Cortisol Connection: Why Stress Hits Different After 40 (And How to Reset)",
    excerpt: "Chronic stress disrupts your hormones more severely after 40. Here's the science and your action plan.",
    category: "Hormone Health",
    read_time: 9
  },
  'joint-pain-menopause-relief-guide': {
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=630&fit=crop',
    title: "Menopause Joint Pain: Why Everything Hurts Now and What Actually Helps",
    excerpt: "That new stiffness isn't aging—it's estrogen loss. Here's the science and your relief plan.",
    category: "Body Health",
    read_time: 8
  },
  'menopause-fatigue-energy-solutions': {
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&h=630&fit=crop',
    title: "Crushing Menopause Fatigue: Why You're Exhausted and How to Reclaim Your Energy",
    excerpt: "That bone-deep exhaustion isn't laziness—it's hormonal. Here's your energy restoration plan.",
    category: "Energy & Vitality",
    read_time: 9
  },
  'menopause-hair-skin-changes': {
    image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=1200&h=630&fit=crop',
    title: "Menopause Hair and Skin Changes: The Complete Guide to Looking Vibrant After 40",
    excerpt: "Thinning hair and drier skin aren't inevitable—they're hormonal. Here's how to address them.",
    category: "Beauty & Wellness",
    read_time: 10
  },
  'beat-menopause-brain-fog-naturally': {
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200&h=630&fit=crop',
    title: "Menopause Brain Fog: The Science Behind It and 7 Proven Ways to Get Your Sharp Mind Back",
    excerpt: "Struggling to find words? Forgetting why you walked into a room? Here's the science and solutions.",
    category: "Brain Health",
    read_time: 9
  },
  'reduce-bloating-menopause-7-day-plan': {
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&h=630&fit=crop',
    title: "The 7-Day Menopause Bloating Reset: A Step-by-Step Plan That Actually Works",
    excerpt: "That uncomfortable bloating is hormonal. Here's a day-by-day plan to finally feel comfortable again.",
    category: "Digestive Health",
    read_time: 8
  },
  'sleep-better-during-menopause': {
    image: 'https://images.unsplash.com/photo-1520206183501-b80df61043c2?w=1200&h=630&fit=crop',
    title: "The Menopause Sleep Crisis: A Doctor's Guide to Finally Getting Rest",
    excerpt: "Those 3 AM wake-ups aren't random. Here's the science of menopausal sleep disruption and how to fix it.",
    category: "Sleep Health",
    read_time: 10
  },
  'gut-health-hormone-balance-complete-guide': {
    image: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=1200&h=630&fit=crop',
    title: "Your Gut Is Controlling Your Hormones: The Complete Guide to the Gut-Hormone Connection After 40",
    excerpt: "Your gut microbiome directly influences estrogen levels, weight, mood, and inflammation.",
    category: "Gut Health",
    read_time: 11
  },
  'menopause-weight-gain-science-solutions': {
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=630&fit=crop',
    title: "Menopause Weight Gain: The Science Behind It and the Solutions That Actually Work",
    excerpt: "That unexplained weight gain isn't your fault—it's metabolic. Here's what research reveals.",
    category: "Weight Management",
    read_time: 10
  }
};

async function getArticle(slug) {
  const res = await fetch(`${BASE_URL}/api/articles?siteId=${SITE_ID}&slug=${slug}`);
  const data = await res.json();
  return data.article;
}

async function updateArticle(id, data) {
  const res = await fetch(`${BASE_URL}/api/articles/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.ok;
}

async function fixArticle(slug) {
  const article = await getArticle(slug);
  if (!article) {
    console.log(`✗ Not found: ${slug}`);
    return false;
  }

  const fix = articleFixes[slug];
  if (!fix) {
    console.log(`✗ No fix defined: ${slug}`);
    return false;
  }

  // Parse existing widgets
  let widgets = [];
  try {
    widgets = JSON.parse(article.widget_config);
  } catch (e) {
    console.log(`✗ Invalid widget config: ${slug}`);
    return false;
  }

  // Convert widgets to text-block format where needed
  const convertedWidgets = widgets.map((widget, idx) => {
    // Keep these widget types as-is (they have proper handlers)
    const keepTypes = [
      'product-showcase', 'testimonial', 'before-after-side-by-side',
      'before-after-comparison', 'review-grid', 'timeline', 'expectation-timeline',
      'faq', 'faq-accordion', 'symptoms-checker', 'data-overview',
      'stacked-quotes', 'special-offer', 'exclusive-product', 'shop-now',
      'email-capture', 'cta-button', 'press-logos', 'trust-badges'
    ];

    if (keepTypes.includes(widget.type)) {
      return widget;
    }

    // Convert hero-image to text-block
    if (widget.type === 'hero-image') {
      return {
        id: widget.id,
        type: 'text-block',
        position: widget.position,
        enabled: true,
        config: {
          content: `<img src="${widget.config.image}" alt="${widget.config.alt || 'Article image'}" class="w-full rounded-xl shadow-lg mb-6" />`
        }
      };
    }

    // Convert opening-hook to text-block
    if (widget.type === 'opening-hook') {
      return {
        id: widget.id,
        type: 'text-block',
        position: widget.position,
        enabled: true,
        config: {
          content: `<div class="text-lg text-gray-700 leading-relaxed mb-8">${mdToHtml(widget.config.content)}</div>`
        }
      };
    }

    // Convert main-content to text-block
    if (widget.type === 'main-content') {
      return {
        id: widget.id,
        type: 'text-block',
        position: widget.position,
        enabled: true,
        config: {
          content: `<div class="prose prose-lg max-w-none">${mdToHtml(widget.config.content)}</div>`
        }
      };
    }

    // Convert final-cta to cta-button
    if (widget.type === 'final-cta') {
      return {
        id: widget.id,
        type: 'cta-button',
        position: widget.position,
        enabled: true,
        config: {
          headline: widget.config.headline,
          subheading: widget.config.content,
          buttonText: widget.config.buttonText || 'Get the Free Guide',
          buttonUrl: widget.config.buttonUrl || '#newsletter',
          style: 'primary'
        }
      };
    }

    // Default: keep as-is but log
    console.log(`   Keeping unknown type: ${widget.type}`);
    return widget;
  });

  // Update the article
  const success = await updateArticle(article.id, {
    title: fix.title || article.title,
    excerpt: fix.excerpt || article.excerpt,
    content: fix.excerpt || article.content,
    slug: article.slug,
    category: fix.category || article.category,
    image: fix.image,
    featured: true,
    trending: article.trending || false,
    hero: article.hero || false,
    published: true,
    read_time: fix.read_time || article.read_time,
    widget_config: JSON.stringify(convertedWidgets),
    site_id: SITE_ID
  });

  return success;
}

async function main() {
  console.log('Fixing all articles (except hero)...\n');

  const slugs = Object.keys(articleFixes);
  let fixed = 0;
  let failed = 0;

  for (const slug of slugs) {
    if (slug === HERO_SLUG) {
      console.log(`⏭ Skipping hero: ${slug}`);
      continue;
    }

    process.stdout.write(`Fixing: ${slug}... `);
    const success = await fixArticle(slug);

    if (success) {
      console.log('✓');
      fixed++;
    } else {
      console.log('✗');
      failed++;
    }
  }

  console.log(`\n✓ Fixed ${fixed} articles`);
  if (failed > 0) {
    console.log(`✗ Failed ${failed} articles`);
  }
}

main();
