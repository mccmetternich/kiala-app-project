// Batch 5: Create 3 new articles
// Topics: Libido/Intimacy, Perimenopause Guide, HRT Deep Dive

const SITE_ID = 'oYx9upllBN3uNyd6FMlGj';
const BASE_URL = 'http://localhost:3000';

const newArticles = [
  {
    slug: 'menopause-libido-intimacy-guide',
    title: "Reclaiming Desire: The Complete Guide to Libido and Intimacy During Menopause",
    excerpt: "Low libido, painful sex, and feeling disconnected from your body aren't inevitable. Here's the science behind menopausal intimacy changes and evidence-based solutions.",
    content: "Low libido, painful sex, and feeling disconnected from your body aren't inevitable. Here's the science behind menopausal intimacy changes and evidence-based solutions.",
    featured_image: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=1200&h=630&fit=crop",
    category: "Intimacy & Wellness",
    read_time: 10,
    widget_config: JSON.stringify([
      {
        id: "hero-1",
        type: "hero-image",
        position: 0,
        enabled: true,
        config: {
          image: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=1200&h=630&fit=crop",
          alt: "Intimate connection and wellness",
          overlay: true
        }
      },
      {
        id: "hook-1",
        type: "opening-hook",
        position: 1,
        enabled: true,
        config: {
          content: `Let's talk about what nobody talks about: your sex life after 40.

Maybe desire has vanished. Maybe sex has become uncomfortable or even painful. Maybe you feel disconnected from your body in ways you've never experienced before. And maybe you're wondering if this is just "how it is now."

**It doesn't have to be.**

Sexual changes during menopause are real, biological, and incredibly common—affecting up to 75% of women. But they're also addressable. Understanding what's happening is the first step to reclaiming this part of your life.

*A 2019 study in Menopause journal found that 67% of women reported decreased sexual satisfaction during the menopause transition, yet fewer than 20% had discussed it with their healthcare provider.*

Let's break the silence and get you real solutions.`
        }
      },
      {
        id: "content-1",
        type: "main-content",
        position: 2,
        enabled: true,
        config: {
          content: `## What's Actually Happening to Your Body

### Hormonal Changes Affecting Desire

**Estrogen Decline:**
- Vaginal tissue thins and loses elasticity
- Natural lubrication decreases significantly
- Blood flow to genitals reduces
- Nerve sensitivity can change
- These changes can make arousal slower and sex uncomfortable

**Testosterone Changes:**
- Women produce testosterone too—and it affects desire
- Levels decline gradually through the 40s
- Testosterone influences libido, arousal, and orgasm
- Some women notice significant desire drop with testosterone decline

**Progesterone Decline:**
- Affects mood and relaxation
- Can contribute to anxiety that inhibits desire
- Sleep disruption from low progesterone affects everything

### Physical Changes

**Vulvovaginal Atrophy (Genitourinary Syndrome of Menopause - GSM):**
This affects up to 50% of postmenopausal women:
- Vaginal dryness
- Itching or burning
- Painful intercourse (dyspareunia)
- Urinary symptoms
- Thin, fragile tissue that tears easily

Unlike hot flashes, GSM doesn't improve with time—it typically worsens without treatment.

**Pelvic Floor Changes:**
- Muscles may weaken
- Prolapse can occur
- Incontinence affects intimacy
- Less strength = less sensation

### Psychological Factors

Menopause doesn't happen in a vacuum:
- Body image changes as bodies change
- Stress from life circumstances (aging parents, career, etc.)
- Relationship dynamics shift over time
- Depression and anxiety from hormonal changes
- Sleep deprivation destroys desire
- Self-consciousness about changes

## The Desire Framework

Understanding desire helps address it:

**Spontaneous Desire:**
- Random "out of nowhere" sexual thoughts
- What we typically think of as libido
- Often decreases with age and hormone changes
- Men tend to have more of this type

**Responsive Desire:**
- Desire that emerges in response to arousal
- You may not feel desire UNTIL you begin intimate activity
- Completely normal and valid
- Becomes more common for women over time

**Key insight:** Many women shift from spontaneous to responsive desire during menopause. This isn't "broken"—it's different. It means intimacy may need to start before desire arrives.`
        }
      },
      {
        id: "data-1",
        type: "data-overview",
        position: 3,
        enabled: true,
        config: {
          headline: "Menopause and Sexual Health",
          stats: [
            { value: "75%", label: "Of women report sexual changes during menopause" },
            { value: "50%", label: "Experience vulvovaginal atrophy (GSM)" },
            { value: "67%", label: "Report decreased sexual satisfaction" },
            { value: "<20%", label: "Discuss symptoms with their doctor" }
          ],
          source: "Menopause Journal, Journal of Sexual Medicine, NAMS"
        }
      },
      {
        id: "content-2",
        type: "main-content",
        position: 4,
        enabled: true,
        config: {
          content: `## Your Intimacy Restoration Protocol

### Strategy 1: Address Vaginal Health

GSM is highly treatable—don't suffer in silence:

**Vaginal Moisturizers:**
- Use regularly (2-3x/week) regardless of sexual activity
- Replenish moisture to tissues
- Options: Replens, Hyalo-Gyn, Good Clean Love
- Not the same as lubricants

**Lubricants:**
- Use during sexual activity
- Water-based: safe with condoms, may need reapplication
- Silicone-based: longer-lasting, not for use with silicone toys
- Oil-based: not compatible with condoms
- Hybrid options available

**Vaginal Estrogen:**
- Highly effective for GSM
- Very low systemic absorption (minimal body-wide effects)
- Options: creams, tablets (Vagifem), rings (Estring)
- Safe for most women, even those who can't take systemic HRT
- Requires prescription but is underutilized

**Other Options:**
- Vaginal DHEA (Intrarosa)
- Ospemifene (Osphena) - oral medication for painful sex
- Laser treatments (MonaLisa Touch, FemTouch)
- Platelet-rich plasma (experimental)

### Strategy 2: Support Desire

**Hormone Considerations:**
- Systemic HRT often improves desire indirectly (better sleep, mood, energy)
- Testosterone therapy can help (used off-label for women)
- Talk to a menopause specialist about options

**Lifestyle Factors:**
- Sleep: desire requires rest
- Stress management: cortisol kills libido
- Exercise: improves body image, blood flow, mood
- Relationship health: emotional connection matters

**Mental/Emotional:**
- Work on body acceptance
- Challenge negative thoughts about aging
- Communicate with partner
- Consider sex therapy or counseling`
        }
      },
      {
        id: "product-1",
        type: "product-showcase",
        position: 5,
        enabled: true,
        config: {
          headline: "Intimacy Support Products",
          subheading: "Thoughtfully selected products for comfort and pleasure",
          products: [
            {
              id: "moist-1",
              name: "Hyaluronic Acid Vaginal Moisturizer",
              description: "Long-lasting hydration with natural hyaluronic acid. Hormone-free, pH-balanced. Use 2-3x weekly for tissue health. Gynecologist recommended.",
              image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop",
              price: 24,
              originalPrice: 32,
              rating: 4.8,
              reviewCount: 2847,
              affiliateUrl: "#",
              badges: [{ text: "Daily Care", type: "clinical-grade", color: "#059669" }]
            },
            {
              id: "lube-1",
              name: "Organic Water-Based Lubricant",
              description: "Clean ingredients, long-lasting glide. Free from parabens, glycerin, and fragrances. Safe with condoms and toys.",
              image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop",
              price: 18,
              originalPrice: 24,
              rating: 4.9,
              reviewCount: 4521,
              affiliateUrl: "#",
              badges: [{ text: "Clean Formula", type: "recommended", color: "#7C3AED" }]
            },
            {
              id: "maca-1",
              name: "Organic Maca Root Complex",
              description: "Traditional adaptogen for hormonal balance and libido support. Studies show improved sexual function in postmenopausal women.",
              image: "https://images.unsplash.com/photo-1611241893603-3c359704e0ee?w=400&h=400&fit=crop",
              price: 26,
              originalPrice: 34,
              rating: 4.7,
              reviewCount: 1893,
              affiliateUrl: "#",
              badges: [{ text: "Libido Support", type: "bestseller", color: "#DC2626" }]
            }
          ]
        }
      },
      {
        id: "content-3",
        type: "main-content",
        position: 6,
        enabled: true,
        config: {
          content: `### Strategy 3: Pelvic Floor Health

A strong pelvic floor enhances:
- Sexual sensation
- Orgasm intensity
- Bladder control
- Confidence

**Strengthening exercises:**
- Kegels (done correctly—squeeze and lift, not bear down)
- Squats and bridges
- Pelvic floor physical therapy
- Devices like Elvie trainer for biofeedback

**When to see a pelvic floor PT:**
- Pain with insertion
- Incontinence
- Prolapse symptoms
- Muscles that are too tight (yes, this happens)

### Strategy 4: Expand the Definition

Intimacy doesn't have to mean penetrative sex:

**Other forms of intimacy:**
- Extended foreplay
- Oral intimacy
- Manual stimulation
- Sensual massage
- Toys and aids
- Emotional and verbal intimacy
- Physical affection without sexual expectation

**Rethink the "script":**
- Take penetration off the table sometimes
- Focus on pleasure, not performance
- Explore what feels good NOW (it may be different)
- Communicate openly with partner

### Strategy 5: Partner Communication

This is essential and often neglected:

**Topics to discuss:**
- What's changed physically (explain the biology)
- What feels different
- What you need (more foreplay, lubricant, different positions)
- That your desire change isn't about them
- That responsive desire is normal
- How to maintain intimacy during this transition

**Conversation tips:**
- Choose a non-sexual time
- Use "I" statements
- Share your experience without blame
- Invite their feelings and concerns
- Problem-solve together

### Professional Help

**When to see a healthcare provider:**
- Persistent painful sex
- Significant vaginal dryness despite OTC products
- Considering hormone therapy
- Urinary symptoms

**When to see a sex therapist:**
- Relationship strain around intimacy
- Significant distress about changes
- Difficulty communicating with partner
- Past trauma affecting current intimacy
- Low desire causing distress`
        }
      },
      {
        id: "testimonial-1",
        type: "before-after-side-by-side",
        position: 7,
        enabled: true,
        config: {
          headline: "Real Women, Real Transformations",
          testimonials: [
            {
              name: "Catherine R.",
              age: 54,
              location: "Boston, MA",
              beforeImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
              afterImage: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop",
              result: "From avoiding intimacy to enjoying it again",
              timeframe: "12 weeks",
              testimonialText: "Sex had become painful so I just avoided it. My doctor prescribed vaginal estrogen and within 2 months, everything changed. I wish I'd asked sooner instead of suffering for years.",
              verified: true
            },
            {
              name: "Donna F.",
              age: 51,
              location: "Atlanta, GA",
              beforeImage: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=400&fit=crop",
              afterImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
              result: "Reconnected with my body and partner",
              timeframe: "8 weeks",
              testimonialText: "Understanding responsive desire changed everything. I stopped waiting to 'feel like it' and started being open to intimacy. Combined with HRT and good communication with my husband, we're closer than ever.",
              verified: true
            }
          ]
        }
      },
      {
        id: "faq-1",
        type: "faq",
        position: 8,
        enabled: true,
        config: {
          headline: "Intimacy FAQ",
          faqs: [
            {
              question: "Is it normal to have zero interest in sex?",
              answer: "Very common during menopause—you're not broken. Low desire can result from hormonal changes, stress, poor sleep, relationship issues, or medication side effects. It's treatable if it bothers you. If you're content without sex, that's valid too."
            },
            {
              question: "Is vaginal estrogen safe?",
              answer: "For most women, yes. Vaginal estrogen has minimal systemic absorption—studies show blood estrogen levels stay in the postmenopausal range. It's safe for many women who can't use systemic HRT. Discuss your individual situation with your provider."
            },
            {
              question: "Can I still have orgasms?",
              answer: "Yes! While some women notice changes (longer to achieve, different intensity), orgasm remains possible. Adequate arousal time, lubrication, and sometimes clitoral stimulation become more important. Pelvic floor exercises can help."
            },
            {
              question: "How do I talk to my doctor about this?",
              answer: "Be direct: 'I'm experiencing painful sex and low desire since menopause. What are my options?' Good providers won't be embarrassed. If yours is dismissive, find a menopause specialist. This is a medical issue deserving proper attention."
            }
          ]
        }
      },
      {
        id: "cta-1",
        type: "final-cta",
        position: 9,
        enabled: true,
        config: {
          headline: "Reclaim Your Intimate Life",
          content: "Join 47,000+ women navigating menopause with confidence. Get our free Intimacy Guide with product recommendations, conversation starters, and treatment options.",
          buttonText: "Get the Free Guide",
          buttonUrl: "#newsletter"
        }
      }
    ])
  },
  {
    slug: 'perimenopause-complete-guide',
    title: "The Complete Perimenopause Guide: What to Expect, When to Expect It, and What Actually Helps",
    excerpt: "Perimenopause can start in your late 30s and last a decade. Here's everything you need to know about this transformative transition.",
    content: "Perimenopause can start in your late 30s and last a decade. Here's everything you need to know about this transformative transition.",
    featured_image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&h=630&fit=crop",
    category: "Perimenopause",
    read_time: 12,
    widget_config: JSON.stringify([
      {
        id: "hero-1",
        type: "hero-image",
        position: 0,
        enabled: true,
        config: {
          image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&h=630&fit=crop",
          alt: "Woman embracing the perimenopause journey",
          overlay: true
        }
      },
      {
        id: "hook-1",
        type: "opening-hook",
        position: 1,
        enabled: true,
        config: {
          content: `Something feels... different. Your periods are changing. Your sleep is off. You're more anxious. Maybe you're gaining weight around your middle despite eating the same. Or you're lying awake at 3 AM for no reason.

You wonder: Am I too young for menopause? What is happening to me?

**Welcome to perimenopause—the transition that can start up to 10 years before your last period.**

Perimenopause is the hormonal journey TO menopause, not menopause itself. And for many women, it's far more turbulent than menopause because your hormones aren't just declining—they're wildly fluctuating.

*The average age of perimenopause onset is 47, but it can start as early as the late 30s. It typically lasts 4-8 years, with some women experiencing symptoms for over a decade.*

Understanding this transition is the first step to navigating it well.`
        }
      },
      {
        id: "content-1",
        type: "main-content",
        position: 2,
        enabled: true,
        config: {
          content: `## What IS Perimenopause?

**The Definitions:**
- **Perimenopause:** The transition leading up to menopause
- **Menopause:** A single moment—12 months without a period
- **Postmenopause:** The rest of your life after that moment

**The Timeline:**
- Can begin in late 30s to late 40s
- Average onset: age 47
- Average duration: 4-8 years
- Ends when you've had 12 months without a period
- Average age of menopause: 51

## The Hormonal Roller Coaster

Here's what makes perimenopause so challenging:

### Phase 1: Early Perimenopause
- Cycles may start changing (shorter or longer)
- Progesterone begins declining
- Estrogen still relatively normal (or even higher)
- May notice mood changes, sleep disruption, anxiety
- Periods might become heavier

### Phase 2: Mid-Perimenopause
- Estrogen starts declining but fluctuates dramatically
- Cycles become increasingly irregular
- May skip periods, then have heavy ones
- Hot flashes and night sweats may begin
- Brain fog, fatigue, mood symptoms intensify

### Phase 3: Late Perimenopause
- Periods become rare
- Estrogen consistently low (but still fluctuating)
- Hot flashes often peak
- Vaginal dryness may develop
- Sleep disruption common
- Approaching final period

**Why Fluctuation Matters:**
Unlike menopause (where hormones are stable-but-low), perimenopause involves dramatic hormone swings. Your estrogen might be higher than ever one week, then crash the next. Your brain can't adapt to the constant changes—which is why symptoms can be more intense than in menopause itself.

## How Do I Know I'm in Perimenopause?

### Signs and Symptoms

**Menstrual Changes (often first sign):**
- Cycles shorter or longer than usual
- Heavier or lighter periods
- Skipping periods
- Longer or shorter bleeding
- More or less PMS

**Vasomotor Symptoms:**
- Hot flashes
- Night sweats
- Heart palpitations

**Sleep Disruption:**
- Difficulty falling asleep
- Waking during the night (especially 3-4 AM)
- Night sweats disrupting sleep
- Waking tired despite adequate time

**Mood Changes:**
- Increased anxiety
- New or worsening depression
- Irritability and rage
- Mood swings
- Tearfulness

**Cognitive Changes:**
- Brain fog
- Difficulty concentrating
- Memory lapses (word finding, forgetting names)
- Mental fatigue

**Physical Changes:**
- Weight gain (especially midsection)
- Joint aches
- Headaches
- Breast tenderness
- Skin and hair changes
- Fatigue

**Sexual/Vaginal:**
- Decreased libido
- Vaginal dryness
- Painful intercourse
- Urinary symptoms`
        }
      },
      {
        id: "symptoms-1",
        type: "symptoms-checker",
        position: 3,
        enabled: true,
        config: {
          headline: "Could You Be in Perimenopause?",
          description: "Check the symptoms you're experiencing:",
          symptoms: [
            { symptom: "Periods becoming irregular (longer, shorter, heavier, lighter)", cause: "Classic early sign" },
            { symptom: "Sleep disruption, especially waking between 2-4 AM", cause: "Progesterone/cortisol changes" },
            { symptom: "Increased anxiety or mood swings", cause: "Hormone fluctuations" },
            { symptom: "Hot flashes or night sweats", cause: "Estrogen fluctuations" },
            { symptom: "Weight gain around middle despite same diet/exercise", cause: "Metabolic changes" },
            { symptom: "Brain fog, difficulty concentrating", cause: "Estrogen affects brain function" },
            { symptom: "New or worsened PMS", cause: "Progesterone decline" },
            { symptom: "Fatigue that doesn't improve with rest", cause: "Multiple hormone factors" }
          ],
          minSymptoms: 3,
          conclusionHeadline: "Multiple Symptoms?",
          conclusionText: "If you're experiencing several of these symptoms and are in your 40s (or late 30s), perimenopause is likely. Even without all symptoms, hormonal testing and consultation can provide clarity."
        }
      },
      {
        id: "content-2",
        type: "main-content",
        position: 4,
        enabled: true,
        config: {
          content: `## Testing for Perimenopause

### The Challenge:
Diagnosing perimenopause with blood tests is tricky because hormones fluctuate dramatically day to day. A "normal" FSH on Monday doesn't mean you're not perimenopausal.

### Useful Tests:
**FSH (Follicle Stimulating Hormone):**
- Generally rises as ovarian function declines
- FSH >25 IU/L suggests perimenopause
- But can be normal during perimenopause
- Test on day 2-3 of cycle if still menstruating

**Estradiol:**
- Fluctuates widely in perimenopause
- May be high, low, or normal
- Less useful for diagnosis

**AMH (Anti-Müllerian Hormone):**
- Indicates ovarian reserve
- Declines before FSH rises
- Can suggest declining fertility

**Thyroid Panel:**
- Symptoms overlap significantly
- Rule out thyroid dysfunction
- Include TSH, Free T4, Free T3, antibodies

### The Clinical Picture:
Often, perimenopause is diagnosed based on symptoms + age + ruling out other conditions. A menopause-savvy provider can usually make the diagnosis without definitive blood tests.

## Management Strategies

### For Irregular/Heavy Periods

**Hormonal IUD (Mirena):**
- Lightens or stops periods
- Provides progesterone locally
- Can be used through perimenopause
- Excellent option for heavy bleeding

**Cyclic Progesterone:**
- Regulates cycles
- Reduces heavy bleeding
- Supports sleep and mood
- Can be bioidentical

**Birth Control Pills:**
- Regulate cycles
- Manage symptoms
- Provide contraception (still needed in perimenopause!)
- Low-dose options available for older women

### For Hot Flashes & Night Sweats

**Lifestyle:**
- Dress in layers
- Keep bedroom cool (65-68°F)
- Limit alcohol and spicy foods
- Manage stress
- Regular exercise (but not right before bed)

**Supplements:**
- Black cohosh (mixed evidence)
- Evening primrose oil
- Phytoestrogens (soy, flax)

**Medications:**
- Low-dose HRT (if appropriate)
- SSRIs/SNRIs (also help mood)
- Gabapentin
- Clonidine

### For Sleep Disruption

**Sleep Hygiene:**
- Consistent sleep/wake times
- Cool, dark room
- No screens before bed
- Limit caffeine after noon

**Supplements:**
- Magnesium glycinate
- Glycine
- Melatonin (low dose, 0.5-1mg)
- Valerian, passionflower

**Consider:**
- Progesterone (promotes sleep)
- Treatment for night sweats if disrupting sleep
- Sleep study if snoring or possible apnea`
        }
      },
      {
        id: "product-1",
        type: "product-showcase",
        position: 5,
        enabled: true,
        config: {
          headline: "Perimenopause Support Stack",
          subheading: "Foundation supplements for this transition",
          products: [
            {
              id: "mag-peri",
              name: "Magnesium Glycinate 400mg",
              description: "The calming magnesium. Supports sleep, mood, muscle relaxation, and over 300 enzymatic reactions. Most women are deficient.",
              image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop",
              price: 26,
              originalPrice: 34,
              rating: 4.9,
              reviewCount: 4892,
              affiliateUrl: "#",
              badges: [{ text: "Foundation", type: "clinical-grade", color: "#059669" }]
            },
            {
              id: "vitd-peri",
              name: "Vitamin D3 5000IU + K2",
              description: "Essential duo for bone health, mood, and immune function. Most women need supplementation. K2 ensures proper calcium direction.",
              image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=400&fit=crop",
              price: 24,
              originalPrice: 32,
              rating: 4.9,
              reviewCount: 5621,
              affiliateUrl: "#",
              badges: [{ text: "Essential", type: "recommended", color: "#7C3AED" }]
            },
            {
              id: "omega-peri",
              name: "Omega-3 Fish Oil 2000mg EPA/DHA",
              description: "Anti-inflammatory foundation. Supports mood, brain function, heart health, and joint comfort. Third-party tested for purity.",
              image: "https://images.unsplash.com/photo-1577401239170-897942555fb3?w=400&h=400&fit=crop",
              price: 32,
              originalPrice: 42,
              rating: 4.9,
              reviewCount: 3892,
              affiliateUrl: "#",
              badges: [{ text: "Inflammation", type: "bestseller", color: "#DC2626" }]
            }
          ]
        }
      },
      {
        id: "content-3",
        type: "main-content",
        position: 6,
        enabled: true,
        config: {
          content: `### For Mood Changes

**Lifestyle:**
- Regular exercise (proven antidepressant)
- Stress management
- Social connection
- Therapy/counseling

**Supplements:**
- Ashwagandha (anxiety, cortisol)
- Saffron (mild-moderate depression)
- L-theanine (acute anxiety)
- Omega-3s (inflammation, brain support)

**Medical:**
- Consider HRT (stabilizes mood by stabilizing hormones)
- SSRIs/SNRIs if needed
- Address sleep (sleep deprivation worsens everything)

### For Weight Gain

**Accept metabolic change:**
- What worked at 30 won't work at 45
- Adapt rather than restrict more

**What helps:**
- Strength training (muscle is metabolically active)
- Protein prioritization (30g per meal)
- Blood sugar stabilization
- Sleep optimization (affects hunger hormones)
- Stress management (cortisol promotes belly fat)

**What doesn't help:**
- Extreme caloric restriction
- Excessive cardio
- Shame and frustration

### Hormone Therapy in Perimenopause

HRT can start during perimenopause—you don't have to wait until you're "officially menopausal."

**Options:**
- Cyclic hormones (mimics natural cycle)
- Continuous hormones
- Progesterone alone (for cycle regulation, sleep)
- IUD + systemic estrogen

**Benefits in perimenopause:**
- Stabilizes hormone fluctuations
- Regulates bleeding
- Reduces hot flashes
- Improves sleep
- Supports mood
- Provides contraception (if using hormonal IUD or birth control pills)

**Finding the right provider:**
Look for someone who specializes in menopause/perimenopause. Many providers are not well-trained in this area. NAMS (North American Menopause Society) has a provider directory.`
        }
      },
      {
        id: "timeline-1",
        type: "timeline",
        position: 7,
        enabled: true,
        config: {
          headline: "The Perimenopause Journey",
          items: [
            {
              title: "Early Perimenopause",
              description: "Subtle cycle changes, PMS worsening, mood shifts, sleep changes. Often dismissed as 'stress.' Progesterone declining while estrogen still normal or high."
            },
            {
              title: "Mid Perimenopause",
              description: "More noticeable symptoms. Hot flashes may begin. Periods increasingly irregular. Mood, sleep, and cognitive symptoms intensify. Estrogen fluctuating dramatically."
            },
            {
              title: "Late Perimenopause",
              description: "Periods rare. Hot flashes often peak. Vaginal changes may begin. Approaching final period. Estrogen consistently low but still fluctuating."
            },
            {
              title: "Menopause & Beyond",
              description: "12 months without period marks menopause. Hormones stabilize at lower levels. Many symptoms improve once fluctuations stop. Some symptoms persist and need ongoing management."
            }
          ]
        }
      },
      {
        id: "faq-1",
        type: "faq",
        position: 8,
        enabled: true,
        config: {
          headline: "Perimenopause FAQ",
          faqs: [
            {
              question: "Can I get pregnant during perimenopause?",
              answer: "Yes! Until you've had 12 months without a period (menopause), pregnancy is possible. Many unplanned pregnancies occur during perimenopause because women assume they're 'done.' Use contraception if pregnancy is not desired."
            },
            {
              question: "My tests are 'normal' but I feel terrible. What gives?",
              answer: "Perimenopause is often a clinical diagnosis based on symptoms, not blood tests. Hormone levels fluctuate dramatically, so a single 'normal' test doesn't rule it out. Find a provider who listens to your symptoms."
            },
            {
              question: "Is it perimenopause or thyroid?",
              answer: "Symptoms overlap significantly. Get a full thyroid panel (TSH, Free T4, Free T3, antibodies) to rule out thyroid issues. You can also have both—thyroid problems are more common during perimenopause."
            },
            {
              question: "How long will this last?",
              answer: "Average is 4-8 years, but it varies widely. Some women have brief, mild transitions. Others experience significant symptoms for over a decade. The good news: symptoms often improve once you reach menopause and hormones stabilize."
            }
          ]
        }
      },
      {
        id: "cta-1",
        type: "final-cta",
        position: 9,
        enabled: true,
        config: {
          headline: "Navigate Perimenopause with Confidence",
          content: "Join 47,000+ women getting real support for this transition. Download our free Perimenopause Guide with symptom trackers, supplement protocols, and conversation guides for your doctor.",
          buttonText: "Get the Free Guide",
          buttonUrl: "#newsletter"
        }
      }
    ])
  },
  {
    slug: 'hormone-replacement-therapy-guide',
    title: "HRT Demystified: The Evidence-Based Guide to Hormone Replacement Therapy",
    excerpt: "Confused about HRT? You're not alone. Here's what the latest research actually shows about benefits, risks, and how to decide if it's right for you.",
    content: "Confused about HRT? You're not alone. Here's what the latest research actually shows about benefits, risks, and how to decide if it's right for you.",
    featured_image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&h=630&fit=crop",
    category: "Medical Treatments",
    read_time: 12,
    widget_config: JSON.stringify([
      {
        id: "hero-1",
        type: "hero-image",
        position: 0,
        enabled: true,
        config: {
          image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&h=630&fit=crop",
          alt: "Medical consultation about HRT",
          overlay: true
        }
      },
      {
        id: "hook-1",
        type: "opening-hook",
        position: 1,
        enabled: true,
        config: {
          content: `Few topics in women's health have been as controversial—or as misunderstood—as hormone replacement therapy (HRT).

You've probably heard conflicting messages: "HRT causes cancer." "HRT is perfectly safe." "Never take hormones." "Everyone should take hormones."

**The truth lies in nuance, individualization, and understanding the actual evidence.**

Two decades after the Women's Health Initiative (WHI) study sent millions of women off HRT, we now have much better data. The picture is more reassuring than many women realize—and the benefits for the right candidate can be life-changing.

*Current position from the North American Menopause Society (2022): "For women aged younger than 60 years or who are within 10 years of menopause onset and have no contraindications, the benefit-risk ratio is favorable for treatment of bothersome vasomotor symptoms and prevention of bone loss."*

Let's cut through the confusion.`
        }
      },
      {
        id: "content-1",
        type: "main-content",
        position: 2,
        enabled: true,
        config: {
          content: `## What IS Hormone Replacement Therapy?

HRT replaces the hormones your ovaries no longer produce in sufficient quantities:

**Estrogen:**
- The primary hormone we're replacing
- Addresses most menopausal symptoms
- Multiple delivery methods available

**Progesterone/Progestin:**
- Required if you have a uterus (to protect against uterine cancer)
- Not needed if you've had a hysterectomy
- Can be synthetic (progestin) or bioidentical (progesterone)

**Testosterone:**
- Sometimes added for libido, energy, well-being
- Used off-label for women (no FDA-approved product in US)
- Available as creams, gels, pellets

## Types of HRT

### By Hormone Combination:

**Estrogen-Only Therapy (ET):**
- For women without a uterus (post-hysterectomy)
- Generally safest profile

**Combined Estrogen + Progestogen Therapy (EPT):**
- For women with uterus
- Progestogen protects uterine lining
- Can be continuous or cyclic

### By Hormone Type:

**Bioidentical Hormones:**
- Chemically identical to human hormones
- Include: estradiol, progesterone, testosterone
- Can be commercial or compounded
- FDA-approved options available

**Synthetic/Non-Bioidentical:**
- Conjugated equine estrogens (Premarin)
- Synthetic progestins (medroxyprogesterone acetate)
- Older formulations, still used

### By Delivery Method:

**Transdermal (Through Skin):**
- Patches, gels, sprays
- Bypasses liver (first-pass metabolism)
- Lower blood clot risk than oral
- Steady hormone levels

**Oral:**
- Pills taken daily
- Convenient
- Processed through liver
- Higher clot risk than transdermal

**Vaginal:**
- Creams, rings, tablets
- For localized vaginal/urinary symptoms
- Minimal systemic absorption
- Safest option for GSM

**Other:**
- Pellets (implanted under skin)
- Injections
- Less commonly used

## The WHI Study: What Actually Happened

The 2002 Women's Health Initiative study results caused millions of women to stop HRT. But the interpretation was flawed:

**What the study found:**
- Increased breast cancer in women taking Premarin + Prempro (synthetic progestin)
- Increased stroke and blood clots
- Average participant age was 63 (many years post-menopause)

**What we now understand:**
- The "timing hypothesis": HRT started early (within 10 years of menopause or before 60) has different effects than starting later
- Transdermal estrogen has lower clot risk than oral
- Bioidentical progesterone may be safer than synthetic progestins
- Estrogen-only therapy (for women without uterus) actually REDUCED breast cancer risk
- For appropriate candidates, benefits outweigh risks`
        }
      },
      {
        id: "data-1",
        type: "data-overview",
        position: 3,
        enabled: true,
        config: {
          headline: "HRT: The Evidence",
          stats: [
            { value: "75%", label: "Reduction in hot flash frequency" },
            { value: "30-40%", label: "Reduction in fracture risk" },
            { value: "50%", label: "Of women report improved quality of life" },
            { value: "10 years", label: "Window of opportunity for starting HRT" }
          ],
          source: "NAMS Position Statement, Lancet, Journal of Clinical Endocrinology & Metabolism"
        }
      },
      {
        id: "content-2",
        type: "main-content",
        position: 4,
        enabled: true,
        config: {
          content: `## Benefits of HRT

### Vasomotor Symptoms (Hot Flashes, Night Sweats)
- Most effective treatment available
- 75% reduction in hot flash frequency
- Improves sleep disrupted by night sweats

### Bone Health
- Prevents rapid bone loss after menopause
- Reduces fracture risk by 30-40%
- Only menopause treatment that prevents osteoporosis

### Genitourinary Symptoms
- Reverses vaginal atrophy
- Improves lubrication and comfort
- Reduces urinary symptoms

### Quality of Life
- Improves sleep
- Stabilizes mood
- May improve energy and well-being
- Better cognitive clarity for many

### Potential Cardiovascular Benefits (When Started Early)
- The "timing hypothesis"
- Starting within 10 years of menopause may be cardioprotective
- Maintains blood vessel flexibility
- Different from starting later

### Other Possible Benefits
- Skin and hair improvements (collagen support)
- Joint pain reduction
- Reduced colon cancer risk (combined HRT)
- Reduced diabetes risk

## Risks of HRT

### Blood Clots
- Oral estrogen increases risk
- Transdermal estrogen does NOT significantly increase risk
- Important distinction for risk assessment

### Stroke
- Modest increase with oral estrogen
- Risk lower with transdermal
- Baseline risk matters

### Breast Cancer
- Combined HRT (estrogen + synthetic progestin): small increased risk
- Estrogen-only: no increased risk (possibly decreased)
- Bioidentical progesterone may be safer than synthetic progestins
- Risk increase is small and appears after 5+ years of use

### Other Considerations
- Gallbladder disease (oral estrogen)
- Return of bleeding (can be managed)
- Breast tenderness (usually temporary)

## Putting Risk in Perspective

**The breast cancer risk from combined HRT is similar to:**
- Drinking 1-2 glasses of wine daily
- Being obese
- Never having children
- Being sedentary

**The increase is approximately:**
- 1 additional case per 1000 women per year of use
- After 5+ years of combined therapy
- And appears to resolve after stopping

This doesn't mean risk doesn't matter—but it provides context for decision-making.`
        }
      },
      {
        id: "content-3",
        type: "main-content",
        position: 5,
        enabled: true,
        config: {
          content: `## Who Is a Good Candidate for HRT?

### Ideal Candidates:
- Within 10 years of menopause or under 60
- Bothersome vasomotor symptoms
- No contraindications
- At risk for osteoporosis
- Experiencing quality of life impairment

### Possible Candidates (Require Individual Assessment):
- 60-65 with significant symptoms
- History of hormone-sensitive conditions
- Family history concerns
- Cardiovascular risk factors

### Contraindications:
- Unexplained vaginal bleeding
- Active liver disease
- History of breast cancer
- History of blood clots or stroke
- Active cardiovascular disease

## How to Get Started

### Step 1: Find the Right Provider
- Menopause specialist (NAMS-certified)
- Provider who stays current with evidence
- Someone who listens and individualizes

### Step 2: Comprehensive Evaluation
- Medical history review
- Family history assessment
- Risk factor analysis
- Symptom assessment
- Baseline testing (mammogram, blood pressure, lipids)

### Step 3: Choose the Approach
Based on your history and preferences:
- Delivery method (transdermal often preferred)
- Hormone type (bioidentical increasingly chosen)
- Dose (lowest effective dose)
- Progesterone approach (if needed)

### Step 4: Start and Adjust
- Begin with a reasonable dose
- Expect 4-6 weeks for full effect
- Adjust based on symptom response
- Monitor for side effects

### Step 5: Ongoing Care
- Regular follow-up visits
- Periodic reassessment of need
- Mammograms as recommended
- Adjustment as needed over time

## Common Questions About HRT

**"What if I started menopause years ago?"**
Starting HRT more than 10 years after menopause has less favorable risk-benefit ratio for most women. However, vaginal estrogen is safe at any time and helps with GSM.

**"How long can I stay on HRT?"**
There's no arbitrary cutoff. Current guidance suggests annual reassessment of benefits vs. risks. Some women stay on HRT long-term; others use it during the worst symptom years.

**"Will my symptoms come back when I stop?"**
Possibly. Symptoms may return, though often milder. Gradual tapering may help. Some women find they no longer need HRT after several years; others prefer to continue.

**"Is compounded HRT better?"**
Not necessarily. Compounded hormones aren't FDA-regulated, so dosing may be inconsistent. FDA-approved bioidentical options (estradiol, progesterone) are available and often preferred.

**"What about bioidentical hormones?"**
The term can be misleading. FDA-approved bioidentical hormones (estradiol patches, micronized progesterone like Prometrium) are available by prescription. These are different from unregulated compounded preparations.`
        }
      },
      {
        id: "timeline-1",
        type: "timeline",
        position: 6,
        enabled: true,
        config: {
          headline: "Your HRT Decision Journey",
          items: [
            {
              title: "Step 1: Educate",
              description: "Learn the evidence. Understand your options. Identify your goals (symptom relief? bone protection? quality of life?). This article is a start."
            },
            {
              title: "Step 2: Evaluate",
              description: "Assess your personal risk factors, medical history, and family history. Consider contraindications. Understand your individual benefit-risk profile."
            },
            {
              title: "Step 3: Consult",
              description: "Find a knowledgeable provider. Have an informed discussion. Ask questions. Make sure you feel heard and your concerns addressed."
            },
            {
              title: "Step 4: Decide & Try",
              description: "If appropriate, choose an approach and give it adequate time (4-6 weeks). Adjust based on response. Remember: you can always stop if it's not right for you."
            }
          ]
        }
      },
      {
        id: "faq-1",
        type: "faq",
        position: 7,
        enabled: true,
        config: {
          headline: "HRT FAQ",
          faqs: [
            {
              question: "Will HRT make me gain weight?",
              answer: "No. Studies show HRT does not cause weight gain and may actually help prevent the abdominal weight gain associated with menopause. Weight gain during menopause is hormonal/metabolic, not caused by HRT."
            },
            {
              question: "Is transdermal better than oral?",
              answer: "For many women, yes. Transdermal (patches, gels) bypasses the liver, resulting in lower blood clot risk and more stable hormone levels. It's often the first choice unless there's a reason to prefer oral."
            },
            {
              question: "My doctor won't prescribe HRT. What do I do?",
              answer: "Many providers received outdated training about HRT. If your provider is dismissive or not knowledgeable, seek a menopause specialist. The NAMS website has a provider directory. You deserve informed care."
            },
            {
              question: "Can I use HRT if I have a family history of breast cancer?",
              answer: "It depends on specifics. First-degree family history is a consideration but not an absolute contraindication. BRCA mutation carriers need individual assessment. Discuss with a menopause specialist who can weigh your specific risks and benefits."
            }
          ]
        }
      },
      {
        id: "cta-1",
        type: "final-cta",
        position: 8,
        enabled: true,
        config: {
          headline: "Make an Informed Decision",
          content: "Join 47,000+ women taking charge of their menopause journey. Get our free HRT Guide with a comparison chart of options, questions for your doctor, and a personal risk assessment framework.",
          buttonText: "Get the Free Guide",
          buttonUrl: "#newsletter"
        }
      }
    ])
  }
];

async function createArticle(article) {
  try {
    const response = await fetch(`${BASE_URL}/api/articles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        site_id: SITE_ID,
        ...article,
        published: true
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error(`Failed to create ${article.slug}:`, error.message);
    throw error;
  }
}

async function main() {
  console.log('Creating batch 5 articles (3 new articles)...\n');

  for (const article of newArticles) {
    console.log(`Creating: ${article.slug}`);
    try {
      const result = await createArticle(article);
      console.log(`✓ Created: ${article.title.substring(0, 50)}...`);
    } catch (error) {
      console.error(`✗ Failed: ${article.slug}`);
    }
  }

  console.log('\n✓ Batch 5 complete!');
}

main();
