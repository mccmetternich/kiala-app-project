// Block System Architecture
// This creates a modular, API-driven block system for reusable content components

export interface BaseBlock {
  id: string;
  type: string;
  settings: Record<string, any>;
  position: number;
  visible: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface HeroBlock extends BaseBlock {
  type: 'hero';
  settings: {
    title: string;
    subtitle: string;
    backgroundImage?: string;
    backgroundColor?: string;
    textColor?: string;
    alignment?: 'left' | 'center' | 'right';
    showCTA?: boolean;
    ctaText?: string;
    ctaLink?: string;
  };
}

export interface AudioPlayerBlock extends BaseBlock {
  type: 'audio_player';
  settings: {
    title: string;
    subtitle: string;
    audioUrl?: string;
    showWaveform: boolean;
    backgroundColor?: string;
    autoplay?: boolean;
  };
}

export interface ProductBlock extends BaseBlock {
  type: 'product';
  settings: {
    title: string;
    description: string;
    price: number;
    originalPrice?: number;
    discount?: string;
    badge?: string;
    badgeColor?: string;
    image?: string;
    features: string[];
    ctaText: string;
    ctaColor?: string;
    testimonials?: {
      text: string;
      author: string;
      rating?: number;
    }[];
  };
}

export interface LeadMagnetBlock extends BaseBlock {
  type: 'lead_magnet';
  settings: {
    title: string;
    description: string;
    incentive: string;
    features: string[];
    ctaText: string;
    backgroundColor?: string;
    emailPlaceholder?: string;
    privacyText?: string;
  };
}

export interface TestimonialBlock extends BaseBlock {
  type: 'testimonial';
  settings: {
    testimonials: {
      text: string;
      author: string;
      title?: string;
      image?: string;
      rating?: number;
    }[];
    layout: 'grid' | 'carousel' | 'single';
    backgroundColor?: string;
    showRatings: boolean;
  };
}

export interface ContentBlock extends BaseBlock {
  type: 'content';
  settings: {
    title?: string;
    content: string; // HTML content
    backgroundColor?: string;
    textColor?: string;
    alignment?: 'left' | 'center' | 'right';
    maxWidth?: string;
  };
}

export interface SpecialtiesBlock extends BaseBlock {
  type: 'specialties';
  settings: {
    title: string;
    specialties: {
      name: string;
      icon?: string;
      description?: string;
    }[];
    layout: 'grid' | 'horizontal';
    backgroundColor?: string;
  };
}

export interface CredentialsBlock extends BaseBlock {
  type: 'credentials';
  settings: {
    credentials: string[];
    publications?: string[];
    certifications?: string[];
    layout: 'side-by-side' | 'stacked';
    showIcons: boolean;
  };
}

export interface CTABlock extends BaseBlock {
  type: 'cta';
  settings: {
    title: string;
    description: string;
    ctaText: string;
    ctaLink?: string;
    backgroundColor?: string;
    style: 'banner' | 'card' | 'full-width';
    urgency?: string;
  };
}

export interface SocialProofBlock extends BaseBlock {
  type: 'social_proof';
  settings: {
    count: number;
    text: string;
    layout: 'inline' | 'badge' | 'banner';
    showAvatars: boolean;
    avatars?: string[];
  };
}

// Union type for all possible blocks
export type Block = 
  | HeroBlock
  | AudioPlayerBlock
  | ProductBlock
  | LeadMagnetBlock
  | TestimonialBlock
  | ContentBlock
  | SpecialtiesBlock
  | CredentialsBlock
  | CTABlock
  | SocialProofBlock;

// Page block configuration
export interface PageBlocks {
  pageId: string;
  pageType: 'home' | 'about' | 'article' | 'custom';
  siteId: string;
  blocks: Block[];
}

// Block template for admin interface
export interface BlockTemplate {
  type: string;
  name: string;
  description: string;
  icon: string;
  category: 'content' | 'marketing' | 'social' | 'media';
  defaultSettings: Record<string, any>;
  requiredFields: string[];
  optionalFields: string[];
}