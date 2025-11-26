'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Users, Bell } from 'lucide-react';
import { Site } from '@/types';
import Badge from '../ui/Badge';

interface SiteHeaderProps {
  site: Site;
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

export default function SiteHeader({ site }: SiteHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Determine the homepage URL based on subdomain or id
  const homeUrl = site.subdomain ? `/site/${site.subdomain}` : `/site/${site.id}`;

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      {/* Announcement Banner */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm">
          <div className="hidden md:flex items-center gap-3">
            <div className="flex -space-x-1">
              <img src={WOMEN_AVATARS[0]} className="w-6 h-6 rounded-full border-2 border-primary-400" alt="" />
              <img src={WOMEN_AVATARS[1]} className="w-6 h-6 rounded-full border-2 border-primary-400" alt="" />
              <img src={WOMEN_AVATARS[2]} className="w-6 h-6 rounded-full border-2 border-primary-400" alt="" />
            </div>
            <span className="font-medium">Join 47,284 women transforming their health!</span>
          </div>
          <Link href={`${homeUrl}/articles/foods-naturally-balance-hormones`} className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <span className="font-medium">✨ New breakthrough research just published!</span>
            <Badge variant="limited" size="sm" className="bg-accent-500 text-white border-accent-400 animate-pulse">
              Read Now
            </Badge>
          </Link>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="bg-white border-b-2 border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href={homeUrl} className="flex items-center gap-3">
            {(site.brand?.logoImage || site.brand?.profileImage) ? (
              <img
                src={site.brand.logoImage || site.brand.profileImage}
                alt={site.brand?.name || 'Logo'}
                className="w-12 h-12 rounded-lg object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {site.brand?.name ? site.brand.name.replace(/^Dr\.?\s*/i, '').split(' ').map(n => n[0]).join('') : 'DR'}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {site.brand?.name || site.name || 'Dr. Heart'}
              </h1>
              <p className="text-sm text-primary-600 font-medium">
                {site.brand?.tagline || '#1 for Women 50+ Online'}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation - Always use consistent full paths */}
          <div className="hidden md:flex items-center gap-8">
            <Link href={homeUrl} className="text-gray-700 hover:text-primary-600 font-medium transition-colors">Home</Link>
            <Link href={`${homeUrl}/articles`} className="text-gray-700 hover:text-primary-600 font-medium transition-colors">Articles</Link>
            <Link href={`${homeUrl}/about`} className="text-gray-700 hover:text-primary-600 font-medium transition-colors">About</Link>
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="flex -space-x-1">
                <img src={WOMEN_AVATARS[3]} className="w-6 h-6 rounded-full border-2 border-white" alt="" />
                <img src={WOMEN_AVATARS[4]} className="w-6 h-6 rounded-full border-2 border-white" alt="" />
                <img src={WOMEN_AVATARS[5]} className="w-6 h-6 rounded-full border-2 border-white" alt="" />
              </div>
              <span>47k+ members</span>
            </div>
            <a
              href="#newsletter"
              className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-2 rounded-full font-medium hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-md hover:shadow-lg text-sm whitespace-nowrap"
            >
              Join Community
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-primary-600"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
            <div className="space-y-2 pt-4">
              <Link href={homeUrl} className="block py-2 text-gray-700 hover:text-primary-600 font-medium" onClick={() => setIsMenuOpen(false)}>Home</Link>
              <Link href={`${homeUrl}/articles`} className="block py-2 text-gray-700 hover:text-primary-600 font-medium" onClick={() => setIsMenuOpen(false)}>Articles</Link>
              <Link href={`${homeUrl}/about`} className="block py-2 text-gray-700 hover:text-primary-600 font-medium" onClick={() => setIsMenuOpen(false)}>About</Link>
              <div className="pt-4">
                <a
                  href="#newsletter"
                  className="block w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm py-3 text-center rounded-lg font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Join Community
                </a>
              </div>
            </div>
          </div>
        )}
        </div>
      </nav>
    </header>
  );
}
