# Site Setup & Page Management System - Updated Roadmap

## Current State (After Phase 1 & Partial Phase 2)

### ✅ COMPLETED

**Content Profile (Phase 1) - DONE**
- `content_profile` field added to database
- Full Content Profile UI as internal tab in site dashboard
- Collapsible sections for: Mission, Audience, Style, Rules, Topics, Products
- Save functionality integrated with site update API

**Page Management UI (Partial Phase 2) - DONE**
- `page_config` field added to database
- Pages tab in site dashboard with:
  - Navigation order management
  - Show/hide in nav toggle
  - Nav mode selector (Global/Direct Response/Minimal)
  - Enable/disable pages
  - Article default nav mode setting
- Save functionality integrated

**Dashboard Consolidation - DONE**
- All site management in single dashboard with internal tabs:
  - Overview, Articles, Pages, Emails, Analytics, Content Profile, Settings
- Global nav stays consistent (Dashboard, All Articles, Email Signups)
- Site-specific nav is within the dashboard tabs

### Pages that exist as routes:
- `/` - Homepage
- `/articles` - Article listing
- `/articles/[slug]` - Individual articles
- `/about` - About page
- `/top-picks` - Product recommendations (hardcoded mock data)
- `/success-stories` - Testimonials (hardcoded mock data)
- `/about-blocks` - Alternative about page

### Navigation behavior:
- `SiteHeader` (regular pages): Full nav with Home, Articles, About links + hamburger menu
- `ArticleHeader` (article pages): NO navigation links - just logo, social proof, audio player, community count

---

## 🔲 REMAINING WORK

