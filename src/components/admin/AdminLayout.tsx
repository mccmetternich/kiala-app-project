import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  Bell,
  Search,
  Plus,
  Edit3
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutGrid },
  { name: 'Sites', href: '/admin/sites', icon: Globe },
  { name: 'Articles', href: '/admin/articles', icon: Edit3 },
  { name: 'Pages', href: '/admin/pages', icon: FileText },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-gray-800 shadow-xl">
            <SidebarContent pathname={pathname} onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <SidebarContent pathname={pathname} />
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-gray-800 border-b border-gray-700 shadow-sm">
          <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -m-2 text-gray-400 hover:text-gray-200"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex-1 flex items-center gap-4">
              <div className="max-w-lg flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search pages, sites, content..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <button className="btn-primary flex items-center gap-2">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:block">New Site</span>
              </button>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-400 hover:text-gray-200 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">MM</span>
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm font-medium text-gray-200">Matthias</div>
                  <div className="text-xs text-gray-400">Admin</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 admin-content">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ pathname, onClose }: { pathname: string; onClose?: () => void }) {
  return (
    <div className="flex h-full flex-col bg-gray-800 border-r border-gray-700">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-gray-700">
        <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">DR</span>
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-200">DR CMS</h1>
          <p className="text-xs text-gray-400">Admin Panel</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="ml-auto p-2 -mr-2 lg:hidden">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-900/50 text-primary-300 border-r-2 border-primary-500'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-gray-200'
              )}
            >
              <item.icon className={cn(
                'w-5 h-5 flex-shrink-0',
                isActive ? 'text-primary-400' : 'text-gray-400 group-hover:text-gray-300'
              )} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-gray-700">
        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 rounded-lg transition-colors">
          <LogOut className="w-5 h-5 text-gray-400" />
          Sign out
        </button>
      </div>
    </div>
  );
}