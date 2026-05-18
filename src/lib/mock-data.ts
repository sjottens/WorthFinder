import { SoldListing } from '@/types';

/**
 * Mock data generator for development and testing.
 * Used when both eBay and SerpAPI are unavailable.
 *
 * Generates realistic sold listing data with:
 *   - Query-aware titles
 *   - Random prices (±25% variance around realistic base price)
 *   - Recent sold dates (last 30 days)
 *   - Condition variations
 */

const BASE_PRICES: Record<string, number> = {
  'herman miller aeron': 450,
  'rh logic 400': 800,
  'rolex submariner': 7500,
  'apple macbook pro m3': 1800,
  'sony playstation 5': 450,
  'dyson v15 detect': 650,
  'iphone 15 pro': 900,
  'lego ideas sets': 120,
  'nintendo switch oled': 320,
  'vitamix 5200': 380,
};

export function generateMockListings(query: string, count: number = 15): SoldListing[] {
  const normalizedQuery = query.toLowerCase();
  let basePrice = BASE_PRICES[normalizedQuery];

  // If no exact match, use a heuristic: longer product names = higher price
  if (!basePrice) {
    basePrice = 200 + query.split(' ').length * 100;
  }

  const conditions = ['Like New', 'Excellent', 'Good', 'Fair'];
  const now = Date.now();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

  const listings: SoldListing[] = [];

  for (let i = 0; i < count; i++) {
    // Random variance: 0.75–1.25x base price
    const variance = 0.75 + Math.random() * 0.5;
    const price = Math.round(basePrice * variance);

    // Random sold date in the past 30 days
    const daysAgo = Math.floor(Math.random() * 30);
    const soldTime = now - daysAgo * 24 * 60 * 60 * 1000;

    listings.push({
      title: `${query} - ${conditions[i % conditions.length]}`,
      price,
      currency: 'USD',
      soldDate: new Date(soldTime).toISOString(),
      url: `https://www.ebay.com/sch/i.html?_nkw=${query}#mock-${i}`,
      source: 'serpapi',
      condition: conditions[i % conditions.length],
      imageUrl: undefined,
    });
  }

  return listings;
}
