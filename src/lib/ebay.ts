import { SoldListing } from '@/types';

const EBAY_APP_ID = process.env.EBAY_APP_ID;
const EBAY_API_BASE =
  'https://svcs.ebay.com/services/search/FindingService/v1';

// ------------------------------------------------------------------
// Raw eBay Finding API response shapes (JSON format)
// ------------------------------------------------------------------
interface EbayPrice {
  _currencyId: string;
  __value__: string;
}

interface EbayItem {
  itemId: string[];
  title: string[];
  viewItemURL: string[];
  galleryURL?: string[];
  sellingStatus: Array<{
    currentPrice: EbayPrice[];
    sellingState: string[];
  }>;
  listingInfo: Array<{
    endTime: string[];
  }>;
  condition?: Array<{
    conditionDisplayName: string[];
  }>;
}

interface EbayResponse {
  findCompletedItemsResponse: Array<{
    ack: string[];
    searchResult?: Array<{
      item?: EbayItem[];
    }>;
    errorMessage?: Array<{
      error: Array<{ message: string[] }>;
    }>;
  }>;
}

// ------------------------------------------------------------------
// Public API
// ------------------------------------------------------------------

/**
 * Fetch completed (sold) listings from the eBay Finding API.
 * Results are cached for 6 hours via Next.js fetch cache.
 *
 * Requires EBAY_APP_ID environment variable.
 * Register for free at https://developer.ebay.com/
 *
 * NOTE: If EBAY_APP_ID is not available (pending review), returns empty.
 * SerpAPI will be used as the primary data source instead.
 */
export async function fetchEbaySoldListings(
  query: string
): Promise<SoldListing[]> {
  if (!EBAY_APP_ID) {
    console.info('[eBay] EBAY_APP_ID not configured — eBay disabled (add key to .env.local to enable)');
    return [];
  }

  const params = new URLSearchParams({
    'OPERATION-NAME': 'findCompletedItems',
    'SERVICE-VERSION': '1.0.0',
    'SECURITY-APPNAME': EBAY_APP_ID,
    'RESPONSE-DATA-FORMAT': 'JSON',
    keywords: query,
    // Only return items that actually sold
    'itemFilter(0).name': 'SoldItemsOnly',
    'itemFilter(0).value': 'true',
    // Only fixed-price and auction listings (exclude lots/bundles)
    'itemFilter(1).name': 'ListingType',
    'itemFilter(1).value(0)': 'AuctionWithBIN',
    'itemFilter(1).value(1)': 'FixedPrice',
    'itemFilter(1).value(2)': 'Auction',
    // US market only for price relevance
    'itemFilter(2).name': 'LocatedIn',
    'itemFilter(2).value': 'US',
    sortOrder: 'EndTimeSoonest',
    'paginationInput.entriesPerPage': '25',
  });

  try {
    const response = await fetch(
      `${EBAY_API_BASE}?${params.toString()}`,
      {
        // Cache response for 6 hours (ISR-style)
        next: { revalidate: 21600 },
        headers: { Accept: 'application/json' },
      }
    );

    if (!response.ok) {
      console.error(`[eBay] HTTP ${response.status} from Finding API`);
      return [];
    }

    const data: EbayResponse = await response.json();
    const result = data.findCompletedItemsResponse?.[0];

    if (result?.ack?.[0] !== 'Success') {
      const msg = result?.errorMessage?.[0]?.error?.[0]?.message?.[0];
      console.error('[eBay] API error:', msg ?? 'unknown');
      return [];
    }

    const items = result.searchResult?.[0]?.item ?? [];

    return items
      .filter(
        (item) =>
          item.sellingStatus?.[0]?.sellingState?.[0] === 'EndedWithSales'
      )
      .map((item) => {
        const rawPrice =
          item.sellingStatus?.[0]?.currentPrice?.[0]?.__value__ ?? '0';
        return {
          title: item.title?.[0] ?? '',
          price: parseFloat(rawPrice),
          currency:
            item.sellingStatus?.[0]?.currentPrice?.[0]?._currencyId ?? 'USD',
          soldDate:
            item.listingInfo?.[0]?.endTime?.[0] ?? new Date().toISOString(),
          url: item.viewItemURL?.[0] ?? '',
          source: 'ebay' as const,
          condition: item.condition?.[0]?.conditionDisplayName?.[0],
          imageUrl: item.galleryURL?.[0],
        };
      })
      .filter((listing) => listing.price > 0);
  } catch (error) {
    console.error('[eBay] Unexpected error:', error);
    return [];
  }
}
