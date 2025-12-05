'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  Users,
  FileText,
  Globe,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Target,
  Zap,
  Clock,
  ExternalLink,
  MousePointerClick,
  Award
} from 'lucide-react';
import EnhancedAdminLayout from '@/components/admin/EnhancedAdminLayout';
import { formatDistanceToNow } from 'date-fns';

interface AnalyticsData {
  timeRange: string;
  period: {
    start: string;
    end: string;
  };
  summary: {
    totalSites: number;
    totalArticles: number;
    totalViews: number;
    publishedSites: number;
    publishedArticles: number;
  };
  sites: {
    total: number;
    published: number;
    draft: number;
    createdInTimeRange: number;
  };
  articles: {
    total: number;
    published: number;
    draft: number;
    featured: number;
    trending: number;
    totalViews: number;
    averageViews: number;
    createdInTimeRange: number;
  };
  growth: {
    sitesGrowth: number;
    articlesGrowth: number;
  };
  activity: {
    date: string;
    sites_created: number;
    articles_created: number;
    total_views: number;
  }[];
  topContent?: {
    articles: {
      id: string;
      title: string;
      views: number;
      displayViews: number;
      site_id: string;
      published: boolean;
    }[];
    sites: {
      id: string;
      name: string;
      subdomain: string;
      views: number;
      articleCount: number;
      status: string;
    }[];
  };
}

interface DashboardStats {
  totalSites: number;
  activeSites: number;
  totalArticles: number;
  boostedArticles: number;
  totalViews: number;
  totalCtaClicks: number;
  totalEmails: number;
  totalEmailsIncludingUnsubscribed: number;
  avgConversionRate: string;
  clickConversionRate: string;
  sitePerformance: {
    siteName: string;
    siteId: string;
    articlesCount: number;
    viewsCount: number;
    emailsCount: number;
    conversionRate: string;
  }[];
  topArticlesGlobal: {
    id: string;
    title: string;
    views: number;
    displayViews: number;
    slug: string;
    siteName: string;
    siteId: string;
    boosted?: boolean;
  }[];
  topWidgetsGlobal?: {
    type: string;
    name: string;
    clicks: number;
    ctr: string;
    articleId?: string;
    articleTitle?: string;
    siteName: string;
    siteId: string;
  }[];
  recentActivity: {
    type: string;
    description: string;
    timestamp: string;
    siteId: string;
  }[];
}

type TimeRange = '24h' | '7d' | '30d' | '90d';
type AnalyticsTab = 'boosted' | 'converting-articles' | 'widgets' | 'sites';

interface Site {
  id: string;
  name: string;
  subdomain: string;
}

