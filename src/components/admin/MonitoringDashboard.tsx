'use client';

import { useState, useEffect } from 'react';
import { 
  Activity,
  Database,
  Server,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  FileText,
  Eye,
  Zap
} from 'lucide-react';
import Badge from '@/components/ui/Badge';

interface HealthData {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: Array<{
    service: string;
    status: 'healthy' | 'degraded' | 'unhealthy';
    latency?: number;
    details?: any;
    lastChecked: string;
  }>;
  system: {
    uptime: number;
    memory: {
      used: number;
      total: number;
      external: number;
    };
  };
  application: {
    totalSites: number;
    totalArticles: number;
    publishedSites: number;
    publishedArticles: number;
  };
  timestamp: string;
}

interface AnalyticsData {
  summary: {
    totalSites: number;
    totalArticles: number;
    totalViews: number;
    publishedSites: number;
    publishedArticles: number;
  };
  performance: {
    averageResponseTime: number;
    totalRequests: number;
    errorRate: number;
    cacheHitRate: number;
  };
  growth: {
    sitesGrowth: number;
    articlesGrowth: number;
  };
  activity: Array<{
    date: string;
    sites_created: number;
    articles_created: number;
    total_views: number;
    active_users: number;
  }>;
}

export default function MonitoringDashboard() {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  const fetchData = async () => {
    try {
      const [healthRes, analyticsRes] = await Promise.all([
        fetch('/api/admin/health'),
        fetch('/api/admin/analytics?timeRange=7d')
      ]);

      if (healthRes.ok) {
        const health = await healthRes.json();
        setHealthData(health);
      }

      if (analyticsRes.ok) {
        const analytics = await analyticsRes.json();
        setAnalyticsData(analytics);
      }
    } catch (error) {
      console.error('Error fetching monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    setRefreshInterval(interval);
    
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, []);

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const mins = Math.floor((seconds % (60 * 60)) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400';
      case 'degraded': return 'text-yellow-400';
      case 'unhealthy': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'degraded': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'unhealthy': return <AlertTriangle className="w-5 h-5 text-red-400" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-700 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-xl p-6 h-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-200">System Monitoring</h2>
          <p className="text-gray-400 mt-1">Real-time system health and performance metrics</p>
        </div>
        
        {healthData && (
          <div className="flex items-center gap-3">
            {getStatusIcon(healthData.status)}
            <span className={`font-medium capitalize ${getStatusColor(healthData.status)}`}>
              {healthData.status}
            </span>
          </div>
        )}
      </div>

      {/* Health Status Cards */}
      {healthData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-200">System Uptime</h3>
              <Server className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-gray-200 mb-2">
              {formatUptime(healthData.system.uptime)}
            </div>
            <div className="text-sm text-gray-400">
              Memory: {healthData.system.memory.used}MB / {healthData.system.memory.total}MB
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-200">Database</h3>
              <Database className="w-5 h-5 text-green-400" />
            </div>
            {healthData.checks.find(c => c.service === 'database') && (
              <>
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(healthData.checks.find(c => c.service === 'database')!.status)}
                  <span className={`font-medium capitalize ${getStatusColor(healthData.checks.find(c => c.service === 'database')!.status)}`}>
                    {healthData.checks.find(c => c.service === 'database')!.status}
                  </span>
                </div>
                <div className="text-sm text-gray-400">
                  {healthData.checks.find(c => c.service === 'database')!.latency}ms response
                </div>
              </>
            )}
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-200">Cache</h3>
              <Zap className="w-5 h-5 text-purple-400" />
            </div>
            {healthData.checks.find(c => c.service === 'cache') && (
              <>
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(healthData.checks.find(c => c.service === 'cache')!.status)}
                  <span className={`font-medium capitalize ${getStatusColor(healthData.checks.find(c => c.service === 'cache')!.status)}`}>
                    {healthData.checks.find(c => c.service === 'cache')!.status}
                  </span>
                </div>
                <div className="text-sm text-gray-400">
                  {healthData.checks.find(c => c.service === 'cache')!.latency}ms response
                </div>
              </>
            )}
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-200">Application</h3>
              <Activity className="w-5 h-5 text-orange-400" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Sites:</span>
                <span className="text-gray-200">{healthData.application.totalSites}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Articles:</span>
                <span className="text-gray-200">{healthData.application.totalArticles}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Overview */}
      {analyticsData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Metrics */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Performance Metrics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Avg Response Time</span>
                <span className="text-gray-200 font-medium">
                  {Math.round(analyticsData.performance.averageResponseTime)}ms
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Cache Hit Rate</span>
                <span className="text-green-400 font-medium">
                  {Math.round(analyticsData.performance.cacheHitRate)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Error Rate</span>
                <span className={`font-medium ${analyticsData.performance.errorRate < 1 ? 'text-green-400' : 'text-yellow-400'}`}>
                  {analyticsData.performance.errorRate.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Requests</span>
                <span className="text-gray-200 font-medium">
                  {analyticsData.performance.totalRequests.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Content Statistics */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Content Overview</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1">
                  {analyticsData.summary.totalSites}
                </div>
                <div className="text-sm text-gray-400">Total Sites</div>
                <div className="text-xs text-green-400 mt-1">
                  {analyticsData.growth.sitesGrowth > 0 ? '+' : ''}{analyticsData.growth.sitesGrowth.toFixed(1)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">
                  {analyticsData.summary.totalArticles}
                </div>
                <div className="text-sm text-gray-400">Total Articles</div>
                <div className="text-xs text-green-400 mt-1">
                  {analyticsData.growth.articlesGrowth > 0 ? '+' : ''}{analyticsData.growth.articlesGrowth.toFixed(1)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400 mb-1">
                  {analyticsData.summary.publishedSites}
                </div>
                <div className="text-sm text-gray-400">Published Sites</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400 mb-1">
                  {analyticsData.summary.totalViews.toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">Total Views</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity Timeline */}
      {analyticsData && analyticsData.activity && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">Activity Timeline (Last 7 Days)</h3>
          <div className="overflow-x-auto">
            <div className="flex gap-4 min-w-max">
              {analyticsData.activity.map((day) => (
                <div key={day.date} className="text-center min-w-20">
                  <div className="text-xs text-gray-400 mb-2">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="bg-gray-700 rounded-lg p-3 space-y-2">
                    <div className="text-xs text-gray-400">Sites</div>
                    <div className="text-sm font-medium text-blue-400">{day.sites_created}</div>
                    <div className="text-xs text-gray-400">Articles</div>
                    <div className="text-sm font-medium text-green-400">{day.articles_created}</div>
                    <div className="text-xs text-gray-400">Views</div>
                    <div className="text-sm font-medium text-orange-400">{day.total_views}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Last Updated */}
      {healthData && (
        <div className="text-center text-sm text-gray-400">
          Last updated: {new Date(healthData.timestamp).toLocaleTimeString()}
          <span className="ml-2">• Auto-refresh every 30 seconds</span>
        </div>
      )}
    </div>
  );
}