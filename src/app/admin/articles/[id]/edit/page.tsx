'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Save, Eye, ArrowLeft, Upload, Image as ImageIcon, ExternalLink, Link2, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import MediaLibrary from '@/components/admin/MediaLibrary';
import WidgetEditor from '@/components/admin/WidgetEditor';
import { Widget } from '@/types';
import { generateDefaultWidgetConfig, parseWidgetConfig, serializeWidgetConfig } from '@/lib/article-widget-defaults';

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
  published: boolean;
  read_time: number;
  views: number;
  widget_config?: string;
  tracking_config?: string;
  created_at?: string;
  updated_at?: string;
}

export default function EditArticle() {
  const router = useRouter();
  const params = useParams();
  const articleId = params?.id as string;

  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [article, setArticle] = useState<Article | null>(null);
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [trackingConfig, setTrackingConfig] = useState<TrackingConfig>({
    passthrough_fbclid: true
  });
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [articleDetailsExpanded, setArticleDetailsExpanded] = useState(true);
  const [settingsExpanded, setSettingsExpanded] = useState(false);

  // Show sticky bar when scrolled past header
  useEffect(() => {
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    published: false,
    read_time: 5
  });

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
      const response = await fetch(`/api/articles/${articleId}`);
      const data = await response.json();

      if (data.article) {
        setArticle(data.article);
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
          published: Boolean(data.article.published),
          read_time: data.article.read_time || 5
        });

        // Load widgets from database or generate defaults
        const storedWidgets = parseWidgetConfig(data.article.widget_config);
        if (storedWidgets && storedWidgets.length > 0) {
          setWidgets(storedWidgets);
        } else {
          // Generate default widgets based on article content
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

        // Load tracking config
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

    // Auto-generate slug from title
    if (field === 'title') {
      const slug = value.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const [saveMessage, setSaveMessage] = useState<string | null>(null);

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
        setSaveMessage(publish ? 'Article published!' : 'Changes saved!');
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

  const selectedSite = sites.find(site => site.id === formData.site_id);

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Article not found</p>
          <Link href="/admin/articles" className="text-primary-400 hover:text-primary-300 underline">
            Back to Articles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Fixed Top Bar - Shows on scroll */}
      <div className={`fixed top-0 left-0 right-0 bg-gray-800/95 backdrop-blur-sm border-b border-gray-700 z-40 shadow-lg transition-transform duration-300 ${showStickyBar ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/articles" className="text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="truncate">
              <h2 className="text-sm font-medium text-white truncate max-w-md">
                {formData.title || 'Untitled Article'}
              </h2>
              <p className="text-xs text-gray-400">
                {formData.published ? 'Published' : 'Draft'} · {widgets.length} widgets
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {selectedSite && (
              <a
                href={`/site/${selectedSite.subdomain}/articles/${formData.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">Preview</span>
              </a>
            )}
            <button
              onClick={() => handleSave(false)}
              disabled={loading}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">{loading ? 'Saving...' : 'Save'}</span>
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={loading}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {formData.published ? 'Update' : 'Publish'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Save Success Message */}
        {saveMessage && (
          <div className={`fixed right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-fade-in transition-all duration-300 ${showStickyBar ? 'top-16' : 'top-4'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {saveMessage}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Link href="/admin/articles" className="text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Edit Article</h1>
              <p className="text-gray-400 text-sm">
                {article.views} views · Updated {new Date(article.updated_at || Date.now()).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex gap-2 md:gap-3">
            {selectedSite && (
              <a
                href={`/site/${selectedSite.subdomain}/articles/${formData.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">Preview</span>
              </a>
            )}
            <button
              onClick={() => handleSave(false)}
              disabled={loading}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {loading ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={loading}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              {formData.published ? 'Update' : 'Publish'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content - Widget Editor */}
          <div className="lg:col-span-3 space-y-4">
            {/* Article Details Card - Collapsible */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              <button
                onClick={() => setArticleDetailsExpanded(!articleDetailsExpanded)}
                className="w-full px-4 py-3 flex items-center justify-between bg-gray-750 hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary-400" />
                  <div className="text-left">
                    <h3 className="font-semibold text-white">Article Details</h3>
                    <p className="text-xs text-gray-400">Title, excerpt, hero image, and body content</p>
                  </div>
                </div>
                {articleDetailsExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {articleDetailsExpanded && (
                <div className="p-4 md:p-6 space-y-4 border-t border-gray-700">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Enter article title..."
                    />
                  </div>

                  {/* Excerpt */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Excerpt</label>
                    <textarea
                      value={formData.excerpt}
                      onChange={(e) => handleInputChange('excerpt', e.target.value)}
                      rows={2}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Brief description for previews..."
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
                            className="w-24 h-16 object-cover rounded border border-gray-600"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                          <button
                            type="button"
                            onClick={() => handleInputChange('image', '')}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div className="w-24 h-16 bg-gray-700 border border-gray-600 border-dashed rounded flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-gray-500" />
                        </div>
                      )}
                      <div className="flex-1">
                        <button
                          type="button"
                          onClick={() => setShowMediaLibrary(true)}
                          className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm mb-2"
                        >
                          <Upload className="w-4 h-4" />
                          {formData.image ? 'Change' : 'Select'}
                        </button>
                        <input
                          type="url"
                          value={formData.image}
                          onChange={(e) => handleInputChange('image', e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                          placeholder="Or paste image URL..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Article Body */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Article Body Content</label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => handleInputChange('content', e.target.value)}
                      rows={8}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                      placeholder="Write your article content here (Markdown supported)..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Main article text. Use widgets below for rich, interactive content sections.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Widget Editor - Full Width */}
            <div className="bg-white rounded-lg p-4 md:p-6">
              <WidgetEditor
                widgets={widgets}
                onWidgetsChange={setWidgets}
                siteId={formData.site_id}
                articleId={articleId}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Publishing */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 className="font-semibold text-white mb-3">Publishing</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Site *</label>
                  <select
                    value={formData.site_id}
                    onChange={(e) => handleInputChange('site_id', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {sites.map(site => (
                      <option key={site.id} value={site.id}>{site.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">URL Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="article-url-slug"
                  />
                  {selectedSite && (
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      /{selectedSite.subdomain}/articles/{formData.slug}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Category</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Health"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Read Time</label>
                    <input
                      type="number"
                      value={formData.read_time}
                      onChange={(e) => handleInputChange('read_time', parseInt(e.target.value))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      min="1"
                      max="60"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Visibility Flags */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 className="font-semibold text-white mb-3">Visibility</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => handleInputChange('featured', e.target.checked)}
                    className="w-4 h-4 text-primary-600 bg-gray-700 border-gray-600 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-white">Featured</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hero}
                    onChange={(e) => handleInputChange('hero', e.target.checked)}
                    className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-white">Hero Article</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.trending}
                    onChange={(e) => handleInputChange('trending', e.target.checked)}
                    className="w-4 h-4 text-primary-600 bg-gray-700 border-gray-600 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-white">Trending</span>
                </label>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 className="font-semibold text-white mb-3">Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Views</span>
                  <span className="text-white">{article.views.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Widgets</span>
                  <span className="text-white">{widgets.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status</span>
                  <span className={formData.published ? 'text-green-400' : 'text-gray-400'}>
                    {formData.published ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>
            </div>

            {/* CTA Link Tracking - Collapsible */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              <button
                onClick={() => setSettingsExpanded(!settingsExpanded)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-primary-400" />
                  <span className="font-semibold text-white text-sm">CTA Tracking</span>
                </div>
                {settingsExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>

              {settingsExpanded && (
                <div className="p-4 border-t border-gray-700 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">utm_source</label>
                    <input
                      type="text"
                      value={trackingConfig.utm_source || ''}
                      onChange={(e) => setTrackingConfig(prev => ({ ...prev, utm_source: e.target.value }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      placeholder="facebook, google"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">utm_medium</label>
                    <input
                      type="text"
                      value={trackingConfig.utm_medium || ''}
                      onChange={(e) => setTrackingConfig(prev => ({ ...prev, utm_medium: e.target.value }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      placeholder="cpc, social"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">utm_campaign</label>
                    <input
                      type="text"
                      value={trackingConfig.utm_campaign || ''}
                      onChange={(e) => setTrackingConfig(prev => ({ ...prev, utm_campaign: e.target.value }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      placeholder="hormone-article"
                    />
                  </div>
                  <label className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      checked={trackingConfig.passthrough_fbclid !== false}
                      onChange={(e) => setTrackingConfig(prev => ({ ...prev, passthrough_fbclid: e.target.checked }))}
                      className="w-4 h-4 text-primary-600 bg-gray-700 border-gray-600 rounded focus:ring-primary-500"
                    />
                    <span className="text-white text-sm">Pass through fbclid</span>
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Media Library Modal */}
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
    </div>
  );
}
