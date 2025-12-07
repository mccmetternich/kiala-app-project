# Widget Configuration Guide

This guide explains how to configure widgets in the Kiala CMS for articles and pages.

## Overview

Widgets are inline UI components that appear within article content. They're used for:
- Email capture (lead magnets, newsletter signups)
- Calls to action
- Data displays
- Interactive elements

## Widget Configuration in Articles

Articles store widget configuration in the `widget_config` JSON field:

```json
{
  "widget_config": [
    {
      "type": "widget-type",
      "position": "after-intro" | "mid-content" | "before-conclusion" | "after-conclusion",
      "settings": {
        // Widget-specific settings
      }
    }
  ]
}
```

### Widget Positions

| Position | Description |
|----------|-------------|
| `after-intro` | After the first paragraph |
| `mid-content` | Approximately middle of content |
| `before-conclusion` | Before the final section |
| `after-conclusion` | At the very end of the article |

---

## Built-in Widget Types

### 1. Email Capture (`email-capture`)

Email signup form with customizable messaging.

**Settings:**
```json
{
  "type": "email-capture",
  "position": "mid-content",
  "settings": {
    "title": "Get Free Access",
    "description": "Join thousands getting our free resources!",
    "button_text": "Subscribe Now",
    "email_placeholder": "Enter your email address",
    "privacy_text": "No spam, ever. Unsubscribe anytime.",
    "button_styles": "background: #ff6b6b; color: white;",
    "container_styles": ""
  }
}
```

### 2. Data Overview (`data-overview`)

Display statistics or key data points.

**Settings:**
```json
{
  "type": "data-overview",
  "position": "after-intro",
  "settings": {
    "heading": "Quick Overview",
    "subheading": "What you'll learn",
    "items": [
      { "label": "Key Point 1", "value": "Description" },
      { "label": "Key Point 2", "value": "Description" }
    ],
    "columns": 2
  }
}
```

### 3. Call to Action (`cta`)

Button or link to drive action.

**Settings:**
```json
{
  "type": "cta",
  "position": "after-conclusion",
  "settings": {
    "headline": "Ready to get started?",
    "description": "Join our community today",
    "button_text": "Sign Up Free",
    "button_url": "/signup",
    "style": "primary" | "secondary" | "outline"
  }
}
```

### 4. Hero Image (`hero-image`)

Full-width image with optional overlay.

**Settings:**
```json
{
  "type": "hero-image",
  "position": "after-intro",
  "settings": {
    "image_url": "https://...",
    "alt_text": "Description",
    "caption": "Optional caption",
    "full_width": true
  }
}
```

### 5. Opening Hook (`opening-hook`)

Attention-grabbing intro element.

**Settings:**
```json
{
  "type": "opening-hook",
  "position": "after-intro",
  "settings": {
    "text": "Hook text...",
    "style": "quote" | "highlight" | "callout"
  }
}
```

### 6. Main Content (`main-content`)

Rich content block.

**Settings:**
```json
{
  "type": "main-content",
  "position": "mid-content",
  "settings": {
    "content": "<p>HTML content...</p>",
    "columns": 1 | 2
  }
}
```

### 7. Final CTA (`final-cta`)

End-of-article call to action.

**Settings:**
```json
{
  "type": "final-cta",
  "position": "after-conclusion",
  "settings": {
    "headline": "Don't Miss Out",
    "description": "Get the complete guide",
    "button_text": "Download Now",
    "button_url": "#",
    "background": "gradient" | "solid" | "none"
  }
}
```

---

## Widget Registry System

For more advanced widget management, use the Widget Registry:

### Widget Definitions

Widget definitions are templates stored in the `widget_definitions` table:

```typescript
interface WidgetDefinition {
  id: string;           // e.g., 'email-capture'
  name: string;         // Display name
  description: string;  // What the widget does
  category: 'conversion' | 'content' | 'social' | 'media' | 'analytics';
  version: string;      // e.g., '1.0.0'
  template: string;     // HTML with {{placeholder}} variables
  styles?: string;      // CSS
  script?: string;      // JavaScript
  adminFields: [];      // Configuration form fields
  triggers?: [];        // When to show (page_load, exit_intent, etc.)
  active: boolean;
  global: boolean;      // Available to all sites
}
```

### Widget Instances

Widget instances are placements on specific sites/pages:

```typescript
interface WidgetInstance {
  id: string;
  widget_id: string;    // References widget definition
  site_id: string;
  page_id?: string;     // null = site-wide
  position: number;
  settings: {};         // Instance-specific overrides
  active: boolean;
}
```

---

## Adding Widgets via Admin UI

1. Go to **Admin > Articles > Edit Article**
2. Scroll to the **Widget Configuration** section
3. Click **Add Widget**
4. Select widget type and position
5. Configure widget settings
6. Save the article

---

## Adding Widgets Programmatically

