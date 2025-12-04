/**
 * Widget Registry Module
 *
 * Manages widget definitions (templates) and instances (placements).
 * Widgets are reusable UI components that can be placed on pages/articles.
 *
 * Key concepts:
 * - **Widget Definition**: A template with HTML, CSS, JS, and admin fields
 * - **Widget Instance**: A placement of a widget on a specific site/page
 * - **Admin Fields**: Configuration options shown in the admin UI
 *
 * Built-in widgets:
 * - `email-capture`: Email signup form with customizable messaging
 * - `exit-intent-popup`: Popup shown when user moves to leave page
 *
 * @module widget-registry
 *
 * @example
 * ```typescript
 * import { widgetRegistry } from '@/lib/widget-registry';
 *
 * // Get all active widget definitions
 * const widgets = await widgetRegistry.getWidgetDefinitions();
 *
 * // Create an instance on a site
 * const instanceId = await widgetRegistry.createWidgetInstance(
 *   siteId,
 *   'email-capture',
 *   pageId,
 *   { title: 'Join Our Newsletter' }
 * );
 *
 * // Render widget to HTML
 * const html = await widgetRegistry.renderWidget(instanceId);
 * ```
 */

import db from './db-enhanced';

/**
 * Widget Definition - The template for a widget type.
 * Stored in widget_definitions table.
 */
export interface WidgetDefinition {
  /** Unique identifier (e.g., 'email-capture', 'exit-intent-popup') */
  id: string;
  /** Display name shown in admin UI */
  name: string;
  /** Description of what the widget does */
  description: string;
  /** Widget category for organization */
  category: 'conversion' | 'content' | 'social' | 'media' | 'analytics';
  /** Semantic version (e.g., '1.0.0') */
  version: string;

  /** HTML template with {{variable}} placeholders for settings */
  template: string;
  /** CSS styles scoped to the widget */
  styles?: string;
  /** JavaScript for interactivity (runs in browser) */
  script?: string;

  /** Configuration fields shown in admin UI */
  adminFields: WidgetField[];

  /** When to show the widget (page_load, scroll, exit_intent, etc.) */
  triggers?: WidgetTrigger[];
  /** Third-party integrations (email capture, analytics, etc.) */
  integrations?: WidgetIntegration[];

