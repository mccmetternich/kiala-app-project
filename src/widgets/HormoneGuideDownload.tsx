'use client';

import { useState } from 'react';

interface HormoneGuideDownloadProps {
  title?: string;
  description?: string;
  buttonText?: string;
  siteId?: string;
}

export default function HormoneGuideDownload({
  title = 'Hormone Balance Quick Start Guide',
  description = 'Join 47,284+ women who have downloaded my free guide to naturally balance hormones in just 7 days. Get the exact meal plans and simple protocols I use with patients.',
  buttonText = 'Download Free Guide',
  siteId
}: HormoneGuideDownloadProps) {
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
          source: 'hormone_guide_widget'
        }),
      });

      if (response.ok) {
        setStatus('success');
        setMessage('Check your inbox for your free guide!');
        setEmail('');
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
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100 shadow-lg my-8">
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
          <span>🎁</span>
          Free Community Resource
        </div>
        <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
          {title}
        </h3>
        <p className="text-gray-700 mb-8 text-lg leading-relaxed">
          {description}
        </p>

        <div className="bg-white rounded-xl p-6 shadow-lg mb-8 max-w-md mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-2xl text-white">📖</span>
            </div>
            <div className="text-left">
              <div className="font-semibold text-gray-800">Free Download</div>
              <div className="text-sm text-gray-600">PDF Guide + Email Course</div>
            </div>
          </div>
          <div className="space-y-2 text-sm text-gray-600 text-left">
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              7-Day Meal Plan Templates
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Supplement Timing Guide
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Hormone Testing Checklist
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Weekly Email Support
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={status === 'loading'}
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold px-6 py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg disabled:opacity-50"
            >
              {status === 'loading' ? 'Sending...' : buttonText}
            </button>
          </div>
        </form>

        {message && (
          <div
            className={`mb-4 p-3 rounded-lg ${
              status === 'success'
                ? 'bg-green-100 text-green-800'
                : status === 'error'
                ? 'bg-red-100 text-red-800'
                : ''
            }`}
          >
            {message}
          </div>
        )}

        <p className="text-sm text-gray-500">
          No spam, ever. Unsubscribe anytime.
        </p>
      </div>
    </div>
  );
}
