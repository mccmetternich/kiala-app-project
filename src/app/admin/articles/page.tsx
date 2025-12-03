'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Search, Filter, Copy, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import EnhancedAdminLayout from '@/components/admin/EnhancedAdminLayout';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  featured: boolean;
  trending: boolean;
  hero: boolean;
  published: boolean;
  views: number;
  read_time: number;
  slug: string;
  created_at: string;
  updated_at: string;
  site_id: string;
}

interface Site {
  id: string;
  name: string;
  domain: string;
  subdomain: string;
}

export default function ArticlesAdmin() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPublished, setFilterPublished] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [duplicating, setDuplicating] = useState<string | null>(null);

  useEffect(() => {
    fetchSites();
  }, []);

  useEffect(() => {
    if (selectedSite) {
      fetchArticles();
    }
  }, [selectedSite, filterPublished]);

  const fetchSites = async () => {
    try {
      const response = await fetch('/api/sites');
      const data = await response.json();
      setSites(data.sites || []);
      if (data.sites?.length > 0) {
        setSelectedSite(data.sites[0].id);
      }
    } catch (error) {
      console.error('Error fetching sites:', error);
    }
  };

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const publishedParam = filterPublished !== 'all' ? `&published=${filterPublished}` : '';
      const response = await fetch(`/api/articles?siteId=${selectedSite}${publishedParam}`);
      const data = await response.json();
      setArticles(data.articles || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteArticle = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    try {
      await fetch(`/api/articles/${id}`, { method: 'DELETE' });
      fetchArticles();
    } catch (error) {
      console.error('Error deleting article:', error);
    }
  };

  const duplicateArticle = async (article: Article) => {
    if (!confirm(`Create a copy of "${article.title}"?`)) return;

    setDuplicating(article.id);

    try {
      // Get the full article data
      const response = await fetch(`/api/articles/${article.id}`);
      const { article: fullArticle } = await response.json();

      // Create duplicate with modified title and slug
      const newSlug = `${fullArticle.slug}-copy-${Date.now()}`;
      const duplicateData = {
        site_id: fullArticle.site_id,
        title: `${fullArticle.title} (Copy)`,
        excerpt: fullArticle.excerpt,
        content: fullArticle.content,
        slug: newSlug,
        category: fullArticle.category,
        image: fullArticle.image,
        featured: false,
        trending: false,
        hero: false,
        published: false, // Always start as draft
        read_time: fullArticle.read_time,
        widget_config: fullArticle.widget_config
      };

      const createResponse = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duplicateData)
      });

      if (createResponse.ok) {
        const { article: newArticle } = await createResponse.json();
        // Navigate to edit the new article
        router.push(`/admin/articles/${newArticle.id}/edit`);
      } else {
        alert('Failed to duplicate article');
      }
    } catch (error) {
      console.error('Error duplicating article:', error);
      alert('Failed to duplicate article');
    } finally {
      setDuplicating(null);
    }
  };

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedSiteData = sites.find(site => site.id === selectedSite);

  // Format relative time
  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr.endsWith('Z') ? dateStr : dateStr + 'Z');
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <EnhancedAdminLayout>
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Articles</h1>
            <p className="text-gray-400 text-sm">Manage content for your sites</p>
          </div>
          <Link
            href="/admin/articles/new"
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm md:text-base"
          >
            <Plus className="w-4 h-4 md:w-5 md:h-5" />
            New Article
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg p-4 md:p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Site Selector */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
                Site
              </label>
              <select
                value={selectedSite}
                onChange={(e) => setSelectedSite(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {sites.map(site => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-9 pr-3 py-2 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
                Status
              </label>
              <select
                value={filterPublished}
                onChange={(e) => setFilterPublished(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All</option>
                <option value="true">Published</option>
                <option value="false">Drafts</option>
              </select>
            </div>

            {/* View Site Button */}
            <div className="flex items-end">
              {selectedSiteData && (
                <a
                  href={`/site/${selectedSiteData.subdomain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Site
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Articles List */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
              <p className="text-gray-400 mt-2">Loading articles...</p>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-400 mb-2">No articles found.</p>
              <Link
                href="/admin/articles/new"
                className="text-primary-400 hover:text-primary-300 underline"
              >
                Create your first article
              </Link>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-900">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Article
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Views
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Updated
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {filteredArticles.map((article) => (
                      <tr
                        key={article.id}
                        className="hover:bg-gray-750 cursor-pointer transition-colors"
                        onClick={() => router.push(`/admin/articles/${article.id}/edit`)}
                      >
                        <td className="px-4 py-4">
                          <div className="max-w-md">
                            <div className="text-sm font-medium text-white truncate">
                              {article.title}
                            </div>
                            <div className="text-xs text-gray-500 truncate mt-0.5">
                              {article.category || 'Uncategorized'}
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {article.hero && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-900/50 text-purple-300">
                                  Hero
                                </span>
                              )}
                              {article.featured && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-yellow-900/50 text-yellow-300">
                                  Featured
                                </span>
                              )}
                              {article.trending && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-900/50 text-red-300">
                                  Trending
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            article.published
                              ? 'bg-green-900/50 text-green-300'
                              : 'bg-gray-700 text-gray-400'
                          }`}>
                            {article.published ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400">
                          {article.views.toLocaleString()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400">
                          {formatRelativeTime(article.updated_at)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1">
                            {selectedSiteData && article.published && (
                              <a
                                href={`/site/${selectedSiteData.subdomain}/articles/${article.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-white p-2 hover:bg-gray-700 rounded transition-colors"
                                onClick={(e) => e.stopPropagation()}
                                title="View article"
                              >
                                <Eye className="w-4 h-4" />
                              </a>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                duplicateArticle(article);
                              }}
                              disabled={duplicating === article.id}
                              className="text-gray-400 hover:text-blue-400 p-2 hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
                              title="Duplicate article"
                            >
                              {duplicating === article.id ? (
                                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                            <Link
                              href={`/admin/articles/${article.id}/edit`}
                              className="text-gray-400 hover:text-primary-400 p-2 hover:bg-gray-700 rounded transition-colors"
                              onClick={(e) => e.stopPropagation()}
                              title="Edit article"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteArticle(article.id);
                              }}
                              className="text-gray-400 hover:text-red-400 p-2 hover:bg-gray-700 rounded transition-colors"
                              title="Delete article"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-gray-700">
                {filteredArticles.map((article) => (
                  <div
                    key={article.id}
                    className="p-4 hover:bg-gray-750 transition-colors"
                    onClick={() => router.push(`/admin/articles/${article.id}/edit`)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-white truncate">
                          {article.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {article.category || 'Uncategorized'} · {formatRelativeTime(article.updated_at)}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            article.published
                              ? 'bg-green-900/50 text-green-300'
                              : 'bg-gray-700 text-gray-400'
                          }`}>
                            {article.published ? 'Published' : 'Draft'}
                          </span>
                          {article.hero && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-900/50 text-purple-300">
                              Hero
                            </span>
                          )}
                          <span className="text-xs text-gray-500">
                            {article.views.toLocaleString()} views
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateArticle(article);
                          }}
                          disabled={duplicating === article.id}
                          className="text-gray-400 hover:text-blue-400 p-2 rounded transition-colors"
                        >
                          {duplicating === article.id ? (
                            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteArticle(article.id);
                          }}
                          className="text-gray-400 hover:text-red-400 p-2 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Article Count */}
        {!loading && filteredArticles.length > 0 && (
          <div className="mt-4 text-center text-sm text-gray-500">
            Showing {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </EnhancedAdminLayout>
  );
}
