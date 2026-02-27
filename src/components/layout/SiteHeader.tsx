'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Bell, Play, Pause } from 'lucide-react';
import { Site, NavigationTemplateConfig } from '@/types';
import Badge from '../ui/Badge';
import { useSiteUrl } from '@/hooks/useSiteUrl';
import { formatCommunityCount } from '@/lib/format-community-count';

interface NavItem {
  id: string;
  slug: string;
  navLabel: string;
  navOrder: number;
  showInNav: boolean;
  enabled: boolean;
}

interface SiteHeaderProps {
  site: Site;
  navConfig?: NavigationTemplateConfig;
}

// Collection of unique women's faces for social proof
const WOMEN_AVATARS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=32&h=32&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=32&h=32&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=32&h=32&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=32&h=32&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=32&h=32&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=32&h=32&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=32&h=32&fit=crop&crop=face',
];

export default function SiteHeader({ site, navConfig }: SiteHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Feature flags from navConfig (with defaults for global mode)
  const showNavLinks = navConfig?.showNavLinks ?? true;
  const showAudioTrack = navConfig?.showAudioTrack ?? true;
  const showSocialProof = navConfig?.showSocialProof ?? true;
  const showLogo = navConfig?.showLogo ?? true;
  const showCta = navConfig?.showCta ?? true;

  // Get audio URL from site settings (only if audio is enabled)
  const effectiveAudioUrl = showAudioTrack
    ? (navConfig?.audioTrack?.url || (site as any).settings?.audioUrl)
    : undefined;

  // Use domain-aware URL helper
  const siteId = site.subdomain || site.id;
  const { getSiteUrl, isCustomDomain } = useSiteUrl(siteId);

  // Determine the homepage URL based on subdomain or id
  const homeUrl = getSiteUrl('/');

  const brand = site.brand;

  // Get formatted community count from settings
  const communityCount = formatCommunityCount((site as any).settings);

  // Build navigation from page_config or use defaults
  const getNavItems = (): { label: string; href: string }[] => {
    const pageConfig = (site as any).page_config;

    if (pageConfig?.pages && Array.isArray(pageConfig.pages)) {
      // Filter to enabled pages that should show in nav, sort by navOrder
      const navPages = pageConfig.pages
        .filter((p: NavItem) => p.enabled && p.showInNav)
        .sort((a: NavItem, b: NavItem) => (a.navOrder || 0) - (b.navOrder || 0));

      if (navPages.length > 0) {
        return navPages.map((p: NavItem) => ({
          label: p.navLabel || p.id,
          href: getSiteUrl(p.slug === '/' ? '/' : p.slug)
        }));
      }
    }

    // Default navigation if no config - articles only
    return [
      { label: 'Articles', href: getSiteUrl('/articles') }
    ];
  };

  const navItems = getNavItems();

  // Track scroll for collapsed header on mobile
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 120);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const togglePlayPause = () => {
    if (!audioRef.current || !effectiveAudioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const currentTime = audioRef.current.currentTime;
    const duration = audioRef.current.duration;
    setProgress((currentTime / duration) * 100);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  return (
    <>
      {/* Desktop Header */}
      <header className="hidden md:block bg-white shadow-md sticky top-0 z-50">
        {/* Desktop: Announcement Banner */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-1">
                <img src={WOMEN_AVATARS[0]} className="w-6 h-6 rounded-full border-2 border-primary-400" alt="" />
                <img src={WOMEN_AVATARS[1]} className="w-6 h-6 rounded-full border-2 border-primary-400" alt="" />
                <img src={WOMEN_AVATARS[2]} className="w-6 h-6 rounded-full border-2 border-primary-400" alt="" />
              </div>
              <span className="font-medium">Join {communityCount.full.replace('+', '')} women transforming their health!</span>
            </div>
            <Link href={getSiteUrl('/articles/bloom-vs-kiala-greens-powder-comparison')} className="flex items-center gap-3 hover:opacity-90 transition-opacity">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <span className="font-medium">✨ New nutritional analysis just published!</span>
              <Badge variant="limited" size="sm" className="bg-accent-500 text-white border-accent-400 animate-pulse">
                Read Now
              </Badge>
            </Link>
          </div>
        </div>

        {/* Desktop: Main Navigation */}
        <nav className="bg-white border-b-2 border-gray-100">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href={homeUrl} className="flex items-center gap-3">
              {(brand?.logoImage || brand?.profileImage) ? (
                <img
                  src={brand.logoImage || brand.profileImage}
                  alt={brand?.name || 'Logo'}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {brand?.name ? brand.name.replace(/^Dr\.?\s*/i, '').split(' ').map(n => n[0]).join('') : 'DR'}
                  </span>
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {brand?.name || site.name || 'WellnessVault'}
                </h1>
                <p className="text-sm text-primary-600 font-medium">
                  {brand?.tagline || 'Evidence-Based Wellness Content'}
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="flex items-center gap-8">
              {navItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* CTA Button */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="flex -space-x-1">
                  <img src={WOMEN_AVATARS[3]} className="w-6 h-6 rounded-full border-2 border-white" alt="" />
                  <img src={WOMEN_AVATARS[4]} className="w-6 h-6 rounded-full border-2 border-white" alt="" />
                  <img src={WOMEN_AVATARS[5]} className="w-6 h-6 rounded-full border-2 border-white" alt="" />
                </div>
                <span>{communityCount.short} members</span>
              </div>
              <a
                href={getSiteUrl('/#newsletter')}
                className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-2 rounded-full font-medium hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-md hover:shadow-lg text-sm whitespace-nowrap"
              >
                Join Community
              </a>
            </div>
          </div>
          </div>
        </nav>
      </header>

      {/* Mobile Header - Single sticky container */}
      <div className="md:hidden sticky top-0 z-50">
        <div className="bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 shadow-lg">
          {/* Announcement Banner - smoothly collapses */}
          <div className={`overflow-hidden transition-all duration-300 ease-out ${isScrolled ? 'max-h-0' : 'max-h-12'}`}>
            <Link
              href={getSiteUrl('/articles/bloom-vs-kiala-greens-powder-comparison')}
              className="flex items-center justify-center gap-2 py-2 px-4 bg-gradient-to-r from-primary-500 to-primary-600"
            >
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                <Bell className="w-3 h-3 text-white" />
              </div>
              <span className="font-medium text-xs text-white">✨ New nutritional analysis!</span>
              <Badge variant="limited" size="sm" className="bg-accent-500 text-white border-accent-400 animate-pulse text-[10px] px-1.5 py-0.5">
                Read Now
              </Badge>
            </Link>
          </div>

          {/* Main Header Content */}
          <div className={`transition-all duration-300 ease-out overflow-hidden ${isScrolled ? 'max-h-14' : 'max-h-32'}`}>
            <div className="px-4 py-3">
              {/* Expanded view - fades out on scroll */}
              <div
                className={`transition-all duration-300 ease-out ${isScrolled ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}
                style={{ transitionProperty: 'opacity, height' }}
              >
                {/* Top row: Avatar + Bio + Hamburger */}
                <div className="flex items-center gap-3 mb-2">
                  <Link href={homeUrl}>
                    <img
                      src={brand?.logoImage || brand?.sidebarImage || brand?.profileImage}
                      alt={brand?.name || 'Doctor'}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-white/30 flex-shrink-0"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm leading-tight">
                      {brand?.name || 'WellnessVault'}
                    </p>
                    <p className="text-white/70 text-xs leading-tight">
                      {brand?.tagline || 'Evidence-Based Wellness Content'}
                    </p>
                    <p className="text-white font-semibold text-xs leading-tight mt-1">
                      👋 Welcome to {brand?.name || 'WellnessVault'}
                    </p>
                  </div>
                  {/* Hamburger Menu Button */}
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                  >
                    {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                  </button>
                </div>

                {/* Play button + Progress bar row */}
                {effectiveAudioUrl && (
                  <div className="flex items-center bg-white/15 backdrop-blur-sm rounded-full pl-1 pr-3 py-1">
                    <button
                      onClick={togglePlayPause}
                      className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-all flex-shrink-0"
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4 text-primary-600" />
                      ) : (
                        <Play className="w-4 h-4 text-primary-600 ml-0.5" />
                      )}
                    </button>
                    <div className="flex-1 mx-3 bg-white/30 rounded-full h-1.5">
                      <div
                        className="bg-white h-full rounded-full transition-all duration-100"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Collapsed view - fades in on scroll */}
              <div
                className={`transition-all duration-300 ease-out ${isScrolled ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}
                style={{ transitionProperty: 'opacity, height' }}
              >
                <div className="flex items-center gap-3">
                  {/* Left: Avatar + Bio */}
                  <Link href={homeUrl} className="flex items-center gap-2 flex-1 min-w-0">
                    <img
                      src={brand?.logoImage || brand?.sidebarImage || brand?.profileImage}
                      alt={brand?.name || 'Doctor'}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-white/30 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-white font-semibold text-xs leading-tight truncate">
                        👋 Welcome to {brand?.name || 'WellnessVault'}
                      </p>
                      <p className="text-white/70 text-[10px] leading-tight truncate">
                        {brand?.tagline || 'Evidence-Based Wellness Content'}
                      </p>
                    </div>
                  </Link>

                  {/* Right: Play button + Progress bar */}
                  {effectiveAudioUrl && (
                    <div className="flex items-center bg-white/15 backdrop-blur-sm rounded-full pl-0.5 pr-2 py-0.5 flex-1 max-w-[140px]">
                      <button
                        onClick={togglePlayPause}
                        className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-all flex-shrink-0"
                      >
                        {isPlaying ? (
                          <Pause className="w-3.5 h-3.5 text-primary-600" />
                        ) : (
                          <Play className="w-3.5 h-3.5 text-primary-600 ml-0.5" />
                        )}
                      </button>
                      <div className="flex-1 mx-2 bg-white/30 rounded-full h-1">
                        <div
                          className="bg-white h-full rounded-full transition-all duration-100"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Hamburger Menu Button */}
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                  >
                    {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          <div className={`overflow-hidden transition-all duration-300 ease-out ${isMenuOpen ? 'max-h-80' : 'max-h-0'}`}>
            <div className="bg-primary-700/95 backdrop-blur-sm border-t border-white/10">
              <div className="px-4 py-4 space-y-2">
                {navItems.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    className="block py-2 px-3 text-white hover:bg-white/10 rounded-lg font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="pt-2">
                  <a
                    href={getSiteUrl('/#newsletter')}
                    className="block w-full bg-white text-primary-600 text-sm py-3 text-center rounded-lg font-bold"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Join Community
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Audio element */}
        <audio
          ref={audioRef}
          src={effectiveAudioUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          preload="metadata"
        />
      </div>
    </>
  );
}
