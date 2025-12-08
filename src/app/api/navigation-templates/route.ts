import { NextRequest, NextResponse } from 'next/server';
import { createQueries } from '@/lib/db-enhanced';
import { nanoid } from 'nanoid';

// Navigation template config type
export interface NavigationTemplateConfig {
  // Feature toggles
  showNavLinks: boolean;
  showAudioTrack: boolean;
  showSocialProof: boolean;
  showLogo: boolean;
  showCta: boolean;

  // Audio track settings
  audioTrack?: {
    enabled: boolean;
    message: string;
    url?: string;
  };

  // Social proof settings
  socialProof?: {
    enabled: boolean;
    message: string;
    count?: number;
  };

  // CTA settings
  cta?: {
    enabled: boolean;
    text: string;
    url: string;
    style: 'primary' | 'secondary' | 'ghost';
  };

  // Styling
  style?: {
    backgroundColor?: string;
    textColor?: string;
    position?: 'fixed' | 'sticky' | 'static';
  };
}

// GET - Fetch all navigation templates or filter by type
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const baseType = searchParams.get('baseType');
    const systemOnly = searchParams.get('systemOnly') === 'true';
    const tenantId = request.headers.get('X-Tenant-Id') || undefined;
    const queries = createQueries(tenantId);

    let templates;

    if (systemOnly) {
      templates = await queries.navigationTemplateQueries.getSystemTemplates();
    } else if (baseType) {
      templates = await queries.navigationTemplateQueries.getByBaseType(baseType);
    } else {
      templates = await queries.navigationTemplateQueries.getAll();
    }

    // Parse JSON config for each template
    const parsedTemplates = (templates || []).map((t: any) => ({
      ...t,
      config: typeof t.config === 'string' ? JSON.parse(t.config) : t.config,
      is_system: Boolean(t.is_system)
    }));

    return NextResponse.json({ templates: parsedTemplates });
  } catch (error: any) {
    console.error('Error fetching navigation templates:', error);
    return NextResponse.json({
      error: 'Failed to fetch navigation templates',
      details: error?.message || String(error)
    }, { status: 500 });
  }
}

// POST - Create a new navigation template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tenantId = request.headers.get('X-Tenant-Id') || undefined;
    const queries = createQueries(tenantId);

    const { name, description, baseType, config, isSystem = false } = body;

    if (!name || !baseType || !config) {
      return NextResponse.json({
        error: 'Missing required fields: name, baseType, and config are required'
      }, { status: 400 });
    }

    // Validate baseType
    const validBaseTypes = ['global', 'direct-response', 'minimal'];
    if (!validBaseTypes.includes(baseType)) {
      return NextResponse.json({
        error: `Invalid baseType. Must be one of: ${validBaseTypes.join(', ')}`
      }, { status: 400 });
    }

    const id = nanoid();

    await queries.navigationTemplateQueries.create({
      id,
      name,
      description,
      baseType,
      isSystem,
      config
    });

    const template = await queries.navigationTemplateQueries.getById(id);

    return NextResponse.json({
      template: {
        ...template,
        config: typeof template?.config === 'string' ? JSON.parse(template.config) : template?.config,
        is_system: Boolean(template?.is_system)
      }
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating navigation template:', error);
    return NextResponse.json({
      error: 'Failed to create navigation template',
      details: error?.message || String(error)
    }, { status: 500 });
  }
}
