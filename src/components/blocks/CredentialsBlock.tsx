'use client';

import { CredentialsBlock as CredentialsBlockType } from '@/types/blocks';

interface CredentialsBlockProps {
  block: CredentialsBlockType;
}

export default function CredentialsBlock({ block }: CredentialsBlockProps) {
  const { settings } = block;

  const renderList = (items: string[], title: string, icon: string) => (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        {settings.showIcons && <span>{icon}</span>}
        {title}
      </h3>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2 text-gray-700">
            <span className="text-primary-500">{settings.showIcons ? '🎓' : '•'}</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="py-12">
      <div className={`grid gap-8 ${settings.layout === 'side-by-side' ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
        {settings.credentials && settings.credentials.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Credentials</h3>
            <div className="flex flex-wrap gap-2">
              {settings.credentials.map((credential, index) => (
                <span key={index} className="inline-block bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">
                  {credential}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {settings.publications && settings.publications.length > 0 && 
          renderList(settings.publications, 'Publications', '📖')
        }
        
        {settings.certifications && settings.certifications.length > 0 && 
          renderList(settings.certifications, 'Certifications', '✓')
        }
      </div>
    </div>
  );
}