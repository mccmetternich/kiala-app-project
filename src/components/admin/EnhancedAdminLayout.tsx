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
  Menu,
  X,
  LogOut,
  Plus,
  Edit3,
  ChevronDown,
  Building2,
  BookOpen
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

  // Load sites on mount
  useEffect(() => {
    loadSites();
  }, []);

  // Detect current site when pathname or sites change
  useEffect(() => {
    const siteMatch = pathname.match(/\/admin\/sites\/([^\/]+)/);
    if (siteMatch && sites.length > 0) {
      const siteId = siteMatch[1];
      // Exclude special routes like "new"
      if (siteId === 'new') {
        setCurrentSite(null);
        return;
      }
      const site = sites.find(s => s.id === siteId);
      setCurrentSite(site || null);
    } else if (!siteMatch) {
      setCurrentSite(null);
    }
  }, [pathname, sites]);

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
        } else if (segments[3] === 'content-profile') {
          breadcrumbs.push({ label: 'Content Profile', current: true });
        }
      }
    } else if (segments[1] === 'sites' && segments[2] === 'new') {
      breadcrumbs.push({ label: 'Create Site', current: true });
    } else if (segments[1] === 'sites') {
      breadcrumbs.push({ label: 'All Sites', current: true });
    }

    return breadcrumbs;
  };

  // Global navigation - NEVER changes
  const globalNavigation = [
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
      name: 'All Emails',
      href: '/admin/emails',
      icon: Users,
      description: 'All email subscribers'
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
      description: 'Global analytics'
    }
  ];

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-72 bg-gray-800 shadow-xl">
            <SidebarContent
              navigation={globalNavigation}
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
          navigation={globalNavigation}
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
        {/* Top bar - breadcrumbs only */}
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

      {/* Navigation - Always global */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navigation.map((item) => {
          // More precise active state detection
          const isExactMatch = pathname === item.href;
          const isChildMatch = item.href !== '/admin' && pathname.startsWith(item.href + '/');
          // For dashboard, only highlight on exact match
          const isActive = item.href === '/admin' ? isExactMatch : (isExactMatch || isChildMatch);
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

// Export site navigation items for use in site dashboard pages
export const getSiteNavigation = (siteId: string) => [
  {
    name: 'Overview',
    href: `/admin/sites/${siteId}/dashboard`,
    icon: LayoutGrid,
  },
  {
    name: 'Articles',
    href: `/admin/sites/${siteId}/articles`,
    icon: Edit3,
  },
  {
    name: 'Pages',
    href: `/admin/sites/${siteId}/pages`,
    icon: FileText,
  },
  {
    name: 'Email Signups',
    href: `/admin/sites/${siteId}/emails`,
    icon: Users,
  },
  {
    name: 'Analytics',
    href: `/admin/sites/${siteId}/analytics`,
    icon: BarChart3,
  },
  {
    name: 'Content Profile',
    href: `/admin/sites/${siteId}/content-profile`,
    icon: BookOpen,
  },
  {
    name: 'Settings',
    href: `/admin/sites/${siteId}/settings`,
    icon: Settings,
  }
];
