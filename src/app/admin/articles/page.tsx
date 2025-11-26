'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Search, Filter } from 'lucide-react';
import Link from 'next/link';
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
  const [articles, setArticles] = useState<Article[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPublished, setFilterPublished] = useState<string>('all');
  const [loading, setLoading] = useState(true);

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

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedSiteData = sites.find(site => site.id === selectedSite);

  return (
    <EnhancedAdminLayout>
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Articles</h1>
            <p className="text-gray-400">Manage content for your sites</p>
          </div>
          <Link 
            href="/admin/articles/new"
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Article
          </Link>
        </div>

        {/* Site Selector and Filters */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Site
              </label>
              <select 
                value={selectedSite}
                onChange={(e) => setSelectedSite(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {sites.map(site => (
                  <option key={site.id} value={site.id}>
                    {site.name} ({site.subdomain})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Search className="w-4 h-4 inline mr-1" />
                Search
              </label>
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Filter className="w-4 h-4 inline mr-1" />
                Status
              </label>
              <select 
                value={filterPublished}
                onChange={(e) => setFilterPublished(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Articles</option>
                <option value="true">Published</option>
                <option value="false">Drafts</option>
              </select>
            </div>

            <div className="flex items-end">
              {selectedSiteData && (
                <a 
                  href={`/${selectedSiteData.subdomain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Eye className="w-4 h-4" />
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
              <p className="text-gray-400">No articles found.</p>
              <Link 
                href="/admin/articles/new"
                className="text-primary-400 hover:text-primary-300 underline mt-2 inline-block"
              >
                Create your first article
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Views
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Read Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Updated
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {filteredArticles.map((article) => (
                    <tr
                      key={article.id}
                      className="hover:bg-gray-750 cursor-pointer transition-colors"
                      onClick={() => window.location.href = `/admin/articles/${article.id}/edit`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-white">
                              {article.title}
                            </div>
                            <div className="text-sm text-gray-400 max-w-md truncate">
                              {article.excerpt}
                            </div>
                            <div className="flex gap-2 mt-1">
                              {article.hero && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                  Hero
                                </span>
                              )}
                              {article.featured && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                  Featured
                                </span>
                              )}
                              {article.trending && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                  Trending
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {article.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          article.published
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {article.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {article.views.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {article.read_time} min
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(article.updated_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/articles/${article.id}/edit`}
                            className="text-primary-400 hover:text-primary-300 p-2 hover:bg-gray-700 rounded"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteArticle(article.id);
                            }}
                            className="text-red-400 hover:text-red-300 p-2 hover:bg-gray-700 rounded"
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
          )}
        </div>
      </div>
    </EnhancedAdminLayout>
  );
}