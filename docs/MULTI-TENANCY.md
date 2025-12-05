# Multi-Tenancy Architecture

This document describes the multi-tenant architecture of the Kiala CMS.

## Overview

The CMS uses a **hybrid multi-tenant model** where:
- **Users** are fully isolated by tenant
- **Sites** are globally accessible (for public-facing pages)
- **Content** (articles, pages) is scoped to sites, not tenants

## Tenant Header

The tenant context is passed via the `X-Tenant-Id` HTTP header:

```typescript
const tenantId = request.headers.get('X-Tenant-Id') || undefined;
const queries = createQueries(tenantId);
```

## Data Isolation Levels

### Fully Tenant-Isolated

**Users** - All user queries filter by `tenant_id`:

```sql
-- User queries include tenant isolation
SELECT * FROM users WHERE id = ? AND tenant_id = ?
SELECT * FROM users WHERE email = ? AND tenant_id = ?
SELECT * FROM users WHERE tenant_id = ? ORDER BY created_at DESC
```

This ensures:
- Users can only see users in their own tenant
- Email uniqueness is per-tenant (same email can exist in different tenants)
- User management is fully isolated

### Site-Scoped (Not Tenant-Scoped)

**Articles, Pages, Subscribers, Media** - Scoped to sites via `site_id`:

```sql
-- Content is scoped to sites, not directly to tenants
SELECT * FROM articles WHERE site_id = ?
SELECT * FROM email_subscribers WHERE site_id = ?
```

This allows:
- Public site rendering without tenant context
- Sites to be accessed via subdomain/domain
- Flexible site management

### Globally Accessible

**Sites** - Not tenant-isolated:

```sql
-- Sites can be queried without tenant context
SELECT * FROM sites WHERE subdomain = ?
SELECT * FROM sites WHERE id = ?
```

This supports:
- Public site access via subdomain routing
- Site discovery for domain routing
- Cross-tenant site management (for super-admins)

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Tenant A                              │
│  ┌─────────┐                                                │
│  │ Users   │ ←── Tenant-isolated                            │
│  └─────────┘                                                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     Global Layer                             │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐                   │
│  │ Site 1  │   │ Site 2  │   │ Site 3  │  ←── Global      │
│  └────┬────┘   └────┬────┘   └────┬────┘                   │
│       │             │             │                          │
│  ┌────┴────┐   ┌────┴────┐   ┌────┴────┐                   │
│  │Articles │   │Articles │   │Articles │  ←── Site-scoped  │
│  │Pages    │   │Pages    │   │Pages    │                   │
│  │Subs     │   │Subs     │   │Subs     │                   │
│  └─────────┘   └─────────┘   └─────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

## Site Publish Status

Sites have a `status` field that controls public visibility:
- `published` - Site is publicly accessible
- `draft` - Site returns 404 on all public pages

### How It Works

All public pages pass `publishedOnly=true` to the API:

```typescript
// In public page components
const site = await clientAPI.getSiteBySubdomain(subdomain, true);

// API checks status
if (publishedOnly && site.status !== 'published') {
  return NextResponse.json({ site: null });
}
```

### Two-Level Protection

1. **Site Level**: Draft sites return 404 for ALL pages/articles
2. **Page/Article Level**: Individual items have their own `published` flag

A page is only visible if:
- Site `status === 'published'` AND
- Page/Article `published === true`

### Tenant Isolation

Setting Site A to draft:
- ✅ Site A returns 404 on all public pages
- ✅ Site B remains completely unaffected
- ✅ Each site is independently controlled

---

## Use Cases

### Public Site Visitor
1. Visits `dr-amy.kiala-app-project.vercel.app`
2. API checks if site status is `published`
3. If published, site is resolved and articles fetched
4. If draft, 404 page is shown
5. Email signup goes to site's subscriber list

### Admin User
1. Logs in with email/password
2. Tenant context established from JWT/session
3. Can manage sites (global access)
4. User management is tenant-isolated

### Super Admin
1. Has access to all tenants
2. Can manage all sites
3. Can view cross-tenant analytics

## Activity Logging

All activity logs include tenant context:

```sql
INSERT INTO activity_log (tenant_id, user_id, action, resource_type, resource_id, details)
VALUES (?, ?, ?, ?, ?, ?)
```

This enables:
- Per-tenant audit trails
- Cross-tenant analytics (for super-admins)
- Action attribution

## API Routes and Tenant Context

| Route | Tenant Isolated | Scope |
|-------|----------------|-------|
| `/api/sites` | No | Global |
| `/api/articles` | No | Site-scoped |
| `/api/pages` | No | Site-scoped |
| `/api/subscribers` | No | Site-scoped |
| `/api/media` | No | Site-scoped |
| `/api/auth/*` | Yes | Tenant |
| `/api/admin/*` | Yes | Tenant |

## Security Considerations

1. **User Isolation**: Users cannot access other tenants' user data
2. **Site Access**: Sites are public but admin operations require auth
3. **Content Access**: Published content is public; drafts require auth
4. **Subscriber Privacy**: Subscriber lists are per-site, not shareable

## Future Considerations

If full tenant isolation is needed for sites/content:

1. Add `tenant_id` to sites table
2. Update site queries to filter by tenant
3. Add middleware to verify tenant ownership
4. Update admin UI to show only tenant's sites

This would change the model from "global sites" to "tenant-isolated sites".
