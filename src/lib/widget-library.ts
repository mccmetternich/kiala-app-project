/**
 * Centralized Widget Library Configuration
 *
 * This is the SINGLE SOURCE OF TRUTH for all widget definitions.
 * Used by: Article Editor, Page Editor, and WidgetEditor component.
 *
 * To add a new widget:
 * 1. Add it to the appropriate category in WIDGET_TYPES
 * 2. Ensure the widget component exists in /src/widgets/
 * 3. Add default config in WidgetEditor.tsx defaultConfigs
 */

import {
  FileText,
  BarChart3,
  Clock,
  Layers,
  Quote,
  ImageIcon,
  ExternalLink,
  Mail,
  HelpCircle,
  MessageSquare,
  AlertCircle,
  AlertTriangle,
  Lightbulb,
  CheckSquare,
  Columns,
  ArrowLeftRight,
  Star,
  Award,
  ShoppingCart,
  Store,
  Gift,
  ListOrdered,
  Timer,
  LayoutGrid
} from 'lucide-react';

// Widget type definition
export interface WidgetTypeDefinition {
  type: string;
  name: string;
  icon: any;
  category: string;
  description: string;
}

// Category color definitions
export interface CategoryColors {
  bg: string;
  text: string;
  border?: string;
}

/**
 * All available widget types organized by category
 * This is the master list used throughout the application
 */
export const WIDGET_TYPES: WidgetTypeDefinition[] = [
  // ============================================
  // CONTENT WIDGETS
  // ============================================
  { type: 'hero-image', name: 'Hero Image', icon: ImageIcon, category: 'Content', description: 'Hero Image for All Articles' },
  { type: 'text-block', name: 'Rich Text Block', icon: FileText, category: 'Content', description: 'A flexible, stylable text widget' },
  { type: 'top-ten-list', name: 'Top 10 List', icon: ListOrdered, category: 'Content', description: 'Numbered routine or tips list' },
  { type: 'expectation-timeline', name: 'Timeline or Sequence', icon: Timer, category: 'Content', description: 'Visual timeline of expected results' },
  { type: 'faq-accordion', name: 'FAQ Accordion', icon: HelpCircle, category: 'Content', description: 'An infinitely long FAQ accordion with click to expose fields' },
  { type: 'data-overview', name: 'Data & Stat Highlights', icon: BarChart3, category: 'Content', description: '4x prominent stat fields to re-enforce data points' },
  { type: 'symptoms-checker', name: 'Symptoms Checker', icon: MessageSquare, category: 'Content', description: 'An interactive table for users to self-diagnose with CTA' },
  { type: 'ingredient-list-grid', name: 'Ingredient Grid', icon: LayoutGrid, category: 'Content', description: 'A grid of key ingredients with ingredient avatars and CTA' },
  { type: 'poll', name: 'Interactive Poll', icon: BarChart3, category: 'Content', description: 'Interactive community poll with results' },
  { type: 'myth-buster', name: 'Myth Buster', icon: AlertCircle, category: 'Content', description: 'Myth vs. Reality comparison cards' },
  { type: 'warning-box', name: 'Warning Box', icon: AlertTriangle, category: 'Content', description: 'Highlighted warning or cascade list' },
  { type: 'checklist', name: 'Interactive Checklist', icon: CheckSquare, category: 'Content', description: 'Interactive or assessment checklist' },
  { type: 'two-approaches', name: 'Two Approaches', icon: Columns, category: 'Content', description: 'Side-by-side comparison of two approaches/paths' },
  { type: 'us-vs-them-comparison', name: 'Us vs Them', icon: Columns, category: 'Content', description: 'Side by side comparison of us vs the other guys with CTA' },
  { type: 'comparison-table', name: 'Simple Comparison Table', icon: BarChart3, category: 'Content', description: 'Feature comparison table with checkmarks and CTA' },

  // ============================================
  // SOCIAL PROOF WIDGETS
  // ============================================
  { type: 'testimonial', name: 'Testimonial Carousel', icon: Quote, category: 'Social Proof', description: 'A rotating series of customer testimonials' },
  { type: 'stacked-quotes', name: 'Stacked Testimonials', icon: Quote, category: 'Social Proof', description: 'A series of large text based testimonials' },
  { type: 'before-after-comparison', name: 'Before & After Slider', icon: ArrowLeftRight, category: 'Social Proof', description: 'An interactive slider of before & after with story and CTA' },
  { type: 'before-after-side-by-side', name: 'Before & After Static', icon: Columns, category: 'Social Proof', description: 'Two side by side images for before & after with quote and CTA' },
  { type: 'review-grid', name: 'Review Tiles', icon: Star, category: 'Social Proof', description: '4x tiles with avatars, stars, review quotes in a grid' },
  { type: 'press-logos', name: 'Press Logos', icon: Award, category: 'Social Proof', description: 'A grid of press logos with quotes' },
  { type: 'scrolling-thumbnails', name: 'Scrolling Photowall', icon: ImageIcon, category: 'Social Proof', description: 'A large, animated photo wall of thumbnails that scrolls' },
  { type: 'testimonial-hero-no-cta', name: 'Large Photo Testimonial', icon: Quote, category: 'Social Proof', description: 'A large testimonial with a photo, no CTA' },
  { type: 'testimonial-hero', name: 'Large Photo Testimonial CTA', icon: Quote, category: 'Social Proof', description: 'A large testimonial with photo AND CTA' },
  { type: 'community-survey-results', name: 'Poll Results Only', icon: BarChart3, category: 'Social Proof', description: 'Survey results with percentages and social proof' },

  // ============================================
  // COMMERCE WIDGETS
  // ============================================
  { type: 'product-reveal', name: 'Product Reveal', icon: Award, category: 'Commerce', description: 'Big product reveal with doctor endorsement, benefits, and social proof' },
  { type: 'product-showcase', name: 'Shop Product', icon: ShoppingCart, category: 'Commerce', description: 'A simple horizontal, smaller tile' },
  { type: 'exclusive-product', name: 'Shop #1 Product Pick', icon: Award, category: 'Commerce', description: 'A large product feature with CTA' },
  { type: 'shop-now', name: 'Shop 3x Options', icon: Store, category: 'Commerce', description: 'Product carousel with description and 3x option radio buttons' },
  { type: 'special-offer', name: 'Shop Special Offer', icon: Gift, category: 'Commerce', description: 'A big, loud CTA with countdown timer, bullets and price' },
  { type: 'dual-offer-comparison', name: 'Shop Two Offers', icon: Columns, category: 'Commerce', description: 'Side by side of starter vs best value offers and CTA' },
  { type: 'cta-button', name: 'Simple CTA', icon: ExternalLink, category: 'Commerce', description: 'Simple CTA button with copy' },
  { type: 'countdown-timer', name: 'Shop Product + Countdown', icon: Clock, category: 'Commerce', description: 'A simple horizontal product image and countdown timer with CTA' },

  // ============================================
  // LEAD GEN WIDGETS
  // ============================================
  { type: 'email-capture', name: 'Email Capture', icon: Mail, category: 'Lead Gen', description: 'Newsletter signup with lead magnet' },

  // ============================================
  // DOCTOR WIDGETS (Article-specific)
  // ============================================
  { type: 'dr-tip', name: "Dr's Tip", icon: Lightbulb, category: 'Doctor', description: 'Professional insight callout with CTA' },
  { type: 'doctor-assessment', name: 'Dr Assessment', icon: FileText, category: 'Doctor', description: 'Doctor quote and assessment' },
  { type: 'doctor-closing-word', name: 'Dr Closing Statement', icon: FileText, category: 'Doctor', description: 'Doctor closing statement' },

  // ============================================
  // PAGE LAYOUT WIDGETS (Page-specific)
  // ============================================
  { type: 'hero-story', name: 'Hero Story', icon: ImageIcon, category: 'Page Layout', description: 'Hero section with headline, image, CTA' },
  { type: 'article-grid', name: 'Article Grid', icon: LayoutGrid, category: 'Page Layout', description: 'Display articles from site' },
  { type: 'social-proof', name: 'Social Proof Banner', icon: Star, category: 'Page Layout', description: 'Community count and trust indicators' },
];

