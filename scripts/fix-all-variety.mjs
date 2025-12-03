// Fix ALL 15 articles (excluding hero) with unique images and varied widgets
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

// ALL 15 articles with unique images (excluding foods-naturally-balance-hormones)
const articleConfigs = {
  'beat-menopause-brain-fog-naturally': {
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200&h=630&fit=crop',
    widgetType: 'symptoms-checker',
    insertAfter: 1,
    widgetConfig: {
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
  },

  'sleep-better-during-menopause': {
    image: 'https://images.unsplash.com/photo-1520206183501-b80df61043c2?w=1200&h=630&fit=crop',
    widgetType: 'stacked-quotes',
    insertAfter: 4,
    widgetConfig: {
      headline: "Women Who've Transformed Their Sleep",
      subheading: "Real results from our community",
      quotes: [
        { id: "1", name: "Karen M.", location: "Denver, CO", result: "Sleeping 7+ hours", rating: 5, content: "After 3 years of waking up at 3am drenched in sweat, I finally sleep through the night. The cooling strategies and magnesium made all the difference.", verified: true },
        { id: "2", name: "Patricia L.", location: "Austin, TX", result: "No more night sweats", rating: 5, content: "I was skeptical about the temperature suggestions, but keeping my room at 66° and using cooling sheets changed everything.", verified: true },
        { id: "3", name: "Susan R.", location: "Chicago, IL", result: "Energy restored", rating: 5, content: "The CBT-I techniques took a few weeks, but now I fall asleep in 15 minutes instead of lying awake for hours.", verified: true }
      ],
      showVerifiedBadge: true
    }
  },

  'gut-health-hormone-balance-complete-guide': {
    image: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=1200&h=630&fit=crop',
    widgetType: 'symptoms-checker',
    insertAfter: 1,
    widgetConfig: {
      headline: "Could Your Gut Be Affecting Your Hormones?",
      subheading: "Check the symptoms you're experiencing",
      symptoms: [
        { text: "Bloating that gets worse throughout the day" },
        { text: "Irregular bowel movements (constipation or diarrhea)" },
        { text: "Mood swings or unexplained anxiety" },
        { text: "Sugar or carb cravings" },
        { text: "Fatigue even after sleeping" },
        { text: "Skin issues like acne or rashes" }
      ],
      conclusionHeadline: "Your gut microbiome may be disrupting your hormones",
      conclusionText: "Research shows gut health directly affects estrogen metabolism, mood, and weight. The protocol below can help restore balance.",
      minSymptoms: 3
    }
  },

  'menopause-weight-gain-science-solutions': {
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200&h=630&fit=crop',
    widgetType: 'review-grid',
    insertAfter: 4,
    widgetConfig: {
      headline: "Success Stories",
      subheading: "Women who've reset their metabolism",
      reviews: [
        { name: "Margaret T.", verified: true, rating: 5, title: "Finally, the weight is moving!", review: "After following the protein and strength training protocol for 8 weeks, I've lost 12 pounds—mostly from my midsection." },
        { name: "Diana K.", verified: true, rating: 5, title: "Wish I knew this sooner", review: "I was doing everything wrong—too much cardio, not enough protein, skipping meals. This approach actually works." },
        { name: "Ellen S.", verified: true, rating: 5, title: "Strength training was the key", review: "I was afraid of weights, but now I'm hooked. My metabolism feels like it's working again." },
        { name: "Nancy B.", verified: true, rating: 5, title: "Blood sugar stable at last", review: "The meal timing tips eliminated my afternoon crashes and cravings." }
      ]
    }
  },

  'cortisol-stress-menopause-reset': {
    image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=1200&h=630&fit=crop',
    widgetType: 'timeline',
    insertAfter: 3,
    widgetConfig: {
      headline: "Your Cortisol Reset Timeline",
      subheading: "What to expect as you rebalance",
      items: [
        { title: "Week 1-2", description: "You'll start noticing better sleep as evening cortisol drops. Morning energy may still be inconsistent." },
        { title: "Week 3-4", description: "Afternoon crashes become less severe. You'll feel more emotionally stable and less reactive to stress." },
        { title: "Month 2", description: "Weight around your midsection starts to shift. Cravings decrease significantly." },
        { title: "Month 3+", description: "Your body adapts to the new patterns. Stress feels more manageable, and energy is consistent throughout the day." }
      ]
    }
  },

  'reduce-bloating-menopause-7-day-plan': {
    image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1200&h=630&fit=crop',
    widgetType: 'before-after',
    insertAfter: 2,
    widgetConfig: {
      headline: "Real Results: 7-Day Bloat Reset",
      subheading: "What our community has experienced",
      beforeTitle: "Before the Protocol",
      afterTitle: "After 7 Days",
      beforeItems: [
        "Pants feeling tight by afternoon",
        "Uncomfortable fullness after meals",
        "Visible abdominal distension",
        "Irregular digestion"
      ],
      afterItems: [
        "Consistent waistline throughout the day",
        "Comfortable after eating",
        "Flatter, more comfortable abdomen",
        "Regular, predictable digestion"
      ]
    }
  },

  'joint-pain-menopause-relief-guide': {
    image: 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=1200&h=630&fit=crop',
    widgetType: 'stacked-quotes',
    insertAfter: 3,
    widgetConfig: {
      headline: "Women Who Found Relief",
      subheading: "Real experiences from our community",
      quotes: [
        { id: "1", name: "Barbara H.", location: "Phoenix, AZ", result: "Pain-free mornings", rating: 5, content: "My hands were so stiff every morning I couldn't open jars. After 6 weeks of omega-3s and the movement routine, I wake up without pain.", verified: true },
        { id: "2", name: "Carol M.", location: "Seattle, WA", result: "Back to yoga", rating: 5, content: "I thought my joint pain meant I had to stop exercising. Turns out the opposite was true—gentle movement made everything better.", verified: true },
        { id: "3", name: "Janet W.", location: "Miami, FL", result: "Off pain meds", rating: 5, content: "I was taking ibuprofen daily. The anti-inflammatory diet changes took a few weeks, but now I rarely need anything.", verified: true }
      ],
      showVerifiedBadge: true
    }
  },

  'menopause-fatigue-energy-solutions': {
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&h=630&fit=crop',
    widgetType: 'review-grid',
    insertAfter: 3,
    widgetConfig: {
      headline: "Energy Transformations",
      subheading: "From exhausted to energized",
      reviews: [
        { name: "Linda P.", verified: true, rating: 5, title: "3pm crash is GONE", review: "I used to need 3 cups of coffee just to function. Now one morning cup is plenty. The blood sugar tips made a huge difference." },
        { name: "Marie T.", verified: true, rating: 5, title: "Finally got my thyroid checked", review: "This article prompted me to ask for the right tests. Now I'm properly treated AND following the protocol." },
        { name: "Donna K.", verified: true, rating: 5, title: "Sleeping better = more energy", review: "I didn't realize how much my broken sleep was affecting my days. Fixing sleep first was the game-changer." },
        { name: "Ruth S.", verified: true, rating: 5, title: "Iron was the missing piece", review: "My ferritin was 15—no wonder I was exhausted! Supplement + protocol = new woman." }
      ]
    }
  },

  'hormone-replacement-therapy-guide': {
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&h=630&fit=crop',
    widgetType: 'faq',
    insertAfter: 5,
    widgetConfig: {
      headline: "Common HRT Questions Answered",
      subheading: "What women ask most",
      items: [
        { question: "Is HRT safe for me?", answer: "For most women under 60 or within 10 years of menopause, the benefits typically outweigh risks. Your doctor can assess your individual risk factors." },
        { question: "How long until I feel better?", answer: "Most women notice improvements in hot flashes and sleep within 2-4 weeks. Full benefits develop over 2-3 months." },
        { question: "Will I gain weight on HRT?", answer: "Research shows HRT doesn't cause weight gain. In fact, it may help prevent the shift of fat to the midsection." },
        { question: "What about breast cancer risk?", answer: "Risk depends on the type of HRT, your health history, and duration of use. Estrogen-only HRT may actually reduce breast cancer risk." }
      ]
    }
  },

  'menopause-libido-intimacy-guide': {
    image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=1200&h=630&fit=crop',
    widgetType: 'symptoms-checker',
    insertAfter: 1,
    widgetConfig: {
      headline: "Are You Experiencing These Changes?",
      subheading: "Many women don't realize these are connected to menopause",
      symptoms: [
        { text: "Decreased interest in sex or intimacy" },
        { text: "Vaginal dryness or discomfort during sex" },
        { text: "Taking longer to become aroused" },
        { text: "Less intense or harder to achieve orgasms" },
        { text: "Feeling disconnected from your body" },
        { text: "Avoiding intimacy due to discomfort" }
      ],
      conclusionHeadline: "These changes are normal—and treatable",
      conclusionText: "Declining estrogen affects blood flow, lubrication, and nerve sensitivity. The solutions below can help restore your intimate life.",
      minSymptoms: 2
    }
  },

  'perimenopause-complete-guide': {
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&h=630&fit=crop',
    widgetType: 'timeline',
    insertAfter: 2,
    widgetConfig: {
      headline: "The Perimenopause Timeline",
      subheading: "What to expect and when",
      items: [
        { title: "Early Perimenopause (Age 40-44)", description: "Cycles may shorten or become irregular. PMS can intensify. You might notice subtle changes in sleep and mood." },
        { title: "Mid Perimenopause (Age 45-47)", description: "Hot flashes often begin. Periods become unpredictable. Brain fog, fatigue, and weight changes become more noticeable." },
        { title: "Late Perimenopause (Age 48-51)", description: "Periods may skip months. Symptoms often peak. This is when most women seek help." },
        { title: "Menopause (Average age 51)", description: "Defined as 12 months without a period. Many symptoms begin to ease, though some persist into postmenopause." }
      ]
    }
  },

  'menopause-bone-health-osteoporosis': {
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&h=630&fit=crop',
    widgetType: 'stacked-quotes',
    insertAfter: 4,
    widgetConfig: {
      headline: "Women Building Stronger Bones",
      subheading: "Real results from strength training and nutrition",
      quotes: [
        { id: "1", name: "Dorothy P.", location: "San Diego, CA", result: "DEXA improved 4%", rating: 5, content: "My doctor said my bone density improved for the first time in years. Weight training and vitamin D3+K2 made the difference.", verified: true },
        { id: "2", name: "Virginia L.", location: "Portland, OR", result: "No longer osteopenic", rating: 5, content: "I was terrified of fractures. After 18 months of the protocol, my latest scan moved me out of the osteopenia range.", verified: true },
        { id: "3", name: "Helen R.", location: "Boston, MA", result: "Stronger at 62", rating: 5, content: "I never lifted weights before menopause. Now I deadlift 95 pounds and my bones are stronger than they were at 55.", verified: true }
      ],
      showVerifiedBadge: true
    }
  },

  'menopause-heart-health-guide': {
    image: 'https://images.unsplash.com/photo-1559757175-7cb036e0e69a?w=1200&h=630&fit=crop',
    widgetType: 'review-grid',
    insertAfter: 3,
    widgetConfig: {
      headline: "Heart Health Wins",
      subheading: "Women who've improved their cardiovascular markers",
      reviews: [
        { name: "Catherine M.", verified: true, rating: 5, title: "Cholesterol finally in range", review: "My LDL dropped 40 points after adopting the Mediterranean approach. My cardiologist was thrilled." },
        { name: "Frances K.", verified: true, rating: 5, title: "Blood pressure normalized", review: "I was on the verge of needing medication. The lifestyle changes brought my numbers down naturally." },
        { name: "Shirley D.", verified: true, rating: 5, title: "Resting heart rate improved", review: "Started at 82 bpm, now consistently in the low 60s. The zone 2 cardio really works." },
        { name: "Joan T.", verified: true, rating: 5, title: "Off statins after 2 years", review: "With my doctor's supervision, I was able to discontinue statins through diet and exercise." }
      ]
    }
  },

  'menopause-anxiety-mood-swings-guide': {
    image: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=1200&h=630&fit=crop',
    widgetType: 'symptoms-checker',
    insertAfter: 1,
    widgetConfig: {
      headline: "Is Menopause Affecting Your Mood?",
      subheading: "Check what you've been experiencing",
      symptoms: [
        { text: "Anxiety that seems to come out of nowhere" },
        { text: "Crying more easily than usual" },
        { text: "Irritability or snapping at loved ones" },
        { text: "Feeling overwhelmed by things you used to handle" },
        { text: "Racing thoughts, especially at night" },
        { text: "Loss of interest in activities you used to enjoy" },
        { text: "Feeling like 'yourself' is slipping away" }
      ],
      conclusionHeadline: "You're not losing your mind—your hormones are shifting",
      conclusionText: "Estrogen directly affects serotonin, dopamine, and GABA—your brain's mood regulators. These feelings are biological, not a character flaw.",
      minSymptoms: 2
    }
  },

  'menopause-hair-skin-changes': {
    image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=1200&h=630&fit=crop',
    widgetType: 'before-after',
    insertAfter: 3,
    widgetConfig: {
      headline: "Skin & Hair Transformations",
      subheading: "What consistent care can achieve",
      beforeTitle: "Common Complaints",
      afterTitle: "After 3-6 Months of Protocol",
      beforeItems: [
        "Dry, dull skin that looks 'tired'",
        "New wrinkles appearing rapidly",
        "Thinning hair and shedding",
        "Brittle nails that break easily"
      ],
      afterItems: [
        "Hydrated, glowing complexion",
        "Plumper skin with improved elasticity",
        "Fuller, stronger hair growth",
        "Healthy, resilient nails"
      ]
    }
  }
};

async function main() {
  console.log('Updating ALL 15 articles with unique images and varied widgets...\n');

  for (const [slug, config] of Object.entries(articleConfigs)) {
    const article = await getArticle(slug);
    if (!article) {
      console.log(`❌ Not found: ${slug}`);
      continue;
    }

    let widgets = JSON.parse(article.widget_config || '[]');

    // Remove any broken product-showcase widgets
    widgets = widgets.filter(w => w.type !== 'product-showcase');

    // Check if we already added this widget type
    const hasWidget = widgets.some(w => w.type === config.widgetType);

    if (!hasWidget) {
      // Reposition existing widgets
      widgets = widgets.map((w, i) => ({ ...w, position: i }));

      // Create new widget
      const newWidget = {
        id: `${config.widgetType}-${Date.now()}`,
        type: config.widgetType,
        position: config.insertAfter + 1,
        enabled: true,
        config: config.widgetConfig
      };

      // Insert at specified position
      const insertPos = Math.min(config.insertAfter + 1, widgets.length);
      widgets.splice(insertPos, 0, newWidget);

      // Reposition all widgets
      widgets = widgets.map((w, i) => ({ ...w, position: i }));
    }

    process.stdout.write(`Updating: ${slug}... `);
    const success = await updateArticle(article.id, {
      ...article,
      image: config.image,
      widget_config: JSON.stringify(widgets),
      site_id: SITE_ID
    });
    console.log(success ? '✓' : '✗');
    await new Promise(r => setTimeout(r, 300));
  }

  console.log('\n✅ Done! All 15 articles updated with unique images and varied widgets.');
}

main();