```typescript
import { createQueries } from '@/lib/db-enhanced';

const queries = createQueries();

// Update article with widget config
await queries.articleQueries.update(articleId, {
  ...articleData,
  widget_config: [
    {
      type: 'email-capture',
      position: 'mid-content',
      settings: {
        title: 'Join Our Newsletter',
        button_text: 'Subscribe'
      }
    }
  ]
});
```

---

## Widget Rendering

Widgets are rendered server-side when the article is displayed:

```typescript
// In article page component
import { renderArticleWidgets } from '@/components/article/widget-renderer';

const content = renderArticleWidgets(article.content, article.widget_config);
```

The renderer:
1. Parses the article content
2. Identifies widget insertion points
3. Renders each widget with its settings
4. Returns the combined HTML

---

## Creating Custom Widgets

To add a new widget type:

1. **Define the widget** in `src/lib/widget-registry.ts`:

```typescript
await widgetRegistry.registerWidget({
  id: 'my-widget',
  name: 'My Widget',
  description: 'Does something cool',
  category: 'content',
  version: '1.0.0',
  template: `
    <div class="my-widget">
      <h3>{{title}}</h3>
      <p>{{description}}</p>
    </div>
  `,
  styles: `
    .my-widget { padding: 1rem; background: #f5f5f5; }
  `,
  adminFields: [
    { key: 'title', label: 'Title', type: 'text', required: true },
    { key: 'description', label: 'Description', type: 'textarea', required: false }
  ],
  active: true,
  global: true
});
```

2. **Add widget renderer** in `src/components/article/widgets/`:

```typescript
// MyWidget.tsx
export function MyWidget({ settings }: { settings: MyWidgetSettings }) {
  return (
    <div className="my-widget">
      <h3>{settings.title}</h3>
      <p>{settings.description}</p>
    </div>
  );
}
```

3. **Register in widget map** in the article renderer.

---

## Best Practices

1. **Don't overload articles** - 2-3 widgets per article is usually enough
2. **Match position to content** - Put email capture after valuable content
3. **Test on mobile** - Widgets should be responsive
4. **Use consistent styling** - Match your site's brand
5. **A/B test** - Try different headlines and positions

---

## CTA Link Tracking Requirements (MANDATORY)

**All widgets with external CTA links MUST use the `TrackedLink` component.**

This ensures:
- Meta Pixel `InitiateCheckout` events fire on external clicks
- UTM parameters are automatically appended (utm_source = site name)
- fbclid and FB cookies pass through for cross-domain tracking
- Internal/anchor links are NOT tracked (only external URLs)
- Smooth scrolling works for anchor links (`#widget-id`)

### Using TrackedLink

```typescript
import TrackedLink from '@/components/TrackedLink';

// In your widget component:
<TrackedLink
  href={ctaUrl}
  widgetType="your-widget-type"  // REQUIRED - e.g., 'shop-now', 'product-card'
  widgetName={productName}        // Human-readable name for analytics
  className="your-styles"
  target="_blank"  // Optional: '_self' (default) or '_blank'
>
  Shop Now
</TrackedLink>
```

### What TrackedLink Handles Automatically

| URL Type | Tracking | Behavior |
|----------|----------|----------|
| External (`https://...`) | ✅ Fires InitiateCheckout + UTM params | Normal navigation |
| Anchor (`#section-id`) | ❌ No tracking | Smooth scroll to element |
| Internal (`/articles/...`) | ❌ No tracking | Normal navigation |
| mailto/tel | ❌ No tracking | Normal navigation |

### Required Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `href` | string | Yes | The URL (external, internal, or anchor) |
| `widgetType` | string | Yes | Widget category for analytics |
| `widgetName` | string | No | Human-readable name (defaults to widgetType) |
| `widgetId` | string | No | Unique instance ID for per-widget tracking |
| `value` | number | No | Checkout value for Meta Pixel |
| `skipTracking` | boolean | No | Set true to disable tracking entirely |

### DO NOT Use Raw `<a>` Tags for CTAs

❌ **Wrong:**
```typescript
<a href={ctaUrl} target="_blank" className="btn">
  Shop Now
</a>
```

✅ **Correct:**
```typescript
<TrackedLink
  href={ctaUrl}
  widgetType="product-card"
  widgetName="Hormone Reset Kit"
  className="btn"
  target="_blank"
>
  Shop Now
</TrackedLink>
```

### For Non-Link Elements (Buttons, Custom Components)

Use the `useTrackedClick` hook:

```typescript
import { useTrackedClick } from '@/components/TrackedLink';

function MyWidget() {
  const { trackClick, getTrackedUrl, isExternalUrl } = useTrackedClick();

  const handleClick = () => {
    trackClick({
      url: ctaUrl,
      widgetType: 'custom-modal',
      widgetName: 'Newsletter Popup'
    });
    window.open(getTrackedUrl(ctaUrl), '_blank');
  };

  return <button onClick={handleClick}>Shop Now</button>;
}
```
