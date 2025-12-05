import { NextRequest, NextResponse } from 'next/server';
import { createQueries, initDb, queryAll } from '@/lib/db-enhanced';
import { validateAndSanitize } from '@/lib/validation';
import { requirePermission, getSecurityHeaders, checkRateLimit } from '@/lib/auth';
import { z } from 'zod';

// GET - Fetch all sites with metrics in a single optimized query
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeMetrics = searchParams.get('includeMetrics') === 'true';
    const tenantId = request.headers.get('X-Tenant-Id') || undefined;
    const queries = createQueries(tenantId);

    // Get all sites
    const sites = await queries.siteQueries.getAll();

    if (!includeMetrics) {
      return NextResponse.json({ sites });
    }

    // Get article counts and email counts in bulk using single queries
    const db = await initDb();

    // Get article counts per site in one query
    const articleCounts = await queryAll(
      `SELECT site_id, COUNT(*) as count FROM articles GROUP BY site_id`
    );

    // Get published article counts per site
    const publishedArticleCounts = await queryAll(
      `SELECT site_id, COUNT(*) as count FROM articles WHERE published = 1 GROUP BY site_id`
    );

    // Get real view counts per site (sum of article views)
    const viewCounts = await queryAll(
      `SELECT a.site_id, COUNT(av.id) as count
       FROM articles a
       LEFT JOIN article_views av ON av.article_id = a.id
       GROUP BY a.site_id`
    );

    // Get active email counts per site
    const emailCounts = await queryAll(
      `SELECT site_id, COUNT(*) as count
       FROM subscribers
       WHERE unsubscribed = 0
       GROUP BY site_id`
    );

    // Create lookup maps
    const articleCountMap: Record<string, number> = {};
    const publishedArticleCountMap: Record<string, number> = {};
    const viewCountMap: Record<string, number> = {};
    const emailCountMap: Record<string, number> = {};

    articleCounts.forEach((row: any) => {
      articleCountMap[row.site_id] = row.count;
    });

    publishedArticleCounts.forEach((row: any) => {
      publishedArticleCountMap[row.site_id] = row.count;
    });

    viewCounts.forEach((row: any) => {
      viewCountMap[row.site_id] = row.count;
    });

    emailCounts.forEach((row: any) => {
      emailCountMap[row.site_id] = row.count;
    });

    // Merge metrics into sites
    const sitesWithMetrics = sites.map((site: any) => ({
      ...site,
      metrics: {
        totalArticles: articleCountMap[site.id] || 0,
        publishedArticles: publishedArticleCountMap[site.id] || 0,
        totalViews: viewCountMap[site.id] || 0,
        activeEmails: emailCountMap[site.id] || 0
      }
    }));

    return NextResponse.json({ sites: sitesWithMetrics });
  } catch (error: any) {
    console.error('Error fetching sites with metrics:', error);
    return NextResponse.json({
      error: 'Failed to fetch sites',
      details: error?.message || String(error)
    }, { status: 500 });
  }
}

const bulkDeleteSchema = z.object({
  siteIds: z.array(z.string().uuid()).min(1, 'At least one site ID is required').max(50, 'Cannot delete more than 50 sites at once'),
  confirm: z.literal(true, 'Confirmation required for bulk delete')
});

const bulkUpdateSchema = z.object({
  siteIds: z.array(z.string().uuid()).min(1, 'At least one site ID is required').max(100, 'Cannot update more than 100 sites at once'),
  updates: z.object({
    status: z.enum(['draft', 'published']).optional(),
    theme: z.enum(['medical', 'wellness', 'clinical', 'lifestyle']).optional()
  }).refine(obj => Object.keys(obj).length > 0, { message: 'At least one update field is required' })
});

const bulkExportSchema = z.object({
  siteIds: z.array(z.string().uuid()).min(1, 'At least one site ID is required').max(100, 'Cannot export more than 100 sites at once'),
  format: z.enum(['json', 'csv']).default('json'),
  includeContent: z.boolean().default(true),
  includeAnalytics: z.boolean().default(false)
});

