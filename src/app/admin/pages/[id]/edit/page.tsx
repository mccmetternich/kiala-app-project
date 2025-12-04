'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Save, 
  Eye, 
  ExternalLink, 
  ArrowLeft, 
  Settings, 
  Calendar,
  Globe,
  FileText,
  Image as ImageIcon,
  Upload
} from 'lucide-react';
import EnhancedAdminLayout from '@/components/admin/EnhancedAdminLayout';
import WidgetEditor from '@/components/admin/WidgetEditor';
import Badge from '@/components/ui/Badge';
import { Page, Site, Widget } from '@/types';

// Mock page data
const mockPage: Page = {
  id: 'hormone-weight-loss-article',
  slug: 'hormone-weight-loss',
  title: 'The Hidden Hormone That\'s Sabotaging Your Weight Loss After 40 (And How to Fix It)',
  type: 'article',
  content: {
    widgets: [],
    sidebar: {
      enabled: true,
      type: 'custom' as any,
      widgets: []
    },
    layout: {
      type: 'with-sidebar',
      maxWidth: '1200px'
    }
  },
  seo: {
    title: 'Hidden Hormone Sabotaging Weight Loss After 40 | Dr. Heart',
    description: 'Discover the one hormone that could be preventing your weight loss and learn the 3-step protocol that helped 10,000+ women finally lose stubborn weight.',
    keywords: ['hormone weight loss', 'leptin resistance', 'weight loss after 40', 'hormone balance'],
    ogImage: '/api/placeholder/1200/630'
  },
  published: false,
  publishedAt: new Date('2024-01-15')
};

const mockSite: Site = {
  id: 'dr-heart-site',
  name: 'Dr. Heart Wellness',
  domain: 'dramyheart.com',
  theme: {
    name: 'Medical Authority',
    colors: { primary: '#ec4899', secondary: '#22c55e', accent: '#f59e0b', trust: '#059669', background: '#ffffff', text: '#1f2937' },
    fonts: { heading: 'Playfair Display', body: 'Inter' },
    style: 'medical'
  },
  brand: {
    name: 'Dr. Amy Heart',
    title: 'Integrative Wellness Physician',
    credentials: ['MD', 'PhD', 'ABOIM'],
    tagline: 'Empowering Women Through Integrative Wellness',
    bio: 'Dr. Amy Heart is a board-certified physician with over 15 years of experience in integrative medicine.',
    logo: '/api/placeholder/200/200',
    profileImage: '/api/placeholder/200/200',
    quote: 'True wellness comes from understanding your body\'s unique needs.',
    specialties: ['Hormonal Health', 'Weight Management', 'Metabolic Wellness'],
    yearsExperience: 15
  },
  settings: {
    navigation: [],
    footer: { disclaimer: '', privacyPolicy: '', termsOfService: '', contact: { email: 'hello@dramyheart.com' } },
    emailCapture: { provider: 'convertkit', apiKey: '', listId: '' },
    social: {}
  },
  pages: [],
  createdAt: new Date(),
  updatedAt: new Date()
};

