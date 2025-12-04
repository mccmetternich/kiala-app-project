'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Save,
  ArrowLeft,
  Eye,
  FileText,
  Settings,
  Layers,
  Plus,
  GripVertical,
  Trash2,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';
import EnhancedAdminLayout from '@/components/admin/EnhancedAdminLayout';
import WidgetEditor from '@/components/admin/WidgetEditor';
import { Widget, WidgetType } from '@/types';
// Generate simple default config for page widgets
const generatePageWidgetConfig = (type: WidgetType): Record<string, any> => {
  const defaults: Record<string, Record<string, any>> = {
    'text-block': { content: '<p>Enter your content here...</p>' },
    'hero-story': { headline: 'Welcome', subheading: 'Your story starts here', buttonText: 'Learn More' },
    'article-grid': { count: 6, showFeatured: true },
    'testimonial': { quotes: [{ name: 'Customer', text: 'Great experience!', rating: 5 }] },
    'stacked-quotes': { quotes: [] },
    'before-after-comparison': { beforeImage: '', afterImage: '' },
    'review-grid': { reviews: [] },
    'social-proof': { memberCount: 1000 },
    'product-showcase': { name: 'Product Name', price: 99, description: '' },
    'exclusive-product': { name: '#1 Recommended', price: 99 },
    'shop-now': { packages: [] },
    'cta-button': { buttonText: 'Get Started', buttonUrl: '#' },
    'email-capture': { headline: 'Join Our Newsletter', buttonText: 'Subscribe' },
    'faq-accordion': { faqs: [] },
  };
  return defaults[type] || {};
};

// Page type metadata - what widgets each page type typically uses
const PAGE_TYPE_INFO: Record<string, { description: string; suggestedWidgets: WidgetType[] }> = {
  'home': {
    description: 'Landing page with hero, featured articles, and CTAs',
    suggestedWidgets: ['hero-story', 'article-grid', 'social-proof', 'email-capture', 'testimonial']
  },
  'articles': {
    description: 'Article listing page showing all published articles',
    suggestedWidgets: ['article-grid', 'email-capture']
  },
  'about': {
    description: 'About the brand/doctor with bio, credentials, and story',
    suggestedWidgets: ['text-block', 'testimonial', 'email-capture']
  },
  'top-picks': {
    description: 'Product recommendations and affiliate offers',
    suggestedWidgets: ['product-showcase', 'exclusive-product', 'shop-now', 'testimonial']
  },
  'success-stories': {
    description: 'Customer testimonials and transformation stories',
    suggestedWidgets: ['testimonial', 'before-after-comparison', 'stacked-quotes', 'review-grid']
  }
};

