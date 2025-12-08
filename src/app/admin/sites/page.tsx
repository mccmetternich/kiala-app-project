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
  BarChart3,
  Building2
} from 'lucide-react';
import EnhancedAdminLayout from '@/components/admin/EnhancedAdminLayout';
import PublishToggle from '@/components/admin/PublishToggle';
import { formatDate } from '@/lib/utils';

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
                <div key={i} className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
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
          ) : filteredSites.length === 0 ? (
            <div className="bg-gray-800 rounded-2xl border border-gray-700 p-12 text-center">
              <Globe className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {searchQuery || statusFilter !== 'all' ? 'No sites found' : 'No sites yet'}
              </h3>
              <p className="text-gray-400 mb-6">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Create your first direct response site to get started'
                }
              </p>
              <Link
                href="/admin/sites/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium transition-all"
              >
                <Plus className="w-4 h-4" />
                Create New Site
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredSites.map((site) => {
                const brand = typeof site.brand_profile === 'string' ? JSON.parse(site.brand_profile) : site.brand_profile;
                const status = site.status === 'published' ? 'live' : 'draft';
                const metrics = sitesMetrics[site.id];

                return (
                  <Link href={`/admin/sites/${site.id}/dashboard`} key={site.id}>
                    <div className="bg-gray-800 rounded-2xl border border-gray-700 hover:border-gray-600 hover:shadow-xl transition-all overflow-hidden group cursor-pointer h-full">
                      {/* Header */}
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {/* Brand Avatar */}
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-primary-500 to-purple-600 flex-shrink-0 flex items-center justify-center">
                              {brand?.logoImage || brand?.sidebarImage || brand?.profileImage ? (
                                <img
                                  src={brand?.logoImage || brand?.sidebarImage || brand?.profileImage}
                                  alt={brand?.name || 'Brand'}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Building2 className="w-6 h-6 text-white" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-bold text-white truncate group-hover:text-primary-400 transition-colors">
                                {site.name}
                              </h3>
                              <p className="text-sm text-gray-400 truncate">{site.subdomain}</p>
                            </div>
                          </div>
                          {/* Status Badge */}
                          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            status === 'live'
                              ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                              : 'bg-gray-700/50 text-gray-400 border border-gray-600'
                          }`}>
                            <span className={`w-2 h-2 rounded-full ${status === 'live' ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`}></span>
                            {status === 'live' ? 'Live' : 'Draft'}
                          </div>
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          <div className="bg-gray-700/30 rounded-lg p-3 text-center">
                            <p className="text-lg font-bold text-white">{metrics?.totalArticles || 0}</p>
                            <p className="text-xs text-gray-400">Articles</p>
                          </div>
                          <div className="bg-gray-700/30 rounded-lg p-3 text-center">
                            <p className="text-lg font-bold text-white">{metrics?.totalPages || 0}</p>
                            <p className="text-xs text-gray-400">Pages</p>
                          </div>
                          <div className="bg-gray-700/30 rounded-lg p-3 text-center">
                            <p className="text-lg font-bold text-white">{metrics?.totalEmails || 0}</p>
                            <p className="text-xs text-gray-400">Emails</p>
                          </div>
                        </div>

                        {/* Quick Links */}
                        <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                          <Link
                            href={`/admin/sites/${site.id}/articles`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg text-xs font-medium transition-colors border border-blue-500/20"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <FileText className="w-3 h-3" />
                            Articles
                          </Link>
                          <Link
                            href={`/admin/sites/${site.id}/settings`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-medium transition-colors border border-gray-600"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Edit3 className="w-3 h-3" />
                            Settings
                          </Link>
                          <Link
                            href={`/site/${site.subdomain}`}
                            target="_blank"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg text-xs font-medium transition-colors border border-green-500/20"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="w-3 h-3" />
                            Preview
                          </Link>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="px-6 pb-4 pt-0">
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Updated {formatDate(site.updated_at)}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
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