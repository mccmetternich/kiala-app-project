'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Eye, Plus, Image as ImageIcon, Type, BarChart3, Users, Clock, Star, Zap, Upload } from 'lucide-react';
import Link from 'next/link';
import EnhancedAdminLayout from '@/components/admin/EnhancedAdminLayout';
import MediaLibrary from '@/components/admin/MediaLibrary';

interface Site {
  id: string;
  name: string;
  domain: string;
  subdomain: string;
}

interface Widget {
  id: string;
  name: string;
  description: string;
  icon: any;
  component: string;
  defaultProps: any;
}

const AVAILABLE_WIDGETS: Widget[] = [
  {
    id: 'hero-story',
    name: 'Hero Story',
    description: 'Compelling story section with emotional hook',
    icon: Type,
    component: 'HeroStory',
    defaultProps: {
      title: 'Transform Your Health in 30 Days',
      subtitle: 'Discover the simple method thousands of women are using',
      story: 'When Sarah tried everything to lose weight after 40...',
      image: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=600&h=400&fit=crop'
    }
  },
  {
    id: 'testimonial-carousel',
    name: 'Testimonial Carousel',
    description: 'Social proof with rotating testimonials',
    icon: Users,
    component: 'TestimonialCarousel',
    defaultProps: {
      testimonials: [
        {
          name: 'Sarah M.',
          location: 'Denver, CO',
          text: 'Lost 15 pounds in 30 days without any crazy diets!',
          image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face'
        }
      ]
    }
  },
  {
    id: 'product-showcase',
    name: 'Product Showcase',
    description: 'Featured product with benefits and CTA',
    icon: Star,
    component: 'ProductShowcase',
    defaultProps: {
      title: 'The Ultimate Hormone Reset Kit',
      price: '$97',
      originalPrice: '$197',
      benefits: ['Balances hormones naturally', 'Boosts energy levels', 'Supports healthy weight']
    }
  },
  {
    id: 'countdown-timer',
    name: 'Countdown Timer',
    description: 'Create urgency with limited-time offers',
    icon: Clock,
    component: 'CountdownTimer',
    defaultProps: {
      title: 'Limited Time Offer',
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  },
  {
    id: 'comparison-table',
    name: 'Comparison Table',
    description: 'Before vs After or product comparison',
    icon: BarChart3,
    component: 'ComparisonTable',
    defaultProps: {
      title: 'See the Difference',
      items: [
        { feature: 'Energy Levels', before: 'Low', after: 'High' },
        { feature: 'Sleep Quality', before: 'Poor', after: 'Excellent' }
      ]
    }
  },
  {
    id: 'scarcity-alert',
    name: 'Scarcity Alert',
    description: 'Limited quantity or availability notice',
    icon: Zap,
    component: 'ScarcityAlert',
    defaultProps: {
      message: 'Only 47 spots remaining this month',
      type: 'warning'
    }
  },
  {
    id: 'credibility-badges',
    name: 'Credibility Badges',
    description: 'Trust signals and certifications',
    icon: Star,
    component: 'CredibilityBadges',
    defaultProps: {
      badges: ['FDA Approved', '30-Day Guarantee', 'Trusted by 10,000+ Women']
    }
  }
];

export default function NewArticle() {
  const router = useRouter();
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(false);
  const [showWidgetSelector, setShowWidgetSelector] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);

  const [formData, setFormData] = useState({
    site_id: '',
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

  const fetchSites = async () => {
    try {
      const response = await fetch('/api/sites');
      const data = await response.json();
      setSites(data.sites || []);
      if (data.sites?.length > 0) {
        setFormData(prev => ({ ...prev, site_id: data.sites[0].id }));
      }
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

  const insertWidget = (widget: Widget) => {
    const widgetMarkdown = `\n\n<!-- WIDGET:${widget.component} -->\n${JSON.stringify(widget.defaultProps, null, 2)}\n<!-- /WIDGET -->\n\n`;
    setFormData(prev => ({
      ...prev,
      content: prev.content + widgetMarkdown
    }));
    setShowWidgetSelector(false);
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
        // Navigate to edit the newly created article
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

  return (
    <EnhancedAdminLayout>
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Create Article</h1>
            <p className="text-gray-400">Write and publish content for your sites</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleSave(false)}
              disabled={loading}
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Save className="w-5 h-5" />
              Save Draft
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={loading}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Eye className="w-5 h-5" />
              Publish
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Basic Info */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Article Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter article title..."
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
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Brief description for previews..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Hero Image
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    This image appears at the top of the article and as the thumbnail in article lists.
                  </p>
                  <div className="flex items-start gap-4">
                    {formData.image ? (
                      <div className="relative group">
                        <img
                          src={formData.image}
                          alt="Preview"
                          className="w-32 h-24 object-cover rounded border border-gray-600"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleInputChange('image', '')}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className="w-32 h-24 bg-gray-700 border border-gray-600 border-dashed rounded flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-500" />
                      </div>
                    )}
                    <div className="flex-1">
                      <button
                        type="button"
                        onClick={() => setShowMediaLibrary(true)}
                        className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors mb-2"
                      >
                        <Upload className="w-4 h-4" />
                        {formData.image ? 'Change Image' : 'Select Image'}
                      </button>
                      <input
                        type="url"
                        value={formData.image}
                        onChange={(e) => handleInputChange('image', e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        placeholder="Or paste image URL..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Editor */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Content</h3>
                <button
                  onClick={() => setShowWidgetSelector(!showWidgetSelector)}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Insert Widget
                </button>
              </div>

              {/* Widget Selector */}
              {showWidgetSelector && (
                <div className="bg-gray-700 rounded-lg p-4 mb-4 border border-gray-600">
                  <h4 className="font-medium mb-3">Choose a Widget</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {AVAILABLE_WIDGETS.map((widget) => {
                      const Icon = widget.icon;
                      return (
                        <button
                          key={widget.id}
                          onClick={() => insertWidget(widget)}
                          className="bg-gray-600 hover:bg-gray-500 p-3 rounded-lg text-left transition-colors"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Icon className="w-5 h-5 text-primary-400" />
                            <span className="font-medium">{widget.name}</span>
                          </div>
                          <p className="text-sm text-gray-300">{widget.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <textarea
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                rows={20}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                placeholder="Write your article content here...

# Article Title

Your content goes here. You can use Markdown formatting.

## Subheading

- Bullet points
- More content
- Call to action

Click 'Insert Widget' above to add interactive elements like testimonials, product showcases, countdown timers, and more!"
              />
              <p className="text-xs text-gray-400 mt-2">
                Supports Markdown formatting and widget insertions. Widgets will be rendered as interactive components on the live site.
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Site & Publishing */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Publishing</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Site *
                  </label>
                  <select
                    value={formData.site_id}
                    onChange={(e) => handleInputChange('site_id', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {sites.map(site => (
                      <option key={site.id} value={site.id}>
                        {site.name}
                      </option>
                    ))}
                  </select>
                  {selectedSite && (
                    <p className="text-xs text-gray-400 mt-1">
                      Will publish to: /site/{selectedSite.subdomain}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="article-url-slug"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., Weight Loss, Nutrition"
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
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    min="1"
                    max="60"
                  />
                </div>
              </div>
            </div>

            {/* Article Flags */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Visibility</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => handleInputChange('featured', e.target.checked)}
                    className="w-4 h-4 text-primary-600 bg-gray-700 border-gray-600 rounded focus:ring-primary-500"
                  />
                  <div>
                    <span className="text-white font-medium">Featured</span>
                    <p className="text-xs text-gray-400">Show prominently on homepage</p>
                  </div>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.trending}
                    onChange={(e) => handleInputChange('trending', e.target.checked)}
                    className="w-4 h-4 text-primary-600 bg-gray-700 border-gray-600 rounded focus:ring-primary-500"
                  />
                  <div>
                    <span className="text-white font-medium">Trending</span>
                    <p className="text-xs text-gray-400">Mark as trending content</p>
                  </div>
                </label>
              </div>
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
    </EnhancedAdminLayout>
  );
}