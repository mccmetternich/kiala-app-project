import { ReactNode } from 'react';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import ArticleHeader from './ArticleHeader';
import ArticleFooter from './ArticleFooter';
import PopupProvider from '@/components/PopupProvider';
import { Site } from '@/types';
import { getCommunityCount } from '@/lib/format-community-count';

interface SiteLayoutProps {
  children: ReactNode;
  site: Site;
  showSidebar?: boolean;
  sidebar?: ReactNode;
  showPopups?: boolean;
  isArticle?: boolean;  // Use article-specific header/footer
}

export default function SiteLayout({
  children,
  site,
  showSidebar = false,
  sidebar,
  showPopups = true,
  isArticle = false
}: SiteLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {isArticle ? <ArticleHeader site={site} /> : <SiteHeader site={site} />}

      {showPopups && (
        <PopupProvider
          siteId={site.id}
          doctorName={site.brand?.name}
          communityName="Wellness Community"
          memberCount={getCommunityCount(site.settings)}
          communityBenefits={[
            "Weekly health tips & protocols",
            "Early access to new content",
            "Exclusive member discounts",
            "Private Q&A sessions"
          ]}
          communityIncentive="Free Hormone Health Guide"
          exitHeadline="Wait! Don't Leave Empty-Handed"
          exitSubheadline="Get instant access to my most popular health guide - absolutely free."
          exitIncentive="The Complete Hormone Balance Guide"
          exitBenefits={[
            "5 Signs Your Hormones Are Imbalanced",
            "The #1 Morning Routine for Energy",
            "Foods That Heal vs. Foods That Harm",
            "My Personal Supplement Stack"
          ]}
          leadMagnetPdfUrl={site.settings?.leadMagnetPdfUrl}
        />
      )}
      
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {showSidebar ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  {children}
                </div>
              </div>
              {/* Sidebar hidden on mobile for articles - shown via collapsed header instead */}
              <div className={`lg:col-span-1 ${isArticle ? 'hidden lg:block' : ''}`}>
                <div className="sticky top-8">
                  {sidebar}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {children}
            </div>
          )}
        </div>
      </main>
      
      {isArticle ? <ArticleFooter site={site} /> : <SiteFooter site={site} />}
    </div>
  );
}