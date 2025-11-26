import { ReactNode } from 'react';
import { Calendar, Clock, Eye, Share2, Heart } from 'lucide-react';
import { Page, Site, Widget } from '@/types';
import { formatDate } from '@/lib/utils';
import Badge from './ui/Badge';

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
import CTAButton from '@/widgets/CTAButton';
import IngredientListGrid from '@/widgets/IngredientListGrid';

interface ArticleTemplateProps {
  page: Page;
  site: Site;
  sidebar?: ReactNode;
  views?: number;
  readTime?: number;
}

// Widget renderer component
function WidgetRenderer({ widget, siteId, site }: { widget: Widget; siteId?: string; site?: Site }) {
  if (!widget.enabled) return null;

  switch (widget.type) {
    case 'product-showcase':
      return (
        <div className="my-8">
          <ProductShowcase
            title={widget.config.name}
            description={widget.config.description}
            image={widget.config.image}
            price={widget.config.originalPrice ? `$${widget.config.price} (was $${widget.config.originalPrice})` : `$${widget.config.price}`}
            features={widget.config.benefits}
            ctaText={widget.config.buttonText}
            ctaLink={widget.config.buttonUrl}
          />
        </div>
      );
      
    case 'comparison-table':
      // Convert widget config to ComparisonTable format
      const comparisonRows = [
        { feature: 'Clinical Studies', standard: 'Limited research', premium: 'Published in 5+ journals' },
        { feature: 'Bioavailability', standard: false, premium: true },
        { feature: 'Third-Party Tested', standard: false, premium: true },
        { feature: 'Money-Back Guarantee', standard: '30 days', premium: '90 days' },
        { feature: 'Daily Dosage', standard: '3x daily', premium: 'Once daily' },
      ];

      return (
        <div className="my-8">
          <ComparisonTable
            title={widget.config.headline || 'Compare Options'}
            rows={comparisonRows}
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
          buttonUrl={widget.config.buttonUrl}
          buttonText={widget.config.buttonText}
          target={widget.config.target}
          style={widget.config.style as 'primary' | 'secondary' | undefined}
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
            ctaText={widget.config.buttonText}
            ctaUrl={widget.config.buttonUrl}
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
            originalPrice={widget.config.originalPrice}
            salePrice={widget.config.price}
            features={widget.config.features}
            redemptionCount={widget.config.redemptionCount}
            limitedSpots={widget.config.limitedSpots}
            ctaText={widget.config.buttonText}
            ctaUrl={widget.config.buttonUrl}
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
            rating={widget.config.rating ? (typeof widget.config.rating === 'number' ? widget.config.rating : parseFloat(widget.config.rating)) : undefined}
            reviewCount={widget.config.reviewCount || 1200000}
            benefits={widget.config.benefits}
            badges={widget.config.badges}
            doctorName={exclusiveDoctorName}
            doctorImage={exclusiveDoctorImage}
            ctaText={widget.config.buttonText}
            ctaUrl={widget.config.buttonUrl}
          />
        </div>
      );

    case 'dual-offer-comparison':
      return (
        <div className="my-8">
          <DualOfferComparison
            headline={widget.config.headline}
            subheading={widget.config.subheading}
            leftOffer={widget.config.leftOffer}
            rightOffer={widget.config.rightOffer}
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
            pricingOptions={widget.config.pricingOptions}
            benefits={widget.config.benefits}
            ctaText={widget.config.buttonText}
            ctaUrl={widget.config.buttonUrl}
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
            speed={widget.config.speed}
            imageHeight={widget.config.imageHeight}
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
            ctaUrl={widget.config.buttonUrl}
            target={widget.config.target}
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
  readTime = 5 
}: ArticleTemplateProps) {
  // Sort widgets by position
  const sortedWidgets = [...page.content.widgets].sort((a, b) => a.position - b.position);
  
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
              src={site.brand?.authorImage || site.brand?.profileImage || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop'}
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

      {/* Article Content with Widgets */}
      <div className="space-y-6">
        {sortedWidgets.map((widget) => (
          <WidgetRenderer key={widget.id} widget={widget} siteId={site.id} site={site} />
        ))}
      </div>

    </article>
  );
}
