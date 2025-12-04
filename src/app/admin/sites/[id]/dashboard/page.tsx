'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Globe,
  FileText,
  Eye,
  TrendingUp,
  Users,
  Plus,
  ExternalLink,
  Edit3,
  Settings,
  Download,
  Clock,
  LayoutDashboard,
  Search,
  MoreVertical,
  Star,
  Trash2,
  Copy,
  ArrowLeft,
  Save,
  Upload,
  User,
  Palette,
  Shield,
  Check,
  X,
  BarChart3,
  BookOpen,
  GripVertical,
  ChevronDown,
  Sparkles,
  MessageSquare,
  Tag,
  Package
} from 'lucide-react';
import { ContentProfile, DEFAULT_CONTENT_PROFILE } from '@/types';
import EnhancedAdminLayout from '@/components/admin/EnhancedAdminLayout';
import Badge from '@/components/ui/Badge';
import MediaLibrary from '@/components/admin/MediaLibrary';
import { formatDistanceToNow } from 'date-fns';
import { clientAPI } from '@/lib/api';

type TabType = 'overview' | 'articles' | 'pages' | 'emails' | 'analytics' | 'content-profile' | 'settings';
type SettingsSubTab = 'content' | 'appearance' | 'advanced';

export default function SiteDashboard() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [site, setSite] = useState<any>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Articles state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Settings state
  const [settingsSubTab, setSettingsSubTab] = useState<SettingsSubTab>('content');
  const [isSaving, setIsSaving] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Emails state
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [subscriberStats, setSubscriberStats] = useState<any>({});

  // Content Profile state
  const [contentProfile, setContentProfile] = useState<ContentProfile>(DEFAULT_CONTENT_PROFILE);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['mission']));

  // Pages state
  const [pageConfig, setPageConfig] = useState<any>({
    pages: [
      { id: 'home', type: 'homepage', slug: '/', title: 'Home', navLabel: 'Home', enabled: true, showInNav: true, navOrder: 1, navMode: 'global' },
      { id: 'articles', type: 'articles', slug: '/articles', title: 'Articles', navLabel: 'Articles', enabled: true, showInNav: true, navOrder: 2, navMode: 'global' },
      { id: 'about', type: 'about', slug: '/about', title: 'About', navLabel: 'About', enabled: true, showInNav: true, navOrder: 3, navMode: 'global' },
      { id: 'top-picks', type: 'top-picks', slug: '/top-picks', title: 'Top Picks', navLabel: 'Top Picks', enabled: false, showInNav: false, navOrder: 4, navMode: 'global' },
      { id: 'success-stories', type: 'success-stories', slug: '/success-stories', title: 'Success Stories', navLabel: 'Success Stories', enabled: false, showInNav: false, navOrder: 5, navMode: 'global' },
    ],
    defaultArticleNavMode: 'direct-response'
  });

  const loadData = useCallback(async () => {
    try {
      const [siteResponse, articlesData, subscribersResponse] = await Promise.all([
        fetch(`/api/sites/${id}`).then(res => res.json()),
        clientAPI.getArticlesBySite(id, false),
        fetch(`/api/subscribers?siteId=${id}`).then(res => res.json()).catch(() => ({ stats: { total: 0 }, subscribers: [] }))
      ]);

      if (siteResponse.site) {
        const siteData = siteResponse.site;
        // Parse JSON strings
        if (typeof siteData.settings === 'string') {
          try { siteData.settings = JSON.parse(siteData.settings); } catch { siteData.settings = {}; }
        }
        if (typeof siteData.brand_profile === 'string') {
          try { siteData.brand_profile = JSON.parse(siteData.brand_profile); } catch { siteData.brand_profile = {}; }
        }
        if (typeof siteData.content_profile === 'string') {
          try { siteData.content_profile = JSON.parse(siteData.content_profile); } catch { siteData.content_profile = {}; }
        }
        if (typeof siteData.page_config === 'string') {
          try { siteData.page_config = JSON.parse(siteData.page_config); } catch { siteData.page_config = {}; }
        }
        setSite(siteData);

        // Set content profile with defaults
        const existingProfile = siteData.content_profile || {};
        setContentProfile({
          ...DEFAULT_CONTENT_PROFILE,
          ...existingProfile,
          audience: { ...DEFAULT_CONTENT_PROFILE.audience, ...existingProfile.audience },
          style: { ...DEFAULT_CONTENT_PROFILE.style, ...existingProfile.style },
          rules: { ...DEFAULT_CONTENT_PROFILE.rules, ...existingProfile.rules },
          examples: { ...DEFAULT_CONTENT_PROFILE.examples, ...existingProfile.examples },
          topics: { ...DEFAULT_CONTENT_PROFILE.topics, ...existingProfile.topics },
          products: { ...DEFAULT_CONTENT_PROFILE.products, ...existingProfile.products },
        });

        // Set page config if exists
        if (siteData.page_config?.pages) {
          setPageConfig(siteData.page_config);
        }
      }

      setArticles(articlesData || []);
      setSubscribers(subscribersResponse?.subscribers || []);
      setSubscriberStats(subscribersResponse?.stats || { total: 0 });
      setMetrics({
        totalArticles: articlesData?.length || 0,
        publishedArticles: articlesData?.filter((a: any) => a.published)?.length || 0,
        totalViews: articlesData?.reduce((sum: number, a: any) => sum + (a.views || 0), 0) || 0,
        totalEmails: subscribersResponse?.stats?.total || 0
      });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) loadData();
  }, [id, loadData]);

  // Settings handlers
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/sites/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...site,
          content_profile: contentProfile,
          page_config: pageConfig
        }),
      });
      if (response.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Content Profile section toggle
  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  // Export emails as CSV
  const exportEmails = () => {
    const csv = [
      ['Email', 'Source', 'Subscribed At'],
      ...subscribers.map(s => [s.email, s.source || 'unknown', s.created_at])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${site?.subdomain || 'site'}-emails-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const updateSiteField = (field: string, value: any) => {
    setSite((prev: any) => ({ ...prev, [field]: value }));
  };

  const updateBrandField = (field: string, value: any) => {
    setSite((prev: any) => ({
      ...prev,
      brand_profile: { ...prev.brand_profile, [field]: value }
    }));
  };

  const updateSettingsField = (field: string, value: any) => {
    setSite((prev: any) => ({
      ...prev,
      settings: { ...prev.settings, [field]: value }
    }));
  };

  const updateThemeField = (field: string, value: any) => {
    const currentTheme = site?.settings?.theme || {};
    setSite((prev: any) => ({
      ...prev,
      settings: { ...prev.settings, theme: { ...currentTheme, [field]: value } }
    }));
  };

  const handleMediaSelect = (file: any) => {
    const fieldMap: Record<string, () => void> = {
      'logo': () => updateBrandField('logoImage', file.url),
      'author': () => updateBrandField('authorImage', file.url),
      'sidebar': () => updateBrandField('sidebarImage', file.url),
      'about': () => updateBrandField('aboutImage', file.url),
      'audio': () => updateSettingsField('audioUrl', file.url),
      'aboutAudio': () => updateSettingsField('aboutAudioUrl', file.url),
      'leadMagnetPdf': () => updateSettingsField('leadMagnetPdfUrl', file.url),
    };
    if (mediaTarget && fieldMap[mediaTarget]) fieldMap[mediaTarget]();
    setShowMediaLibrary(false);
    setMediaTarget(null);
  };

  // Filtered articles
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const status = article.published ? 'published' : 'draft';
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Navigate to emails page with site filter
  const navigateToEmails = () => {
    router.push(`/admin/emails?siteId=${id}`);
  };

  if (loading) {
    return (
      <EnhancedAdminLayout>
        <div className="min-h-screen bg-gray-900">
          <div className="max-w-7xl mx-auto p-6">
            <div className="animate-pulse space-y-6">
              <div className="h-20 bg-gray-800 rounded-2xl"></div>
              <div className="h-12 bg-gray-800 rounded-xl w-96"></div>
              <div className="grid grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-800 rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </EnhancedAdminLayout>
    );
  }

  if (!site) {
    return (
      <EnhancedAdminLayout>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <Globe className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-200 mb-2">Site not found</h1>
            <Link href="/admin" className="text-primary-400 hover:text-primary-300">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </EnhancedAdminLayout>
    );
  }

  const brand = site.brand_profile || {};
  const settings = site.settings || {};
  const theme = settings.theme || {};
  const isLive = site.status === 'published';

  // All tabs - internal rendering
  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: LayoutDashboard },
    { id: 'articles' as TabType, label: 'Articles', icon: Edit3, count: metrics?.totalArticles },
    { id: 'pages' as TabType, label: 'Pages', icon: FileText },
    { id: 'emails' as TabType, label: 'Emails', icon: Users, count: metrics?.totalEmails },
    { id: 'analytics' as TabType, label: 'Analytics', icon: BarChart3 },
    { id: 'content-profile' as TabType, label: 'Content Profile', icon: BookOpen },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
  ];

  const settingsTabs = [
    { id: 'content' as SettingsSubTab, label: 'Content & Profile', icon: User },
    { id: 'appearance' as SettingsSubTab, label: 'Design', icon: Palette },
    { id: 'advanced' as SettingsSubTab, label: 'Advanced', icon: Shield },
  ];

  return (
    <EnhancedAdminLayout>
      <div className="min-h-screen bg-gray-900">
        {/* Hero Header */}
        <div className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              {/* Left: Site Info */}
              <div className="flex items-center gap-5">
                <Link
                  href="/admin"
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Link>

                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
                  {brand.logoImage ? (
                    <img src={brand.logoImage} alt="" className="w-full h-full rounded-2xl object-cover" />
                  ) : (
                    <span className="text-white font-bold text-xl">
                      {(brand.name || site.name || 'S').charAt(0)}
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-white">{site.name}</h1>
                    {isLive && (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 text-green-400 text-xs font-medium rounded-full">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                        Live
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mt-0.5">{brand.tagline || site.subdomain}</p>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-3">
                <a
                  href={`/site/${site.subdomain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-xl transition-all text-sm font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Site
                </a>
                <Link
                  href={`/admin/articles/new?siteId=${id}`}
                  className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl transition-all text-sm font-medium shadow-lg shadow-primary-600/20"
                >
                  <Plus className="w-4 h-4" />
                  New Article
                </Link>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-2 mt-8 flex-wrap">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-600 text-gray-300'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-7xl mx-auto p-6">

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Articles', value: metrics?.totalArticles || 0, icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10', clickable: true, onClick: () => setActiveTab('articles') },
                  { label: 'Published', value: metrics?.publishedArticles || 0, icon: Check, color: 'text-green-400', bg: 'bg-green-500/10', clickable: false },
                  { label: 'Total Views', value: metrics?.totalViews?.toLocaleString() || 0, icon: Eye, color: 'text-purple-400', bg: 'bg-purple-500/10', clickable: false },
                  { label: 'Email Signups', value: metrics?.totalEmails || 0, icon: Users, color: 'text-orange-400', bg: 'bg-orange-500/10', clickable: true, onClick: navigateToEmails },
                ].map((stat, i) => (
                  <div
                    key={i}
                    onClick={stat.clickable ? stat.onClick : undefined}
                    className={`bg-gray-800 rounded-2xl border border-gray-700 p-5 transition-all ${
                      stat.clickable
                        ? 'cursor-pointer hover:border-primary-500 hover:bg-gray-750 hover:shadow-lg hover:shadow-primary-500/10'
                        : 'hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">{stat.label}</p>
                        <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                      </div>
                      <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                    </div>
                    {stat.clickable && (
                      <p className="text-xs text-gray-500 mt-3">Click to manage →</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Two Column Layout */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Recent Articles */}
                <div className="lg:col-span-2 bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                  <div className="flex items-center justify-between p-5 border-b border-gray-700">
                    <h2 className="text-lg font-semibold text-white">Recent Articles</h2>
                    <button
                      onClick={() => setActiveTab('articles')}
                      className="text-primary-400 hover:text-primary-300 text-sm font-medium"
                    >
                      View all →
                    </button>
                  </div>
                  <div className="divide-y divide-gray-700/50">
                    {articles.slice(0, 5).map((article) => (
                      <Link
                        key={article.id}
                        href={`/admin/articles/${article.id}/edit`}
                        className="flex items-center justify-between p-4 hover:bg-gray-750 transition-all group"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            article.published ? 'bg-green-500/10' : 'bg-gray-700'
                          }`}>
                            <FileText className={`w-5 h-5 ${article.published ? 'text-green-400' : 'text-gray-500'}`} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-white font-medium truncate group-hover:text-primary-400 transition-colors">
                              {article.title}
                            </p>
                            <p className="text-gray-500 text-sm">
                              {article.views || 0} views • Updated {formatDistanceToNow(new Date(article.updated_at || article.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        <Edit3 className="w-4 h-4 text-gray-600 group-hover:text-primary-400 transition-colors flex-shrink-0" />
                      </Link>
                    ))}
                    {articles.length === 0 && (
                      <div className="p-8 text-center">
                        <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400">No articles yet</p>
                        <Link
                          href={`/admin/articles/new?siteId=${id}`}
                          className="text-primary-400 hover:text-primary-300 text-sm mt-2 inline-block"
                        >
                          Create your first article →
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-4">
                  <div className="bg-gray-800 rounded-2xl border border-gray-700 p-5">
                    <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                    <div className="space-y-2">
                      <Link
                        href={`/admin/articles/new?siteId=${id}`}
                        className="flex items-center gap-3 w-full p-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl transition-all font-medium"
                      >
                        <Plus className="w-5 h-5" />
                        New Article
                      </Link>
                      <button
                        onClick={() => setActiveTab('settings')}
                        className="flex items-center gap-3 w-full p-3 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-xl transition-all font-medium"
                      >
                        <Settings className="w-5 h-5" />
                        Site Settings
                      </button>
                      <button
                        onClick={navigateToEmails}
                        className="flex items-center gap-3 w-full p-3 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-xl transition-all font-medium"
                      >
                        <Download className="w-5 h-5" />
                        Export Emails
                      </button>
                    </div>
                  </div>

                  {/* Site Status Card */}
                  <div className="bg-gradient-to-br from-gray-800 to-gray-800/50 rounded-2xl border border-gray-700 p-5">
                    <div className="flex items-center gap-3 mb-4">
                      {brand.logoImage || brand.sidebarImage ? (
                        <img src={brand.logoImage || brand.sidebarImage} alt="" className="w-12 h-12 rounded-xl object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                          <Globe className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-white">{brand.name || site.name}</p>
                        <p className="text-sm text-gray-400">{site.subdomain}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between py-2 border-t border-gray-700/50">
                        <span className="text-gray-400">Status</span>
                        <span className={`flex items-center gap-1.5 ${isLive ? 'text-green-400' : 'text-yellow-400'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-green-400' : 'bg-yellow-400'}`}></span>
                          {isLive ? 'Live' : 'Draft'}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-t border-gray-700/50">
                        <span className="text-gray-400">Theme</span>
                        <span className="text-gray-200 capitalize">{site.theme || 'Default'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ARTICLES TAB */}
          {activeTab === 'articles' && (
            <div className="space-y-6">
              {/* Search and Filters */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search articles..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-gray-200 focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
                <Link
                  href={`/admin/articles/new?siteId=${id}`}
                  className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl transition-all text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  New Article
                </Link>
              </div>

              {/* Articles List - Matching Recent Articles Style */}
              <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                <div className="divide-y divide-gray-700/50">
                  {filteredArticles.map((article) => (
                    <Link
                      key={article.id}
                      href={`/admin/articles/${article.id}/edit`}
                      className="flex items-center justify-between p-4 hover:bg-gray-750 transition-all group"
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          article.published ? 'bg-green-500/10' : 'bg-gray-700'
                        }`}>
                          <FileText className={`w-5 h-5 ${article.published ? 'text-green-400' : 'text-gray-500'}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3 mb-0.5">
                            <p className="text-white font-medium truncate group-hover:text-primary-400 transition-colors">
                              {article.title}
                            </p>
                            {!article.published && (
                              <span className="px-2 py-0.5 bg-gray-700 text-gray-400 rounded-full text-xs font-medium flex-shrink-0">
                                Draft
                              </span>
                            )}
                          </div>
                          <p className="text-gray-500 text-sm">
                            {article.views || 0} views • Updated {formatDistanceToNow(new Date(article.updated_at || article.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                        <span
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            window.open(`/site/${site.subdomain}/articles/${article.slug}`, '_blank');
                          }}
                          className="p-2 text-gray-600 hover:text-primary-400 hover:bg-gray-700 rounded-lg transition-all cursor-pointer"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </span>
                        <Edit3 className="w-4 h-4 text-gray-600 group-hover:text-primary-400 transition-colors" />
                      </div>
                    </Link>
                  ))}
                  {filteredArticles.length === 0 && (
                    <div className="p-12 text-center">
                      <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">No articles found</h3>
                      <p className="text-gray-400 mb-6">
                        {searchQuery ? 'Try adjusting your search terms' : 'Create your first article to get started'}
                      </p>
                      <Link
                        href={`/admin/articles/new?siteId=${id}`}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl transition-all font-medium"
                      >
                        <Plus className="w-4 h-4" />
                        Create Article
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Save Button Bar */}
              <div className="flex items-center justify-between bg-gray-800 rounded-2xl border border-gray-700 p-4">
                <div className="flex items-center gap-4">
                  {settingsTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setSettingsSubTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                        settingsSubTab === tab.id
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-gray-700'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                    saveSuccess
                      ? 'bg-green-600 text-white'
                      : 'bg-primary-600 hover:bg-primary-500 text-white'
                  }`}
                >
                  {saveSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      Saved!
                    </>
                  ) : isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>

              {/* Settings Content */}
              <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">

                {/* Content & Profile */}
                {settingsSubTab === 'content' && (
                  <div className="space-y-8">
                    {/* Basic Info */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Site Name</label>
                          <input
                            type="text"
                            value={site.name || ''}
                            onChange={(e) => updateSiteField('name', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Subdomain</label>
                          <input
                            type="text"
                            value={site.subdomain || ''}
                            onChange={(e) => updateSiteField('subdomain', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    {/* SEO / Meta Description */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">SEO Settings</h3>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Meta Description</label>
                        <textarea
                          rows={3}
                          value={settings.metaDescription || ''}
                          onChange={(e) => updateSettingsField('metaDescription', e.target.value)}
                          maxLength={160}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                          placeholder="A compelling description of your site for search engines and social sharing..."
                        />
                        <div className="flex justify-between mt-2">
                          <p className="text-xs text-gray-500">This appears in search results and when articles are shared on social media</p>
                          <p className={`text-xs ${(settings.metaDescription?.length || 0) > 155 ? 'text-yellow-400' : 'text-gray-500'}`}>
                            {settings.metaDescription?.length || 0}/160
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Brand Profile */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Brand Profile</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Brand Name</label>
                          <input
                            type="text"
                            value={brand.name || ''}
                            onChange={(e) => updateBrandField('name', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Tagline</label>
                          <input
                            type="text"
                            value={brand.tagline || ''}
                            onChange={(e) => updateBrandField('tagline', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-300 mb-2">Bio / Description</label>
                          <textarea
                            rows={4}
                            value={brand.bio || ''}
                            onChange={(e) => updateBrandField('bio', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Brand Images */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Brand Images</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {[
                          { id: 'logo', label: 'Logo', desc: 'Site header', field: brand.logoImage },
                          { id: 'author', label: 'Author', desc: 'Article pages', field: brand.authorImage },
                          { id: 'sidebar', label: 'Sidebar', desc: 'Credibility panel', field: brand.sidebarImage },
                          { id: 'about', label: 'About', desc: 'About page', field: brand.aboutImage },
                        ].map((img) => (
                          <div key={img.id} className="bg-gray-700/50 rounded-xl p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {img.field ? (
                                  <img src={img.field} alt="" className="w-12 h-12 rounded-xl object-cover" />
                                ) : (
                                  <div className="w-12 h-12 rounded-xl bg-gray-600 flex items-center justify-center">
                                    <User className="w-6 h-6 text-gray-400" />
                                  </div>
                                )}
                                <div>
                                  <p className="font-medium text-white">{img.label}</p>
                                  <p className="text-sm text-gray-400">{img.desc}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => { setMediaTarget(img.id); setShowMediaLibrary(true); }}
                                className="px-3 py-1.5 bg-gray-600 hover:bg-gray-500 text-gray-200 rounded-lg text-sm font-medium transition-all"
                              >
                                {img.field ? 'Change' : 'Upload'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Audio Messages */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Audio Messages</h3>
                      <p className="text-sm text-gray-400 mb-4">Add personal audio messages to different sections of your site.</p>
                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Sidebar Audio */}
                        <div className="bg-gray-700/50 rounded-xl p-4">
                          <label className="block text-sm font-medium text-gray-300 mb-1">Sidebar Audio</label>
                          <p className="text-xs text-gray-500 mb-3">Plays in the credibility sidebar panel</p>
                          {settings.audioUrl ? (
                            <div className="space-y-3">
                              <audio controls className="w-full h-10" src={settings.audioUrl}>
                                Your browser does not support audio.
                              </audio>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => { setMediaTarget('audio'); setShowMediaLibrary(true); }}
                                  className="px-3 py-1.5 bg-gray-600 hover:bg-gray-500 text-gray-200 rounded-lg text-sm font-medium transition-all"
                                >
                                  Change
                                </button>
                                <button
                                  onClick={() => updateSettingsField('audioUrl', undefined)}
                                  className="px-3 py-1.5 bg-gray-600 hover:bg-red-600 text-gray-300 hover:text-white rounded-lg text-sm font-medium transition-all"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setMediaTarget('audio'); setShowMediaLibrary(true); }}
                              className="flex items-center gap-3 w-full p-3 bg-gray-700 rounded-lg border-2 border-dashed border-gray-600 hover:border-primary-500 transition-colors"
                            >
                              <Upload className="w-5 h-5 text-gray-400" />
                              <div className="text-left">
                                <p className="text-sm font-medium text-gray-300">Select audio</p>
                                <p className="text-xs text-gray-500">From Media Library</p>
                              </div>
                            </button>
                          )}
                        </div>

                        {/* About Page Audio */}
                        <div className="bg-gray-700/50 rounded-xl p-4">
                          <label className="block text-sm font-medium text-gray-300 mb-1">About Page Audio</label>
                          <p className="text-xs text-gray-500 mb-3">Plays on the About page</p>
                          {settings.aboutAudioUrl ? (
                            <div className="space-y-3">
                              <audio controls className="w-full h-10" src={settings.aboutAudioUrl}>
                                Your browser does not support audio.
                              </audio>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => { setMediaTarget('aboutAudio'); setShowMediaLibrary(true); }}
                                  className="px-3 py-1.5 bg-gray-600 hover:bg-gray-500 text-gray-200 rounded-lg text-sm font-medium transition-all"
                                >
                                  Change
                                </button>
                                <button
                                  onClick={() => updateSettingsField('aboutAudioUrl', undefined)}
                                  className="px-3 py-1.5 bg-gray-600 hover:bg-red-600 text-gray-300 hover:text-white rounded-lg text-sm font-medium transition-all"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setMediaTarget('aboutAudio'); setShowMediaLibrary(true); }}
                              className="flex items-center gap-3 w-full p-3 bg-gray-700 rounded-lg border-2 border-dashed border-gray-600 hover:border-primary-500 transition-colors"
                            >
                              <Upload className="w-5 h-5 text-gray-400" />
                              <div className="text-left">
                                <p className="text-sm font-medium text-gray-300">Select audio</p>
                                <p className="text-xs text-gray-500">From Media Library</p>
                              </div>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Lead Magnet PDF */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Lead Magnet PDF</h3>
                      <p className="text-sm text-gray-400 mb-4">Upload a PDF that will be delivered to users when they sign up via popups or email capture forms.</p>
                      <div className="bg-gray-700/50 rounded-xl p-4 max-w-md">
                        <label className="block text-sm font-medium text-gray-300 mb-1">Wellness Guide / Lead Magnet</label>
                        <p className="text-xs text-gray-500 mb-3">This PDF will be automatically downloaded when users submit their email</p>
                        {settings.leadMagnetPdfUrl ? (
                          <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg border border-gray-600">
                              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-200 truncate">Lead Magnet PDF</p>
                                <p className="text-xs text-gray-500 truncate">{settings.leadMagnetPdfUrl}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => { setMediaTarget('leadMagnetPdf'); setShowMediaLibrary(true); }}
                                className="px-3 py-1.5 bg-gray-600 hover:bg-gray-500 text-gray-200 rounded-lg text-sm font-medium transition-all"
                              >
                                Change
                              </button>
                              <button
                                onClick={() => updateSettingsField('leadMagnetPdfUrl', undefined)}
                                className="px-3 py-1.5 bg-gray-600 hover:bg-red-600 text-gray-300 hover:text-white rounded-lg text-sm font-medium transition-all"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setMediaTarget('leadMagnetPdf'); setShowMediaLibrary(true); }}
                            className="flex items-center gap-3 w-full p-3 bg-gray-700 rounded-lg border-2 border-dashed border-gray-600 hover:border-primary-500 transition-colors"
                          >
                            <Upload className="w-5 h-5 text-gray-400" />
                            <div className="text-left">
                              <p className="text-sm font-medium text-gray-300">Select PDF</p>
                              <p className="text-xs text-gray-500">From Media Library</p>
                            </div>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Appearance */}
                {settingsSubTab === 'appearance' && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Theme</h3>
                      <div className="grid md:grid-cols-4 gap-4">
                        {['medical', 'wellness', 'clinical', 'lifestyle'].map((themeName) => (
                          <button
                            key={themeName}
                            onClick={() => updateSiteField('theme', themeName)}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              site.theme === themeName
                                ? 'border-primary-500 bg-primary-500/10'
                                : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                            }`}
                          >
                            <div className="h-16 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg mb-3"></div>
                            <p className="font-medium text-white capitalize">{themeName}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Colors</h3>
                      <div className="grid md:grid-cols-3 gap-6">
                        {[
                          { id: 'primaryColor', label: 'Primary', default: '#ec4899' },
                          { id: 'secondaryColor', label: 'Secondary', default: '#9333ea' },
                          { id: 'accentColor', label: 'Accent', default: '#ef4444' },
                        ].map((color) => (
                          <div key={color.id}>
                            <label className="block text-sm font-medium text-gray-300 mb-2">{color.label}</label>
                            <div className="flex items-center gap-3">
                              <input
                                type="color"
                                value={theme[color.id] || color.default}
                                onChange={(e) => updateThemeField(color.id, e.target.value)}
                                className="w-14 h-12 rounded-lg border border-gray-600 cursor-pointer"
                              />
                              <input
                                type="text"
                                value={theme[color.id] || color.default}
                                onChange={(e) => updateThemeField(color.id, e.target.value)}
                                className="flex-1 px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 font-mono text-sm"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Advanced */}
                {settingsSubTab === 'advanced' && (
                  <div className="space-y-8">
                    {/* Site Status */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Site Status</h3>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => updateSiteField('status', 'published')}
                          className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                            site.status === 'published'
                              ? 'border-green-500 bg-green-500/10'
                              : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${site.status === 'published' ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                            <span className="font-medium text-white">Published (Live)</span>
                          </div>
                        </button>
                        <button
                          onClick={() => updateSiteField('status', 'draft')}
                          className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                            site.status === 'draft'
                              ? 'border-yellow-500 bg-yellow-500/10'
                              : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${site.status === 'draft' ? 'bg-yellow-400' : 'bg-gray-500'}`}></div>
                            <span className="font-medium text-white">Draft (Hidden)</span>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Domain */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Custom Domain</h3>
                      <div className="max-w-md">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Domain</label>
                        <input
                          type="text"
                          value={site.domain || ''}
                          onChange={(e) => updateSiteField('domain', e.target.value)}
                          placeholder="www.example.com"
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-2">Add your own domain to replace the default subdomain URL</p>
                      </div>
                    </div>

                    {/* Meta/Facebook Pixel */}
                    <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">Meta Pixel</h3>
                            <p className="text-sm text-gray-400">Track conversions and build audiences</p>
                          </div>
                        </div>
                        <button
                          onClick={() => updateSettingsField('analytics', {
                            ...settings.analytics,
                            metaPixelEnabled: !settings.analytics?.metaPixelEnabled
                          })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            settings.analytics?.metaPixelEnabled ? 'bg-green-500' : 'bg-gray-600'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.analytics?.metaPixelEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Pixel ID</label>
                          <input
                            type="text"
                            value={settings.analytics?.metaPixelId || ''}
                            onChange={(e) => updateSettingsField('analytics', { ...settings.analytics, metaPixelId: e.target.value })}
                            placeholder="123456789012345"
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono"
                          />
                          <p className="text-xs text-gray-500 mt-2">Find this in Meta Events Manager → Data Sources → Your Pixel</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Domain Verification Code</label>
                          <input
                            type="text"
                            value={settings.analytics?.metaDomainVerification || ''}
                            onChange={(e) => updateSettingsField('analytics', { ...settings.analytics, metaDomainVerification: e.target.value })}
                            placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono"
                          />
                          <p className="text-xs text-gray-500 mt-2">
                            Find this in Meta Business Settings → Brand Safety → Domains → Add → Meta-tag Verification
                          </p>
                        </div>

                        {settings.analytics?.metaDomainVerification && (
                          <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
                            <div className="flex items-center gap-2 mb-2">
                              <Check className="w-4 h-4 text-green-400" />
                              <span className="text-sm font-medium text-green-400">Verification code configured</span>
                            </div>
                            <p className="text-xs text-gray-400 mb-3">
                              The following meta tag will be added to your site's &lt;head&gt;:
                            </p>
                            <code className="block bg-gray-900 p-3 rounded-lg text-xs text-gray-300 overflow-x-auto">
                              &lt;meta name="facebook-domain-verification" content="{settings.analytics.metaDomainVerification}" /&gt;
                            </code>
                            <p className="text-xs text-gray-500 mt-3">
                              Save changes and verify in Meta Business Manager to complete domain verification.
                            </p>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t border-gray-600">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="metaTestMode"
                              checked={settings.analytics?.metaTestMode || false}
                              onChange={(e) => updateSettingsField('analytics', {
                                ...settings.analytics,
                                metaTestMode: e.target.checked
                              })}
                              className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-primary-500 focus:ring-primary-500"
                            />
                            <label htmlFor="metaTestMode" className="text-sm text-gray-300">
                              Test Mode
                            </label>
                          </div>
                          <span className="text-xs text-gray-500">
                            Enables console logging without loading pixel
                          </span>
                        </div>
                      </div>

                      {/* Status indicator */}
                      <div className="mt-6 pt-4 border-t border-gray-600">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            settings.analytics?.metaPixelEnabled && settings.analytics?.metaPixelId
                              ? 'bg-green-400 animate-pulse'
                              : 'bg-gray-500'
                          }`} />
                          <span className={`text-sm ${
                            settings.analytics?.metaPixelEnabled && settings.analytics?.metaPixelId
                              ? 'text-green-400'
                              : 'text-gray-500'
                          }`}>
                            {settings.analytics?.metaPixelEnabled && settings.analytics?.metaPixelId
                              ? 'Pixel is active and tracking'
                              : settings.analytics?.metaPixelId
                                ? 'Pixel configured but disabled'
                                : 'Pixel not configured'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Google Analytics */}
                    <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center">
                            <svg className="w-5 h-5 text-orange-400" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">Google Analytics</h3>
                            <p className="text-sm text-gray-400">Website traffic and user behavior</p>
                          </div>
                        </div>
                        <button
                          onClick={() => updateSettingsField('analytics', {
                            ...settings.analytics,
                            googleEnabled: !settings.analytics?.googleEnabled
                          })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            settings.analytics?.googleEnabled ? 'bg-green-500' : 'bg-gray-600'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.analytics?.googleEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Measurement ID</label>
                          <input
                            type="text"
                            value={settings.analytics?.googleId || ''}
                            onChange={(e) => updateSettingsField('analytics', { ...settings.analytics, googleId: e.target.value })}
                            placeholder="G-XXXXXXXXXX"
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono"
                          />
                          <p className="text-xs text-gray-500 mt-2">
                            Find this in Google Analytics → Admin → Data Streams → Your Stream
                          </p>
                        </div>

                        {/* Status indicator */}
                        <div className="pt-4 border-t border-gray-600">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${
                              settings.analytics?.googleEnabled && settings.analytics?.googleId
                                ? 'bg-green-400 animate-pulse'
                                : 'bg-gray-500'
                            }`} />
                            <span className={`text-sm ${
                              settings.analytics?.googleEnabled && settings.analytics?.googleId
                                ? 'text-green-400'
                                : 'text-gray-500'
                            }`}>
                              {settings.analytics?.googleEnabled && settings.analytics?.googleId
                                ? 'Google Analytics is active'
                                : settings.analytics?.googleId
                                  ? 'Analytics configured but disabled'
                                  : 'Analytics not configured'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PAGES TAB */}
          {activeTab === 'pages' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Page Management</h2>
                  <p className="text-gray-400 text-sm mt-1">Enable, disable, and configure pages for your site</p>
                </div>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="btn-primary flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

              {/* Navigation Order */}
              <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                <div className="p-5 border-b border-gray-700">
                  <h3 className="text-lg font-semibold text-white">Navigation Pages</h3>
                  <p className="text-sm text-gray-400 mt-1">Pages that appear in your site navigation</p>
                </div>
                <div className="divide-y divide-gray-700/50">
                  {pageConfig.pages
                    .filter((p: any) => p.enabled)
                    .sort((a: any, b: any) => a.navOrder - b.navOrder)
                    .map((page: any) => (
                      <div key={page.id} className="flex items-center gap-4 p-4 hover:bg-gray-750">
                        <GripVertical className="w-5 h-5 text-gray-500 cursor-grab" />
                        <div className="flex-1">
                          <p className="font-medium text-white">{page.title}</p>
                          <p className="text-sm text-gray-500">{page.slug}</p>
                        </div>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={page.showInNav}
                            onChange={(e) => {
                              const updated = pageConfig.pages.map((p: any) =>
                                p.id === page.id ? { ...p, showInNav: e.target.checked } : p
                              );
                              setPageConfig({ ...pageConfig, pages: updated });
                            }}
                            className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-primary-500"
                          />
                          <span className="text-sm text-gray-300">Show in Nav</span>
                        </label>
                        <select
                          value={page.navMode}
                          onChange={(e) => {
                            const updated = pageConfig.pages.map((p: any) =>
                              p.id === page.id ? { ...p, navMode: e.target.value } : p
                            );
                            setPageConfig({ ...pageConfig, pages: updated });
                          }}
                          className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 text-sm"
                        >
                          <option value="global">Global Nav</option>
                          <option value="direct-response">Direct Response</option>
                          <option value="minimal">Minimal</option>
                        </select>
                      </div>
                    ))}
                </div>
              </div>

              {/* Disabled Pages */}
              <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                <div className="p-5 border-b border-gray-700">
                  <h3 className="text-lg font-semibold text-white">Available Pages</h3>
                  <p className="text-sm text-gray-400 mt-1">Enable additional pages for your site</p>
                </div>
                <div className="divide-y divide-gray-700/50">
                  {pageConfig.pages
                    .filter((p: any) => !p.enabled)
                    .map((page: any) => (
                      <div key={page.id} className="flex items-center justify-between p-4 hover:bg-gray-750">
                        <div>
                          <p className="font-medium text-gray-400">{page.title}</p>
                          <p className="text-sm text-gray-500">{page.slug}</p>
                        </div>
                        <button
                          onClick={() => {
                            const updated = pageConfig.pages.map((p: any) =>
                              p.id === page.id ? { ...p, enabled: true, showInNav: true } : p
                            );
                            setPageConfig({ ...pageConfig, pages: updated });
                          }}
                          className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-medium"
                        >
                          Enable
                        </button>
                      </div>
                    ))}
                </div>
              </div>

              {/* Article Nav Mode */}
              <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Article Pages</h3>
                <p className="text-sm text-gray-400 mb-4">Configure the default navigation mode for all article pages</p>
                <select
                  value={pageConfig.defaultArticleNavMode}
                  onChange={(e) => setPageConfig({ ...pageConfig, defaultArticleNavMode: e.target.value })}
                  className="px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-gray-200"
                >
                  <option value="global">Global Nav (full navigation)</option>
                  <option value="direct-response">Direct Response (no links, social proof)</option>
                  <option value="minimal">Minimal (logo only)</option>
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  Direct Response is recommended for conversion-focused articles
                </p>
              </div>
            </div>
          )}

          {/* EMAILS TAB */}
          {activeTab === 'emails' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Email Subscribers</h2>
                  <p className="text-gray-400 text-sm mt-1">{subscriberStats.total || 0} total subscribers</p>
                </div>
                <button
                  onClick={exportEmails}
                  className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl transition-all text-sm font-medium"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
                  <p className="text-gray-400 text-sm">Total Subscribers</p>
                  <p className="text-3xl font-bold text-white mt-1">{subscriberStats.total || 0}</p>
                </div>
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
                  <p className="text-gray-400 text-sm">This Week</p>
                  <p className="text-3xl font-bold text-green-400 mt-1">{subscriberStats.thisWeek || 0}</p>
                </div>
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
                  <p className="text-gray-400 text-sm">This Month</p>
                  <p className="text-3xl font-bold text-blue-400 mt-1">{subscriberStats.thisMonth || 0}</p>
                </div>
              </div>

              {/* Subscribers List */}
              <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                <div className="p-5 border-b border-gray-700">
                  <h3 className="text-lg font-semibold text-white">Recent Subscribers</h3>
                </div>
                <div className="divide-y divide-gray-700/50 max-h-96 overflow-y-auto">
                  {subscribers.length > 0 ? (
                    subscribers.slice(0, 50).map((sub: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-500/10 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary-400" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{sub.email}</p>
                            <p className="text-sm text-gray-500">
                              {sub.source || 'Direct'} • {formatDistanceToNow(new Date(sub.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-12 text-center">
                      <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">No subscribers yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ANALYTICS TAB */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Analytics Overview</h2>
                <p className="text-gray-400 text-sm mt-1">Site performance and traffic metrics</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
                  <p className="text-gray-400 text-sm">Total Views</p>
                  <p className="text-3xl font-bold text-white mt-1">{metrics?.totalViews?.toLocaleString() || 0}</p>
                </div>
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
                  <p className="text-gray-400 text-sm">Articles</p>
                  <p className="text-3xl font-bold text-white mt-1">{metrics?.totalArticles || 0}</p>
                </div>
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
                  <p className="text-gray-400 text-sm">Published</p>
                  <p className="text-3xl font-bold text-green-400 mt-1">{metrics?.publishedArticles || 0}</p>
                </div>
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
                  <p className="text-gray-400 text-sm">Subscribers</p>
                  <p className="text-3xl font-bold text-purple-400 mt-1">{metrics?.totalEmails || 0}</p>
                </div>
              </div>

              {/* Top Articles */}
              <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                <div className="p-5 border-b border-gray-700">
                  <h3 className="text-lg font-semibold text-white">Top Performing Articles</h3>
                </div>
                <div className="divide-y divide-gray-700/50">
                  {articles
                    .sort((a, b) => (b.views || 0) - (a.views || 0))
                    .slice(0, 10)
                    .map((article, i) => (
                      <div key={article.id} className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                          <span className="text-2xl font-bold text-gray-600 w-8">{i + 1}</span>
                          <div>
                            <p className="text-white font-medium">{article.title}</p>
                            <p className="text-sm text-gray-500">
                              {article.published ? 'Published' : 'Draft'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-white">{(article.views || 0).toLocaleString()}</p>
                          <p className="text-sm text-gray-500">views</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Tracking Status */}
              <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Tracking Status</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-700/50 rounded-xl">
                    <div className={`w-3 h-3 rounded-full ${settings.analytics?.metaPixelEnabled && settings.analytics?.metaPixelId ? 'bg-green-400' : 'bg-gray-500'}`} />
                    <div>
                      <p className="font-medium text-white">Meta Pixel</p>
                      <p className="text-sm text-gray-400">
                        {settings.analytics?.metaPixelEnabled && settings.analytics?.metaPixelId ? 'Active' : 'Not configured'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-700/50 rounded-xl">
                    <div className={`w-3 h-3 rounded-full ${settings.analytics?.googleEnabled && settings.analytics?.googleId ? 'bg-green-400' : 'bg-gray-500'}`} />
                    <div>
                      <p className="font-medium text-white">Google Analytics</p>
                      <p className="text-sm text-gray-400">
                        {settings.analytics?.googleEnabled && settings.analytics?.googleId ? 'Active' : 'Not configured'}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('settings')}
                  className="mt-4 text-primary-400 hover:text-primary-300 text-sm font-medium"
                >
                  Configure tracking in Settings →
                </button>
              </div>
            </div>
          )}

          {/* CONTENT PROFILE TAB */}
          {activeTab === 'content-profile' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Content Profile</h2>
                  <p className="text-gray-400 text-sm mt-1">Editorial guidelines for consistent AI-generated content</p>
                </div>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="btn-primary flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>

              {/* Mission & Purpose */}
              <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                <button
                  onClick={() => toggleSection('mission')}
                  className="w-full flex items-center justify-between p-5 hover:bg-gray-750"
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-primary-400" />
                    <div className="text-left">
                      <h3 className="font-semibold text-white">Mission & Purpose</h3>
                      <p className="text-sm text-gray-400">Define what this site is about</p>
                    </div>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${openSections.has('mission') ? 'rotate-180' : ''}`} />
                </button>
                {openSections.has('mission') && (
                  <div className="px-5 pb-5 space-y-4 border-t border-gray-700 pt-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Site Mission</label>
                      <textarea
                        rows={3}
                        value={contentProfile.mission}
                        onChange={(e) => setContentProfile(p => ({ ...p, mission: e.target.value }))}
                        placeholder="This site helps..."
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-gray-200 resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Unique Value</label>
                      <textarea
                        rows={2}
                        value={contentProfile.uniqueValue}
                        onChange={(e) => setContentProfile(p => ({ ...p, uniqueValue: e.target.value }))}
                        placeholder="What makes this brand different..."
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-gray-200 resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Target Audience */}
              <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                <button
                  onClick={() => toggleSection('audience')}
                  className="w-full flex items-center justify-between p-5 hover:bg-gray-750"
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-primary-400" />
                    <div className="text-left">
                      <h3 className="font-semibold text-white">Target Audience</h3>
                      <p className="text-sm text-gray-400">Who you're writing for</p>
                    </div>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${openSections.has('audience') ? 'rotate-180' : ''}`} />
                </button>
                {openSections.has('audience') && (
                  <div className="px-5 pb-5 space-y-4 border-t border-gray-700 pt-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Demographics</label>
                      <input
                        type="text"
                        value={contentProfile.audience.demographics}
                        onChange={(e) => setContentProfile(p => ({ ...p, audience: { ...p.audience, demographics: e.target.value } }))}
                        placeholder="Women 40-65, health-conscious..."
                        className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-gray-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">How They Talk About Problems</label>
                      <textarea
                        rows={2}
                        value={contentProfile.audience.language}
                        onChange={(e) => setContentProfile(p => ({ ...p, audience: { ...p.audience, language: e.target.value } }))}
                        placeholder="They say things like..."
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-gray-200 resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Writing Style */}
              <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                <button
                  onClick={() => toggleSection('style')}
                  className="w-full flex items-center justify-between p-5 hover:bg-gray-750"
                >
                  <div className="flex items-center gap-3">
                    <Edit3 className="w-5 h-5 text-primary-400" />
                    <div className="text-left">
                      <h3 className="font-semibold text-white">Writing Style</h3>
                      <p className="text-sm text-gray-400">Tone, voice, and personality</p>
                    </div>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${openSections.has('style') ? 'rotate-180' : ''}`} />
                </button>
                {openSections.has('style') && (
                  <div className="px-5 pb-5 space-y-4 border-t border-gray-700 pt-5">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Tone</label>
                        <input
                          type="text"
                          value={contentProfile.style.tone}
                          onChange={(e) => setContentProfile(p => ({ ...p, style: { ...p.style, tone: e.target.value } }))}
                          placeholder="Warm, authoritative, empathetic"
                          className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-gray-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Voice</label>
                        <input
                          type="text"
                          value={contentProfile.style.voice}
                          onChange={(e) => setContentProfile(p => ({ ...p, style: { ...p.style, voice: e.target.value } }))}
                          placeholder="Like a trusted friend..."
                          className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-gray-200"
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Perspective</label>
                        <select
                          value={contentProfile.style.perspective}
                          onChange={(e) => setContentProfile(p => ({ ...p, style: { ...p.style, perspective: e.target.value as 'first' | 'third' } }))}
                          className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-gray-200"
                        >
                          <option value="first">First Person ("I recommend...")</option>
                          <option value="third">Third Person ("Dr. Amy recommends...")</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Reading Level</label>
                        <select
                          value={contentProfile.style.readingLevel}
                          onChange={(e) => setContentProfile(p => ({ ...p, style: { ...p.style, readingLevel: e.target.value } }))}
                          className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-gray-200"
                        >
                          <option value="6th grade">6th Grade (Very Simple)</option>
                          <option value="8th grade">8th Grade (Accessible)</option>
                          <option value="10th grade">10th Grade (Moderate)</option>
                          <option value="College">College Level (Advanced)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Content Rules */}
              <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                <button
                  onClick={() => toggleSection('rules')}
                  className="w-full flex items-center justify-between p-5 hover:bg-gray-750"
                >
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-primary-400" />
                    <div className="text-left">
                      <h3 className="font-semibold text-white">Content Rules</h3>
                      <p className="text-sm text-gray-400">What to always and never do</p>
                    </div>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${openSections.has('rules') ? 'rotate-180' : ''}`} />
                </button>
                {openSections.has('rules') && (
                  <div className="px-5 pb-5 space-y-4 border-t border-gray-700 pt-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">How to Mention Products</label>
                      <textarea
                        rows={2}
                        value={contentProfile.rules.productMentions}
                        onChange={(e) => setContentProfile(p => ({ ...p, rules: { ...p.rules, productMentions: e.target.value } }))}
                        placeholder="Products should be mentioned naturally..."
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-gray-200 resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Topics */}
              <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                <button
                  onClick={() => toggleSection('topics')}
                  className="w-full flex items-center justify-between p-5 hover:bg-gray-750"
                >
                  <div className="flex items-center gap-3">
                    <Tag className="w-5 h-5 text-primary-400" />
                    <div className="text-left">
                      <h3 className="font-semibold text-white">Topics & Expertise</h3>
                      <p className="text-sm text-gray-400">Primary and secondary topics</p>
                    </div>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${openSections.has('topics') ? 'rotate-180' : ''}`} />
                </button>
                {openSections.has('topics') && (
                  <div className="px-5 pb-5 space-y-4 border-t border-gray-700 pt-5">
                    <p className="text-sm text-gray-400">Add topics as comma-separated values</p>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Primary Topics</label>
                      <input
                        type="text"
                        value={contentProfile.topics.primary.join(', ')}
                        onChange={(e) => setContentProfile(p => ({
                          ...p,
                          topics: { ...p.topics, primary: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }
                        }))}
                        placeholder="Hormone health, Menopause, Perimenopause"
                        className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-gray-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Secondary Topics</label>
                      <input
                        type="text"
                        value={contentProfile.topics.secondary.join(', ')}
                        onChange={(e) => setContentProfile(p => ({
                          ...p,
                          topics: { ...p.topics, secondary: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }
                        }))}
                        placeholder="Sleep, Stress, Weight management"
                        className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-gray-200"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Products */}
              <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                <button
                  onClick={() => toggleSection('products')}
                  className="w-full flex items-center justify-between p-5 hover:bg-gray-750"
                >
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-primary-400" />
                    <div className="text-left">
                      <h3 className="font-semibold text-white">Products & Affiliates</h3>
                      <p className="text-sm text-gray-400">Products to promote</p>
                    </div>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${openSections.has('products') ? 'rotate-180' : ''}`} />
                </button>
                {openSections.has('products') && (
                  <div className="px-5 pb-5 space-y-4 border-t border-gray-700 pt-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Primary Products (comma-separated)</label>
                      <input
                        type="text"
                        value={contentProfile.products.primary.join(', ')}
                        onChange={(e) => setContentProfile(p => ({
                          ...p,
                          products: { ...p.products, primary: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }
                        }))}
                        placeholder="Product A, Product B"
                        className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-gray-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Affiliate Disclosure</label>
                      <textarea
                        rows={2}
                        value={contentProfile.products.disclosureText}
                        onChange={(e) => setContentProfile(p => ({ ...p, products: { ...p.products, disclosureText: e.target.value } }))}
                        placeholder="This article contains affiliate links..."
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-gray-200 resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Media Library Modal */}
        <MediaLibrary
          isOpen={showMediaLibrary}
          onClose={() => { setShowMediaLibrary(false); setMediaTarget(null); }}
          onSelect={handleMediaSelect}
          siteId={id}
          initialFilter={mediaTarget === 'audio' || mediaTarget === 'aboutAudio' ? 'audio' : mediaTarget === 'leadMagnetPdf' ? 'document' : 'image'}
        />
      </div>
    </EnhancedAdminLayout>
  );
}