  /** Whether this widget is available for use */
  active: boolean;
  /** If true, available to all sites; if false, site-specific */
  global: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Widget Field - A configuration option for the admin UI.
 * These fields appear in the widget settings panel.
 */
export interface WidgetField {
  /** Field key used in template placeholders (e.g., 'title' -> {{title}}) */
  key: string;
  /** Label shown in admin UI */
  label: string;
  /** Input type for the field */
  type: 'text' | 'textarea' | 'number' | 'select' | 'checkbox' | 'color' | 'image' | 'url';
  /** Whether the field must have a value */
  required: boolean;
  /** Default value when creating new instance */
  defaultValue?: any;
  /** Options for select type fields */
  options?: { value: string; label: string }[];
  /** Placeholder text for input */
  placeholder?: string;
  /** Help text shown below field */
  description?: string;
  /** Validation rules */
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

/**
 * Widget Trigger - When to display the widget.
 */
export interface WidgetTrigger {
  /** Event that triggers the widget */
  event: 'page_load' | 'scroll' | 'time_delay' | 'exit_intent' | 'click';
  /** JavaScript condition to evaluate */
  condition?: string;
  /** Delay in milliseconds before showing */
  delay?: number;
}

/**
 * Widget Integration - Third-party service integration.
 */
export interface WidgetIntegration {
  /** Type of integration */
  type: 'email_capture' | 'analytics' | 'payment' | 'social_share';
  /** Integration-specific configuration */
  config: Record<string, any>;
}

/**
 * Widget Instance - A placed widget on a specific site/page.
 * Stored in widget_instances table.
 */
export interface WidgetInstance {
  /** Unique instance ID */
  id: string;
  /** Reference to widget definition ID */
  widget_id: string;
  /** Site this instance belongs to */
  site_id: string;
  /** Page ID (null = site-wide, shows on all pages) */
  page_id?: string;
  /** Display order position */
  position: number;
  /** Instance-specific settings (overrides definition defaults) */
  settings: Record<string, any>;
  /** Whether this instance is active */
  active: boolean;
  created_at: string;
  updated_at: string;
}

// Helper functions
async function execute(sql: string, args: any[] = []) {
  return db.execute({ sql, args });
}

async function queryOne(sql: string, args: any[] = []): Promise<any> {
  const result = await db.execute({ sql, args });
  return result.rows[0] || null;
}

async function queryAll(sql: string, args: any[] = []): Promise<any[]> {
  const result = await db.execute({ sql, args });
  return result.rows as any[];
}

// Note: Widget tables are now created in db-enhanced.ts initDb()
// No lazy initialization needed - tables exist after migration

// In-memory cache for widget definitions
const widgetCache: Map<string, WidgetDefinition> = new Map();
let lastCacheUpdate = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const widgetRegistry = {
  /**
   * Register a new widget definition
   */
  async registerWidget(definition: Omit<WidgetDefinition, 'created_at' | 'updated_at'>): Promise<void> {

    await execute(`
      INSERT OR REPLACE INTO widget_definitions (
        id, name, description, category, version, template, styles, script,
        admin_fields, triggers, integrations, active, global, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `, [
      definition.id,
      definition.name,
      definition.description,
      definition.category,
      definition.version,
      definition.template,
      definition.styles || null,
      definition.script || null,
      JSON.stringify(definition.adminFields),
      definition.triggers ? JSON.stringify(definition.triggers) : null,
      definition.integrations ? JSON.stringify(definition.integrations) : null,
      definition.active ? 1 : 0,
      definition.global ? 1 : 0
    ]);

    // Invalidate cache
    widgetCache.clear();
    lastCacheUpdate = 0;
  },

  /**
   * Get all available widget definitions
   */
  async getWidgetDefinitions(category?: string): Promise<WidgetDefinition[]> {

    let query = 'SELECT * FROM widget_definitions WHERE active = 1';
    const params: any[] = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY name ASC';

    const rows = await queryAll(query, params);

    return rows.map(row => ({
      ...row,
      adminFields: JSON.parse(row.admin_fields || '[]'),
      triggers: row.triggers ? JSON.parse(row.triggers) : undefined,
      integrations: row.integrations ? JSON.parse(row.integrations) : undefined,
      active: Boolean(row.active),
      global: Boolean(row.global)
    }));
  },

  /**
   * Get widget definition by ID with caching
   */
  async getWidgetDefinition(widgetId: string): Promise<WidgetDefinition | null> {

    const now = Date.now();

    // Check cache first
    if (widgetCache.has(widgetId) && (now - lastCacheUpdate) < CACHE_TTL) {
      return widgetCache.get(widgetId) || null;
    }

    const row = await queryOne(`
      SELECT * FROM widget_definitions WHERE id = ? AND active = 1
    `, [widgetId]);

    if (!row) return null;

    const definition: WidgetDefinition = {
      ...row,
      adminFields: JSON.parse(row.admin_fields || '[]'),
      triggers: row.triggers ? JSON.parse(row.triggers) : undefined,
      integrations: row.integrations ? JSON.parse(row.integrations) : undefined,
      active: Boolean(row.active),
      global: Boolean(row.global)
    };

    // Cache the result
    widgetCache.set(widgetId, definition);
    if (widgetCache.size === 1) {
      lastCacheUpdate = now;
    }

    return definition;
  },

  /**
   * Create widget instance for a site
   */
  async createWidgetInstance(siteId: string, widgetId: string, pageId: string | null, settings: Record<string, any> = {}): Promise<string> {

    const instanceId = `instance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Get next position for this site/page
    let maxPosQuery = 'SELECT MAX(position) as max_pos FROM widget_instances WHERE site_id = ?';
    const params: any[] = [siteId];

    if (pageId) {
      maxPosQuery += ' AND page_id = ?';
      params.push(pageId);
    } else {
      maxPosQuery += ' AND page_id IS NULL';
    }

    const maxPosition = await queryOne(maxPosQuery, params);
    const position = (maxPosition?.max_pos || 0) + 1;

    await execute(`
      INSERT INTO widget_instances (id, widget_id, site_id, page_id, position, settings)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [instanceId, widgetId, siteId, pageId, position, JSON.stringify(settings)]);

    return instanceId;
  },

