import { ReactNode } from 'react';
import { Calendar, Clock, Eye, Share2, Heart } from 'lucide-react';
import { Page, Site, Widget } from '@/types';
import { formatDate } from '@/lib/utils';
import Badge from './ui/Badge';
import TrackedLink from '@/components/TrackedLink';

// Widget Components
import ProductShowcase from '@/widgets/ProductShowcase';
import ComparisonTable from '@/widgets/ComparisonTable';
import CountdownTimer from '@/widgets/CountdownTimer';
import TestimonialCarousel from '@/widgets/TestimonialCarousel';
import BeforeAfterComparison from '@/widgets/BeforeAfterComparison';
import TopTenList from '@/widgets/TopTenList';
import ExpectationTimeline from '@/widgets/ExpectationTimeline';
import SpecialOfferWidget from '@/widgets/SpecialOfferWidget';
import ExclusiveProductCard from '@/widgets/ExclusiveProductCard';
import DualOfferComparison from '@/widgets/DualOfferComparison';
import StackedQuotes from '@/widgets/StackedQuotes';
import FAQAccordion from '@/widgets/FAQAccordion';
import ShopNowWidget from '@/widgets/ShopNowWidget';
import DataOverview from '@/widgets/DataOverview';
import SymptomsChecker from '@/widgets/SymptomsChecker';
import EmailCapture from '@/widgets/EmailCapture';
import BeforeAfterSideBySide from '@/widgets/BeforeAfterSideBySide';
import ReviewGrid from '@/widgets/ReviewGrid';
import PressLogos from '@/widgets/PressLogos';
import ScrollingThumbnails from '@/widgets/ScrollingThumbnails';
import TestimonialHero from '@/widgets/TestimonialHero';
import TestimonialHeroNoCta from '@/widgets/TestimonialHeroNoCta';
import CTAButton from '@/widgets/CTAButton';
import IngredientListGrid from '@/widgets/IngredientListGrid';
import UsVsThemComparison from '@/widgets/UsVsThemComparison';
import DoctorAssessment from '@/widgets/DoctorAssessment';
import DoctorClosingWord from '@/widgets/DoctorClosingWord';
import Poll from '@/widgets/Poll';
import MythBuster from '@/widgets/MythBuster';
import WarningBox from '@/widgets/WarningBox';
import DrTip from '@/widgets/DrTip';
import Checklist from '@/widgets/Checklist';
import ProductReveal from '@/widgets/ProductReveal';
import CommunitySurveyResults from '@/widgets/CommunitySurveyResults';
import TwoApproaches from '@/widgets/TwoApproaches';

interface ArticleTemplateProps {
  page: Page;
  site: Site;
  sidebar?: ReactNode;
  views?: number;
  readTime?: number;
  heroImage?: string;
}

// Helper function to get CTA URL (handles anchor links vs external)
function getCtaUrl(config: Record<string, unknown>): string {
  const ctaType = config.ctaType as string;
  if (ctaType === 'anchor' && config.anchorWidgetId) {
    return `#widget-${config.anchorWidgetId}`;
  }
  // Prefer ctaUrl (new field) over buttonUrl (legacy field)
  return (config.ctaUrl || config.buttonUrl || '#') as string;
}

