'use client';

import { TrendingUp, Users, AlertTriangle, Clock, Percent, Heart, Target, Zap, CheckCircle, Activity, BarChart3 } from 'lucide-react';
import TrackedLink from '@/components/TrackedLink';

interface StatItem {
  value: string;
  label: string;  // The description text below the value
  icon?: string;
  color?: 'red' | 'blue' | 'green' | 'amber' | 'purple';  // Optional, defaults to purple
}

interface DataOverviewProps {
  headline?: string;
  subheading?: string;
  stats?: StatItem[];
  source?: string;
  style?: 'cards' | 'inline' | 'banner';
  // Optional CTA
  showCta?: boolean;
  ctaText?: string;
  ctaUrl?: string;
  target?: '_self' | '_blank';
  widgetId?: string;
}

const defaultStats: StatItem[] = [
  {
    value: '96%',
    label: 'of women over 40 experience hormonal imbalance symptoms',
    icon: 'users'
  },
  {
    value: '73%',
    label: 'don\'t know the cause of their fatigue and weight gain',
    icon: 'alert'
  },
  {
    value: '45',
    label: 'average age when symptoms typically begin',
    icon: 'clock'
  },
  {
    value: '15%',
    label: 'lose weight successfully without addressing hormone health first',
    icon: 'trending'
  }
];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  trending: TrendingUp,
  'trending-up': TrendingUp,
  users: Users,
  alert: AlertTriangle,
  clock: Clock,
  percent: Percent,
  heart: Heart,
  target: Target,
  zap: Zap,
  'check-circle': CheckCircle,
  check: CheckCircle,
  activity: Activity,
  chart: BarChart3
};

// Pink/Lavender color palette for brand consistency
const colorMap: Record<string, { bg: string; light: string; text: string; border: string }> = {
  red: { bg: 'from-primary-500 to-primary-600', light: 'bg-primary-50', text: 'text-primary-600', border: 'border-primary-200' },
  blue: { bg: 'from-purple-500 to-purple-600', light: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
  green: { bg: 'from-primary-400 to-purple-500', light: 'bg-primary-50', text: 'text-primary-600', border: 'border-primary-200' },
  amber: { bg: 'from-amber-500 to-amber-600', light: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
  purple: { bg: 'from-purple-500 to-purple-600', light: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
  pink: { bg: 'from-primary-500 to-primary-600', light: 'bg-primary-50', text: 'text-primary-600', border: 'border-primary-200' }
};

export default function DataOverview({
  headline = 'The Numbers Speak',
  subheading,
  stats = defaultStats,
  source = 'Journal of Clinical Endocrinology, 2023',
  style = 'cards',
  showCta = false,
  ctaText = 'Learn More →',
  ctaUrl = '#',
  target = '_self',
  widgetId
}: DataOverviewProps) {
  // Use default subheading if not provided or undefined
  const displaySubheading = subheading || 'Key research findings';

  // CTA Button component
  const CtaButton = () => showCta && ctaText && ctaUrl ? (
    <div className="mt-6 text-center">
      <TrackedLink
        href={ctaUrl}
        target={target}
        widgetType="data-overview"
        widgetId={widgetId}
        widgetName={headline}
        className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white font-bold text-lg py-4 px-10 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
      >
        {ctaText}
      </TrackedLink>
    </div>
  ) : null;

  if (style === 'banner') {
    return (
      <div className="my-8 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-1">{headline}</h2>
          <p className="text-gray-400">{displaySubheading}</p>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-gray-300 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
        {source && (
          <div className="text-center mt-6 text-xs text-gray-500">
            Source: {source}
          </div>
        )}
        <CtaButton />
      </div>
    );
  }

  if (style === 'inline') {
    return (
      <div className="my-8 bg-gradient-to-r from-primary-50 to-purple-50 rounded-xl p-6 border border-primary-100">
        <h3 className="text-xl font-bold text-gray-900 text-center mb-4">{headline}</h3>
        <div className="flex flex-wrap justify-center gap-6 text-center">
          {stats.map((stat, idx) => (
            <div key={idx} className="px-4">
              <span className="text-3xl font-bold text-primary-600">{stat.value}</span>
              <span className="text-gray-600 ml-2">{stat.label}</span>
            </div>
          ))}
        </div>
        <CtaButton />
      </div>
    );
  }

  // Default: cards style - simplified with consistent purple theme
  return (
    <div className="my-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{headline}</h2>
        <p className="text-gray-600">{displaySubheading}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = iconMap[stat.icon || 'trending'] || TrendingUp;
          // Use purple as default, allow override if color is set
          const colors = colorMap[stat.color || 'purple'];

          return (
            <div
              key={idx}
              className={`relative bg-white rounded-xl p-6 border ${colors.border} shadow-sm hover:shadow-md transition-all`}
            >
              {/* Icon */}
              <div className={`w-12 h-12 ${colors.light} rounded-xl flex items-center justify-center mb-4`}>
                <Icon className={`w-6 h-6 ${colors.text}`} />
              </div>

              {/* Stat Value - big purple number */}
              <div className={`text-4xl font-bold ${colors.text} mb-2`}>
                {stat.value}
              </div>

              {/* Description - the text below the value */}
              <div className="text-gray-700">{stat.label}</div>

              {/* Decorative gradient bar */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.bg} rounded-b-xl`}></div>
            </div>
          );
        })}
      </div>

      {/* Source citation */}
      {source && (
        <div className="text-center mt-6 text-sm text-gray-500">
          Source: {source}
        </div>
      )}
    </div>
  );
}
