'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Globe,
  Check,
  Layers
} from 'lucide-react';
import Link from 'next/link';
import EnhancedAdminLayout from '@/components/admin/EnhancedAdminLayout';

interface Site {
  id: string;
  name: string;
  domain: string;
  subdomain: string;
  brand_profile?: any;
}

// Wrapper component to handle Suspense for useSearchParams
export default function NewPageRoute() {
  return (
    <Suspense fallback={
      <EnhancedAdminLayout>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      </EnhancedAdminLayout>
    }>
      <NewPage />
    </Suspense>
  );
}

function NewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedSiteId = searchParams.get('siteId');

  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState(preselectedSiteId || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSites();
  }, []);

  useEffect(() => {
    // If we have a preselected site, navigate directly to site dashboard pages tab
    if (preselectedSiteId && sites.length > 0) {
      const site = sites.find(s => s.id === preselectedSiteId);
      if (site) {
        router.push(`/admin/sites/${preselectedSiteId}/dashboard?tab=pages`);
      }
    }
  }, [preselectedSiteId, sites, router]);

  const fetchSites = async () => {
    try {
      const response = await fetch('/api/sites');
      const data = await response.json();
      setSites(data.sites || []);
    } catch (error) {
      console.error('Error fetching sites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (selectedSiteId) {
      // Navigate to the site's pages tab where they can manage pages
      router.push(`/admin/sites/${selectedSiteId}/dashboard?tab=pages`);
    }
  };

  if (loading) {
    return (
      <EnhancedAdminLayout>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      </EnhancedAdminLayout>
    );
  }

  return (
    <EnhancedAdminLayout>
      <div className="min-h-screen bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-white mb-2">Create New Page</h1>
            <p className="text-gray-400">Select a site to add a new page to</p>
          </div>

          {/* Site Selection */}
          <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary-400" />
                Select a Site
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Choose which site you want to add a page to
              </p>
            </div>

            {sites.length === 0 ? (
              <div className="p-12 text-center">
                <Globe className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No sites yet</h3>
                <p className="text-gray-400 mb-6">Create a site first before adding pages</p>
                <Link
                  href="/admin/sites/new"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2 transition-colors"
                >
                  Create Site
                </Link>
              </div>
            ) : (
              <>
                <div className="divide-y divide-gray-700/50">
                  {sites.map((site) => {
                    const brand = typeof site.brand_profile === 'string'
                      ? JSON.parse(site.brand_profile || '{}')
                      : site.brand_profile || {};
                    const isSelected = selectedSiteId === site.id;

                    return (
                      <button
                        key={site.id}
                        onClick={() => setSelectedSiteId(site.id)}
                        className={`w-full flex items-center gap-4 p-5 text-left transition-all ${
                          isSelected
                            ? 'bg-primary-500/10 border-l-4 border-primary-500'
                            : 'hover:bg-gray-750 border-l-4 border-transparent'
                        }`}
                      >
                        {brand.profileImage || brand.sidebarImage ? (
                          <img
                            src={brand.profileImage || brand.sidebarImage}
                            alt={brand.name || site.name}
                            className="w-12 h-12 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <Globe className="w-6 h-6 text-white" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white truncate">
                            {brand.name || site.name}
                          </p>
                          <p className="text-sm text-gray-400">
                            {site.subdomain}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <Check className="w-5 h-5 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Continue Button */}
                <div className="p-6 border-t border-gray-700 bg-gray-850">
                  <button
                    onClick={handleContinue}
                    disabled={!selectedSiteId}
                    className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-medium transition-all ${
                      selectedSiteId
                        ? 'bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-600/20'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Layers className="w-5 h-5" />
                    Continue to Pages
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </EnhancedAdminLayout>
  );
}