### Current Gaps:
1. ~~Pages are hardcoded routes, not database-driven~~ (page_config added, but frontend doesn't read it yet)
2. ~~No admin UI to manage which pages appear in nav~~ ✅ DONE
3. ~~No way to show/hide pages~~ ✅ DONE
4. No page templates library
5. Top Picks & Success Stories have hardcoded mock data
6. ~~No "nav mode" selector per page type~~ ✅ DONE (UI exists, but not connected to frontend)
7. ~~Content Profile/Editorial Guidelines don't exist yet~~ ✅ DONE

---

## Phase 2: Page Management - FRONTEND INTEGRATION (Remaining)

### What's Left:

**1. Update SiteLayout to read page_config**

The admin UI saves page_config, but the frontend doesn't use it yet. Need to:

```typescript
// In SiteLayout or similar
const pageConfig = site.page_config?.pages || [];
const enabledPages = pageConfig.filter(p => p.enabled && p.showInNav);
const sortedNav = enabledPages.sort((a, b) => a.navOrder - b.navOrder);
```

**2. Implement Nav Mode Switching**

Create a component that renders the appropriate header based on nav mode:

```typescript
function SitePageWrapper({ navMode, children }) {
  switch (navMode) {
    case 'direct-response':
      return <ArticleHeader />{children}<Footer />;
    case 'minimal':
      return <MinimalHeader />{children}<Footer />;
    case 'global':
    default:
      return <SiteHeader />{children}<Footer />;
  }
}
```

**3. Create MinimalHeader Component**

New header style with just logo, no navigation:

```typescript
// src/components/site/MinimalHeader.tsx
function MinimalHeader({ site }) {
  return (
    <header className="...">
      <Logo site={site} />
      {/* No nav links, no social proof */}
    </header>
  );
}
```

**4. Update Page Routes to Use Config**

Each page route should:
- Fetch page config for that page type
- Use the configured nav mode
- Hide 404 if page is disabled

---

## Phase 3: Enhanced Site Creation Wizard

### Wizard Steps (8 steps):

| Step | Name | What's Collected |
|------|------|------------------|
| 1 | Getting Started | Choose: Start Fresh OR Clone Existing Site |
| 2 | Site Identity | Name, subdomain, custom domain |
| 3 | Brand Profile | Brand name, tagline, bio, quote, credentials |
| 4 | Brand Visuals | 4 brand images (logo, author, sidebar, about) via MediaLibrary |
| 5 | Content Profile | Mission, audience, tone, writing rules (simplified version) |
| 6 | Pages & Navigation | Enable/disable pages, set nav order, choose nav modes |
| 7 | Theme & Colors | Theme selection + custom color pickers |
| 8 | Tracking & Launch | Meta Pixel, Google Analytics, community count, review & create |

### Clone Mode Details:

When cloning:
- Pre-populate ALL fields from source site
- Allow editing before creation
- Options:
  - ☑ Clone settings & theme
  - ☑ Clone content profile
  - ☑ Clone page configuration
  - ☐ Clone articles (with brand replacement)
  - ☐ Clone media library

---

## Phase 4: Article Cloning with Brand Replacement

### Article Brand Replacement Logic:

When cloning articles, find/replace:
- Source brand name → New brand name
- Source doctor name → New doctor name
- Source tagline → New tagline
- Source product names → (flag for manual review)

### Implementation:

```typescript
interface CloneOptions {
  cloneSettings: boolean;
  cloneContentProfile: boolean;
  clonePageConfig: boolean;
  cloneArticles: boolean;
  cloneMedia: boolean;
  brandReplacements: {
    oldBrandName: string;
    newBrandName: string;
    oldDoctorName: string;
    newDoctorName: string;
  };
}
```

---

## Database Schema (Current)

### sites table:
```sql
-- Already has these fields:
content_profile TEXT DEFAULT '{}',    -- JSON: Editorial guidelines ✅
page_config TEXT DEFAULT '{}',        -- JSON: Page configurations ✅

-- Article nav mode is stored in page_config.defaultArticleNavMode
```

### Optional: site_pages table (for database-driven pages)

If we want fully dynamic pages beyond the template system:

```sql
CREATE TABLE site_pages (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  type TEXT NOT NULL,                 -- 'homepage', 'about', 'custom', etc.
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  nav_label TEXT,
  enabled BOOLEAN DEFAULT 1,
  show_in_nav BOOLEAN DEFAULT 1,
  nav_order INTEGER DEFAULT 0,
  nav_mode TEXT DEFAULT 'global',     -- 'global', 'direct-response', 'minimal'
  content TEXT,                       -- JSON or HTML content
  seo_title TEXT,
  seo_description TEXT,
  settings TEXT DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE,
  UNIQUE(site_id, slug)
);
```

---

## Page Types Reference

| Page Type | Route | Description | Nav Mode Default |
|-----------|-------|-------------|------------------|
| homepage | / | Landing page with hero, articles, CTAs | global |
| articles | /articles | Article listing/archive | global |
| article | /articles/[slug] | Individual article (from DB) | direct-response |
| about | /about | About the brand/doctor | global |
| top-picks | /top-picks | Product recommendations | global |
| success-stories | /success-stories | Testimonials/transformations | global |
| faq | /faq | Frequently asked questions | global |
| contact | /contact | Contact form | global |
| custom | /[custom-slug] | Custom page from DB | global |

---

## Navigation Modes Explained

### 1. Global Nav (`global`)
- Full header with logo, nav links, CTA button
- Hamburger menu on mobile
- Used for: Homepage, About, Articles listing, Top Picks, etc.
- Component: `SiteHeader`

### 2. Direct Response (`direct-response`)
- NO navigation links (keeps reader focused)
- Shows: Logo, brand name, tagline, social proof, audio player, community count
- Used for: Individual articles (sales/conversion focused)
- Component: `ArticleHeader`

### 3. Minimal (`minimal`)
- Logo only, no navigation or social proof
- Clean, distraction-free
- Used for: Checkout pages, landing pages, special funnels
- Component: `MinimalHeader` (to be created)

---

## Updated Implementation Order

### ✅ Phase 1: Content Profile - COMPLETE
- [x] Add content_profile field to database
- [x] Create Content Profile UI (as internal tab)
- [x] Update site API to handle content_profile

### 🔲 Phase 2: Page Management - PARTIALLY COMPLETE
- [x] Add page_config field to database
- [x] Create Pages UI (as internal tab)
- [ ] **Update SiteLayout to read page_config from database**
- [ ] **Implement nav mode switching in frontend**
- [ ] **Create MinimalHeader component**
- [ ] **Update page routes to respect enabled/disabled status**

### 🔲 Phase 3: Enhanced Site Creation Wizard
- [ ] Redesign /admin/sites/new/page.tsx with 8-step wizard
- [ ] Add clone mode with site selection
- [ ] Add MediaLibrary integration for brand images
- [ ] Add content profile step (simplified version)
- [ ] Add page configuration step
- [ ] Add tracking configuration step

### 🔲 Phase 4: Article Cloning with Brand Replacement
- [ ] Update clone API to support article cloning
- [ ] Implement brand name replacement logic
- [ ] Add UI for clone options
- [ ] Add preview/review of replacements before cloning

---

## Summary

**What's Working:**
- Content Profile: Full editorial guidelines stored and editable ✅
- Page Config: Admin can configure pages, nav order, nav modes ✅
- Dashboard: All site management consolidated in internal tabs ✅

**What's Next:**
1. **Frontend integration** - Make the page_config actually control the frontend navigation and headers
2. **Enhanced Wizard** - Better site creation flow with cloning
3. **Article Cloning** - Duplicate content with brand replacement
