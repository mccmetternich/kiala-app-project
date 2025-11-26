'use client';

import { useState } from 'react';
import { Mail, CheckCircle, Loader2, Gift } from 'lucide-react';

interface EmailCaptureProps {
  headline?: string;
  subheading?: string;
  buttonText?: string;
  siteId: string;
  source?: string;
  tags?: string[];
  style?: 'default' | 'compact' | 'featured';
  showNameField?: boolean;
  incentive?: string;
}

export default function EmailCapture({
  headline = 'Want More Health Tips?',
  subheading = 'Join 10,000+ women getting weekly wellness insights',
  buttonText = 'Subscribe',
  siteId,
  source = 'article_email_capture',
  tags = [],
  style = 'default',
  showNameField = false,
  incentive
}: EmailCaptureProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
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
      const response = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name: showNameField ? name : undefined,
          siteId,
          source,
          tags,
          pageUrl: typeof window !== 'undefined' ? window.location.href : undefined
        }),
      });

      const data = await response.json();

      if (response.ok || data.success) {
        setStatus('success');
        setMessage(data.message || 'Successfully subscribed!');
        setEmail('');
        setName('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className="widget-container bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">You're In!</h3>
          <p className="text-gray-600">{message}</p>
          {incentive && (
            <div className="mt-4 inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
              <Gift className="w-4 h-4" />
              <span>{incentive}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (style === 'compact') {
    return (
      <div className="bg-primary-50 rounded-xl p-4 border border-primary-100">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            disabled={status === 'loading'}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
          >
            {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : buttonText}
          </button>
        </form>
        {status === 'error' && <p className="text-red-600 text-xs mt-2">{message}</p>}
      </div>
    );
  }

  return (
    <div className="widget-container bg-gradient-to-br from-primary-50 to-secondary-50 border-2 border-primary-200">
      <div className="text-center">
        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-6 h-6 text-primary-600" />
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2">{headline}</h3>
        <p className="text-gray-600 mb-6">{subheading}</p>

        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-3">
          {showNameField && (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your first name"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={status === 'loading'}
            />
          )}
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
              disabled={status === 'loading'}
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="btn-primary py-3 px-6 disabled:opacity-50"
            >
              {status === 'loading' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                buttonText
              )}
            </button>
          </div>
        </form>

        {status === 'error' && (
          <p className="text-red-600 text-sm mt-3">{message}</p>
        )}

        <p className="text-xs text-gray-500 mt-4">
          ✓ No spam • Unsubscribe anytime • Free wellness guide included
        </p>
      </div>
    </div>
  );
}
