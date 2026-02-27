'use client';

import { ReactNode, useMemo } from 'react';
import { Site } from '@/types';

interface ThemeProviderProps {
  children: ReactNode;
  site: Site;
}

// Color manipulation utilities
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

function lighten(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const factor = percent / 100;
  return rgbToHex(
    rgb.r + (255 - rgb.r) * factor,
    rgb.g + (255 - rgb.g) * factor,
    rgb.b + (255 - rgb.b) * factor
  );
}

function darken(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const factor = 1 - percent / 100;
  return rgbToHex(
    rgb.r * factor,
    rgb.g * factor,
    rgb.b * factor
  );
}

// Generate a full color palette from a single base color
function generatePalette(baseColor: string): Record<string, string> {
  return {
    50: lighten(baseColor, 95),
    100: lighten(baseColor, 85),
    200: lighten(baseColor, 70),
    300: lighten(baseColor, 50),
    400: lighten(baseColor, 25),
    500: baseColor,
    600: darken(baseColor, 10),
    700: darken(baseColor, 25),
    800: darken(baseColor, 40),
    900: darken(baseColor, 55),
  };
}

// Generic default colors (neutral theme for fallback)
const DEFAULT_COLORS = {
  primary: '#1e40af',    // Blue
  secondary: '#059669',  // Green  
  accent: '#dc2626',     // Red
  trust: '#0369a1',      // Dark blue
};

export default function ThemeProvider({ children, site }: ThemeProviderProps) {
  // Extract theme colors from site.theme, falling back to settings then defaults
  const themeColors = useMemo(() => {
    // First try site.theme (proper location)
    if (site.theme?.colors) {
      return {
        primary: site.theme.colors.primary || DEFAULT_COLORS.primary,
        secondary: site.theme.colors.secondary || DEFAULT_COLORS.secondary,
        accent: site.theme.colors.accent || DEFAULT_COLORS.accent,
        trust: site.theme.colors.trust || DEFAULT_COLORS.trust,
      };
    }

    // Fallback to legacy site.settings.theme
    const settings = typeof site.settings === 'string'
      ? JSON.parse(site.settings)
      : site.settings || {};

    const themeSettings = settings.theme || {};

    return {
      primary: themeSettings.colors?.primary || settings.primaryColor || themeSettings.primaryColor || DEFAULT_COLORS.primary,
      secondary: themeSettings.colors?.secondary || settings.secondaryColor || themeSettings.secondaryColor || DEFAULT_COLORS.secondary,
      accent: themeSettings.colors?.accent || settings.accentColor || themeSettings.accentColor || DEFAULT_COLORS.accent,
      trust: themeSettings.colors?.trust || settings.trustColor || themeSettings.trustColor || DEFAULT_COLORS.trust,
    };
  }, [site.theme, site.settings]);

  // Generate full palettes for each color
  const palettes = useMemo(() => ({
    primary: generatePalette(themeColors.primary),
    secondary: generatePalette(themeColors.secondary),
    accent: generatePalette(themeColors.accent),
  }), [themeColors]);

  // Extract font settings
  const themeFonts = useMemo(() => {
    if (site.theme?.fonts) {
      return site.theme.fonts;
    }
    return {
      heading: 'Playfair Display',
      body: 'Inter'
    };
  }, [site.theme]);

  // Generate CSS variables string
  const cssVariables = useMemo(() => {
    const vars: string[] = [];

    // Color palettes
    Object.entries(palettes.primary).forEach(([shade, color]) => {
      vars.push(`--color-primary-${shade}: ${color};`);
    });

    Object.entries(palettes.secondary).forEach(([shade, color]) => {
      vars.push(`--color-secondary-${shade}: ${color};`);
    });

    Object.entries(palettes.accent).forEach(([shade, color]) => {
      vars.push(`--color-accent-${shade}: ${color};`);
    });

    // Trust colors (single values)
    vars.push(`--color-trust-green: ${themeColors.trust};`);
    vars.push(`--color-trust-blue: #1e40af;`);
    vars.push(`--color-trust-gold: #d97706;`);

    // Font families
    vars.push(`--font-heading: '${themeFonts.heading}', system-ui, sans-serif;`);
    vars.push(`--font-body: '${themeFonts.body}', system-ui, sans-serif;`);

    return vars.join('\n    ');
  }, [palettes, themeColors, themeFonts]);

  // Debug logging for Goodness Authority
  if (site.subdomain === 'goodness-authority') {
    console.log('🎨 ThemeProvider Debug for Goodness Authority:', {
      siteSubdomain: site.subdomain,
      themeColors,
      primaryPalette: palettes.primary,
      cssVariables: cssVariables.substring(0, 200) + '...'
    });
  }

  return (
    <>
      <style jsx global>{`
        :root {
          ${cssVariables}
        }
      `}</style>
      {children}
    </>
  );
}

// Export defaults for use elsewhere
export { DEFAULT_COLORS, generatePalette, lighten, darken };