export async function DELETE(request: NextRequest) {
  try {
    const headers = getSecurityHeaders();
    
    // Rate limiting for bulk deletes (very restrictive)
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimit = checkRateLimit(`bulk-delete:${clientIp}`, { windowMs: 3600000, maxRequests: 3 }); // 3 per hour
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded for bulk delete', resetTime: rateLimit.resetTime },
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
      user = await requirePermission('delete', 'site')(request);
    } catch (error) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401, headers }
      );
    }

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
      validatedData = validateAndSanitize(bulkDeleteSchema, body);
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
    const { siteIds } = validatedData;

    try {
      // Verify all sites exist and belong to the user's tenant
      const sites = await Promise.all(
        siteIds.map(id => queries.siteQueries.getById(id))
      );

      const notFoundSites = sites
        .map((site, index) => site ? null : siteIds[index])
        .filter(Boolean);

      if (notFoundSites.length > 0) {
        return NextResponse.json(
          {
            error: 'Some sites not found',
            notFoundSites,
            timestamp: new Date().toISOString()
          },
          { status: 404, headers }
        );
      }

      // Collect data for activity logging before deletion
      const siteNames = sites.map(site => ({ id: (site as any).id, name: (site as any).name }));

      // Delete all sites and their associated content
      const deletionResults = await Promise.allSettled(
        siteIds.map(async (siteId) => {
          // Delete articles first (foreign key constraint)
          await queries.articleQueries.deleteBySite(siteId);
          // Delete pages
          await queries.pageQueries.deleteBySite(siteId);
          // Delete site
          await queries.siteQueries.delete(siteId);
          return siteId;
        })
      );

      const successfulDeletions = deletionResults
        .filter(result => result.status === 'fulfilled')
        .map(result => (result as PromiseFulfilledResult<string>).value);

      const failedDeletions = deletionResults
        .filter(result => result.status === 'rejected')
        .map((result, index) => ({
          siteId: siteIds[index],
          error: (result as PromiseRejectedResult).reason.message
        }));

      // Log the activity
      await queries.logActivity('bulk_delete', 'site', 'multiple', {
        deletedSites: siteNames.filter(site => successfulDeletions.includes(site.id)),
        failedSites: failedDeletions,
        totalRequested: siteIds.length,
        totalDeleted: successfulDeletions.length
      });

      return NextResponse.json(
        {
          message: `Successfully deleted ${successfulDeletions.length} of ${siteIds.length} sites`,
          deleted: successfulDeletions,
          failed: failedDeletions,
          timestamp: new Date().toISOString()
        },
        { headers }
      );

    } catch (error: any) {
      console.error('Error in bulk delete:', error);
      return NextResponse.json(
        {
          error: 'Failed to delete sites',
          details: error.message,
          timestamp: new Date().toISOString()
        },
        { status: 500, headers }
      );
    }

  } catch (error) {
    console.error('Error in bulk delete operation:', error);
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

export async function PATCH(request: NextRequest) {
  try {
    const headers = getSecurityHeaders();
    
    // Rate limiting for bulk updates
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimit = checkRateLimit(`bulk-update:${clientIp}`, { windowMs: 600000, maxRequests: 10 });
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded for bulk update', resetTime: rateLimit.resetTime },
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
      user = await requirePermission('update', 'site')(request);
    } catch (error) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401, headers }
      );
    }

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
      validatedData = validateAndSanitize(bulkUpdateSchema, body);
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
    const { siteIds, updates } = validatedData;

    try {
      // Verify all sites exist and belong to the user's tenant
      const sites = await Promise.all(
        siteIds.map(id => queries.siteQueries.getById(id))
      );

      const notFoundSites = sites
        .map((site, index) => site ? null : siteIds[index])
        .filter(Boolean);

      if (notFoundSites.length > 0) {
        return NextResponse.json(
          {
            error: 'Some sites not found',
            notFoundSites,
            timestamp: new Date().toISOString()
          },
          { status: 404, headers }
        );
      }

      // Apply updates to all sites
      const updateResults = await Promise.allSettled(
        sites.map(async (site) => {
          const currentSite = site as any;
          const updatedData = {
            ...currentSite,
            ...updates
          };

          await queries.siteQueries.update(currentSite.id, updatedData);

          return currentSite.id;
        })
      );

      const successfulUpdates = updateResults
        .filter(result => result.status === 'fulfilled')
        .map(result => (result as PromiseFulfilledResult<string>).value);

      const failedUpdates = updateResults
        .filter(result => result.status === 'rejected')
        .map((result, index) => ({
          siteId: siteIds[index],
          error: (result as PromiseRejectedResult).reason.message
        }));

      // Log the activity
      await queries.logActivity('bulk_update', 'site', 'multiple', {
        updatedSites: sites.filter(site => successfulUpdates.includes((site as any).id)).map(site => ({ id: (site as any).id, name: (site as any).name })),
        updates,
        failedSites: failedUpdates,
        totalRequested: siteIds.length,
        totalUpdated: successfulUpdates.length
      });

      return NextResponse.json(
        {
          message: `Successfully updated ${successfulUpdates.length} of ${siteIds.length} sites`,
          updated: successfulUpdates,
          failed: failedUpdates,
          appliedUpdates: updates,
          timestamp: new Date().toISOString()
        },
        { headers }
      );

    } catch (error: any) {
      console.error('Error in bulk update:', error);
      return NextResponse.json(
        {
          error: 'Failed to update sites',
          details: error.message,
          timestamp: new Date().toISOString()
        },
        { status: 500, headers }
      );
    }

  } catch (error) {
    console.error('Error in bulk update operation:', error);
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

export async function POST(request: NextRequest) {
  try {
    const headers = getSecurityHeaders();
    
    // Rate limiting for bulk exports
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimit = checkRateLimit(`bulk-export:${clientIp}`, { windowMs: 300000, maxRequests: 20 });
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded for bulk export', resetTime: rateLimit.resetTime },
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
      user = await requirePermission('read', 'site')(request);
    } catch (error) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401, headers }
      );
    }

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
      validatedData = validateAndSanitize(bulkExportSchema, body);
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
    const { siteIds, format, includeContent, includeAnalytics } = validatedData;

    try {
      // Fetch all site data
      const sitesData = await Promise.all(
        siteIds.map(async (siteId) => {
          const site = await queries.siteQueries.getById(siteId);
          if (!site) return null;

          const siteRecord = site as any;
          const siteData: any = {
            ...siteRecord,
            settings: typeof siteRecord.settings === 'string' ? JSON.parse(siteRecord.settings) : siteRecord.settings,
            brand_profile: typeof siteRecord.brand_profile === 'string' ? JSON.parse(siteRecord.brand_profile) : siteRecord.brand_profile
          };

          if (includeContent) {
            siteData.articles = await queries.articleQueries.getAllBySite(siteId);
            siteData.pages = await queries.pageQueries.getAllBySite(siteId);
          }

          if (includeAnalytics) {
            // Add analytics data if available
            siteData.analytics = {
              totalViews: siteData.articles?.reduce((sum: number, article: any) => sum + (article.views || 0), 0) || 0,
              articleCount: siteData.articles?.length || 0,
              publishedArticles: siteData.articles?.filter((article: any) => article.published).length || 0
            };
          }

          return siteData;
        })
      );

      const validSites = sitesData.filter(Boolean);

      if (validSites.length === 0) {
        return NextResponse.json(
          { error: 'No valid sites found for export' },
          { status: 404, headers }
        );
      }

      // Log the activity
      await queries.logActivity('bulk_export', 'site', 'multiple', {
        exportedSites: validSites.map(site => ({ id: site.id, name: site.name })),
        format,
        includeContent,
        includeAnalytics,
        totalExported: validSites.length
      });

      if (format === 'csv') {
        // Convert to CSV format
        const csvHeaders = ['ID', 'Name', 'Domain', 'Subdomain', 'Status', 'Theme', 'Created', 'Updated'];
        if (includeAnalytics) {
          csvHeaders.push('Total Views', 'Articles', 'Published Articles');
        }

        const csvRows = validSites.map(site => {
          const row = [
            site.id,
            site.name,
            site.domain || '',
            site.subdomain,
            site.status,
            site.theme,
            site.created_at,
            site.updated_at
          ];

          if (includeAnalytics) {
            row.push(
              site.analytics?.totalViews || 0,
              site.analytics?.articleCount || 0,
              site.analytics?.publishedArticles || 0
            );
          }

          return row;
        });

        const csvContent = [csvHeaders, ...csvRows]
          .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
          .join('\n');

        return new NextResponse(csvContent, {
          headers: {
            ...headers,
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="sites-export-${new Date().toISOString().split('T')[0]}.csv"`
          }
        });
      }

      // JSON format (default)
      return NextResponse.json(
        {
          sites: validSites,
          export: {
            format,
            includeContent,
            includeAnalytics,
            totalSites: validSites.length,
            exportedAt: new Date().toISOString()
          }
        },
        {
          status: 200,
          headers: {
            ...headers,
            'Content-Disposition': `attachment; filename="sites-export-${new Date().toISOString().split('T')[0]}.json"`
          }
        }
      );

    } catch (error: any) {
      console.error('Error in bulk export:', error);
      return NextResponse.json(
        {
          error: 'Failed to export sites',
          details: error.message,
          timestamp: new Date().toISOString()
        },
        { status: 500, headers }
      );
    }

  } catch (error) {
    console.error('Error in bulk export operation:', error);
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