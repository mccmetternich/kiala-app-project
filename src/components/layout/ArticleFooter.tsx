'use client';

import { useState } from 'react';
import { Site } from '@/types';
import { Mail, CheckCircle } from 'lucide-react';

interface ArticleFooterProps {
  site: Site;
}

export default function ArticleFooter({ site }: ArticleFooterProps) {
  const brand = site.brand;
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setStatus('loading');
    try {
      const response = await fetch('/api/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          siteId: site.id,
          source: 'article_footer'
        }),
      });
      if (response.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <footer className="bg-gradient-to-br from-primary-50 to-purple-50 border-t border-primary-100 py-6 mt-8">
      <div className="container mx-auto px-4">
        <div className="max-w-lg mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Mail className="w-5 h-5 text-primary-600" />
            <span className="text-gray-700 font-medium">Join Our Wellness Community</span>
          </div>

          {status === 'success' ? (
            <div className="flex items-center justify-center gap-2 text-green-600 font-medium py-3">
              <CheckCircle className="w-5 h-5" />
              <span>You're in! Check your inbox.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 mb-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email..."
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                disabled={status === 'loading'}
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold py-2.5 px-5 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 text-sm"
              >
                {status === 'loading' ? 'Joining...' : 'Join Now'}
              </button>
            </form>
          )}

          {status === 'error' && (
            <p className="text-red-500 text-sm mb-2">Something went wrong. Please try again.</p>
          )}

          <p className="text-xs text-gray-400 mt-3">
            © 2024 {brand?.name || 'Dr. Amy'} • For informational purposes only
          </p>
        </div>
      </div>
    </footer>
  );
}
