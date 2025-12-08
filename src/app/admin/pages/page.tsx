'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  ExternalLink,
  Check,
  Clock,
  ChevronDown,
  Edit3,
  X,
  Layers,
  Home,
  FileText,
  User,
  Star,
  Heart,
  Users
} from 'lucide-react';
import Link from 'next/link';
import EnhancedAdminLayout from '@/components/admin/EnhancedAdminLayout';
import { formatDistanceToNow } from 'date-fns';

// Helper to parse dates that may or may not have timezone info
const parseDate = (dateStr: string) => {
  if (!dateStr) return new Date();
  const normalized = dateStr.endsWith('Z') || dateStr.includes('+') || dateStr.includes('-')
    ? dateStr
    : dateStr + 'Z';
  return new Date(normalized);
};

// Page from page_config
interface ConfigPage {
  id: string;
  type: string;
  slug: string;
  title: string;
  navLabel: string;
  enabled: boolean;
  showInNav: boolean;
  navOrder: number;
  navMode: string;
}

// Combined page data for display
interface DisplayPage {
  id: string;
  pageId: string; // For edit link - either config id or db page id
  title: string;
  slug: string;
  type: string;
  enabled: boolean;
  showInNav: boolean;
  site_id: string;
  site_name: string;
  site_subdomain: string;
  brand_profile?: any;
  updated_at: string;
  hasWidgets: boolean;
  widgetCount: number;
}

type PagesTab = 'visible' | 'all' | 'hidden';

interface Site {
  id: string;
  name: string;
  domain: string;
  subdomain: string;
  brand_profile?: any;
  page_config?: {
    pages?: ConfigPage[];
    defaultArticleNavMode?: string;
  };
  updated_at: string;
}

// Default pages structure
const DEFAULT_PAGES: ConfigPage[] = [
  { id: 'home', type: 'homepage', slug: '/', title: 'Home', navLabel: 'Home', enabled: true, showInNav: true, navOrder: 1, navMode: 'global' },
  { id: 'articles', type: 'articles', slug: '/articles', title: 'All Articles', navLabel: 'Articles', enabled: true, showInNav: true, navOrder: 2, navMode: 'global' },
  { id: 'about', type: 'about', slug: '/about', title: 'About', navLabel: 'About', enabled: true, showInNav: true, navOrder: 3, navMode: 'global' },
  { id: 'top-picks', type: 'top-picks', slug: '/top-picks', title: 'Top Picks', navLabel: 'Top Picks', enabled: false, showInNav: false, navOrder: 4, navMode: 'global' },
  { id: 'success-stories', type: 'success-stories', slug: '/success-stories', title: 'Success Stories', navLabel: 'Success Stories', enabled: false, showInNav: false, navOrder: 5, navMode: 'global' },
];

// Get icon for page type
const getPageIcon = (type: string) => {
  switch (type) {
    case 'homepage': return Home;
    case 'articles': return FileText;
    case 'about': return User;
    case 'top-picks': return Star;
    case 'success-stories': return Heart;
    case 'community': return Users;
    default: return Layers;
  }
};

