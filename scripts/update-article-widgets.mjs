import Database from 'better-sqlite3';

const db = new Database('./data/kiala.db');

// Get the current article widgets
const article = db.prepare("SELECT widget_config FROM articles WHERE id = 'k2IxMEsu9zzsw_Hd3BaU4'").get();
let widgets = JSON.parse(article.widget_config);

// Find the data-overview widget and update with menopause stats
const dataOverviewIndex = widgets.findIndex(w => w.type === 'data-overview');
if (dataOverviewIndex >= 0) {
  widgets[dataOverviewIndex].config = {
    headline: "The Results Women Over 40 Are Seeing",
    subheading: "Based on real customer feedback",
    stats: [
      { value: "98%", label: "Saw visible shift in midsection" },
      { value: "92%", label: "Felt lighter in 2-5 days" },
      { value: "90%", label: "Boosted energy & clearer focus" },
      { value: "1-2 Weeks", label: "Reduction in midsection puffiness" }
    ],
    source: "Based on customer surveys",
    style: "featured"
  };
}

// Create new widgets for the article
const newWidgets = [
  // Testimonial Hero - insert after the first text block (after intro image)
  {
    id: 'widget-testimonial-hero-1',
    type: 'testimonial-hero',
    position: 2,
    enabled: true,
    config: {
      headline: "I Lost 22 lbs and My Energy is Through the Roof!",
      body: `"At 52, I thought feeling tired and bloated was just part of getting older. I tried everything—different diets, expensive supplements, even considered medications. Nothing worked until I found Kiala Greens.

Within the first week, my bloating was GONE. By week 4, I had more energy than I'd felt in years. And now, 8 weeks later? I've lost 22 pounds—most of it from my midsection—and I feel like I'm in my 30s again.

If you're on the fence, just try it. The 90-day guarantee means you have nothing to lose (except the weight!). This has honestly changed my life."

— Jennifer M., 52, Austin TX`,
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=800&fit=crop&crop=face",
      buttonText: "TRY NOW - SAVE 50%",
      buttonUrl: "https://kialanutrition.com/products/kiala-greens",
      target: "_self",
      benefits: [
        { icon: "rotate", text: "90-Day Money Back Guarantee" },
        { icon: "shield", text: "No Risk" },
        { icon: "gift", text: "Free Gifts Included" }
      ]
    }
  },
  // Review Grid - insert after symptoms checker
  {
    id: 'widget-review-grid-1',
    type: 'review-grid',
    position: 5,
    enabled: true,
    config: {
      headline: "Real Results From Real Women",
      subheading: "Join thousands who have transformed their health",
      buttonText: "Try It Now →",
      buttonUrl: "https://kialanutrition.com/products/kiala-greens",
      target: "_self",
      reviews: [
        {
          name: "Jennifer M.",
          verified: true,
          rating: 5,
          title: "Finally flat stomach!",
          review: "The bloating I had for years is completely gone. I feel lighter and my clothes fit so much better!",
          image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face"
        },
        {
          name: "Sarah K.",
          verified: true,
          rating: 5,
          title: "Energy is through the roof",
          review: "No more 3pm crashes. I have consistent energy all day and sleep better at night too.",
          image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face"
        },
        {
          name: "Michelle R.",
          verified: true,
          rating: 5,
          title: "Lost 15 lbs in 8 weeks",
          review: "The stubborn belly fat that wouldn't budge for years finally started coming off!",
          image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face"
        },
        {
          name: "Linda P.",
          verified: true,
          rating: 5,
          title: "Brain fog is GONE",
          review: "I can think clearly again. My focus and memory are so much better. Game changer!",
          image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face"
        }
      ]
    }
  },
  // Press Logos - insert after review grid
  {
    id: 'widget-press-logos-1',
    type: 'press-logos',
    position: 6,
    enabled: true,
    config: {
      headline: "As Featured In"
    }
  },
  // Scrolling Thumbnails - insert before final CTA
  {
    id: 'widget-scrolling-thumbs-1',
    type: 'scrolling-thumbnails',
    position: 15,
    enabled: true,
    config: {
      headline: "Join 1,000,000+ Happy Customers",
      speed: 30,
      imageHeight: 100
    }
  }
];

// Insert new widgets at specific positions
// First, insert testimonial hero at position 2
widgets.splice(2, 0, newWidgets[0]);

// Insert review grid at position 5 (after symptoms checker, which is now at position 4)
widgets.splice(5, 0, newWidgets[1]);

// Insert press logos right after review grid
widgets.splice(6, 0, newWidgets[2]);

// Insert scrolling thumbnails near the end (before final CTA)
widgets.splice(widgets.length - 2, 0, newWidgets[3]);

// Update positions for all widgets
widgets.forEach((widget, index) => {
  widget.position = index;
});

// Update the article
const updateStmt = db.prepare("UPDATE articles SET widget_config = ?, updated_at = datetime('now') WHERE id = 'k2IxMEsu9zzsw_Hd3BaU4'");
updateStmt.run(JSON.stringify(widgets));

console.log('Article updated!');
console.log('New widget count:', widgets.length);
console.log('Widgets:');
widgets.forEach((w, i) => console.log('  ' + i + ':', w.type, '-', (w.config?.headline || '').substring(0, 40)));

db.close();
