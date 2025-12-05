// Core Site Types
export interface Site {
  id: string;
  name: string;
  domain: string;
  subdomain?: string;
  theme: SiteTheme;
  brand: BrandProfile;
  settings: SiteSettings;
  pages: Page[];
  createdAt: Date;
  updatedAt: Date;
}

// Brand Profile for Credibility
export interface BrandProfile {
  name?: string;
  title?: string;
  tagline: string;
  bio: string;
  logo: string;
  profileImage: string;  // Legacy - kept for backwards compatibility
  // 4 distinct images for different areas
  logoImage?: string;      // Navigation logo/avatar
  authorImage?: string;    // Article author profile images
  sidebarImage?: string;   // Credibility sidebar panel
  aboutImage?: string;     // About page hero image
  quote: string;
  credentials?: string[];
  specialties?: string[];
  yearsExperience?: number;
}

// Site Theme & Branding
export interface SiteTheme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    trust: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  style: 'medical' | 'wellness' | 'lifestyle' | 'clinical';
}

// Site Settings
export interface SiteSettings {
  navigation: NavigationItem[];
  footer: FooterSettings;
  emailCapture: EmailCaptureSettings;
  social: SocialLinks;
  analytics?: AnalyticsSettings;
  // Audio & Lead Magnet
  audioUrl?: string;
  aboutAudioUrl?: string;
  leadMagnetPdfUrl?: string;
  // Community/Social Proof
  communityCount?: number; // e.g., 47284 - displayed as "47k+" or "47,284+"
}

// Page Structure
export interface Page {
  id: string;
  slug: string;
  title: string;
  type: PageType;
  content: PageContent;
  seo: SEOSettings;
  published: boolean;
  publishedAt?: Date;
}

export type PageType = 'homepage' | 'article' | 'about' | 'top-picks' | 'success-stories' | 'contact';

export interface PageContent {
  widgets: Widget[];
  sidebar?: SidebarConfig;
  layout: PageLayout;
}

// Widget System
export interface Widget {
  id: string;
  type: WidgetType;
  position: number;
  config: WidgetConfig;
  enabled: boolean;
}

export type WidgetType =
  | 'hero-story'
  | 'article-grid'
  | 'email-capture'
  | 'product-showcase'
  | 'testimonial'
  | 'trust-badges'
  | 'comparison-table'
  | 'countdown-timer'
  | 'social-proof'
  | 'top-recommendations'
  | 'before-after'
  | 'media-block'
  | 'text-block'
  | 'cta-button'
  | 'rating-stars'
  | 'price-comparison'
  | 'bundle-offer'
  | 'popup-trigger'
  // New widget types
  | 'before-after-comparison'
  | 'top-ten-list'
  | 'expectation-timeline'
  | 'special-offer'
  | 'exclusive-product'
  | 'dual-offer-comparison'
  | 'stacked-quotes'
  | 'faq-accordion'
  | 'shop-now'
  | 'data-overview'
  | 'symptoms-checker'
  | 'before-after-side-by-side'
  | 'timeline'
  | 'top-ten'
  | 'guarantee-box'
  | 'faq'
  | 'video-embed'
  | 'hero-image'
  | 'opening-hook'
  | 'main-content'
  | 'final-cta'
  | 'review-grid'
  | 'press-logos'
  | 'scrolling-thumbnails'
  | 'testimonial-hero'
  | 'testimonial-hero-no-cta'
  | 'ingredient-list-grid'
  | 'us-vs-them-comparison'
  | 'doctor-assessment'
  | 'doctor-closing-word'
  // Page-specific widgets
  | 'social-validation-tile'
  | 'profile-hero'
  | 'bio-section'
  | 'lead-magnet-form'
  | 'articles-header'
  | 'top-picks-grid'
  | 'success-stories-grid'
  // Interactive & engagement widgets
  | 'poll'
  | 'myth-buster'
  | 'warning-box'
  | 'dr-tip'
  | 'checklist'
  // Product reveal & survey widgets
  | 'product-reveal'
  | 'community-survey-results'
  | 'two-approaches';

