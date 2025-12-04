'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Eye,
  Search,
  Copy,
  ExternalLink,
  FileText,
  Check,
  Clock,
  ChevronDown,
  Zap,
  Edit3,
  X
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import EnhancedAdminLayout from '@/components/admin/EnhancedAdminLayout';
import { formatDistanceToNow } from 'date-fns';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  featured: boolean;
  trending: boolean;
  hero: boolean;
  boosted: boolean;
  published: boolean;
  views: number;        // Vanity/display views (fake)
  realViews?: number;   // Real views from tracking
  read_time: number;
  slug: string;
  created_at: string;
  updated_at: string;
  site_id: string;
}

type ArticlesTab = 'boosted' | 'all' | 'drafts';

interface Site {
  id: string;
  name: string;
  domain: string;
  subdomain: string;
}

export default function ArticlesAdmin() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<ArticlesTab>('boosted');
  const [loading, setLoading] = useState(true);
  const [duplicating, setDuplicating] = useState<string | null>(null);

  useEffect(() => {
    fetchSites();
    fetchAllArticles();
  }, []);

  useEffect(() => {
    filterArticles();
  }, [selectedSite, activeTab, allArticles]);

  const fetchSites = async () => {
    try {
      const response = await fetch('/api/sites');
      const data = await response.json();
      setSites(data.sites || []);
    } catch (error) {
      console.error('Error fetching sites:', error);
    }
  };

  const fetchAllArticles = async () => {
    try {
      setLoading(true);
      // Fetch all articles across all sites with real view counts
      const response = await fetch('/api/articles?all=true&includeRealViews=true');
      const data = await response.json();
      setAllArticles(data.articles || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterArticles = () => {
    let filtered = [...allArticles];

    // Filter by site
    if (selectedSite !== 'all') {
      filtered = filtered.filter(a => a.site_id === selectedSite);
    }

    // Filter by tab
    if (activeTab === 'boosted') {
      filtered = filtered.filter(a => a.boosted);
    } else if (activeTab === 'drafts') {
      filtered = filtered.filter(a => !a.published);
    }

    setArticles(filtered);
  };

  const deleteArticle = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    try {
      await fetch(`/api/articles/${id}`, { method: 'DELETE' });
      setAllArticles(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error('Error deleting article:', error);
    }
  };

  const duplicateArticle = async (article: Article) => {
    if (!confirm(`Create a copy of "${article.title}"?`)) return;

    setDuplicating(article.id);

    try {
      const response = await fetch(`/api/articles/${article.id}`);
      const { article: fullArticle } = await response.json();

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
        published: false,
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

  // Calculate stats - using real views for admin
  const stats = {
    total: allArticles.length,
    published: allArticles.filter(a => a.published).length,
    drafts: allArticles.filter(a => !a.published).length,
    boosted: allArticles.filter(a => a.boosted).length,
    totalRealViews: allArticles.reduce((sum, a) => sum + (a.realViews || 0), 0),
  };

  const getSiteName = (siteId: string) => {
    const site = sites.find(s => s.id === siteId);
    return site?.name || 'Unknown';
  };

  const getSiteSubdomain = (siteId: string) => {
    const site = sites.find(s => s.id === siteId);
    return site?.subdomain || '';
  };

  return (
    <EnhancedAdminLayout>
      <div className="min-h-screen bg-gray-900">
        {/* Header */}
        <div className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white">All Articles</h1>
                <p className="text-gray-400 mt-1">Manage content across all your sites</p>
              </div>
              <Link
                href="/admin/articles/new"
                className="flex items-center justify-center gap-2 px-5 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-primary-600/20"
              >
                <Plus className="w-5 h-5" />
                New Article
              </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
              <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.boosted}</p>
                    <p className="text-xs text-gray-400">Boosted</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                    <p className="text-xs text-gray-400">Total</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.published}</p>
                    <p className="text-xs text-gray-400">Published</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-500/10 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.drafts}</p>
                    <p className="text-xs text-gray-400">Drafts</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                    <Eye className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.totalRealViews.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">Real Views</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto p-6">
          {/* Tabs and Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            {/* Tabs */}
            <div className="flex border-b border-gray-700">
              {[
                { id: 'boosted' as ArticlesTab, label: 'Boosted', count: stats.boosted, icon: Zap, color: 'yellow' },
                { id: 'all' as ArticlesTab, label: 'All Articles', count: stats.total, icon: FileText, color: 'blue' },
                { id: 'drafts' as ArticlesTab, label: 'Drafts', count: stats.drafts, icon: Clock, color: 'gray' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-white'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id
                      ? tab.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-primary-500/20 text-primary-400'
                      : 'bg-gray-700 text-gray-400'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search & Site Filter */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-48 pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-700 rounded"
                  >
                    <X className="w-3 h-3 text-gray-400" />
                  </button>
                )}
              </div>
              <div className="relative">
                <select
                  value={selectedSite}
                  onChange={(e) => setSelectedSite(e.target.value)}
                  className="appearance-none px-4 py-2 pr-8 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                >
                  <option value="all">All Sites</option>
                  {sites.map(site => (
                    <option key={site.id} value={site.id}>{site.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Articles List */}
          <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="w-10 h-10 border-3 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400">Loading articles...</p>
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No articles found</h3>
                <p className="text-gray-400 mb-6">
                  {searchTerm ? 'Try adjusting your search or filters' : 'Create your first article to get started'}
                </p>
                <Link
                  href="/admin/articles/new"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Create Article
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-700/50">
                {filteredArticles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/admin/articles/${article.id}/edit`}
                    className="flex items-center justify-between p-4 hover:bg-gray-750 transition-all group"
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      {/* Status Icon */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        article.published ? 'bg-green-500/10' : 'bg-gray-700'
                      }`}>
                        <FileText className={`w-5 h-5 ${article.published ? 'text-green-400' : 'text-gray-500'}`} />
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="text-white font-medium truncate group-hover:text-primary-400 transition-colors">
                            {article.title}
                          </p>
                          {article.boosted && (
                            <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-400 rounded-full text-xs font-medium flex-shrink-0 flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              Boosted
                            </span>
                          )}
                          {!article.published && (
                            <span className="px-2 py-0.5 bg-gray-700 text-gray-400 rounded-full text-xs font-medium flex-shrink-0">
                              Draft
                            </span>
                          )}
                          {article.hero && (
                            <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded-full text-xs font-medium flex-shrink-0">
                              Hero
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span className="px-2 py-0.5 bg-gray-700/50 rounded text-gray-400 text-xs">
                            {getSiteName(article.site_id)}
                          </span>
                          <span>{article.category || 'Uncategorized'}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {(article.realViews ?? 0).toLocaleString()} real
                          </span>
                          <span>•</span>
                          <span>{formatDistanceToNow(new Date(article.updated_at), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0 ml-4">
                      {article.published && (
                        <span
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            window.open(`/site/${getSiteSubdomain(article.site_id)}/articles/${article.slug}`, '_blank');
                          }}
                          className="p-2 text-gray-500 hover:text-primary-400 hover:bg-gray-700 rounded-lg transition-all cursor-pointer"
                          title="View article"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </span>
                      )}
                      <span
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          duplicateArticle(article);
                        }}
                        className={`p-2 text-gray-500 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-all cursor-pointer ${duplicating === article.id ? 'opacity-50' : ''}`}
                        title="Duplicate article"
                      >
                        {duplicating === article.id ? (
                          <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </span>
                      <span
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          deleteArticle(article.id);
                        }}
                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-all cursor-pointer"
                        title="Delete article"
                      >
                        <Trash2 className="w-4 h-4" />
                      </span>
                      <Edit3 className="w-4 h-4 text-gray-600 group-hover:text-primary-400 transition-colors ml-2" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Results Count */}
          {!loading && filteredArticles.length > 0 && (
            <div className="mt-4 text-center text-sm text-gray-500">
              Showing {filteredArticles.length} of {allArticles.length} article{allArticles.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
    </EnhancedAdminLayout>
  );
}
