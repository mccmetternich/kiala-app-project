'use client';

import { useState } from 'react';
import { Star, Users, Shield, Zap } from 'lucide-react';
import { trackLead } from '@/lib/meta-pixel';

interface NewsletterSignupProps {
  title?: string;
  description?: string;
  placeholder?: string;
  // Standardized prop
  ctaText?: string;
  // Legacy prop for backwards compatibility
  buttonText?: string;
  siteId?: string;
}

export default function NewsletterSignup({
  title = 'Join Our Wellness Community',
  description = 'Get exclusive health insights, breakthrough protocols, and special offers delivered to your inbox',
  placeholder = 'Enter your email',
  ctaText,
  buttonText = 'Join the Community',
  siteId
}: NewsletterSignupProps) {
  // Use standardized prop, fall back to legacy prop
  const finalButtonText = ctaText || buttonText;
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          siteId: siteId || 'default',
          source: 'newsletter_widget'
        }),
      });

      if (response.ok) {
        setStatus('success');
        setMessage('Welcome to the community! Check your inbox.');
        setEmail('');

        // Fire Meta Pixel Lead event
        trackLead({
          content_name: 'newsletter_widget',
          content_category: 'newsletter_signup'
        });
      } else {
        const data = await response.json();
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Unable to subscribe. Please try again later.');
    }
  };

  return (
    <div id="newsletter" className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-3xl p-8 lg:p-12 my-12 text-white shadow-2xl scroll-mt-24">
      <div className="max-w-4xl mx-auto">
        {/* Social Proof Header */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-6 mb-8">
          <div className="flex -space-x-3">
            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=48&h=48&fit=crop&crop=face" className="w-12 h-12 rounded-full border-3 border-white shadow-lg" alt="" />
            <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=48&h=48&fit=crop&crop=face" className="w-12 h-12 rounded-full border-3 border-white shadow-lg" alt="" />
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=48&h=48&fit=crop&crop=face" className="w-12 h-12 rounded-full border-3 border-white shadow-lg" alt="" />
            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=48&h=48&fit=crop&crop=face" className="w-12 h-12 rounded-full border-3 border-white shadow-lg" alt="" />
            <div className="w-12 h-12 bg-white/20 rounded-full border-3 border-white flex items-center justify-center text-sm font-bold shadow-lg">
              +47k
            </div>
          </div>
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-1 mb-1">
              {[1,2,3,4,5].map((star) => (
                <Star key={star} className="w-5 h-5 fill-current text-primary-400" />
              ))}
              <span className="ml-2 font-semibold">4.9/5</span>
            </div>
            <p className="text-white/90">Trusted by <span className="font-bold">47,284+</span> women worldwide</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Zap className="w-4 h-4" />
            Free to Join • Instant Access
          </div>
          <h3 className="text-3xl lg:text-4xl font-bold mb-4">{title}</h3>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">{description}</p>
        </div>

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto mb-6">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={placeholder}
            className="flex-1 px-5 py-4 rounded-xl text-gray-900 text-lg focus:outline-none focus:ring-4 focus:ring-white/30"
            disabled={status === 'loading'}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="bg-white text-primary-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {status === 'loading' ? 'Joining...' : finalButtonText}
          </button>
        </form>

        {message && (
          <div
            className={`max-w-xl mx-auto mb-6 p-4 rounded-xl text-center ${
              status === 'success'
                ? 'bg-accent-500/30 border border-accent-300'
                : status === 'error'
                ? 'bg-red-500/30 border border-red-300'
                : ''
            }`}
          >
            {message}
          </div>
        )}

        {/* Trust Signals */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/80">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>No spam, ever</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>Expert-curated content</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span>Weekly insights</span>
          </div>
        </div>
      </div>
    </div>
  );
}
