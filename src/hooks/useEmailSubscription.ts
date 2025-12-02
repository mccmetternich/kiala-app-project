'use client';

import { useState } from 'react';
import { trackLead } from '@/lib/meta-pixel';

interface SubscriptionResult {
  success: boolean;
  message: string;
  subscriber?: { id: string; email: string };
}

interface UseEmailSubscriptionOptions {
  siteId: string;
  source?: string;
  tags?: string[];
  onSuccess?: (result: SubscriptionResult) => void;
  onError?: (error: string) => void;
}

export function useEmailSubscription({
  siteId,
  source = 'website',
  tags = [],
  onSuccess,
  onError
}: UseEmailSubscriptionOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  const subscribe = async (email: string, name?: string) => {
    if (!email) {
      setError('Email is required');
      onError?.('Email is required');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
          siteId,
          source,
          tags,
          pageUrl: typeof window !== 'undefined' ? window.location.href : undefined
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to subscribe');
      }

      setSuccess(true);
      setMessage(data.message || 'Successfully subscribed!');

      // Fire Meta Pixel Lead event
      trackLead({
        content_name: source || 'email_subscription',
        content_category: 'newsletter_signup'
      });

      onSuccess?.(data);
      return true;

    } catch (err: any) {
      const errorMessage = err.message || 'Something went wrong';
      setError(errorMessage);
      setMessage('');
      onError?.(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setLoading(false);
    setError(null);
    setSuccess(false);
    setMessage('');
  };

  return {
    subscribe,
    loading,
    error,
    success,
    message,
    reset
  };
}
