'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Globe, 
  FileText, 
  Eye, 
  TrendingUp, 
  Users, 
  Plus,
  Calendar,
  Clock,
  Edit3,
  MoreVertical,
  ExternalLink
} from 'lucide-react';
import EnhancedAdminLayout from '@/components/admin/EnhancedAdminLayout';
import Badge from '@/components/ui/Badge';
import { clientAPI } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';

export default function AdminDashboard() {
  const [timeframe, setTimeframe] = useState('7d');
  const [sites, setSites] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        // Load real dashboard stats from new API
        const statsResponse = await fetch(`/api/admin/dashboard-stats?timeframe=${timeframe}`);
        const statsData = await statsResponse.json();

        // Load basic site and article data for UI
        const [sitesData, articlesData] = await Promise.all([
          clientAPI.getAllSites(),
          clientAPI.getAllArticles()
        ]);

        setSites(sitesData);
        setArticles(articlesData.slice(0, 3)); // Show recent 3 articles
        setDashboardData(statsData.stats);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [timeframe]); // Reload when timeframe changes

  const dashboardStats = dashboardData ? [
    { name: 'Total Sites', value: dashboardData.totalSites.toString(), change: `${dashboardData.totalSites} active`, trend: 'up', icon: Globe },
    { name: 'Total Articles', value: dashboardData.totalArticles.toString(), change: dashboardData.articleGrowth, trend: 'up', icon: FileText },
    { name: 'Total Views', value: dashboardData.totalViews >= 1000 ? `${(dashboardData.totalViews / 1000).toFixed(1)}K` : dashboardData.totalViews.toString(), change: `${dashboardData.totalViews} total`, trend: 'up', icon: Eye },
    { name: 'Email Signups', value: dashboardData.totalEmails.toString(), change: `${dashboardData.emailGrowth} growth`, trend: 'up', icon: Users },
  ] : [];

  if (loading) {
    return (
      <EnhancedAdminLayout>
        <div className="p-6 max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/4 mb-4"></div>
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

  return (
    <EnhancedAdminLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-200">Dashboard</h1>
            <p className="text-gray-400 mt-1">Welcome back! Here's what's happening with your sites.</p>
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
            
            <Link href="/admin/sites/new" className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Site
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
                <div className="w-12 h-12 bg-primary-900/50 rounded-xl flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-primary-400" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Site Performance Analytics */}
        {dashboardData?.sitePerformance && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-200">Site Performance</h2>
                <Link href="/admin/sites" className="text-primary-400 hover:text-primary-300 text-sm font-medium">
                  View all sites →
                </Link>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {dashboardData.sitePerformance.slice(0, 5).map((site: any) => (
                  <div key={site.siteId} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-200">{site.siteName}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                        <span>{site.articlesCount} articles</span>
                        <span>{site.viewsCount >= 1000 ? `${(site.viewsCount / 1000).toFixed(1)}K` : site.viewsCount} views</span>
                        <span>{site.emailsCount} emails</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-green-400">{site.conversionRate}%</div>
                      <div className="text-xs text-gray-400">conversion</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Top Articles Across All Sites */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-200">Top Articles</h2>
                <Link href="/admin/articles" className="text-primary-400 hover:text-primary-300 text-sm font-medium">
                  View all →
                </Link>
              </div>
            </div>
            
            <div className="divide-y divide-gray-700">
              {sites.slice(0, 3).map((site) => {
                const brand = typeof site.brand_profile === 'string' ? JSON.parse(site.brand_profile) : site.brand_profile;
                const status = site.published ? 'live' : 'draft';
                
                return (
                  <div key={site.id} className="p-6 hover:bg-gray-700 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-200">{site.name}</h3>
                          <Badge variant={status === 'live' ? 'trust' : 'default'} size="sm">
                            {status === 'live' ? '🟢 Live' : '🟡 Draft'}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-400 mb-2">{site.domain}</p>
                        <p className="text-xs text-gray-500">by {brand?.name || 'Unknown'}</p>
                        
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            {site.article_count || 0} articles
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {site.total_views || 0} views
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatDistanceToNow(new Date(site.updated_at || site.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Link 
                          href={`/admin/sites/${site.id}/settings`}
                          className="p-2 text-gray-500 hover:text-primary-400 hover:bg-gray-800 rounded-lg transition-colors"
                          title="Manage site"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        
                        <Link 
                          href={`/site/${site.id}`}
                          target="_blank"
                          className="p-2 text-gray-500 hover:text-primary-400 hover:bg-gray-800 rounded-lg transition-colors"
                          title="View live site"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        
                        <button className="p-2 text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded-lg transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-200">Recent Activity</h2>
                <span className="text-sm text-gray-400">Last {timeframe}</span>
              </div>
            </div>
            
            <div className="divide-y divide-gray-700">
              {dashboardData?.recentActivity?.map((activity: any, index: number) => (
                <div key={index} className="p-6 hover:bg-gray-700 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      activity.type === 'email_signup' ? 'bg-green-900/50' : 'bg-blue-900/50'
                    }`}>
                      {activity.type === 'email_signup' ? (
                        <Users className="w-5 h-5 text-green-400" />
                      ) : (
                        <FileText className="w-5 h-5 text-blue-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-200">{activity.description}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              )) || (
                <div className="p-6 text-center text-gray-400">
                  No recent activity
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-200 mb-6">Quick Actions</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link 
              href="/admin/sites/new"
              className="p-4 border-2 border-dashed border-gray-600 rounded-xl hover:border-primary-500 hover:bg-gray-700 transition-colors group"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-200 mb-1">Create New Site</h3>
                <p className="text-sm text-gray-400">Launch a new DR site</p>
              </div>
            </Link>
            
            <Link 
              href="/admin/articles"
              className="p-4 border-2 border-dashed border-gray-600 rounded-xl hover:border-blue-500 hover:bg-gray-700 transition-colors group"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-200 mb-1">Manage Articles</h3>
                <p className="text-sm text-gray-400">All content across sites</p>
              </div>
            </Link>
            
            <Link 
              href="/admin/emails"
              className="p-4 border-2 border-dashed border-gray-600 rounded-xl hover:border-green-500 hover:bg-gray-700 transition-colors group"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-200 mb-1">Email Management</h3>
                <p className="text-sm text-gray-400">All subscribers & exports</p>
              </div>
            </Link>
            
            <Link 
              href="/admin/monitoring"
              className="p-4 border-2 border-dashed border-gray-600 rounded-xl hover:border-orange-500 hover:bg-gray-700 transition-colors group"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-200 mb-1">System Monitor</h3>
                <p className="text-sm text-gray-400">Performance & health</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </EnhancedAdminLayout>
  );
}