// Unified Widget Library - same widgets available for both articles and pages
const widgetTypes: { type: WidgetType; name: string; category: string; description: string }[] = [
  // Page-Specific Widgets
  { type: 'hero-story', name: 'Hero Story', category: 'Page Layout', description: 'Hero section with headline, image, CTA' },
  { type: 'article-grid', name: 'Article Grid', category: 'Page Layout', description: 'Display articles from site' },
  { type: 'social-proof', name: 'Social Proof Banner', category: 'Page Layout', description: 'Community count and trust indicators' },

  // Content Widgets (from articles)
  { type: 'text-block', name: 'Text Block', category: 'Content', description: 'Rich text editor for content' },
  { type: 'top-ten-list', name: 'Top 10 List', category: 'Content', description: 'Numbered routine or tips list' },
  { type: 'expectation-timeline', name: 'Timeline', category: 'Content', description: 'Visual timeline of expected results' },
  { type: 'faq-accordion', name: 'FAQ Accordion', category: 'Content', description: 'Expandable FAQ section' },
  { type: 'data-overview', name: 'Data Overview', category: 'Content', description: 'Statistics and data points display' },
  { type: 'symptoms-checker', name: 'Symptoms Checker', category: 'Content', description: '"Is this you?" symptom checker' },
  { type: 'ingredient-list-grid', name: 'Ingredient List Grid', category: 'Content', description: 'Grid of ingredients with avatars' },

  // Social Proof Widgets
  { type: 'testimonial', name: 'Testimonial Carousel', category: 'Social Proof', description: 'Customer success stories carousel' },
  { type: 'stacked-quotes', name: 'Stacked Quotes', category: 'Social Proof', description: 'Vertically stacked testimonials' },
  { type: 'before-after-comparison', name: 'Before/After Slider', category: 'Social Proof', description: 'Interactive drag-to-compare transformation' },
  { type: 'before-after-side-by-side', name: 'Before/After Static', category: 'Social Proof', description: 'Side-by-side transformation images' },
  { type: 'rating-stars', name: 'Rating Display', category: 'Social Proof', description: 'Star ratings and reviews' },
  { type: 'review-grid', name: 'Review Grid', category: 'Social Proof', description: '4-column review cards with ratings' },
  { type: 'press-logos', name: 'Press Logos', category: 'Social Proof', description: 'Featured press mentions with quotes' },
  { type: 'scrolling-thumbnails', name: 'Scrolling Thumbnails', category: 'Social Proof', description: 'Infinite scrolling customer photos' },
  { type: 'testimonial-hero-no-cta', name: 'Testimonial Hero - No CTA', category: 'Social Proof', description: 'Large testimonial with image, no button' },
  { type: 'testimonial-hero', name: 'Testimonial Hero - With CTA', category: 'Social Proof', description: 'Large testimonial with image and CTA button' },

  // Conversion Widgets
  { type: 'product-showcase', name: 'Product Showcase', category: 'Conversion', description: 'Featured product with ratings and CTA' },
  { type: 'exclusive-product', name: "Dr's #1 Pick", category: 'Conversion', description: 'Doctor recommended product card' },
  { type: 'shop-now', name: 'Shop Now - 3x Options', category: 'Conversion', description: 'Product with pricing options' },
  { type: 'special-offer', name: 'Special Offer', category: 'Conversion', description: 'Offer with countdown and social proof' },
  { type: 'dual-offer-comparison', name: 'Dual Offers', category: 'Conversion', description: 'Side-by-side offer comparison' },
  { type: 'us-vs-them-comparison', name: 'Us Vs Them', category: 'Conversion', description: 'Two-column product comparison' },
  { type: 'comparison-table', name: 'Comparison Table', category: 'Conversion', description: 'Us vs them product comparison' },
  { type: 'cta-button', name: 'CTA Button', category: 'Conversion', description: 'Call-to-action button' },

  // Urgency Widgets
  { type: 'countdown-timer', name: 'Countdown Timer', category: 'Urgency', description: 'Limited time offer countdown' },

  // Lead Gen Widgets
  { type: 'email-capture', name: 'Email Capture', category: 'Lead Gen', description: 'Newsletter signup with lead magnet' }
];

const categoryColors: Record<string, { bg: string; text: string }> = {
  'Page Layout': { bg: 'bg-cyan-500/10', text: 'text-cyan-400' },
  'Content': { bg: 'bg-blue-500/10', text: 'text-blue-400' },
  'Social Proof': { bg: 'bg-purple-500/10', text: 'text-purple-400' },
  'Conversion': { bg: 'bg-green-500/10', text: 'text-green-400' },
  'Urgency': { bg: 'bg-red-500/10', text: 'text-red-400' },
  'Lead Gen': { bg: 'bg-yellow-500/10', text: 'text-yellow-400' },
};

// Default pages fallback (same as dashboard)
const DEFAULT_PAGES = [
  { id: 'home', type: 'homepage', slug: '/', title: 'Home', navLabel: 'Home', enabled: true, showInNav: true, navOrder: 1, navMode: 'global' },
  { id: 'articles', type: 'articles', slug: '/articles', title: 'Articles', navLabel: 'Articles', enabled: true, showInNav: true, navOrder: 2, navMode: 'global' },
  { id: 'about', type: 'about', slug: '/about', title: 'About', navLabel: 'About', enabled: true, showInNav: true, navOrder: 3, navMode: 'global' },
  { id: 'top-picks', type: 'top-picks', slug: '/top-picks', title: 'Top Picks', navLabel: 'Top Picks', enabled: false, showInNav: false, navOrder: 4, navMode: 'global' },
  { id: 'success-stories', type: 'success-stories', slug: '/success-stories', title: 'Success Stories', navLabel: 'Success Stories', enabled: false, showInNav: false, navOrder: 5, navMode: 'global' },
];

