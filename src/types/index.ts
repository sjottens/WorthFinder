// Represents one sold/completed listing from any data source
export interface SoldListing {
  title: string;
  price: number;
  currency: string;
  soldDate: string; // ISO 8601
  url: string;
  source: 'ebay' | 'serpapi';
  condition?: string;
  imageUrl?: string;
}

// Aggregated price statistics (outliers removed via IQR)
export interface PriceStats {
  average: number;
  median: number;
  low: number;
  high: number;
  count: number; // total raw listings used
}

// Price trend direction + magnitude
export interface PriceTrend {
  direction: 'rising' | 'falling' | 'stable';
  percentage: number;
}

// Data quality / confidence score
export interface ConfidenceData {
  score: number; // 0–100
  level: 'high' | 'medium' | 'low';
  factors: {
    resultCount: number;      // 0–40 pts
    priceConsistency: number; // 0–40 pts
    recency: number;          // 0–20 pts
  };
}

// Full product price payload returned by data-fetching functions
export interface ProductPriceData {
  query: string;        // original user search term
  slug: string;
  stats: PriceStats;
  trend: PriceTrend;
  confidence: ConfidenceData;
  listings: SoldListing[];
  fetchedAt: string;    // ISO 8601
  sources: string[];    // e.g. ['eBay', 'Google Shopping']
}

// Stored entry in the search history persistence layer
export interface SearchHistoryItem {
  slug: string;
  query: string;
  searchCount: number;
  lastSearched: string; // ISO 8601
}
