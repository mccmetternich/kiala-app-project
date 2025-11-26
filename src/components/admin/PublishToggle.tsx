'use client';

import { useState } from 'react';
import { Globe, Eye, EyeOff } from 'lucide-react';

interface PublishToggleProps {
  siteId: string;
  initialStatus: 'published' | 'draft';
  onStatusChange?: (status: 'published' | 'draft') => void;
  size?: 'sm' | 'md' | 'lg';
}

export default function PublishToggle({ 
  siteId, 
  initialStatus, 
  onStatusChange,
  size = 'md'
}: PublishToggleProps) {
  const [status, setStatus] = useState(initialStatus);
  const [isLoading, setIsLoading] = useState(false);

  const toggleStatus = async () => {
    setIsLoading(true);
    const newStatus = status === 'published' ? 'draft' : 'published';

    try {
      const response = await fetch(`/api/sites/${siteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setStatus(newStatus);
        onStatusChange?.(newStatus);
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating site status:', error);
      alert('Failed to update site status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'h-5 w-9',
    md: 'h-6 w-11',
    lg: 'h-7 w-13'
  };

  const dotSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const translateClasses = {
    sm: status === 'published' ? 'translate-x-4' : 'translate-x-0',
    md: status === 'published' ? 'translate-x-5' : 'translate-x-0',
    lg: status === 'published' ? 'translate-x-6' : 'translate-x-0'
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        {status === 'published' ? (
          <Eye className="w-4 h-4 text-green-500" />
        ) : (
          <EyeOff className="w-4 h-4 text-gray-400" />
        )}
        <span className={`text-sm font-medium ${
          status === 'published' ? 'text-green-400' : 'text-gray-400'
        }`}>
          {status === 'published' ? 'Published' : 'Draft'}
        </span>
      </div>

      <button
        onClick={toggleStatus}
        disabled={isLoading}
        className={`${sizeClasses[size]} relative inline-flex items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
          status === 'published'
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-gray-600 hover:bg-gray-500'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`${dotSizeClasses[size]} inline-block transform rounded-full bg-white transition-transform ${translateClasses[size]}`}
        />
      </button>

      {status === 'published' && (
        <div className="flex items-center gap-1 text-xs text-green-400">
          <Globe className="w-3 h-3" />
          <span>Live</span>
        </div>
      )}
    </div>
  );
}