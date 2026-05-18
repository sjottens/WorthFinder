/**
 * Convert a free-text query into a URL-safe slug.
 * e.g. "Herman Miller Aeron" → "herman-miller-aeron"
 */
export function queryToSlug(query: string): string {
  return query
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Convert a slug back to a human-readable title.
 * e.g. "herman-miller-aeron" → "Herman Miller Aeron"
 */
export function slugToQuery(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Format a number as a USD currency string (no decimal places).
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format an ISO date string to "Jan 1, 2026".
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Return the canonical base URL for the site.
 * Reads NEXT_PUBLIC_SITE_URL, then Netlify's URL env var, then falls back.
 */
export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  }
  if (process.env.URL) {
    // Netlify automatically sets URL to the deploy URL
    return process.env.URL.replace(/\/$/, '');
  }
  return 'https://worthfinder.com';
}

/**
 * Clamp a number between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