// Widget renderer component
function WidgetRenderer({ widget, siteId, site, allWidgets }: { widget: Widget; siteId?: string; site?: Site; allWidgets?: Widget[] }) {
  if (!widget.enabled) return null;

  switch (widget.type) {
    case 'product-showcase':
      return (
        <div className="my-8">
          <ProductShowcase
            title={widget.config.name}
            description={widget.config.description}
            image={widget.config.image}
            price={widget.config.price ? `$${widget.config.price}` : undefined}
            originalPrice={widget.config.originalPrice ? `$${widget.config.originalPrice}` : undefined}
            features={widget.config.benefits}
            ctaText={widget.config.buttonText}
            ctaLink={widget.config.ctaType === 'anchor' ? `#widget-${widget.config.anchorWidgetId}` : widget.config.buttonUrl}
            ctaType={widget.config.ctaType}
            target={widget.config.target}
            ctaBullets={widget.config.ctaBullets}
            showTestimonial={widget.config.showTestimonial}
            testimonialQuote={widget.config.testimonialQuote}
            testimonialAuthor={widget.config.testimonialAuthor}
            testimonialImage={widget.config.testimonialImage}
            showRating={widget.config.showRating}
            ratingStars={widget.config.ratingStars}
            ratingCount={widget.config.ratingCount}
            widgetId={widget.id}
          />
        </div>
      );
      
    case 'comparison-table':
      // Use custom rows from config or fallback to defaults
      const comparisonRows = widget.config.rows || [
        { feature: 'Clinical Studies', standard: 'Limited research', premium: 'Published in 5+ journals' },
        { feature: 'Bioavailability', standard: false, premium: true },
        { feature: 'Third-Party Tested', standard: false, premium: true },
        { feature: 'Money-Back Guarantee', standard: '30 days', premium: '90 days' },
        { feature: 'Daily Dosage', standard: '3x daily', premium: 'Once daily' },
      ];

      return (
        <div className="my-8">
          <ComparisonTable
            title={widget.config.title || widget.config.headline || 'Compare Options'}
            subtitle={widget.config.subtitle}
            rows={comparisonRows}
            leftColumnHeader={widget.config.leftColumnHeader || 'Standard'}
            rightColumnHeader={widget.config.rightColumnHeader || 'Premium'}
            showCta={widget.config.showCta}
            ctaText={widget.config.ctaText}
            ctaUrl={widget.config.ctaType === 'anchor' ? `#widget-${widget.config.anchorWidgetId}` : widget.config.ctaUrl}
            ctaSubtext={widget.config.ctaSubtext}
            ctaType={widget.config.ctaType}
            target={widget.config.target}
          />
        </div>
      );
      
    case 'countdown-timer':
      return (
        <div className="my-8">
          <CountdownTimer
            endDate={widget.config.endDate}
            message={widget.config.headline}
            urgencyText={widget.config.subheading}
            productImage={widget.config.productImage}
            productName={widget.config.productName}
            productDescription={widget.config.productDescription}
            originalPrice={widget.config.originalPrice != null ? String(widget.config.originalPrice) : undefined}
            salePrice={widget.config.salePrice != null ? String(widget.config.salePrice) : undefined}
            ctaText={widget.config.ctaText}
            ctaUrl={widget.config.ctaType === 'anchor' ? `#widget-${widget.config.anchorWidgetId}` : widget.config.ctaUrl}
            ctaType={widget.config.ctaType}
            target={widget.config.target}
            benefits={widget.config.benefits}
            widgetId={widget.id}
          />
        </div>
      );
      
    case 'testimonial':
      // Mock testimonials for demo
      const demoTestimonials = [
        {
          id: '1',
          name: 'Sarah Johnson',
          role: 'Austin, TX • Lost 23 lbs',
          image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
          rating: 5,
          content: "After following Dr. Heart's protocol, I lost 23 pounds and feel more energetic than I have in years. The transformation has been incredible! I never thought I could feel this good at 52."
        },
        {
          id: '2',
          name: 'Michelle Rodriguez',
          role: 'Phoenix, AZ • Energy restored',
          image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
          rating: 5,
          content: "My energy levels have completely transformed. I went from barely making it through the day to having energy to spare. My husband says I'm like a different person!"
        },
        {
          id: '3',
          name: 'Jennifer Williams',
          role: 'Seattle, WA • Hormones balanced',
          image: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop&crop=face',
          rating: 5,
          content: "Finally, something that actually works! After years of trying different approaches, this protocol balanced my hormones naturally. No more mood swings, no more brain fog."
        }
      ];

      return (
        <div className="my-8">
          <TestimonialCarousel testimonials={demoTestimonials} />
        </div>
      );
      
    case 'text-block':
      return (
        <div className="my-6 prose prose-lg max-w-none">
          <div dangerouslySetInnerHTML={{ __html: widget.config.content || '' }} />
          {widget.config.showCta && widget.config.ctaText && (
            <div className="mt-6 text-center not-prose">
              <TrackedLink
                href={widget.config.ctaType === 'anchor' ? `#widget-${widget.config.anchorWidgetId}` : (widget.config.ctaUrl || '#')}
                target={widget.config.ctaType === 'anchor' ? '_self' : (widget.config.target || '_self')}
                widgetType="text-block"
                widgetId={widget.id}
                widgetName="Text Block"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                {widget.config.ctaText}
              </TrackedLink>
            </div>
          )}
        </div>
      );
      
    case 'email-capture':
      return (
        <div className="my-8">
          <EmailCapture
            headline={widget.config.headline}
            subheading={widget.config.subheading}
            buttonText={widget.config.buttonText}
            siteId={siteId || 'default'}
            source="article_widget"
            tags={['article', widget.id]}
            style={widget.config.style as any}
          />
        </div>
      );
      
    case 'cta-button':
      return (
        <CTAButton
          title={widget.config.title}
          subtitle={widget.config.subtitle}
          buttonUrl={widget.config.ctaType === 'anchor' ? `#widget-${widget.config.anchorWidgetId}` : widget.config.buttonUrl}
          buttonText={widget.config.buttonText}
          target={widget.config.target}
          style={widget.config.style as 'primary' | 'secondary' | undefined}
          ctaType={widget.config.ctaType}
          showSocialProof={widget.config.showSocialProof}
          socialProofAvatars={widget.config.socialProofAvatars}
          socialProofStars={widget.config.socialProofStars}
          socialProofText={widget.config.socialProofText}
          showBadges={widget.config.showBadges}
          badges={widget.config.badges}
          widgetId={widget.id}
        />
      );

    case 'before-after':
    case 'before-after-comparison':
      return (
        <div className="my-8">
          <BeforeAfterComparison
            beforeImage={widget.config.beforeImage}
            afterImage={widget.config.afterImage}
            name={widget.config.name}
            age={String(widget.config.age || '')}
            location={widget.config.location}
            result={widget.config.result}
            timeframe={widget.config.timeframe}
            testimonial={widget.config.testimonial || widget.config.testimonialText}
            verified={widget.config.verified !== false}
            ctaText={widget.config.ctaText}
            ctaUrl={getCtaUrl(widget.config)}
            target={widget.config.ctaType === 'anchor' ? '_self' : widget.config.target}
          />
        </div>
      );

    case 'before-after-side-by-side':
      return (
        <div className="my-8">
          <BeforeAfterSideBySide
            headline={widget.config.headline}
            beforeImage={widget.config.beforeImage as string}
            afterImage={widget.config.afterImage as string}
            beforeLabel={widget.config.beforeLabel}
            afterLabel={widget.config.afterLabel}
            beforeStats={widget.config.beforeStats as any}
            afterStats={widget.config.afterStats as any}
            name={widget.config.name}
            age={String(widget.config.age || '')}
            location={widget.config.location}
            timeframe={widget.config.timeframe}
            testimonial={widget.config.testimonial}
            verified={widget.config.verified !== false}
            style={widget.config.style as any}
            showCta={widget.config.showCta}
            ctaText={widget.config.ctaText}
            ctaUrl={getCtaUrl(widget.config)}
            target={widget.config.ctaType === 'anchor' ? '_self' : widget.config.target}
          />
        </div>
      );

    case 'top-ten':
    case 'top-ten-list':
      return (
        <div className="my-8">
          <TopTenList
            headline={widget.config.headline}
            subheading={widget.config.subheading}
            items={widget.config.items}
            style={widget.config.listStyle || widget.config.style as any}
            ctaText={widget.config.buttonText}
            ctaUrl={widget.config.buttonUrl}
          />
        </div>
      );

    case 'timeline':
    case 'expectation-timeline':
      return (
        <div className="my-8">
          <ExpectationTimeline
            headline={widget.config.headline}
            subheading={widget.config.subheading}
            steps={widget.config.steps || widget.config.events}
            ctaText={widget.config.ctaText || widget.config.buttonText}
            ctaUrl={getCtaUrl(widget.config)}
            target={widget.config.ctaType === 'anchor' ? '_self' : widget.config.target}
            showStats={widget.config.showStats}
            stat1Label={widget.config.stat1Label}
            weeksTotal={widget.config.weeksTotal}
            stat2Label={widget.config.stat2Label}
            successStories={widget.config.successStories}
            stat3Label={widget.config.stat3Label}
            resultsPercent={widget.config.resultsPercent}
          />
        </div>
      );

    case 'special-offer':
      return (
        <div className="my-8">
          <SpecialOfferWidget
            headline={widget.config.headline}
            subheading={widget.config.subheading}
            offerDescription={widget.config.description}
            productImage={widget.config.productImage}
            originalPrice={widget.config.originalPrice}
            salePrice={widget.config.price}
            features={widget.config.features}
            redemptionCount={widget.config.redemptionCount}
            limitedSpots={widget.config.limitedSpots}
            ctaText={widget.config.buttonText}
            ctaUrl={widget.config.ctaType === 'anchor' ? `#widget-${widget.config.anchorWidgetId}` : widget.config.buttonUrl}
            ctaType={widget.config.ctaType}
            target={widget.config.target}
            widgetId={widget.id}
          />
        </div>
      );

    case 'exclusive-product':
      // Use site's brand profile image if no doctorImage is configured
      const exclusiveDoctorImage = widget.config.doctorImage || site?.brand?.authorImage || site?.brand?.profileImage;
      const exclusiveDoctorName = widget.config.doctorName || site?.brand?.name;
      return (
        <div className="my-8">
          <ExclusiveProductCard
            name={widget.config.name}
            description={widget.config.description}
            image={widget.config.image}
            price={widget.config.price}
            originalPrice={widget.config.originalPrice}
            savingsText={widget.config.savingsText}
            rating={widget.config.rating ? (typeof widget.config.rating === 'number' ? widget.config.rating : parseFloat(widget.config.rating)) : undefined}
            reviewCount={widget.config.reviewCount || 1200000}
            benefits={widget.config.benefits}
            badges={widget.config.badges}
            doctorName={exclusiveDoctorName}
            doctorImage={exclusiveDoctorImage}
            ctaText={widget.config.ctaText || widget.config.buttonText}
            ctaUrl={getCtaUrl(widget.config)}
            target={widget.config.ctaType === 'anchor' ? '_self' : widget.config.target}
            shippingBadgeText={widget.config.shippingBadgeText}
            guaranteeBadgeText={widget.config.guaranteeBadgeText}
            evaluatedBadgeText={widget.config.evaluatedBadgeText}
            testimonialQuote={widget.config.testimonialQuote}
            testimonialName={widget.config.testimonialName}
            testimonialAvatar={widget.config.testimonialAvatar}
            showTestimonial={widget.config.showTestimonial}
          />
        </div>
      );

    case 'dual-offer-comparison':
      // Transform offer configs to include anchor URLs if needed
      const transformOffer = (offer: any) => {
        if (!offer) return offer;
        return {
          ...offer,
          ctaUrl: offer.ctaType === 'anchor' ? `#widget-${offer.anchorWidgetId}` : offer.ctaUrl
        };
      };
      return (
        <div className="my-8">
          <DualOfferComparison
            headline={widget.config.headline}
            subheading={widget.config.subheading}
            leftOffer={transformOffer(widget.config.leftOffer)}
            rightOffer={transformOffer(widget.config.rightOffer)}
            showExclusiveBanner={widget.config.showExclusiveBanner}
            exclusiveText={widget.config.exclusiveText}
            widgetId={widget.id}
          />
        </div>
      );

    case 'stacked-quotes':
      return (
        <div className="my-8">
          <StackedQuotes
            headline={widget.config.headline}
            subheading={widget.config.subheading}
            quotes={widget.config.quotes}
            showVerifiedBadge={widget.config.showVerifiedBadge !== false}
            showEmailCapture={widget.config.showEmailCapture === true}
            siteId={site?.id || 'default'}
          />
        </div>
      );

    case 'faq':
    case 'faq-accordion':
      return (
        <div className="my-8">
          <FAQAccordion
            headline={widget.config.headline}
            subheading={widget.config.subheading}
            faqs={widget.config.faqs || widget.config.questions}
          />
        </div>
      );

    case 'shop-now':
      // If products array is provided, render a product grid
      if (widget.config.products && widget.config.products.length > 0) {
        return (
          <div className="my-8">
            {widget.config.headline && (
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">{widget.config.headline}</h3>
                {widget.config.subheading && <p className="text-gray-600 mt-2">{widget.config.subheading}</p>}
              </div>
            )}
            <div className={`grid gap-6 ${widget.config.columns === 2 ? 'md:grid-cols-2' : widget.config.columns === 4 ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
              {widget.config.products.map((product: any, idx: number) => (
                <div key={idx} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
                  {product.image && (
                    <div className="aspect-square relative bg-gray-100">
                      <img src={product.image} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />
                      {product.badge && (
                        <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">{product.badge}</span>
                      )}
                    </div>
                  )}
                  <div className="p-4">
                    <h4 className="font-bold text-gray-900 mb-1">{product.name}</h4>
                    {product.description && <p className="text-sm text-gray-600 mb-3">{product.description}</p>}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl font-bold text-primary-600">${product.price}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-400 line-through">${product.originalPrice}</span>
                      )}
                    </div>
                    {product.rating && (
                      <div className="flex items-center gap-1 mb-3">
                        <div className="flex text-amber-400">{'★'.repeat(Math.floor(product.rating))}</div>
                        <span className="text-sm text-gray-600">({product.reviews || 0})</span>
                      </div>
                    )}
                    <a href={product.buttonUrl || '#'} className="block w-full btn-primary text-center py-2 rounded-lg font-semibold">
                      {product.buttonText || 'Shop Now'}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }
      // Single product fallback
      const shopImages = widget.config.images?.map((img: any, idx: number) =>
        typeof img === 'string' ? { url: img, alt: `Product image ${idx + 1}` } : img
      );
      return (
        <div className="my-8">
          <ShopNowWidget
            productName={widget.config.name}
            description={widget.config.description}
            images={shopImages}
            rating={widget.config.rating ? (typeof widget.config.rating === 'number' ? widget.config.rating : parseFloat(widget.config.rating)) : undefined}
            reviewCount={widget.config.reviewCount}
            lovedByCount={widget.config.lovedByCount}
            pricingOptions={widget.config.pricingOptions}
            benefits={widget.config.benefits}
            benefitsRow2={widget.config.benefitsRow2}
            benefit1={widget.config.benefit1}
            benefit2={widget.config.benefit2}
            benefit3={widget.config.benefit3}
            benefit4={widget.config.benefit4}
            benefit5={widget.config.benefit5}
            benefit6={widget.config.benefit6}
            ctaText={widget.config.ctaText || widget.config.buttonText}
            ctaUrl={widget.config.ctaUrl || widget.config.buttonUrl}
            target={widget.config.target}
            guaranteeText={widget.config.guaranteeText}
            doctorName={widget.config.doctorName}
            doctorImage={widget.config.doctorImage}
            badgeText={widget.config.badgeText}
            testimonialQuote={widget.config.testimonialQuote}
            testimonialName={widget.config.testimonialName}
            testimonialAvatar={widget.config.testimonialAvatar}
            showTestimonial={widget.config.showTestimonial}
          />
        </div>
      );

    case 'data-overview':
      return (
        <div className="my-8">
          <DataOverview
            headline={widget.config.headline}
            subheading={widget.config.subheading}
            stats={widget.config.stats}
            source={widget.config.source}
            style={widget.config.style as any}
          />
        </div>
      );

    case 'symptoms-checker':
      return (
        <div className="my-8">
          <SymptomsChecker
            headline={widget.config.headline}
            subheading={widget.config.subheading}
            symptoms={widget.config.symptoms}
            conclusionHeadline={widget.config.conclusionHeadline}
            conclusionText={widget.config.conclusionText}
            minSymptoms={widget.config.minSymptoms}
            showCta={widget.config.showCta}
            ctaText={widget.config.ctaText}
            ctaUrl={widget.config.ctaUrl}
            ctaType={widget.config.ctaType}
            anchorWidgetId={widget.config.anchorWidgetId}
          />
        </div>
      );

    // Inline widget implementations for remaining types
    case 'guarantee-box':
      return (
        <div className="my-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-200 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          {widget.config.badgeText && (
            <span className="inline-block bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
              {widget.config.badgeText}
            </span>
          )}
          <h3 className="text-2xl font-bold text-gray-900 mb-3">{widget.config.headline || '100% Satisfaction Guaranteed'}</h3>
          <p className="text-gray-600 max-w-xl mx-auto">{widget.config.description}</p>
        </div>
      );

    case 'trust-badges':
      return (
        <div className="my-8 bg-gray-50 rounded-xl p-6">
          {widget.config.headline && (
            <h3 className="text-center font-semibold text-gray-900 mb-6">{widget.config.headline}</h3>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {widget.config.badges?.map((badge: any, idx: number) => (
              <div key={idx} className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="font-semibold text-sm text-gray-900">{badge.label}</div>
                {badge.description && <div className="text-xs text-gray-500 mt-1">{badge.description}</div>}
              </div>
            ))}
          </div>
        </div>
      );

    case 'video-embed':
      return (
        <div className="my-8">
          {widget.config.headline && (
            <h3 className="text-xl font-bold text-gray-900 mb-4">{widget.config.headline}</h3>
          )}
          <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden shadow-xl">
            {widget.config.videoUrl ? (
              <iframe
                src={widget.config.videoUrl}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : widget.config.thumbnailUrl ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <img src={widget.config.thumbnailUrl} alt="Video thumbnail" className="absolute inset-0 w-full h-full object-cover" />
                <div className="relative z-10 w-16 h-16 bg-white/90 rounded-full flex items-center justify-center cursor-pointer hover:bg-white transition-colors">
                  <svg className="w-8 h-8 text-primary-600 ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            ) : null}
          </div>
          {widget.config.caption && (
            <p className="text-sm text-gray-500 text-center mt-3">{widget.config.caption}</p>
          )}
        </div>
      );

    case 'review-grid':
      return (
        <div className="my-8">
          <ReviewGrid
            headline={widget.config.headline}
            subheading={widget.config.subheading}
            reviews={widget.config.reviews}
            ctaText={widget.config.buttonText}
            ctaUrl={widget.config.buttonUrl}
            target={widget.config.target}
          />
        </div>
      );

    case 'press-logos':
      return (
        <div className="my-8">
          <PressLogos
            headline={widget.config.headline}
            items={widget.config.items}
          />
        </div>
      );

    case 'scrolling-thumbnails':
      return (
        <div className="my-8">
          <ScrollingThumbnails
            headline={widget.config.headline}
            columns={widget.config.columns}
            customImages={widget.config.customImages}
            speed={widget.config.speed}
            imageHeight={widget.config.imageHeight}
          />
        </div>
      );

    case 'testimonial-hero-no-cta':
      return (
        <div className="my-8">
          <TestimonialHeroNoCta
            image={widget.config.image}
            title={widget.config.headline}
            body={widget.config.body}
            authorName={widget.config.authorName}
            authorAge={widget.config.authorAge}
            authorLocation={widget.config.authorLocation}
            authorAvatar={widget.config.authorAvatar}
            showVerifiedBadge={widget.config.showVerifiedBadge}
            showCta={widget.config.showCta}
            ctaText={widget.config.ctaText}
            ctaUrl={widget.config.ctaType === 'anchor' ? `#widget-${widget.config.anchorWidgetId}` : widget.config.ctaUrl}
            target={widget.config.ctaType === 'anchor' ? '_self' : widget.config.target}
            widgetId={widget.id}
          />
        </div>
      );

    case 'testimonial-hero':
      return (
        <div className="my-8">
          <TestimonialHero
            image={widget.config.image}
            title={widget.config.headline}
            body={widget.config.body}
            ctaText={widget.config.buttonText}
            ctaUrl={getCtaUrl(widget.config)}
            target={widget.config.ctaType === 'anchor' ? '_self' : widget.config.target}
            benefits={widget.config.benefits}
          />
        </div>
      );

    case 'social-proof':
      return (
        <div className="my-8 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
          <div className="flex items-center justify-center gap-3">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full border-2 border-white" />
              ))}
            </div>
            <span className="font-medium text-gray-900">{widget.config.message || '🔥 247 women joined today!'}</span>
          </div>
          {widget.config.recentSignups && widget.config.recentSignups.length > 0 && (
            <div className="mt-3 text-center text-sm text-gray-600">
              Latest: {widget.config.recentSignups[0].name} from {widget.config.recentSignups[0].location} - {widget.config.recentSignups[0].timeAgo}
            </div>
          )}
        </div>
      );

    case 'ingredient-list-grid':
      return (
        <div className="my-8">
          <IngredientListGrid
            headline={widget.config.headline}
            bannerText={widget.config.bannerText}
            ingredients={widget.config.ingredients}
            columns={widget.config.columns}
            style={widget.config.style as 'default' | 'simple'}
            additionalCount={widget.config.additionalCount}
            additionalText={widget.config.additionalText}
            showAdditional={widget.config.showAdditional}
            showCta={widget.config.showCta}
            ctaText={widget.config.ctaText}
            ctaUrl={widget.config.ctaType === 'anchor' ? `#widget-${widget.config.anchorWidgetId}` : widget.config.ctaUrl}
            ctaSubtext={widget.config.ctaSubtext}
            ctaType={widget.config.ctaType}
            target={widget.config.target}
          />
        </div>
      );

    case 'us-vs-them-comparison':
      return (
        <div className="my-8">
          <UsVsThemComparison
            headline={widget.config.headline}
            column1Image={widget.config.column1Image}
            column1Title={widget.config.column1Title}
            column1Features={widget.config.column1Features}
            column2Image={widget.config.column2Image}
            column2Title={widget.config.column2Title}
            column2Features={widget.config.column2Features}
            buttonText={widget.config.buttonText}
            buttonUrl={getCtaUrl(widget.config)}
            target={widget.config.ctaType === 'anchor' ? '_self' : widget.config.target}
            ctaText={widget.config.ctaText}
            ctaUrl={widget.config.ctaUrl}
            guaranteeBadge={widget.config.guaranteeBadge}
            satisfactionBadge={widget.config.satisfactionBadge}
          />
        </div>
      );

    case 'hero-image':
      const heroCtaUrl = widget.config.ctaType === 'anchor'
        ? `#widget-${widget.config.anchorWidgetId}`
        : widget.config.ctaUrl;
      return (
        <div className="my-8">
          {widget.config.headline && (
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{widget.config.headline}</h2>
          )}
          {widget.config.subtitle && (
            <p className="text-lg text-gray-600 mb-4">{widget.config.subtitle}</p>
          )}
          <img
            src={widget.config.image}
            alt={widget.config.imageAlt || widget.config.alt || 'Article hero image'}
            className="w-full rounded-xl shadow-lg"
          />
          {widget.config.showCta && widget.config.ctaText && heroCtaUrl && (
            <div className="mt-6 text-center">
              <TrackedLink
                href={heroCtaUrl}
                target={widget.config.target || '_self'}
                widgetType="hero-image"
                widgetId={widget.id}
                widgetName={widget.config.headline || 'Hero Image'}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                {widget.config.ctaText}
              </TrackedLink>
            </div>
          )}
        </div>
      );

    case 'opening-hook':
      return (
        <div className="my-8 prose prose-lg max-w-none">
          <div
            className="text-lg text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: widget.config.content?.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/\n\n/g, '</p><p class="mt-4">')
                .replace(/^/, '<p>').replace(/$/, '</p>') || ''
            }}
          />
        </div>
      );

    case 'main-content':
      // Parse markdown-style content
      const parseContent = (content: string) => {
        if (!content) return '';
        return content
          .replace(/## (.*?)(\n|$)/g, '<h2 class="text-2xl font-bold text-gray-900 mt-8 mb-4">$1</h2>')
          .replace(/### (.*?)(\n|$)/g, '<h3 class="text-xl font-semibold text-gray-900 mt-6 mb-3">$1</h3>')
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/^- (.*?)$/gm, '<li class="ml-4">$1</li>')
          .replace(/(<li.*?<\/li>\n?)+/g, '<ul class="list-disc pl-6 my-4 space-y-2">$&</ul>')
          .replace(/\n\n/g, '</p><p class="mt-4 text-gray-700 leading-relaxed">')
          .replace(/^(?!<)/, '<p class="text-gray-700 leading-relaxed">')
          .replace(/(?!>)$/, '</p>');
      };

      return (
        <div className="my-8 prose prose-lg max-w-none">
          <div
            className="text-gray-700"
            dangerouslySetInnerHTML={{ __html: parseContent(widget.config.content || '') }}
          />
        </div>
      );

    case 'final-cta': {
      // Support both old field names (buttonText/buttonUrl) and new standard fields (ctaText/ctaUrl)
      const finalCtaText = widget.config.ctaText || widget.config.buttonText || 'Get Started';
      const finalCtaUrl = widget.config.ctaUrl || widget.config.buttonUrl || '#newsletter';
      const finalCtaTarget = widget.config.target || '_self';
      const finalCtaType = widget.config.ctaType || 'external';
      const finalAnchorWidgetId = widget.config.anchorWidgetId;

      return (
        <div className="my-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">{widget.config.headline}</h2>
          <p className="text-lg text-white/90 mb-6 max-w-2xl mx-auto">{widget.config.content}</p>
          {finalCtaType === 'anchor' && finalAnchorWidgetId ? (
            <a
              href={`#widget-${finalAnchorWidgetId}`}
              className="inline-block bg-white text-primary-600 font-bold py-3 px-8 rounded-full hover:bg-gray-100 transition-all shadow-lg"
            >
              {finalCtaText}
            </a>
          ) : (
            <TrackedLink
              href={finalCtaUrl}
              target={finalCtaTarget}
              widgetType="final-cta"
              widgetId={widget.id}
              widgetName={widget.config.headline}
              className="inline-block bg-white text-primary-600 font-bold py-3 px-8 rounded-full hover:bg-gray-100 transition-all shadow-lg"
            >
              {finalCtaText}
            </TrackedLink>
          )}
        </div>
      );
    }

    case 'doctor-assessment':
      return (
        <div className="my-8" id={widget.id ? `widget-${widget.id}` : undefined}>
          <DoctorAssessment
            doctorName={widget.config.doctorName}
            doctorImage={widget.config.doctorImage}
            doctorCredentials={widget.config.doctorCredentials}
            headline={widget.config.headline}
            paragraphs={widget.config.paragraphs}
            signature={widget.config.signature}
            highlightText={widget.config.highlightText}
            badgeText={widget.config.badgeText}
          />
        </div>
      );

    case 'doctor-closing-word':
      return (
        <div className="my-8" id={widget.id ? `widget-${widget.id}` : undefined}>
          <DoctorClosingWord
            doctorName={widget.config.doctorName}
            doctorImage={widget.config.doctorImage}
            headline={widget.config.headline}
            paragraphs={widget.config.paragraphs}
            closingLine={widget.config.closingLine}
            signature={widget.config.signature}
            highlightParagraph={widget.config.highlightParagraph}
          />
        </div>
      );

    case 'poll':
      return (
        <div className="my-8">
          <Poll
            question={widget.config.question}
            options={widget.config.options}
            totalVotes={widget.config.totalVotes}
            showResults={widget.config.showResults}
            resultsMessage={widget.config.resultsMessage}
            source={widget.config.source}
            style={widget.config.style as any}
            showCta={widget.config.showCta}
            ctaText={widget.config.ctaText}
            ctaUrl={widget.config.ctaType === 'anchor' ? `#widget-${widget.config.anchorWidgetId}` : widget.config.ctaUrl}
            ctaType={widget.config.ctaType}
            target={widget.config.target}
            pollId={widget.id}
          />
        </div>
      );

    case 'myth-buster':
      return (
        <div className="my-8">
          <MythBuster
            headline={widget.config.headline}
            subheading={widget.config.subheading}
            myths={widget.config.myths}
            style={widget.config.style as any}
            showCta={widget.config.showCta}
            ctaText={widget.config.ctaText}
            ctaUrl={widget.config.ctaUrl}
          />
        </div>
      );

    case 'warning-box':
      return (
        <div className="my-8">
          <WarningBox
            headline={widget.config.headline || 'Warning'}
            content={widget.config.content}
            warnings={widget.config.warnings || []}
            footer={widget.config.footer}
            style={widget.config.style as any}
            showCta={widget.config.showCta}
            ctaText={widget.config.ctaText}
            ctaUrl={widget.config.ctaUrl}
          />
        </div>
      );

    case 'dr-tip':
      // Use site's brand profile image if no image is configured
      const drTipImage = widget.config.image || site?.brand?.authorImage || site?.brand?.profileImage;
      return (
        <div className="my-8">
          <DrTip
            tip={widget.config.tip}
            name={widget.config.name || site?.brand?.name}
            credentials={widget.config.credentials}
            image={drTipImage}
            style={widget.config.style as any}
            showCta={widget.config.showCta}
            ctaText={widget.config.ctaText}
            ctaUrl={widget.config.ctaType === 'anchor' ? `#widget-${widget.config.anchorWidgetId}` : widget.config.ctaUrl}
            ctaType={widget.config.ctaType}
            target={widget.config.target}
          />
        </div>
      );

    case 'checklist':
      return (
        <div className="my-8">
          <Checklist
            headline={widget.config.headline || 'Checklist'}
            subheading={widget.config.subheading}
            items={widget.config.items || []}
            footer={widget.config.footer}
            alertThreshold={widget.config.alertThreshold}
            alertHeadline={widget.config.alertHeadline}
            alertMessage={widget.config.alertMessage}
            showCta={widget.config.showCta}
            ctaText={widget.config.ctaText}
            ctaUrl={widget.config.ctaType === 'anchor' ? `#widget-${widget.config.anchorWidgetId}` : widget.config.ctaUrl}
            ctaType={widget.config.ctaType}
            target={widget.config.target}
            style={widget.config.style as any}
          />
        </div>
      );

    case 'product-reveal':
      return (
        <div className="my-8">
          <ProductReveal
            headline={widget.config.headline}
            subheadline={widget.config.subheadline}
            productName={widget.config.productName}
            productDescription={widget.config.productDescription}
            productImage={widget.config.productImage}
            productImages={widget.config.productImages as string[]}
            doctorName={widget.config.doctorName || site?.brand?.name}
            doctorImage={widget.config.doctorImage || site?.brand?.authorImage || site?.brand?.profileImage}
            doctorQuote={widget.config.doctorQuote}
            rating={typeof widget.config.rating === 'number' ? widget.config.rating : parseFloat(widget.config.rating as string) || undefined}
            reviewCount={widget.config.reviewCount}
            keyBenefits={widget.config.keyBenefits as string[]}
            socialProofStats={widget.config.socialProofStats as any}
            ctaText={widget.config.ctaText}
            ctaUrl={widget.config.ctaUrl}
            target={widget.config.target as '_self' | '_blank'}
            badge={widget.config.badge}
            communityExclusive={widget.config.communityExclusive !== false}
            communityExclusiveText={widget.config.communityExclusiveText}
          />
        </div>
      );

    case 'community-survey-results':
      return (
        <div className="my-8">
          <CommunitySurveyResults
            headline={widget.config.headline}
            subheading={widget.config.subheading}
            results={widget.config.results}
            totalRespondents={widget.config.totalRespondents}
            source={widget.config.source}
            highlightText={widget.config.highlightText}
            style={widget.config.style as any}
            showCta={widget.config.showCta}
            ctaText={widget.config.ctaText}
            ctaUrl={widget.config.ctaType === 'anchor' ? `#widget-${widget.config.anchorWidgetId}` : widget.config.ctaUrl}
            ctaSubtext={widget.config.ctaSubtext}
            ctaType={widget.config.ctaType}
            target={widget.config.target}
          />
        </div>
      );

    case 'two-approaches':
      return (
        <div className="my-8">
          <TwoApproaches
            headline={widget.config.headline}
            leftColumn={widget.config.leftColumn}
            rightColumn={widget.config.rightColumn}
            style={widget.config.style as any}
          />
        </div>
      );

    default:
      // Fallback for any unhandled widget types - render as a placeholder
      console.warn(`Unknown widget type: ${widget.type}`);
      return null;
  }
}