export default function PageEditor() {
  const params = useParams();
  const [page, setPage] = useState<Page>(mockPage);
  const [site] = useState<Site>(mockSite);
  const [activeTab, setActiveTab] = useState<'content' | 'settings' | 'seo' | 'preview'>('content');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Auto-save functionality
  useEffect(() => {
    const autoSave = setTimeout(() => {
      handleSave(true);
    }, 5000);

    return () => clearTimeout(autoSave);
  }, [page]);

  const handleSave = async (auto = false) => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setLastSaved(new Date());
      if (!auto) {
        alert('Page saved successfully!');
      }
    }, 1000);
  };

  const handlePublish = async () => {
    const updatedPage = { ...page, published: true, publishedAt: new Date() };
    setPage(updatedPage);
    await handleSave();
    alert('Page published successfully!');
  };

  const handleWidgetsChange = (widgets: Widget[]) => {
    setPage(prev => ({
      ...prev,
      content: {
        ...prev.content,
        widgets
      }
    }));
  };

  const updatePageField = (field: keyof Page, value: any) => {
    setPage(prev => ({ ...prev, [field]: value }));
  };

  const updateSEOField = (field: keyof Page['seo'], value: any) => {
    setPage(prev => ({
      ...prev,
      seo: { ...prev.seo, [field]: value }
    }));
  };

  return (
    <EnhancedAdminLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 sticky top-16 z-30">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link 
                  href="/admin/pages"
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-xl font-semibold text-gray-200">
                      {page.title || 'Untitled Page'}
                    </h1>
                    <Badge variant={page.published ? 'trust' : 'default'}>
                      {page.published ? '🟢 Published' : '🟡 Draft'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                    <span className="flex items-center gap-1">
                      <Globe className="w-4 h-4" />
                      {site.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      {page.type}
                    </span>
                    {lastSaved && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Saved {lastSaved.toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab('content')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'content' ? 'bg-gray-800 text-gray-200 shadow-sm' : 'text-gray-600'
                    }`}
                  >
                    Content
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'settings' ? 'bg-gray-800 text-gray-200 shadow-sm' : 'text-gray-600'
                    }`}
                  >
                    Settings
                  </button>
                  <button
                    onClick={() => setActiveTab('seo')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'seo' ? 'bg-gray-800 text-gray-200 shadow-sm' : 'text-gray-600'
                    }`}
                  >
                    SEO
                  </button>
                  <button
                    onClick={() => setActiveTab('preview')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'preview' ? 'bg-gray-800 text-gray-200 shadow-sm' : 'text-gray-600'
                    }`}
                  >
                    Preview
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {/* View Live link removed - needs site subdomain integration */}
                  
                  <button
                    onClick={() => handleSave()}
                    disabled={isSaving}
                    className="btn-secondary flex items-center gap-2 text-sm py-2 px-4"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                  
                  <button
                    onClick={handlePublish}
                    className="btn-primary flex items-center gap-2 text-sm py-2 px-4"
                  >
                    <Eye className="w-4 h-4" />
                    {page.published ? 'Update' : 'Publish'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto p-6">
          {activeTab === 'content' && (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Editor */}
              <div className="lg:col-span-2 space-y-6">
                {/* Page Header */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-200 mb-4">Page Header</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Page Title</label>
                      <input
                        type="text"
                        value={page.title}
                        onChange={(e) => updatePageField('title', e.target.value)}
                        placeholder="Enter page title..."
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">URL Slug</label>
                      <div className="flex items-center">
                        <span className="text-gray-500 text-sm">/{site.id}/articles/</span>
                        <input
                          type="text"
                          value={page.slug}
                          onChange={(e) => updatePageField('slug', e.target.value)}
                          placeholder="page-url"
                          className="flex-1 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent ml-1"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Featured Image</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-300 transition-colors">
                        <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">Upload featured image</p>
                        <button className="btn-secondary text-sm flex items-center gap-2 mx-auto">
                          <Upload className="w-4 h-4" />
                          Choose File
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Widget Editor */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                  <WidgetEditor
                    widgets={page.content.widgets}
                    onWidgetsChange={handleWidgetsChange}
                    siteId={site?.id || 'default'}
                  />
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Page Settings */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-200 mb-4">Page Settings</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Page Type</label>
                      <select
                        value={page.type}
                        onChange={(e) => updatePageField('type', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="homepage">Homepage</option>
                        <option value="article">Article</option>
                        <option value="about">About</option>
                        <option value="top-picks">Top Picks</option>
                        <option value="success-stories">Success Stories</option>
                        <option value="contact">Contact</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Layout</label>
                      <select
                        value={page.content.layout.type}
                        onChange={(e) => setPage(prev => ({
                          ...prev,
                          content: {
                            ...prev.content,
                            layout: { ...prev.content.layout, type: e.target.value as any }
                          }
                        }))}
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="full-width">Full Width</option>
                        <option value="with-sidebar">With Sidebar</option>
                        <option value="narrow">Narrow</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">Enable Sidebar</label>
                      <input
                        type="checkbox"
                        checked={page.content.sidebar?.enabled || false}
                        onChange={(e) => setPage(prev => ({
                          ...prev,
                          content: {
                            ...prev.content,
                            sidebar: { ...prev.content.sidebar, enabled: e.target.checked }
                          }
                        }))}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Publishing */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-200 mb-4">Publishing</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">Published</label>
                      <input
                        type="checkbox"
                        checked={page.published}
                        onChange={(e) => updatePageField('published', e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </div>
                    
                    {page.publishedAt && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Publish Date</label>
                        <input
                          type="datetime-local"
                          value={page.publishedAt.toISOString().slice(0, 16)}
                          onChange={(e) => updatePageField('publishedAt', new Date(e.target.value))}
                          className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-200 mb-4">Performance</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Views</span>
                      <span className="text-sm font-medium">12,847</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Conversion Rate</span>
                      <span className="text-sm font-medium text-green-600">3.8%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Avg. Time on Page</span>
                      <span className="text-sm font-medium">4m 32s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Widgets</span>
                      <span className="text-sm font-medium">{page.content.widgets.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-200 mb-6">SEO Settings</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SEO Title</label>
                    <input
                      type="text"
                      value={page.seo.title}
                      onChange={(e) => updateSEOField('title', e.target.value)}
                      placeholder="Page title for search engines..."
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary-500"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {page.seo.title.length}/60 characters recommended
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                    <textarea
                      rows={3}
                      value={page.seo.description}
                      onChange={(e) => updateSEOField('description', e.target.value)}
                      placeholder="Brief description for search engines..."
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary-500"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {page.seo.description.length}/160 characters recommended
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Keywords</label>
                    <input
                      type="text"
                      value={page.seo.keywords.join(', ')}
                      onChange={(e) => updateSEOField('keywords', e.target.value.split(',').map(k => k.trim()))}
                      placeholder="keyword1, keyword2, keyword3"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Open Graph Image</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Upload social sharing image (1200x630px)</p>
                      <button className="btn-secondary text-sm">Choose File</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-200">Preview</h3>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                    📱 Mobile
                  </button>
                  <button className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                    💻 Desktop
                  </button>
                </div>
              </div>
              
              <div className="border border-gray-700 rounded-lg bg-gray-50 min-h-96 flex items-center justify-center">
                <div className="text-center">
                  <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Live preview will appear here</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Preview functionality coming soon
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-200 mb-6">Page Settings</h3>
                
                <div className="space-y-8">
                  {/* Content Settings */}
                  <div>
                    <h4 className="font-medium text-gray-200 mb-4">Content Settings</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Read Time (minutes)</label>
                        <input
                          type="number"
                          min="1"
                          defaultValue="8"
                          className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                        <select className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500">
                          <option>Hormonal Health</option>
                          <option>Weight Management</option>
                          <option>Nutrition</option>
                          <option>Fitness</option>
                          <option>Mental Health</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Social Settings */}
                  <div>
                    <h4 className="font-medium text-gray-200 mb-4">Social Sharing</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">Enable social sharing</label>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">Show author bio</label>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">Enable comments</label>
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </EnhancedAdminLayout>
  );
}