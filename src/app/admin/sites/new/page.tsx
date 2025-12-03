'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ArrowRight,
  Check, 
  Globe, 
  User, 
  Palette, 
  Rocket,
  Sparkles
} from 'lucide-react';
import EnhancedAdminLayout from '@/components/admin/EnhancedAdminLayout';
import Badge from '@/components/ui/Badge';

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: any;
}

const steps: WizardStep[] = [
  {
    id: 'basics',
    title: 'Site Basics',
    description: 'Set up your site name and domain',
    icon: Globe
  },
  {
    id: 'brand',
    title: 'Brand Profile',
    description: 'Add brand information and assets',
    icon: User
  },
  {
    id: 'theme',
    title: 'Design & Theme',
    description: 'Choose your site colors and style',
    icon: Palette
  },
  {
    id: 'launch',
    title: 'Launch',
    description: 'Review and create your site',
    icon: Rocket
  }
];

const themes = [
  {
    id: 'medical',
    name: 'Medical Authority',
    description: 'Professional medical authority with trust-building elements',
    colors: { primary: '#ec4899', secondary: '#22c55e', accent: '#f59e0b' },
    preview: 'bg-gradient-to-br from-pink-500 to-pink-600'
  },
  {
    id: 'wellness',
    name: 'Wellness Professional',
    description: 'Holistic wellness approach with calming colors',
    colors: { primary: '#059669', secondary: '#3b82f6', accent: '#f59e0b' },
    preview: 'bg-gradient-to-br from-emerald-500 to-emerald-600'
  },
  {
    id: 'clinical',
    name: 'Clinical Research',
    description: 'Research-based clinical approach with professional styling',
    colors: { primary: '#3b82f6', secondary: '#8b5cf6', accent: '#f59e0b' },
    preview: 'bg-gradient-to-br from-blue-500 to-blue-600'
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle & Beauty',
    description: 'Lifestyle and beauty focus with modern styling',
    colors: { primary: '#8b5cf6', secondary: '#ec4899', accent: '#f59e0b' },
    preview: 'bg-gradient-to-br from-purple-500 to-purple-600'
  }
];

