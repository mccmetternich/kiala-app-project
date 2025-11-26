'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit3, Trash2, Layout, Layers, Box } from 'lucide-react';
import EnhancedAdminLayout from '@/components/admin/EnhancedAdminLayout';
import Badge from '@/components/ui/Badge';
import { widgetRegistry } from '@/lib/widget-registry';

interface WidgetDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  active: boolean;
  global: boolean;
  created_at: string;
  updated_at: string;
}

export default function WidgetDefinitionsPage() {
  const [definitions, setDefinitions] = useState<WidgetDefinition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDefinitions() {
      try {
        const response = await fetch('/api/admin/widgets/definitions');
        if (response.ok) {
          const data = await response.json();
          setDefinitions(data);
        } else {
          console.error('Failed to fetch widget definitions');
        }
      } catch (error) {
        console.error('Error fetching widget definitions:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchDefinitions();
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
            <h1 className="text-3xl font-bold text-gray-200">Widget Definitions</h1>
            <p className="text-gray-400 mt-1">Manage the global library of available widget types.</p>
          </div>
          <Link href="/admin/widgets/definitions/new" className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Definition
          </Link>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Global
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {definitions.map((definition) => (
                <tr key={definition.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-primary-900/50 rounded-lg flex items-center justify-center">
                        <Box className="w-5 h-5 text-primary-400" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-200">{definition.name}</div>
                        <div className="text-xs text-gray-500">{definition.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    <Badge variant="default" size="sm" className="capitalize">{definition.category}</Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={definition.active ? 'trust' : 'default'} size="sm">
                      {definition.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {definition.global ? 'Yes' : 'No'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/admin/widgets/definitions/${definition.id}/edit`} className="text-primary-400 hover:text-primary-300 mr-3">
                      <Edit3 className="w-5 h-5 inline-block" />
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