export default function ArticleTemplate({
  page,
  site,
  sidebar,
  views = 0,
  readTime = 5,
  heroImage
}: ArticleTemplateProps) {
  // Sort widgets by position, excluding any hero-image text-block widget (now handled separately)
  const sortedWidgets = [...page.content.widgets]
    .filter(w => !(w.id === 'hero-image' && w.type === 'text-block'))
    .sort((a, b) => a.position - b.position);
  
  return (
    <article className="max-w-4xl mx-auto">
      {/* Article Header */}
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <Badge variant="clinical">Health & Wellness</Badge>
          <Badge variant="trust">Medically Reviewed</Badge>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-balance">
          {page.title}
        </h1>
        
        <div className="flex items-center gap-6 text-sm text-gray-600 mb-6">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <time dateTime={page.publishedAt?.toISOString()}>
              {page.publishedAt ? formatDate(page.publishedAt) : 'Recently published'}
            </time>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{readTime} min read</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{views >= 1000000 ? `${(views / 1000000).toFixed(2)}M` : views.toLocaleString()} Views 🔥</span>
          </div>
        </div>

        {/* Author Byline */}
        <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
          <div className="relative w-12 h-12">
            <img
              src={site.brand?.authorImage || site.brand?.sidebarImage || site.brand?.profileImage}
              alt={site.brand?.name || 'Author'}
              className="absolute inset-0 w-full h-full object-cover rounded-full"
            />
          </div>
          <div>
            <div className="font-semibold text-gray-900">{site.brand?.name || 'Dr. Heart'}</div>
            <div className="text-sm text-gray-600">{site.brand?.title || 'MD, PhD - Women\'s Health Authority'}</div>
          </div>
          <div className="ml-auto flex gap-2">
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Share2 className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Heart className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Image - from article metadata */}
      {heroImage && (
        <div className="mb-8">
          <img
            src={heroImage}
            alt={page.title}
            className="w-full rounded-xl shadow-lg"
          />
        </div>
      )}

      {/* Article Content with Widgets */}
      <div className="space-y-6">
        {sortedWidgets.map((widget) => (
          <div key={widget.id} id={`widget-${widget.id}`} className="scroll-mt-4">
            <WidgetRenderer widget={widget} siteId={site.id} site={site} allWidgets={sortedWidgets} />
          </div>
        ))}
      </div>

    </article>
  );
}
