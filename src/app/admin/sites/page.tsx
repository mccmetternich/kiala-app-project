'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Globe, 
  Edit3, 
  ExternalLink, 
  MoreVertical, 
  Eye, 
  FileText, 
  Calendar,
  Filter,
  Download,
  Trash2
} from 'lucide-react';
import EnhancedAdminLayout from '@/components/admin/EnhancedAdminLayout';
import Badge from '@/components/ui/Badge';
import PublishToggle from '@/components/admin/PublishToggle';
import { formatDate } from '@/lib/utils';
import { clientAPI } from '@/lib/api';

export default function SitesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [sitesMetrics, setSitesMetrics] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSites() {
      try {
        const sitesData = await clientAPI.getAllSites();
        setSites(sitesData);

        // Get article counts for each site
        const articlePromises = sitesData.map(async (site: any) => {
          try {
            const response = await fetch(`/api/articles?siteId=${site.id}`);
            const data = await response.json();
            return { siteId: site.id, articleCount: data.articles?.length || 0 };
          } catch {
            return { siteId: site.id, articleCount: 0 };
          }
        });

        const articleResults = await Promise.all(articlePromises);
        const metricsMap = articleResults.reduce((acc: any, result) => {
          acc[result.siteId] = { totalArticles: result.articleCount };
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
    
    const status = site.published ? 'live' : 'draft';
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleSiteSelection = (siteId: string) => {
    setSelectedSites(prev => 
      prev.includes(siteId) 
        ? prev.filter(id => id !== siteId)
        : [...prev, siteId]
    );
  };

  const selectAllSites = () => {
    setSelectedSites(
      selectedSites.length === filteredSites.length 
        ? [] 
        : filteredSites.map(site => site.id)
    );
  };

  return (
    <EnhancedAdminLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-200">Sites</h1>
            <p className="text-gray-400 mt-1">Manage your direct response sites and domains</p>
          </div>
          
          <Link href="/admin/sites/new" className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Site
          </Link>
        </div>

        {/* Filters and Search */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search sites, domains, or brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="live">Live</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
              
              {selectedSites.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">
                    {selectedSites.length} selected
                  </span>
                  <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-primary-600 transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              )}
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
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="bg-gray-700 rounded-lg p-3 h-12"></div>
                    ))}
                  </div>
                  <div className="h-10 bg-gray-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredSites.map((site) => {
              const brand = typeof site.brand_profile === 'string' ? JSON.parse(site.brand_profile) : site.brand_profile;
              const status = site.status === 'published' ? 'live' : 'draft';
              const theme = typeof site.settings === 'string' ? JSON.parse(site.settings) : site.settings;
              const metrics = sitesMetrics[site.id];
              
              return (
                <Link href={`/admin/sites/${site.id}/dashboard`} key={site.id}>
                  <div className="bg-gray-800 rounded-xl border border-gray-700 hover:shadow-xl hover:border-gray-600 transition-all overflow-hidden group cursor-pointer">
                  {/* Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedSites.includes(site.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleSiteSelection(site.id);
                          }}
                          className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold text-gray-200 truncate">{site.name}</h3>
                            <Badge variant={status === 'live' ? 'trust' : 'default'} size="sm">
                              {status === 'live' ? '🟢 Live' : '🟡 Draft'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-400 truncate">{site.domain}</p>
                        </div>
                      </div>
                      <PublishToggle
                        siteId={site.id}
                        initialStatus={site.status === 'published' ? 'published' : 'draft'}
                        onStatusChange={(newStatus) => {
                          setSites(prevSites => 
                            prevSites.map(s => 
                              s.id === site.id 
                                ? { ...s, status: newStatus }
                                : s
                            )
                          );
                        }}
                        size="sm"
                      />
                    </div>
                    
                    {/* Brand Info */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-600 flex-shrink-0">
                        <img 
                          src={brand?.logoImage || brand?.sidebarImage || brand?.profileImage} 
                          alt={brand?.name || 'Brand'} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-200 truncate">
                          {brand?.name || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {brand?.tagline || 'No tagline'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Quick Links */}
                    <div className="flex flex-wrap gap-2 mb-4" onClick={(e) => e.stopPropagation()}>
                      <Link
                        href={`/admin/sites/${site.id}/articles`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-900/30 hover:bg-blue-900/50 text-blue-400 rounded-lg text-xs font-medium transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FileText className="w-3 h-3" />
                        {metrics?.totalArticles || 0} Articles
                      </Link>
                      <Link
                        href={`/admin/sites/${site.id}/settings`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-xs font-medium transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Edit3 className="w-3 h-3" />
                        Settings
                      </Link>
                      <Link
                        href={`/site/${site.subdomain}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-900/30 hover:bg-green-900/50 text-green-400 rounded-lg text-xs font-medium transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-3 h-3" />
                        Preview
                      </Link>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-6 pb-6">
                    <div className="text-xs text-gray-500">
                      Updated {formatDate(site.updated_at)}
                    </div>
                  </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {filteredSites.length === 0 && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-12 text-center">
            <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-200 mb-2">
              {searchQuery || statusFilter !== 'all' ? 'No sites found' : 'No sites yet'}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Create your first direct response site to get started'
              }
            </p>
            <Link href="/admin/sites/new" className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create New Site
            </Link>
          </div>
        )}

        {/* Bulk Actions Bar */}
        {selectedSites.length > 0 && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 border border-gray-700 rounded-xl shadow-lg p-4 flex items-center gap-4">
            <span className="text-sm font-medium text-gray-200">
              {selectedSites.length} site{selectedSites.length === 1 ? '' : 's'} selected
            </span>
            <div className="flex items-center gap-2">
              <button className="btn-secondary text-sm py-2 px-4">
                Export Data
              </button>
              <button className="text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors text-sm">
                Delete Selected
              </button>
            </div>
            <button 
              onClick={() => setSelectedSites([])}
              className="text-gray-400 hover:text-gray-400 ml-2"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </EnhancedAdminLayout>
  );
}