// Widget Configurations
export interface WidgetConfig {
  // Text Content
  headline?: string;
  subheading?: string;
  content?: string;
  buttonText?: string;
  buttonUrl?: string;
  description?: string;

  // Media
  image?: string;
  images?: string[] | { url: string; alt: string }[];
  video?: string;
  audio?: string;
  beforeImage?: string;
  afterImage?: string;

  // Product Data
  products?: Product[];
  name?: string;
  price?: number;
  originalPrice?: number;
  benefits?: string[];
  badges?: string[];
  doctorName?: string;
  doctorImage?: string;
  reviewCount?: number | string;
  pricingOptions?: any[];

  // Stats & Metrics
  rating?: string | number;
  views?: number;
  readTime?: number;

  // Before/After widget
  age?: string | number;
  location?: string;
  result?: string;
  timeframe?: string;
  testimonialText?: string;
  verified?: boolean;

  // Timeline/List widgets
  items?: any[];
  steps?: any[];
  listStyle?: string;

  // FAQ/Quotes widgets
  faqs?: any[];
  quotes?: any[];
  supportEmail?: string;
  showContactCTA?: boolean;
  showVerifiedBadge?: boolean;

  // Dual offer widgets
  leftOffer?: any;
  rightOffer?: any;

  // Special offer widgets
  features?: string[];
  redemptionCount?: number;
  limitedSpots?: number;
  endDate?: string;

  // Data/Stats widgets
  stats?: any[];
  source?: string;

  // Symptoms checker
  symptoms?: any[];
  conclusionHeadline?: string;
  conclusionText?: string;
  minSymptoms?: number;

  // Styling
  style?: string;
  size?: 'small' | 'medium' | 'large' | 'hero';

  // Behavior
  autoplay?: boolean;
  timer?: number;
  target?: '_blank' | '_self';

  // A/B Testing
  variant?: string;

  // Allow any additional properties for flexible widget configs
  [key: string]: any;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  affiliateUrl: string;
  badges?: ProductBadge[];
  brandNote?: string;
}

export interface ProductBadge {
  text: string;
  type: 'bestseller' | 'recommended' | 'clinical-grade' | 'limited-time' | 'new' | 'verified';
  color: string;
}

// Navigation & Layout
export interface NavigationItem {
  label: string;
  url: string;
  type: 'internal' | 'external' | 'popup';
  icon?: string;
}

export interface SidebarConfig {
  enabled: boolean;
  type?: 'brand-credibility' | 'products' | 'newsletter' | 'custom';
  widgets?: Widget[];
}

export interface PageLayout {
  type: 'full-width' | 'with-sidebar' | 'narrow';
  maxWidth: string;
}

// Email & Community
export interface EmailCaptureSettings {
  provider: 'mailchimp' | 'convertkit' | 'custom';
  apiKey: string;
  listId: string;
  leadMagnet?: LeadMagnet;
}

export interface LeadMagnet {
  title: string;
  description: string;
  downloadUrl: string;
  image?: string;
}

// Social & External
export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  linkedin?: string;
}

export interface FooterSettings {
  disclaimer: string;
  privacyPolicy: string;
  termsOfService: string;
  contact: ContactInfo;
}

export interface ContactInfo {
  email: string;
  phone?: string;
  address?: string;
}

// SEO & Analytics
export interface SEOSettings {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  canonical?: string;
}

export interface AnalyticsSettings {
  googleAnalytics?: string;
  googleId?: string;
  // Meta/Facebook Pixel
  metaPixelId?: string;
  metaPixelEnabled?: boolean;
  metaDomainVerification?: string;
  metaTestMode?: boolean;
  // Legacy field (deprecated, use metaPixelId)
  facebookPixel?: string;
  customScripts?: string[];
}

