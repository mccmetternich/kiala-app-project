'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Save,
  Eye,
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  ExternalLink,
  FileText,
  Settings,
  Layers,
  Plus,
  GripVertical,
  ChevronRight,
  Check,
  Clock,
  BarChart3,
  Tag,
  Link2,
  Globe
} from 'lucide-react';
import Link from 'next/link';
import MediaLibrary from '@/components/admin/MediaLibrary';
import WidgetEditor from '@/components/admin/WidgetEditor';
import { Widget, WidgetType } from '@/types';
import { generateDefaultWidgetConfig, parseWidgetConfig, serializeWidgetConfig } from '@/lib/article-widget-defaults';
import { getArticleWidgets, getWidgetsByCategory, CATEGORY_COLORS, getOrderedCategories } from '@/lib/widget-library';

interface Site {
  id: string;
  name: string;
  domain: string;
  subdomain: string;
  brand_profile?: any;
}

interface TrackingConfig {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  passthrough_fbclid?: boolean;
}

interface Article {
  id: string;
  site_id: string;
  title: string;
  excerpt: string;
  content: string;
  slug: string;
  category: string;
  image: string;
  featured: boolean;
  trending: boolean;
  hero: boolean;
  boosted: boolean;
  published: boolean;
  read_time: number;
  views: number;
  realViews?: number;
  widget_config?: string;
  tracking_config?: string;
  created_at?: string;
  updated_at?: string;
  published_at?: string;
  // Author override fields
  author_name?: string;
  author_image?: string;
  // Display override fields
  display_views?: number;
  display_likes?: number;
}

type TabType = 'content' | 'details';

// Get widgets from centralized library (excludes Page Layout widgets)
const widgetTypes = getArticleWidgets();
const categoryColors = CATEGORY_COLORS;

