'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  Search,
  Edit3,
  Eye,
  MoreVertical,
  Star,
  TrendingUp,
  Zap,
  Loader2
} from 'lucide-react';
import EnhancedAdminLayout from '@/components/admin/EnhancedAdminLayout';
import Badge from '@/components/ui/Badge';
import { clientAPI } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';

export default function SiteArticlesPage() {
  const { id } = useParams() as { id: string };
  const [site, setSite] = useState<any>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const togglePublished = async (articleId: string, currentPublished: boolean) => {
    setTogglingId(articleId);
    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !currentPublished })
      });

      if (response.ok) {
        setArticles(prev => prev.map(a =>
          a.id === articleId ? { ...a, published: !currentPublished } : a
        ));
      }
    } catch (error) {
      console.error('Error toggling publish status:', error);
    } finally {
      setTogglingId(null);
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        const [siteData, articlesResponse] = await Promise.all([
          fetch(`/api/sites/${id}`).then(res => res.json()),
          fetch(`/api/articles?siteId=${id}&published=false&includeRealViews=true`).then(res => res.json())
        ]);
        const articlesData = articlesResponse.articles || [];

        setSite(siteData.site);
        setArticles(articlesData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadData();
    }
  }, [id]);

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (article.excerpt || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const status = article.published ? 'published' : 'draft';
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <EnhancedAdminLayout>
        <div className="p-6 max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-gray-800 rounded-xl p-6">
                  <div className="h-6 bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
                  <div className="flex gap-4">
                    <div className="h-4 bg-gray-700 rounded w-20"></div>
                    <div className="h-4 bg-gray-700 rounded w-16"></div>
                    <div className="h-4 bg-gray-700 rounded w-24"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </EnhancedAdminLayout>
    );
  }

  const brand = typeof site?.brand_profile === 'string' ? JSON.parse(site.brand_profile) : site?.brand_profile;

  return (
    <EnhancedAdminLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin/sites"
              className="p-2 text-gray-400 hover:text-gray-200 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            
            <div>
              <h1 className="text-3xl font-bold text-gray-200">Articles</h1>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-gray-400">{site?.name} • {brand?.name || 'Unknown'}</p>
                <Badge variant={site?.published ? 'trust' : 'default'} size="sm">
                  {site?.published ? '🟢 Live' : '🟡 Draft'}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Link
              href={`/site/${id}`}
              target="_blank"
              className="btn-secondary flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              View Site
            </Link>
            
            <Link
              href={`/admin/articles/new?siteId=${id}`}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Article
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-600 bg-gray-700 text-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-600 bg-gray-700 text-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Articles</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {/* Articles List */}
        <div className="space-y-4">
          {filteredArticles.map((article) => (
            <div key={article.id} className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-semibold text-gray-200">{article.title}</h3>

                    <div className="flex items-center gap-2">
                      {article.boosted && (
                        <Badge variant="limited" size="sm">
                          <Zap className="w-3 h-3 mr-1" />
                          Boosted
                        </Badge>
                      )}
                      {article.hero && (
                        <Badge variant="clinical" size="sm">
                          ⭐ Hero
                        </Badge>
                      )}
                      {article.featured && (
                        <Badge variant="trust" size="sm">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                      {article.trending && (
                        <Badge variant="limited" size="sm">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Trending
                        </Badge>
                      )}
                    </div>
                  </div>

                  {article.excerpt && (
                    <p className="text-gray-400 mb-4 line-clamp-2">{article.excerpt}</p>
                  )}

                  <div className="flex items-center gap-6 text-sm text-gray-400">
                    <span className="capitalize">{article.category || 'Article'}</span>
                    <span>{article.read_time || 5} min read</span>
                    <span>{article.realViews || 0} views</span>
                    <span>
                      {article.published
                        ? `Published ${formatDistanceToNow(new Date(article.published_at || article.created_at), { addSuffix: true })}`
                        : `Created ${formatDistanceToNow(new Date(article.created_at), { addSuffix: true })}`
                      }
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 ml-6">
                  {/* Publish Toggle */}
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${article.published ? 'text-green-400' : 'text-gray-500'}`}>
                      {article.published ? 'Live' : 'Draft'}
                    </span>
                    <button
                      onClick={() => togglePublished(article.id, article.published)}
                      disabled={togglingId === article.id}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                        article.published ? 'bg-green-500' : 'bg-gray-600'
                      } ${togglingId === article.id ? 'opacity-50 cursor-wait' : ''}`}
                      title={article.published ? 'Click to unpublish' : 'Click to publish'}
                    >
                      {togglingId === article.id ? (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <Loader2 className="w-4 h-4 text-white animate-spin" />
                        </span>
                      ) : (
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            article.published ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      )}
                    </button>
                  </div>

                  <div className="w-px h-6 bg-gray-700" />

                  <Link
                    href={`/admin/articles/${article.id}/edit`}
                    className="p-2 text-gray-400 hover:text-primary-400 hover:bg-gray-700 rounded-lg transition-colors"
                    title="Edit article"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Link>

                  {article.published && (
                    <Link
                      href={`/site/${site?.subdomain || id}/articles/${article.slug}`}
                      target="_blank"
                      className="p-2 text-gray-400 hover:text-primary-400 hover:bg-gray-700 rounded-lg transition-colors"
                      title="View article"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  )}

                  <button className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded-lg transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredArticles.length === 0 && !loading && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-12 text-center">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Edit3 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-200 mb-2">
              {searchQuery || statusFilter !== 'all' ? 'No articles found' : 'No articles yet'}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Create your first article to start building content for this site'
              }
            </p>
            <Link 
              href={`/admin/articles/new?siteId=${id}`}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Article
            </Link>
          </div>
        )}
      </div>
    </EnhancedAdminLayout>
  );
}