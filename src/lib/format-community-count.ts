/**
 * Utility functions for formatting community count numbers
 * Used across the site for consistent display of member/community counts
 */

const DEFAULT_COMMUNITY_COUNT = 47284;

/**
 * Get the community count from site settings, with fallback to default
 */
export function getCommunityCount(settings?: { communityCount?: number } | null): number {
  return settings?.communityCount ?? DEFAULT_COMMUNITY_COUNT;
}

/**
 * Format as truncated "47k+" style
 * Rounds to nearest thousand
 */
export function formatCountShort(count: number): string {
  const thousands = Math.round(count / 1000);
  return `${thousands}k+`;
}

/**
 * Format as full number with commas "47,284+"
 */
export function formatCountFull(count: number): string {
  return `${count.toLocaleString()}+`;
}

/**
 * Format as rounded thousands "47,000+"
 */
export function formatCountRounded(count: number): string {
  const rounded = Math.round(count / 1000) * 1000;
  return `${rounded.toLocaleString()}+`;
}

/**
 * Get both formats for easy use
 */
export function formatCommunityCount(settings?: { communityCount?: number } | null) {
  const count = getCommunityCount(settings);
  return {
    raw: count,
    short: formatCountShort(count),      // "47k+"
    full: formatCountFull(count),         // "47,284+"
    rounded: formatCountRounded(count),   // "47,000+"
  };
}
