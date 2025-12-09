'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
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
  Package,
  Layers,
  Zap,
  Mail,
  Calendar,
  RefreshCw,
  RotateCcw,
  CheckSquare,
  Square,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Navigation
} from 'lucide-react';
import { ContentProfile, DEFAULT_CONTENT_PROFILE } from '@/types';
import EnhancedAdminLayout from '@/components/admin/EnhancedAdminLayout';
import Badge from '@/components/ui/Badge';
import MediaLibrary from '@/components/admin/MediaLibrary';
import { formatDistanceToNow } from 'date-fns';
import { clientAPI } from '@/lib/api';

type TabType = 'overview' | 'articles' | 'pages' | 'emails' | 'analytics' | 'content-profile' | 'settings';
type SettingsSubTab = 'content' | 'navigation' | 'appearance' | 'advanced';
type ArticlesSubTab = 'boosted' | 'all' | 'drafts';

export default function SiteDashboard() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [site, setSite] = useState<any>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Articles state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [articlesSubTab, setArticlesSubTab] = useState<ArticlesSubTab>('boosted');

  // Settings state
  const [settingsSubTab, setSettingsSubTab] = useState<SettingsSubTab>('content');
  const [isSaving, setIsSaving] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showDeleteSiteModal, setShowDeleteSiteModal] = useState(false);
  const [deleteSiteLoading, setDeleteSiteLoading] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Emails state
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [subscriberStats, setSubscriberStats] = useState<any>({});
  const [emailsSubTab, setEmailsSubTab] = useState<'active' | 'unsubscribed'>('active');
  const [emailSearch, setEmailSearch] = useState('');
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [emailsLoading, setEmailsLoading] = useState(false);
  const [emailDateFilter, setEmailDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'quarter'>('all');
  const [emailSourceFilter, setEmailSourceFilter] = useState<'all' | 'pdf_downloads' | 'other'>('all');
  const [emailSortField, setEmailSortField] = useState<'email' | 'created_at'>('created_at');
  const [emailSortDir, setEmailSortDir] = useState<'asc' | 'desc'>('desc');

  // Content Profile state
  const [contentProfile, setContentProfile] = useState<ContentProfile>(DEFAULT_CONTENT_PROFILE);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['mission']));

  // Pages state
  const [pagesSubTab, setPagesSubTab] = useState<'pages' | 'navigation'>('pages');
  const [navTemplates, setNavTemplates] = useState<any[]>([]);
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
  const [dbPages, setDbPages] = useState<any[]>([]); // Actual pages from database with widget_config
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editingPageName, setEditingPageName] = useState('');
  const [draggedPage, setDraggedPage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [siteResponse, articlesData, subscribersResponse, pagesData, navTemplatesData] = await Promise.all([
        fetch(`/api/sites/${id}`).then(res => res.json()),
        fetch(`/api/articles?siteId=${id}&published=false&includeRealViews=true`).then(res => res.json()).then(data => data.articles || []),
        fetch(`/api/subscribers?siteId=${id}`).then(res => res.json()).catch(() => ({ stats: { total: 0 }, subscribers: [] })),
        fetch(`/api/pages?siteId=${id}`).then(res => res.json()).catch(() => []),
        fetch('/api/navigation-templates').then(res => res.json()).catch(() => ({ templates: [] }))
      ]);

      // Set navigation templates
      setNavTemplates(navTemplatesData?.templates || []);

      // Store database pages for widget counts
      setDbPages(pagesData || []);

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
        totalViews: articlesData?.reduce((sum: number, a: any) => sum + (a.realViews || 0), 0) || 0,
        totalEmails: subscribersResponse?.stats?.active || 0  // Only count active emails
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

  // Handle URL query params for tab navigation
  useEffect(() => {
    const tabParam = searchParams.get('tab') as TabType | null;
    const subtabParam = searchParams.get('subtab') as ArticlesSubTab | null;

    if (tabParam && ['overview', 'articles', 'pages', 'emails', 'analytics', 'content-profile', 'settings'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
    if (subtabParam && tabParam === 'articles' && ['boosted', 'all', 'drafts'].includes(subtabParam)) {
      setArticlesSubTab(subtabParam);
    }
  }, [searchParams]);

  // Separate function to reload subscribers only
  const loadSubscribers = async () => {
    try {
      const subscribersResponse = await fetch(`/api/subscribers?siteId=${id}`).then(res => res.json()).catch(() => ({ stats: { total: 0 }, subscribers: [] }));
      setSubscribers(subscribersResponse?.subscribers || []);
      setSubscriberStats(subscribersResponse?.stats || { total: 0 });
    } catch (error) {
      console.error('Error loading subscribers:', error);
    }
  };

  // Toggle article published status
  const togglePublished = async (articleId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !currentStatus })
      });

      if (response.ok) {
        // Update local state
        setArticles(prev => prev.map(a =>
          a.id === articleId ? { ...a, published: !currentStatus } : a
        ));
        // Update metrics
        setMetrics((prev: { totalArticles: number; publishedArticles: number; totalViews: number; totalEmails: number }) => ({
          ...prev,
          publishedArticles: !currentStatus
            ? prev.publishedArticles + 1
            : prev.publishedArticles - 1
        }));
      }
    } catch (error) {
      console.error('Error toggling article status:', error);
    }
  };

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

  // Delete site handler
  const handleDeleteSite = async () => {
    if (deleteConfirmText !== site?.name) return;

    setDeleteSiteLoading(true);
    try {
      const response = await fetch(`/api/sites/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Navigate to sites list
        router.push('/admin/sites');
      } else {
        alert('Error deleting site');
      }
    } catch (error) {
      console.error('Error deleting site:', error);
      alert('Error deleting site');
    } finally {
      setDeleteSiteLoading(false);
      setShowDeleteSiteModal(false);
      setDeleteConfirmText('');
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

  // Page management helpers
  const startEditingPageName = (page: any) => {
    setEditingPageId(page.id);
    setEditingPageName(page.navLabel || page.title);
  };

  const savePageName = () => {
    if (!editingPageId || !editingPageName.trim()) {
      setEditingPageId(null);
      return;
    }
    const updated = pageConfig.pages.map((p: any) =>
      p.id === editingPageId ? { ...p, navLabel: editingPageName.trim(), title: editingPageName.trim() } : p
    );
    setPageConfig({ ...pageConfig, pages: updated });
    setEditingPageId(null);
    setEditingPageName('');
  };

  const togglePageVisibility = (pageId: string) => {
    const updated = pageConfig.pages.map((p: any) => {
      if (p.id === pageId) {
        const newShowInNav = !p.showInNav;
        return { ...p, showInNav: newShowInNav, enabled: newShowInNav ? true : p.enabled };
      }
      return p;
    });
    setPageConfig({ ...pageConfig, pages: updated });
  };

  const handleDragStart = (pageId: string) => {
    setDraggedPage(pageId);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedPage || draggedPage === targetId) return;
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedPage || draggedPage === targetId) {
      setDraggedPage(null);
      return;
    }

    const pages = [...pageConfig.pages];
    const visiblePages = pages.filter((p: any) => p.enabled && p.showInNav).sort((a: any, b: any) => a.navOrder - b.navOrder);

    const draggedIndex = visiblePages.findIndex((p: any) => p.id === draggedPage);
    const targetIndex = visiblePages.findIndex((p: any) => p.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedPage(null);
      return;
    }

    // Reorder
    const [removed] = visiblePages.splice(draggedIndex, 1);
    visiblePages.splice(targetIndex, 0, removed);

    // Update navOrder for all visible pages
    visiblePages.forEach((page: any, index: number) => {
      page.navOrder = index + 1;
    });

    // Merge back into full pages array
    const updatedPages = pages.map((p: any) => {
      const updated = visiblePages.find((vp: any) => vp.id === p.id);
      return updated || p;
    });

    setPageConfig({ ...pageConfig, pages: updatedPages });
    setDraggedPage(null);
  };

  const updatePageNavMode = (pageId: string, navMode: string) => {
    const updated = pageConfig.pages.map((p: any) =>
      p.id === pageId ? { ...p, navMode } : p
    );
    setPageConfig({ ...pageConfig, pages: updated });
  };

  // Get widget count for a page by matching slug
  const getPageWidgetCount = (pageSlug: string): number => {
    const dbPage = dbPages.find((p: any) => p.slug === pageSlug);
    if (!dbPage?.widget_config) return 0;

    try {
      const widgets = typeof dbPage.widget_config === 'string'
        ? JSON.parse(dbPage.widget_config)
        : dbPage.widget_config;

      return Array.isArray(widgets) ? widgets.filter((w: any) => w.enabled).length : 0;
    } catch {
      return 0;
    }
  };

  // Export emails as CSV
  const exportEmails = () => {
    const toExport = selectedEmails.size > 0
      ? filteredSubscribers.filter(s => selectedEmails.has(s.id))
      : filteredSubscribers;

    const csv = [
      ['Email', 'Name', 'Source', 'Status', 'Subscribed At'],
      ...toExport.map(s => [s.email, s.name || '', s.source || 'unknown', s.status, s.created_at])
    ].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${site?.subdomain || 'site'}-emails-${emailsSubTab}-${new Date().toISOString().split('T')[0]}.csv`;
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

  // PDF download sources for filtering
  const pdfDownloadSources = ['hormone_guide_widget', 'exit_intent_popup', 'community_popup', 'lead_magnet', 'guide_download', 'pdf_download', 'wellness_guide'];
  const isPdfDownload = (sub: any) =>
    pdfDownloadSources.some(src => sub.source?.toLowerCase().includes(src.toLowerCase())) ||
    (sub.tags && JSON.stringify(sub.tags).includes('lead_magnet'));

  // Filtered subscribers by tab, search, date, source, and sorted
  const filteredSubscribers = (() => {
    // First filter
    let result = subscribers.filter(sub => {
      const matchesTab = emailsSubTab === 'active' ? sub.status === 'active' : sub.status !== 'active';
      const matchesSearch = !emailSearch || sub.email.toLowerCase().includes(emailSearch.toLowerCase()) || sub.name?.toLowerCase().includes(emailSearch.toLowerCase());

      // Date filter
      let matchesDate = true;
      if (emailDateFilter !== 'all') {
        const subDate = new Date(sub.created_at);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - subDate.getTime()) / (1000 * 60 * 60 * 24));

        switch (emailDateFilter) {
          case 'today':
            matchesDate = diffDays < 1;
            break;
          case 'week':
            matchesDate = diffDays <= 7;
            break;
          case 'month':
            matchesDate = diffDays <= 30;
            break;
          case 'quarter':
            matchesDate = diffDays <= 90;
            break;
        }
      }

      // Source filter (PDF downloads vs other)
      let matchesSource = true;
      if (emailSourceFilter === 'pdf_downloads') {
        matchesSource = isPdfDownload(sub);
      } else if (emailSourceFilter === 'other') {
        matchesSource = !isPdfDownload(sub);
      }

      return matchesTab && matchesSearch && matchesDate && matchesSource;
    });

    // Then sort
    result.sort((a, b) => {
      let aVal: any, bVal: any;
      if (emailSortField === 'email') {
        aVal = a.email.toLowerCase();
        bVal = b.email.toLowerCase();
      } else {
        aVal = new Date(a.created_at).getTime();
        bVal = new Date(b.created_at).getTime();
      }
      if (aVal < bVal) return emailSortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return emailSortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  })();

  // Email stats
  const activeSubscriberCount = subscribers.filter(s => s.status === 'active').length;
  const unsubscribedCount = subscribers.filter(s => s.status !== 'active').length;

  // Toggle email selection
  const toggleEmailSelection = (id: string) => {
    setSelectedEmails(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectAllEmails = () => {
    setSelectedEmails(new Set(filteredSubscribers.map(s => s.id)));
  };

  const deselectAllEmails = () => {
    setSelectedEmails(new Set());
  };

  // Handle unsubscribe
  const handleUnsubscribe = async (subscriber: any) => {
    if (!confirm('Are you sure you want to unsubscribe this email?')) return;
    try {
      await fetch(`/api/subscribers?siteId=${id}&email=${encodeURIComponent(subscriber.email)}`, { method: 'DELETE' });
      loadSubscribers();
    } catch (error) {
      console.error('Error unsubscribing:', error);
    }
  };

  // Handle resubscribe
  const handleResubscribe = async (subscriber: any) => {
    if (!confirm('Re-subscribe this email?')) return;
    try {
      await fetch(`/api/subscribers/resubscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId: id, email: subscriber.email })
      });
      loadSubscribers();
    } catch (error) {
      console.error('Error resubscribing:', error);
    }
  };

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
  // Count visible pages (enabled + showInNav)
  const visiblePageCount = pageConfig.pages?.filter((p: any) => p.enabled && p.showInNav)?.length || 0;
  const totalPageCount = pageConfig.pages?.length || 0;
  const livePageCount = pageConfig.pages?.filter((p: any) => p.enabled)?.length || 0;
  const draftPageCount = totalPageCount - livePageCount;
  const boostedArticleCount = articles.filter((a: any) => a.boosted).length;

  const tabs: { id: TabType; label: string; icon: any; count?: number; dividerBefore?: boolean }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'pages', label: 'Pages', icon: Layers, count: totalPageCount, dividerBefore: true },
    { id: 'articles', label: 'Articles', icon: Edit3, count: metrics?.totalArticles },
    { id: 'emails', label: 'Emails', icon: Mail, count: metrics?.totalEmails },
    { id: 'content-profile', label: 'Profile', icon: BookOpen },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const settingsTabs = [
    { id: 'content' as SettingsSubTab, label: 'Content & Profile', icon: User },
    { id: 'navigation' as SettingsSubTab, label: 'Navigation', icon: Navigation },
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
                <button
                  onClick={() => {
                    // Navigate to pages tab and trigger new page creation
                    setActiveTab('pages');
                    // Could add state to trigger new page modal
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-xl transition-all text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  New Page
                </button>
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
              {tabs.map((tab, index) => (
                <div key={tab.id} className="flex items-center gap-2">
                  {tab.dividerBefore && (
                    <div className="w-px h-6 bg-gray-600 mx-1" />
                  )}
                  <button
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
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-7xl mx-auto p-6">

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards - Order: Views, Boosted, Pages, Emails, PDF Downloads */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Total Views */}
                <div
                  onClick={() => setActiveTab('analytics')}
                  className="bg-gray-800 rounded-2xl border border-gray-700 p-5 transition-all cursor-pointer hover:border-primary-500 hover:bg-gray-750 hover:shadow-lg hover:shadow-primary-500/10"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Views</p>
                      <p className="text-3xl font-bold text-white mt-1">{metrics?.totalViews?.toLocaleString() || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
                      <Eye className="w-6 h-6 text-purple-400" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">Click to manage →</p>
                </div>

                {/* Boosted Articles */}
                <div
                  onClick={() => setActiveTab('articles')}
                  className="bg-gray-800 rounded-2xl border border-gray-700 p-5 transition-all cursor-pointer hover:border-primary-500 hover:bg-gray-750 hover:shadow-lg hover:shadow-primary-500/10"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Boosted Articles</p>
                      <p className="text-3xl font-bold text-white mt-1">{boostedArticleCount}</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center">
                      <Zap className="w-6 h-6 text-yellow-400" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">Click to manage →</p>
                </div>

                {/* Pages - Custom layout with badges */}
                <div
                  onClick={() => setActiveTab('pages')}
                  className="bg-gray-800 rounded-2xl border border-gray-700 p-5 transition-all cursor-pointer hover:border-primary-500 hover:bg-gray-750 hover:shadow-lg hover:shadow-primary-500/10"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Pages</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                          <span className="text-lg font-bold text-green-400">{livePageCount}</span>
                          <span className="text-xs text-green-400/80">live</span>
                        </span>
                      </div>
                      {draftPageCount > 0 && (
                        <div className="mt-2">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-700/50 border border-gray-600 rounded-full">
                            <span className="text-sm font-medium text-gray-400">{draftPageCount}</span>
                            <span className="text-xs text-gray-500">draft{draftPageCount !== 1 ? 's' : ''}</span>
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center">
                      <Layers className="w-6 h-6 text-indigo-400" />
                    </div>
                  </div>
                </div>

                {/* Total Active Emails */}
                <div
                  onClick={() => setActiveTab('emails')}
                  className="bg-gray-800 rounded-2xl border border-gray-700 p-5 transition-all cursor-pointer hover:border-primary-500 hover:bg-gray-750 hover:shadow-lg hover:shadow-primary-500/10"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Active Emails</p>
                      <p className="text-3xl font-bold text-white mt-1">{subscriberStats?.active || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                      <Mail className="w-6 h-6 text-green-400" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">Click to manage →</p>
                </div>

                {/* PDF Downloads */}
                <div
                  onClick={() => setActiveTab('emails')}
                  className="bg-gray-800 rounded-2xl border border-gray-700 p-5 transition-all cursor-pointer hover:border-primary-500 hover:bg-gray-750 hover:shadow-lg hover:shadow-primary-500/10"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">PDF Downloads</p>
                      <p className="text-3xl font-bold text-white mt-1">{subscriberStats?.pdfDownloads || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                      <Download className="w-6 h-6 text-blue-400" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">Click to manage →</p>
                </div>
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
                      <div
                        key={article.id}
                        className="flex items-center p-4 hover:bg-gray-750 transition-all group"
                      >
                        {/* Publish Toggle */}
                        <div className="flex flex-col items-center gap-1 flex-shrink-0 mr-3">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              togglePublished(article.id, article.published);
                            }}
                            className={`relative w-9 h-5 rounded-full transition-all duration-200 ${
                              article.published ? 'bg-green-500' : 'bg-gray-600'
                            }`}
                            title={article.published ? 'Click to unpublish' : 'Click to publish'}
                          >
                            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200 ${
                              article.published ? 'left-4' : 'left-0.5'
                            }`} />
                          </button>
                          <span className={`text-[9px] font-medium uppercase tracking-wider ${
                            article.published ? 'text-green-400' : 'text-gray-500'
                          }`}>
                            {article.published ? 'Live' : 'Draft'}
                          </span>
                        </div>

                        {/* Article Content - Clickable */}
                        <Link
                          href={`/admin/articles/${article.id}/edit`}
                          className="flex items-center gap-3 min-w-0 flex-1"
                        >
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            article.boosted ? 'bg-yellow-500/10' : article.published ? 'bg-green-500/10' : 'bg-gray-700'
                          }`}>
                            {article.boosted ? (
                              <Zap className="w-4 h-4 text-yellow-400" />
                            ) : (
                              <FileText className={`w-4 h-4 ${article.published ? 'text-green-400' : 'text-gray-500'}`} />
                            )}
                          </div>
                          <div className="min-w-0">
                            {article.boosted === true && (
                              <div className="flex items-center gap-1 mb-0.5">
                                <span className="text-[9px] font-bold text-yellow-400 uppercase tracking-wider">Boosted</span>
                              </div>
                            )}
                            <p className="text-white text-sm font-medium truncate group-hover:text-primary-400 transition-colors">
                              {article.title}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {article.realViews || 0} views • {formatDistanceToNow(new Date(article.updated_at || article.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </Link>
                        <Link href={`/admin/articles/${article.id}/edit`} className="flex-shrink-0 ml-2">
                          <Edit3 className="w-4 h-4 text-gray-600 group-hover:text-primary-400 transition-colors" />
                        </Link>
                      </div>
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
                        onClick={() => setActiveTab('pages')}
                        className="flex items-center gap-3 w-full p-3 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-xl transition-all font-medium"
                      >
                        <Plus className="w-5 h-5" />
                        New Page
                      </button>
                      <button
                        onClick={() => setActiveTab('settings')}
                        className="flex items-center gap-3 w-full p-3 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-xl transition-all font-medium"
                      >
                        <Settings className="w-5 h-5" />
                        Site Settings
                      </button>
                      <button
                        onClick={() => setActiveTab('emails')}
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
              {/* Sub-tabs: Boosted, All, Drafts */}
              <div className="flex items-center justify-between">
                <div className="flex border-b border-gray-700">
                  {[
                    { id: 'boosted' as ArticlesSubTab, label: 'Boosted', count: boostedArticleCount, icon: Zap },
                    { id: 'all' as ArticlesSubTab, label: 'All Articles', count: articles.length, icon: FileText },
                    { id: 'drafts' as ArticlesSubTab, label: 'Drafts', count: articles.filter(a => !a.published).length, icon: Edit3 },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setArticlesSubTab(tab.id)}
                      className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all ${
                        articlesSubTab === tab.id
                          ? 'border-primary-500 text-white'
                          : 'border-transparent text-gray-400 hover:text-gray-300'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        articlesSubTab === tab.id
                          ? tab.id === 'boosted' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-primary-500/20 text-primary-400'
                          : 'bg-gray-700 text-gray-400'
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>
                <Link
                  href={`/admin/articles/new?siteId=${id}`}
                  className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl transition-all text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  New Article
                </Link>
              </div>

              {/* Search */}
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Articles List */}
              <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                <div className="divide-y divide-gray-700/50">
                  {(() => {
                    // Filter articles based on sub-tab
                    let displayArticles = articles;
                    if (articlesSubTab === 'boosted') {
                      displayArticles = articles.filter(a => a.boosted);
                    } else if (articlesSubTab === 'drafts') {
                      displayArticles = articles.filter(a => !a.published);
                    }
                    // Apply search filter
                    if (searchQuery) {
                      displayArticles = displayArticles.filter(a =>
                        a.title?.toLowerCase().includes(searchQuery.toLowerCase())
                      );
                    }

                    if (displayArticles.length === 0) {
                      return (
                        <div className="p-12 text-center">
                          {articlesSubTab === 'boosted' ? (
                            <>
                              <Zap className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                              <h3 className="text-xl font-semibold text-white mb-2">No boosted articles</h3>
                              <p className="text-gray-400 mb-6">Mark articles as boosted to track active campaigns</p>
                            </>
                          ) : articlesSubTab === 'drafts' ? (
                            <>
                              <Edit3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                              <h3 className="text-xl font-semibold text-white mb-2">No drafts</h3>
                              <p className="text-gray-400 mb-6">All your articles are published!</p>
                            </>
                          ) : (
                            <>
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
                            </>
                          )}
                        </div>
                      );
                    }

                    return displayArticles.map((article) => (
                      <div
                        key={article.id}
                        className="flex items-center p-4 hover:bg-gray-750 transition-all group"
                      >
                        {/* Publish Toggle */}
                        <div className="flex flex-col items-center gap-1 flex-shrink-0 mr-4">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              togglePublished(article.id, article.published);
                            }}
                            className={`relative w-10 h-5 rounded-full transition-all duration-200 ${
                              article.published
                                ? 'bg-green-500'
                                : 'bg-gray-600'
                            }`}
                            title={article.published ? 'Click to unpublish' : 'Click to publish'}
                          >
                            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200 ${
                              article.published ? 'left-5' : 'left-0.5'
                            }`} />
                          </button>
                          <span className={`text-[10px] font-medium uppercase tracking-wider ${
                            article.published ? 'text-green-400' : 'text-gray-500'
                          }`}>
                            {article.published ? 'Live' : 'Draft'}
                          </span>
                        </div>

                        {/* Article Content - Clickable */}
                        <Link
                          href={`/admin/articles/${article.id}/edit`}
                          className="flex items-center gap-4 min-w-0 flex-1"
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            article.boosted ? 'bg-yellow-500/10' : article.published ? 'bg-green-500/10' : 'bg-gray-700'
                          }`}>
                            {article.boosted ? (
                              <Zap className="w-5 h-5 text-yellow-400" />
                            ) : (
                              <FileText className={`w-5 h-5 ${article.published ? 'text-green-400' : 'text-gray-500'}`} />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            {/* Boosted badge ABOVE title */}
                            {article.boosted === true && (
                              <div className="flex items-center gap-1 mb-0.5">
                                <Zap className="w-3 h-3 text-yellow-400" />
                                <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider">Boosted</span>
                              </div>
                            )}
                            <p className="text-white font-medium truncate group-hover:text-primary-400 transition-colors">
                              {article.title}
                            </p>
                            <p className="text-gray-500 text-sm">
                              {article.realViews || 0} views • Updated {formatDistanceToNow(new Date(article.updated_at || article.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </Link>

                        {/* Actions */}
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
                          <Link href={`/admin/articles/${article.id}/edit`}>
                            <Edit3 className="w-4 h-4 text-gray-600 group-hover:text-primary-400 transition-colors" />
                          </Link>
                        </div>
                      </div>
                    ));
                  })()}
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

                {/* Navigation Settings */}
                {settingsSubTab === 'navigation' && (
                  <div className="space-y-8">
                    {/* Navigation Templates Overview */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-white">Navigation Templates</h3>
                          <p className="text-sm text-gray-400 mt-1">Configure header navigation styles for this site</p>
                        </div>
                        <Link
                          href="/admin/navigation"
                          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                          <Settings className="w-4 h-4" />
                          Manage All Templates
                        </Link>
                      </div>

                      {navTemplates.length === 0 ? (
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 text-center">
                          <Navigation className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                          <p className="text-gray-400 mb-4">No navigation templates found</p>
                          <Link
                            href="/admin/navigation"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            Create Templates
                          </Link>
                        </div>
                      ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {navTemplates.slice(0, 6).map((template: any) => (
                            <div
                              key={template.id}
                              className="bg-gray-800 rounded-xl border border-gray-700 p-4 hover:border-gray-600 transition-colors"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h4 className="font-medium text-white">{template.name}</h4>
                                  <p className="text-xs text-gray-500 mt-0.5">{template.description || template.base_type}</p>
                                </div>
                                {template.is_system && (
                                  <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded">System</span>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                <span className={`px-2 py-0.5 rounded text-xs ${template.config?.showNavLinks ? 'bg-green-500/10 text-green-400' : 'bg-gray-700 text-gray-500'}`}>
                                  {template.config?.showNavLinks ? 'Nav' : 'No Nav'}
                                </span>
                                <span className={`px-2 py-0.5 rounded text-xs ${template.config?.showAudioTrack ? 'bg-green-500/10 text-green-400' : 'bg-gray-700 text-gray-500'}`}>
                                  {template.config?.showAudioTrack ? 'Audio' : 'No Audio'}
                                </span>
                                <span className={`px-2 py-0.5 rounded text-xs ${template.config?.showSocialProof ? 'bg-green-500/10 text-green-400' : 'bg-gray-700 text-gray-500'}`}>
                                  {template.config?.showSocialProof ? 'Social' : 'No Social'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Site Default Navigation Settings */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Site Navigation Defaults</h3>
                      <div className="bg-gray-800 rounded-xl border border-gray-700 divide-y divide-gray-700">
                        <div className="flex items-center justify-between p-4">
                          <div>
                            <p className="font-medium text-white">Default Page Navigation</p>
                            <p className="text-sm text-gray-500">Used for regular site pages (Home, About, etc.)</p>
                          </div>
                          <select
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer bg-blue-500/10 border-blue-500/30 text-blue-400`}
                            defaultValue="global"
                          >
                            <option value="global">Full Nav</option>
                            <option value="direct-response">No Nav Links</option>
                            <option value="minimal">Logo Only</option>
                            <option disabled>───────────</option>
                            <option value="__create_new__">+ Create New Nav...</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between p-4">
                          <div>
                            <p className="font-medium text-white">Default Article Navigation</p>
                            <p className="text-sm text-gray-500">Used for individual article pages</p>
                          </div>
                          <select
                            value={pageConfig.defaultArticleNavMode || 'direct-response'}
                            onChange={(e) => {
                              if (e.target.value === '__create_new__') {
                                router.push('/admin/navigation');
                                return;
                              }
                              const newConfig = { ...pageConfig, defaultArticleNavMode: e.target.value };
                              setPageConfig(newConfig);
                              fetch(`/api/sites/${id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ ...site, page_config: newConfig }),
                              });
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer ${
                              pageConfig.defaultArticleNavMode === 'direct-response' || !pageConfig.defaultArticleNavMode
                                ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                                : pageConfig.defaultArticleNavMode === 'minimal'
                                ? 'bg-gray-500/10 border-gray-500/30 text-gray-400'
                                : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                            }`}
                          >
                            <option value="global">Full Nav</option>
                            <option value="direct-response">No Nav Links</option>
                            <option value="minimal">Logo Only</option>
                            <option disabled>───────────</option>
                            <option value="__create_new__">+ Create New Nav...</option>
                          </select>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-3">
                        Individual pages and articles can override these defaults in their respective editors.
                      </p>
                    </div>
                  </div>
                )}

                {/* Appearance */}
                {settingsSubTab === 'appearance' && (
                  <div className="space-y-8">
                    {/* Theme Library */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-white">Theme Library</h3>
                          <p className="text-sm text-gray-400 mt-1">Choose a preset theme or customize colors below</p>
                        </div>
                        <span className="px-3 py-1 bg-primary-500/20 text-primary-300 rounded-full text-xs font-medium">
                          {site.theme || 'medical'}
                        </span>
                      </div>

                      {/* Theme Categories */}
                      {['medical', 'wellness', 'clinical', 'lifestyle', 'premium'].map((category) => (
                        <div key={category} className="mb-6">
                          <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
                            {category === 'medical' ? 'Medical & Healthcare' :
                             category === 'wellness' ? 'Wellness & Holistic' :
                             category === 'clinical' ? 'Clinical & Research' :
                             category === 'lifestyle' ? 'Lifestyle & Beauty' :
                             'Premium & Luxury'}
                          </h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            {[
                              // Medical themes
                              ...(category === 'medical' ? [
                                { id: 'medical-authority', name: 'Medical Authority', colors: { primary: '#ec4899', secondary: '#22c55e' }, gradient: 'from-pink-500 to-pink-600' },
                                { id: 'medical-professional', name: 'Medical Professional', colors: { primary: '#3b82f6', secondary: '#22c55e' }, gradient: 'from-blue-500 to-blue-600' },
                              ] : []),
                              // Wellness themes
                              ...(category === 'wellness' ? [
                                { id: 'wellness-professional', name: 'Wellness Professional', colors: { primary: '#059669', secondary: '#3b82f6' }, gradient: 'from-emerald-500 to-emerald-600' },
                                { id: 'wellness-natural', name: 'Natural Wellness', colors: { primary: '#84cc16', secondary: '#059669' }, gradient: 'from-lime-500 to-green-600' },
                              ] : []),
                              // Clinical themes
                              ...(category === 'clinical' ? [
                                { id: 'clinical-research', name: 'Clinical Research', colors: { primary: '#3b82f6', secondary: '#8b5cf6' }, gradient: 'from-blue-500 to-indigo-600' },
                                { id: 'clinical-modern', name: 'Modern Clinical', colors: { primary: '#06b6d4', secondary: '#14b8a6' }, gradient: 'from-cyan-500 to-teal-600' },
                              ] : []),
                              // Lifestyle themes
                              ...(category === 'lifestyle' ? [
                                { id: 'lifestyle-beauty', name: 'Lifestyle & Beauty', colors: { primary: '#8b5cf6', secondary: '#ec4899' }, gradient: 'from-purple-500 to-pink-500' },
                                { id: 'lifestyle-modern', name: 'Modern Lifestyle', colors: { primary: '#f97316', secondary: '#ec4899' }, gradient: 'from-orange-500 to-rose-500' },
                              ] : []),
                              // Premium themes
                              ...(category === 'premium' ? [
                                { id: 'premium-gold', name: 'Premium Gold', colors: { primary: '#d97706', secondary: '#1e3a5f' }, gradient: 'from-amber-500 to-amber-700' },
                                { id: 'premium-dark', name: 'Premium Dark', colors: { primary: '#a855f7', secondary: '#22d3ee' }, gradient: 'from-purple-600 to-cyan-600' },
                              ] : []),
                            ].map((preset) => (
                              <button
                                key={preset.id}
                                onClick={() => {
                                  updateSiteField('theme', preset.id.split('-')[0]);
                                  updateThemeField('primaryColor', preset.colors.primary);
                                  updateThemeField('secondaryColor', preset.colors.secondary);
                                }}
                                className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                                  site.theme === preset.id.split('-')[0] || theme.primaryColor === preset.colors.primary
                                    ? 'border-primary-500 bg-primary-500/10'
                                    : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                                }`}
                              >
                                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${preset.gradient} flex-shrink-0`}></div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium text-white">{preset.name}</p>
                                    {(site.theme === preset.id.split('-')[0] || theme.primaryColor === preset.colors.primary) && (
                                      <Check className="w-4 h-4 text-primary-400 flex-shrink-0" />
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 mt-2">
                                    <div className="w-5 h-5 rounded-full border-2 border-gray-600" style={{ backgroundColor: preset.colors.primary }}></div>
                                    <div className="w-5 h-5 rounded-full border-2 border-gray-600" style={{ backgroundColor: preset.colors.secondary }}></div>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Custom Colors */}
                    <div className="border-t border-gray-700 pt-8">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-white">Custom Colors</h3>
                          <p className="text-sm text-gray-400 mt-1">Fine-tune your theme colors</p>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-3 gap-6">
                        {[
                          { id: 'primaryColor', label: 'Primary', default: '#ec4899', desc: 'Main buttons, links, highlights' },
                          { id: 'secondaryColor', label: 'Secondary', default: '#22c55e', desc: 'Success states, badges' },
                          { id: 'accentColor', label: 'Accent', default: '#f59e0b', desc: 'Warnings, special highlights' },
                        ].map((color) => (
                          <div key={color.id} className="bg-gray-700/30 rounded-xl p-4">
                            <label className="block text-sm font-medium text-gray-300 mb-1">{color.label}</label>
                            <p className="text-xs text-gray-500 mb-3">{color.desc}</p>
                            <div className="flex items-center gap-3">
                              <input
                                type="color"
                                value={theme[color.id] || color.default}
                                onChange={(e) => updateThemeField(color.id, e.target.value)}
                                className="w-14 h-12 rounded-lg border border-gray-600 cursor-pointer bg-transparent"
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

                    {/* Font Selection */}
                    <div className="border-t border-gray-700 pt-8">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-white">Typography</h3>
                          <p className="text-sm text-gray-400 mt-1">Choose fonts for headings and body text</p>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-gray-700/30 rounded-xl p-4">
                          <label className="block text-sm font-medium text-gray-300 mb-3">Heading Font</label>
                          <div className="space-y-2">
                            {[
                              { id: 'Playfair Display', preview: 'Elegant Serif' },
                              { id: 'Inter', preview: 'Clean Sans-Serif' },
                              { id: 'Montserrat', preview: 'Modern Sans' },
                              { id: 'Lora', preview: 'Readable Serif' },
                            ].map((font) => (
                              <button
                                key={font.id}
                                onClick={() => updateThemeField('headingFont', font.id)}
                                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                                  (theme.headingFont || 'Playfair Display') === font.id
                                    ? 'border-primary-500 bg-primary-500/10'
                                    : 'border-gray-600 hover:border-gray-500'
                                }`}
                              >
                                <span className="text-white" style={{ fontFamily: font.id }}>{font.id}</span>
                                <span className="text-xs text-gray-500">{font.preview}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="bg-gray-700/30 rounded-xl p-4">
                          <label className="block text-sm font-medium text-gray-300 mb-3">Body Font</label>
                          <div className="space-y-2">
                            {[
                              { id: 'Inter', preview: 'Clean & Readable' },
                              { id: 'Open Sans', preview: 'Friendly & Clear' },
                              { id: 'Roboto', preview: 'Modern & Neutral' },
                              { id: 'Lato', preview: 'Warm & Humanist' },
                            ].map((font) => (
                              <button
                                key={font.id}
                                onClick={() => updateThemeField('bodyFont', font.id)}
                                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                                  (theme.bodyFont || 'Inter') === font.id
                                    ? 'border-primary-500 bg-primary-500/10'
                                    : 'border-gray-600 hover:border-gray-500'
                                }`}
                              >
                                <span className="text-white" style={{ fontFamily: font.id }}>{font.id}</span>
                                <span className="text-xs text-gray-500">{font.preview}</span>
                              </button>
                            ))}
                          </div>
                        </div>
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

                    {/* Danger Zone */}
                    <div className="bg-red-500/5 rounded-xl p-6 border-2 border-red-500/30">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                          <Trash2 className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-red-400">Danger Zone</h3>
                          <p className="text-sm text-gray-400">Irreversible actions</p>
                        </div>
                      </div>

                      <div className="bg-gray-800/50 rounded-lg p-4 border border-red-500/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-white">Delete this site</h4>
                            <p className="text-sm text-gray-400 mt-1">
                              Permanently delete this site and all its content including articles, pages, and subscribers.
                            </p>
                          </div>
                          <button
                            onClick={() => setShowDeleteSiteModal(true)}
                            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors flex items-center gap-2 flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete Site
                          </button>
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
              {/* Header with Sub-tabs */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex border-b border-gray-700">
                    <button
                      onClick={() => setPagesSubTab('pages')}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                        pagesSubTab === 'pages'
                          ? 'border-primary-500 text-white'
                          : 'border-transparent text-gray-400 hover:text-gray-300'
                      }`}
                    >
                      <Layers className="w-4 h-4" />
                      Pages
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        pagesSubTab === 'pages' ? 'bg-primary-500/20 text-primary-400' : 'bg-gray-700 text-gray-400'
                      }`}>
                        {visiblePageCount}
                      </span>
                    </button>
                    <button
                      onClick={() => setPagesSubTab('navigation')}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                        pagesSubTab === 'navigation'
                          ? 'border-primary-500 text-white'
                          : 'border-transparent text-gray-400 hover:text-gray-300'
                      }`}
                    >
                      <Navigation className="w-4 h-4" />
                      Navigation
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        pagesSubTab === 'navigation' ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-700 text-gray-400'
                      }`}>
                        {navTemplates.length}
                      </span>
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {saveSuccess && (
                    <span className="text-green-400 text-sm flex items-center gap-1">
                      <Check className="w-4 h-4" /> Saved
                    </span>
                  )}
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>

              {/* PAGES SUB-TAB */}
              {pagesSubTab === 'pages' && (
              <>
              {/* Visible Pages - In Navigation */}
              <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                <div className="p-5 border-b border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Visible Pages</h3>
                      <p className="text-sm text-gray-400 mt-1">Drag to reorder. These appear in your site navigation.</p>
                    </div>
                    <span className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-sm font-medium">
                      {visiblePageCount} visible
                    </span>
                  </div>
                </div>
                <div className="divide-y divide-gray-700/50">
                  {pageConfig.pages
                    .filter((p: any) => p.enabled && p.showInNav)
                    .sort((a: any, b: any) => a.navOrder - b.navOrder)
                    .map((page: any, index: number) => (
                      <div
                        key={page.id}
                        draggable
                        onDragStart={() => handleDragStart(page.id)}
                        onDragOver={(e) => handleDragOver(e, page.id)}
                        onDrop={(e) => handleDrop(e, page.id)}
                        onDragEnd={() => setDraggedPage(null)}
                        onClick={() => router.push(`/admin/sites/${id}/pages/${page.id}/edit`)}
                        className={`flex items-center gap-4 p-4 hover:bg-gray-750 transition-colors cursor-pointer ${
                          draggedPage === page.id ? 'opacity-50 bg-gray-750' : ''
                        }`}
                      >
                        <GripVertical className="w-5 h-5 text-gray-500 cursor-grab hover:text-gray-300" />

                        {/* Page name and slug */}
                        <div className="flex-1 min-w-0">
                          {editingPageId === page.id ? (
                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="text"
                                value={editingPageName}
                                onChange={(e) => setEditingPageName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') savePageName();
                                  if (e.key === 'Escape') setEditingPageId(null);
                                }}
                                autoFocus
                                className="px-2 py-1 bg-gray-700 border border-gray-500 rounded text-white text-sm font-medium w-40"
                              />
                              <button onClick={savePageName} className="p-1 text-green-400 hover:text-green-300">
                                <Check className="w-4 h-4" />
                              </button>
                              <button onClick={() => setEditingPageId(null)} className="p-1 text-gray-400 hover:text-gray-300">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div>
                              <p className="font-medium text-white group-hover:text-primary-400 transition-colors">
                                {page.navLabel || page.title}
                              </p>
                              <p className="text-sm text-gray-500">{page.slug}</p>
                            </div>
                          )}
                        </div>

                        {/* Widget Count Badge */}
                        {(() => {
                          const widgetCount = getPageWidgetCount(page.slug);
                          return (
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                              widgetCount > 0
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : 'bg-gray-700/50 text-gray-500 border border-gray-600'
                            }`}>
                              {widgetCount} widgets
                            </span>
                          );
                        })()}

                        {/* Nav Mode Badge */}
                        <select
                          value={page.navMode || 'global'}
                          onChange={(e) => {
                            if (e.target.value === '__create_new__') {
                              router.push('/admin/navigation');
                              return;
                            }
                            updatePageNavMode(page.id, e.target.value);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer ${
                            page.navMode === 'direct-response'
                              ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                              : page.navMode === 'minimal'
                              ? 'bg-gray-500/10 border-gray-500/30 text-gray-400'
                              : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                          }`}
                        >
                          <option value="global">Full Nav</option>
                          <option value="direct-response">No Nav Links</option>
                          <option value="minimal">Logo Only</option>
                          <option disabled>───────────</option>
                          <option value="__create_new__">+ Create New Nav...</option>
                        </select>

                        {/* Hide button */}
                        <button
                          onClick={(e) => { e.stopPropagation(); togglePageVisibility(page.id); }}
                          className="px-3 py-1.5 bg-gray-700 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg text-sm font-medium transition-colors"
                        >
                          Hide
                        </button>

                        {/* Rename button */}
                        <button
                          onClick={(e) => { e.stopPropagation(); startEditingPageName(page); }}
                          className="p-2 bg-gray-700 hover:bg-primary-500/20 text-gray-400 hover:text-primary-400 rounded-lg transition-colors"
                          title="Rename page"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                  {visiblePageCount === 0 && (
                    <div className="p-8 text-center text-gray-500">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No visible pages. Show some pages from the hidden list below.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Article Pages Section - Between Visible and Hidden */}
              <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                <div className="p-5 border-b border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Individual Article Pages</h3>
                      <p className="text-sm text-gray-400 mt-1">Navigation settings for all article pages on this site</p>
                    </div>
                    <Link
                      href={`/admin/sites/${id}/articles`}
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      Manage Articles
                    </Link>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{articles.length} Articles</p>
                        <p className="text-xs text-gray-500">
                          {articles.filter((a: any) => a.published).length} published, {articles.filter((a: any) => !a.published).length} drafts
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-400">Default Nav:</span>
                      <select
                        value={pageConfig.defaultArticleNavMode || 'direct-response'}
                        onChange={(e) => {
                          if (e.target.value === '__create_new__') {
                            router.push('/admin/navigation');
                            return;
                          }
                          const newConfig = { ...pageConfig, defaultArticleNavMode: e.target.value };
                          setPageConfig(newConfig);
                          // Auto-save
                          fetch(`/api/sites/${id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ ...site, page_config: newConfig }),
                          });
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer ${
                          pageConfig.defaultArticleNavMode === 'direct-response' || !pageConfig.defaultArticleNavMode
                            ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                            : pageConfig.defaultArticleNavMode === 'minimal'
                            ? 'bg-gray-500/10 border-gray-500/30 text-gray-400'
                            : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                        }`}
                      >
                        <option value="global">Full Nav</option>
                        <option value="direct-response">No Nav Links</option>
                        <option value="minimal">Logo Only</option>
                        <option disabled>───────────</option>
                        <option value="__create_new__">+ Create New Nav...</option>
                      </select>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-4">
                    Individual articles can override this in the article editor. "No Nav Links" is recommended for better conversion.
                  </p>
                </div>
              </div>

              {/* Hidden Pages */}
              {pageConfig.pages.filter((p: any) => !p.showInNav).length > 0 && (
                <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                  <div className="p-5 border-b border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white">Hidden Pages</h3>
                        <p className="text-sm text-gray-400 mt-1">Pages not shown in navigation. Click Show to add them.</p>
                      </div>
                      <span className="px-3 py-1 bg-gray-600/50 text-gray-400 rounded-full text-sm font-medium">
                        {pageConfig.pages.filter((p: any) => !p.showInNav).length} hidden
                      </span>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-700/50">
                    {pageConfig.pages
                      .filter((p: any) => !p.showInNav)
                      .map((page: any) => (
                        <div
                          key={page.id}
                          onClick={() => router.push(`/admin/sites/${id}/pages/${page.id}/edit`)}
                          className="flex items-center justify-between p-4 hover:bg-gray-750 cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-700/50 flex items-center justify-center">
                              <FileText className="w-4 h-4 text-gray-500" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-400">{page.navLabel || page.title}</p>
                              <p className="text-sm text-gray-500">{page.slug}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* Widget Count Badge */}
                            {(() => {
                              const widgetCount = getPageWidgetCount(page.slug);
                              return (
                                <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                                  widgetCount > 0
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-gray-700/50 text-gray-500 border border-gray-600'
                                }`}>
                                  {widgetCount} widgets
                                </span>
                              );
                            })()}
                            <button
                              onClick={(e) => { e.stopPropagation(); togglePageVisibility(page.id); }}
                              className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                              Show in Nav
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); startEditingPageName(page); }}
                              className="p-2 bg-gray-700 hover:bg-primary-500/20 text-gray-400 hover:text-primary-400 rounded-lg transition-colors"
                              title="Rename page"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              </>
              )}

              {/* NAVIGATION SUB-TAB */}
              {pagesSubTab === 'navigation' && (
              <>
                {/* Site Navigation Templates */}
                <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                  <div className="p-5 border-b border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white">Navigation Templates</h3>
                        <p className="text-sm text-gray-400 mt-1">Configure header navigation styles for this site</p>
                      </div>
                      <Link
                        href="/admin/navigation"
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        <Settings className="w-4 h-4" />
                        Manage All Templates
                      </Link>
                    </div>
                  </div>
                  <div className="p-5">
                    {navTemplates.length === 0 ? (
                      <div className="text-center py-8">
                        <Navigation className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400 mb-4">No navigation templates found</p>
                        <Link
                          href="/admin/navigation"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Create Templates
                        </Link>
                      </div>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {navTemplates.map((template: any) => (
                          <div
                            key={template.id}
                            className="bg-gray-750 rounded-xl border border-gray-600 p-4 hover:border-gray-500 transition-colors"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-medium text-white">{template.name}</h4>
                                <p className="text-xs text-gray-500 mt-0.5">{template.description || template.base_type}</p>
                              </div>
                              {template.is_system && (
                                <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded">System</span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              <span className={`px-2 py-0.5 rounded text-xs ${template.config?.showNavLinks ? 'bg-green-500/10 text-green-400' : 'bg-gray-700 text-gray-500'}`}>
                                {template.config?.showNavLinks ? 'Nav Links' : 'No Links'}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-xs ${template.config?.showAudioTrack ? 'bg-green-500/10 text-green-400' : 'bg-gray-700 text-gray-500'}`}>
                                {template.config?.showAudioTrack ? 'Audio' : 'No Audio'}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-xs ${template.config?.showSocialProof ? 'bg-green-500/10 text-green-400' : 'bg-gray-700 text-gray-500'}`}>
                                {template.config?.showSocialProof ? 'Social' : 'No Social'}
                              </span>
                            </div>
                            <span className={`inline-block px-2 py-1 rounded text-xs border ${
                              template.base_type === 'global' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                              template.base_type === 'direct-response' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                              'bg-gray-500/10 text-gray-400 border-gray-500/20'
                            }`}>
                              {template.base_type === 'global' ? 'Full Nav' : template.base_type === 'direct-response' ? 'Direct Response' : 'Minimal'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Site Default Navigation */}
                <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                  <div className="p-5 border-b border-gray-700">
                    <h3 className="text-lg font-semibold text-white">Site Default Navigation</h3>
                    <p className="text-sm text-gray-400 mt-1">Set the default navigation template for this site</p>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-750 rounded-lg">
                      <div>
                        <p className="font-medium text-white">Default Page Navigation</p>
                        <p className="text-sm text-gray-500">Used for regular site pages (Home, About, etc.)</p>
                      </div>
                      <select
                        className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                        defaultValue="global"
                      >
                        <option value="global">Full Nav</option>
                        <option value="direct-response">No Nav Links</option>
                        <option value="minimal">Logo Only</option>
                        <option disabled>───────────</option>
                        <option value="__create_new__">+ Create New Nav...</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-750 rounded-lg">
                      <div>
                        <p className="font-medium text-white">Default Article Navigation</p>
                        <p className="text-sm text-gray-500">Used for individual article pages</p>
                      </div>
                      <select
                        value={pageConfig.defaultArticleNavMode || 'direct-response'}
                        onChange={(e) => {
                          if (e.target.value === '__create_new__') {
                            router.push('/admin/navigation');
                            return;
                          }
                          const newConfig = { ...pageConfig, defaultArticleNavMode: e.target.value };
                          setPageConfig(newConfig);
                          fetch(`/api/sites/${id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ ...site, page_config: newConfig }),
                          });
                        }}
                        className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                      >
                        <option value="global">Full Nav</option>
                        <option value="direct-response">No Nav Links</option>
                        <option value="minimal">Logo Only</option>
                        <option disabled>───────────</option>
                        <option value="__create_new__">+ Create New Nav...</option>
                      </select>
                    </div>
                  </div>
                </div>
              </>
              )}
            </div>
          )}

          {/* EMAILS TAB */}
          {activeTab === 'emails' && (
            <div className="space-y-6">
              {/* Tabs and Export */}
              <div className="flex items-center justify-between">
                <div className="flex border-b border-gray-700">
                  <button
                    onClick={() => { setEmailsSubTab('active'); setSelectedEmails(new Set()); }}
                    className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all ${
                      emailsSubTab === 'active'
                        ? 'border-primary-500 text-white'
                        : 'border-transparent text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Active Emails
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      emailsSubTab === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'
                    }`}>
                      {activeSubscriberCount}
                    </span>
                  </button>
                  <button
                    onClick={() => { setEmailsSubTab('unsubscribed'); setSelectedEmails(new Set()); }}
                    className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all ${
                      emailsSubTab === 'unsubscribed'
                        ? 'border-primary-500 text-white'
                        : 'border-transparent text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    <X className="w-4 h-4" />
                    Unsubscribed
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      emailsSubTab === 'unsubscribed' ? 'bg-red-500/20 text-red-400' : 'bg-gray-700 text-gray-400'
                    }`}>
                      {unsubscribedCount}
                    </span>
                  </button>
                </div>
                <button
                  onClick={exportEmails}
                  className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl transition-all text-sm font-medium"
                >
                  <Download className="w-4 h-4" />
                  Export {selectedEmails.size > 0 ? selectedEmails.size : filteredSubscribers.length} Emails
                </button>
              </div>

              {/* Filters Section */}
              <div className="bg-gray-800 rounded-2xl border border-gray-700 p-5 space-y-4">
                {/* Date Range Filters */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Date Range</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'all' as const, label: 'All Time', icon: Globe },
                      { id: 'today' as const, label: 'Today', icon: Calendar },
                      { id: 'week' as const, label: 'Last 7 Days', icon: Clock },
                      { id: 'month' as const, label: 'Last 30 Days', icon: Calendar },
                      { id: 'quarter' as const, label: 'Last 90 Days', icon: TrendingUp },
                    ].map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => setEmailDateFilter(preset.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          emailDateFilter === preset.id
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        <preset.icon className="w-4 h-4" />
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Source Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Source Type</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'all' as const, label: 'All Sources', icon: Users },
                      { id: 'pdf_downloads' as const, label: 'PDF Downloads', icon: Download },
                      { id: 'other' as const, label: 'Other', icon: Mail },
                    ].map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setEmailSourceFilter(option.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          emailSourceFilter === option.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        <option.icon className="w-4 h-4" />
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search and Sort Row */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-700">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="text"
                        placeholder="Search emails..."
                        value={emailSearch}
                        onChange={(e) => setEmailSearch(e.target.value)}
                        className="w-64 pl-10 pr-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    {selectedEmails.size > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-primary-400 font-medium">{selectedEmails.size} selected</span>
                        <button onClick={deselectAllEmails} className="text-xs text-gray-400 hover:text-gray-300">Clear</button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Sort Options */}
                    <div className="flex items-center gap-2 bg-gray-700 rounded-xl p-1">
                      <button
                        onClick={() => setEmailSortField('created_at')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          emailSortField === 'created_at'
                            ? 'bg-gray-600 text-white'
                            : 'text-gray-400 hover:text-gray-300'
                        }`}
                      >
                        Date
                      </button>
                      <button
                        onClick={() => setEmailSortField('email')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          emailSortField === 'email'
                            ? 'bg-gray-600 text-white'
                            : 'text-gray-400 hover:text-gray-300'
                        }`}
                      >
                        Email
                      </button>
                    </div>
                    <button
                      onClick={() => setEmailSortDir(emailSortDir === 'asc' ? 'desc' : 'asc')}
                      className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                      title={emailSortDir === 'asc' ? 'Ascending' : 'Descending'}
                    >
                      {emailSortDir === 'asc' ? (
                        <ArrowUp className="w-4 h-4 text-gray-300" />
                      ) : (
                        <ArrowDown className="w-4 h-4 text-gray-300" />
                      )}
                    </button>
                    <button
                      onClick={loadSubscribers}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-xl transition-all text-sm font-medium"
                    >
                      <RefreshCw className={`w-4 h-4 ${emailsLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </button>
                  </div>
                </div>

                <div className="text-sm text-gray-400">
                  {filteredSubscribers.length.toLocaleString()} emails match filters
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-5 gap-4">
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
                  <p className="text-gray-400 text-sm">Total Active Emails</p>
                  <p className="text-3xl font-bold text-green-400 mt-1">{activeSubscriberCount}</p>
                </div>
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
                  <p className="text-gray-400 text-sm">Total Emails</p>
                  <p className="text-3xl font-bold text-white mt-1">{subscribers.length}</p>
                  <p className="text-xs text-gray-500 mt-1">incl. unsubscribed</p>
                </div>
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
                  <p className="text-gray-400 text-sm">PDF Downloads</p>
                  <p className="text-3xl font-bold text-blue-400 mt-1">{subscriberStats.pdfDownloads || 0}</p>
                </div>
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
                  <p className="text-gray-400 text-sm">
                    {emailDateFilter === 'all' ? 'All Time' :
                     emailDateFilter === 'today' ? 'Today' :
                     emailDateFilter === 'week' ? 'Last 7 Days' :
                     emailDateFilter === 'month' ? 'Last 30 Days' : 'Last 90 Days'}
                  </p>
                  <p className="text-3xl font-bold text-purple-400 mt-1">{filteredSubscribers.length}</p>
                </div>
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
                  <p className="text-gray-400 text-sm">Unsubscribed</p>
                  <p className="text-3xl font-bold text-red-400 mt-1">{unsubscribedCount}</p>
                </div>
              </div>

              {/* Subscribers List */}
              <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                {/* Table Header */}
                <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-700 bg-gray-850">
                  <button
                    onClick={() => {
                      if (selectedEmails.size === filteredSubscribers.length) {
                        deselectAllEmails();
                      } else {
                        selectAllEmails();
                      }
                    }}
                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                  >
                    {selectedEmails.size === filteredSubscribers.length && filteredSubscribers.length > 0 ? (
                      <CheckSquare className="w-5 h-5 text-primary-400" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider flex-1">Email</span>
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider w-24">Source</span>
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider w-32">Date</span>
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider w-20 text-right">Action</span>
                </div>

                {/* List */}
                <div className="divide-y divide-gray-700/50 max-h-[500px] overflow-y-auto">
                  {filteredSubscribers.length > 0 ? (
                    filteredSubscribers.map((sub: any) => (
                      <div key={sub.id} className={`flex items-center gap-4 px-4 py-3 hover:bg-gray-750 transition-colors ${selectedEmails.has(sub.id) ? 'bg-primary-500/5' : ''}`}>
                        <button
                          onClick={() => toggleEmailSelection(sub.id)}
                          className="p-1 hover:bg-gray-700 rounded transition-colors"
                        >
                          {selectedEmails.has(sub.id) ? (
                            <CheckSquare className="w-5 h-5 text-primary-400" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-500" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{sub.email}</p>
                          {sub.name && <p className="text-xs text-gray-500">{sub.name}</p>}
                        </div>
                        <span className="w-24 px-2.5 py-1 bg-blue-900/50 text-blue-300 rounded-lg text-xs font-medium text-center">
                          {sub.source || 'website'}
                        </span>
                        <span className="w-32 text-sm text-gray-400">
                          {formatDistanceToNow(new Date(sub.created_at), { addSuffix: true })}
                        </span>
                        <div className="w-20 text-right">
                          {emailsSubTab === 'active' ? (
                            <button
                              onClick={() => handleUnsubscribe(sub)}
                              className="p-2 text-gray-500 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-all"
                              title="Unsubscribe"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleResubscribe(sub)}
                              className="p-2 text-gray-500 hover:text-green-400 hover:bg-gray-700 rounded-lg transition-all"
                              title="Re-subscribe"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-12 text-center">
                      <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {emailsSubTab === 'active' ? 'No active subscribers' : 'No unsubscribed emails'}
                      </h3>
                      <p className="text-gray-400">
                        {emailSearch ? 'Try adjusting your search' : emailsSubTab === 'active' ? 'Subscribers will appear here' : 'No unsubscribed emails yet'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                {filteredSubscribers.length > 0 && (
                  <div className="px-6 py-4 border-t border-gray-700 bg-gray-850">
                    <p className="text-sm text-gray-400">
                      Showing <span className="text-white font-medium">{filteredSubscribers.length}</span>{' '}
                      {emailsSubTab === 'active' ? 'active subscribers' : 'unsubscribed emails'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ANALYTICS TAB */}
          {activeTab === 'analytics' && (
            <AnalyticsTab
              siteId={id}
              articles={articles}
              metrics={metrics}
              settings={settings}
              onNavigateToSettings={() => setActiveTab('settings')}
            />
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

      {/* Delete Site Confirmation Modal */}
      {showDeleteSiteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-red-500/10 border-b border-red-500/20 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Delete Site</h3>
                  <p className="text-sm text-red-300">This action cannot be undone</p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5">
              <p className="text-gray-300">
                Are you sure you want to delete <span className="font-semibold text-white">"{site?.name}"</span>?
              </p>
              <p className="text-sm text-gray-400 mt-2">
                This will permanently delete:
              </p>
              <ul className="text-sm text-gray-400 mt-2 list-disc list-inside space-y-1">
                <li>All {articles.length} articles</li>
                <li>All pages and widgets</li>
                <li>All subscriber data</li>
                <li>All site settings and configurations</li>
              </ul>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Type <span className="font-mono text-red-400">"{site?.name}"</span> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Enter site name"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-800/50 border-t border-gray-700 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteSiteModal(false);
                  setDeleteConfirmText('');
                }}
                disabled={deleteSiteLoading}
                className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSite}
                disabled={deleteSiteLoading || deleteConfirmText !== site?.name}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteSiteLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Site Permanently
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

// Enhanced Analytics Tab Component
interface AnalyticsTabProps {
  siteId: string;
  articles: any[];
  metrics: any;
  settings: any;
  onNavigateToSettings: () => void;
}

function AnalyticsTab({ siteId, articles, metrics, settings, onNavigateToSettings }: AnalyticsTabProps) {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);
  const [articleDetails, setArticleDetails] = useState<Record<string, any>>({});
  const [sortField, setSortField] = useState<'views' | 'clicks' | 'conversion'>('views');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadAnalytics();
  }, [siteId, timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics/site/${siteId}?timeRange=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadArticleDetails = async (articleId: string) => {
    if (articleDetails[articleId]) return;
    try {
      const response = await fetch(`/api/analytics/article/${articleId}`);
      if (response.ok) {
        const data = await response.json();
        setArticleDetails(prev => ({ ...prev, [articleId]: data }));
      }
    } catch (error) {
      console.error('Failed to load article details:', error);
    }
  };

  const toggleArticle = (articleId: string) => {
    if (expandedArticle === articleId) {
      setExpandedArticle(null);
    } else {
      setExpandedArticle(articleId);
      loadArticleDetails(articleId);
    }
  };

  const sortedArticles = [...(analyticsData?.articles || [])].sort((a, b) => {
    const getValue = (article: any) => {
      switch (sortField) {
        case 'views': return article.realViews || 0;
        case 'clicks': return article.widgetClicks || 0;
        case 'conversion': return parseFloat(article.conversionRate) || 0;
        default: return 0;
      }
    };
    const aVal = getValue(a);
    const bVal = getValue(b);
    return sortDir === 'desc' ? bVal - aVal : aVal - bVal;
  });

  if (loading && !analyticsData) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-10 h-10 border-3 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Time Range Filter */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Analytics Overview</h2>
          <p className="text-gray-400 text-sm mt-1">Site performance, conversions, and traffic metrics</p>
        </div>
        <div className="flex items-center gap-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
          <button
            onClick={loadAnalytics}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
          <p className="text-gray-400 text-sm">Total Views</p>
          <p className="text-3xl font-bold text-white mt-1">{(analyticsData?.summary?.totalViews || 0).toLocaleString()}</p>
        </div>
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
          <p className="text-gray-400 text-sm">CTA Clicks</p>
          <p className="text-3xl font-bold text-blue-400 mt-1">{(analyticsData?.summary?.totalClicks || 0).toLocaleString()}</p>
        </div>
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
          <p className="text-gray-400 text-sm">Click-Through Rate</p>
          <p className="text-3xl font-bold text-yellow-400 mt-1">{analyticsData?.summary?.clickThroughRate || 0}%</p>
        </div>
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
          <p className="text-gray-400 text-sm">Active Email Signups</p>
          <p className="text-3xl font-bold text-purple-400 mt-1">{(analyticsData?.summary?.totalEmails || metrics?.totalEmails || 0).toLocaleString()}</p>
        </div>
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
          <p className="text-gray-400 text-sm">Email Conversion</p>
          <p className="text-3xl font-bold text-green-400 mt-1">{analyticsData?.summary?.emailConversionRate || 0}%</p>
        </div>
      </div>

      {/* Top Widgets */}
      {analyticsData?.topWidgets?.length > 0 && (
        <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
          <div className="p-5 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">Top Performing Widgets</h3>
            <p className="text-sm text-gray-400 mt-1">Which CTAs and widgets are driving the most clicks</p>
          </div>
          <div className="divide-y divide-gray-700/50">
            {analyticsData.topWidgets.slice(0, 5).map((widget: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-gray-600 w-8">{i + 1}</span>
                  <div>
                    <p className="text-white font-medium">{widget.name || widget.type}</p>
                    <p className="text-sm text-gray-500">{widget.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-blue-400">{widget.clicks}</p>
                  <p className="text-sm text-gray-500">clicks</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Articles with Analytics - Expandable */}
      <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
        <div className="p-5 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Article Performance</h3>
              <p className="text-sm text-gray-400 mt-1">Click on an article to see detailed widget analytics</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as any)}
                className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 text-sm"
              >
                <option value="views">Sort by Views</option>
                <option value="clicks">Sort by Clicks</option>
                <option value="conversion">Sort by Conversion</option>
              </select>
              <button
                onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
                className="p-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600"
              >
                {sortDir === 'desc' ? <ArrowDown className="w-4 h-4" /> : <ArrowUp className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
        <div className="divide-y divide-gray-700/50">
          {sortedArticles.map((article: any) => (
            <div key={article.id}>
              <button
                onClick={() => toggleArticle(article.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-750 transition-colors text-left"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${
                    expandedArticle === article.id ? 'rotate-180' : ''
                  }`} />
                  <div className="min-w-0">
                    {article.boosted === true && (
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className="w-4 h-4 bg-yellow-500/20 rounded flex items-center justify-center">
                          <Zap className="w-3 h-3 text-yellow-400" />
                        </div>
                        <span className="text-xs font-semibold text-yellow-400 uppercase tracking-wide">Boosted</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <p className="text-white font-medium truncate">{article.title}</p>
                      {!article.published && (
                        <span className="px-2 py-0.5 bg-gray-600 text-gray-400 rounded-full text-xs font-medium flex-shrink-0">
                          Draft
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-lg font-bold text-white">{(article.realViews || 0).toLocaleString()}</p>
                    <p className="text-xs text-gray-500">views</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-400">{article.widgetClicks || 0}</p>
                    <p className="text-xs text-gray-500">CTA clicks</p>
                  </div>
                  <div className="text-right min-w-[60px]">
                    <p className={`text-lg font-bold ${
                      parseFloat(article.conversionRate) >= 5 ? 'text-green-400' :
                      parseFloat(article.conversionRate) >= 2 ? 'text-yellow-400' : 'text-gray-400'
                    }`}>
                      {article.conversionRate || 0}%
                    </p>
                    <p className="text-xs text-gray-500">CTR</p>
                  </div>
                </div>
              </button>

              {/* Expanded Article Details */}
              {expandedArticle === article.id && (
                <div className="px-4 pb-4 bg-gray-850">
                  <div className="bg-gray-700/50 rounded-xl p-4">
                    {articleDetails[article.id] ? (
                      <div className="space-y-4">
                        {/* Performance Metrics */}
                        <div className="grid grid-cols-5 gap-3">
                          <div className="bg-gray-800 rounded-lg p-3 text-center">
                            <p className="text-2xl font-bold text-white">{articleDetails[article.id].analytics?.views || 0}</p>
                            <p className="text-xs text-gray-400">Views</p>
                          </div>
                          <div className="bg-gray-800 rounded-lg p-3 text-center">
                            <p className="text-2xl font-bold text-blue-400">{articleDetails[article.id].analytics?.clicks || 0}</p>
                            <p className="text-xs text-gray-400">CTA Clicks</p>
                          </div>
                          <div className="bg-gray-800 rounded-lg p-3 text-center">
                            <p className="text-2xl font-bold text-purple-400">{articleDetails[article.id].analytics?.conversionRate || 0}%</p>
                            <p className="text-xs text-gray-400">CTR</p>
                          </div>
                          <div className="bg-gray-800 rounded-lg p-3 text-center">
                            <p className="text-2xl font-bold text-green-400">{articleDetails[article.id].analytics?.emailSignups || 0}</p>
                            <p className="text-xs text-gray-400">Email Signups</p>
                          </div>
                          <div className="bg-gray-800 rounded-lg p-3 text-center">
                            <p className="text-2xl font-bold text-orange-400">{article.pdfDownloads || 0}</p>
                            <p className="text-xs text-gray-400">PDF Downloads</p>
                          </div>
                        </div>

                        {/* Email Signups Download Button */}
                        {articleDetails[article.id].analytics?.emailSignups > 0 && (
                          <div className="border-t border-gray-600 pt-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Export these emails
                                const emails = articleDetails[article.id].analytics.emails || [];
                                const csv = [
                                  ['Email', 'Source', 'Date'],
                                  ...emails.map((em: any) => [em.email, em.source || 'unknown', em.createdAt])
                                ].map((row: any[]) => row.map((cell: any) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
                                const blob = new Blob([csv], { type: 'text/csv' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `${article.slug}-emails.csv`;
                                a.click();
                                URL.revokeObjectURL(url);
                              }}
                              className="flex items-center gap-2 w-full px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-sm text-gray-200 transition-colors"
                            >
                              <Download className="w-4 h-4" />
                              Download {articleDetails[article.id].analytics?.emailSignups || 0} Email Signups
                            </button>
                          </div>
                        )}

                        {/* Widget Breakdown */}
                        {articleDetails[article.id].analytics?.widgetBreakdown?.length > 0 && (
                          <div className="border-t border-gray-600 pt-4">
                            <p className="text-sm font-medium text-gray-300 mb-2">Widget Breakdown</p>
                            <div className="space-y-2">
                              {articleDetails[article.id].analytics.widgetBreakdown.map((widget: any, i: number) => (
                                <div key={i} className="flex items-center justify-between bg-gray-600/50 rounded-lg px-3 py-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-300">{widget.name || widget.type}</span>
                                    <span className="text-xs text-gray-500">{widget.type}</span>
                                  </div>
                                  <span className="text-blue-400 font-medium">{widget.clicks} clicks</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {(!articleDetails[article.id].analytics?.widgetBreakdown?.length && !articleDetails[article.id].analytics?.emails?.length) && (
                          <p className="text-sm text-gray-400 text-center py-2">No conversions recorded yet</p>
                        )}

                        <div className="pt-2 border-t border-gray-600">
                          <Link
                            href={`/admin/articles/${article.id}/edit`}
                            className="block w-full text-center text-primary-400 hover:text-primary-300 text-sm font-medium py-2 border border-gray-600 rounded-lg hover:bg-gray-600/50 transition-colors"
                          >
                            Edit Article →
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-4">
                        <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          {sortedArticles.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No articles found
            </div>
          )}
        </div>
      </div>

      {/* Tracking Status */}
      <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Tracking Status</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 bg-gray-700/50 rounded-xl">
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <div>
              <p className="font-medium text-white">Internal Analytics</p>
              <p className="text-sm text-gray-400">Active - Tracking views & clicks</p>
            </div>
          </div>
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
          onClick={onNavigateToSettings}
          className="mt-4 text-primary-400 hover:text-primary-300 text-sm font-medium"
        >
          Configure tracking in Settings →
        </button>
      </div>
    </div>
  );
}
