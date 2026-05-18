/**
 * Search-history persistence layer.
 *
 * Strategy:
 *   - Dev / self-hosted: writes JSON to <project>/data/search-history.json
 *   - Netlify (read-only filesystem): writes to /tmp/search-history.json
 *     This persists for the lifetime of a single warm function instance.
 *     For production persistence, swap readHistory/writeHistory for a
 *     real database (e.g. Netlify Blobs, PlanetScale, Turso, etc.).
 *
 * Pre-seeded popular searches ensure the sitemap and RelatedProducts
 * component have data even on a fresh deploy.
 */

import fs from 'fs';
import path from 'path';
import { SearchHistoryItem } from '@/types';

// Pre-seeded searches — always visible in sitemap & related products
const SEED_SEARCHES: SearchHistoryItem[] = [
  { slug: 'herman-miller-aeron', query: 'Herman Miller Aeron', searchCount: 100, lastSearched: new Date().toISOString() },
  { slug: 'rh-logic-400', query: 'RH Logic 400', searchCount: 80, lastSearched: new Date().toISOString() },
  { slug: 'rolex-submariner', query: 'Rolex Submariner', searchCount: 95, lastSearched: new Date().toISOString() },
  { slug: 'apple-macbook-pro-m3', query: 'Apple MacBook Pro M3', searchCount: 90, lastSearched: new Date().toISOString() },
  { slug: 'sony-playstation-5', query: 'Sony PlayStation 5', searchCount: 85, lastSearched: new Date().toISOString() },
  { slug: 'dyson-v15-detect', query: 'Dyson V15 Detect', searchCount: 70, lastSearched: new Date().toISOString() },
  { slug: 'iphone-15-pro', query: 'iPhone 15 Pro', searchCount: 88, lastSearched: new Date().toISOString() },
  { slug: 'lego-ideas-sets', query: 'LEGO Ideas Sets', searchCount: 60, lastSearched: new Date().toISOString() },
  { slug: 'nintendo-switch-oled', query: 'Nintendo Switch OLED', searchCount: 75, lastSearched: new Date().toISOString() },
  { slug: 'vitamix-5200', query: 'Vitamix 5200', searchCount: 55, lastSearched: new Date().toISOString() },
];

function getHistoryFilePath(): string {
  // Use /tmp on read-only filesystems (Netlify, Vercel), local data/ otherwise
  const isReadOnly =
    process.env.NETLIFY === 'true' || process.env.VERCEL === '1';
  if (isReadOnly) {
    return '/tmp/worthfinder-search-history.json';
  }
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    try { fs.mkdirSync(dataDir, { recursive: true }); } catch { /* ignore */ }
  }
  return path.join(dataDir, 'search-history.json');
}

function readHistory(): SearchHistoryItem[] {
  try {
    const file = getHistoryFilePath();
    if (!fs.existsSync(file)) return [...SEED_SEARCHES];
    const raw = fs.readFileSync(file, 'utf-8');
    const parsed: SearchHistoryItem[] = JSON.parse(raw);

    // Merge seeds so they always appear (in case file predates a new seed)
    const slugsInFile = new Set(parsed.map((h) => h.slug));
    const missing = SEED_SEARCHES.filter((s) => !slugsInFile.has(s.slug));
    return [...parsed, ...missing];
  } catch {
    return [...SEED_SEARCHES];
  }
}

function writeHistory(items: SearchHistoryItem[]): void {
  try {
    fs.writeFileSync(getHistoryFilePath(), JSON.stringify(items, null, 2));
  } catch (err) {
    console.error('[search-history] write failed:', err);
  }
}

/** Record a new search (or increment an existing one). */
export function recordSearch(slug: string, query: string): void {
  try {
    const history = readHistory();
    const existing = history.find((h) => h.slug === slug);
    if (existing) {
      existing.searchCount++;
      existing.lastSearched = new Date().toISOString();
    } else {
      history.push({ slug, query, searchCount: 1, lastSearched: new Date().toISOString() });
    }
    writeHistory(history);
  } catch (err) {
    console.error('[search-history] recordSearch failed:', err);
  }
}

/** Return the top N most-searched items. */
export function getPopularSearches(limit = 10): SearchHistoryItem[] {
  return readHistory()
    .sort((a, b) => b.searchCount - a.searchCount)
    .slice(0, limit);
}

/** Return all slugs (used by sitemap and generateStaticParams). */
export function getAllSlugs(): string[] {
  return readHistory().map((h) => h.slug);
}

/** Return all history items (used for related products). */
export function getAllSearchHistory(): SearchHistoryItem[] {
  return readHistory();
}
