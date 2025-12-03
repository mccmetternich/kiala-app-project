'use client';

import { useState, useEffect } from 'react';
import {
  Download,
  Mail,
  Users,
  Calendar,
  ExternalLink,
  Trash2,
  Search
} from 'lucide-react';
import EnhancedAdminLayout from '@/components/admin/EnhancedAdminLayout';

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

export default function EmailsPage() {
  const [subscribers, setSubscribers] = useState<EmailSubscriber[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [stats, setStats] = useState({ total: 0, active: 0, thisWeek: 0, unsubscribed: 0 });

  useEffect(() => {
    loadSites();
  }, []);

  useEffect(() => {
    if (selectedSiteId) {
      loadSubscribers();
    }
  }, [selectedSiteId]);

  const loadSites = async () => {
    try {
      const sitesResponse = await fetch('/api/sites');
      if (sitesResponse.ok) {
        const sitesData = await sitesResponse.json();
        const sitesList = sitesData.sites || [];
        setSites(sitesList);
        // Auto-select first site if available
        if (sitesList.length > 0 && !selectedSiteId) {
          setSelectedSiteId(sitesList[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading sites:', error);
    }
  };

  const loadSubscribers = async () => {
    if (!selectedSiteId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/subscribers?siteId=${selectedSiteId}`);
      if (response.ok) {
        const data = await response.json();
        setSubscribers(data.subscribers || []);
        setStats(data.stats || { total: 0, active: 0, thisWeek: 0, unsubscribed: 0 });
      }
    } catch (error) {
      console.error('Error loading subscribers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = async () => {
    if (!selectedSiteId) {
      alert('Please select a site first');
      return;
    }

    try {
      setIsDownloading(true);
      const response = await fetch(`/api/subscribers?siteId=${selectedSiteId}&format=csv`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `subscribers-${selectedSiteId}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading CSV:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleUnsubscribe = async (email: string) => {
    if (!selectedSiteId) return;
    if (!confirm('Are you sure you want to unsubscribe this email?')) return;

    try {
      const response = await fetch(`/api/subscribers?siteId=${selectedSiteId}&email=${encodeURIComponent(email)}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        loadSubscribers(); // Refresh the list
      }
    } catch (error) {
      console.error('Error unsubscribing:', error);
    }
  };

  // Filter emails based on search term
  const filteredSubscribers = subscribers.filter(sub =>
    sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sub.name && sub.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedSite = sites.find(site => site.id === selectedSiteId);

  return (
    <EnhancedAdminLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-900/50 rounded-lg">
                <Mail className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-200">Email Signups</h1>
                <p className="text-gray-400">Manage email subscriptions across all sites</p>
              </div>
            </div>

            <button
              onClick={handleDownloadCSV}
              disabled={isDownloading}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {isDownloading ? 'Downloading...' : 'Download CSV'}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-gray-200">{stats.total}</p>
                <p className="text-sm text-gray-400">Total Subscribers</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-gray-200">{stats.active}</p>
                <p className="text-sm text-gray-400">Active</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center gap-3">
              <Mail className="w-8 h-8 text-purple-400" />
              <div>
                <p className="text-2xl font-bold text-gray-200">{stats.thisWeek}</p>
                <p className="text-sm text-gray-400">This Week</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center gap-3">
              <ExternalLink className="w-8 h-8 text-orange-400" />
              <div>
                <p className="text-2xl font-bold text-gray-200">{stats.unsubscribed}</p>
                <p className="text-sm text-gray-400">Unsubscribed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Site Filter and Search */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Filter by Site
              </label>
              <select
                value={selectedSiteId}
                onChange={(e) => setSelectedSiteId(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-primary-500"
              >
                <option value="">All Sites</option>
                {sites.map(site => (
                  <option key={site.id} value={site.id}>
                    {site.name} ({site.subdomain})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Search Emails
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by email or source..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 text-gray-200 placeholder-gray-400 rounded-lg focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Email List */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-gray-200">
              Email Signups
              {selectedSite && (
                <span className="text-sm font-normal text-gray-400 ml-2">
                  for {selectedSite.name}
                </span>
              )}
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
              <p className="text-gray-400 mt-2">Loading subscribers...</p>
            </div>
          ) : !selectedSiteId ? (
            <div className="p-8 text-center">
              <Mail className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Select a site to view subscribers</p>
            </div>
          ) : filteredSubscribers.length === 0 ? (
            <div className="p-8 text-center">
              <Mail className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No subscribers found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredSubscribers.map((subscriber) => (
                    <tr key={subscriber.id} className="hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-200">
                          {subscriber.email}
                        </div>
                        {subscriber.page_url && (
                          <div className="text-xs text-gray-500 truncate max-w-[200px]">
                            {subscriber.page_url}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                        {subscriber.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/50 text-blue-300">
                          {subscriber.source}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          subscriber.status === 'active'
                            ? 'bg-green-900/50 text-green-300'
                            : 'bg-red-900/50 text-red-300'
                        }`}>
                          {subscriber.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                        {(() => {
                          const timestamp = subscriber.subscribed_at || subscriber.created_at;
                          // Database stores UTC timestamps - parse and display consistently
                          const date = new Date(timestamp.endsWith('Z') ? timestamp : timestamp + 'Z');
                          return (
                            <>
                              {date.toLocaleDateString('en-US', { timeZone: 'America/Los_Angeles' })}
                              <div className="text-xs text-gray-500">
                                {date.toLocaleTimeString('en-US', {
                                  timeZone: 'America/Los_Angeles',
                                  hour: 'numeric',
                                  minute: '2-digit',
                                  hour12: true
                                })} PT
                              </div>
                            </>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {subscriber.status === 'active' && (
                          <button
                            onClick={() => handleUnsubscribe(subscriber.email)}
                            className="text-red-400 hover:text-red-300 p-1"
                            title="Unsubscribe"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </EnhancedAdminLayout>
  );
}