'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit3, Trash2, Layers, Layout, Settings } from 'lucide-react';
import EnhancedAdminLayout from '@/components/admin/EnhancedAdminLayout';
import Badge from '@/components/ui/Badge';

interface WidgetInstance {
  id: string;
  widget_id: string;
  site_id: string;
  page_id?: string;
  position: number;
  settings: Record<string, any>;
  active: boolean;
  created_at: string;
  updated_at: string;
  widget_name?: string;
  category?: string;
}

export default function WidgetInstancesPage() {
  const [instances, setInstances] = useState<WidgetInstance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInstances() {
      try {
        const response = await fetch('/api/admin/widgets/instances');
        if (response.ok) {
          const data = await response.json();
          setInstances(data);
        } else {
          console.error('Failed to fetch widget instances');
        }
      } catch (error) {
        console.error('Error fetching widget instances:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchInstances();
  }, []);

  if (loading) {
    return (
      <EnhancedAdminLayout>
        <div className="p-6 max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/3 mb-6"></div>
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <div className="divide-y divide-gray-700">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="py-4 flex items-center justify-between">
                    <div className="h-6 bg-gray-700 rounded w-1/4"></div>
                    <div className="h-6 bg-gray-700 rounded w-1/6"></div>
                    <div className="h-6 bg-gray-700 rounded w-1/12"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </EnhancedAdminLayout>
    );
  }

  return (
    <EnhancedAdminLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-200">Widget Instances</h1>
            <p className="text-gray-400 mt-1">Manage widgets placed on pages across your sites.</p>
          </div>
          <Link href="/admin/widgets/instances/new" className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Instance
          </Link>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Widget
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Site
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Page
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {instances.map((instance) => (
                <tr key={instance.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-primary-900/50 rounded-lg flex items-center justify-center">
                        <Layers className="w-5 h-5 text-primary-400" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-200">{instance.widget_name || 'Unknown Widget'}</div>
                        <div className="text-xs text-gray-500">{instance.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    <Link href={`/admin/sites/${instance.site_id}/dashboard`} className="text-blue-400 hover:underline">
                      {instance.site_id}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {instance.page_id ? (
                      <Link href={`/admin/pages/${instance.page_id}/edit`} className="text-purple-400 hover:underline">
                        {instance.page_id}
                      </Link>
                    ) : 'Site-wide'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={instance.active ? 'trust' : 'default'} size="sm">
                      {instance.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/admin/widgets/instances/${instance.id}/edit`} className="text-primary-400 hover:text-primary-300 mr-3">
                      <Settings className="w-5 h-5 inline-block" />
                    </Link>
                    <button className="text-red-400 hover:text-red-300">
                      <Trash2 className="w-5 h-5 inline-block" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </EnhancedAdminLayout>
  );
}