// Testimonials & Social Proof
export interface Testimonial {
  id: string;
  name: string;
  location?: string;
  avatar?: string;
  rating: number;
  content: string;
  beforeImage?: string;
  afterImage?: string;
  results?: TestimonialResult[];
  verified: boolean;
  featured: boolean;
}

export interface TestimonialResult {
  metric: string;
  before: string;
  after: string;
  improvement: string;
}

// Form & Popup Types
export interface PopupConfig {
  trigger: 'exit-intent' | 'time-delay' | 'scroll-percentage';
  delay?: number;
  scrollPercentage?: number;
  content: Widget;
  frequency: 'once' | 'session' | 'always';
}

// Content Profile / Editorial Guidelines
// Used to maintain consistent voice and style across AI-generated content
export interface ContentProfile {
  // Purpose & Mission
  mission: string;              // "This site helps women 40+ navigate hormonal health..."
  uniqueValue: string;          // What makes this brand different

  // Target Audience
  audience: {
    demographics: string;       // "Women 40-65"
    painPoints: string[];       // ["Hormonal imbalance", "Weight gain", "Fatigue"]
    goals: string[];            // ["Natural solutions", "More energy", "Feel younger"]
    language: string;           // How they talk about their problems
  };

  // Writing Style
  style: {
    tone: string;               // "Warm, authoritative, empathetic"
    voice: string;              // "Like a trusted friend who's also a doctor"
    perspective: 'first' | 'third'; // "I recommend..." vs "Dr. Amy recommends..."
    readingLevel: string;       // "8th grade, accessible"
    personality: string[];      // ["Caring", "Science-backed", "No-nonsense"]
  };

  // Content Rules
  rules: {
    doAlways: string[];         // ["Cite research", "Include personal anecdotes", "Actionable takeaways"]
    neverDo: string[];          // ["Fear-mongering", "Salesy language", "Medical claims without evidence"]
    productMentions: string;    // "Organic integration, personal experience, not pushy"
  };

  // Voice Examples
  examples: {
    goodPhrases: string[];      // ["Here's what I tell my patients...", "The research is clear..."]
    badPhrases: string[];       // ["You MUST buy this NOW!", "Doctors don't want you to know..."]
  };

  // Topics & Expertise
  topics: {
    primary: string[];          // ["Hormone health", "Menopause", "Perimenopause"]
    secondary: string[];        // ["Sleep", "Stress", "Weight management"]
    avoidTopics: string[];      // Topics to never cover
  };

  // Products & Affiliates
  products: {
    primary: string[];          // Main products to promote
    howToMention: string;       // "Natural integration, personal experience"
    disclosureText: string;     // Affiliate disclosure language
  };
}

// Default empty content profile for new sites
export const DEFAULT_CONTENT_PROFILE: ContentProfile = {
  mission: '',
  uniqueValue: '',
  audience: {
    demographics: '',
    painPoints: [],
    goals: [],
    language: ''
  },
  style: {
    tone: '',
    voice: '',
    perspective: 'first',
    readingLevel: '8th grade',
    personality: []
  },
  rules: {
    doAlways: [],
    neverDo: [],
    productMentions: ''
  },
  examples: {
    goodPhrases: [],
    badPhrases: []
  },
  topics: {
    primary: [],
    secondary: [],
    avoidTopics: []
  },
  products: {
    primary: [],
    howToMention: '',
    disclosureText: ''
  }
};

// Page Configuration for site page management
export type NavMode = 'global' | 'direct-response' | 'minimal';

export interface SitePageConfig {
  id: string;
  type: PageType | 'faq' | 'custom';
  slug: string;
  title: string;
  navLabel: string;              // What shows in navigation
  enabled: boolean;              // Is this page active?
  showInNav: boolean;            // Should it appear in navigation?
  navOrder: number;              // Position in navigation
  navMode: NavMode;              // Header style to use
  contentSource: 'template' | 'database' | 'hardcoded';
  templateId?: string;
  seoTitle?: string;
  seoDescription?: string;
  settings?: Record<string, any>;
}