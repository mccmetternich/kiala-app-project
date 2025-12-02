'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Shield, Heart, Mail, Sparkles, CheckCircle, Users } from 'lucide-react';
import { Site } from '@/types';
import { trackLead } from '@/lib/meta-pixel';

interface SiteFooterProps {
  site: Site;
}

export default function SiteFooter({ site }: SiteFooterProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  // Get the doctor name correctly - avoid "Dr Dr" issues
  const getDoctorName = () => {
    const brandName = site.brand?.name || 'Heart';
    // Remove any leading "Dr." or "Dr " to avoid duplication
    const cleanName = brandName.replace(/^Dr\.?\s*/i, '');
    return cleanName;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    setStatus('loading');

    try {
      const response = await fetch('/api/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          siteId: site.id,
          source: 'footer_signup'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || 'Welcome! Check your inbox.');
        setEmail('');

        // Fire Meta Pixel Lead event
        trackLead({
          content_name: 'footer_signup',
          content_category: 'newsletter_signup'
        });
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Unable to subscribe. Please try again later.');
    }
  };

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      {/* Newsletter Section */}
      <div className="bg-primary-600 text-white py-12" id="newsletter">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">
              Stay Updated with Dr. {getDoctorName()}
            </h3>
            <p className="text-primary-100 mb-6">
              Get weekly wellness insights, exclusive tips, and be the first to know about new research.
            </p>

            {status === 'success' ? (
              <div className="flex items-center justify-center gap-3 bg-green-500/20 border border-green-300 rounded-lg p-4 max-w-md mx-auto">
                <CheckCircle className="w-6 h-6 text-green-300" />
                <span className="font-medium">{message}</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-300"
                  required
                  disabled={status === 'loading'}
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  {status === 'loading' ? 'Joining...' : 'Subscribe'}
                </button>
              </form>
            )}

            {status === 'error' && (
              <p className="text-red-200 text-sm mt-2">{message}</p>
            )}

            <p className="text-xs text-primary-200 mt-3">
              Join 47k+ women • No spam, unsubscribe anytime
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About - Enhanced with mission */}
          <div className="md:col-span-2">
            <h4 className="font-semibold text-gray-900 mb-4">
              About Dr. {getDoctorName()}
            </h4>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              {site.brand?.bio || `Dr. ${getDoctorName()} is on a mission to help women over 40 reclaim their vitality and transform their lives through science-backed wellness protocols. With years of experience and a deep understanding of women's unique health challenges, she provides practical, evidence-based guidance that actually works.`}
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary-500" />
                <span>Medically reviewed</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary-500" />
                <span>47k+ community</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {(site.settings?.navigation || []).map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.url}
                    className="text-gray-600 hover:text-primary-600 transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Why Join - Replaced Contact Info */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Why Join Us</h4>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                <span>Weekly science-backed health tips</span>
              </li>
              <li className="flex items-start gap-2">
                <Heart className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                <span>Exclusive protocols & guides</span>
              </li>
              <li className="flex items-start gap-2">
                <Users className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                <span>Supportive women's community</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                <span>Real results, real transformations</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Heart className="w-4 h-4 text-red-500" />
              <span>Made with care for your wellness journey</span>
            </div>

            <div className="flex items-center gap-6 text-sm">
              <Link
                href="/privacy"
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                Terms of Service
              </Link>
              <span className="text-gray-400">
                © 2024 Dr. {getDoctorName()}
              </span>
            </div>
          </div>

          <div className="mt-4 text-center text-xs text-gray-400">
            <p>{site.settings?.footer?.disclaimer || 'This website is for informational purposes only. Always consult with a healthcare professional.'}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
