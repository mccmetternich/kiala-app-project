// Theme Presets Library
// This file contains predefined themes that can be selected when creating or editing a site

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  trust: string;
  background: string;
  text: string;
}

export interface ThemeFonts {
  heading: string;
  body: string;
}

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  category: 'medical' | 'wellness' | 'lifestyle' | 'clinical' | 'premium';
  colors: ThemeColors;
  fonts: ThemeFonts;
  style: 'medical' | 'wellness' | 'lifestyle' | 'clinical';
  preview: {
    gradient: string;
    accent: string;
  };
}

// Font options available for themes
export const fontOptions = {
  heading: [
    { id: 'playfair', name: 'Playfair Display', preview: 'Elegant Serif' },
    { id: 'inter', name: 'Inter', preview: 'Clean Sans-Serif' },
    { id: 'georgia', name: 'Georgia', preview: 'Classic Serif' },
    { id: 'montserrat', name: 'Montserrat', preview: 'Modern Sans' },
    { id: 'lora', name: 'Lora', preview: 'Readable Serif' },
    { id: 'raleway', name: 'Raleway', preview: 'Sleek Sans' },
  ],
  body: [
    { id: 'inter', name: 'Inter', preview: 'Clean & Readable' },
    { id: 'open-sans', name: 'Open Sans', preview: 'Friendly & Clear' },
    { id: 'roboto', name: 'Roboto', preview: 'Modern & Neutral' },
    { id: 'lato', name: 'Lato', preview: 'Warm & Humanist' },
    { id: 'source-sans-pro', name: 'Source Sans Pro', preview: 'Professional' },
    { id: 'nunito', name: 'Nunito', preview: 'Soft & Rounded' },
  ],
};

