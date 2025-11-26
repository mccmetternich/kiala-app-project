import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { createQueries } from '@/lib/db-enhanced';
import { validateAndSanitize } from '@/lib/validation';
import { requirePermission, getSecurityHeaders, checkRateLimit } from '@/lib/auth';
import { z } from 'zod';

const cloneSiteSchema = z.object({
  name: z.string().min(1, 'Site name is required').max(100, 'Site name too long'),
  subdomain: z.string().min(1, 'Subdomain is required').max(50, 'Subdomain too long')
    .regex(/^[a-z0-9-]+$/, 'Subdomain can only contain lowercase letters, numbers, and hyphens'),
  domain: z.string().optional(),
  cloneContent: z.boolean().default(true),
  cloneSettings: z.boolean().default(true),
  cloneTheme: z.boolean().default(true)
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const headers = getSecurityHeaders();

    // Rate limiting for cloning (more restrictive)
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimit = checkRateLimit(`clone:${clientIp}`, { windowMs: 600000, maxRequests: 5 });
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded for site cloning', resetTime: rateLimit.resetTime },
        { 
          status: 429,
          headers: {
            ...headers,
            'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString()
          }
        }
      );
    }

    // Require authentication and permission
    let user;
    try {
      user = await requirePermission('create', 'site')(request);
    } catch (error) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401, headers }
      );
    }

    const sourceId = id;

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400, headers }
      );
    }

    // Validate input
    let validatedData;
    try {
      validatedData = validateAndSanitize(cloneSiteSchema, body);
    } catch (error: any) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: error.errors || error.message,
          timestamp: new Date().toISOString()
        },
        { status: 400, headers }
      );
    }

    const queries = createQueries(user.tenantId);

    // Get source site
    const sourceSite = await queries.siteQueries.getById(sourceId) as any;
    if (!sourceSite) {
      return NextResponse.json(
        { error: 'Source site not found' },
        { status: 404, headers }
      );
    }

    // Check for unique constraints
    if (validatedData.domain) {
      const existingDomain = await queries.siteQueries.getByDomain(validatedData.domain);
      if (existingDomain) {
        return NextResponse.json(
          { 
            error: 'Domain already exists',
            field: 'domain',
            timestamp: new Date().toISOString()
          },
          { status: 409, headers }
        );
      }
    }

    const existingSubdomain = await queries.siteQueries.getBySubdomain(validatedData.subdomain);
    if (existingSubdomain) {
      return NextResponse.json(
        { 
          error: 'Subdomain already exists',
          field: 'subdomain',
          timestamp: new Date().toISOString()
        },
        { status: 409, headers }
      );
    }

    // Create the cloned site
    const clonedSiteId = uuidv4();
    const clonedSiteData = {
      id: clonedSiteId,
      name: validatedData.name,
      domain: validatedData.domain || null,
      subdomain: validatedData.subdomain,
      theme: validatedData.cloneTheme ? sourceSite.theme : 'medical',
      settings: validatedData.cloneSettings ? sourceSite.settings : '{}',
      brand_profile: validatedData.cloneSettings ? sourceSite.doctor_profile : '{}',
      status: 'draft', // Always start clones as draft
      created_by: user.id
    };

    try {
      // Start transaction-like operations
      await queries.siteQueries.create(clonedSiteData);
      
      // Clone content if requested
      if (validatedData.cloneContent) {
        const sourceArticles = await queries.articleQueries.getAllBySite(sourceId) as any[];
        const sourcePages = await queries.pageQueries.getAllBySite(sourceId) as any[];

        // Clone articles
        for (const article of sourceArticles) {
          const clonedArticleId = uuidv4();
          const clonedArticleData = {
            id: clonedArticleId,
            site_id: clonedSiteId,
            title: `${article.title} (Copy)`,
            excerpt: article.excerpt,
            content: article.content,
            slug: `${article.slug}-copy`,
            category: article.category,
            image: article.image,
            featured: false, // Reset featured status
            trending: false, // Reset trending status
            hero: false, // Reset hero status
            published: false, // Always start as draft
            read_time: article.read_time,
            views: 0 // Reset view count
          };

          await queries.articleQueries.create(clonedArticleData);
        }

        // Clone pages
        for (const page of sourcePages) {
          const clonedPageId = uuidv4();
          const clonedPageData = {
            id: clonedPageId,
            site_id: clonedSiteId,
            title: `${page.title} (Copy)`,
            slug: `${page.slug}-copy`,
            content: page.content,
            template: page.template,
            published: false // Always start as draft
          };

          await queries.pageQueries.create(clonedPageData);
        }
      }

      // Log the activity
      await queries.logActivity('clone', 'site', clonedSiteId, {
        sourceSiteId: sourceId,
        sourceSiteName: sourceSite.name,
        clonedSiteName: validatedData.name,
        cloneContent: validatedData.cloneContent,
        cloneSettings: validatedData.cloneSettings,
        cloneTheme: validatedData.cloneTheme
      });

      // Fetch the created site with full data
      const createdSite = await queries.siteQueries.getById(clonedSiteId) as any;

      return NextResponse.json(
        {
          site: {
            ...createdSite,
            settings: typeof createdSite?.settings === 'string' ? JSON.parse(createdSite.settings) : createdSite?.settings,
            brand_profile: typeof createdSite?.doctor_profile === 'string' ? JSON.parse(createdSite.doctor_profile) : createdSite?.doctor_profile
          },
          source: {
            id: sourceSite.id,
            name: sourceSite.name
          },
          cloning: {
            content: validatedData.cloneContent,
            settings: validatedData.cloneSettings,
            theme: validatedData.cloneTheme
          },
          message: 'Site cloned successfully',
          timestamp: new Date().toISOString()
        },
        { status: 201, headers }
      );

    } catch (error: any) {
      console.error('Error cloning site:', error);
      
      // Clean up partially created site if there was an error
      try {
        await queries.siteQueries.delete(clonedSiteId);
      } catch (cleanupError) {
        console.error('Error cleaning up failed clone:', cleanupError);
      }

      if (error.message?.includes('UNIQUE constraint')) {
        return NextResponse.json(
          { 
            error: 'Site with this domain or subdomain already exists',
            timestamp: new Date().toISOString()
          },
          { status: 409, headers }
        );
      }

      return NextResponse.json(
        { 
          error: 'Failed to clone site',
          timestamp: new Date().toISOString()
        },
        { status: 500, headers }
      );
    }

  } catch (error) {
    console.error('Error in site cloning:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      },
      { 
        status: 500,
        headers: getSecurityHeaders()
      }
    );
  }
}