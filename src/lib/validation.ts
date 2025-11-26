import { z } from 'zod';

// Common schemas
export const idSchema = z.string().uuid('Invalid ID format');

export const slugSchema = z.string()
  .min(1, 'Slug is required')
  .max(100, 'Slug too long')
  .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens');

export const domainSchema = z.string()
  .min(1, 'Domain is required')
  .max(253, 'Domain too long')
  .regex(/^[a-z0-9.-]+\.[a-z]{2,}$/, 'Invalid domain format');

export const subdomainSchema = z.string()
  .min(1, 'Subdomain is required')
  .max(63, 'Subdomain too long')
  .regex(/^[a-z0-9-]+$/, 'Subdomain can only contain lowercase letters, numbers, and hyphens')
  .refine(s => !s.startsWith('-') && !s.endsWith('-'), 'Subdomain cannot start or end with hyphen');

// Site schemas
export const createSiteSchema = z.object({
  name: z.string().min(1, 'Site name is required').max(100, 'Site name too long'),
  domain: domainSchema.optional(),
  subdomain: subdomainSchema,
  theme: z.enum(['medical', 'wellness', 'clinical', 'lifestyle']).default('medical'),
  settings: z.object({
    navigation: z.array(z.object({
      label: z.string().min(1, 'Label required'),
      url: z.string().min(1, 'URL required'),
      type: z.enum(['internal', 'external']).default('internal')
    })).default([]),
    emailCapture: z.object({
      provider: z.enum(['convertkit', 'mailchimp', 'custom']).default('convertkit'),
      apiKey: z.string().optional(),
      listId: z.string().optional(),
      leadMagnet: z.object({
        title: z.string().min(1, 'Title required'),
        description: z.string().min(1, 'Description required'),
        downloadUrl: z.string().optional(),
        image: z.string().optional()
      }).optional()
    }).optional(),
    social: z.object({
      instagram: z.string().url('Invalid Instagram URL').optional(),
      facebook: z.string().url('Invalid Facebook URL').optional(),
      youtube: z.string().url('Invalid YouTube URL').optional(),
      twitter: z.string().url('Invalid Twitter URL').optional()
    }).optional(),
    seo: z.object({
      metaTitle: z.string().max(60, 'Meta title too long').optional(),
      metaDescription: z.string().max(160, 'Meta description too long').optional(),
      keywords: z.array(z.string()).optional(),
      gtmId: z.string().optional(),
      gtagId: z.string().optional()
    }).optional()
  }).default({ navigation: [] }),
  brand_profile: z.object({
    name: z.string().min(1, 'Brand name is required').max(100, 'Name too long'),
    tagline: z.string().min(1, 'Tagline is required').max(200, 'Tagline too long'),
    bio: z.string().max(2000, 'Bio too long').optional(),
    quote: z.string().max(500, 'Quote too long').optional(),
    logo: z.string().url('Invalid image URL').optional(),
    profileImage: z.string().url('Invalid image URL').optional()
  }),
  status: z.enum(['draft', 'published']).default('draft')
});

export const updateSiteSchema = createSiteSchema.partial().extend({
  id: idSchema
});

// Article schemas
export const createArticleSchema = z.object({
  site_id: idSchema,
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  excerpt: z.string().max(500, 'Excerpt too long').optional(),
  content: z.string().min(1, 'Content is required'),
  slug: slugSchema,
  category: z.string().max(50, 'Category too long').optional(),
  image: z.string().url('Invalid image URL').optional(),
  featured: z.boolean().default(false),
  trending: z.boolean().default(false),
  hero: z.boolean().default(false),
  published: z.boolean().default(false),
  read_time: z.number().min(1, 'Read time must be at least 1 minute').max(120, 'Read time too long').default(5),
  views: z.number().min(0, 'Views must be non-negative').default(0),
  tags: z.array(z.string()).optional(),
  seo: z.object({
    metaTitle: z.string().max(60, 'Meta title too long').optional(),
    metaDescription: z.string().max(160, 'Meta description too long').optional(),
    canonicalUrl: z.string().url('Invalid canonical URL').optional()
  }).optional()
});

export const updateArticleSchema = createArticleSchema.partial().extend({
  id: idSchema
});

// Page schemas
export const createPageSchema = z.object({
  site_id: idSchema,
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  slug: slugSchema,
  content: z.string().optional(),
  template: z.enum(['default', 'about', 'contact', 'privacy', 'terms', 'landing']).default('default'),
  published: z.boolean().default(false),
  seo: z.object({
    metaTitle: z.string().max(60, 'Meta title too long').optional(),
    metaDescription: z.string().max(160, 'Meta description too long').optional()
  }).optional()
});

export const updatePageSchema = createPageSchema.partial().extend({
  id: idSchema
});

// User schemas
export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  role: z.enum(['admin', 'manager', 'editor']).default('editor')
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

// Tenant schemas
export const createTenantSchema = z.object({
  name: z.string().min(1, 'Tenant name is required').max(100, 'Name too long'),
  subscriptionTier: z.enum(['free', 'starter', 'professional', 'enterprise']).default('starter'),
  settings: z.object({
    maxSites: z.number().min(1, 'Must allow at least 1 site').max(1000, 'Too many sites'),
    maxUsers: z.number().min(1, 'Must allow at least 1 user').max(500, 'Too many users'),
    customDomain: z.boolean().default(false),
    whiteLabel: z.boolean().default(false)
  }).optional()
});

// Validation helper functions
export const sanitizeHtml = (content: string): string => {
  // Basic HTML sanitization - in production, use a library like DOMPurify
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

export const validateAndSanitize = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  const parsed = schema.parse(data);
  
  // Apply sanitization to string fields
  if (typeof parsed === 'object' && parsed !== null) {
    const sanitized = { ...parsed } as any;
    
    // Recursively sanitize string fields
    const sanitizeObject = (obj: any): any => {
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          obj[key] = sanitizeHtml(obj[key]);
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          obj[key] = sanitizeObject(obj[key]);
        }
      }
      return obj;
    };
    
    return sanitizeObject(sanitized);
  }
  
  return parsed;
};

// Response schemas
export const apiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  timestamp: z.string().datetime()
});

export type CreateSiteInput = z.infer<typeof createSiteSchema>;
export type UpdateSiteInput = z.infer<typeof updateSiteSchema>;
export type CreateArticleInput = z.infer<typeof createArticleSchema>;
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;
export type CreatePageInput = z.infer<typeof createPageSchema>;
export type UpdatePageInput = z.infer<typeof updatePageSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateTenantInput = z.infer<typeof createTenantSchema>;