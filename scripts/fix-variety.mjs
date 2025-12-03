// Fix articles: unique images, varied widgets, remove broken product configs
const SITE_ID = 'oYx9upllBN3uNyd6FMlGj';
const BASE_URL = 'https://kiala-app-project.vercel.app';

async function getArticle(slug) {
  const res = await fetch(`${BASE_URL}/api/articles?siteId=${SITE_ID}&slug=${slug}`);
  return (await res.json()).article;
}

async function updateArticle(id, data) {
  const res = await fetch(`${BASE_URL}/api/articles/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.ok;
}

// Unique images for each article
const uniqueImages = {
  'joint-pain-menopause-relief-guide': 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=1200&h=630&fit=crop',
  'menopause-weight-gain-science-solutions': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200&h=630&fit=crop',
  'reduce-bloating-menopause-7-day-plan': 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1200&h=630&fit=crop',
  'menopause-fatigue-energy-solutions': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&h=630&fit=crop',
  'cortisol-stress-menopause-reset': 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=1200&h=630&fit=crop'
};

// Different widget structures for variety
const articleVariety = {
  // Uses symptoms-checker instead of data-overview
  'beat-menopause-brain-fog-naturally': {
    insertAfter: 1, // after hook
    widget: {
      id: "symptoms-1",
      type: "symptoms-checker",
      position: 2,
      enabled: true,
      config: {
        headline: "Is This You?",
        subheading: "Check the symptoms you're experiencing",
        symptoms: [
          { text: "Forgetting words mid-sentence or losing your train of thought" },
          { text: "Walking into rooms and forgetting why" },
          { text: "Difficulty concentrating on tasks you used to handle easily" },
          { text: "Reading the same paragraph multiple times" },
          { text: "Feeling mentally 'foggy' or slow" },
          { text: "Trouble remembering names or appointments" }
        ],
        conclusionHeadline: "These aren't signs of early dementia—they're menopause brain fog",
        conclusionText: "The good news? These symptoms are temporary and treatable. Keep reading for the science and solutions.",
        minSymptoms: 2
      }
    }
  },
  
  // Uses stacked-quotes (testimonials) instead of product showcase
  'sleep-better-during-menopause': {
    insertAfter: 4,
    widget: {
      id: "quotes-1",
      type: "stacked-quotes",
      position: 5,
      enabled: true,
      config: {
        headline: "Women Who've Transformed Their Sleep",
        subheading: "Real results from our community",
        quotes: [
          { id: "1", name: "Karen M.", location: "Denver, CO", result: "Sleeping 7+ hours", rating: 5, content: "After 3 years of waking up at 3am drenched in sweat, I finally sleep through the night. The cooling strategies and magnesium made all the difference.", verified: true },
          { id: "2", name: "Patricia L.", location: "Austin, TX", result: "No more night sweats", rating: 5, content: "I was skeptical about the temperature suggestions, but keeping my room at 66° and using cooling sheets changed everything. I wake up refreshed for the first time in years.", verified: true },
          { id: "3", name: "Susan R.", location: "Chicago, IL", result: "Energy restored", rating: 5, content: "The CBT-I techniques took a few weeks, but now I fall asleep in 15 minutes instead of lying awake for hours. My whole life has improved.", verified: true }
        ],
        showVerifiedBadge: true
      }
    }
  },
  
  // Uses review-grid for social proof
  'menopause-weight-gain-science-solutions': {
    insertAfter: 4,
    widget: {
      id: "reviews-1",
      type: "review-grid",
      position: 5,
      enabled: true,
      config: {
        headline: "Success Stories",
        subheading: "Women who've reset their metabolism",
        reviews: [
          { name: "Margaret T.", verified: true, rating: 5, title: "Finally, the weight is moving!", review: "After following the protein and strength training protocol for 8 weeks, I've lost 12 pounds—mostly from my midsection. My doctor was amazed at my improved blood sugar." },
          { name: "Diana K.", verified: true, rating: 5, title: "Wish I knew this sooner", review: "I was doing everything wrong—too much cardio, not enough protein, skipping meals. This approach actually works with my body instead of against it." },
          { name: "Ellen S.", verified: true, rating: 5, title: "Strength training was the key", review: "I was afraid of weights, but now I'm hooked. My metabolism feels like it's working again and I have so much more energy." },
          { name: "Nancy B.", verified: true, rating: 5, title: "Blood sugar stable at last", review: "The meal timing tips eliminated my afternoon crashes and cravings. I'm not hungry all the time anymore." }
        ]
      }
    }
  },
  
  // Uses symptoms-checker for gut health
  'gut-health-hormone-balance-complete-guide': {
    insertAfter: 1,
    widget: {
      id: "symptoms-gut",
      type: "symptoms-checker", 
      position: 2,
      enabled: true,
      config: {
        headline: "Could Your Gut Be Affecting Your Hormones?",
        subheading: "Check the symptoms you're experiencing",
        symptoms: [
          { text: "Bloating that gets worse throughout the day" },
          { text: "Irregular bowel movements (constipation or diarrhea)" },
          { text: "Mood swings or unexplained anxiety" },
          { text: "Sugar or carb cravings" },
          { text: "Fatigue even after sleeping" },
          { text: "Skin issues like acne or rashes" },
          { text: "Weight gain despite no diet changes" },
          { text: "Brain fog or difficulty concentrating" }
        ],
        conclusionHeadline: "Your gut microbiome may be disrupting your hormones",
        conclusionText: "Research shows gut health directly affects estrogen metabolism, mood, and weight. The protocol below can help restore balance.",
        minSymptoms: 3
      }
    }
  },
  
  // Uses stacked-quotes for joint pain
  'joint-pain-menopause-relief-guide': {
    insertAfter: 3,
    widget: {
      id: "quotes-joint",
      type: "stacked-quotes",
      position: 4,
      enabled: true,
      config: {
        headline: "Women Who Found Relief",
        subheading: "Real experiences from our community",
        quotes: [
          { id: "1", name: "Barbara H.", location: "Phoenix, AZ", result: "Pain-free mornings", rating: 5, content: "My hands were so stiff every morning I couldn't open jars. After 6 weeks of omega-3s and the movement routine, I wake up without pain. I can garden again!", verified: true },
          { id: "2", name: "Carol M.", location: "Seattle, WA", result: "Back to yoga", rating: 5, content: "I thought my joint pain meant I had to stop exercising. Turns out the opposite was true—gentle movement made everything better.", verified: true },
          { id: "3", name: "Janet W.", location: "Miami, FL", result: "Off pain meds", rating: 5, content: "I was taking ibuprofen daily. The anti-inflammatory diet changes took a few weeks, but now I rarely need anything. My doctor is impressed.", verified: true }
        ],
        showVerifiedBadge: true
      }
    }
  },
  
  // Uses review-grid for fatigue
  'menopause-fatigue-energy-solutions': {
    insertAfter: 3,
    widget: {
      id: "reviews-energy",
      type: "review-grid",
      position: 4,
      enabled: true,
      config: {
        headline: "Energy Transformations",
        subheading: "From exhausted to energized",
        reviews: [
          { name: "Linda P.", verified: true, rating: 5, title: "3pm crash is GONE", review: "I used to need 3 cups of coffee just to function. Now one morning cup is plenty. The blood sugar tips and CoQ10 made a huge difference." },
          { name: "Marie T.", verified: true, rating: 5, title: "Finally got my thyroid checked", review: "Turns out my fatigue was partly thyroid. This article prompted me to ask for the right tests. Now I'm properly treated AND following the protocol." },
          { name: "Donna K.", verified: true, rating: 5, title: "Sleeping better = more energy", review: "I didn't realize how much my broken sleep was affecting my days. Fixing sleep first was the game-changer." },
          { name: "Ruth S.", verified: true, rating: 5, title: "Iron was the missing piece", review: "My ferritin was 15—no wonder I was exhausted! Thank you for mentioning this. Supplement + protocol = new woman." }
        ]
      }
    }
  }
};

async function main() {
  console.log('Fixing articles: unique images + varied widgets...\n');
  
  // First, fix duplicate images
  for (const [slug, newImage] of Object.entries(uniqueImages)) {
    const article = await getArticle(slug);
    if (!article) continue;
    
    let widgets = JSON.parse(article.widget_config || '[]');
    
    // Update hero image in widgets
    widgets = widgets.map(w => {
      if (w.type === 'text-block' && w.config?.content?.includes('<img')) {
        w.config.content = `<img src="${newImage}" alt="${article.title}" class="w-full rounded-xl shadow-lg mb-6" />`;
      }
      return w;
    });
    
    process.stdout.write(`Fixing image: ${slug}... `);
    const success = await updateArticle(article.id, {
      ...article,
      image: newImage,
      widget_config: JSON.stringify(widgets),
      site_id: SITE_ID
    });
    console.log(success ? '✓' : '✗');
    await new Promise(r => setTimeout(r, 300));
  }
  
  // Then, add variety widgets and remove broken product-showcase
  for (const [slug, variety] of Object.entries(articleVariety)) {
    const article = await getArticle(slug);
    if (!article) continue;
    
    let widgets = JSON.parse(article.widget_config || '[]');
    
    // Remove any product-showcase widgets (they were broken)
    widgets = widgets.filter(w => w.type !== 'product-showcase');
    
    // Reposition remaining widgets
    widgets = widgets.map((w, i) => ({ ...w, position: i }));
    
    // Insert variety widget at specified position
    const insertPos = variety.insertAfter + 1;
    const newWidget = { ...variety.widget, position: insertPos };
    widgets.splice(insertPos, 0, newWidget);
    
    // Reposition all widgets
    widgets = widgets.map((w, i) => ({ ...w, position: i }));
    
    process.stdout.write(`Adding variety: ${slug}... `);
    const success = await updateArticle(article.id, {
      ...article,
      widget_config: JSON.stringify(widgets),
      site_id: SITE_ID
    });
    console.log(success ? '✓' : '✗');
    await new Promise(r => setTimeout(r, 300));
  }
  
  console.log('\nDone! Articles now have unique images and varied widgets.');
}

main();