export default function EditArticle() {
  const router = useRouter();
  const params = useParams();
  const articleId = params?.id as string;
  const contentRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [article, setArticle] = useState<Article | null>(null);
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [trackingConfig, setTrackingConfig] = useState<TrackingConfig>({
    passthrough_fbclid: true
  });
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Content', 'Social Proof', 'Commerce']));

  const [formData, setFormData] = useState({
    site_id: '',
    title: '',
    excerpt: '',
    content: '',
    slug: '',
    category: '',
    image: '',
    featured: false,
    trending: false,
    hero: false,
    boosted: false,
    published: false,
    read_time: 5,
    published_at: '',
    author_name: '',
    author_image: '',
    views: 0,  // Display views shown on front-end
    display_views: 0,
    display_likes: 0
  });
  const [showAuthorMediaLibrary, setShowAuthorMediaLibrary] = useState(false);

  useEffect(() => {
    if (articleId) {
      fetchArticle();
    }
    fetchSites();
  }, [articleId]);

  const fetchSites = async () => {
    try {
      const response = await fetch('/api/sites');
      const data = await response.json();
      setSites(data.sites || []);
    } catch (error) {
      console.error('Error fetching sites:', error);
    }
  };

  const fetchArticle = async () => {
    try {
      setInitialLoading(true);
      const [articleResponse, realViewsResponse] = await Promise.all([
        fetch(`/api/articles/${articleId}`),
        fetch(`/api/articles?all=true&includeRealViews=true`).then(r => r.json()).catch(() => ({ articles: [] }))
      ]);
      const data = await articleResponse.json();
      const realViewsMap = new Map((realViewsResponse.articles || []).map((a: any) => [a.id, a.realViews || 0]));

      if (data.article) {
        const articleWithRealViews = {
          ...data.article,
          realViews: realViewsMap.get(data.article.id) || 0
        };
        setArticle(articleWithRealViews);
        setFormData({
          site_id: data.article.site_id,
          title: data.article.title,
          excerpt: data.article.excerpt || '',
          content: data.article.content || '',
          slug: data.article.slug,
          category: data.article.category || '',
          image: data.article.image || '',
          featured: Boolean(data.article.featured),
          trending: Boolean(data.article.trending),
          hero: Boolean(data.article.hero),
          boosted: Boolean(data.article.boosted),
          published: Boolean(data.article.published),
          read_time: data.article.read_time || 5,
          published_at: data.article.published_at || '',
          author_name: data.article.author_name || '',
          author_image: data.article.author_image || '',
          views: data.article.views || 0,
          display_views: data.article.display_views || 0,
          display_likes: data.article.display_likes || 0
        });

        const storedWidgets = parseWidgetConfig(data.article.widget_config);
        if (storedWidgets && storedWidgets.length > 0) {
          setWidgets(storedWidgets);
        } else {
          const defaultWidgets = generateDefaultWidgetConfig({
            id: data.article.id,
            title: data.article.title,
            excerpt: data.article.excerpt || '',
            content: data.article.content || '',
            category: data.article.category || 'Health',
            image: data.article.image || '',
            siteId: data.article.site_id,
            siteBrandName: undefined
          });
          setWidgets(defaultWidgets);
        }

        if (data.article.tracking_config) {
          try {
            const parsed = typeof data.article.tracking_config === 'string'
              ? JSON.parse(data.article.tracking_config)
              : data.article.tracking_config;
            setTrackingConfig({ passthrough_fbclid: true, ...parsed });
          } catch (e) {
            console.error('Error parsing tracking config:', e);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching article:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (field === 'title') {
      const slug = value.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleSave = async (publish?: boolean) => {
    if (!formData.title || !formData.site_id) {
      alert('Title and site are required');
      return;
    }

    setLoading(true);
    setSaveMessage(null);
    try {
      const dataToSend = {
        ...formData,
        published: publish !== undefined ? publish : formData.published,
        widget_config: serializeWidgetConfig(widgets),
        tracking_config: JSON.stringify(trackingConfig)
      };

      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.article) {
          setArticle(data.article);
          setFormData(prev => ({
            ...prev,
            published: Boolean(data.article.published)
          }));
        }
        setSaveMessage(publish ? 'Published!' : 'Saved!');
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        alert('Error saving article');
      }
    } catch (error) {
      console.error('Error saving article:', error);
      alert('Error saving article');
    } finally {
      setLoading(false);
    }
  };

  const addWidget = (type: WidgetType) => {
    const newWidget: Widget = {
      id: `widget-${Date.now()}`,
      type,
      config: {},
      enabled: true,
      position: widgets.length
    };
    setWidgets(prev => [...prev, newWidget]);
  };

  const selectedSite = sites.find(site => site.id === formData.site_id);

  // Group widgets by category
  const widgetsByCategory = widgetTypes.reduce((acc, widget) => {
    if (!acc[widget.category]) {
      acc[widget.category] = [];
    }
    acc[widget.category].push(widget);
    return acc;
  }, {} as Record<string, typeof widgetTypes>);

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">Article not found</p>
          <Link href="/admin/articles" className="text-primary-400 hover:text-primary-300">
            ← Back to Articles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-gray-800/95 backdrop-blur-sm border-b border-gray-700 z-50">
        <div className="max-w-[1800px] mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Left: Back + Title */}
            <div className="flex items-center gap-4 min-w-0">
              <Link
                href={formData.site_id ? `/admin/sites/${formData.site_id}/dashboard` : '/admin/articles'}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="min-w-0">
                <h1 className="text-lg font-semibold text-white truncate max-w-md">
                  {formData.title || 'Untitled Article'}
                </h1>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  {formData.boosted && (
                    <>
                      <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium flex items-center gap-1">
                        Boosted
                      </span>
                      <span>•</span>
                    </>
                  )}
                  <span className={`flex items-center gap-1 ${formData.published ? 'text-green-400' : ''}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${formData.published ? 'bg-green-400' : 'bg-gray-500'}`}></span>
                    {formData.published ? 'Published' : 'Draft'}
                  </span>
                  <span>•</span>
                  <span>{widgets.length} widgets</span>
                </div>
              </div>
            </div>

            {/* Center: Tabs */}
            <div className="hidden md:flex items-center gap-1 bg-gray-700/50 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('details')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'details'
                    ? 'bg-gray-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Settings className="w-4 h-4" />
                Article Details
              </button>
              <button
                onClick={() => setActiveTab('content')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'content'
                    ? 'bg-gray-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Layers className="w-4 h-4" />
                Edit Content
              </button>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {selectedSite && (
                <a
                  href={`https://kiala-app-project.vercel.app/preview/${selectedSite.subdomain}/articles/${formData.slug}?token=${articleId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-all text-sm"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </a>
              )}
              <button
                onClick={() => handleSave(false)}
                disabled={loading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                  saveMessage === 'Saved!'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : saveMessage === 'Saved!' ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">{saveMessage === 'Saved!' ? 'Saved!' : 'Save'}</span>
              </button>
              <button
                onClick={() => handleSave(true)}
                disabled={loading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                  saveMessage === 'Published!'
                    ? 'bg-green-600 text-white'
                    : 'bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-600/20'
                }`}
              >
                {saveMessage === 'Published!' ? <Check className="w-4 h-4" /> : null}
                {formData.published ? 'Update' : 'Publish'}
              </button>
            </div>
          </div>

          {/* Mobile Tabs */}
          <div className="md:hidden flex items-center gap-2 pb-3 -mt-1">
            <button
              onClick={() => setActiveTab('details')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'details'
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400'
              }`}
            >
              <Settings className="w-4 h-4" />
              Article Details
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'content'
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400'
              }`}
            >
              <Layers className="w-4 h-4" />
              Edit Content
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="pt-20 md:pt-16">
        {/* CONTENT TAB */}
        {activeTab === 'content' && (
          <div className="flex">
            {/* Widget Editor - 2/3 */}
            <div ref={contentRef} className="flex-1 min-w-0 p-4 md:p-6 lg:pr-[400px]">
              <div className="max-w-4xl mx-auto">
                {/* Widget Editor */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                  <WidgetEditor
                    widgets={widgets}
                    onWidgetsChange={setWidgets}
                    siteId={formData.site_id}
                    articleId={articleId}
                  />
                </div>
              </div>
            </div>

            {/* Widget Library - Floating Sidebar */}
            <div className="hidden lg:block fixed right-0 top-16 bottom-0 w-[380px] bg-gradient-to-b from-gray-800 to-gray-900 border-l border-gray-700 overflow-hidden shadow-2xl">
              <div className="h-full flex flex-col">
                {/* Library Header */}
                <div className="p-5 border-b border-gray-700/50 bg-gray-800/80 backdrop-blur-sm">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
                      <Plus className="w-4 h-4 text-white" />
                    </div>
                    Widget Library
                  </h3>
                  <p className="text-sm text-gray-400 mt-2">Click to add or drag widgets into your article</p>
                </div>

                {/* Categories */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {Object.entries(widgetsByCategory).map(([category, categoryWidgets]) => {
                    const colors = categoryColors[category] || categoryColors['Content'];
                    const isExpanded = expandedCategories.has(category);

                    const toggleCategory = () => {
                      const newSet = new Set(expandedCategories);
                      if (isExpanded) {
                        newSet.delete(category);
                      } else {
                        newSet.add(category);
                      }
                      setExpandedCategories(newSet);
                    };

                    return (
                      <div key={category} className={`rounded-xl border ${colors.border} overflow-hidden bg-gray-800/50`}>
                        {/* Category Header */}
                        <button
                          onClick={toggleCategory}
                          className={`w-full flex items-center justify-between p-3.5 ${colors.bg} hover:brightness-110 transition-all`}
                        >
                          <span className={`text-sm font-semibold ${colors.text}`}>{category}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 bg-gray-700/50 px-2 py-0.5 rounded-full">{categoryWidgets.length}</span>
                            <ChevronRight className={`w-4 h-4 ${colors.text} transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                          </div>
                        </button>

                        {/* Widgets in Category */}
                        {isExpanded && (
                          <div className="p-2 space-y-1.5">
                            {categoryWidgets.map((widget) => (
                              <div
                                key={widget.type}
                                draggable
                                onDragStart={(e) => {
                                  e.dataTransfer.setData('widgetType', widget.type);
                                  e.dataTransfer.effectAllowed = 'copy';
                                }}
                                onClick={() => addWidget(widget.type as WidgetType)}
                                className="w-full flex items-start gap-3 p-3 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-500 transition-all group text-left cursor-grab active:cursor-grabbing hover:shadow-lg"
                              >
                                <div className={`w-9 h-9 rounded-lg ${colors.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                                  <Plus className={`w-4 h-4 ${colors.text}`} />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-white group-hover:text-primary-300 transition-colors">{widget.name}</p>
                                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{widget.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Stats Footer */}
                <div className="p-4 border-t border-gray-700/50 bg-gray-900/80 backdrop-blur-sm">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Active Widgets</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold">{widgets.filter(w => w.enabled).length}</span>
                      <span className="text-gray-500">/</span>
                      <span className="text-gray-400">{widgets.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DETAILS TAB */}
        {activeTab === 'details' && (
          <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
            {/* Stats - At Top */}
            <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
              <div className="p-5 border-b border-gray-700 bg-gray-800/50">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary-400" />
                  Statistics
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-700/50 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-white">{(article.realViews || 0).toLocaleString()}</p>
                    <p className="text-sm text-gray-400 mt-1">Real Views</p>
                  </div>
                  <div className="bg-gray-700/50 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-white">{widgets.length}</p>
                    <p className="text-sm text-gray-400 mt-1">Widgets</p>
                  </div>
                  <div className="bg-gray-700/50 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-white">{formData.read_time}</p>
                    <p className="text-sm text-gray-400 mt-1">Min Read</p>
                  </div>
                  <div className="bg-gray-700/50 rounded-xl p-4 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <button
                        onClick={() => handleInputChange('published', !formData.published)}
                        className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                          formData.published ? 'bg-green-500' : 'bg-gray-600'
                        }`}
                        title={formData.published ? 'Click to unpublish' : 'Click to publish'}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-md ${
                            formData.published ? 'translate-x-8' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <p className={`text-sm font-medium ${formData.published ? 'text-green-400' : 'text-gray-400'}`}>
                        {formData.published ? 'Live' : 'Draft'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Article Info */}
            <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
              <div className="p-5 border-b border-gray-700 bg-gray-800/50">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary-400" />
                  Article Information
                </h2>
              </div>
              <div className="p-6 space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter article title..."
                  />
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Excerpt</label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => handleInputChange('excerpt', e.target.value)}
                    rows={3}
                    className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    placeholder="Brief description for previews and SEO..."
                  />
                </div>

                {/* Hero Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Hero Image</label>
                  <div className="flex items-start gap-4">
                    {formData.image ? (
                      <div className="relative group">
                        <img
                          src={formData.image}
                          alt="Preview"
                          className="w-32 h-20 object-cover rounded-xl border border-gray-600"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                        <button
                          type="button"
                          onClick={() => handleInputChange('image', '')}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className="w-32 h-20 bg-gray-700 border-2 border-dashed border-gray-600 rounded-xl flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-500" />
                      </div>
                    )}
                    <div className="flex-1 space-y-2">
                      <button
                        type="button"
                        onClick={() => setShowMediaLibrary(true)}
                        className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all text-sm"
                      >
                        <Upload className="w-4 h-4" />
                        {formData.image ? 'Change Image' : 'Select Image'}
                      </button>
                      <input
                        type="url"
                        value={formData.image}
                        onChange={(e) => handleInputChange('image', e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-xl px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        placeholder="Or paste image URL..."
                      />
                    </div>
                  </div>
                </div>

                {/* Body Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Article Body</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    rows={8}
                    className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm resize-none"
                    placeholder="Main article content (Markdown supported)..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This is fallback content. Use widgets in the Content tab for rich layouts.
                  </p>
                </div>
              </div>
            </div>

            {/* Publishing Settings */}
            <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
              <div className="p-5 border-b border-gray-700 bg-gray-800/50">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary-400" />
                  Publishing
                </h2>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Site */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Site *</label>
                    <select
                      value={formData.site_id}
                      onChange={(e) => handleInputChange('site_id', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {sites.map(site => (
                        <option key={site.id} value={site.id}>{site.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">URL Slug</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="article-url-slug"
                    />
                    {selectedSite && (
                      <p className="text-xs text-gray-500 mt-1">
                        /site/{selectedSite.subdomain}/articles/{formData.slug}
                      </p>
                    )}
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Health"
                    />
                  </div>

                  {/* Read Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Read Time (minutes)</label>
                    <input
                      type="number"
                      value={formData.read_time}
                      onChange={(e) => handleInputChange('read_time', parseInt(e.target.value))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      min="1"
                      max="60"
                    />
                  </div>

                  {/* Publish Date */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Publish Date
                      <span className="text-gray-500 font-normal ml-2">(when this article should appear as published)</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.published_at ? new Date(formData.published_at).toISOString().slice(0, 16) : ''}
                      onChange={(e) => handleInputChange('published_at', e.target.value ? new Date(e.target.value).toISOString() : '')}
                      className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Leave empty to use the actual publish time. Set a past date for backdating articles.
                    </p>
                  </div>
                </div>

                {/* Boosted Article - Internal Tagging */}
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <h3 className="text-sm font-medium text-gray-300 mb-4">Campaign Tracking</h3>
                  <label className={`flex items-center gap-4 cursor-pointer p-4 rounded-xl transition-all border-2 ${
                    formData.boosted
                      ? 'bg-yellow-500/10 border-yellow-500/50'
                      : 'bg-gray-700/50 border-transparent hover:bg-gray-700'
                  }`}>
                    <input
                      type="checkbox"
                      checked={formData.boosted}
                      onChange={(e) => handleInputChange('boosted', e.target.checked)}
                      className="w-6 h-6 text-yellow-500 bg-gray-700 border-gray-600 rounded focus:ring-yellow-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold text-lg">Boosted Article</span>
                        {formData.boosted && (
                          <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium">Active</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mt-1">
                        Mark this article as boosted to track active ad campaigns. This is for internal tracking only and won't be visible to visitors.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Visibility Flags */}
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <h3 className="text-sm font-medium text-gray-300 mb-4">Visibility Flags</h3>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-3 cursor-pointer bg-gray-700/50 px-4 py-3 rounded-xl hover:bg-gray-700 transition-all">
                      <input
                        type="checkbox"
                        checked={formData.hero}
                        onChange={(e) => handleInputChange('hero', e.target.checked)}
                        className="w-5 h-5 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                      />
                      <div>
                        <span className="text-white font-medium">Hero Article</span>
                        <p className="text-xs text-gray-500">Display as hero on homepage</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Author Override */}
            <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
              <div className="p-5 border-b border-gray-700 bg-gray-800/50">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-primary-400" />
                  Author Override
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Override the default site author for this specific article
                </p>
              </div>
              <div className="p-6">
                <div className="flex items-start gap-6">
                  {/* Author Image */}
                  <div className="flex-shrink-0">
                    {formData.author_image ? (
                      <div className="relative group">
                        <img
                          src={formData.author_image}
                          alt="Author"
                          className="w-20 h-20 rounded-full object-cover border-2 border-gray-600"
                        />
                        <button
                          type="button"
                          onClick={() => handleInputChange('author_image', '')}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className="w-20 h-20 bg-gray-700 border-2 border-dashed border-gray-600 rounded-full flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-500" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowAuthorMediaLibrary(true)}
                      className="mt-2 text-xs text-primary-400 hover:text-primary-300 transition-colors"
                    >
                      {formData.author_image ? 'Change' : 'Add Image'}
                    </button>
                  </div>

                  {/* Author Name */}
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Author Name</label>
                    <input
                      type="text"
                      value={formData.author_name}
                      onChange={(e) => handleInputChange('author_name', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Leave empty to use site default author"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      If set, this author will be shown instead of the site's default author.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Display Metrics */}
            <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
              <div className="p-5 border-b border-gray-700 bg-gray-800/50">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary-400" />
                  Display Metrics
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Set the view count and likes displayed publicly on the article page
                </p>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Display Views
                      <span className="text-gray-500 font-normal ml-2">(shown on article page)</span>
                    </label>
                    <input
                      type="number"
                      value={formData.views || ''}
                      onChange={(e) => handleInputChange('views', parseInt(e.target.value) || 0)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="e.g., 2340000"
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This number appears on the public article page (e.g., "2.34M Views 🔥")
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Display Likes
                      <span className="text-gray-500 font-normal ml-2">(shown publicly)</span>
                    </label>
                    <input
                      type="number"
                      value={formData.display_likes || ''}
                      onChange={(e) => handleInputChange('display_likes', parseInt(e.target.value) || 0)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
                <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <p className="text-blue-300 text-sm">
                    <strong>Note:</strong> These are the vanity metrics shown to readers. Real traffic is tracked separately in the admin analytics.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Tracking */}
            <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
              <div className="p-5 border-b border-gray-700 bg-gray-800/50">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-primary-400" />
                  CTA Link Tracking
                </h2>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">utm_source</label>
                    <input
                      type="text"
                      value={trackingConfig.utm_source || ''}
                      onChange={(e) => setTrackingConfig(prev => ({ ...prev, utm_source: e.target.value }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="facebook, google"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">utm_medium</label>
                    <input
                      type="text"
                      value={trackingConfig.utm_medium || ''}
                      onChange={(e) => setTrackingConfig(prev => ({ ...prev, utm_medium: e.target.value }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="cpc, social"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">utm_campaign</label>
                    <input
                      type="text"
                      value={trackingConfig.utm_campaign || ''}
                      onChange={(e) => setTrackingConfig(prev => ({ ...prev, utm_campaign: e.target.value }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="hormone-article"
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={trackingConfig.passthrough_fbclid !== false}
                        onChange={(e) => setTrackingConfig(prev => ({ ...prev, passthrough_fbclid: e.target.checked }))}
                        className="w-5 h-5 text-primary-600 bg-gray-700 border-gray-600 rounded focus:ring-primary-500"
                      />
                      <span className="text-white">Pass through fbclid</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Media Library Modal - Hero Image */}
      {formData.site_id && (
        <MediaLibrary
          isOpen={showMediaLibrary}
          onClose={() => setShowMediaLibrary(false)}
          onSelect={(file) => {
            handleInputChange('image', file.url);
            setShowMediaLibrary(false);
          }}
          siteId={formData.site_id}
        />
      )}

      {/* Media Library Modal - Author Image */}
      {formData.site_id && (
        <MediaLibrary
          isOpen={showAuthorMediaLibrary}
          onClose={() => setShowAuthorMediaLibrary(false)}
          onSelect={(file) => {
            handleInputChange('author_image', file.url);
            setShowAuthorMediaLibrary(false);
          }}
          siteId={formData.site_id}
        />
      )}
    </div>
  );
}
