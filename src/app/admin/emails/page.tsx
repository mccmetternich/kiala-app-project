'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Download,
  Mail,
  Users,
  Calendar,
  Trash2,
  Search,
  Check,
  Clock,
  TrendingUp,
  Globe,
  X,
  RefreshCw
} from 'lucide-react';
import EnhancedAdminLayout from '@/components/admin/EnhancedAdminLayout';
import { formatDistanceToNow } from 'date-fns';

interface EmailSubscriber {
  id: string;
  site_id: string;
  email: string;
  name?: string;
  source: string;
  tags?: string;
  status: string;
  ip_address?: string;
  user_agent?: string;
  page_url?: string;
  subscribed_at: string;
  created_at: string;
}

interface Site {
  id: string;
  name: string;
  domain: string;
  subdomain: string;
}

type DatePreset = 'all' | 'today' | 'week' | 'month' | 'quarter' | 'custom';

export default function EmailsPage() {
  const searchParams = useSearchParams();
  const preselectedSiteId = searchParams.get('siteId');

  const [allSubscribers, setAllSubscribers] = useState<EmailSubscriber[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSiteIds, setSelectedSiteIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Filter states
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'unsubscribed'>('all');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    loadSites();
  }, []);

  // Load subscribers when selected sites change
  useEffect(() => {
    if (selectedSiteIds.size > 0) {
      loadAllSubscribers();
    } else {
      setAllSubscribers([]);
    }
  }, [selectedSiteIds]);

  const loadSites = async () => {
    try {
      const sitesResponse = await fetch('/api/sites');
      if (sitesResponse.ok) {
        const sitesData = await sitesResponse.json();
        const sitesList = sitesData.sites || [];
        setSites(sitesList);

        // If there's a preselected site from URL, only select that site
        // Otherwise, select all sites by default
        if (sitesList.length > 0 && !initialLoadDone) {
          if (preselectedSiteId && sitesList.some((s: Site) => s.id === preselectedSiteId)) {
            setSelectedSiteIds(new Set([preselectedSiteId]));
          } else {
            setSelectedSiteIds(new Set(sitesList.map((s: Site) => s.id)));
          }
          setInitialLoadDone(true);
        }
      }
    } catch (error) {
      console.error('Error loading sites:', error);
    }
  };

  const loadAllSubscribers = async () => {
    if (selectedSiteIds.size === 0) {
      setAllSubscribers([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch subscribers for all selected sites
      const promises = Array.from(selectedSiteIds).map(siteId =>
        fetch(`/api/subscribers?siteId=${siteId}`).then(r => r.ok ? r.json() : { subscribers: [] })
      );

      const results = await Promise.all(promises);
      const combined = results.flatMap(r => r.subscribers || []);

      // Sort by created_at descending
      combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setAllSubscribers(combined);
    } catch (error) {
      console.error('Error loading subscribers:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSite = (siteId: string) => {
    setSelectedSiteIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(siteId)) {
        newSet.delete(siteId);
      } else {
        newSet.add(siteId);
      }
      return newSet;
    });
  };

  const selectAllSites = () => {
    setSelectedSiteIds(new Set(sites.map(s => s.id)));
  };

  const deselectAllSites = () => {
    setSelectedSiteIds(new Set());
  };

  // Calculate date range based on preset
  const getDateRange = () => {
    const now = new Date();
    let startDate = '';
    let endDate = now.toISOString().split('T')[0];

    switch (datePreset) {
      case 'today':
        startDate = endDate;
        break;
      case 'week':
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        startDate = weekAgo.toISOString().split('T')[0];
        break;
      case 'month':
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        startDate = monthAgo.toISOString().split('T')[0];
        break;
      case 'quarter':
        const quarterAgo = new Date(now);
        quarterAgo.setMonth(quarterAgo.getMonth() - 3);
        startDate = quarterAgo.toISOString().split('T')[0];
        break;
      case 'custom':
        startDate = customStartDate;
        endDate = customEndDate || endDate;
        break;
      case 'all':
      default:
        startDate = '';
        endDate = '';
    }

    return { startDate, endDate };
  };

  const handleDownloadCSV = async () => {
    if (filteredSubscribers.length === 0) {
      return;
    }

    try {
      setIsDownloading(true);

      // Generate CSV from filtered subscribers
      const csvHeaders = ['Email', 'Name', 'Site', 'Source', 'Status', 'Signed Up'];
      const csvRows = filteredSubscribers.map(sub => {
        const site = sites.find(s => s.id === sub.site_id);
        return [
          sub.email,
          sub.name || '',
          site?.name || sub.site_id,
          sub.source || 'website',
          sub.status,
          new Date(sub.created_at).toISOString()
        ];
      });

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = downloadUrl;

      // Generate filename
      let filename = `subscribers`;
      if (datePreset !== 'all') {
        filename += `-${datePreset}`;
      }
      filename += `-${new Date().toISOString().split('T')[0]}.csv`;

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (error) {
      console.error('Error downloading CSV:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleUnsubscribe = async (subscriber: EmailSubscriber) => {
    if (!confirm('Are you sure you want to unsubscribe this email?')) return;

    try {
      const response = await fetch(`/api/subscribers?siteId=${subscriber.site_id}&email=${encodeURIComponent(subscriber.email)}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        loadAllSubscribers();
      }
    } catch (error) {
      console.error('Error unsubscribing:', error);
    }
  };

  // Filter emails client-side for display
  const filteredSubscribers = useMemo(() => {
    let filtered = allSubscribers;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(sub =>
        sub.email.toLowerCase().includes(term) ||
        sub.source.toLowerCase().includes(term) ||
        (sub.name && sub.name.toLowerCase().includes(term))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(sub => sub.status === statusFilter);
    }

    // Date filter
    const { startDate, endDate } = getDateRange();
    if (startDate) {
      filtered = filtered.filter(sub => {
        const subDate = new Date(sub.created_at);
        return subDate >= new Date(startDate);
      });
    }
    if (endDate) {
      filtered = filtered.filter(sub => {
        const subDate = new Date(sub.created_at);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return subDate <= end;
      });
    }

    return filtered;
  }, [allSubscribers, searchTerm, statusFilter, datePreset, customStartDate, customEndDate]);

  // Calculate stats from filtered data
  const stats = useMemo(() => {
    const total = filteredSubscribers.length;
    const active = filteredSubscribers.filter(s => s.status === 'active').length;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const thisWeek = filteredSubscribers.filter(s => new Date(s.created_at) >= weekAgo).length;
    const unsubscribed = total - active;
    return { total, active, thisWeek, unsubscribed };
  }, [filteredSubscribers]);

  const datePresets = [
    { id: 'all' as DatePreset, label: 'All Time', icon: Globe },
    { id: 'today' as DatePreset, label: 'Today', icon: Calendar },
    { id: 'week' as DatePreset, label: 'Last 7 Days', icon: Clock },
    { id: 'month' as DatePreset, label: 'Last 30 Days', icon: Calendar },
    { id: 'quarter' as DatePreset, label: 'Last 90 Days', icon: TrendingUp },
  ];

  return (
    <EnhancedAdminLayout>
      <div className="min-h-screen bg-gray-900">
        <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">

          {/* Filters Section */}
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-5 space-y-5">
            {/* Sites Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-300">Sites</label>
                <div className="flex gap-2">
                  <button
                    onClick={selectAllSites}
                    className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
                  >
                    Select All
                  </button>
                  <span className="text-gray-600">|</span>
                  <button
                    onClick={deselectAllSites}
                    className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    Deselect All
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {sites.map((site) => (
                  <button
                    key={site.id}
                    onClick={() => toggleSite(site.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      selectedSiteIds.has(site.id)
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-gray-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                      selectedSiteIds.has(site.id)
                        ? 'bg-white border-white'
                        : 'border-gray-500'
                    }`}>
                      {selectedSiteIds.has(site.id) && (
                        <Check className="w-3 h-3 text-primary-600" />
                      )}
                    </div>
                    {site.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Presets */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Date Range</label>
              <div className="flex flex-wrap gap-2">
                {datePresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setDatePreset(preset.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      datePreset === preset.id
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <preset.icon className="w-4 h-4" />
                    {preset.label}
                  </button>
                ))}
                <button
                  onClick={() => setDatePreset('custom')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    datePreset === 'custom'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Custom Range
                </button>
              </div>

              {/* Custom Date Range */}
              {datePreset === 'custom' && (
                <div className="grid md:grid-cols-2 gap-4 mt-4 p-4 bg-gray-700/50 rounded-xl">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Status</label>
              <div className="flex gap-2">
                {[
                  { id: 'all' as const, label: 'All' },
                  { id: 'active' as const, label: 'Active Only' },
                  { id: 'unsubscribed' as const, label: 'Unsubscribed Only' },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setStatusFilter(option.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      statusFilter === option.id
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Download Button */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-700">
              <div className="flex items-center gap-4">
                <button
                  onClick={loadAllSubscribers}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl text-sm text-gray-300 transition-all"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <span className="text-sm text-gray-400">
                  {filteredSubscribers.length.toLocaleString()} emails match filters
                </span>
              </div>
              <button
                onClick={handleDownloadCSV}
                disabled={isDownloading || filteredSubscribers.length === 0}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  downloadSuccess
                    ? 'bg-green-600 text-white'
                    : 'bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-600/20'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isDownloading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Preparing...
                  </>
                ) : downloadSuccess ? (
                  <>
                    <Check className="w-5 h-5" />
                    Downloaded!
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Download {filteredSubscribers.length.toLocaleString()} Emails
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Subscribers', value: stats.total, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { label: 'Active', value: stats.active, icon: Check, color: 'text-green-400', bg: 'bg-green-500/10' },
              { label: 'This Week', value: stats.thisWeek, icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/10' },
              { label: 'Unsubscribed', value: stats.unsubscribed, icon: X, color: 'text-red-400', bg: 'bg-red-500/10' },
            ].map((stat, i) => (
              <div key={i} className="bg-gray-800 rounded-2xl border border-gray-700 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">{stat.label}</p>
                    <p className="text-3xl font-bold text-white mt-1">{stat.value.toLocaleString()}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Search & Email List */}
          <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
            {/* Search Header */}
            <div className="p-5 border-b border-gray-700">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold text-white">
                  All Subscribers
                  <span className="text-sm font-normal text-gray-400 ml-2">
                    ({filteredSubscribers.length.toLocaleString()})
                  </span>
                </h2>
                <div className="relative w-full max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search emails..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* List */}
            {loading ? (
              <div className="p-12 text-center">
                <div className="w-10 h-10 border-3 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400">Loading subscribers...</p>
              </div>
            ) : selectedSiteIds.size === 0 ? (
              <div className="p-12 text-center">
                <Mail className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Select at least one site to view subscribers</p>
              </div>
            ) : filteredSubscribers.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No subscribers found</h3>
                <p className="text-gray-400">
                  {searchTerm || statusFilter !== 'all' || datePreset !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Subscribers will appear here when people sign up'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-850">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Subscriber
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Site
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Source
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Signed Up
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/50">
                    {filteredSubscribers.map((subscriber) => {
                      const site = sites.find(s => s.id === subscriber.site_id);
                      return (
                        <tr key={subscriber.id} className="hover:bg-gray-750 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-700 rounded-xl flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-medium text-gray-300">
                                  {subscriber.email.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white">{subscriber.email}</p>
                                {subscriber.name && (
                                  <p className="text-xs text-gray-500">{subscriber.name}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-300">
                              {site?.name || 'Unknown'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-900/50 text-blue-300">
                              {subscriber.source}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                              subscriber.status === 'active'
                                ? 'bg-green-900/50 text-green-300'
                                : 'bg-red-900/50 text-red-300'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                subscriber.status === 'active' ? 'bg-green-400' : 'bg-red-400'
                              }`}></span>
                              {subscriber.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-200">
                              {formatDistanceToNow(new Date(subscriber.created_at.endsWith('Z') ? subscriber.created_at : subscriber.created_at + 'Z'), { addSuffix: true })}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(subscriber.created_at.endsWith('Z') ? subscriber.created_at : subscriber.created_at + 'Z').toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {subscriber.status === 'active' && (
                              <button
                                onClick={() => handleUnsubscribe(subscriber)}
                                className="p-2 text-gray-500 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-all"
                                title="Unsubscribe"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Footer with count */}
            {filteredSubscribers.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-700 bg-gray-850">
                <p className="text-sm text-gray-400">
                  Showing <span className="text-white font-medium">{filteredSubscribers.length.toLocaleString()}</span> of{' '}
                  <span className="text-white font-medium">{allSubscribers.length.toLocaleString()}</span> total subscribers
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </EnhancedAdminLayout>
  );
}
