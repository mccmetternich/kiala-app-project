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
  ExternalLink,
  Copy,
  AlertTriangle,
  Check,
  X
} from 'lucide-react';
import EnhancedAdminLayout from '@/components/admin/EnhancedAdminLayout';
import WidgetEditor from '@/components/admin/WidgetEditor';
import { Widget, WidgetType } from '@/types';
import { getPageWidgets, getWidgetsByCategory, CATEGORY_COLORS, getOrderedCategories } from '@/lib/widget-library';
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

// Get widgets from centralized library (includes all widgets for pages)
const widgetTypes = getPageWidgets();
const categoryColors = CATEGORY_COLORS;

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
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Page Layout', 'Content', 'Social Proof', 'Commerce']));
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [duplicateLoading, setDuplicateLoading] = useState(false);
  const [duplicateSuccess, setDuplicateSuccess] = useState(false);

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

  const handleDuplicate = async () => {
    if (!siteId || !currentPage) return;

    setDuplicateLoading(true);
    setDuplicateSuccess(false);
    try {
      // Create a duplicate page with "DUPLICATE" in title and as draft
      const duplicateData = {
        siteId,
        title: `DUPLICATE - ${currentPage.title}`,
        slug: `${currentPage.slug}-duplicate-${Date.now()}`.replace(/^\//, ''),
        template: currentPage.type || 'default',
        widget_config: JSON.stringify(widgets),
        published: false, // Always start as draft
      };

      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duplicateData)
      });

      if (response.ok) {
        setDuplicateSuccess(true);
        setTimeout(() => setDuplicateSuccess(false), 3000);
      } else {
        alert('Error duplicating page');
      }
    } catch (error) {
      console.error('Error duplicating page:', error);
      alert('Error duplicating page');
    } finally {
      setDuplicateLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentPage?.id) return;

    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/pages/${currentPage.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Navigate back to site dashboard
        router.push(`/admin/sites/${siteId}/dashboard`);
      } else {
        alert('Error deleting page');
      }
    } catch (error) {
      console.error('Error deleting page:', error);
      alert('Error deleting page');
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
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
            {/* Duplicate Button */}
            <button
              onClick={handleDuplicate}
              disabled={duplicateLoading}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                duplicateSuccess
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
              }`}
              title="Duplicate Page"
            >
              {duplicateLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : duplicateSuccess ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {duplicateSuccess ? 'Duplicated!' : 'Duplicate'}
            </button>

            <a
              href={`https://kiala-app-project.vercel.app/site/${site?.subdomain || siteId}${currentPage.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentPage.enabled
                  ? 'bg-green-600 hover:bg-green-500 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
              }`}
            >
              <Eye className="w-4 h-4" />
              {currentPage.enabled ? 'View Live' : 'Preview'}
            </a>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Page'}
            </button>

            {/* Delete Button */}
            <button
              onClick={() => setShowDeleteModal(true)}
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
              title="Delete Page"
            >
              <Trash2 className="w-4 h-4" />
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
            <div
              className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden"
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add('ring-2', 'ring-primary-500/50');
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove('ring-2', 'ring-primary-500/50');
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('ring-2', 'ring-primary-500/50');
                const widgetType = e.dataTransfer.getData('widgetType');
                if (widgetType) {
                  addWidget(widgetType as WidgetType);
                }
              }}
            >
              {widgets.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4">
                    <Layers className="w-8 h-8 text-primary-400" />
                  </div>
                  <h4 className="text-lg font-medium text-white mb-2">Start Building Your Page</h4>
                  <p className="text-gray-400 mb-4">Drag widgets from the library or click them to add</p>
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
              <div className="p-4 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-750">
                <h3 className="text-sm font-semibold text-white">Widget Library</h3>
                <p className="text-xs text-gray-400 mt-1">Click or drag widgets to add to your page</p>
              </div>
              <div className="max-h-[calc(100vh-300px)] overflow-y-auto p-2 space-y-1.5">
                {Object.entries(widgetsByCategory).map(([category, categoryWidgets]) => (
                  <div key={category} className="rounded-lg overflow-hidden bg-gray-800/30">
                    <button
                      onClick={() => toggleCategory(category)}
                      className={`w-full flex items-center justify-between p-2.5 ${categoryColors[category]?.bg || 'bg-gray-700/50'} hover:brightness-125 transition-all`}
                    >
                      <span className={`text-sm font-medium ${categoryColors[category]?.text || 'text-gray-300'}`}>
                        {category}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 bg-gray-700/60 px-2 py-0.5 rounded-full">{categoryWidgets.length}</span>
                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-150 ${expandedCategories.has(category) ? 'rotate-180' : ''}`} />
                      </div>
                    </button>
                    {expandedCategories.has(category) && (
                      <div className="p-2 space-y-1">
                        {categoryWidgets.map((widget) => {
                          const Icon = widget.icon;
                          return (
                            <div
                              key={widget.type}
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData('widgetType', widget.type);
                                e.dataTransfer.effectAllowed = 'copy';
                              }}
                              onClick={() => addWidget(widget.type as WidgetType)}
                              className="w-full flex items-start gap-2.5 p-2.5 rounded-lg bg-gray-800/60 hover:bg-gray-700/80 transition-colors group text-left cursor-grab active:cursor-grabbing"
                            >
                              <div className={`w-7 h-7 rounded-lg ${categoryColors[category]?.bg || 'bg-gray-700'} flex items-center justify-center flex-shrink-0`}>
                                <Icon className={`w-3.5 h-3.5 ${categoryColors[category]?.text || 'text-gray-400'}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">{widget.name}</p>
                                <p className="text-xs text-gray-500 leading-snug mt-0.5 line-clamp-2">{widget.description}</p>
                              </div>
                            </div>
                          );
                        })}
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-red-500/10 border-b border-red-500/20 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Delete Page</h3>
                  <p className="text-sm text-red-300">This action cannot be undone</p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5">
              <p className="text-gray-300">
                Are you sure you want to delete <span className="font-semibold text-white">"{currentPage.title}"</span>?
              </p>
              <p className="text-sm text-gray-400 mt-2">
                All widgets and configurations for this page will be permanently removed.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-800/50 border-t border-gray-700 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
                className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {deleteLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Page
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </EnhancedAdminLayout>
  );
}
