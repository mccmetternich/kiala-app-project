# API Reference

This document describes the REST API endpoints for the Kiala CMS.

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://kiala-app-project.vercel.app/api`

## Response Format

All endpoints return JSON with consistent structure:

```json
// Success
{ "success": true, "data": { ... } }

// Error
{ "error": "Error message description" }
```

---

## Public Endpoints

### Sites

#### GET /api/sites
Get all sites.

**Response:**
```json
{
  "sites": [
    {
      "id": "string",
      "name": "string",
      "subdomain": "string",
      "domain": "string | null",
      "theme": "string",
      "status": "draft | published | archived",
      "settings": { ... },
      "brand_profile": { ... }
    }
  ]
}
```

#### GET /api/sites/[id]
Get a single site by ID.

**Query Params:**
- `subdomain` (optional): Lookup by subdomain instead of ID

**Response:**
```json
{
  "site": {
    "id": "string",
    "name": "string",
    "subdomain": "string",
    "settings": { ... },
    "brand_profile": { ... }
  }
}
```

#### POST /api/sites
Create a new site.

**Body:**
```json
{
  "name": "string",
  "subdomain": "string",
  "theme": "medical",
  "settings": { ... },
  "brand_profile": { ... }
}
```

#### PUT /api/sites/[id]
Update a site.

#### DELETE /api/sites/[id]
Delete a site and all associated data.

---

### Articles

#### GET /api/articles
Get articles.

**Query Params:**
- `siteId` (required): Filter by site
- `slug` (optional): Get specific article by slug
- `published` (optional): Filter published only

**Response:**
```json
{
  "articles": [
    {
      "id": "string",
      "title": "string",
      "slug": "string",
      "excerpt": "string",
      "content": "string",
      "image": "string",
      "category": "string",
      "featured": boolean,
      "trending": boolean,
      "hero": boolean,
      "published": boolean,
      "read_time": number,
      "views": number,
      "widget_config": [ ... ]
    }
  ]
}
```

#### POST /api/articles
Create a new article.

**Body:**
```json
{
  "site_id": "string",
  "title": "string",
  "slug": "string",
  "excerpt": "string",
  "content": "string",
  "category": "string",
  "image": "string",
  "featured": boolean,
  "trending": boolean,
  "hero": boolean,
  "published": boolean,
  "widget_config": [ ... ]
}
```

#### PUT /api/articles/[id]
Update an article.

#### DELETE /api/articles/[id]
Delete an article.

#### POST /api/articles/[id]/view
Increment article view count.

---

### Email Subscribers

#### POST /api/emails
Subscribe an email address.

**Body:**
```json
{
  "email": "string",
  "siteId": "string",
  "name": "string (optional)",
  "source": "popup | footer | inline",
  "pageUrl": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully subscribed",
  "subscriber": { ... }
}
```

#### GET /api/subscribers
Get all subscribers for a site.

**Query Params:**
- `siteId` (required): Site ID

---

### Pages

#### GET /api/pages
Get pages for a site.

**Query Params:**
- `siteId` (required): Filter by site
- `slug` (optional): Get specific page

#### POST /api/pages
Create a new page.

#### PUT /api/pages/[id]
Update a page.

#### DELETE /api/pages/[id]
Delete a page.

---

### Media

#### GET /api/media
Get media files for a site.

**Query Params:**
- `siteId` (required): Site ID
- `fileType` (optional): Filter by type (image, video, audio, document)

#### POST /api/media
Upload a media file (via Cloudinary).

**Body:** FormData with `file` field

---

## Admin Endpoints

### Dashboard

#### GET /api/admin/dashboard-stats
Get dashboard statistics.

**Query Params:**
- `siteId` (required): Site ID

**Response:**
```json
{
  "stats": {
    "totalArticles": number,
    "publishedArticles": number,
    "totalViews": number,
    "subscriberCount": number
  }
}
```

#### GET /api/admin/analytics
Get analytics data.

#### GET /api/admin/health
Health check endpoint.

---

### Database

#### GET /api/admin/migrate
Run database migrations. Creates all tables if they don't exist.

**Response:**
```json
{
  "success": true,
  "message": "Database migration completed successfully."
}
```

---

### Widgets

#### GET /api/admin/widgets/definitions
Get all widget definitions.

#### POST /api/admin/widgets/definitions
Create a new widget definition.

#### GET /api/admin/widgets/instances
Get widget instances for a site.

**Query Params:**
- `siteId` (required): Site ID
- `pageId` (optional): Filter by page

#### POST /api/admin/widgets/instances
Create a widget instance.

---

### Blocks (Page Builder)

#### GET /api/blocks
Get blocks for a page.

**Query Params:**
- `pageId` (required): Page ID
- `siteId` (required): Site ID

#### POST /api/blocks
Save blocks for a page (replaces all existing).

**Body:**
```json
{
  "pageId": "string",
  "siteId": "string",
  "blocks": [
    {
      "id": "string",
      "type": "string",
      "position": number,
      "visible": boolean,
      "settings": { ... }
    }
  ]
}
```

#### PUT /api/blocks
Update a single block.

#### DELETE /api/blocks?blockId=xxx
Delete a block.

---

## Authentication

#### POST /api/auth/login
Login with email and password.

**Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

#### POST /api/auth/logout
Logout current session.

---

## Error Codes

| Status | Description |
|--------|-------------|
| 200 | Success |
| 400 | Bad Request - Missing or invalid parameters |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 500 | Server Error - Internal error |

---

## Rate Limiting

Currently no rate limiting is implemented. Consider adding for production.

## Caching

The API uses in-memory caching with the following TTLs:
- Site data: 5 minutes
- Article content: 2 minutes
- Page blocks: 5 minutes

Cache is automatically invalidated on writes.
