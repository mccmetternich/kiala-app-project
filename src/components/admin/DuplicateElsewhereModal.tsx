'use client';

import { useState, useEffect } from 'react';
import { X, FileText, Layers, Plus, Check, ExternalLink } from 'lucide-react';
import { Widget } from '@/types';

interface Site {
  id: string;
  name: string;
  subdomain: string;
}

interface Article {
  id: string;
  title: string;
  site_id: string;
  siteName?: string;
}

interface Page {
  id: string;
  title: string;
  site_id: string;
  siteName?: string;
  slug: string;
}

interface DuplicateElsewhereModalProps {
  widget: Widget;
  currentSiteId: string;
  currentArticleId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

type DestinationType = 'article' | 'page' | 'new-article' | 'new-page' | null;

export default function DuplicateElsewhereModal({
  widget,
  currentSiteId,
  currentArticleId,
  onClose,
  onSuccess,
}: DuplicateElsewhereModalProps) {
  const [sites, setSites] = useState<Site[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Selection state
  const [destinationType, setDestinationType] = useState<DestinationType>(null);
  const [selectedArticleId, setSelectedArticleId] = useState<string>('');
  const [selectedPageId, setSelectedPageId] = useState<string>('');

  // New article/page creation state
  const [newSiteId, setNewSiteId] = useState<string>(currentSiteId);
  const [newTitle, setNewTitle] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load sites, articles, and pages in parallel
      const [sitesRes, articlesRes, pagesRes] = await Promise.all([
        fetch('/api/sites').then(res => res.json()),
        fetch('/api/articles?includeAll=true').then(res => res.json()),
        fetch('/api/pages?includeAll=true').then(res => res.json()),
      ]);

      const sitesList = sitesRes.sites || sitesRes || [];
      setSites(sitesList);

      // Map articles with site names
      const articlesList = (articlesRes.articles || articlesRes || []).map((article: any) => ({
        ...article,
        siteName: sitesList.find((s: Site) => s.id === article.site_id)?.name || 'Unknown Site',
      }));
      setArticles(articlesList);

      // Map pages with site names
      const pagesList = (pagesRes.pages || pagesRes || []).map((page: any) => ({
        ...page,
        siteName: sitesList.find((s: Site) => s.id === page.site_id)?.name || 'Unknown Site',
      }));
      setPages(pagesList);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async () => {
    if (!destinationType) return;

    setSaving(true);
    try {
      let targetId: string | null = null;
      let targetType: 'article' | 'page' = 'article';

      // Handle new article/page creation
      if (destinationType === 'new-article') {
        if (!newSiteId || !newTitle.trim()) {
          alert('Please select a site and enter a title');
          setSaving(false);
          return;
        }

        // Create new article
        const createRes = await fetch('/api/articles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            site_id: newSiteId,
            title: newTitle,
            slug: newTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
            published: false,
            widget_config: JSON.stringify([]),
          }),
        });

        if (!createRes.ok) throw new Error('Failed to create article');
        const createData = await createRes.json();
        targetId = createData.article?.id || createData.id;
        targetType = 'article';

        // Refresh articles list
        await loadData();
      } else if (destinationType === 'new-page') {
        if (!newSiteId || !newTitle.trim()) {
          alert('Please select a site and enter a title');
          setSaving(false);
          return;
        }

        // Create new page
        const createRes = await fetch('/api/pages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            siteId: newSiteId,
            title: newTitle,
            slug: newTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
            template: 'default',
            widget_config: JSON.stringify([]),
            published: false,
          }),
        });

        if (!createRes.ok) throw new Error('Failed to create page');
        const createData = await createRes.json();
        targetId = createData.page?.id || createData.id;
        targetType = 'page';

        // Refresh pages list
        await loadData();
      } else if (destinationType === 'article') {
        targetId = selectedArticleId;
        targetType = 'article';
      } else if (destinationType === 'page') {
        targetId = selectedPageId;
        targetType = 'page';
      }

      if (!targetId) {
        alert('Please select a destination');
        setSaving(false);
        return;
      }

      // Add widget to target
      const duplicatedWidget: Widget = {
        ...widget,
        id: `widget-${Date.now()}`,
        position: 9999, // Will be adjusted when saving
      };

      if (targetType === 'article') {
        // Get current article widgets
        const articleRes = await fetch(`/api/articles/${targetId}`);
        const articleData = await articleRes.json();
        const article = articleData.article || articleData;

        let existingWidgets: Widget[] = [];
        if (article.widget_config) {
          try {
            existingWidgets = typeof article.widget_config === 'string'
              ? JSON.parse(article.widget_config)
              : article.widget_config;
          } catch { existingWidgets = []; }
        }

        // Add widget to end
        duplicatedWidget.position = existingWidgets.length;
        const updatedWidgets = [...existingWidgets, duplicatedWidget];

        // Save updated article
        await fetch(`/api/articles/${targetId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...article,
            widget_config: JSON.stringify(updatedWidgets),
          }),
        });
      } else {
        // Get current page widgets
        const pageRes = await fetch(`/api/pages/${targetId}`);
        const pageData = await pageRes.json();
        const page = pageData.page || pageData;

        let existingWidgets: Widget[] = [];
        if (page.widget_config) {
          try {
            existingWidgets = typeof page.widget_config === 'string'
              ? JSON.parse(page.widget_config)
              : page.widget_config;
          } catch { existingWidgets = []; }
        }

        // Add widget to end
        duplicatedWidget.position = existingWidgets.length;
        const updatedWidgets = [...existingWidgets, duplicatedWidget];

        // Save updated page
        await fetch(`/api/pages/${targetId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...page,
            widget_config: JSON.stringify(updatedWidgets),
          }),
        });
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error duplicating widget:', error);
      alert('Failed to duplicate widget');
    } finally {
      setSaving(false);
    }
  };

  // Filter out current article from the list
  const filteredArticles = articles.filter(a => a.id !== currentArticleId);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto" />
          <p className="text-gray-600 mt-4">Loading destinations...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 shadow-2xl text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Widget Duplicated!</h3>
          <p className="text-gray-600 mt-2">The widget has been added to the destination.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-purple-500 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <ExternalLink className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Duplicate Elsewhere</h3>
                <p className="text-sm text-white/80">Choose where to copy this widget</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Destination Type Selection */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setDestinationType('article')}
              className={`p-4 rounded-xl border-2 transition-all ${
                destinationType === 'article'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <FileText className={`w-6 h-6 mx-auto mb-2 ${
                destinationType === 'article' ? 'text-primary-600' : 'text-gray-400'
              }`} />
              <p className={`text-sm font-medium ${
                destinationType === 'article' ? 'text-primary-900' : 'text-gray-700'
              }`}>Existing Article</p>
            </button>
            <button
              onClick={() => setDestinationType('page')}
              className={`p-4 rounded-xl border-2 transition-all ${
                destinationType === 'page'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Layers className={`w-6 h-6 mx-auto mb-2 ${
                destinationType === 'page' ? 'text-primary-600' : 'text-gray-400'
              }`} />
              <p className={`text-sm font-medium ${
                destinationType === 'page' ? 'text-primary-900' : 'text-gray-700'
              }`}>Existing Page</p>
            </button>
            <button
              onClick={() => setDestinationType('new-article')}
              className={`p-4 rounded-xl border-2 transition-all ${
                destinationType === 'new-article'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-center gap-1 mb-2">
                <Plus className={`w-5 h-5 ${
                  destinationType === 'new-article' ? 'text-green-600' : 'text-gray-400'
                }`} />
                <FileText className={`w-5 h-5 ${
                  destinationType === 'new-article' ? 'text-green-600' : 'text-gray-400'
                }`} />
              </div>
              <p className={`text-sm font-medium ${
                destinationType === 'new-article' ? 'text-green-900' : 'text-gray-700'
              }`}>New Article</p>
            </button>
            <button
              onClick={() => setDestinationType('new-page')}
              className={`p-4 rounded-xl border-2 transition-all ${
                destinationType === 'new-page'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-center gap-1 mb-2">
                <Plus className={`w-5 h-5 ${
                  destinationType === 'new-page' ? 'text-green-600' : 'text-gray-400'
                }`} />
                <Layers className={`w-5 h-5 ${
                  destinationType === 'new-page' ? 'text-green-600' : 'text-gray-400'
                }`} />
              </div>
              <p className={`text-sm font-medium ${
                destinationType === 'new-page' ? 'text-green-900' : 'text-gray-700'
              }`}>New Page</p>
            </button>
          </div>

          {/* Article Selection */}
          {destinationType === 'article' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Article
              </label>
              <select
                value={selectedArticleId}
                onChange={(e) => setSelectedArticleId(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Choose an article...</option>
                {filteredArticles.map((article) => (
                  <option key={article.id} value={article.id}>
                    {article.siteName} - {article.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Page Selection */}
          {destinationType === 'page' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Page
              </label>
              <select
                value={selectedPageId}
                onChange={(e) => setSelectedPageId(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Choose a page...</option>
                {pages.map((page) => (
                  <option key={page.id} value={page.id}>
                    {page.siteName} - {page.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* New Article/Page Creation */}
          {(destinationType === 'new-article' || destinationType === 'new-page') && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Site
                </label>
                <select
                  value={newSiteId}
                  onChange={(e) => setNewSiteId(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {sites.map((site) => (
                    <option key={site.id} value={site.id}>
                      {site.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {destinationType === 'new-article' ? 'Article Title' : 'Page Title'}
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={`Enter ${destinationType === 'new-article' ? 'article' : 'page'} title...`}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDuplicate}
            disabled={saving || !destinationType || (destinationType === 'article' && !selectedArticleId) || (destinationType === 'page' && !selectedPageId) || ((destinationType === 'new-article' || destinationType === 'new-page') && !newTitle.trim())}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Duplicating...
              </>
            ) : (
              <>
                <ExternalLink className="w-4 h-4" />
                Duplicate Widget
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
