'use client';

import { useEffect, useState } from 'react';
import { WidgetInstance } from '@/lib/widget-registry';

interface DynamicWidgetLoaderProps {
  siteId: string;
  pageId?: string;
  className?: string;
}

export default function DynamicWidgetLoader({ 
  siteId, 
  pageId, 
  className = '' 
}: DynamicWidgetLoaderProps) {
  const [widgets, setWidgets] = useState<WidgetInstance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWidgets() {
      try {
        const response = await fetch(`/api/widgets?siteId=${siteId}${pageId ? `&pageId=${pageId}` : ''}`);
        const data = await response.json();
        
        if (data.instances) {
          setWidgets(data.instances);
        }
      } catch (error) {
        console.error('Error loading dynamic widgets:', error);
      } finally {
        setLoading(false);
      }
    }

    loadWidgets();
  }, [siteId, pageId]);

  if (loading) {
    return (
      <div className={`dynamic-widgets-loading ${className}`}>
        <div className="text-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Loading widgets...</p>
        </div>
      </div>
    );
  }

  if (widgets.length === 0) {
    return null; // No widgets to show
  }

  return (
    <div className={`dynamic-widgets-container ${className}`}>
      {widgets.map((widget) => (
        <DynamicWidget key={widget.id} instanceId={widget.id} />
      ))}
    </div>
  );
}

interface DynamicWidgetProps {
  instanceId: string;
}

function DynamicWidget({ instanceId }: DynamicWidgetProps) {
  const [html, setHtml] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWidgetHtml() {
      try {
        const response = await fetch(`/api/widgets/render?instanceId=${instanceId}`);
        const html = await response.text();
        setHtml(html);
      } catch (error) {
        console.error(`Error loading widget ${instanceId}:`, error);
        setHtml(`<!-- Error loading widget ${instanceId} -->`);
      } finally {
        setLoading(false);
      }
    }

    loadWidgetHtml();
  }, [instanceId]);

  useEffect(() => {
    if (html && !loading) {
      // Execute any scripts in the loaded HTML
      const scripts = document.querySelectorAll(`#widget-${instanceId} script`);
      scripts.forEach(scriptEl => {
        const script = scriptEl as HTMLScriptElement;
        const newScript = document.createElement('script');
        if (script.src) {
          newScript.src = script.src;
        } else {
          newScript.textContent = script.textContent;
        }
        document.head.appendChild(newScript);
      });
    }
  }, [html, loading, instanceId]);

  if (loading) {
    return (
      <div className="dynamic-widget-loading">
        <div className="animate-pulse bg-gray-200 rounded h-20"></div>
      </div>
    );
  }

  return (
    <div 
      id={`widget-${instanceId}`}
      className="dynamic-widget"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}