// Predefined theme presets
export const themePresets: ThemePreset[] = [
  // Medical Authority Themes
  {
    id: 'medical-authority',
    name: 'Medical Authority',
    description: 'Professional medical authority with trust-building pink and green accents',
    category: 'medical',
    colors: {
      primary: '#ec4899',
      secondary: '#22c55e',
      accent: '#f59e0b',
      trust: '#0369a1',
      background: '#fefefe',
      text: '#374151',
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Inter',
    },
    style: 'medical',
    preview: {
      gradient: 'from-pink-500 to-pink-600',
      accent: '#22c55e',
    },
  },
  {
    id: 'medical-professional',
    name: 'Medical Professional',
    description: 'Clean blue tones conveying clinical professionalism',
    category: 'medical',
    colors: {
      primary: '#3b82f6',
      secondary: '#22c55e',
      accent: '#f59e0b',
      trust: '#1e40af',
      background: '#ffffff',
      text: '#1f2937',
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
    },
    style: 'medical',
    preview: {
      gradient: 'from-blue-500 to-blue-600',
      accent: '#22c55e',
    },
  },

  // Wellness Themes
  {
    id: 'wellness-professional',
    name: 'Wellness Professional',
    description: 'Holistic wellness approach with calming emerald and blue',
    category: 'wellness',
    colors: {
      primary: '#059669',
      secondary: '#3b82f6',
      accent: '#f59e0b',
      trust: '#065f46',
      background: '#fafafa',
      text: '#374151',
    },
    fonts: {
      heading: 'Lora',
      body: 'Open Sans',
    },
    style: 'wellness',
    preview: {
      gradient: 'from-emerald-500 to-emerald-600',
      accent: '#3b82f6',
    },
  },
  {
    id: 'wellness-natural',
    name: 'Natural Wellness',
    description: 'Earth tones for natural health and holistic living',
    category: 'wellness',
    colors: {
      primary: '#84cc16',
      secondary: '#059669',
      accent: '#d97706',
      trust: '#065f46',
      background: '#fefce8',
      text: '#3f3f46',
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Lato',
    },
    style: 'wellness',
    preview: {
      gradient: 'from-lime-500 to-green-600',
      accent: '#d97706',
    },
  },

  // Clinical Research Themes
  {
    id: 'clinical-research',
    name: 'Clinical Research',
    description: 'Research-based clinical approach with professional blue-purple styling',
    category: 'clinical',
    colors: {
      primary: '#3b82f6',
      secondary: '#8b5cf6',
      accent: '#f59e0b',
      trust: '#1e40af',
      background: '#ffffff',
      text: '#1f2937',
    },
    fonts: {
      heading: 'Inter',
      body: 'Source Sans Pro',
    },
    style: 'clinical',
    preview: {
      gradient: 'from-blue-500 to-indigo-600',
      accent: '#8b5cf6',
    },
  },
  {
    id: 'clinical-modern',
    name: 'Modern Clinical',
    description: 'Contemporary clinical look with cyan and teal accents',
    category: 'clinical',
    colors: {
      primary: '#06b6d4',
      secondary: '#14b8a6',
      accent: '#f59e0b',
      trust: '#0e7490',
      background: '#f8fafc',
      text: '#334155',
    },
    fonts: {
      heading: 'Montserrat',
      body: 'Roboto',
    },
    style: 'clinical',
    preview: {
      gradient: 'from-cyan-500 to-teal-600',
      accent: '#14b8a6',
    },
  },

  // Lifestyle & Beauty Themes
  {
    id: 'lifestyle-beauty',
    name: 'Lifestyle & Beauty',
    description: 'Lifestyle and beauty focus with purple and pink styling',
    category: 'lifestyle',
    colors: {
      primary: '#8b5cf6',
      secondary: '#ec4899',
      accent: '#f59e0b',
      trust: '#7c3aed',
      background: '#fdf4ff',
      text: '#581c87',
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Nunito',
    },
    style: 'lifestyle',
    preview: {
      gradient: 'from-purple-500 to-pink-500',
      accent: '#ec4899',
    },
  },
  {
    id: 'lifestyle-modern',
    name: 'Modern Lifestyle',
    description: 'Clean, contemporary lifestyle branding with warm accents',
    category: 'lifestyle',
    colors: {
      primary: '#f97316',
      secondary: '#ec4899',
      accent: '#fbbf24',
      trust: '#c2410c',
      background: '#fffbeb',
      text: '#451a03',
    },
    fonts: {
      heading: 'Raleway',
      body: 'Open Sans',
    },
    style: 'lifestyle',
    preview: {
      gradient: 'from-orange-500 to-rose-500',
      accent: '#fbbf24',
    },
  },

  // Premium/Luxury Themes
  {
    id: 'premium-gold',
    name: 'Premium Gold',
    description: 'Luxury positioning with rich gold and deep navy tones',
    category: 'premium',
    colors: {
      primary: '#d97706',
      secondary: '#1e3a5f',
      accent: '#fbbf24',
      trust: '#1e40af',
      background: '#fffbeb',
      text: '#1f2937',
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Inter',
    },
    style: 'lifestyle',
    preview: {
      gradient: 'from-amber-500 to-amber-700',
      accent: '#1e3a5f',
    },
  },
  {
    id: 'premium-dark',
    name: 'Premium Dark',
    description: 'Sophisticated dark theme for high-end positioning',
    category: 'premium',
    colors: {
      primary: '#a855f7',
      secondary: '#22d3ee',
      accent: '#fbbf24',
      trust: '#7c3aed',
      background: '#0f172a',
      text: '#e2e8f0',
    },
    fonts: {
      heading: 'Montserrat',
      body: 'Inter',
    },
    style: 'lifestyle',
    preview: {
      gradient: 'from-purple-600 to-cyan-600',
      accent: '#fbbf24',
    },
  },
];

// Helper to get theme by ID
export function getThemePreset(id: string): ThemePreset | undefined {
  return themePresets.find(t => t.id === id);
}

// Helper to get themes by category
export function getThemesByCategory(category: string): ThemePreset[] {
  return themePresets.filter(t => t.category === category);
}

// Get all unique categories
export function getThemeCategories(): string[] {
  return [...new Set(themePresets.map(t => t.category))];
}

// Category labels for display
export const categoryLabels: Record<string, string> = {
  medical: 'Medical & Healthcare',
  wellness: 'Wellness & Holistic',
  clinical: 'Clinical & Research',
  lifestyle: 'Lifestyle & Beauty',
  premium: 'Premium & Luxury',
};