/**
 * Category colors for the widget library UI
 * Used for styling category headers and badges
 */
export const CATEGORY_COLORS: Record<string, CategoryColors> = {
  'Content': { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  'Social Proof': { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  'Commerce': { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
  'Lead Gen': { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  'Doctor': { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/30' },
  'Page Layout': { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30' },
};

/**
 * Category display order
 * Determines the order categories appear in the widget library
 */
export const CATEGORY_ORDER = [
  'Content',
  'Social Proof',
  'Commerce',
  'Lead Gen',
  'Doctor',
  'Page Layout',
];

/**
 * Get widgets filtered for Article editor
 * Excludes Page Layout widgets which are only for pages
 */
export function getArticleWidgets(): WidgetTypeDefinition[] {
  return WIDGET_TYPES.filter(w => w.category !== 'Page Layout');
}

/**
 * Get widgets filtered for Page editor
 * Includes all widgets including Page Layout specific ones
 */
export function getPageWidgets(): WidgetTypeDefinition[] {
  return WIDGET_TYPES;
}

/**
 * Get widgets grouped by category
 */
export function getWidgetsByCategory(widgets: WidgetTypeDefinition[]): Record<string, WidgetTypeDefinition[]> {
  return widgets.reduce((acc, widget) => {
    if (!acc[widget.category]) {
      acc[widget.category] = [];
    }
    acc[widget.category].push(widget);
    return acc;
  }, {} as Record<string, WidgetTypeDefinition[]>);
}

/**
 * Get ordered categories that have widgets
 */
export function getOrderedCategories(widgets: WidgetTypeDefinition[]): string[] {
  const categoriesWithWidgets = new Set(widgets.map(w => w.category));
  return CATEGORY_ORDER.filter(cat => categoriesWithWidgets.has(cat));
}

/**
 * Legacy widget type aliases
 * Maps old widget type names to their current canonical types
 * Used to display proper names for widgets created before standardization
 */
export const LEGACY_TYPE_ALIASES: Record<string, string> = {
  'timeline': 'expectation-timeline',
  'top-ten': 'top-ten-list',
  'faq': 'faq-accordion',
  'before-after': 'before-after-comparison',
};

/**
 * Find a widget by type (handles legacy aliases)
 */
export function getWidgetByType(type: string): WidgetTypeDefinition | undefined {
  // First try direct match
  const directMatch = WIDGET_TYPES.find(w => w.type === type);
  if (directMatch) return directMatch;

  // Try legacy alias
  const canonicalType = LEGACY_TYPE_ALIASES[type];
  if (canonicalType) {
    return WIDGET_TYPES.find(w => w.type === canonicalType);
  }

  return undefined;
}

/**
 * Get display name for a widget type (handles legacy aliases)
 */
export function getWidgetDisplayName(type: string): string {
  const widget = getWidgetByType(type);
  return widget?.name || type;
}
