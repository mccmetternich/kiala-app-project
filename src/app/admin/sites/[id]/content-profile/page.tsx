'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  BookOpen,
  Users,
  Pen,
  Shield,
  MessageSquare,
  Tag,
  Package,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Eye
} from 'lucide-react';
import EnhancedAdminLayout from '@/components/admin/EnhancedAdminLayout';
import Badge from '@/components/ui/Badge';
import { ContentProfile, DEFAULT_CONTENT_PROFILE } from '@/types';

type SectionId = 'mission' | 'audience' | 'style' | 'rules' | 'examples' | 'topics' | 'products';

interface CollapsibleSectionProps {
  id: SectionId;
  title: string;
  description: string;
  icon: React.ElementType;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  completionScore?: number;
}

function CollapsibleSection({
  id,
  title,
  description,
  icon: Icon,
  isOpen,
  onToggle,
  children,
  completionScore = 0
}: CollapsibleSectionProps) {
  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 hover:bg-gray-750 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            completionScore >= 80 ? 'bg-green-900/50 text-green-400' :
            completionScore >= 40 ? 'bg-yellow-900/50 text-yellow-400' :
            'bg-gray-700 text-gray-400'
          }`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-gray-200">{title}</h3>
            <p className="text-sm text-gray-400">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {completionScore > 0 && (
            <Badge
              variant={completionScore >= 80 ? 'trust' : completionScore >= 40 ? 'limited' : 'default'}
              size="sm"
            >
              {completionScore}% complete
            </Badge>
          )}
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="px-6 pb-6 border-t border-gray-700">
          <div className="pt-6">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable tag input component
function TagInput({
  tags,
  onAdd,
  onRemove,
  placeholder,
  label
}: {
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (index: number) => void;
  placeholder: string;
  label: string;
}) {
  const [input, setInput] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      onAdd(input.trim());
      setInput('');
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-3 py-1 bg-gray-700 text-gray-200 rounded-full text-sm"
          >
            {tag}
            <button
              onClick={() => onRemove(index)}
              className="hover:text-red-400 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <button
          onClick={() => {
            if (input.trim()) {
              onAdd(input.trim());
              setInput('');
            }
          }}
          className="px-3 py-2 bg-gray-600 hover:bg-gray-500 text-gray-200 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function ContentProfilePage() {
  const { id } = useParams() as { id: string };
  const [site, setSite] = useState<any>(null);
  const [profile, setProfile] = useState<ContentProfile>(DEFAULT_CONTENT_PROFILE);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [openSections, setOpenSections] = useState<Set<SectionId>>(new Set(['mission']));

  useEffect(() => {
    async function loadSite() {
      try {
        const response = await fetch(`/api/sites/${id}`);
        if (response.ok) {
          const data = await response.json();
          const siteData = data.site;

          // Parse JSON strings
          if (typeof siteData.settings === 'string') {
            try { siteData.settings = JSON.parse(siteData.settings); } catch { siteData.settings = {}; }
          }
          if (typeof siteData.brand_profile === 'string') {
            try { siteData.brand_profile = JSON.parse(siteData.brand_profile); } catch { siteData.brand_profile = {}; }
          }
          if (typeof siteData.content_profile === 'string') {
            try { siteData.content_profile = JSON.parse(siteData.content_profile); } catch { siteData.content_profile = {}; }
          }

          setSite(siteData);

          // Merge with defaults to ensure all fields exist
          const existingProfile = siteData.content_profile || {};
          setProfile({
            ...DEFAULT_CONTENT_PROFILE,
            ...existingProfile,
            audience: { ...DEFAULT_CONTENT_PROFILE.audience, ...existingProfile.audience },
            style: { ...DEFAULT_CONTENT_PROFILE.style, ...existingProfile.style },
            rules: { ...DEFAULT_CONTENT_PROFILE.rules, ...existingProfile.rules },
            examples: { ...DEFAULT_CONTENT_PROFILE.examples, ...existingProfile.examples },
            topics: { ...DEFAULT_CONTENT_PROFILE.topics, ...existingProfile.topics },
            products: { ...DEFAULT_CONTENT_PROFILE.products, ...existingProfile.products },
          });
        }
      } catch (error) {
        console.error('Error loading site:', error);
      } finally {
        setLoading(false);
      }
    }

    if (id) loadSite();
  }, [id]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/sites/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...site,
          content_profile: profile
        }),
      });

      if (response.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSection = (sectionId: SectionId) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  // Calculate completion scores for each section
  const calculateCompletion = (sectionId: SectionId): number => {
    switch (sectionId) {
      case 'mission':
        const missionFields = [profile.mission, profile.uniqueValue];
        return Math.round((missionFields.filter(f => f && f.trim()).length / missionFields.length) * 100);
      case 'audience':
        const audienceFields = [
          profile.audience.demographics,
          profile.audience.painPoints.length > 0,
          profile.audience.goals.length > 0,
          profile.audience.language
        ];
        return Math.round((audienceFields.filter(Boolean).length / audienceFields.length) * 100);
      case 'style':
        const styleFields = [
          profile.style.tone,
          profile.style.voice,
          profile.style.perspective,
          profile.style.readingLevel,
          profile.style.personality.length > 0
        ];
        return Math.round((styleFields.filter(Boolean).length / styleFields.length) * 100);
      case 'rules':
        const rulesFields = [
          profile.rules.doAlways.length > 0,
          profile.rules.neverDo.length > 0,
          profile.rules.productMentions
        ];
        return Math.round((rulesFields.filter(Boolean).length / rulesFields.length) * 100);
      case 'examples':
        const examplesFields = [
          profile.examples.goodPhrases.length > 0,
          profile.examples.badPhrases.length > 0
        ];
        return Math.round((examplesFields.filter(Boolean).length / examplesFields.length) * 100);
      case 'topics':
        const topicsFields = [
          profile.topics.primary.length > 0,
          profile.topics.secondary.length > 0
        ];
        return Math.round((topicsFields.filter(Boolean).length / topicsFields.length) * 100);
      case 'products':
        const productsFields = [
          profile.products.primary.length > 0,
          profile.products.howToMention,
          profile.products.disclosureText
        ];
        return Math.round((productsFields.filter(Boolean).length / productsFields.length) * 100);
      default:
        return 0;
    }
  };

  // Calculate overall completion
  const overallCompletion = Math.round(
    (['mission', 'audience', 'style', 'rules', 'examples', 'topics', 'products'] as SectionId[])
      .reduce((sum, section) => sum + calculateCompletion(section), 0) / 7
  );

  if (loading) {
    return (
      <EnhancedAdminLayout>
        <div className="p-6 max-w-5xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-700 rounded w-1/3"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-800 rounded-xl"></div>
            ))}
          </div>
        </div>
      </EnhancedAdminLayout>
    );
  }

  if (!site) {
    return (
      <EnhancedAdminLayout>
        <div className="p-6 max-w-5xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-200 mb-4">Site Not Found</h1>
          <Link href="/admin" className="btn-primary">Back to Dashboard</Link>
        </div>
      </EnhancedAdminLayout>
    );
  }

  return (
    <EnhancedAdminLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/admin/sites/${id}/dashboard`}
              className="p-2 text-gray-400 hover:text-gray-200 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <div>
              <h1 className="text-3xl font-bold text-gray-200">Content Profile</h1>
              <p className="text-gray-400 mt-1">
                Editorial guidelines for consistent AI-generated content
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {saveSuccess && (
              <Badge variant="trust" size="sm">Saved!</Badge>
            )}
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
              {isSaving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="bg-gradient-to-r from-primary-900/50 to-purple-900/50 rounded-xl border border-primary-700/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-primary-400" />
              <div>
                <h2 className="text-lg font-semibold text-gray-200">Profile Completion</h2>
                <p className="text-sm text-gray-400">
                  A complete profile helps generate more consistent, on-brand content
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary-400">{overallCompletion}%</div>
              <div className="text-sm text-gray-400">complete</div>
            </div>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-primary-500 to-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${overallCompletion}%` }}
            />
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {/* Mission & Purpose */}
          <CollapsibleSection
            id="mission"
            title="Mission & Purpose"
            description="Define what this site is about and what makes it unique"
            icon={BookOpen}
            isOpen={openSections.has('mission')}
            onToggle={() => toggleSection('mission')}
            completionScore={calculateCompletion('mission')}
          >
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Site Mission
                </label>
                <textarea
                  rows={4}
                  value={profile.mission}
                  onChange={(e) => setProfile(p => ({ ...p, mission: e.target.value }))}
                  placeholder="This site helps women 40+ navigate hormonal health with science-backed advice and curated product recommendations from a trusted medical professional..."
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Describe the core purpose of this site in 2-3 sentences
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Unique Value Proposition
                </label>
                <textarea
                  rows={3}
                  value={profile.uniqueValue}
                  onChange={(e) => setProfile(p => ({ ...p, uniqueValue: e.target.value }))}
                  placeholder="Unlike generic health blogs, this site combines 15+ years of clinical experience with the latest research, delivered in a warm, accessible voice that treats readers like patients in a consultation..."
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  What makes this brand different from competitors?
                </p>
              </div>
            </div>
          </CollapsibleSection>

          {/* Target Audience */}
          <CollapsibleSection
            id="audience"
            title="Target Audience"
            description="Who are you writing for? Their problems, goals, and how they speak"
            icon={Users}
            isOpen={openSections.has('audience')}
            onToggle={() => toggleSection('audience')}
            completionScore={calculateCompletion('audience')}
          >
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Demographics
                </label>
                <input
                  type="text"
                  value={profile.audience.demographics}
                  onChange={(e) => setProfile(p => ({
                    ...p,
                    audience: { ...p.audience, demographics: e.target.value }
                  }))}
                  placeholder="Women aged 40-65, primarily in the US, health-conscious but overwhelmed by conflicting information"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <TagInput
                label="Pain Points"
                tags={profile.audience.painPoints}
                onAdd={(tag) => setProfile(p => ({
                  ...p,
                  audience: { ...p.audience, painPoints: [...p.audience.painPoints, tag] }
                }))}
                onRemove={(index) => setProfile(p => ({
                  ...p,
                  audience: { ...p.audience, painPoints: p.audience.painPoints.filter((_, i) => i !== index) }
                }))}
                placeholder="Add a pain point (e.g., 'Unexplained weight gain')"
              />

              <TagInput
                label="Goals & Desires"
                tags={profile.audience.goals}
                onAdd={(tag) => setProfile(p => ({
                  ...p,
                  audience: { ...p.audience, goals: [...p.audience.goals, tag] }
                }))}
                onRemove={(index) => setProfile(p => ({
                  ...p,
                  audience: { ...p.audience, goals: p.audience.goals.filter((_, i) => i !== index) }
                }))}
                placeholder="Add a goal (e.g., 'Natural solutions')"
              />

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  How They Talk About Problems
                </label>
                <textarea
                  rows={3}
                  value={profile.audience.language}
                  onChange={(e) => setProfile(p => ({
                    ...p,
                    audience: { ...p.audience, language: e.target.value }
                  }))}
                  placeholder="They say things like 'I feel like my body betrayed me' or 'Nothing works anymore' or 'My doctor doesn't take me seriously'..."
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          </CollapsibleSection>

          {/* Writing Style */}
          <CollapsibleSection
            id="style"
            title="Writing Style"
            description="Tone, voice, and personality for all content"
            icon={Pen}
            isOpen={openSections.has('style')}
            onToggle={() => toggleSection('style')}
            completionScore={calculateCompletion('style')}
          >
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tone
                  </label>
                  <input
                    type="text"
                    value={profile.style.tone}
                    onChange={(e) => setProfile(p => ({
                      ...p,
                      style: { ...p.style, tone: e.target.value }
                    }))}
                    placeholder="Warm, authoritative, empathetic"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Voice
                  </label>
                  <input
                    type="text"
                    value={profile.style.voice}
                    onChange={(e) => setProfile(p => ({
                      ...p,
                      style: { ...p.style, voice: e.target.value }
                    }))}
                    placeholder="Like a trusted friend who's also a doctor"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Perspective
                  </label>
                  <select
                    value={profile.style.perspective}
                    onChange={(e) => setProfile(p => ({
                      ...p,
                      style: { ...p.style, perspective: e.target.value as 'first' | 'third' }
                    }))}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="first">First Person ("I recommend...")</option>
                    <option value="third">Third Person ("Dr. Amy recommends...")</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Reading Level
                  </label>
                  <select
                    value={profile.style.readingLevel}
                    onChange={(e) => setProfile(p => ({
                      ...p,
                      style: { ...p.style, readingLevel: e.target.value }
                    }))}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="6th grade">6th Grade (Very Simple)</option>
                    <option value="8th grade">8th Grade (Accessible)</option>
                    <option value="10th grade">10th Grade (Moderate)</option>
                    <option value="College">College Level (Advanced)</option>
                  </select>
                </div>
              </div>

              <TagInput
                label="Personality Traits"
                tags={profile.style.personality}
                onAdd={(tag) => setProfile(p => ({
                  ...p,
                  style: { ...p.style, personality: [...p.style.personality, tag] }
                }))}
                onRemove={(index) => setProfile(p => ({
                  ...p,
                  style: { ...p.style, personality: p.style.personality.filter((_, i) => i !== index) }
                }))}
                placeholder="Add a trait (e.g., 'Caring', 'Science-backed')"
              />
            </div>
          </CollapsibleSection>

          {/* Content Rules */}
          <CollapsibleSection
            id="rules"
            title="Content Rules"
            description="What to always do and never do in content"
            icon={Shield}
            isOpen={openSections.has('rules')}
            onToggle={() => toggleSection('rules')}
            completionScore={calculateCompletion('rules')}
          >
            <div className="space-y-6">
              <TagInput
                label="Always Do"
                tags={profile.rules.doAlways}
                onAdd={(tag) => setProfile(p => ({
                  ...p,
                  rules: { ...p.rules, doAlways: [...p.rules.doAlways, tag] }
                }))}
                onRemove={(index) => setProfile(p => ({
                  ...p,
                  rules: { ...p.rules, doAlways: p.rules.doAlways.filter((_, i) => i !== index) }
                }))}
                placeholder="Add a rule (e.g., 'Cite research studies')"
              />

              <TagInput
                label="Never Do"
                tags={profile.rules.neverDo}
                onAdd={(tag) => setProfile(p => ({
                  ...p,
                  rules: { ...p.rules, neverDo: [...p.rules.neverDo, tag] }
                }))}
                onRemove={(index) => setProfile(p => ({
                  ...p,
                  rules: { ...p.rules, neverDo: p.rules.neverDo.filter((_, i) => i !== index) }
                }))}
                placeholder="Add a rule (e.g., 'Use fear-mongering language')"
              />

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  How to Mention Products
                </label>
                <textarea
                  rows={3}
                  value={profile.rules.productMentions}
                  onChange={(e) => setProfile(p => ({
                    ...p,
                    rules: { ...p.rules, productMentions: e.target.value }
                  }))}
                  placeholder="Products should be mentioned naturally as personal recommendations, never pushy or salesy. Share genuine experience and specific benefits rather than hype..."
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          </CollapsibleSection>

          {/* Voice Examples */}
          <CollapsibleSection
            id="examples"
            title="Voice Examples"
            description="Examples of good and bad phrases for this brand"
            icon={MessageSquare}
            isOpen={openSections.has('examples')}
            onToggle={() => toggleSection('examples')}
            completionScore={calculateCompletion('examples')}
          >
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Good Phrases (On-Brand)
                </label>
                <div className="space-y-2 mb-3">
                  {profile.examples.goodPhrases.map((phrase, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-green-900/20 border border-green-700/50 rounded-lg">
                      <span className="text-green-400 mt-0.5">✓</span>
                      <span className="flex-1 text-gray-200 text-sm">{phrase}</span>
                      <button
                        onClick={() => setProfile(p => ({
                          ...p,
                          examples: { ...p.examples, goodPhrases: p.examples.goodPhrases.filter((_, i) => i !== index) }
                        }))}
                        className="text-gray-400 hover:text-red-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="goodPhrase"
                    placeholder="Add a good phrase example..."
                    className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                        setProfile(p => ({
                          ...p,
                          examples: { ...p.examples, goodPhrases: [...p.examples.goodPhrases, (e.target as HTMLInputElement).value.trim()] }
                        }));
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById('goodPhrase') as HTMLInputElement;
                      if (input.value.trim()) {
                        setProfile(p => ({
                          ...p,
                          examples: { ...p.examples, goodPhrases: [...p.examples.goodPhrases, input.value.trim()] }
                        }));
                        input.value = '';
                      }
                    }}
                    className="px-3 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bad Phrases (Off-Brand)
                </label>
                <div className="space-y-2 mb-3">
                  {profile.examples.badPhrases.map((phrase, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-red-900/20 border border-red-700/50 rounded-lg">
                      <span className="text-red-400 mt-0.5">✗</span>
                      <span className="flex-1 text-gray-200 text-sm">{phrase}</span>
                      <button
                        onClick={() => setProfile(p => ({
                          ...p,
                          examples: { ...p.examples, badPhrases: p.examples.badPhrases.filter((_, i) => i !== index) }
                        }))}
                        className="text-gray-400 hover:text-red-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="badPhrase"
                    placeholder="Add a phrase to avoid..."
                    className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                        setProfile(p => ({
                          ...p,
                          examples: { ...p.examples, badPhrases: [...p.examples.badPhrases, (e.target as HTMLInputElement).value.trim()] }
                        }));
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById('badPhrase') as HTMLInputElement;
                      if (input.value.trim()) {
                        setProfile(p => ({
                          ...p,
                          examples: { ...p.examples, badPhrases: [...p.examples.badPhrases, input.value.trim()] }
                        }));
                        input.value = '';
                      }
                    }}
                    className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Topics & Expertise */}
          <CollapsibleSection
            id="topics"
            title="Topics & Expertise"
            description="Primary and secondary topics this brand covers"
            icon={Tag}
            isOpen={openSections.has('topics')}
            onToggle={() => toggleSection('topics')}
            completionScore={calculateCompletion('topics')}
          >
            <div className="space-y-6">
              <TagInput
                label="Primary Topics (Core Expertise)"
                tags={profile.topics.primary}
                onAdd={(tag) => setProfile(p => ({
                  ...p,
                  topics: { ...p.topics, primary: [...p.topics.primary, tag] }
                }))}
                onRemove={(index) => setProfile(p => ({
                  ...p,
                  topics: { ...p.topics, primary: p.topics.primary.filter((_, i) => i !== index) }
                }))}
                placeholder="Add a primary topic (e.g., 'Hormone Health')"
              />

              <TagInput
                label="Secondary Topics (Related Areas)"
                tags={profile.topics.secondary}
                onAdd={(tag) => setProfile(p => ({
                  ...p,
                  topics: { ...p.topics, secondary: [...p.topics.secondary, tag] }
                }))}
                onRemove={(index) => setProfile(p => ({
                  ...p,
                  topics: { ...p.topics, secondary: p.topics.secondary.filter((_, i) => i !== index) }
                }))}
                placeholder="Add a secondary topic (e.g., 'Sleep Quality')"
              />

              <TagInput
                label="Topics to Avoid"
                tags={profile.topics.avoidTopics}
                onAdd={(tag) => setProfile(p => ({
                  ...p,
                  topics: { ...p.topics, avoidTopics: [...p.topics.avoidTopics, tag] }
                }))}
                onRemove={(index) => setProfile(p => ({
                  ...p,
                  topics: { ...p.topics, avoidTopics: p.topics.avoidTopics.filter((_, i) => i !== index) }
                }))}
                placeholder="Add a topic to avoid (e.g., 'Controversial treatments')"
              />
            </div>
          </CollapsibleSection>

          {/* Products & Affiliates */}
          <CollapsibleSection
            id="products"
            title="Products & Affiliates"
            description="Products to promote and disclosure requirements"
            icon={Package}
            isOpen={openSections.has('products')}
            onToggle={() => toggleSection('products')}
            completionScore={calculateCompletion('products')}
          >
            <div className="space-y-6">
              <TagInput
                label="Primary Products to Promote"
                tags={profile.products.primary}
                onAdd={(tag) => setProfile(p => ({
                  ...p,
                  products: { ...p.products, primary: [...p.products.primary, tag] }
                }))}
                onRemove={(index) => setProfile(p => ({
                  ...p,
                  products: { ...p.products, primary: p.products.primary.filter((_, i) => i !== index) }
                }))}
                placeholder="Add a product name"
              />

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  How to Mention Products
                </label>
                <textarea
                  rows={3}
                  value={profile.products.howToMention}
                  onChange={(e) => setProfile(p => ({
                    ...p,
                    products: { ...p.products, howToMention: e.target.value }
                  }))}
                  placeholder="Mention products through personal experience and genuine recommendations. Explain specific benefits you've seen in your practice..."
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Affiliate Disclosure Text
                </label>
                <textarea
                  rows={2}
                  value={profile.products.disclosureText}
                  onChange={(e) => setProfile(p => ({
                    ...p,
                    products: { ...p.products, disclosureText: e.target.value }
                  }))}
                  placeholder="This article contains affiliate links. If you purchase through these links, I may earn a small commission at no extra cost to you..."
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          </CollapsibleSection>
        </div>

        {/* Sticky Save Button */}
        <div className="sticky bottom-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary flex items-center gap-2 shadow-lg"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Content Profile'}
          </button>
        </div>
      </div>
    </EnhancedAdminLayout>
  );
}
