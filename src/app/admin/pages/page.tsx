'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Eye,
  Search,
  ExternalLink,
  FileText,
  Check,
  Clock,
  ChevronDown,
  Edit3,
  X,
  Loader2,
  Layers
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import EnhancedAdminLayout from '@/components/admin/EnhancedAdminLayout';
import { formatDistanceToNow } from 'date-fns';

// Helper to parse dates that may or may not have timezone info
const parseDate = (dateStr: string) => {
  if (!dateStr) return new Date();
  // If no timezone indicator, assume UTC
  const normalized = dateStr.endsWith('Z') || dateStr.includes('+') || dateStr.includes('-')
    ? dateStr
    : dateStr + 'Z';
  return new Date(normalized);
};

interface Page {
  id: string;
  title: string;
  slug: string;
  template: string;
  published: boolean;
  site_id: string;
  created_at: string;
  updated_at: string;
}

type PagesTab = 'live' | 'all' | 'drafts';

interface Site {
  id: string;
  name: string;
  domain: string;
  subdomain: string;
  brand_profile?: any;
}

export default function PagesAdmin() {
  const router = useRouter();
  const [pages, setPages] = useState<Page[]>([]);
  const [allPages, setAllPages] = useState<Page[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<PagesTab>('live');
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [pageToDelete, setPageToDelete] = useState<Page | null>(null);
  const [deleting, setDeleting] = useState(false);

  const togglePublished = async (e: React.MouseEvent, pageId: string, currentPublished: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setTogglingId(pageId);
    try {
      // First get the current page data
      const getResponse = await fetch(`/api/pages/${pageId}`);
      const pageData = await getResponse.json();

      const response = await fetch(`/api/pages/${pageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: pageData.title,
          slug: pageData.slug,
          published: !currentPublished
        })
      });

      if (response.ok) {
        setAllPages(prev => prev.map(p =>
          p.id === pageId ? { ...p, published: !currentPublished } : p
        ));
      }
    } catch (error) {
      console.error('Error toggling publish status:', error);
    } finally {
      setTogglingId(null);
    }
  };

  useEffect(() => {
    fetchSites();
    fetchAllPages();
  }, []);

  useEffect(() => {
    filterPages();
  }, [selectedSite, activeTab, allPages]);

  const fetchSites = async () => {
    try {
      const response = await fetch('/api/sites');
      const data = await response.json();
      setSites(data.sites || []);
    } catch (error) {
      console.error('Error fetching sites:', error);
    }
  };

  const fetchAllPages = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/pages?all=true');
      const data = await response.json();
      setAllPages(data.pages || []);
    } catch (error) {
      console.error('Error fetching pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPages = () => {
    let filtered = [...allPages];

    // Filter by site
    if (selectedSite !== 'all') {
      filtered = filtered.filter(p => p.site_id === selectedSite);
    }

    // Filter by tab
    if (activeTab === 'live') {
      filtered = filtered.filter(p => p.published);
    } else if (activeTab === 'drafts') {
      filtered = filtered.filter(p => !p.published);
    }

    setPages(filtered);
  };

  const deletePage = async () => {
    if (!pageToDelete) return;

    setDeleting(true);
    try {
      await fetch(`/api/pages/${pageToDelete.id}`, { method: 'DELETE' });
      setAllPages(prev => prev.filter(p => p.id !== pageToDelete.id));
      setPageToDelete(null);
    } catch (error) {
      console.error('Error deleting page:', error);
    } finally {
      setDeleting(false);
    }
  };

  const filteredPages = pages.filter(page =>
    page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.slug?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate stats
  const stats = {
    total: allPages.length,
    live: allPages.filter(p => p.published).length,
    drafts: allPages.filter(p => !p.published).length,
  };

  const getSiteName = (siteId: string) => {
    const site = sites.find(s => s.id === siteId);
    return site?.name || 'Unknown';
  };

  const getSiteSubdomain = (siteId: string) => {
    const site = sites.find(s => s.id === siteId);
    return site?.subdomain || '';
  };

  const getSiteBrand = (siteId: string) => {
    const site = sites.find(s => s.id === siteId);
    if (!site?.brand_profile) return null;
    return typeof site.brand_profile === 'string'
      ? JSON.parse(site.brand_profile)
      : site.brand_profile;
  };

  return (
    <EnhancedAdminLayout>
      <div className="min-h-screen bg-gray-900">
        {/* Header */}
        <div className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white">All Pages</h1>
                <p className="text-gray-400 mt-1">Manage pages across all your sites</p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <Layers className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                    <p className="text-xs text-gray-400">Total Pages</p>
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
                { id: 'live' as PagesTab, label: 'Live', count: stats.live, icon: Check, color: 'green' },
                { id: 'all' as PagesTab, label: 'All Pages', count: stats.total, icon: Layers, color: 'blue' },
                { id: 'drafts' as PagesTab, label: 'Drafts', count: stats.drafts, icon: Clock, color: 'gray' },
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
                      ? tab.color === 'green' ? 'bg-green-500/20 text-green-400' : 'bg-primary-500/20 text-primary-400'
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

          {/* Pages List */}
          <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="w-10 h-10 border-3 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400">Loading pages...</p>
              </div>
            ) : filteredPages.length === 0 ? (
              <div className="p-12 text-center">
                <Layers className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No pages found</h3>
                <p className="text-gray-400 mb-6">
                  {searchTerm ? 'Try adjusting your search or filters' : 'Create your first page to get started'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-700/50">
                {filteredPages.map((page) => {
                  const brand = getSiteBrand(page.site_id);
                  return (
                  <Link
                    key={page.id}
                    href={`/admin/sites/${page.site_id}/pages/${page.id}/edit`}
                    className="flex items-center gap-4 p-4 hover:bg-gray-750 transition-all group"
                  >
                    {/* Publish Toggle - LEFT SIDE */}
                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                      <button
                        onClick={(e) => togglePublished(e, page.id, page.published)}
                        disabled={togglingId === page.id}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 focus:ring-offset-gray-800 ${
                          page.published ? 'bg-green-500' : 'bg-gray-600'
                        } ${togglingId === page.id ? 'opacity-50 cursor-wait' : ''}`}
                        title={page.published ? 'Click to unpublish' : 'Click to publish'}
                      >
                        {togglingId === page.id ? (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="w-4 h-4 text-white animate-spin" />
                          </span>
                        ) : (
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              page.published ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        )}
                      </button>
                      <span className={`text-xs font-medium ${page.published ? 'text-green-400' : 'text-gray-500'}`}>
                        {page.published ? 'Live' : 'Draft'}
                      </span>
                    </div>

                    {/* Site Avatar */}
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ring-2 ring-gray-700">
                      {brand?.profileImage || brand?.sidebarImage ? (
                        <img
                          src={brand.profileImage || brand.sidebarImage}
                          alt={getSiteName(page.site_id)}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                          <Layers className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-white font-medium truncate group-hover:text-primary-400 transition-colors">
                          {page.title}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="px-2 py-0.5 bg-gray-700/50 rounded text-gray-400 text-xs">
                          {getSiteName(page.site_id)}
                        </span>
                        <span>/{page.slug}</span>
                        <span>•</span>
                        <span>Updated {formatDistanceToNow(parseDate(page.updated_at), { addSuffix: false })} ago</span>
                      </div>
                    </div>

                    {/* Actions - RIGHT SIDE */}
                    <div className="flex items-center gap-1 flex-shrink-0 ml-4">
                      {/* View/Preview link */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const subdomain = getSiteSubdomain(page.site_id);
                          const url = page.published
                            ? `/site/${subdomain}/${page.slug}`
                            : `/site/${subdomain}/${page.slug}?preview=true`;
                          window.open(url, '_blank');
                        }}
                        className="p-2 text-gray-500 hover:text-primary-400 hover:bg-gray-700 rounded-lg transition-all"
                        title={page.published ? "View live page" : "Preview draft"}
                      >
                        {page.published ? <ExternalLink className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setPageToDelete(page);
                        }}
                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-all"
                        title="Delete page"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="p-2 text-gray-600 group-hover:text-primary-400 transition-colors">
                        <Edit3 className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Results Count */}
          {!loading && filteredPages.length > 0 && (
            <div className="mt-4 text-center text-sm text-gray-500">
              Showing {filteredPages.length} of {allPages.length} page{allPages.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {pageToDelete && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Delete Page</h3>
                <p className="text-sm text-gray-400">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete <span className="font-semibold text-white">"{pageToDelete.title}"</span>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setPageToDelete(null)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={deletePage}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </EnhancedAdminLayout>
  );
}
