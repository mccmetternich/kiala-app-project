'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Navigation,
  Plus,
  Settings2,
  Check,
  X,
  Edit3,
  Trash2,
  Copy,
  LayoutTemplate,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Users,
  UserX,
  Link2,
  LinkIcon,
  Sparkles
} from 'lucide-react';
import EnhancedAdminLayout from '@/components/admin/EnhancedAdminLayout';
import { NavigationTemplate, NavigationTemplateConfig, NavMode } from '@/types';

// Feature icon mapping
const FeatureIcon = ({ enabled, enabledIcon: EnabledIcon, disabledIcon: DisabledIcon, label }: {
  enabled: boolean;
  enabledIcon: any;
  disabledIcon: any;
  label: string;
}) => (
  <div
    className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs ${
      enabled
        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
        : 'bg-gray-700 text-gray-500 border border-gray-600'
    }`}
    title={`${label}: ${enabled ? 'Enabled' : 'Disabled'}`}
  >
    {enabled ? <EnabledIcon className="w-3.5 h-3.5" /> : <DisabledIcon className="w-3.5 h-3.5" />}
    <span>{label}</span>
  </div>
);

const BASE_TYPE_LABELS: Record<NavMode, { label: string; description: string; color: string }> = {
  'global': {
    label: 'Full Navigation',
    description: 'All nav links, social proof, and CTAs',
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
  },
  'direct-response': {
    label: 'Direct Response',
    description: 'Logo & social proof only, no nav links',
    color: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
  },
  'minimal': {
    label: 'Minimal',
    description: 'Logo only, maximum focus on content',
    color: 'bg-gray-500/10 text-gray-400 border-gray-500/20'
  }
};

export default function NavigationLibraryPage() {
  const [templates, setTemplates] = useState<NavigationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/navigation-templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      } else {
        setError('Failed to load navigation templates');
      }
    } catch (err) {
      setError('Failed to load navigation templates');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const seedTemplates = async () => {
    try {
      setSeeding(true);
      const response = await fetch('/api/navigation-templates/seed', {
        method: 'POST'
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Seed result:', data);
        await loadTemplates();
      }
    } catch (err) {
      console.error('Error seeding templates:', err);
    } finally {
      setSeeding(false);
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const response = await fetch(`/api/navigation-templates/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setTemplates(prev => prev.filter(t => t.id !== id));
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete template');
      }
    } catch (err) {
      console.error('Error deleting template:', err);
    }
  };

  const duplicateTemplate = async (template: NavigationTemplate) => {
    try {
      const response = await fetch('/api/navigation-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${template.name} (Copy)`,
          description: template.description,
          baseType: template.base_type,
          config: template.config,
          isSystem: false
        })
      });
      if (response.ok) {
        await loadTemplates();
      }
    } catch (err) {
      console.error('Error duplicating template:', err);
    }
  };

  const systemTemplates = templates.filter(t => t.is_system);
  const customTemplates = templates.filter(t => !t.is_system);

  return (
    <EnhancedAdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Navigation className="w-5 h-5 text-white" />
              </div>
              Navigation Library
            </h1>
            <p className="text-gray-400 mt-2">
              Manage navigation templates that control header appearance and features across your sites.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {templates.length === 0 && (
              <button
                onClick={seedTemplates}
                disabled={seeding}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                {seeding ? 'Seeding...' : 'Load System Templates'}
              </button>
            )}
            <button
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Template
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && templates.length === 0 && (
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-12 text-center">
            <div className="w-16 h-16 bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Navigation className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No Navigation Templates</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Get started by loading the system templates or create your own custom navigation configurations.
            </p>
            <button
              onClick={seedTemplates}
              disabled={seeding}
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-5 h-5" />
              {seeding ? 'Loading Templates...' : 'Load System Templates'}
            </button>
          </div>
        )}

        {/* Templates List */}
        {!loading && templates.length > 0 && (
          <div className="space-y-8">
            {/* System Templates */}
            {systemTemplates.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <LayoutTemplate className="w-5 h-5 text-purple-400" />
                  System Templates
                  <span className="text-sm font-normal text-gray-400">
                    (Built-in, cannot be deleted)
                  </span>
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {systemTemplates.map(template => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onDuplicate={() => duplicateTemplate(template)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Custom Templates */}
            {customTemplates.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Settings2 className="w-5 h-5 text-blue-400" />
                  Custom Templates
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {customTemplates.map(template => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onDuplicate={() => duplicateTemplate(template)}
                      onDelete={() => deleteTemplate(template.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 bg-gray-800/50 rounded-xl border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">How Navigation Templates Work</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-sm font-medium text-primary-400 mb-2">Base Types</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><span className="text-blue-400">Full Navigation</span> - Shows all nav links, CTAs, and features</li>
                <li><span className="text-purple-400">Direct Response</span> - Logo and social proof only, keeps focus on content</li>
                <li><span className="text-gray-400">Minimal</span> - Just the logo, maximum content focus</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-primary-400 mb-2">Feature Toggles</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><span className="text-white">Nav Links</span> - Home, Articles, About links</li>
                <li><span className="text-white">Audio Track</span> - Article listen feature</li>
                <li><span className="text-white">Social Proof</span> - Member count & trust badges</li>
                <li><span className="text-white">CTA Button</span> - Join/Subscribe button</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-primary-400 mb-2">Site-Level Overrides</h4>
              <p className="text-sm text-gray-400">
                Each site can choose a default navigation template, or override specific features per-page.
                Article pages can have different nav than homepage.
              </p>
            </div>
          </div>
        </div>
      </div>
    </EnhancedAdminLayout>
  );
}

function TemplateCard({
  template,
  onDuplicate,
  onDelete
}: {
  template: NavigationTemplate;
  onDuplicate: () => void;
  onDelete?: () => void;
}) {
  const config = template.config;
  const baseTypeInfo = BASE_TYPE_LABELS[template.base_type];

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-gray-600 transition-colors">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-white flex items-center gap-2">
              {template.name}
              {template.is_system && (
                <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded">
                  System
                </span>
              )}
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              {template.description || baseTypeInfo.description}
            </p>
          </div>
        </div>

        {/* Base Type Badge */}
        <div className="mt-3">
          <span className={`inline-flex px-2 py-1 text-xs rounded border ${baseTypeInfo.color}`}>
            {baseTypeInfo.label}
          </span>
        </div>
      </div>

      {/* Feature Toggles */}
      <div className="p-4 bg-gray-850">
        <div className="flex flex-wrap gap-2">
          <FeatureIcon
            enabled={config.showNavLinks}
            enabledIcon={Link2}
            disabledIcon={LinkIcon}
            label="Nav"
          />
          <FeatureIcon
            enabled={config.showAudioTrack}
            enabledIcon={Volume2}
            disabledIcon={VolumeX}
            label="Audio"
          />
          <FeatureIcon
            enabled={config.showSocialProof}
            enabledIcon={Users}
            disabledIcon={UserX}
            label="Social"
          />
          <FeatureIcon
            enabled={config.showCta}
            enabledIcon={Eye}
            disabledIcon={EyeOff}
            label="CTA"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t border-gray-700 flex items-center justify-between">
        <button
          onClick={onDuplicate}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <Copy className="w-4 h-4" />
          Duplicate
        </button>

        <div className="flex items-center gap-2">
          {!template.is_system && (
            <>
              <button className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors">
                <Edit3 className="w-4 h-4" />
              </button>
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
