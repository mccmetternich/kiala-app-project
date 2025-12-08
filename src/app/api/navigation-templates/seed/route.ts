import { NextRequest, NextResponse } from 'next/server';
import { createQueries } from '@/lib/db-enhanced';

// System navigation templates with their default configurations
const SYSTEM_TEMPLATES = [
  {
    id: 'nav-global',
    name: 'Full Navigation',
    description: 'Complete navigation with all links, audio track, and social proof',
    baseType: 'global',
    isSystem: true,
    config: {
      showNavLinks: true,
      showAudioTrack: true,
      showSocialProof: true,
      showLogo: true,
      showCta: true,
      audioTrack: {
        enabled: true,
        message: 'Listen to article',
        url: ''
      },
      socialProof: {
        enabled: true,
        message: 'readers this week',
        count: 0
      },
      cta: {
        enabled: true,
        text: 'Get Started',
        url: '#',
        style: 'primary'
      },
      style: {
        backgroundColor: 'transparent',
        textColor: 'inherit',
        position: 'sticky'
      }
    }
  },
  {
    id: 'nav-direct-response',
    name: 'Direct Response',
    description: 'Minimal distraction - logo and social proof only, no nav links',
    baseType: 'direct-response',
    isSystem: true,
    config: {
      showNavLinks: false,
      showAudioTrack: true,
      showSocialProof: true,
      showLogo: true,
      showCta: false,
      audioTrack: {
        enabled: true,
        message: 'Listen to article',
        url: ''
      },
      socialProof: {
        enabled: true,
        message: 'readers this week',
        count: 0
      },
      cta: {
        enabled: false,
        text: '',
        url: '',
        style: 'primary'
      },
      style: {
        backgroundColor: 'transparent',
        textColor: 'inherit',
        position: 'sticky'
      }
    }
  },
  {
    id: 'nav-minimal',
    name: 'Logo Only',
    description: 'Ultra-minimal - just the logo, maximum focus on content',
    baseType: 'minimal',
    isSystem: true,
    config: {
      showNavLinks: false,
      showAudioTrack: false,
      showSocialProof: false,
      showLogo: true,
      showCta: false,
      audioTrack: {
        enabled: false,
        message: '',
        url: ''
      },
      socialProof: {
        enabled: false,
        message: '',
        count: 0
      },
      cta: {
        enabled: false,
        text: '',
        url: '',
        style: 'primary'
      },
      style: {
        backgroundColor: 'transparent',
        textColor: 'inherit',
        position: 'sticky'
      }
    }
  },
  {
    id: 'nav-global-no-audio',
    name: 'Full Nav (No Audio)',
    description: 'Complete navigation without audio track',
    baseType: 'global',
    isSystem: true,
    config: {
      showNavLinks: true,
      showAudioTrack: false,
      showSocialProof: true,
      showLogo: true,
      showCta: true,
      audioTrack: {
        enabled: false,
        message: '',
        url: ''
      },
      socialProof: {
        enabled: true,
        message: 'readers this week',
        count: 0
      },
      cta: {
        enabled: true,
        text: 'Get Started',
        url: '#',
        style: 'primary'
      },
      style: {
        backgroundColor: 'transparent',
        textColor: 'inherit',
        position: 'sticky'
      }
    }
  },
  {
    id: 'nav-dr-no-audio',
    name: 'Direct Response (No Audio)',
    description: 'Direct response mode without audio track',
    baseType: 'direct-response',
    isSystem: true,
    config: {
      showNavLinks: false,
      showAudioTrack: false,
      showSocialProof: true,
      showLogo: true,
      showCta: false,
      audioTrack: {
        enabled: false,
        message: '',
        url: ''
      },
      socialProof: {
        enabled: true,
        message: 'readers this week',
        count: 0
      },
      cta: {
        enabled: false,
        text: '',
        url: '',
        style: 'primary'
      },
      style: {
        backgroundColor: 'transparent',
        textColor: 'inherit',
        position: 'sticky'
      }
    }
  }
];

// POST - Seed system navigation templates
export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get('X-Tenant-Id') || undefined;
    const queries = createQueries(tenantId);

    const results = {
      created: [] as string[],
      skipped: [] as string[],
      errors: [] as string[]
    };

    for (const template of SYSTEM_TEMPLATES) {
      try {
        // Check if template already exists
        const existing = await queries.navigationTemplateQueries.getById(template.id);

        if (existing) {
          results.skipped.push(template.id);
          continue;
        }

        await queries.navigationTemplateQueries.create({
          id: template.id,
          name: template.name,
          description: template.description,
          baseType: template.baseType,
          isSystem: template.isSystem,
          config: template.config
        });

        results.created.push(template.id);
      } catch (err: any) {
        results.errors.push(`${template.id}: ${err?.message || String(err)}`);
      }
    }

    return NextResponse.json({
      success: true,
      results,
      message: `Created ${results.created.length} templates, skipped ${results.skipped.length} existing, ${results.errors.length} errors`
    });
  } catch (error: any) {
    console.error('Error seeding navigation templates:', error);
    return NextResponse.json({
      error: 'Failed to seed navigation templates',
      details: error?.message || String(error)
    }, { status: 500 });
  }
}

// GET - Return the list of system templates (useful for debugging)
export async function GET() {
  return NextResponse.json({
    templates: SYSTEM_TEMPLATES.map(t => ({
      id: t.id,
      name: t.name,
      description: t.description,
      baseType: t.baseType
    }))
  });
}
