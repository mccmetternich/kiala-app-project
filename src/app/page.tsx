import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-6xl font-bold gradient-text mb-6">
            DR CMS
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            The ultimate multi-tenant direct response CMS platform for creating
            high-converting editorial-driven marketing sites.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="widget-container text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Multi-Tenant</h3>
              <p className="text-gray-600">
                Manage multiple branded sites from one central admin panel
              </p>
            </div>

            <div className="widget-container text-center">
              <div className="w-16 h-16 bg-secondary-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">🧩</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Widget System</h3>
              <p className="text-gray-600">
                Powerful drag-and-drop widgets for direct response marketing
              </p>
            </div>

            <div className="widget-container text-center">
              <div className="w-16 h-16 bg-accent-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">High Performance</h3>
              <p className="text-gray-600">
                Fast, responsive, and optimized for conversions
              </p>
            </div>
          </div>

          <div className="mt-12 space-y-4">
            <div className="space-x-4">
              <Link href="/site/dr-amy" className="btn-primary">
                View Dr. Heart Demo
              </Link>
              <Link href="/admin" className="btn-secondary">
                Admin Panel
              </Link>
            </div>
            <p className="text-sm text-gray-500">
              See the editorial + conversion system in action
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}