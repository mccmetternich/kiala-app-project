/**
 * Database Row Types
 *
 * These types represent the raw data returned from database queries.
 * They match the database schema exactly (snake_case column names).
 *
 * For application-level types with camelCase, see ./index.ts
 */

// Base row type with common timestamp fields
export interface BaseRow {
  created_at: string;
  updated_at?: string;
}

// Tenant row (for multi-tenancy)
export interface TenantRow extends BaseRow {
  id: string;
  name: string;
  subscription_tier: string;
  settings: string; // JSON string
  max_sites: number;
  max_users: number;
}

// User row
export interface UserRow extends BaseRow {
  id: string;
  tenant_id: string;
  email: string;
  password_hash: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
  permissions: string; // JSON array string
  last_login: string | null;
  email_verified: number; // SQLite boolean (0 or 1)
}

// Site row
export interface SiteRow extends BaseRow {
  id: string;
  tenant_id: string | null;
  name: string;
  domain: string | null;
  subdomain: string | null;
  theme: string;
  settings: string; // JSON string (SiteSettings)
  brand_profile: string; // JSON string (BrandProfile)
  status: 'draft' | 'published' | 'archived';
  created_by: string | null;
  published_at: string | null;
  version: number;
}

// Article row
export interface ArticleRow extends BaseRow {
  id: string;
  site_id: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  slug: string;
  category: string | null;
  image: string | null;
  featured: number; // SQLite boolean
  trending: number; // SQLite boolean
  hero: number; // SQLite boolean
  published: number; // SQLite boolean
  read_time: number;
  views: number;
  author_id: string | null;
  tags: string; // JSON array string
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
  widget_config: string | null; // JSON string (Widget[])
  published_at: string | null;
  version: number;
}

// Page row
export interface PageRow extends BaseRow {
  id: string;
  site_id: string;
  title: string;
  slug: string;
  content: string | null;
  template: string;
  published: number; // SQLite boolean
  author_id: string | null;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  version: number;
}

// Media row
export interface MediaRow extends BaseRow {
  id: string;
  site_id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  file_type: 'image' | 'video' | 'audio' | 'document';
  size: number;
  url: string;
  width: number | null;
  height: number | null;
  alt: string | null;
  tags: string; // JSON array string
}

// Email subscriber row
export interface EmailSubscriberRow {
  id: string;
  site_id: string;
  email: string;
  name: string | null;
  source: string;
  tags: string; // JSON array string
  status: 'active' | 'unsubscribed' | 'bounced';
  ip_address: string | null;
  user_agent: string | null;
  page_url: string | null;
  subscribed_at: string;
  unsubscribed_at: string | null;
  created_at: string;
}

// Activity log row
export interface ActivityLogRow {
  id: string;
  tenant_id: string;
  user_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: string; // JSON string
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// Widget definition row (from widget_definitions table)
export interface WidgetDefinitionRow extends BaseRow {
  id: string;
  type: string;
  name: string;
  description: string | null;
  category: string;
  schema: string; // JSON string (field definitions)
  default_config: string; // JSON string
  icon: string | null;
  enabled: number; // SQLite boolean
  sort_order: number;
}

// Widget instance row (from widget_instances table)
export interface WidgetInstanceRow extends BaseRow {
  id: string;
  definition_id: string;
  site_id: string;
  name: string;
  config: string; // JSON string
  enabled: number; // SQLite boolean
}

// Block row (for page builder)
export interface BlockRow extends BaseRow {
  id: string;
  page_id: string;
  type: string;
  config: string; // JSON string
  sort_order: number;
}

// Domain record row
export interface DomainRecordRow extends BaseRow {
  id: string;
  site_id: string;
  domain: string;
  subdomain: string | null;
  status: 'pending' | 'dns_pending' | 'ssl_pending' | 'active' | 'failed';
  ssl_status: 'none' | 'pending' | 'issued' | 'expired' | 'failed';
  dns_verified: number; // SQLite boolean
  ssl_certificate_id: string | null;
  provider: 'vercel' | 'cloudflare' | 'custom';
  provider_config: string; // JSON string
  verified_at: string | null;
  error_message: string | null;
}

// DNS challenge row
export interface DnsChallengeRow {
  id: string;
  domain_id: string;
  challenge_type: string;
  challenge_token: string;
  challenge_value: string;
  verified: number; // SQLite boolean
  expires_at: string | null;
  created_at: string;
}

/**
 * Type guards and helper functions
 */

// Convert SQLite boolean (0/1) to JavaScript boolean
export function toBool(value: number | null | undefined): boolean {
  return value === 1;
}

// Safe JSON parse with fallback
export function parseJSON<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

// Parse tags JSON array
export function parseTags(tagsJson: string | null | undefined): string[] {
  return parseJSON(tagsJson, []);
}
