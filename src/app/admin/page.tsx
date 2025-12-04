'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Globe,
  FileText,
  Eye,
  Users,
  Plus,
  Edit3,
  ExternalLink,
  Settings,
  Clock,
  Layers,
  Zap
} from 'lucide-react';
import EnhancedAdminLayout from '@/components/admin/EnhancedAdminLayout';
import { formatDistanceToNow } from 'date-fns';

interface Site {
  id: string;
  name: string;
  domain: string;
  subdomain: string;
  status: 'draft' | 'published';
  brand_profile: any;
  settings: any;
  created_at: string;
  updated_at: string;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  site_id: string;
  updated_at: string;
  views?: number;
  boosted?: boolean;
}

interface Page {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  site_id: string;
  updated_at: string;
  template?: string;
}

interface DashboardStats {
  totalSites: number;
  totalArticles: number;
  boostedArticles: number;
  totalViews: number;
  totalEmails: number;
}

export default function AdminDashboard() {
  const [sites, setSites] = useState<Site[]>([]);
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [recentPages, setRecentPages] = useState<Page[]>([]);
  const [sitesMetrics, setSitesMetrics] = useState<Record<string, { articleCount: number; boostedCount: number; viewCount: number; pageCount: number; emailCount: number }>>({});
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Load sites
        const sitesResponse = await fetch('/api/sites');
        const sitesData = await sitesResponse.json();
        const sitesList = sitesData.sites || [];
        setSites(sitesList);

        // Load dashboard stats
        const statsResponse = await fetch('/api/admin/dashboard-stats?timeframe=7d');
        const statsData = await statsResponse.json();
        if (statsData.stats) {
          setStats(statsData.stats);
        }

        // Get article counts, page counts, emails, and real views for each site
        let allArticles: Article[] = [];
        let allPages: Page[] = [];
        const metricsPromises = sitesList.map(async (site: Site) => {
          try {
            // Fetch articles with real views
            const articlesResponse = await fetch(`/api/articles?siteId=${site.id}&includeRealViews=true`);
            const articlesData = await articlesResponse.json();
            const articles = articlesData.articles || [];
            allArticles = [...allArticles, ...articles.map((a: any) => ({ ...a, site_id: site.id }))];
            const viewCount = articles.reduce((sum: number, a: any) => sum + (a.realViews || 0), 0);
            const boostedCount = articles.filter((a: any) => a.boosted).length;

            // Fetch pages
            const pagesResponse = await fetch(`/api/pages?siteId=${site.id}`);
            const pages = await pagesResponse.json();
            allPages = [...allPages, ...pages.map((p: any) => ({ ...p, site_id: site.id }))];

            // Fetch email count
            const emailsResponse = await fetch(`/api/subscribers?siteId=${site.id}`);
            const emailsData = await emailsResponse.json();
            const emailCount = emailsData.stats?.active || emailsData.subscribers?.length || 0;

            return { siteId: site.id, articleCount: articles.length, boostedCount, viewCount, pageCount: pages.length, emailCount };
          } catch {
            return { siteId: site.id, articleCount: 0, boostedCount: 0, viewCount: 0, pageCount: 0, emailCount: 0 };
          }
        });

        const metricsResults = await Promise.all(metricsPromises);
        const metricsMap = metricsResults.reduce((acc, result) => {
          acc[result.siteId] = { articleCount: result.articleCount, boostedCount: result.boostedCount, viewCount: result.viewCount, pageCount: result.pageCount, emailCount: result.emailCount };
          return acc;
        }, {} as Record<string, { articleCount: number; boostedCount: number; viewCount: number; pageCount: number; emailCount: number }>);

        setSitesMetrics(metricsMap);

        // Sort articles by updated_at and take the 5 most recent
        const sortedArticles = allArticles.sort((a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        ).slice(0, 5);
        setRecentArticles(sortedArticles);

        // Sort pages by updated_at and take the 5 most recent
        const sortedPages = allPages.sort((a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        ).slice(0, 5);
        setRecentPages(sortedPages);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const formatRelativeTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr.endsWith('Z') ? dateStr : dateStr + 'Z');
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return 'recently';
    }
  };

  if (loading) {
    return (
      <EnhancedAdminLayout>
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-800 rounded-xl p-4">
                  <div className="h-4 bg-gray-700 rounded mb-2"></div>
                  <div className="h-8 bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-800 rounded-xl p-6 h-48"></div>
              ))}
            </div>
          </div>
        </div>
      </EnhancedAdminLayout>
    );
  }

  const dashboardStats = stats ? [
    { name: 'Sites', value: stats.totalSites, icon: Globe, color: 'text-blue-400', bg: 'bg-blue-900/30' },
    { name: 'Boosted', value: stats.boostedArticles || 0, icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-900/30' },
    { name: 'Views', value: stats.totalViews >= 1000 ? `${(stats.totalViews / 1000).toFixed(1)}K` : stats.totalViews, icon: Eye, color: 'text-green-400', bg: 'bg-green-900/30' },
    { name: 'Email Signups', value: stats.totalEmails, icon: Users, color: 'text-orange-400', bg: 'bg-orange-900/30' },
  ] : [];

  return (
    <EnhancedAdminLayout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400 text-sm">Manage your sites and content</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/articles/new"
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              New Article
            </Link>
            <Link
              href="/admin/pages/new"
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              New Page
            </Link>
            <Link
              href="/admin/sites/new"
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
            >
              <Globe className="w-4 h-4" />
              New Site
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {dashboardStats.map((stat, index) => (
              <div key={index} className="bg-gray-800 rounded-xl border border-gray-700 p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-gray-400">{stat.name}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Three Column Layout: Sites, Recent Pages, Recent Articles */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sites Column */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Your Sites</h2>
            </div>

            {sites.length === 0 ? (
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
            ) : (
              <div className="space-y-4">
                {sites.map((site) => {
                  const brand = typeof site.brand_profile === 'string'
                    ? JSON.parse(site.brand_profile)
                    : site.brand_profile;
                  const isLive = site.status === 'published';
                  const metrics = sitesMetrics[site.id] || { articleCount: 0, boostedCount: 0, viewCount: 0, pageCount: 0, emailCount: 0 };

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

                      {/* Metrics - Pages, Boosted, Articles, Emails, Real Views */}
                      <div className="px-5 py-3 bg-gray-850 border-b border-gray-700">
                        <div className="flex items-center flex-wrap gap-x-5 gap-y-2 text-sm">
                          <div className="flex items-center gap-1.5">
                            <Layers className="w-4 h-4 text-indigo-400" />
                            <span className="text-gray-300">{metrics.pageCount}</span>
                            <span className="text-gray-500">pages</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Zap className="w-4 h-4 text-yellow-400" />
                            <span className="text-gray-300">{metrics.boostedCount}</span>
                            <span className="text-gray-500">boosted</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-blue-400" />
                            <span className="text-gray-300">{metrics.articleCount}</span>
                            <span className="text-gray-500">articles</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Users className="w-4 h-4 text-green-400" />
                            <span className="text-gray-300">{metrics.emailCount}</span>
                            <span className="text-gray-500">emails</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Eye className="w-4 h-4 text-purple-400" />
                            <span className="text-gray-300">{metrics.viewCount}</span>
                            <span className="text-gray-500">real views</span>
                          </div>
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
                          Updated {formatRelativeTime(site.updated_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {/* Add New Site Card */}
                <Link
                  href="/admin/sites/new"
                  className="bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-700 hover:border-primary-500 hover:bg-gray-800 transition-colors p-8 flex flex-col items-center justify-center text-center"
                >
                  <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mb-4">
                    <Plus className="w-6 h-6 text-gray-400" />
                  </div>
                  <h3 className="font-semibold text-gray-300 mb-1">Create New Site</h3>
                  <p className="text-sm text-gray-500">Launch another DR site</p>
                </Link>
              </div>
            )}
          </div>

          {/* Recent Pages Column */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-gray-400" />
                <h2 className="text-lg font-semibold text-white">Recent Pages</h2>
              </div>
              <Link href="/admin/pages/new" className="text-primary-400 hover:text-primary-300 text-sm">
                + New Page
              </Link>
            </div>
            {recentPages.length > 0 ? (
              <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <div className="divide-y divide-gray-700/50">
                  {recentPages.map((page) => {
                    const site = sites.find(s => s.id === page.site_id);
                    return (
                      <Link
                        key={page.id}
                        href={`/admin/sites/${page.site_id}/pages/${page.id}`}
                        className="flex items-center justify-between p-4 hover:bg-gray-750 transition-colors group"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            page.published ? 'bg-blue-500/10' : 'bg-gray-700'
                          }`}>
                            <Layers className={`w-5 h-5 ${page.published ? 'text-blue-400' : 'text-gray-500'}`} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate group-hover:text-primary-400 transition-colors">
                              {page.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              {site?.name || 'Unknown site'} • {formatRelativeTime(page.updated_at)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            page.published
                              ? 'bg-blue-900/50 text-blue-300'
                              : 'bg-gray-700 text-gray-400'
                          }`}>
                            {page.published ? 'Live' : 'Draft'}
                          </span>
                          <Edit3 className="w-4 h-4 text-gray-600 group-hover:text-primary-400 transition-colors" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-12 text-center">
                <Layers className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No pages yet</h3>
                <p className="text-gray-400 mb-6">Pages are created per site</p>
                <Link
                  href="/admin/pages/new"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Create Page
                </Link>
              </div>
            )}
          </div>

          {/* Recent Articles Column */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-400" />
                <h2 className="text-lg font-semibold text-white">Recent Articles</h2>
              </div>
              <Link href="/admin/articles" className="text-primary-400 hover:text-primary-300 text-sm">
                View all →
              </Link>
            </div>
            {recentArticles.length > 0 ? (
              <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <div className="divide-y divide-gray-700/50">
                  {recentArticles.map((article) => {
                    const site = sites.find(s => s.id === article.site_id);
                    return (
                      <Link
                        key={article.id}
                        href={`/admin/articles/${article.id}/edit`}
                        className="flex items-center justify-between p-4 hover:bg-gray-750 transition-colors group"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            article.published ? 'bg-green-500/10' : 'bg-gray-700'
                          }`}>
                            <FileText className={`w-5 h-5 ${article.published ? 'text-green-400' : 'text-gray-500'}`} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate group-hover:text-primary-400 transition-colors">
                              {article.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              {site?.name || 'Unknown site'} • {formatRelativeTime(article.updated_at)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {article.boosted && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-900/50 text-yellow-300">
                              <Zap className="w-3 h-3" />
                              Boosted
                            </span>
                          )}
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            article.published
                              ? 'bg-green-900/50 text-green-300'
                              : 'bg-gray-700 text-gray-400'
                          }`}>
                            {article.published ? 'Published' : 'Draft'}
                          </span>
                          <Edit3 className="w-4 h-4 text-gray-600 group-hover:text-primary-400 transition-colors" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-12 text-center">
                <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No articles yet</h3>
                <p className="text-gray-400 mb-6">Create your first article to get started</p>
                <Link
                  href="/admin/articles/new"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Create Article
                </Link>
              </div>
            )}
          </div>
        </div>

      </div>
    </EnhancedAdminLayout>
  );
}