  /**
   * Get widget instances for a site/page
   */
  async getWidgetInstances(siteId: string, pageId?: string): Promise<WidgetInstance[]> {

    let query = 'SELECT * FROM widget_instances WHERE site_id = ? AND active = 1';
    const params: any[] = [siteId];

    if (pageId) {
      query += ' AND (page_id = ? OR page_id IS NULL)';
      params.push(pageId);
    }

    query += ' ORDER BY position ASC';

    const rows = await queryAll(query, params);

    return rows.map(row => ({
      ...row,
      settings: JSON.parse(row.settings || '{}'),
      active: Boolean(row.active)
    }));
  },

  /**
   * Render widget instance to HTML
   */
  async renderWidget(instanceId: string): Promise<string> {

    const instance = await queryOne(`
      SELECT wi.*, wd.template, wd.styles, wd.script
      FROM widget_instances wi
      JOIN widget_definitions wd ON wi.widget_id = wd.id
      WHERE wi.id = ? AND wi.active = 1 AND wd.active = 1
    `, [instanceId]);

    if (!instance) {
      return `<!-- Widget instance ${instanceId} not found -->`;
    }

    const settings = JSON.parse(instance.settings || '{}');
    let html = instance.template;

    // Replace template variables
    for (const [key, value] of Object.entries(settings)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      html = html.replace(regex, String(value || ''));
    }

    // Add styles if present
    if (instance.styles) {
      html = `<style>${instance.styles}</style>\n${html}`;
    }

    // Add script if present
    if (instance.script) {
      html = `${html}\n<script>${instance.script}</script>`;
    }

    return html;
  },

