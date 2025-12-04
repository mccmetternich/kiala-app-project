import { ReactNode } from 'react';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import ArticleHeader from './ArticleHeader';
import ArticleFooter from './ArticleFooter';
import MinimalHeader from './MinimalHeader';
import PopupProvider from '@/components/PopupProvider';
import ThemeProvider from '@/components/ThemeProvider';
import { Site, NavMode } from '@/types';
import { getCommunityCount } from '@/lib/format-community-count';

interface SiteLayoutProps {
  children: ReactNode;
  site: Site;
  showSidebar?: boolean;
  sidebar?: ReactNode;
  showPopups?: boolean;
  isArticle?: boolean;  // Legacy: Use article-specific header/footer
  navMode?: NavMode;    // New: Explicit nav mode control (overrides isArticle)
  pageSlug?: string;    // Current page slug to look up config
}

export default function SiteLayout({
  children,
  site,
  showSidebar = false,
  sidebar,
  showPopups = true,
  isArticle = false,
  navMode,
  pageSlug
}: SiteLayoutProps) {
  // Determine effective nav mode
  // Priority: explicit navMode prop > page_config lookup > isArticle legacy > default
  const getEffectiveNavMode = (): NavMode => {
    // If explicit navMode provided, use it
    if (navMode) return navMode;

    // Look up from page_config if we have a pageSlug
    const pageConfig = (site as any).page_config;
    if (pageSlug && pageConfig?.pages) {
      const pageSettings = pageConfig.pages.find((p: any) => p.slug === pageSlug || p.slug === `/${pageSlug}`);
      if (pageSettings?.navMode) return pageSettings.navMode;
    }

    // Legacy: isArticle maps to direct-response
    if (isArticle) {
      // Check if there's a default article nav mode in config
      if (pageConfig?.defaultArticleNavMode) {
        return pageConfig.defaultArticleNavMode;
      }
      return 'direct-response';
    }

    return 'global';
  };

  const effectiveNavMode = getEffectiveNavMode();
  const useArticleFooter = effectiveNavMode === 'direct-response' || isArticle;

  // Render the appropriate header based on nav mode
  const renderHeader = () => {
    switch (effectiveNavMode) {
      case 'minimal':
        return <MinimalHeader site={site} />;
      case 'direct-response':
        return <ArticleHeader site={site} />;
      case 'global':
      default:
        return <SiteHeader site={site} />;
    }
  };

  return (
    <ThemeProvider site={site}>
    <div className="min-h-screen bg-gray-50">
      {renderHeader()}

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
      
      {useArticleFooter ? <ArticleFooter site={site} /> : <SiteFooter site={site} />}
    </div>
    </ThemeProvider>
  );
}