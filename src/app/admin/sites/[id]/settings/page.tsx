'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  User, 
  Palette, 
  Shield,
  Eye
} from 'lucide-react';
import EnhancedAdminLayout from '@/components/admin/EnhancedAdminLayout';
import MediaLibrary from '@/components/admin/MediaLibrary';
import DomainSetupGuide from '@/components/admin/DomainSetupGuide';
import Badge from '@/components/ui/Badge';

export default function SiteSettings() {
  const { id } = useParams() as { id: string };
  const [site, setSite] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'content' | 'appearance' | 'advanced'>('content');
  const [isSaving, setIsSaving] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<'logo' | 'author' | 'sidebar' | 'about' | 'leadMagnet' | 'audio' | 'aboutAudio' | 'leadMagnetPdf' | null>(null);

  useEffect(() => {
    async function loadSite() {
      try {
        const response = await fetch(`/api/sites/${id}`);
        if (response.ok) {
          const data = await response.json();
          // Parse JSON strings from database into objects
          const site = data.site;
          if (site) {
            if (typeof site.settings === 'string') {
              try {
                site.settings = JSON.parse(site.settings);
              } catch (e) {
                site.settings = {};
              }
            }
            if (typeof site.brand_profile === 'string') {
              try {
                site.brand_profile = JSON.parse(site.brand_profile);
              } catch (e) {
                site.brand_profile = {};
              }
            }
          }
          setSite(site);
        }
      } catch (error) {
        console.error('Error loading site:', error);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadSite();
    }
  }, [id]);

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const response = await fetch(`/api/sites/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(site),
      });

      if (response.ok) {
        alert('Settings saved successfully!');
      } else {
        alert('Error saving settings. Please try again.');
      }
    } catch (error) {
      console.error('Error saving:', error);
      alert('Error saving settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSiteField = (field: string, value: any) => {
    setSite((prev: any) => ({ ...prev, [field]: value }));
  };

  const updateBrandField = (field: string, value: any) => {
    setSite((prev: any) => ({
      ...prev,
      brand_profile: { 
        ...(typeof prev.brand_profile === 'string' ? JSON.parse(prev.brand_profile) : prev.brand_profile),
        [field]: value 
      }
    }));
  };

  const updateThemeField = (field: string, value: any) => {
    const currentSettings = typeof site.settings === 'string' ? JSON.parse(site.settings) : site.settings || {};
    const currentTheme = currentSettings.theme || {};
    
    setSite((prev: any) => ({
      ...prev,
      settings: {
        ...currentSettings,
        theme: { ...currentTheme, [field]: value }
      }
    }));
  };

  const updateSettingsField = (field: string, value: any) => {
    const currentSettings = typeof site.settings === 'string' ? JSON.parse(site.settings) : site.settings || {};
    
    setSite((prev: any) => ({
      ...prev,
      settings: { ...currentSettings, [field]: value }
    }));
  };

  const handleMediaSelect = (file: any) => {
    if (mediaTarget === 'logo') {
      updateBrandField('logoImage', file.url);
    } else if (mediaTarget === 'author') {
      updateBrandField('authorImage', file.url);
    } else if (mediaTarget === 'sidebar') {
      updateBrandField('sidebarImage', file.url);
    } else if (mediaTarget === 'about') {
      updateBrandField('aboutImage', file.url);
    } else if (mediaTarget === 'leadMagnet') {
      setSite((prev: any) => ({
        ...prev,
        settings: {
          ...prev.settings,
          emailCapture: {
            ...prev.settings.emailCapture,
            leadMagnet: {
              ...prev.settings.emailCapture.leadMagnet!,
              image: file.url
            }
          }
        }
      }));
    } else if (mediaTarget === 'audio') {
      setSite((prev: any) => {
        const currentSettings = typeof prev.settings === 'string'
          ? JSON.parse(prev.settings)
          : prev.settings || {};
        return {
          ...prev,
          settings: {
            ...currentSettings,
            audioUrl: file.url
          }
        };
      });
    } else if (mediaTarget === 'aboutAudio') {
      setSite((prev: any) => {
        const currentSettings = typeof prev.settings === 'string'
          ? JSON.parse(prev.settings)
          : prev.settings || {};
        return {
          ...prev,
          settings: {
            ...currentSettings,
            aboutAudioUrl: file.url
          }
        };
      });
    } else if (mediaTarget === 'leadMagnetPdf') {
      setSite((prev: any) => {
        const currentSettings = typeof prev.settings === 'string'
          ? JSON.parse(prev.settings)
          : prev.settings || {};
        return {
          ...prev,
          settings: {
            ...currentSettings,
            leadMagnetPdfUrl: file.url
          }
        };
      });
    }
    setShowMediaLibrary(false);
    setMediaTarget(null);
  };

  const handleAudioRemove = () => {
    setSite((prev: any) => {
      const currentSettings = typeof prev.settings === 'string'
        ? JSON.parse(prev.settings)
        : prev.settings || {};
      return {
        ...prev,
        settings: {
          ...currentSettings,
          audioUrl: undefined
        }
      };
    });
  };

  const handleAboutAudioRemove = () => {
    setSite((prev: any) => {
      const currentSettings = typeof prev.settings === 'string'
        ? JSON.parse(prev.settings)
        : prev.settings || {};
      return {
        ...prev,
        settings: {
          ...currentSettings,
          aboutAudioUrl: undefined
        }
      };
    });
  };

  const handleLeadMagnetPdfRemove = () => {
    setSite((prev: any) => {
      const currentSettings = typeof prev.settings === 'string'
        ? JSON.parse(prev.settings)
        : prev.settings || {};
      return {
        ...prev,
        settings: {
          ...currentSettings,
          leadMagnetPdfUrl: undefined
        }
      };
    });
  };

  const tabs = [
    { id: 'content', label: 'Content & Profile', icon: User, description: 'Site basics and brand information' },
    { id: 'appearance', label: 'Design & Branding', icon: Palette, description: 'Theme, colors, and visual identity' },
    { id: 'advanced', label: 'Advanced Settings', icon: Shield, description: 'Domains, integrations, and SEO' }
  ];

  if (loading) {
    return (
      <EnhancedAdminLayout>
        <div className="p-6 max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/3 mb-6"></div>
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <div className="flex space-x-6 border-b border-gray-700 mb-6">
                {tabs.map((tab) => (
                  <div key={tab.id} className="h-12 bg-gray-700 rounded w-24 mb-4"></div>
                ))}
              </div>
              <div className="space-y-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                    <div className="h-10 bg-gray-700 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </EnhancedAdminLayout>
    );
  }

  if (!site) {
    return (
      <EnhancedAdminLayout>
        <div className="p-6 max-w-7xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-200 mb-4">Site Not Found</h1>
          <p className="text-gray-400 mb-6">The site you're looking for doesn't exist or has been deleted.</p>
          <Link href="/admin/sites" className="btn-primary">
            Back to Sites
          </Link>
        </div>
      </EnhancedAdminLayout>
    );
  }

  const brand = typeof site.brand_profile === 'string' ? JSON.parse(site.brand_profile) : site.brand_profile || {};
  const settings = typeof site.settings === 'string' ? JSON.parse(site.settings) : site.settings || {};
  const theme = settings.theme || {};

  return (
    <EnhancedAdminLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin/sites"
              className="p-2 text-gray-400 hover:text-gray-200 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            
            <div>
              <h1 className="text-3xl font-bold text-gray-200">Site Settings</h1>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-gray-400">{site.name}</p>
                <Badge variant={site.status === 'published' ? 'trust' : 'default'} size="sm">
                  {site.status === 'published' ? '🟢 Live' : '🟡 Draft'}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Link
              href={`/site/${site?.subdomain || id}`}
              target="_blank"
              className="btn-secondary flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Preview Site
            </Link>
            
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn-primary flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-700">
            <div className="flex space-x-8 px-6 py-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-3 py-2 px-1 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-400'
                      : 'border-transparent text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">{tab.label}</div>
                    <div className="text-xs text-gray-500">{tab.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Content & Profile Tab */}
            {activeTab === 'content' && (
              <div className="space-y-8">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-200 mb-4">Basic Information</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Site Name*</label>
                      <input
                        type="text"
                        value={site.name || ''}
                        onChange={(e) => updateSiteField('name', e.target.value)}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Dr. Smith's Practice"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Subdomain*</label>
                      <div className="flex">
                        <input
                          type="text"
                          value={site.subdomain || ''}
                          onChange={(e) => updateSiteField('subdomain', e.target.value)}
                          className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-l-lg text-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="drsmith"
                        />
                        <span className="px-4 py-2 bg-gray-600 border border-l-0 border-gray-600 rounded-r-lg text-gray-300 text-sm">
                          .kiala.com
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Brand Profile */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-200 mb-4">Brand Profile</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Brand Name*</label>
                        <input
                          type="text"
                          value={brand.name || ''}
                          onChange={(e) => updateBrandField('name', e.target.value)}
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="e.g., Best Mattress Reviews"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Tagline*</label>
                        <input
                          type="text"
                          value={brand.tagline || ''}
                          onChange={(e) => updateBrandField('tagline', e.target.value)}
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="e.g., The best mattresses for a good night's sleep"
                        />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Bio/Description</label>
                        <textarea
                          rows={6}
                          value={brand.bio || ''}
                          onChange={(e) => updateBrandField('bio', e.target.value)}
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                          placeholder="Brief brand bio..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Brand Images - 4 distinct images */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-200 mb-4">Brand Images</h3>
                  <p className="text-sm text-gray-400 mb-6">Upload distinct images for different areas of your site to create a more dynamic and professional look.</p>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Logo Image */}
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">Navigation Logo</label>
                      <p className="text-xs text-gray-500 mb-3">Displayed in the site header/navigation</p>
                      <div className="flex items-center gap-4">
                        {brand.logoImage ? (
                          <img
                            src={brand.logoImage}
                            alt="Logo"
                            className="w-16 h-16 rounded-full object-cover border-2 border-gray-600"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gray-600 flex items-center justify-center">
                            <User className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setMediaTarget('logo');
                            setShowMediaLibrary(true);
                          }}
                          className="btn-secondary flex items-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          {brand.logoImage ? 'Change' : 'Upload'}
                        </button>
                      </div>
                    </div>

                    {/* Author Image */}
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">Article Author Image</label>
                      <p className="text-xs text-gray-500 mb-3">Shown on article pages as the author profile</p>
                      <div className="flex items-center gap-4">
                        {brand.authorImage ? (
                          <img
                            src={brand.authorImage}
                            alt="Author"
                            className="w-16 h-16 rounded-full object-cover border-2 border-gray-600"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gray-600 flex items-center justify-center">
                            <User className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setMediaTarget('author');
                            setShowMediaLibrary(true);
                          }}
                          className="btn-secondary flex items-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          {brand.authorImage ? 'Change' : 'Upload'}
                        </button>
                      </div>
                    </div>

                    {/* Sidebar Image */}
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">Credibility Sidebar Image</label>
                      <p className="text-xs text-gray-500 mb-3">Featured in the sidebar credibility panel</p>
                      <div className="flex items-center gap-4">
                        {brand.sidebarImage ? (
                          <img
                            src={brand.sidebarImage}
                            alt="Sidebar"
                            className="w-16 h-16 rounded-full object-cover border-2 border-gray-600"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gray-600 flex items-center justify-center">
                            <User className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setMediaTarget('sidebar');
                            setShowMediaLibrary(true);
                          }}
                          className="btn-secondary flex items-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          {brand.sidebarImage ? 'Change' : 'Upload'}
                        </button>
                      </div>
                    </div>

                    {/* About Page Image */}
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">About Page Image</label>
                      <p className="text-xs text-gray-500 mb-3">Hero image displayed on the About page</p>
                      <div className="flex items-center gap-4">
                        {brand.aboutImage ? (
                          <img
                            src={brand.aboutImage}
                            alt="About"
                            className="w-16 h-16 rounded-full object-cover border-2 border-gray-600"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gray-600 flex items-center justify-center">
                            <User className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setMediaTarget('about');
                            setShowMediaLibrary(true);
                          }}
                          className="btn-secondary flex items-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          {brand.aboutImage ? 'Change' : 'Upload'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Audio Messages Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-200 mb-4">Audio Messages</h3>
                  <p className="text-sm text-gray-400 mb-6">Add personal audio messages to different sections of your site.</p>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Sidebar Audio */}
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">Sidebar Audio</label>
                      <p className="text-xs text-gray-500 mb-3">Plays in the credibility sidebar panel</p>
                      {settings.audioUrl ? (
                        <div className="space-y-3">
                          <audio controls className="w-full" src={settings.audioUrl}>
                            Your browser does not support the audio element.
                          </audio>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setMediaTarget('audio');
                                setShowMediaLibrary(true);
                              }}
                              className="btn-secondary text-sm"
                            >
                              Change
                            </button>
                            <button
                              type="button"
                              onClick={handleAudioRemove}
                              className="btn-secondary text-sm text-red-400 hover:text-red-300"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setMediaTarget('audio');
                            setShowMediaLibrary(true);
                          }}
                          className="flex items-center gap-3 w-full p-3 bg-gray-700 rounded-lg border-2 border-dashed border-gray-600 hover:border-primary-500 transition-colors"
                        >
                          <Upload className="w-5 h-5 text-gray-400" />
                          <div className="text-left">
                            <p className="text-sm font-medium text-gray-300">Select audio</p>
                            <p className="text-xs text-gray-500">From Media Library</p>
                          </div>
                        </button>
                      )}
                    </div>

                    {/* About Page Audio */}
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">About Page Audio</label>
                      <p className="text-xs text-gray-500 mb-3">Plays on the About page</p>
                      {settings.aboutAudioUrl ? (
                        <div className="space-y-3">
                          <audio controls className="w-full" src={settings.aboutAudioUrl}>
                            Your browser does not support the audio element.
                          </audio>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setMediaTarget('aboutAudio');
                                setShowMediaLibrary(true);
                              }}
                              className="btn-secondary text-sm"
                            >
                              Change
                            </button>
                            <button
                              type="button"
                              onClick={handleAboutAudioRemove}
                              className="btn-secondary text-sm text-red-400 hover:text-red-300"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setMediaTarget('aboutAudio');
                            setShowMediaLibrary(true);
                          }}
                          className="flex items-center gap-3 w-full p-3 bg-gray-700 rounded-lg border-2 border-dashed border-gray-600 hover:border-primary-500 transition-colors"
                        >
                          <Upload className="w-5 h-5 text-gray-400" />
                          <div className="text-left">
                            <p className="text-sm font-medium text-gray-300">Select audio</p>
                            <p className="text-xs text-gray-500">From Media Library</p>
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Lead Magnet PDF Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-200 mb-4">Lead Magnet PDF</h3>
                  <p className="text-sm text-gray-400 mb-6">Upload a PDF that will be delivered to users when they sign up via popups or email capture forms.</p>

                  <div className="bg-gray-700/50 rounded-lg p-4 max-w-md">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Wellness Guide / Lead Magnet</label>
                    <p className="text-xs text-gray-500 mb-3">This PDF will be automatically downloaded when users submit their email</p>
                    {settings.leadMagnetPdfUrl ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg border border-gray-600">
                          <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-200 truncate">Lead Magnet PDF</p>
                            <p className="text-xs text-gray-500 truncate">{settings.leadMagnetPdfUrl.split('/').pop()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={settings.leadMagnetPdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-secondary text-sm"
                          >
                            Preview
                          </a>
                          <button
                            type="button"
                            onClick={() => {
                              setMediaTarget('leadMagnetPdf');
                              setShowMediaLibrary(true);
                            }}
                            className="btn-secondary text-sm"
                          >
                            Change
                          </button>
                          <button
                            type="button"
                            onClick={handleLeadMagnetPdfRemove}
                            className="btn-secondary text-sm text-red-400 hover:text-red-300"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setMediaTarget('leadMagnetPdf');
                          setShowMediaLibrary(true);
                        }}
                        className="flex items-center gap-3 w-full p-3 bg-gray-700 rounded-lg border-2 border-dashed border-gray-600 hover:border-primary-500 transition-colors"
                      >
                        <Upload className="w-5 h-5 text-gray-400" />
                        <div className="text-left">
                          <p className="text-sm font-medium text-gray-300">Upload PDF</p>
                          <p className="text-xs text-gray-500">From Media Library</p>
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-200 mb-4">Theme Selection</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {['medical', 'wellness', 'clinical', 'lifestyle'].map((themeName) => (
                      <button
                        key={themeName}
                        onClick={() => updateSiteField('theme', themeName)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          site.theme === themeName
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                        }`}
                      >
                        <div className="text-center">
                          <div className="w-full h-24 bg-gradient-to-br from-gray-600 to-gray-700 rounded mb-3"></div>
                          <h4 className="font-medium text-gray-200 capitalize">{themeName}</h4>
                          <p className="text-sm text-gray-400 mt-1">
                            {themeName === 'medical' && 'Professional medical practice'}
                            {themeName === 'wellness' && 'Holistic wellness approach'}
                            {themeName === 'clinical' && 'Clinical and scientific'}
                            {themeName === 'lifestyle' && 'Lifestyle medicine focus'}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-200 mb-4">Color Customization</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Customize your site's color palette. These colors are saved for future dynamic theming support.
                  </p>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Primary Color</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={theme.primaryColor || '#ec4899'}
                          onChange={(e) => updateThemeField('primaryColor', e.target.value)}
                          className="w-16 h-12 rounded border border-gray-600 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={theme.primaryColor || '#ec4899'}
                          onChange={(e) => updateThemeField('primaryColor', e.target.value)}
                          className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 text-sm font-mono"
                          placeholder="#ec4899"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Secondary Color</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={theme.secondaryColor || '#9333ea'}
                          onChange={(e) => updateThemeField('secondaryColor', e.target.value)}
                          className="w-16 h-12 rounded border border-gray-600 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={theme.secondaryColor || '#9333ea'}
                          onChange={(e) => updateThemeField('secondaryColor', e.target.value)}
                          className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 text-sm font-mono"
                          placeholder="#9333ea"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Accent Color</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={theme.accentColor || '#ef4444'}
                          onChange={(e) => updateThemeField('accentColor', e.target.value)}
                          className="w-16 h-12 rounded border border-gray-600 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={theme.accentColor || '#ef4444'}
                          onChange={(e) => updateThemeField('accentColor', e.target.value)}
                          className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 text-sm font-mono"
                          placeholder="#ef4444"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Advanced Tab */}
            {activeTab === 'advanced' && (
              <div className="space-y-8">
                {/* Domain Settings */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-200 mb-4">Domain Settings</h3>
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Custom Domain</label>
                      <input
                        type="text"
                        value={site.domain || ''}
                        onChange={(e) => updateSiteField('domain', e.target.value)}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="www.drsmith.com"
                      />
                      <p className="text-sm text-gray-400 mt-1">Optional: Connect your own domain</p>
                    </div>
                  </div>
                </div>

                {/* SEO Settings */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-200 mb-4">SEO & Analytics</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Meta Description</label>
                      <textarea
                        rows={3}
                        value={settings.seo?.description || ''}
                        onChange={(e) => updateSettingsField('seo', { ...settings.seo, description: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                        placeholder="Brief description for search engines..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Google Analytics ID</label>
                      <input
                        type="text"
                        value={settings.analytics?.googleId || ''}
                        onChange={(e) => updateSettingsField('analytics', { ...settings.analytics, googleId: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="G-XXXXXXXXXX"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Meta Pixel ID</label>
                      <input
                        type="text"
                        value={settings.analytics?.metaPixelId || ''}
                        onChange={(e) => updateSettingsField('analytics', { ...settings.analytics, metaPixelId: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="123456789012345"
                      />
                      <p className="text-sm text-gray-400 mt-1">Facebook/Meta Pixel ID for conversion tracking</p>
                    </div>
                  </div>
                </div>

                {/* Email Integration */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-200 mb-4">Email Marketing</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Email Service Provider</label>
                      <select
                        value={settings.email?.provider || 'none'}
                        onChange={(e) => updateSettingsField('email', { ...settings.email, provider: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="none">None</option>
                        <option value="mailchimp">Mailchimp</option>
                        <option value="convertkit">ConvertKit</option>
                        <option value="activecampaign">ActiveCampaign</option>
                      </select>
                    </div>

                    {settings.email?.provider && settings.email.provider !== 'none' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">API Key</label>
                        <input
                          type="password"
                          value={settings.email?.apiKey || ''}
                          onChange={(e) => updateSettingsField('email', { ...settings.email, apiKey: e.target.value })}
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Enter API key..."
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Media Library Modal */}
        <MediaLibrary
          isOpen={showMediaLibrary}
          onClose={() => {
            setShowMediaLibrary(false);
            setMediaTarget(null);
          }}
          onSelect={handleMediaSelect}
          siteId={id}
          initialFilter={mediaTarget === 'audio' || mediaTarget === 'aboutAudio' ? 'audio' : mediaTarget === 'leadMagnetPdf' ? 'document' : mediaTarget === 'leadMagnet' ? 'image' : 'all'}
        />
      </div>
    </EnhancedAdminLayout>
  );
}