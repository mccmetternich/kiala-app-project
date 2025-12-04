'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Save,
  Eye,
  Plus,
  Image as ImageIcon,
  Upload,
  ArrowLeft,
  ArrowRight,
  Globe,
  Check,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import EnhancedAdminLayout from '@/components/admin/EnhancedAdminLayout';
import MediaLibrary from '@/components/admin/MediaLibrary';

interface Site {
  id: string;
  name: string;
  domain: string;
  subdomain: string;
  brand_profile?: any;
}

export default function NewArticle() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedSiteId = searchParams.get('siteId');

  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);

  // Step-based creation
  const [step, setStep] = useState<'site' | 'details'>(preselectedSiteId ? 'details' : 'site');

  const [formData, setFormData] = useState({
    site_id: preselectedSiteId || '',
    title: '',
    excerpt: '',
    content: '',
    slug: '',
    category: '',
    image: '',
    featured: false,
    trending: false,
    published: false,
    read_time: 5
  });

  useEffect(() => {
    fetchSites();
  }, []);

  useEffect(() => {
    // If we have a preselected site, skip to details
    if (preselectedSiteId && sites.length > 0) {
      const site = sites.find(s => s.id === preselectedSiteId);
      if (site) {
        setFormData(prev => ({ ...prev, site_id: preselectedSiteId }));
        setStep('details');
      }
    }
  }, [preselectedSiteId, sites]);

  const fetchSites = async () => {
    try {
      const response = await fetch('/api/sites');
      const data = await response.json();
      setSites(data.sites || []);
    } catch (error) {
      console.error('Error fetching sites:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Auto-generate slug from title
    if (field === 'title') {
      const slug = value.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const selectSite = (siteId: string) => {
    setFormData(prev => ({ ...prev, site_id: siteId }));
    setStep('details');
  };

  const handleSave = async (publish = false) => {
    if (!formData.title || !formData.site_id) {
      alert('Title and site are required');
      return;
    }

    setLoading(true);
    try {
      const dataToSend = { ...formData, published: publish };
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        const { article } = await response.json();
        router.push(`/admin/articles/${article.id}/edit`);
      } else {
        alert('Error saving article');
      }
    } catch (error) {
      console.error('Error saving article:', error);
      alert('Error saving article');
    } finally {
      setLoading(false);
    }
  };

  const selectedSite = sites.find(site => site.id === formData.site_id);

  // Step 1: Site Selection
  if (step === 'site') {
    return (
      <EnhancedAdminLayout>
        <div className="min-h-screen bg-gray-900">
          {/* Header */}
          <div className="bg-gray-800 border-b border-gray-700">
            <div className="max-w-4xl mx-auto px-6 py-6">
              <div className="flex items-center gap-4">
                <Link
                  href="/admin/articles"
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-white">Create New Article</h1>
                  <p className="text-gray-400 text-sm mt-0.5">Step 1 of 2: Choose a site</p>
                </div>
              </div>
            </div>
          </div>

          {/* Site Selection */}
          <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-700">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary-400" />
                  Select a Site
                </h2>
                <p className="text-gray-400 text-sm mt-1">Choose which site this article will be published on</p>
              </div>

              <div className="p-6">
                {sites.length === 0 ? (
                  <div className="text-center py-8">
                    <Globe className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">No sites available</p>
                    <Link
                      href="/admin/sites/new"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg"
                    >
                      <Plus className="w-4 h-4" />
                      Create Your First Site
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {sites.map(site => {
                      const brand = typeof site.brand_profile === 'string'
                        ? JSON.parse(site.brand_profile || '{}')
                        : site.brand_profile || {};

                      return (
                        <button
                          key={site.id}
                          onClick={() => selectSite(site.id)}
                          className="flex items-center gap-4 p-4 bg-gray-700/50 hover:bg-gray-700 border border-gray-600 hover:border-primary-500 rounded-xl transition-all text-left group"
                        >
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                            {brand.logoImage ? (
                              <img src={brand.logoImage} alt="" className="w-full h-full rounded-xl object-cover" />
                            ) : (
                              <span className="text-white font-bold text-lg">
                                {(brand.name || site.name || 'S').charAt(0)}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-semibold group-hover:text-primary-400 transition-colors">
                              {site.name}
                            </p>
                            <p className="text-gray-400 text-sm truncate">
                              {brand.tagline || site.subdomain}
                            </p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-primary-400 transition-colors" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </EnhancedAdminLayout>
    );
  }

  // Step 2: Article Details
  return (
    <EnhancedAdminLayout>
      <div className="min-h-screen bg-gray-900">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setStep('site')}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-white">Create New Article</h1>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-gray-400 text-sm">Step 2 of 2: Article details</span>
                    {selectedSite && (
                      <>
                        <span className="text-gray-600">•</span>
                        <span className="px-2 py-0.5 bg-primary-500/10 text-primary-400 rounded text-xs font-medium">
                          {selectedSite.name}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleSave(false)}
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all font-medium"
                >
                  <Save className="w-5 h-5" />
                  Save Draft
                </button>
                <button
                  onClick={() => handleSave(true)}
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl transition-all font-medium shadow-lg shadow-primary-600/20"
                >
                  <Eye className="w-5 h-5" />
                  Publish
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content - Left */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                <div className="p-5 border-b border-gray-700">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary-400" />
                    Article Details
                  </h3>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter article title..."
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Excerpt
                    </label>
                    <textarea
                      value={formData.excerpt}
                      onChange={(e) => handleInputChange('excerpt', e.target.value)}
                      rows={3}
                      className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      placeholder="Brief description for previews and SEO..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Hero Image
                    </label>
                    <div className="flex items-start gap-4">
                      {formData.image ? (
                        <div className="relative group">
                          <img
                            src={formData.image}
                            alt="Preview"
                            className="w-32 h-24 object-cover rounded-xl border border-gray-600"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleInputChange('image', '')}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div className="w-32 h-24 bg-gray-700 border-2 border-dashed border-gray-600 rounded-xl flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-gray-500" />
                        </div>
                      )}
                      <div className="flex-1 space-y-2">
                        <button
                          type="button"
                          onClick={() => setShowMediaLibrary(true)}
                          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all text-sm"
                        >
                          <Upload className="w-4 h-4" />
                          {formData.image ? 'Change Image' : 'Select Image'}
                        </button>
                        <input
                          type="url"
                          value={formData.image}
                          onChange={(e) => handleInputChange('image', e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                          placeholder="Or paste image URL..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Editor */}
              <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                <div className="p-5 border-b border-gray-700">
                  <h3 className="text-lg font-semibold text-white">Content</h3>
                  <p className="text-gray-400 text-sm mt-1">You can add widgets after saving the article</p>
                </div>
                <div className="p-6">
                  <textarea
                    value={formData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    rows={12}
                    className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm resize-none"
                    placeholder="Write your article content here...

# Article Title

Your content goes here. You can use Markdown formatting.

## Subheading

- Bullet points
- More content
- Call to action

After saving, you can add interactive widgets like testimonials, product showcases, and more!"
                  />
                </div>
              </div>
            </div>

            {/* Sidebar - Right */}
            <div className="space-y-6">
              {/* Publishing */}
              <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                <div className="p-5 border-b border-gray-700">
                  <h3 className="text-lg font-semibold text-white">Publishing</h3>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      URL Slug
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="article-url-slug"
                    />
                    {selectedSite && formData.slug && (
                      <p className="text-xs text-gray-500 mt-1.5">
                        /site/{selectedSite.subdomain}/articles/{formData.slug}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Category
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="e.g., Health, Nutrition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Read Time (minutes)
                    </label>
                    <input
                      type="number"
                      value={formData.read_time}
                      onChange={(e) => handleInputChange('read_time', parseInt(e.target.value))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      min="1"
                      max="60"
                    />
                  </div>
                </div>
              </div>

              {/* Visibility Flags */}
              <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                <div className="p-5 border-b border-gray-700">
                  <h3 className="text-lg font-semibold text-white">Visibility</h3>
                </div>
                <div className="p-5 space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer bg-gray-700/50 px-4 py-3 rounded-xl hover:bg-gray-700 transition-all">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => handleInputChange('featured', e.target.checked)}
                      className="w-5 h-5 text-primary-600 bg-gray-700 border-gray-600 rounded focus:ring-primary-500"
                    />
                    <div>
                      <span className="text-white font-medium">Featured</span>
                      <p className="text-xs text-gray-500">Show prominently on homepage</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer bg-gray-700/50 px-4 py-3 rounded-xl hover:bg-gray-700 transition-all">
                    <input
                      type="checkbox"
                      checked={formData.trending}
                      onChange={(e) => handleInputChange('trending', e.target.checked)}
                      className="w-5 h-5 text-primary-600 bg-gray-700 border-gray-600 rounded focus:ring-primary-500"
                    />
                    <div>
                      <span className="text-white font-medium">Trending</span>
                      <p className="text-xs text-gray-500">Mark as trending content</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Tip */}
              <div className="bg-primary-500/10 border border-primary-500/20 rounded-2xl p-5">
                <p className="text-primary-300 text-sm">
                  <strong>Tip:</strong> After creating the article, you'll be able to add interactive widgets like testimonials, product showcases, before/after comparisons, and more!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Media Library Modal */}
        {formData.site_id && (
          <MediaLibrary
            isOpen={showMediaLibrary}
            onClose={() => setShowMediaLibrary(false)}
            onSelect={(file) => {
              handleInputChange('image', file.url);
              setShowMediaLibrary(false);
            }}
            siteId={formData.site_id}
          />
        )}
      </div>
    </EnhancedAdminLayout>
  );
}