export default function NewSitePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  
  const [siteData, setSiteData] = useState({
    name: '',
    domain: '',
    subdomain: '',
    brand: {
      name: '',
      tagline: '',
      bio: '',
      logo: '/api/placeholder/200/200',
      profileImage: '/api/placeholder/200/200',
      quote: ''
    },
    theme: themes[0],
    settings: {
      navigation: [
        { label: 'Home', url: '/', type: 'internal' },
        { label: 'Articles', url: '/articles', type: 'internal' },
        { label: 'My Top Picks', url: '/top-picks', type: 'internal' },
        { label: 'Success Stories', url: '/success-stories', type: 'internal' },
        { label: 'About', url: '/about', type: 'internal' }
      ],
      emailCapture: {
        provider: 'convertkit',
        leadMagnet: {
          title: 'Free Health Guide',
          description: 'Download our comprehensive health guide',
          image: '/api/placeholder/100/100'
        }
      },
      social: {
        instagram: '',
        facebook: '',
        youtube: ''
      }
    }
  });

  const updateSiteData = (field: string, value: any) => {
    setSiteData(prev => ({ ...prev, [field]: value }));
  };

  const updateBrandData = (field: string, value: any) => {
    setSiteData(prev => ({
      ...prev,
      brand: { ...prev.brand, [field]: value }
    }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const generateSubdomain = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 20);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Basics
        return siteData.name && siteData.subdomain;
      case 1: // Brand
        return siteData.brand.name && siteData.brand.tagline;
      case 2: // Theme
        return siteData.theme;
      case 3: // Launch
        return true;
      default:
        return false;
    }
  };

  const createSite = async () => {
    setIsCreating(true);

    try {
      const response = await fetch('/api/sites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: siteData.name,
          domain: siteData.domain,
          subdomain: siteData.subdomain,
          theme: siteData.theme.id,
          settings: siteData.settings,
          brand_profile: siteData.brand,
          status: 'draft'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/admin/sites/${data.site.id}/settings`);
      } else {
        alert('Error creating site. Please try again.');
        setIsCreating(false);
      }
    } catch (error) {
      console.error('Error creating site:', error);
      alert('Error creating site. Please try again.');
      setIsCreating(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Site Basics
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Site Name *
              </label>
              <input
                type="text"
                value={siteData.name}
                onChange={(e) => {
                  updateSiteData('name', e.target.value);
                  // Auto-generate subdomain
                  const subdomain = generateSubdomain(e.target.value);
                  updateSiteData('subdomain', subdomain);
                }}
                placeholder="Dr. Smith Wellness"
                className="w-full border border-gray-600 bg-gray-700 text-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Subdomain *
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={siteData.subdomain}
                  onChange={(e) => updateSiteData('subdomain', e.target.value)}
                  placeholder="drsmith"
                  className="flex-1 border border-gray-600 bg-gray-700 text-gray-200 rounded-l-lg p-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <span className="px-3 py-3 bg-gray-600 border border-l-0 border-gray-600 rounded-r-lg text-gray-300 text-sm">
                  (subdomain)
                </span>
              </div>
              <p className="text-sm text-gray-400 mt-1">
                This will be your site's URL until you set up a custom domain
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Custom Domain (Optional)
              </label>
              <input
                type="text"
                value={siteData.domain}
                onChange={(e) => updateSiteData('domain', e.target.value)}
                placeholder="drsmith.com"
                className="w-full border border-gray-600 bg-gray-700 text-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-400 mt-1">
                You can add this later and we'll help you set it up
              </p>
            </div>
          </div>
        );

      case 1: // Brand Profile
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Brand Name *
                </label>
                <input
                  type="text"
                  value={siteData.brand.name}
                  onChange={(e) => updateBrandData('name', e.target.value)}
                  placeholder="e.g., Best Mattress Reviews"
                  className="w-full border border-gray-600 bg-gray-700 text-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Tagline *
                </label>
                <input
                  type="text"
                  value={siteData.brand.tagline}
                  onChange={(e) => updateBrandData('tagline', e.target.value)}
                  placeholder="e.g., The best mattresses for a good night's sleep"
                  className="w-full border border-gray-600 bg-gray-700 text-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Brand Bio
              </label>
              <textarea
                rows={4}
                value={siteData.brand.bio}
                onChange={(e) => updateBrandData('bio', e.target.value)}
                placeholder="e.g., We are a team of sleep experts dedicated to helping you find the perfect mattress..."
                className="w-full border border-gray-600 bg-gray-700 text-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Brand Quote
              </label>
              <textarea
                rows={2}
                value={siteData.brand.quote}
                onChange={(e) => updateBrandData('quote', e.target.value)}
                placeholder="e.g., A good night's sleep is not a luxury, it's a necessity."
                className="w-full border border-gray-600 bg-gray-700 text-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        );

      case 2: // Theme Selection
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-200 mb-4">Choose Your Site Style</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {themes.map((theme) => (
                  <div
                    key={theme.id}
                    onClick={() => updateSiteData('theme', theme)}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      siteData.theme.id === theme.id
                        ? 'border-primary-500 bg-gray-700'
                        : 'border-gray-600 hover:border-gray-500 bg-gray-800'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-16 h-16 rounded-lg ${theme.preview}`}></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-200">{theme.name}</h4>
                          {siteData.theme.id === theme.id && (
                            <Check className="w-5 h-5 text-primary-400" />
                          )}
                        </div>
                        <p className="text-sm text-gray-400">{theme.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.colors.primary }}></div>
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.colors.secondary }}></div>
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.colors.accent }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 3: // Launch Review
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Sparkles className="w-16 h-16 text-primary-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-200 mb-2">Ready to Launch!</h3>
              <p className="text-gray-400">
                Review your site details below, then click Create Site to get started.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-gray-200 mb-3">Site Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Name:</span>
                    <span className="text-gray-200">{siteData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">URL:</span>
                    <span className="text-gray-200">{siteData.subdomain}.kiala.com</span>
                  </div>
                  {siteData.domain && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Custom Domain:</span>
                      <span className="text-gray-200">{siteData.domain}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-400">Theme:</span>
                    <span className="text-gray-200">{siteData.theme.name}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-gray-200 mb-3">Brand Profile</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Name:</span>
                    <span className="text-gray-200">{siteData.brand.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tagline:</span>
                    <span className="text-gray-200 text-right">{siteData.brand.tagline}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
              <h4 className="font-semibold text-blue-300 mb-2">What happens next?</h4>
              <ul className="text-sm text-blue-200 space-y-1">
                <li>• Your site will be created as a draft</li>
                <li>• You can customize content, colors, and settings</li>
                <li>• Add articles and configure email capture</li>
                <li>• Publish when ready to go live</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <EnhancedAdminLayout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/admin/sites"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-200 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sites
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-200 mb-2">Create New Site</h1>
          <p className="text-gray-400">
            Set up a new direct response site in just a few steps
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  index <= currentStep 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-700 text-gray-400'
                }`}>
                  {index < currentStep ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                
                <div className="ml-3 mr-8">
                  <div className={`text-sm font-medium ${
                    index <= currentStep ? 'text-gray-200' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-400">{step.description}</div>
                </div>

                {index < steps.length - 1 && (
                  <div className={`h-0.5 w-8 mx-4 ${
                    index < currentStep ? 'bg-primary-600' : 'bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 mb-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-200 mb-2">
              {steps[currentStep].title}
            </h2>
            <p className="text-gray-400">{steps[currentStep].description}</p>
          </div>

          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              currentStep === 0
                ? 'text-gray-500 cursor-not-allowed'
                : 'text-gray-300 hover:text-gray-200 hover:bg-gray-700'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex items-center gap-3">
            {currentStep === steps.length - 1 ? (
              <button
                onClick={createSite}
                disabled={!canProceed() || isCreating}
                className="btn-primary flex items-center gap-2"
              >
                <Rocket className="w-4 h-4" />
                {isCreating ? 'Creating Site...' : 'Create Site'}
              </button>
            ) : (
              <button
                onClick={nextStep}
                disabled={!canProceed()}
                className="btn-primary flex items-center gap-2"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </EnhancedAdminLayout>
  );
}