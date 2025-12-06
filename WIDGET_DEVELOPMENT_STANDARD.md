# Widget Development Standard

## Overview

This document defines the mandatory requirements for creating new widgets in the Kiala platform. All widgets MUST follow these standards to ensure consistency, maintainability, and a seamless admin experience.

---

## Widget Creation Checklist

When creating a new widget, Claude MUST verify each of these requirements:

### 1. Widget Registry (widget-library.ts)

- [ ] Widget type added to `WIDGET_TYPES` array
- [ ] Proper category assignment (Content, Social Proof, Commerce, Lead Gen, Doctor, Page Layout)
- [ ] Clear, descriptive name (e.g., "Timeline or Sequence" not just "Timeline")
- [ ] Helpful description explaining what the widget does
- [ ] Appropriate Lucide icon selected

### 2. Component File (src/widgets/[WidgetName].tsx)

- [ ] File follows PascalCase naming convention matching widget type
- [ ] 'use client' directive at top
- [ ] TypeScript interface for all props
- [ ] Default values for all optional props
- [ ] Safety checks for array props (e.g., `const safeItems = Array.isArray(items) ? items : []`)
- [ ] useTracking hook imported and used for CTA URLs
- [ ] Responsive design (mobile-first with md: breakpoints)

### 3. Style System

Every widget MUST support multiple visual styles:
- [ ] `style` prop with at least 2-3 options (e.g., 'default', 'minimal', 'featured')
- [ ] Styles use on-brand colors (pink/purple/primary gradients, NOT yellow/amber)
- [ ] Hover states with smooth transitions
- [ ] Shadow and elevation on interactive elements
- [ ] Consistent border-radius (rounded-xl or rounded-2xl)

### 4. Admin Config Panel (WidgetEditor.tsx)

**CRITICAL**: Every editable field in the widget MUST have a corresponding admin input.

Required sections:
- [ ] Style selector dropdown (if multiple styles exist)
- [ ] All text fields editable (headlines, subheadings, descriptions)
- [ ] All array items editable with Add/Remove buttons
- [ ] Image upload fields use consistent `renderImageUpload()` helper
- [ ] CTA section with:
  - [ ] Show CTA toggle
  - [ ] CTA Text input
  - [ ] CTA Type selector (External URL / Anchor to Widget)
  - [ ] URL input (conditionally shown based on type)
  - [ ] Target selector for external links (_self / _blank)
  - [ ] Widget anchor selector (if anchor type)

### 5. Renderer Integration

- [ ] Added to ArticleTemplate.tsx switch statement (for article widgets)
- [ ] Added to PageWidgetRenderer.tsx switch statement (for page widgets)
- [ ] Props correctly mapped from widget.config
- [ ] getCtaUrl() helper used for CTA URLs
- [ ] Wrapped in consistent container div with `className="my-8"`

### 6. Default Config (WidgetEditor.tsx defaultConfigs)

- [ ] Sensible default values for all fields
- [ ] Example content that demonstrates widget purpose
- [ ] Arrays initialized with at least 2-3 example items
- [ ] showCta defaults to false
- [ ] style defaults to 'default'

---

## Standard Props Interface

All widgets should include these common props:

```typescript
interface WidgetProps {
  // Content
  headline?: string;
  subheading?: string;

  // Style
  style?: 'default' | 'minimal' | 'featured' | string;

  // CTA (if applicable)
  showCta?: boolean;
  ctaText?: string;
  ctaUrl?: string;
  ctaType?: 'external' | 'anchor';
  target?: '_self' | '_blank';
}
```

---

## Color Palette

Use these colors consistently:

### Primary Gradients
- `from-primary-500 to-purple-500` - Main brand gradient
- `from-pink-500 to-purple-500` - Alternative brand gradient
- `from-rose-500 to-pink-500` - Accent gradient

### Backgrounds
- `from-pink-50 via-purple-50 to-indigo-50` - Light gradient bg
- `from-gray-50 to-slate-50` - Neutral light bg
- `bg-white` - Card backgrounds

### AVOID
- Yellow/amber tones (amber-*, yellow-*)
- Orange tones except for urgent warnings
- Pure black backgrounds

---

## Widget Development Prompt Template

When user requests a new widget, Claude should ask:

1. **Purpose**: "What is the primary goal of this widget?"
2. **Content Fields**: "What text/data fields should be editable?"
3. **Visual Styles**: "Do you want multiple style options (e.g., minimal, featured)?"
4. **CTA**: "Should this widget have a call-to-action button?"
5. **Category**: "Which category does this belong to? (Content, Social Proof, Commerce, Lead Gen, Doctor, Page Layout)"

---

## File Locations

| Component | Location |
|-----------|----------|
| Widget Registry | `src/lib/widget-library.ts` |
| Widget Components | `src/widgets/[WidgetName].tsx` |
| Admin Editor | `src/components/admin/WidgetEditor.tsx` |
| Article Renderer | `src/components/ArticleTemplate.tsx` |
| Page Renderer | `src/components/PageWidgetRenderer.tsx` |

---

## Legacy Widget Handling

For widgets created before this standard:

1. Add type to `LEGACY_TYPE_ALIASES` in widget-library.ts
2. Map to canonical widget type
3. Both types should be handled in renderer switch statements

---

## Governance Notes

- Global widget library is source of truth
- Sites can customize category order but not remove global widgets
- Custom site-specific categories can be created
- All widgets must pass checklist before deployment