export default function EditPage() {
  const router = useRouter();
  const params = useParams();
  const siteId = params?.id as string;
  const pageId = params?.pageId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [site, setSite] = useState<any>(null);
  const [pageConfig, setPageConfig] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<any>(null);
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [showWidgetLibrary, setShowWidgetLibrary] = useState(false);
  const [editingWidgetId, setEditingWidgetId] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Page Layout', 'Content', 'Social Proof', 'Conversion', 'Urgency', 'Lead Gen']));

  useEffect(() => {
    loadData();
  }, [siteId, pageId]);

  const loadData = async () => {
    try {
      const response = await fetch(`/api/sites/${siteId}`);
      if (response.ok) {
        const data = await response.json();
        const siteData = data.site;

        // Parse JSON fields
        if (typeof siteData.page_config === 'string') {
          try { siteData.page_config = JSON.parse(siteData.page_config); } catch { siteData.page_config = { pages: [] }; }
        }

        setSite(siteData);

        // Use saved page_config or fallback to defaults
        const savedPages = siteData.page_config?.pages;
        const pages = (savedPages && savedPages.length > 0) ? savedPages : DEFAULT_PAGES;
        const config = { ...siteData.page_config, pages };
        setPageConfig(config);

        // Find the current page
        const page = pages.find((p: any) => p.id === pageId);
        if (page) {
          setCurrentPage(page);
          setWidgets(page.widgets || []);
          setSeoTitle(page.seoTitle || page.title || '');
          setSeoDescription(page.seoDescription || '');
        }
      }
    } catch (error) {
      console.error('Error loading page:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!pageConfig || !currentPage) return;

    setSaving(true);
    try {
      // Update the current page in the page config
      const updatedPages = pageConfig.pages.map((p: any) =>
        p.id === pageId
          ? { ...p, widgets, seoTitle, seoDescription }
          : p
      );

      const response = await fetch(`/api/sites/${siteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...site,
          page_config: { ...pageConfig, pages: updatedPages }
        }),
      });

      if (response.ok) {
        // Update local state
        setPageConfig({ ...pageConfig, pages: updatedPages });
      }
    } catch (error) {
      console.error('Error saving page:', error);
    } finally {
      setSaving(false);
    }
  };

  const addWidget = (type: WidgetType) => {
    const newWidget: Widget = {
      id: `widget-${Date.now()}`,
      type,
      position: widgets.length,
      config: generatePageWidgetConfig(type),
      enabled: true
    };
    setWidgets([...widgets, newWidget]);
    setShowWidgetLibrary(false);
    setEditingWidgetId(newWidget.id);
  };

  const updateWidget = (widgetId: string, config: any) => {
    setWidgets(widgets.map(w =>
      w.id === widgetId ? { ...w, config } : w
    ));
  };

  const deleteWidget = (widgetId: string) => {
    setWidgets(widgets.filter(w => w.id !== widgetId));
    if (editingWidgetId === widgetId) {
      setEditingWidgetId(null);
    }
  };

  const moveWidget = (widgetId: string, direction: 'up' | 'down') => {
    const index = widgets.findIndex(w => w.id === widgetId);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= widgets.length) return;

    const newWidgets = [...widgets];
    [newWidgets[index], newWidgets[newIndex]] = [newWidgets[newIndex], newWidgets[index]];
    setWidgets(newWidgets);
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <EnhancedAdminLayout>
        <div className="p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      </EnhancedAdminLayout>
    );
  }

  if (!currentPage) {
    return (
      <EnhancedAdminLayout>
        <div className="p-8 text-center">
          <p className="text-gray-400">Page not found</p>
          <Link href={`/admin/sites/${siteId}/dashboard`} className="text-primary-400 hover:underline mt-4 inline-block">
            Back to Dashboard
          </Link>
        </div>
      </EnhancedAdminLayout>
    );
  }

  const pageTypeInfo = PAGE_TYPE_INFO[currentPage.type] || { description: 'Custom page', suggestedWidgets: [] };
  const widgetsByCategory = widgetTypes.reduce((acc, w) => {
    if (!acc[w.category]) acc[w.category] = [];
    acc[w.category].push(w);
    return acc;
  }, {} as Record<string, typeof widgetTypes>);

  return (
    <EnhancedAdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/admin/sites/${siteId}/dashboard`}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              onClick={() => {
                // Set the active tab to pages when returning
                if (typeof window !== 'undefined') {
                  sessionStorage.setItem('siteDashboardTab', 'pages');
                }
              }}
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Edit: {currentPage.title}
              </h1>
              <p className="text-sm text-gray-400 mt-1">{pageTypeInfo.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={`/site/${site?.subdomain || siteId}${currentPage.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4" />
              Preview
            </a>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Page'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Main content - Widgets */}
          <div className="col-span-2 space-y-4">
            {/* SEO Settings */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Settings className="w-4 h-4 text-gray-400" />
                Page Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">SEO Title</label>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder={currentPage.title}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Meta Description</label>
                  <textarea
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    placeholder="Page description for search engines..."
                    rows={2}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Widgets */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="p-5 border-b border-gray-700 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-gray-400" />
                  Page Widgets ({widgets.length})
                </h3>
                <button
                  onClick={() => setShowWidgetLibrary(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Widget
                </button>
              </div>

              {widgets.length === 0 ? (
                <div className="p-8 text-center">
                  <Layers className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">No widgets yet. Add widgets to build your page.</p>
                  <button
                    onClick={() => setShowWidgetLibrary(true)}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm transition-colors"
                  >
                    Add First Widget
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-700/50">
                  {widgets.map((widget, index) => (
                    <div key={widget.id} className="p-4">
                      <div className="flex items-center gap-3">
                        <GripVertical className="w-5 h-5 text-gray-500 cursor-grab" />
                        <div className="flex-1">
                          <p className="font-medium text-white capitalize">
                            {widget.type.replace(/-/g, ' ')}
                          </p>
                          <p className="text-xs text-gray-500">
                            {widgetTypes.find(w => w.type === widget.type)?.description || 'Widget'}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => moveWidget(widget.id, 'up')}
                            disabled={index === 0}
                            className="p-1.5 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => moveWidget(widget.id, 'down')}
                            disabled={index === widgets.length - 1}
                            className="p-1.5 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingWidgetId(editingWidgetId === widget.id ? null : widget.id)}
                            className={`p-1.5 rounded ${editingWidgetId === widget.id ? 'bg-primary-500/20 text-primary-400' : 'text-gray-400 hover:text-white'}`}
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteWidget(widget.id)}
                            className="p-1.5 text-gray-400 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Widget Config Editor - Simple inline editing */}
                      {editingWidgetId === widget.id && (
                        <div className="mt-4 pt-4 border-t border-gray-700 space-y-3">
                          {Object.entries(widget.config || {}).map(([key, value]) => (
                            <div key={key}>
                              <label className="block text-xs font-medium text-gray-400 mb-1 capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </label>
                              {typeof value === 'string' && value.length > 100 ? (
                                <textarea
                                  value={value as string}
                                  onChange={(e) => updateWidget(widget.id, { ...widget.config, [key]: e.target.value })}
                                  rows={3}
                                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 text-sm resize-none"
                                />
                              ) : typeof value === 'string' ? (
                                <input
                                  type="text"
                                  value={value as string}
                                  onChange={(e) => updateWidget(widget.id, { ...widget.config, [key]: e.target.value })}
                                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 text-sm"
                                />
                              ) : typeof value === 'number' ? (
                                <input
                                  type="number"
                                  value={value as number}
                                  onChange={(e) => updateWidget(widget.id, { ...widget.config, [key]: parseFloat(e.target.value) || 0 })}
                                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 text-sm"
                                />
                              ) : typeof value === 'boolean' ? (
                                <label className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={value as boolean}
                                    onChange={(e) => updateWidget(widget.id, { ...widget.config, [key]: e.target.checked })}
                                    className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-primary-500"
                                  />
                                  <span className="text-sm text-gray-300">Enabled</span>
                                </label>
                              ) : (
                                <p className="text-xs text-gray-500">Complex field - edit in JSON</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Widget Library */}
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden sticky top-6">
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-sm font-semibold text-white">Widget Library</h3>
                <p className="text-xs text-gray-400 mt-1">Click to add widgets to your page</p>
              </div>
              <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                {Object.entries(widgetsByCategory).map(([category, categoryWidgets]) => (
                  <div key={category} className="border-b border-gray-700/50 last:border-0">
                    <button
                      onClick={() => toggleCategory(category)}
                      className="w-full flex items-center justify-between p-3 hover:bg-gray-750 transition-colors"
                    >
                      <span className={`text-sm font-medium ${categoryColors[category]?.text || 'text-gray-300'}`}>
                        {category}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedCategories.has(category) ? 'rotate-180' : ''}`} />
                    </button>
                    {expandedCategories.has(category) && (
                      <div className="px-3 pb-3 space-y-1">
                        {categoryWidgets.map((widget) => (
                          <button
                            key={widget.type}
                            onClick={() => addWidget(widget.type)}
                            className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition-colors ${categoryColors[category]?.bg || 'bg-gray-700/50'} hover:bg-gray-700`}
                          >
                            <Plus className="w-3 h-3 text-gray-500" />
                            <div>
                              <p className="text-sm text-white">{widget.name}</p>
                              <p className="text-xs text-gray-500">{widget.description}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Suggested Widgets */}
            {pageTypeInfo.suggestedWidgets.length > 0 && (
              <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
                <p className="text-xs font-medium text-gray-400 mb-2">Suggested for {currentPage.title}</p>
                <div className="flex flex-wrap gap-2">
                  {pageTypeInfo.suggestedWidgets.map((type) => {
                    const widget = widgetTypes.find(w => w.type === type);
                    if (!widget) return null;
                    return (
                      <button
                        key={type}
                        onClick={() => addWidget(type)}
                        className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-xs text-gray-300 rounded transition-colors"
                      >
                        + {widget.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </EnhancedAdminLayout>
  );
}