export default function GlobalAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>('all');
  const [analyticsTab, setAnalyticsTab] = useState<AnalyticsTab>('boosted');

  // Load sites list once on mount
  useEffect(() => {
    const loadSites = async () => {
      try {
        const res = await fetch('/api/sites');
        if (res.ok) {
          const data = await res.json();
          setSites(data.sites || []);
        }
      } catch (err) {
        console.error('Failed to load sites:', err);
      }
    };
    loadSites();
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange, selectedSiteId]);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const siteParam = selectedSiteId !== 'all' ? `&siteId=${selectedSiteId}` : '';
      const [analyticsRes, statsRes] = await Promise.all([
        fetch(`/api/admin/analytics?timeRange=${timeRange}&details=true${siteParam}`),
        fetch(`/api/admin/dashboard-stats?timeframe=${timeRange}${siteParam}`)
      ]);

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setDashboardStats(statsData.stats);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatGrowth = (growth: number) => {
    const formatted = growth.toFixed(1);
    if (growth > 0) return `+${formatted}%`;
    if (growth < 0) return `${formatted}%`;
    return '0%';
  };

  const formatRelativeTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr.endsWith('Z') ? dateStr : dateStr + 'Z');
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return 'recently';
    }
  };

  const timeRangeOptions: { value: TimeRange; label: string }[] = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
  ];

  if (loading) {
    return (
      <EnhancedAdminLayout>
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-700 rounded w-1/4"></div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-800 rounded-xl p-6 h-32"></div>
              ))}
            </div>
            <div className="bg-gray-800 rounded-xl p-6 h-64"></div>
          </div>
        </div>
      </EnhancedAdminLayout>
    );
  }

  if (error) {
    return (
      <EnhancedAdminLayout>
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-6 text-center">
            <p className="text-red-400">{error}</p>
            <button
              onClick={loadAnalytics}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </EnhancedAdminLayout>
    );
  }

  const summaryStats = [
    {
      name: 'Total Views',
      value: formatNumber(dashboardStats?.totalViews || analytics?.summary.totalViews || 0),
      subtext: 'Real page views',
      icon: Eye,
      color: 'text-blue-400',
      bg: 'bg-blue-900/30',
      trend: null
    },
    {
      name: 'Total Active Emails',
      value: formatNumber(dashboardStats?.totalEmails || 0),
      subtext: `${dashboardStats?.totalEmailsIncludingUnsubscribed || 0} total (incl. unsub)`,
      icon: Users,
      color: 'text-green-400',
      bg: 'bg-green-900/30',
      trend: null
    },
    {
      name: 'Boosted Articles',
      value: dashboardStats?.boostedArticles || 0,
      subtext: `${dashboardStats?.totalArticles || 0} total published`,
      icon: FileText,
      color: 'text-purple-400',
      bg: 'bg-purple-900/30',
      trend: analytics?.growth.articlesGrowth
    },
    {
      name: 'Active Sites',
      value: dashboardStats?.activeSites || analytics?.sites.published || 0,
      subtext: `${dashboardStats?.totalSites || 0} total`,
      icon: Globe,
      color: 'text-orange-400',
      bg: 'bg-orange-900/30',
      trend: analytics?.growth.sitesGrowth
    },
  ];

  // Calculate metrics - using API-provided values for consistency
  const totalViews = dashboardStats?.totalViews || 0;
  const totalEmails = dashboardStats?.totalEmails || 0;
  const totalCtaClicks = dashboardStats?.totalCtaClicks || 0;

  // Use API-calculated rates for consistency
  const clickConversionRate = dashboardStats?.clickConversionRate || '0';
  const emailConversionRate = dashboardStats?.avgConversionRate || '0';

  const avgViewsPerArticle = analytics?.articles.averageViews ||
    (dashboardStats?.totalArticles && dashboardStats.totalArticles > 0
      ? Math.round(totalViews / dashboardStats.totalArticles)
      : 0);

  return (
    <EnhancedAdminLayout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-primary-400" />
              Global Analytics
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Real metrics across all sites (not vanity numbers)
            </p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            {/* Site Filter */}
            <select
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Sites</option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </select>

            {/* Time Range Selector */}
            <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-1">
              {timeRangeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTimeRange(option.value)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    timeRange === option.value
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryStats.map((stat, index) => (
            <div key={index} className="bg-gray-800 rounded-xl border border-gray-700 p-5">
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                {stat.trend !== null && stat.trend !== undefined && (
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    stat.trend > 0 ? 'text-green-400' : stat.trend < 0 ? 'text-red-400' : 'text-gray-400'
                  }`}>
                    {stat.trend > 0 ? <ArrowUpRight className="w-4 h-4" /> : stat.trend < 0 ? <ArrowDownRight className="w-4 h-4" /> : null}
                    {formatGrowth(stat.trend)}
                  </div>
                )}
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-gray-400 mt-1">{stat.name}</p>
                <p className="text-xs text-gray-500">{stat.subtext}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Click Conversion - first */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
            <div className="flex items-center gap-3 mb-3">
              <MousePointerClick className="w-5 h-5 text-pink-400" />
              <span className="text-sm font-medium text-gray-300">CTA Click Conversion</span>
            </div>
            <p className="text-4xl font-bold text-white">{clickConversionRate}%</p>
            <p className="text-xs text-gray-500 mt-1">{formatNumber(totalCtaClicks)} CTA clicks / {formatNumber(totalViews)} unique views</p>
          </div>

          {/* Email Conversion - second */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
            <div className="flex items-center gap-3 mb-3">
              <Target className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-medium text-gray-300">Email Conversion</span>
            </div>
            <p className="text-4xl font-bold text-white">{emailConversionRate}%</p>
            <p className="text-xs text-gray-500 mt-1">{formatNumber(totalEmails)} active signups / {formatNumber(totalViews)} unique views</p>
          </div>

          {/* Avg Views/Article - third */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
            <div className="flex items-center gap-3 mb-3">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-sm font-medium text-gray-300">Avg Views/Article</span>
            </div>
            <p className="text-4xl font-bold text-white">{formatNumber(avgViewsPerArticle)}</p>
            <p className="text-xs text-gray-500 mt-1">Across {dashboardStats?.totalArticles || 0} published articles</p>
          </div>
        </div>

        {/* Multi-Tab Analytics Widget */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-700 overflow-x-auto">
            <button
              onClick={() => setAnalyticsTab('boosted')}
              className={`flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                analyticsTab === 'boosted'
                  ? 'text-yellow-400 border-yellow-400 bg-yellow-500/5'
                  : 'text-gray-400 border-transparent hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <Zap className="w-4 h-4" />
              Top Boosted Articles
            </button>
            <button
              onClick={() => setAnalyticsTab('converting-articles')}
              className={`flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                analyticsTab === 'converting-articles'
                  ? 'text-green-400 border-green-400 bg-green-500/5'
                  : 'text-gray-400 border-transparent hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Top Converting Articles
            </button>
            <button
              onClick={() => setAnalyticsTab('widgets')}
              className={`flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                analyticsTab === 'widgets'
                  ? 'text-pink-400 border-pink-400 bg-pink-500/5'
                  : 'text-gray-400 border-transparent hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <MousePointerClick className="w-4 h-4" />
              Top Converting Widgets
            </button>
            <button
              onClick={() => setAnalyticsTab('sites')}
              className={`flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                analyticsTab === 'sites'
                  ? 'text-blue-400 border-blue-400 bg-blue-500/5'
                  : 'text-gray-400 border-transparent hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <Users className="w-4 h-4" />
              Top Sites by Signups
            </button>
          </div>

          {/* Tab Content */}
          <div className="divide-y divide-gray-700/50">
            {/* Top Boosted Articles Tab */}
            {analyticsTab === 'boosted' && (
              <>
                {(dashboardStats?.topArticlesGlobal || [])
                  .filter((a: any) => a.boosted)
                  .slice(0, 10)
                  .map((article: any, index: number) => (
                    <Link
                      key={article.id || index}
                      href={`/admin/articles/${article.id}/edit`}
                      className="flex items-center justify-between p-4 hover:bg-gray-750 transition-colors group"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-yellow-500/20">
                          <Zap className="w-4 h-4 text-yellow-400" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1 mb-0.5">
                            <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider">Boosted</span>
                          </div>
                          <p className="text-sm font-medium text-white truncate group-hover:text-primary-400 transition-colors">
                            {article.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {article.siteName || 'Unknown site'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <p className="text-sm font-semibold text-white">{formatNumber(article.views || 0)}</p>
                        <p className="text-xs text-gray-500">real views</p>
                      </div>
                    </Link>
                  ))}
                {(dashboardStats?.topArticlesGlobal || []).filter((a: any) => a.boosted).length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    No boosted articles yet. Boost articles to promote them and track their performance.
                  </div>
                )}
              </>
            )}

            {/* Top Converting Articles Tab */}
            {analyticsTab === 'converting-articles' && (
              <>
                {(dashboardStats?.topArticlesGlobal || [])
                  .slice(0, 10)
                  .map((article: any, index: number) => (
                    <Link
                      key={article.id || index}
                      href={`/admin/articles/${article.id}/edit`}
                      className="flex items-center justify-between p-4 hover:bg-gray-750 transition-colors group"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          article.boosted ? 'bg-yellow-500/20' : 'bg-green-500/10'
                        }`}>
                          {article.boosted ? (
                            <Zap className="w-4 h-4 text-yellow-400" />
                          ) : (
                            <FileText className="w-4 h-4 text-green-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          {article.boosted && (
                            <div className="flex items-center gap-1 mb-0.5">
                              <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider">Boosted</span>
                            </div>
                          )}
                          <p className="text-sm font-medium text-white truncate group-hover:text-primary-400 transition-colors">
                            {article.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {article.siteName || 'Unknown site'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <p className="text-sm font-semibold text-white">{formatNumber(article.views || 0)}</p>
                        <p className="text-xs text-gray-500">real views</p>
                      </div>
                    </Link>
                  ))}
                {(!dashboardStats?.topArticlesGlobal?.length) && (
                  <div className="p-8 text-center text-gray-500">
                    No article views recorded yet
                  </div>
                )}
              </>
            )}

            {/* Top Converting Widgets Tab */}
            {analyticsTab === 'widgets' && (
              <>
                {(dashboardStats?.topWidgetsGlobal || []).map((widget, index) => (
                  <Link
                    key={index}
                    href={widget.articleId ? `/admin/articles/${widget.articleId}/edit` : `/admin/sites/${widget.siteId}/dashboard`}
                    className="flex items-center justify-between p-4 hover:bg-gray-750 transition-colors group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        index < 3 ? 'bg-gradient-to-br from-yellow-500 to-orange-600' : 'bg-gray-700'
                      }`}>
                        {index < 3 ? (
                          <Award className="w-4 h-4 text-white" />
                        ) : (
                          <span className="text-sm font-bold text-gray-400">{index + 1}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate group-hover:text-primary-400 transition-colors">
                          {widget.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {widget.type} • {widget.articleTitle || 'Unknown article'} • {widget.siteName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-pink-400">{widget.clicks}</p>
                        <p className="text-xs text-gray-500">clicks</p>
                      </div>
                      <div className="text-right min-w-[50px]">
                        <p className="text-sm font-semibold text-green-400">{widget.ctr}%</p>
                        <p className="text-xs text-gray-500">CTR</p>
                      </div>
                    </div>
                  </Link>
                ))}
                {(!dashboardStats?.topWidgetsGlobal?.length) && (
                  <div className="p-8 text-center text-gray-500">
                    No widget clicks recorded yet. Widget clicks are tracked when visitors interact with CTAs and Shop Now buttons.
                  </div>
                )}
              </>
            )}

            {/* Top Sites by Email Signups Tab */}
            {analyticsTab === 'sites' && (
              <>
                {(dashboardStats?.sitePerformance || [])
                  .sort((a: any, b: any) => (b.emailsCount || 0) - (a.emailsCount || 0))
                  .slice(0, 10)
                  .map((site: any, index: number) => (
                    <Link
                      key={site.siteId || index}
                      href={`/admin/sites/${site.siteId}/dashboard`}
                      className="flex items-center justify-between p-4 hover:bg-gray-750 transition-colors group"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <Globe className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate group-hover:text-primary-400 transition-colors">
                            {site.siteName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {site.articlesCount || 0} articles • {formatNumber(site.viewsCount || 0)} views
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-400">{site.emailsCount || 0}</p>
                          <p className="text-xs text-gray-500">active emails</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-yellow-400">{site.conversionRate || '0'}%</p>
                          <p className="text-xs text-gray-500">email conv.</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                {(!dashboardStats?.sitePerformance?.length) && (
                  <div className="p-8 text-center text-gray-500">
                    No sites created yet
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Activity Timeline Chart */}
        {analytics?.activity && analytics.activity.length > 0 && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              Views Over Time
            </h3>
            <div className="h-48 flex items-end gap-1">
              {analytics.activity.map((day, index) => {
                const maxViews = Math.max(...analytics.activity.map(d => d.total_views), 1);
                const height = (day.total_views / maxViews) * 100;
                return (
                  <div
                    key={index}
                    className="flex-1 group relative"
                    title={`${day.date}: ${day.total_views} views`}
                  >
                    <div
                      className="bg-primary-500/50 hover:bg-primary-500 rounded-t transition-colors w-full"
                      style={{ height: `${Math.max(height, 2)}%` }}
                    />
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                      {day.date}: {day.total_views} views
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>{analytics.activity[0]?.date}</span>
              <span>{analytics.activity[analytics.activity.length - 1]?.date}</span>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {dashboardStats?.recentActivity && dashboardStats.recentActivity.length > 0 && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-400" />
                Recent Activity
              </h3>
            </div>
            <div className="divide-y divide-gray-700/50">
              {dashboardStats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-4 p-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    activity.type === 'email_signup' ? 'bg-green-500/10' : 'bg-purple-500/10'
                  }`}>
                    {activity.type === 'email_signup' ? (
                      <Users className="w-5 h-5 text-green-400" />
                    ) : (
                      <FileText className="w-5 h-5 text-purple-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{activity.description}</p>
                    <p className="text-xs text-gray-500">{formatRelativeTime(activity.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Banner */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Activity className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-300 font-medium">Real Analytics vs Vanity Metrics</p>
              <p className="text-xs text-blue-400/70 mt-1">
                This dashboard shows actual page views from our tracking system. The "display views" shown to site visitors
                are inflated vanity metrics. For accurate business decisions, always use these real numbers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </EnhancedAdminLayout>
  );
}
