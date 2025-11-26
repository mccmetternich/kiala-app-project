import Database from 'better-sqlite3';
import { join } from 'path';

const dbPath = join(process.cwd(), 'data', 'kiala.db');

export interface WidgetDefinition {
  id: string;
  name: string;
  description: string;
  category: 'conversion' | 'content' | 'social' | 'media' | 'analytics';
  version: string;
  
  // Core configuration
  template: string;           // HTML template with {{variable}} placeholders
  styles?: string;           // CSS styles for the widget
  script?: string;           // JavaScript for interactivity
  
  // Admin interface configuration
  adminFields: WidgetField[];
  
  // Behavior configuration
  triggers?: WidgetTrigger[];
  integrations?: WidgetIntegration[];
  
  // Metadata
  active: boolean;
  global: boolean;          // Available to all sites vs site-specific
  created_at: string;
  updated_at: string;
}

export interface WidgetField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'checkbox' | 'color' | 'image' | 'url';
  required: boolean;
  defaultValue?: any;
  options?: { value: string; label: string }[];
  placeholder?: string;
  description?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface WidgetTrigger {
  event: 'page_load' | 'scroll' | 'time_delay' | 'exit_intent' | 'click';
  condition?: string;       // JavaScript condition
  delay?: number;           // Delay in milliseconds
}

export interface WidgetIntegration {
  type: 'email_capture' | 'analytics' | 'payment' | 'social_share';
  config: Record<string, any>;
}

export interface WidgetInstance {
  id: string;
  widget_id: string;
  site_id: string;
  page_id?: string;         // null = site-wide
  position: number;
  settings: Record<string, any>;
  active: boolean;
  created_at: string;
  updated_at: string;
}

class WidgetRegistry {
  private db: Database.Database;
  private widgetCache: Map<string, WidgetDefinition> = new Map();
  private lastCacheUpdate = 0;
  private CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.db = new Database(dbPath);
    this.initTables();
  }

  private initTables() {
    // Widget definitions table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS widget_definitions (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        version TEXT NOT NULL DEFAULT '1.0.0',
        template TEXT NOT NULL,
        styles TEXT,
        script TEXT,
        admin_fields TEXT NOT NULL, -- JSON
        triggers TEXT,              -- JSON
        integrations TEXT,          -- JSON
        active BOOLEAN DEFAULT 1,
        global BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Widget instances table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS widget_instances (
        id TEXT PRIMARY KEY,
        widget_id TEXT NOT NULL,
        site_id TEXT NOT NULL,
        page_id TEXT,
        position INTEGER NOT NULL DEFAULT 0,
        settings TEXT NOT NULL DEFAULT '{}', -- JSON
        active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (widget_id) REFERENCES widget_definitions(id)
      )
    `);

    // Create indexes
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_widget_instances_site ON widget_instances(site_id);
      CREATE INDEX IF NOT EXISTS idx_widget_instances_page ON widget_instances(page_id);
      CREATE INDEX IF NOT EXISTS idx_widget_definitions_category ON widget_definitions(category);
    `);
  }

  /**
   * Register a new widget definition
   */
  async registerWidget(definition: Omit<WidgetDefinition, 'created_at' | 'updated_at'>): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO widget_definitions (
        id, name, description, category, version, template, styles, script,
        admin_fields, triggers, integrations, active, global, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    stmt.run(
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
    );

    // Invalidate cache
    this.widgetCache.clear();
    this.lastCacheUpdate = 0;
  }

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

    const rows = this.db.prepare(query).all(...params) as any[];
    
    return rows.map(row => ({
      ...row,
      adminFields: JSON.parse(row.admin_fields),
      triggers: row.triggers ? JSON.parse(row.triggers) : undefined,
      integrations: row.integrations ? JSON.parse(row.integrations) : undefined,
      active: Boolean(row.active),
      global: Boolean(row.global)
    }));
  }

  /**
   * Get widget definition by ID with caching
   */
  async getWidgetDefinition(widgetId: string): Promise<WidgetDefinition | null> {
    const now = Date.now();
    
    // Check cache first
    if (this.widgetCache.has(widgetId) && (now - this.lastCacheUpdate) < this.CACHE_TTL) {
      return this.widgetCache.get(widgetId) || null;
    }

    const row = this.db.prepare(`
      SELECT * FROM widget_definitions WHERE id = ? AND active = 1
    `).get(widgetId) as any;

    if (!row) return null;

    const definition: WidgetDefinition = {
      ...row,
      adminFields: JSON.parse(row.admin_fields),
      triggers: row.triggers ? JSON.parse(row.triggers) : undefined,
      integrations: row.integrations ? JSON.parse(row.integrations) : undefined,
      active: Boolean(row.active),
      global: Boolean(row.global)
    };

    // Cache the result
    this.widgetCache.set(widgetId, definition);
    if (this.widgetCache.size === 1) {
      this.lastCacheUpdate = now;
    }

    return definition;
  }

  /**
   * Create widget instance for a site
   */
  async createWidgetInstance(siteId: string, widgetId: string, pageId: string | null, settings: Record<string, any> = {}): Promise<string> {
    const instanceId = `instance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Get next position for this site/page
    const maxPosition = this.db.prepare(`
      SELECT MAX(position) as max_pos FROM widget_instances 
      WHERE site_id = ? AND page_id ${pageId ? '= ?' : 'IS NULL'}
    `).get(siteId, ...(pageId ? [pageId] : [])) as any;

    const position = (maxPosition?.max_pos || 0) + 1;

    const stmt = this.db.prepare(`
      INSERT INTO widget_instances (id, widget_id, site_id, page_id, position, settings)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(instanceId, widgetId, siteId, pageId, position, JSON.stringify(settings));
    
    return instanceId;
  }

  /**
   * Get widget instances for a site/page
   */
  async getWidgetInstances(siteId: string, pageId?: string): Promise<WidgetInstance[]> {
    return [];
  }

  /**
   * Render widget instance to HTML
   */
  async renderWidget(instanceId: string): Promise<string> {
    const instanceQuery = `
      SELECT wi.*, wd.template, wd.styles, wd.script
      FROM widget_instances wi
      JOIN widget_definitions wd ON wi.widget_id = wd.id
      WHERE wi.id = ? AND wi.active = 1 AND wd.active = 1
    `;

    const instance = this.db.prepare(instanceQuery).get(instanceId) as any;
    
    if (!instance) {
      return `<!-- Widget instance ${instanceId} not found -->`;
    }

    const settings = JSON.parse(instance.settings);
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
  }

  /**
   * Update widget instance settings
   */
  async updateWidgetInstance(instanceId: string, settings: Record<string, any>): Promise<void> {
    const stmt = this.db.prepare(`
      UPDATE widget_instances 
      SET settings = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);

    stmt.run(JSON.stringify(settings), instanceId);
  }

  /**
   * Delete widget instance
   */
  async deleteWidgetInstance(instanceId: string): Promise<void> {
    const stmt = this.db.prepare('DELETE FROM widget_instances WHERE id = ?');
    stmt.run(instanceId);
  }
}

// Singleton instance
export const widgetRegistry = new WidgetRegistry();

/**
 * Initialize built-in widget definitions
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
        
        // Submit to API
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

  console.log('✅ Built-in widgets initialized');
}

// Auto-initialize on import
if (typeof window === 'undefined') { // Server-side only
  initializeBuiltInWidgets();
}