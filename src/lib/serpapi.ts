import { SoldListing } from '@/types';

const SERPAPI_KEY = process.env.SERPAPI_KEY;
const SERPAPI_BASE = 'https://serpapi.com/search.json';

// ------------------------------------------------------------------
// SerpAPI response shapes (Google Shopping engine)
// ------------------------------------------------------------------
interface ShoppingResult {
  title: string;
  product_link?: string;
  extracted_price?: number;
  price?: string;
  source?: string;
  thumbnail?: string;
}

// ------------------------------------------------------------------
// Public API
// ------------------------------------------------------------------

/**
 * Fetch price data via SerpAPI (Google Shopping).
 * Used as a fallback when eBay returns too few results.
 * Results are cached for 6 hours.
 *
 * Requires SERPAPI_KEY environment variable.
 * Sign up at https://serpapi.com/
 */
export async function fetchSerpApiPrices(
  query: string
): Promise<SoldListing[]> {
  if (!SERPAPI_KEY) {
    console.warn('[SerpAPI] SERPAPI_KEY not configured — skipping SerpAPI source');
    return [];
  }

  console.info(`[SerpAPI] Fetching: ${query}`);

  const params = new URLSearchParams({
    engine: 'google_shopping',
    q: `used ${query}`,
    gl: 'us',
    hl: 'en',
    api_key: SERPAPI_KEY,
    num: '20',
  });

  try {
    const response = await fetch(
      `${SERPAPI_BASE}?${params.toString()}`,
      {
        next: { revalidate: 21600 },
        headers: { Accept: 'application/json' },
      }
    );

    if (!response.ok) {
      console.error(`[SerpAPI] HTTP ${response.status}`);
      return [];
    }

    const data = await response.json();
    const results: ShoppingResult[] = data.shopping_results ?? [];

    const filtered = results
      .filter((r) => {
        const hasPrice = typeof r.extracted_price === 'number' && r.extracted_price > 0;
        const hasUrl = r.product_link && r.product_link.trim().length > 0;
        return hasPrice && hasUrl;
      })
      .map((r) => ({
        title: r.title,
        price: r.extracted_price!,
        currency: 'USD',
        // Google Shopping doesn't expose exact sold dates;
        // use current time as an approximate signal.
        soldDate: new Date().toISOString(),
        url: r.product_link!,
        source: 'serpapi' as const,
        condition: 'Used',
        imageUrl: r.thumbnail,
      }))
      .slice(0, 20);

    return filtered;
  } catch (error) {
    console.error('[SerpAPI] Unexpected error:', error);
    return [];
  }
}