export default function PagesAdmin() {
  const [displayPages, setDisplayPages] = useState<DisplayPage[]>([]);
  const [allDisplayPages, setAllDisplayPages] = useState<DisplayPage[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [dbPages, setDbPages] = useState<any[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<PagesTab>('visible');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterPages();
  }, [selectedSite, activeTab, allDisplayPages, searchTerm]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Fetch sites with page_config
      const sitesResponse = await fetch('/api/sites');
      const sitesData = await sitesResponse.json();
      const sitesList: Site[] = (sitesData.sites || []).map((site: any) => ({
        ...site,
        brand_profile: typeof site.brand_profile === 'string' ? JSON.parse(site.brand_profile) : site.brand_profile,
        page_config: typeof site.page_config === 'string' ? JSON.parse(site.page_config) : site.page_config,
      }));
      setSites(sitesList);

      // Fetch database pages for widget counts
      const pagesResponse = await fetch('/api/pages?all=true');
      const pagesData = await pagesResponse.json();
      const dbPagesList = pagesData.pages || [];
      setDbPages(dbPagesList);

      // Build combined display pages from page_config
      const combined: DisplayPage[] = [];

      for (const site of sitesList) {
        const configPages = site.page_config?.pages || DEFAULT_PAGES;

        for (const configPage of configPages) {
          // Find matching database page for widget info
          const dbPage = dbPagesList.find((p: any) =>
            p.site_id === site.id &&
            (p.slug === configPage.slug || p.slug === configPage.slug.replace('/', ''))
          );

          let widgetCount = 0;
          if (dbPage?.widget_config) {
            try {
              const widgets = typeof dbPage.widget_config === 'string'
                ? JSON.parse(dbPage.widget_config)
                : dbPage.widget_config;
              widgetCount = Array.isArray(widgets) ? widgets.filter((w: any) => w.enabled !== false).length : 0;
            } catch {}
          }

          combined.push({
            id: `${site.id}-${configPage.id}`,
            pageId: configPage.id,
            title: configPage.title,
            slug: configPage.slug,
            type: configPage.type,
            enabled: configPage.enabled,
            showInNav: configPage.showInNav,
            site_id: site.id,
            site_name: site.name,
            site_subdomain: site.subdomain,
            brand_profile: site.brand_profile,
            updated_at: site.updated_at,
            hasWidgets: widgetCount > 0,
            widgetCount,
          });
        }
      }

      setAllDisplayPages(combined);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPages = () => {
    let filtered = [...allDisplayPages];

    // Filter by site
    if (selectedSite !== 'all') {
      filtered = filtered.filter(p => p.site_id === selectedSite);
    }

    // Filter by search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(term) ||
        p.slug.toLowerCase().includes(term) ||
        p.site_name.toLowerCase().includes(term)
      );
    }

    // Filter by tab
    if (activeTab === 'visible') {
      filtered = filtered.filter(p => p.enabled);
    } else if (activeTab === 'hidden') {
      filtered = filtered.filter(p => !p.enabled);
    }

    // Sort: visible pages by site then navOrder concept, hidden at the end
    filtered.sort((a, b) => {
      if (a.site_name !== b.site_name) return a.site_name.localeCompare(b.site_name);
      if (a.enabled !== b.enabled) return a.enabled ? -1 : 1;
      return 0;
    });

    setDisplayPages(filtered);
  };

  // Calculate stats
  const stats = {
    total: allDisplayPages.length,
    visible: allDisplayPages.filter(p => p.enabled).length,
    hidden: allDisplayPages.filter(p => !p.enabled).length,
  };

  const getSiteBrand = (page: DisplayPage) => {
    return page.brand_profile;
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
                    <p className="text-2xl font-bold text-white">{stats.visible}</p>
                    <p className="text-xs text-gray-400">Visible</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-500/10 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.hidden}</p>
                    <p className="text-xs text-gray-400">Hidden</p>
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
                { id: 'visible' as PagesTab, label: 'Visible', count: stats.visible, icon: Check, color: 'green' },
                { id: 'all' as PagesTab, label: 'All Pages', count: stats.total, icon: Layers, color: 'blue' },
                { id: 'hidden' as PagesTab, label: 'Hidden', count: stats.hidden, icon: Clock, color: 'gray' },
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
            ) : displayPages.length === 0 ? (
              <div className="p-12 text-center">
                <Layers className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No pages found</h3>
                <p className="text-gray-400 mb-6">
                  {searchTerm ? 'Try adjusting your search or filters' : 'No pages match the current filter'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-700/50">
                {displayPages.map((page) => {
                  const brand = getSiteBrand(page);
                  const PageIcon = getPageIcon(page.type);
                  return (
                    <Link
                      key={page.id}
                      href={`/admin/sites/${page.site_id}/dashboard?tab=pages`}
                      className="flex items-center gap-4 p-4 hover:bg-gray-750 transition-all group"
                    >
                      {/* Status indicator */}
                      <div className="flex flex-col items-center gap-1 flex-shrink-0">
                        <div className={`w-3 h-3 rounded-full ${page.enabled ? 'bg-green-400' : 'bg-gray-500'}`} />
                        <span className={`text-[10px] font-medium ${page.enabled ? 'text-green-400' : 'text-gray-500'}`}>
                          {page.enabled ? 'Visible' : 'Hidden'}
                        </span>
                      </div>

                      {/* Site Avatar */}
                      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ring-2 ring-gray-700">
                        {brand?.profileImage || brand?.sidebarImage ? (
                          <img
                            src={brand.profileImage || brand.sidebarImage}
                            alt={page.site_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                            <PageIcon className="w-5 h-5 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-white font-medium truncate group-hover:text-primary-400 transition-colors">
                            {page.title}
                          </p>
                          {page.showInNav && (
                            <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-400 rounded text-[10px] font-medium">
                              In Nav
                            </span>
                          )}
                          {page.widgetCount > 0 && (
                            <span className="px-1.5 py-0.5 bg-purple-500/10 text-purple-400 rounded text-[10px] font-medium">
                              {page.widgetCount} widgets
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span className="px-2 py-0.5 bg-gray-700/50 rounded text-gray-400 text-xs">
                            {page.site_name}
                          </span>
                          <span>{page.slug}</span>
                          <span>•</span>
                          <span className="capitalize text-xs">{page.type.replace('-', ' ')}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0 ml-4">
                        <a
                          href={`/site/${page.site_subdomain}${page.slug === '/' ? '' : page.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 text-gray-500 hover:text-primary-400 hover:bg-gray-700 rounded-lg transition-all"
                          title="View page"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
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
          {!loading && displayPages.length > 0 && (
            <div className="mt-4 text-center text-sm text-gray-500">
              Showing {displayPages.length} of {allDisplayPages.length} page{allDisplayPages.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
    </EnhancedAdminLayout>
  );
}
