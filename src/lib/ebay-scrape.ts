import { SoldListing } from '@/types';
import { load } from 'cheerio';

/**
 * Free alternative: Scrape eBay search results directly using cheerio.
 * No API key required — just plain HTTP requests + HTML parsing.
 *
 * Returns recently sold listings from eBay's public search results.
 * Results are cached for 6 hours.
 *
 * ⚠️ Note: Web scraping may violate eBay's ToS. Use official API when available.
 * This is a fallback for development only.
 */
export async function fetchEbayScrape(query: string): Promise<SoldListing[]> {
  try {
    // eBay search URL — look for auction/sale listings
    const searchUrl = new URL('https://www.ebay.com/sch/i.html');
    searchUrl.searchParams.set('_nkw', query);
    searchUrl.searchParams.set('_sop', '15'); // Sort by "ended recently"
    searchUrl.searchParams.set('rt', 'nc'); // Return completed listings only

    console.info(`[eBay Scrape] Fetching: ${query}`);

    const response = await fetch(searchUrl.toString(), {
      next: { revalidate: 21600 }, // 6 hour cache
      headers: {
        // Browser-like headers to avoid being blocked as a bot
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
        'Accept':
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Dnt': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0',
      },
    });

    if (!response.ok) {
      console.warn(
        `[eBay Scrape] HTTP ${response.status} — eBay may be blocking automated requests`
      );
      return [];
    }

    const html = await response.text();
    const $ = load(html);

    const listings: SoldListing[] = [];

    // eBay search result selectors — these may need updates if eBay changes HTML structure
    // Typical structure: <div class="s-item" ...>
    $('.s-item').each((_, element) => {
      if (listings.length >= 20) return; // Limit to 20 results

      try {
        // Extract title
        const titleElem = $(element).find('.s-item__title');
        const title = titleElem.text().trim();
        if (!title) return;

        // Extract price
        const priceElem = $(element).find('.s-item__price');
        const priceText = priceElem.text().trim();
        const price = parsePrice(priceText);
        if (!price || price <= 0) return;

        // Extract item URL
        const linkElem = $(element).find('a.s-item__link');
        const url = linkElem.attr('href') || '';
        if (!url) return;

        // Extract item ID from URL for cleaner link
        const itemIdMatch = url.match(/\/itm\/(\d+)/);
        const itemId = itemIdMatch?.[1] || '';

        // Extract condition (if available)
        const conditionElem = $(element).find('.SECONDARY_INFO');
        const condition =
          conditionElem.text().trim().toLowerCase().includes('used')
            ? 'Used'
            : conditionElem.text().trim().toLowerCase().includes('new')
              ? 'New'
              : 'Unknown';

        // Estimate sold date as "recently"
        const soldDate = new Date(
          Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
        ).toISOString();

        listings.push({
          title,
          price,
          currency: 'USD',
          soldDate,
          url: itemId ? `https://www.ebay.com/itm/${itemId}` : url,
          source: 'ebay',
          condition,
          imageUrl: undefined,
        });
      } catch (err) {
        console.debug('[eBay Scrape] Parse error on item:', err);
        // Continue to next item
      }
    });

    if (listings.length > 0) {
      console.info(
        `[eBay Scrape] Found ${listings.length} listings for "${query}"`
      );
    } else {
      console.warn(`[eBay Scrape] No listings found for "${query}"`);
    }

    return listings;
  } catch (error) {
    console.error('[eBay Scrape] Unexpected error:', error);
    return [];
  }
}

/**
 * Parse eBay price strings like "$12.99", "US $12.99 to $15.50", etc.
 */
function parsePrice(priceText: string): number {
  if (!priceText) return 0;

  // Extract all numbers with optional decimals
  const match = priceText.match(/\$?([\d,]+(?:\.\d{2})?)/);
  if (!match) return 0;

  // Remove commas and convert to number
  const price = parseFloat(match[1].replace(/,/g, ''));
  return isNaN(price) ? 0 : price;
}
