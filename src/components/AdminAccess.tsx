'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Settings, Eye, EyeOff } from 'lucide-react';

export default function AdminAccess() {
  const [isVisible, setIsVisible] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Show admin access with Cmd+Shift+A (Mac) or Ctrl+Shift+A (Windows)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsVisible(prev => !prev);
      }
    };

    // Show button after a few seconds or on mouse movement
    const timer = setTimeout(() => setShowButton(true), 3000);
    
    window.addEventListener('keydown', handleKeyPress);
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      clearTimeout(timer);
    };
  }, []);

  if (!showButton && !isVisible) return null;

  return (
    <>
      {/* Floating admin button */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="w-12 h-12 bg-gray-800 hover:bg-gray-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
          title="Admin Access (⌘⇧A)"
        >
          {isVisible ? <EyeOff className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
        </button>
      </div>

      {/* Admin panel overlay */}
      {isVisible && (
        <div className="fixed bottom-20 right-4 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 min-w-[200px]">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-800 border-b pb-2">
              <Settings className="w-4 h-4" />
              Quick Access
            </div>
            
            <Link 
              href="/admin" 
              className="flex items-center gap-2 p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              onClick={() => setIsVisible(false)}
            >
              <span>🏠</span> Admin Dashboard
            </Link>
            
            <Link 
              href="/admin/sites" 
              className="flex items-center gap-2 p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              onClick={() => setIsVisible(false)}
            >
              <span>🌐</span> Manage Sites
            </Link>
            
            <Link 
              href="/admin/pages/new" 
              className="flex items-center gap-2 p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              onClick={() => setIsVisible(false)}
            >
              <span>➕</span> Create Page
            </Link>
            
            <Link 
              href="/dr-heart" 
              className="flex items-center gap-2 p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              onClick={() => setIsVisible(false)}
            >
              <Eye className="w-4 h-4" /> Preview Demo
            </Link>
            
            <div className="pt-2 border-t text-xs text-gray-500">
              Tip: Use ⌘⇧A to toggle
            </div>
          </div>
        </div>
      )}
    </>
  );
}