  /**
   * Update widget instance settings
   */
  async updateWidgetInstance(instanceId: string, settings: Record<string, any>): Promise<void> {

    await execute(`
      UPDATE widget_instances
      SET settings = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [JSON.stringify(settings), instanceId]);
  },

  /**
   * Delete widget instance
   */
  async deleteWidgetInstance(instanceId: string): Promise<void> {

    await execute('DELETE FROM widget_instances WHERE id = ?', [instanceId]);
  }
};

/**
 * Registers the built-in widget definitions.
 * Call this after database initialization to ensure widgets are available.
 *
 * Built-in widgets:
 * - **email-capture**: Email signup form with customizable title, description,
 *   button text, and styling. Submits to /api/emails endpoint.
 * - **exit-intent-popup**: Modal shown when user moves mouse toward browser
 *   chrome (about to leave). Captures emails with urgency messaging.
 *
 * @example
 * ```typescript
 * // Usually called from /api/admin/migrate or initialization
 * await initializeBuiltInWidgets();
 * ```
 */
export async function initializeBuiltInWidgets() {
  // Email Capture Widget
  await widgetRegistry.registerWidget({
    id: 'email-capture',
    name: 'Email Capture',
    description: 'Collect email addresses with customizable lead magnets',
    category: 'conversion',
    version: '1.0.0',
    template: `
      <div class="email-capture-widget" style="{{container_styles}}">
        <h3>{{title}}</h3>
        <p>{{description}}</p>
        <form class="email-form" onsubmit="submitEmail(event)">
          <input type="email" placeholder="{{email_placeholder}}" required>
          <button type="submit" style="{{button_styles}}">{{button_text}}</button>
        </form>
        <p class="privacy-text">{{privacy_text}}</p>
      </div>
    `,
    styles: `
      .email-capture-widget {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 2rem;
        border-radius: 12px;
        color: white;
        text-align: center;
        max-width: 500px;
        margin: 2rem auto;
      }
      .email-form input {
        width: 100%;
        padding: 12px;
        border: none;
        border-radius: 6px;
        margin-bottom: 1rem;
      }
      .privacy-text {
        font-size: 0.8rem;
        opacity: 0.8;
      }
    `,
    script: `
      function submitEmail(event) {
        event.preventDefault();
        const email = event.target.querySelector('input[type="email"]').value;

        fetch('/api/emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, source: 'email-capture-widget' })
        }).then(() => {
          alert('Thanks for signing up!');
          event.target.reset();
        });
      }
    `,
    adminFields: [
      { key: 'title', label: 'Title', type: 'text', required: true, defaultValue: 'Get Free Access' },
      { key: 'description', label: 'Description', type: 'textarea', required: true, defaultValue: 'Join thousands getting our free resources!' },
      { key: 'button_text', label: 'Button Text', type: 'text', required: true, defaultValue: 'Subscribe Now' },
      { key: 'email_placeholder', label: 'Email Placeholder', type: 'text', required: false, defaultValue: 'Enter your email address' },
      { key: 'privacy_text', label: 'Privacy Text', type: 'text', required: false, defaultValue: 'No spam, ever. Unsubscribe anytime.' },
      { key: 'button_styles', label: 'Button Styles', type: 'text', required: false, defaultValue: 'background: #ff6b6b; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer;' },
      { key: 'container_styles', label: 'Container Styles', type: 'text', required: false, defaultValue: '' }
    ],
    triggers: [
      { event: 'page_load', delay: 2000 }
    ],
    integrations: [
      { type: 'email_capture', config: { list: 'main' } }
    ],
    active: true,
    global: true
  });

  // Exit Intent Popup
  await widgetRegistry.registerWidget({
    id: 'exit-intent-popup',
    name: 'Exit Intent Popup',
    description: 'Show popup when user is about to leave the page',
    category: 'conversion',
    version: '1.0.0',
    template: `
      <div id="exit-popup" class="exit-popup-overlay" style="display: none;">
        <div class="exit-popup-content">
          <button class="close-btn" onclick="closeExitPopup()">&times;</button>
          <h2>{{headline}}</h2>
          <p>{{message}}</p>
          <form onsubmit="submitExitEmail(event)">
            <input type="email" placeholder="{{email_placeholder}}" required>
            <button type="submit">{{button_text}}</button>
          </form>
        </div>
      </div>
    `,
    styles: `
      .exit-popup-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .exit-popup-content {
        background: white;
        padding: 2rem;
        border-radius: 12px;
        max-width: 500px;
        position: relative;
        text-align: center;
      }
      .close-btn {
        position: absolute;
        top: 10px;
        right: 15px;
        border: none;
        background: none;
        font-size: 24px;
        cursor: pointer;
      }
    `,
    script: `
      let exitIntentShown = false;

      document.addEventListener('mouseleave', function(e) {
        if (e.clientY <= 0 && !exitIntentShown) {
          document.getElementById('exit-popup').style.display = 'flex';
          exitIntentShown = true;
        }
      });

      function closeExitPopup() {
        document.getElementById('exit-popup').style.display = 'none';
      }

      function submitExitEmail(event) {
        event.preventDefault();
        const email = event.target.querySelector('input[type="email"]').value;

        fetch('/api/emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, source: 'exit-intent-popup' })
        }).then(() => {
          closeExitPopup();
          alert('Thanks! Check your email for your free resource.');
        });
      }
    `,
    adminFields: [
      { key: 'headline', label: 'Headline', type: 'text', required: true, defaultValue: 'Wait! Before You Go...' },
      { key: 'message', label: 'Message', type: 'textarea', required: true, defaultValue: 'Get our free guide delivered to your inbox!' },
      { key: 'button_text', label: 'Button Text', type: 'text', required: true, defaultValue: 'Get Free Guide' },
      { key: 'email_placeholder', label: 'Email Placeholder', type: 'text', required: false, defaultValue: 'Your email address' }
    ],
    triggers: [
      { event: 'exit_intent' }
    ],
    integrations: [
      { type: 'email_capture', config: { list: 'exit-intent' } }
    ],
    active: true,
    global: true
  });

}
