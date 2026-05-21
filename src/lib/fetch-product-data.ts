import { ProductPriceData } from '@/types';
import { fetchEbaySoldListings } from './ebay';
import { fetchSerpApiPrices } from './serpapi';
import { fetchEbayScrape } from './ebay-scrape';
import { calculateConfidence, calculatePriceStats, calculateTrend } from './pricing';
import { generateMockListings } from './mock-data';

/**
 * Orchestrates all data sources and returns a unified ProductPriceData object.
 *
 * Priority:
 *   1. eBay Finding API     (official, requires EBAY_APP_ID)
 *   2. eBay Web Scraping    (free, no API key needed)
 *   3. SerpAPI              (optional, requires API key)
 *   4. Mock data            (fallback for dev/testing)
 *
 * Returns null when no pricing data could be retrieved.
 */
export async function fetchProductData(
  slug: string,
  query: string
): Promise<ProductPriceData | null> {
  // Fetch eBay (official), scraper, and SerpAPI in parallel for speed
  const [ebayListings, scrapeListings, serpListings] = await Promise.all([
    fetchEbaySoldListings(query),
    fetchEbayScrape(query),
    fetchSerpApiPrices(query),
  ]);

  // Merge all sources, de-duplicate by URL, prefer eBay official > scrape > SerpAPI
  const seen = new Set<string>();
  
  // Strategy: Only use SerpAPI if we have very few eBay results (< 5)
  // This prevents low current-market prices from skewing the historical sold-price average
  const hasGoodEbayData = (ebayListings.length + scrapeListings.length) >= 5;
  
  let allListings = [
    ...ebayListings,
    ...scrapeListings,
    ...(hasGoodEbayData ? [] : serpListings), // Skip SerpAPI if we have good eBay data
  ].filter((l) => {
    if (!l.url || seen.has(l.url)) return false;
    seen.add(l.url);
    return true;
  });

  // Fallback to mock data if no live sources available
  if (allListings.length === 0) {
    console.info(
      '[fetch-product-data] No live data available; using mock data for development'
    );
    allListings = generateMockListings(query, 15);
  }

  if (allListings.length === 0) return null;

  const stats = calculatePriceStats(allListings);
  if (!stats) return null;

  const sources: string[] = [];
  if (ebayListings.length > 0) sources.push('eBay API');
  if (scrapeListings.length > 0) sources.push('eBay Web');
  if (serpListings.length > 0) sources.push('Google Shopping');
  if (ebayListings.length === 0 && scrapeListings.length === 0 && serpListings.length === 0) {
    sources.push('Development Data');
  }

  return {
    query,
    slug,
    stats,
    trend: calculateTrend(allListings),
    confidence: calculateConfidence(allListings),
    // Cap at 20 most recent listings for the UI
    listings: allListings
      .sort(
        (a, b) =>
          new Date(b.soldDate).getTime() - new Date(a.soldDate).getTime()
      )
      .slice(0, 20),
    fetchedAt: new Date().toISOString(),
    sources,
  };
}
