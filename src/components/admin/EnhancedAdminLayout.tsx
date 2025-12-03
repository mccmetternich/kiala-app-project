'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutGrid,
  FileText,
  Settings,
  Users,
  BarChart3,
  Globe,
  Menu,
  X,
  LogOut,
  Plus,
  Edit3,
  ChevronDown,
  ExternalLink,
  Copy,
  Eye,
  Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: ReactNode;
}

interface Site {
  id: string;
  name: string;
  domain?: string;
  subdomain: string;
  status: 'draft' | 'published';
  article_count?: number;
  total_views?: number;
}

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

export default function EnhancedAdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentSite, setCurrentSite] = useState<Site | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [showSiteSwitcher, setShowSiteSwitcher] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Load sites and current site context
  useEffect(() => {
    loadSites();
    detectCurrentSite();
  }, [pathname]);

  const loadSites = async () => {
    try {
      const response = await fetch('/api/sites');
      if (response.ok) {
        const data = await response.json();
        setSites(data.sites || []);
      }
    } catch (error) {
      console.error('Failed to load sites:', error);
    }
  };

  const detectCurrentSite = () => {
    const siteMatch = pathname.match(/\/admin\/sites\/([^\/]+)/);
    if (siteMatch && sites.length > 0) {
      const siteId = siteMatch[1];
      const site = sites.find(s => s.id === siteId);
      setCurrentSite(site || null);
    } else {
      setCurrentSite(null);
    }
  };

  const switchSite = (site: Site) => {
    setCurrentSite(site);
    setShowSiteSwitcher(false);
    router.push(`/admin/sites/${site.id}/dashboard`);
  };

  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Admin', href: '/admin' }
    ];

    if (segments.includes('sites') && segments.length > 2) {
      const siteId = segments[2];
      const site = sites.find(s => s.id === siteId);
      
      if (site) {
        breadcrumbs.push({
          label: site.name,
          href: `/admin/sites/${site.id}/dashboard`
        });

        // Add specific page breadcrumbs
        if (segments[3] === 'settings') {
          breadcrumbs.push({ label: 'Settings', current: true });
        } else if (segments[3] === 'articles') {
          breadcrumbs.push({ label: 'Articles', current: true });
        } else if (segments[3] === 'pages') {
          breadcrumbs.push({ label: 'Pages', current: true });
        } else if (segments[3] === 'analytics') {
          breadcrumbs.push({ label: 'Analytics', current: true });
        }
      }
    } else if (segments[1] === 'sites' && segments[2] === 'new') {
      breadcrumbs.push({ label: 'Create Site', current: true });
    } else if (segments[1] === 'sites') {
      breadcrumbs.push({ label: 'All Sites', current: true });
    }

    return breadcrumbs;
  };

  const getNavigation = () => {
    if (currentSite) {
      // Site-specific navigation - flat structure for compatibility
      return [
        { 
          name: 'Dashboard', 
          href: `/admin/sites/${currentSite.id}/dashboard`, 
          icon: LayoutGrid,
          description: 'Site overview and metrics'
        },
        { 
          name: 'Articles', 
          href: `/admin/sites/${currentSite.id}/articles`, 
          icon: Edit3,
          description: 'Manage and create articles',
          badge: currentSite.article_count
        },
        { 
          name: 'Pages', 
          href: `/admin/sites/${currentSite.id}/pages`, 
          icon: FileText,
          description: 'Custom pages and templates'
        },
        { 
          name: 'Email Signups', 
          href: `/admin/sites/${currentSite.id}/emails`, 
          icon: Users,
          description: 'Manage email subscribers'
        },
        { 
          name: 'Analytics', 
          href: `/admin/sites/${currentSite.id}/analytics`, 
          icon: BarChart3,
          description: 'Performance and traffic data',
          badge: currentSite.total_views ? `${Math.round(currentSite.total_views / 1000)}K` : undefined
        },
        { 
          name: 'Settings', 
          href: `/admin/sites/${currentSite.id}/settings`, 
          icon: Settings,
          description: 'Configuration and branding'
        }
      ];
    } else {
      // Global navigation - simplified (no separate Sites page - merged into Dashboard)
      return [
        {
          name: 'Dashboard',
          href: '/admin',
          icon: LayoutGrid,
          description: 'Sites, articles and metrics'
        },
        {
          name: 'All Articles',
          href: '/admin/articles',
          icon: Edit3,
          description: 'Articles across all sites'
        },
        {
          name: 'Email Signups',
          href: '/admin/emails',
          icon: Users,
          description: 'All email subscribers'
        }
      ];
    }
  };

  const getQuickActions = () => {
    if (currentSite) {
      return [
        {
          label: 'New Article',
          href: `/admin/sites/${currentSite.id}/articles/new`,
          icon: Plus,
          className: 'bg-primary-600 hover:bg-primary-700 text-white',
          description: 'Create new content'
        },
        {
          label: 'View Live Site',
          href: `/site/${currentSite.subdomain}`,
          icon: ExternalLink,
          target: '_blank',
          className: 'bg-blue-600 hover:bg-blue-700 text-white',
          description: 'Preview your site'
        },
        {
          label: 'Email Export',
          href: `/admin/sites/${currentSite.id}/emails`,
          icon: Users,
          className: 'bg-green-600 hover:bg-green-700 text-white',
          description: 'Download subscribers'
        },
        {
          label: 'Clone Site',
          onClick: () => cloneSite(currentSite.id),
          icon: Copy,
          className: 'bg-purple-600 hover:bg-purple-700 text-white',
          description: 'Duplicate this site'
        },
        {
          label: 'Site Settings',
          href: `/admin/sites/${currentSite.id}/settings`,
          icon: Settings,
          className: 'bg-gray-600 hover:bg-gray-700 text-white',
          description: 'Configure site'
        }
      ];
    } else {
      // No quick actions on global dashboard - actions are in the page itself
      return [];
    }
  };

  const cloneSite = async (siteId: string) => {
    try {
      const response = await fetch(`/api/sites/${siteId}/clone`, {
        method: 'POST'
      });
      if (response.ok) {
        const data = await response.json();
        router.push(`/admin/sites/${data.site.id}/settings`);
      }
    } catch (error) {
      console.error('Failed to clone site:', error);
    }
  };

  const navigation = getNavigation();
  const quickActions = getQuickActions();
  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-72 bg-gray-800 shadow-xl">
            <SidebarContent 
              navigation={navigation}
              currentSite={currentSite}
              sites={sites}
              onClose={() => setSidebarOpen(false)}
              onSwitchSite={switchSite}
              showSiteSwitcher={showSiteSwitcher}
              setShowSiteSwitcher={setShowSiteSwitcher}
              pathname={pathname}
            />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <SidebarContent 
          navigation={navigation}
          currentSite={currentSite}
          sites={sites}
          onSwitchSite={switchSite}
          showSiteSwitcher={showSiteSwitcher}
          setShowSiteSwitcher={setShowSiteSwitcher}
          pathname={pathname}
        />
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Enhanced top bar */}
        <div className="sticky top-0 z-40 bg-gray-800/95 backdrop-blur border-b border-gray-700 shadow-lg">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 -m-2 text-gray-400 hover:text-gray-200"
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Breadcrumbs */}
              <nav className="hidden md:flex" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2">
                  {breadcrumbs.map((item, index) => (
                    <li key={index}>
                      <div className="flex items-center">
                        {index > 0 && (
                          <ChevronDown className="w-4 h-4 text-gray-500 mr-2 rotate-[-90deg]" />
                        )}
                        {item.current ? (
                          <span className="text-sm font-medium text-gray-200">
                            {item.label}
                          </span>
                        ) : (
                          <Link
                            href={item.href!}
                            className="text-sm font-medium text-gray-400 hover:text-gray-200 transition-colors"
                          >
                            {item.label}
                          </Link>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              {/* Quick actions */}
              <div className="hidden sm:flex items-center gap-2">
                {quickActions.map((action, index) => (
                  action.href ? (
                    <Link
                      key={index}
                      href={action.href}
                      target={action.target}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                        action.className
                      )}
                    >
                      <action.icon className="w-3.5 h-3.5" />
                      {action.label}
                    </Link>
                  ) : (
                    <button
                      key={index}
                      onClick={action.onClick}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                        action.className
                      )}
                    >
                      <action.icon className="w-3.5 h-3.5" />
                      {action.label}
                    </button>
                  )
                ))}
              </div>

              {/* User menu */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">A</span>
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm font-medium text-gray-200">Admin</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

interface SidebarContentProps {
  navigation: any[];
  currentSite: Site | null;
  sites: Site[];
  onClose?: () => void;
  onSwitchSite: (site: Site) => void;
  showSiteSwitcher: boolean;
  setShowSiteSwitcher: (show: boolean) => void;
  pathname: string;
}

function SidebarContent({ 
  navigation, 
  currentSite, 
  sites, 
  onClose, 
  onSwitchSite, 
  showSiteSwitcher, 
  setShowSiteSwitcher,
  pathname 
}: SidebarContentProps) {
  return (
    <div className="flex h-full flex-col bg-gray-800 border-r border-gray-700">
      {/* Logo and site switcher */}
      <div className="flex flex-col border-b border-gray-700">
        <div className="flex h-16 items-center gap-3 px-6">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">DR</span>
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-200">DR CMS</h1>
            <p className="text-xs text-gray-400">Direct Response CMS</p>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-2 -mr-2 lg:hidden">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          )}
        </div>

        {/* Site context switcher */}
        <div className="px-4 pb-4">
          <button
            onClick={() => setShowSiteSwitcher(!showSiteSwitcher)}
            className="w-full flex items-center justify-between p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-3">
              {currentSite ? (
                <>
                  <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-purple-600 rounded flex items-center justify-center">
                    <Building2 className="w-3 h-3 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-200 truncate max-w-[150px]">
                      {currentSite.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      {currentSite.subdomain}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-6 h-6 bg-gray-600 rounded flex items-center justify-center">
                    <LayoutGrid className="w-3 h-3 text-gray-400" />
                  </div>
                  <div className="text-sm font-medium text-gray-300">
                    Global Admin
                  </div>
                </>
              )}
            </div>
            <ChevronDown className={cn(
              "w-4 h-4 text-gray-400 transition-transform",
              showSiteSwitcher && "rotate-180"
            )} />
          </button>

          {/* Site switcher dropdown */}
          {showSiteSwitcher && (
            <div className="mt-2 max-h-64 overflow-y-auto bg-gray-700 rounded-lg border border-gray-600">
              <Link
                href="/admin"
                className="flex items-center gap-3 p-3 hover:bg-gray-600 transition-colors"
                onClick={onClose}
              >
                <div className="w-6 h-6 bg-gray-600 rounded flex items-center justify-center">
                  <LayoutGrid className="w-3 h-3 text-gray-400" />
                </div>
                <div className="text-sm font-medium text-gray-300">
                  Global Dashboard
                </div>
              </Link>
              
              <div className="border-t border-gray-600 my-1"></div>
              
              {sites.map((site) => (
                <button
                  key={site.id}
                  onClick={() => onSwitchSite(site)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-600 transition-colors text-left"
                >
                  <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-purple-600 rounded flex items-center justify-center">
                    <Building2 className="w-3 h-3 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-200 truncate">
                      {site.name}
                    </div>
                    <div className="text-xs text-gray-400 flex items-center gap-2">
                      <span>{site.subdomain}</span>
                      {site.status === 'published' ? (
                        <span className="inline-flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          Live
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                          Draft
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
              
              <div className="border-t border-gray-600 my-1"></div>
              
              <Link
                href="/admin/sites/new"
                className="flex items-center gap-3 p-3 hover:bg-gray-600 transition-colors text-primary-400"
                onClick={onClose}
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">Create New Site</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-900/50 text-primary-300 border-r-2 border-primary-500'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-gray-200'
              )}
              title={item.description}
            >
              <item.icon className={cn(
                'w-5 h-5 flex-shrink-0',
                isActive ? 'text-primary-400' : 'text-gray-400 group-hover:text-gray-300'
              )} />
              <span className="flex-1">{item.name}</span>
              {item.badge && (
                <span className={cn(
                  "inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full",
                  isActive 
                    ? "bg-primary-800 text-primary-200" 
                    : "bg-gray-600 text-gray-300"
                )}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Status indicator */}
      {currentSite && (
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
            <div className="flex-shrink-0">
              {currentSite.status === 'published' ? (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <Eye className="w-4 h-4 text-green-500" />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <Edit3 className="w-4 h-4 text-yellow-500" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="text-xs font-medium text-gray-300">
                {currentSite.status === 'published' ? 'Live Site' : 'Draft Mode'}
              </div>
              <div className="text-xs text-gray-400">
                {currentSite.article_count || 0} articles • {currentSite.total_views || 0} views
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User section */}
      <div className="p-4 border-t border-gray-700">
        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 rounded-lg transition-colors">
          <LogOut className="w-5 h-5 text-gray-400" />
          Sign out
        </button>
      </div>
    </div>
  );
}