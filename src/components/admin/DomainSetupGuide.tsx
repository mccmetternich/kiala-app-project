'use client';

import { useState } from 'react';
import { 
  Globe, 
  Copy, 
  Check, 
  ExternalLink, 
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface DomainSetupGuideProps {
  domain?: string;
  subdomain: string;
}

export default function DomainSetupGuide({ domain, subdomain }: DomainSetupGuideProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'failed'>('pending');

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const verifyDomain = async () => {
    // Mock verification - in real implementation, this would check DNS records
    setVerificationStatus('pending');
    setTimeout(() => {
      setVerificationStatus(Math.random() > 0.5 ? 'verified' : 'failed');
    }, 2000);
  };

  const dnsRecords = [
    {
      type: 'CNAME',
      name: '@',
      value: 'kiala-dr-god.vercel.app',
      description: 'Main domain redirect'
    },
    {
      type: 'CNAME',
      name: 'www',
      value: 'kiala-dr-god.vercel.app',
      description: 'WWW subdomain redirect'
    }
  ];

  const StatusIcon = {
    pending: <Clock className="w-5 h-5 text-yellow-500" />,
    verified: <CheckCircle className="w-5 h-5 text-green-500" />,
    failed: <AlertCircle className="w-5 h-5 text-red-500" />
  };

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <div className="bg-gray-700 rounded-lg p-4">
        <h4 className="font-semibold text-gray-200 mb-3">Current Site URLs</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-gray-400">Kiala Subdomain:</span>
              <div className="text-gray-200 font-mono">{subdomain}.kiala.com</div>
            </div>
            <div className="flex items-center gap-2 text-green-500">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Active</span>
            </div>
          </div>
          
          {domain && (
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-400">Custom Domain:</span>
                <div className="text-gray-200 font-mono">{domain}</div>
              </div>
              <div className="flex items-center gap-2">
                {StatusIcon[verificationStatus]}
                <span className="text-sm text-gray-300 capitalize">{verificationStatus}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {domain && (
        <>
          {/* DNS Setup Instructions */}
          <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
            <h4 className="font-semibold text-blue-300 mb-3">
              <Globe className="w-5 h-5 inline mr-2" />
              DNS Configuration for {domain}
            </h4>
            <p className="text-blue-200 text-sm mb-4">
              Add these DNS records to your domain provider to point your domain to your Kiala site.
            </p>

            <div className="space-y-3">
              {dnsRecords.map((record, index) => (
                <div key={index} className="bg-gray-800 rounded border p-3">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center text-sm">
                    <div>
                      <span className="text-gray-400">Type:</span>
                      <div className="font-mono text-blue-300">{record.type}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Name:</span>
                      <div className="font-mono text-gray-200">{record.name}</div>
                    </div>
                    <div className="md:col-span-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <span className="text-gray-400 text-xs">Value:</span>
                          <div className="font-mono text-gray-200 text-xs break-all">
                            {record.value}
                          </div>
                        </div>
                        <button
                          onClick={() => copyToClipboard(record.value, `${record.type}-${index}`)}
                          className="p-1 hover:bg-gray-700 rounded transition-colors"
                          title="Copy value"
                        >
                          {copiedField === `${record.type}-${index}` ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs mt-2">{record.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Common DNS Providers */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-200 mb-3">Popular DNS Providers</h4>
            <p className="text-gray-400 text-sm mb-4">
              Quick links to DNS management for common providers:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { name: 'Cloudflare', url: 'https://dash.cloudflare.com' },
                { name: 'Namecheap', url: 'https://ap.www.namecheap.com/domains/list' },
                { name: 'GoDaddy', url: 'https://dcc.godaddy.com/manage/dns' },
                { name: 'Google Domains', url: 'https://domains.google.com' }
              ].map((provider) => (
                <a
                  key={provider.name}
                  href={provider.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 bg-gray-600 hover:bg-gray-500 rounded transition-colors text-sm text-gray-200"
                >
                  {provider.name}
                  <ExternalLink className="w-3 h-3" />
                </a>
              ))}
            </div>
          </div>

          {/* Verification */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-200">Domain Verification</h4>
              <p className="text-gray-400 text-sm">
                Check if your DNS records are properly configured
              </p>
            </div>
            <button
              onClick={verifyDomain}
              disabled={verificationStatus === 'pending'}
              className="btn-primary"
            >
              {verificationStatus === 'pending' ? 'Checking...' : 'Verify Domain'}
            </button>
          </div>

          {/* Status Messages */}
          {verificationStatus === 'verified' && (
            <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-300">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Domain Verified!</span>
              </div>
              <p className="text-green-200 text-sm mt-1">
                Your domain is properly configured and pointing to your Kiala site. 
                Changes may take a few minutes to propagate.
              </p>
            </div>
          )}

          {verificationStatus === 'failed' && (
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-300">
                <AlertCircle className="w-5 h-5" />
                <span className="font-semibold">Verification Failed</span>
              </div>
              <p className="text-red-200 text-sm mt-1">
                We couldn't verify your DNS configuration. Please double-check the records above 
                and allow up to 24 hours for DNS propagation.
              </p>
            </div>
          )}
        </>
      )}

      {/* Help Section */}
      <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-300 mb-2">Need Help?</h4>
        <p className="text-yellow-200 text-sm">
          Domain setup can take 24-48 hours to fully propagate. If you're having trouble, 
          contact our support team for assistance with DNS configuration.
        </p>
      </div>
    </div>
  );
}