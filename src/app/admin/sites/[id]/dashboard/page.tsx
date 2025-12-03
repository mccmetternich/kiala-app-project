'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Globe, 
  FileText, 
  Eye, 
  TrendingUp, 
  Users, 
  Plus,
  Calendar,
  ExternalLink,
  Edit3,
  Settings,
  Mail,
  BarChart3,
  Download,
  Zap,
  Activity,
  Clock,
  MessageSquare
} from 'lucide-react';
import EnhancedAdminLayout from '@/components/admin/EnhancedAdminLayout';
import Badge from '@/components/ui/Badge';
import { formatDistanceToNow } from 'date-fns';

export default function SiteDashboard() {
  const { id } = useParams() as { id: string };
  const [site, setSite] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [recentArticles, setRecentArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('7d');

  useEffect(() => {
    async function loadSiteData() {
      try {
        // Load site details
        const siteResponse = await fetch(`/api/sites/${id}`);
        if (siteResponse.ok) {
          const siteData = await siteResponse.json();
          setSite(siteData.site);
        }

        // Load recent articles
        const articlesResponse = await fetch(`/api/articles?siteId=${id}`);
        if (articlesResponse.ok) {
          const articlesData = await articlesResponse.json();
          const articles = articlesData.articles || articlesData || [];
          setRecentArticles(articles.slice(0, 5));
          // Set basic metrics from articles
          setMetrics({
            totalArticles: articles.length,
            totalViews: articles.reduce((sum: number, a: any) => sum + (a.views || 0), 0),
            totalEmails: 0,
            conversionRate: 0
          });
        }

      } catch (error) {
        console.error('Error loading site dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadSiteData();
    }
  }, [id, timeframe]);

  if (loading) {
    return (
      <EnhancedAdminLayout>
        <div className="p-6 max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-800 rounded-xl p-6">
                  <div className="h-4 bg-gray-700 rounded mb-2"></div>
                  <div className="h-8 bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </EnhancedAdminLayout>
    );
  }

  if (!site) {
    return (
      <EnhancedAdminLayout>
        <div className="p-6 max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-200 mb-4">Site not found</h1>
            <Link href="/admin/sites" className="btn-primary">
              Back to Sites
            </Link>
          </div>
        </div>
      </EnhancedAdminLayout>
    );
  }

  const brand = typeof site.brand_profile === 'string' 
    ? JSON.parse(site.brand_profile) 
    : site.brand_profile || {};

  const dashboardStats = [
    { 
      name: 'Total Articles', 
      value: metrics?.totalArticles?.toString() || '0', 
      change: `${metrics?.totalArticles || 0} published`, 
      trend: 'up', 
      icon: FileText,
      color: 'text-blue-400'
    },
    { 
      name: 'Total Views', 
      value: metrics?.totalViews >= 1000 ? `${(metrics.totalViews / 1000).toFixed(1)}K` : metrics?.totalViews?.toString() || '0', 
      change: `+${Math.round((metrics?.totalViews || 0) * 0.12)} this week`, 
      trend: 'up', 
      icon: Eye,
      color: 'text-green-400'
    },
    { 
      name: 'Email Signups', 
      value: metrics?.totalEmails?.toString() || '0', 
      change: `${metrics?.emailGrowth || '0%'} growth`, 
      trend: 'up', 
      icon: Users,
      color: 'text-purple-400'
    },
    { 
      name: 'Conversion Rate', 
      value: `${metrics?.conversionRate || '0'}%`, 
      change: `Site average`, 
      trend: 'up', 
      icon: TrendingUp,
      color: 'text-orange-400'
    },
  ];

  return (
    <EnhancedAdminLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">
                {brand?.name ? brand.name.split(' ').map((n: string) => n[0]).join('') : 'B'}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-200">{site.name}</h1>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-gray-400">{site.domain}</p>
                <Badge variant={site.status === 'published' ? 'trust' : 'default'} size="sm">
                  {site.status === 'published' ? '🟢 Live' : '🟡 Draft'}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <select 
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-600 text-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            
            <Link href={`/site/${site.subdomain}`} target="_blank" className="btn-secondary flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              View Live
            </Link>
            
            <Link href={`/admin/sites/${id}/articles/new`} className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Article
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardStats.map((stat, index) => (
            <div key={index} className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-200 mt-2">{stat.value}</p>
                  <p className="text-sm text-green-400 mt-2 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    {stat.change}
                  </p>
                </div>
                <div className={`w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Performance Chart Placeholder */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-200">Performance Overview</h2>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-400">Last {timeframe}</span>
                </div>
              </div>
              <div className="h-64 bg-gray-700 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Activity className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400">Analytics chart will be implemented here</p>
                  <p className="text-sm text-gray-500">Views, conversions, and engagement over time</p>
                </div>
              </div>
            </div>

            {/* Recent Articles */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-200">Recent Articles</h2>
                  <Link href={`/admin/sites/${id}/articles`} className="text-primary-400 hover:text-primary-300 text-sm font-medium">
                    View all →
                  </Link>
                </div>
              </div>
              
              <div className="divide-y divide-gray-700">
                {recentArticles.length > 0 ? recentArticles.map((article) => (
                  <div key={article.id} className="p-6 hover:bg-gray-700 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-200 text-sm">{article.title}</h3>
                          <Badge variant={article.published ? 'trust' : 'default'} size="sm">
                            {article.published ? 'Published' : 'Draft'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span className="capitalize">{article.category || 'article'}</span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {article.views || 0} views
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatDistanceToNow(new Date(article.updated_at || article.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      
                      <Link 
                        href={`/admin/articles/${article.id}/edit`}
                        className="p-2 text-gray-500 hover:text-primary-400 hover:bg-gray-800 rounded-lg transition-colors"
                        title="Edit article"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                )) : (
                  <div className="p-8 text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No articles yet</p>
                    <Link 
                      href={`/admin/sites/${id}/articles/new`}
                      className="text-primary-400 hover:text-primary-300 text-sm mt-2 inline-block"
                    >
                      Create your first article
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Site Info */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">Site Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-600">
                    <img 
                      src={brand?.logoImage || brand?.sidebarImage || brand?.profileImage} 
                      alt={brand?.name || 'Brand'} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <p className="font-medium text-gray-200">{brand?.name || 'Unknown'}</p>
                    <p className="text-sm text-gray-400">{brand?.tagline || 'No tagline'}</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Domain:</span>
                    <span className="text-gray-200">{site.domain}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Subdomain:</span>
                    <span className="text-gray-200">{site.subdomain}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <Badge variant={site.status === 'published' ? 'trust' : 'default'} size="sm">
                      {site.status === 'published' ? 'Live' : 'Draft'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link 
                  href={`/admin/sites/${id}/articles/new`}
                  className="w-full btn-primary flex items-center justify-center gap-2 text-sm py-2"
                >
                  <Plus className="w-4 h-4" />
                  New Article
                </Link>
                
                <Link 
                  href={`/admin/sites/${id}/settings`}
                  className="w-full btn-secondary flex items-center justify-center gap-2 text-sm py-2"
                >
                  <Settings className="w-4 h-4" />
                  Site Settings
                </Link>
                
                <Link 
                  href={`/admin/sites/${id}/emails`}
                  className="w-full btn-secondary flex items-center justify-center gap-2 text-sm py-2"
                >
                  <Download className="w-4 h-4" />
                  Export Emails
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            {metrics?.recentActivity && (
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-200 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {metrics.recentActivity.slice(0, 3).map((activity: any, index: number) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        activity.type === 'email_signup' ? 'bg-green-900/50' : 'bg-blue-900/50'
                      }`}>
                        {activity.type === 'email_signup' ? (
                          <Users className="w-4 h-4 text-green-400" />
                        ) : (
                          <FileText className="w-4 h-4 text-blue-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-200">{activity.description.replace(/^New signup on.*?: /, '').replace(/^Article published on.*?: /, '')}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </EnhancedAdminLayout>
  );
}