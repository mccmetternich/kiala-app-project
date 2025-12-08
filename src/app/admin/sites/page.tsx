'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Globe,
  Edit3,
  ExternalLink,
  Eye,
  FileText,
  ChevronDown,
  X,
  Check,
  Clock,
  Users,
  Building2,
  Layers,
  Zap
} from 'lucide-react';
import EnhancedAdminLayout from '@/components/admin/EnhancedAdminLayout';
import { formatDistanceToNow } from 'date-fns';

export default function SitesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sites, setSites] = useState<any[]>([]);
  const [sitesMetrics, setSitesMetrics] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSites() {
      try {
        // Use bulk endpoint to get sites with metrics in a single request
        const response = await fetch('/api/sites/bulk?includeMetrics=true');
        if (!response.ok) throw new Error('Failed to fetch sites');
        const data = await response.json();
        const sitesData = data.sites || [];

        setSites(sitesData);

        // Build metrics map from the response (already included)
        const metricsMap = sitesData.reduce((acc: any, site: any) => {
          if (site.metrics) {
            acc[site.id] = site.metrics;
          }
          return acc;
        }, {});

        setSitesMetrics(metricsMap);
      } catch (error) {
        console.error('Error loading sites:', error);
      } finally {
        setLoading(false);
      }
    }

    loadSites();
  }, []);

  const filteredSites = sites.filter(site => {
    const brand = typeof site.brand_profile === 'string' ? JSON.parse(site.brand_profile) : site.brand_profile;
    const matchesSearch = site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         site.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (brand?.name || '').toLowerCase().includes(searchQuery.toLowerCase());

    const status = site.status === 'published' ? 'live' : 'draft';
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate global stats
  const stats = {
    total: sites.length,
    live: sites.filter(s => s.status === 'published').length,
    drafts: sites.filter(s => s.status !== 'published').length,
    totalArticles: Object.values(sitesMetrics).reduce((sum: number, m: any) => sum + (m?.totalArticles || 0), 0),
    totalEmails: Object.values(sitesMetrics).reduce((sum: number, m: any) => sum + (m?.totalEmails || 0), 0),
  };

  return (
    <EnhancedAdminLayout>
      <div className="min-h-screen bg-gray-900">
        {/* Header */}
        <div className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white">All Sites</h1>
                <p className="text-gray-400 mt-1">Manage your direct response sites and domains</p>
              </div>
              <Link
                href="/admin/sites/new"
                className="flex items-center justify-center gap-2 px-5 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-primary-600/20"
              >
                <Plus className="w-5 h-5" />
                New Site
              </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
              <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                    <p className="text-xs text-gray-400">Total Sites</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.live}</p>
                    <p className="text-xs text-gray-400">Live</p>
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
                    <FileText className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.totalArticles}</p>
                    <p className="text-xs text-gray-400">Total Articles</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.totalEmails}</p>
                    <p className="text-xs text-gray-400">Total Emails</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto p-6">
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search sites..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-700 rounded"
                  >
                    <X className="w-3 h-3 text-gray-400" />
                  </button>
                )}
              </div>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none px-4 py-2 pr-8 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="live">Live</option>
                  <option value="draft">Draft</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Sites Grid */}
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-700 rounded w-2/3 mb-4"></div>
                    <div className="space-y-2 mb-4">
                      <div className="h-4 bg-gray-700 rounded w-full"></div>
                      <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                    </div>
                    <div className="flex gap-2 mb-4">
                      <div className="bg-gray-700 rounded-lg px-3 py-1.5 h-7 w-20"></div>
                      <div className="bg-gray-700 rounded-lg px-3 py-1.5 h-7 w-16"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredSites.length === 0 && !searchQuery && statusFilter === 'all' ? (
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-12 text-center">
              <Globe className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No sites yet</h3>
              <p className="text-gray-400 mb-6">Create your first site to get started</p>
              <Link
                href="/admin/sites/new"
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Site
              </Link>
            </div>
          ) : filteredSites.length === 0 ? (
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-12 text-center">
              <Globe className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No sites found</h3>
              <p className="text-gray-400 mb-6">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredSites.map((site) => {
                const brand = typeof site.brand_profile === 'string' ? JSON.parse(site.brand_profile) : site.brand_profile;
                const isLive = site.status === 'published';
                const metrics = sitesMetrics[site.id] || { totalArticles: 0, boostedCount: 0, totalViews: 0, totalPages: 0, totalEmails: 0 };

                return (
                  <div
                    key={site.id}
                    className="bg-gray-800 rounded-xl border border-gray-700 hover:border-primary-500/50 hover:shadow-lg hover:shadow-primary-500/10 transition-all duration-200 overflow-hidden group"
                  >
                    {/* Site Header - Clickable */}
                    <Link
                      href={`/admin/sites/${site.id}/dashboard`}
                      className="block p-5 border-b border-gray-700 group-hover:bg-gray-750 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {brand?.profileImage || brand?.sidebarImage ? (
                            <img
                              src={brand.profileImage || brand.sidebarImage}
                              alt={brand?.name || site.name}
                              className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-700 group-hover:ring-primary-500/50 transition-all"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center ring-2 ring-gray-700 group-hover:ring-primary-500/50 transition-all">
                              <Globe className="w-5 h-5 text-white" />
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold text-white group-hover:text-primary-400 transition-colors">{site.name}</h3>
                            <p className="text-xs text-gray-400">{site.subdomain}</p>
                          </div>
                        </div>
                        {isLive ? (
                          <span className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 text-green-400 rounded-full text-xs font-medium">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                            Live
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-400 rounded-full text-xs font-medium">
                            Draft
                          </span>
                        )}
                      </div>

                      {brand?.name && (
                        <p className="text-sm text-gray-300 mb-1">{brand.name}</p>
                      )}
                      {brand?.tagline && (
                        <p className="text-xs text-gray-500 truncate">{brand.tagline}</p>
                      )}
                    </Link>

                    {/* Metrics - Pages, Boosted, Articles, Emails, Real Views - All Clickable */}
                    <div className="px-5 py-3 bg-gray-850 border-b border-gray-700">
                      <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-sm">
                        <Link
                          href={`/admin/sites/${site.id}/dashboard?tab=pages`}
                          className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors group/metric"
                        >
                          <Layers className="w-4 h-4 text-indigo-400" />
                          <span className="text-gray-300 group-hover/metric:text-indigo-300">{metrics.totalPages || 0}</span>
                          <span className="text-gray-500 group-hover/metric:text-indigo-400">pages</span>
                        </Link>
                        <Link
                          href={`/admin/sites/${site.id}/dashboard?tab=articles`}
                          className="flex items-center gap-1.5 hover:text-yellow-400 transition-colors group/metric"
                        >
                          <Zap className="w-4 h-4 text-yellow-400" />
                          <span className="text-gray-300 group-hover/metric:text-yellow-300">{metrics.boostedCount || 0}</span>
                          <span className="text-gray-500 group-hover/metric:text-yellow-400">boosted</span>
                        </Link>
                        <Link
                          href={`/admin/sites/${site.id}/dashboard?tab=articles&subtab=all`}
                          className="flex items-center gap-1.5 hover:text-blue-400 transition-colors group/metric"
                        >
                          <FileText className="w-4 h-4 text-blue-400" />
                          <span className="text-gray-300 group-hover/metric:text-blue-300">{metrics.totalArticles || 0}</span>
                          <span className="text-gray-500 group-hover/metric:text-blue-400">articles</span>
                        </Link>
                        <Link
                          href={`/admin/sites/${site.id}/dashboard?tab=emails`}
                          className="flex items-center gap-1.5 hover:text-green-400 transition-colors group/metric"
                        >
                          <Users className="w-4 h-4 text-green-400" />
                          <span className="text-gray-300 group-hover/metric:text-green-300">{metrics.totalEmails || 0}</span>
                          <span className="text-gray-500 group-hover/metric:text-green-400">emails</span>
                        </Link>
                        <Link
                          href={`/admin/sites/${site.id}/dashboard?tab=analytics`}
                          className="flex items-center gap-1.5 hover:text-purple-400 transition-colors group/metric"
                        >
                          <Eye className="w-4 h-4 text-purple-400" />
                          <span className="text-gray-300 group-hover/metric:text-purple-300">{metrics.totalViews || 0}</span>
                          <span className="text-gray-500 group-hover/metric:text-purple-400">views</span>
                        </Link>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/sites/${site.id}/dashboard`}
                          className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded-lg text-center text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <FileText className="w-4 h-4" />
                          Manage Site
                        </Link>
                        <a
                          href={`/site/${site.subdomain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
                          title="View site"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                      <p className="text-xs text-gray-500 mt-3 text-center">
                        Updated {formatDistanceToNow(new Date(site.updated_at?.endsWith('Z') ? site.updated_at : site.updated_at + 'Z'), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Add New Site Card */}
              <Link
                href="/admin/sites/new"
                className="bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-700 hover:border-primary-500 hover:bg-gray-800 transition-colors p-8 flex flex-col items-center justify-center text-center min-h-[280px]"
              >
                <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <Plus className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-300 mb-1">Create New Site</h3>
                <p className="text-sm text-gray-500">Launch another DR site</p>
              </Link>
            </div>
          )}

          {/* Results Count */}
          {!loading && filteredSites.length > 0 && (
            <div className="mt-4 text-center text-sm text-gray-500">
              Showing {filteredSites.length} of {sites.length} site{sites.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
    </EnhancedAdminLayout>
  );
}