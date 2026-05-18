import { SoldListing, PriceStats, PriceTrend, ConfidenceData } from '@/types';

// ------------------------------------------------------------------
// Price Statistics
// ------------------------------------------------------------------

/**
 * Calculate summary statistics from a set of sold listings.
 * Removes statistical outliers via the IQR (interquartile range) method
 * before computing average, median, low, and high.
 *
 * Returns null if there are no valid prices.
 */
export function calculatePriceStats(listings: SoldListing[]): PriceStats | null {
  const prices = listings.map((l) => l.price).filter((p) => p > 0);
  if (prices.length === 0) return null;

  const sorted = [...prices].sort((a, b) => a - b);

  // IQR-based outlier removal
  const q1Index = Math.floor(sorted.length * 0.25);
  const q3Index = Math.floor(sorted.length * 0.75);
  const q1 = sorted[q1Index];
  const q3 = sorted[q3Index];
  const iqr = q3 - q1;
  const lowerFence = q1 - 1.5 * iqr;
  const upperFence = q3 + 1.5 * iqr;

  const filtered = sorted.filter((p) => p >= lowerFence && p <= upperFence);
  if (filtered.length === 0) return null;

  const sum = filtered.reduce((a, b) => a + b, 0);
  const average = sum / filtered.length;
  const medianIndex = Math.floor(filtered.length / 2);
  const median =
    filtered.length % 2 === 0
      ? (filtered[medianIndex - 1] + filtered[medianIndex]) / 2
      : filtered[medianIndex];

  return {
    average: Math.round(average),
    median: Math.round(median),
    low: Math.round(filtered[0]),
    high: Math.round(filtered[filtered.length - 1]),
    count: listings.length,
  };
}

// ------------------------------------------------------------------
// Price Trend
// ------------------------------------------------------------------

/**
 * Compare the average price of the most recent half of listings
 * to the older half. Returns a direction and percentage change.
 */
export function calculateTrend(listings: SoldListing[]): PriceTrend {
  if (listings.length < 6) {
    return { direction: 'stable', percentage: 0 };
  }

  // Sort newest first
  const sorted = [...listings].sort(
    (a, b) => new Date(b.soldDate).getTime() - new Date(a.soldDate).getTime()
  );

  const half = Math.floor(sorted.length / 2);
  const recent = sorted.slice(0, half);
  const older = sorted.slice(half);

  const avg = (arr: SoldListing[]) =>
    arr.reduce((s, l) => s + l.price, 0) / arr.length;

  const recentAvg = avg(recent);
  const olderAvg = avg(older);

  if (olderAvg === 0) return { direction: 'stable', percentage: 0 };

  const changePct = ((recentAvg - olderAvg) / olderAvg) * 100;

  if (changePct > 5) {
    return { direction: 'rising', percentage: Math.round(changePct) };
  }
  if (changePct < -5) {
    return { direction: 'falling', percentage: Math.round(Math.abs(changePct)) };
  }
  return { direction: 'stable', percentage: Math.round(Math.abs(changePct)) };
}

// ------------------------------------------------------------------
// Confidence Score
// ------------------------------------------------------------------

/**
 * Score data quality on a 0–100 scale.
 *
 * Factors:
 *   - Result count    → 0–40 pts  (40 pts at 20+ results)
 *   - Price spread    → 0–40 pts  (40 pts at CV ≤ 0)
 *   - Recency         → 0–20 pts  (20 pts when all listings < 30 days old)
 */
export function calculateConfidence(listings: SoldListing[]): ConfidenceData {
  const prices = listings.map((l) => l.price).filter((p) => p > 0);

  if (prices.length === 0) {
    return {
      score: 0,
      level: 'low',
      factors: { resultCount: 0, priceConsistency: 0, recency: 0 },
    };
  }

  // Factor 1 – result count (0–40)
  const resultCountScore = Math.min(40, (prices.length / 20) * 40);

  // Factor 2 – price consistency via coefficient of variation (0–40)
  const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
  const variance =
    prices.reduce((s, p) => s + Math.pow(p - mean, 2), 0) / prices.length;
  const cv = mean > 0 ? Math.sqrt(variance) / mean : 1;
  const priceConsistencyScore = Math.max(0, 40 * (1 - Math.min(1, cv)));

  // Factor 3 – recency (0–20)
  const now = Date.now();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  const recentCount = listings.filter(
    (l) => now - new Date(l.soldDate).getTime() < thirtyDays
  ).length;
  const recencyScore = Math.min(20, (recentCount / listings.length) * 20);

  const totalScore = Math.min(
    100,
    Math.round(resultCountScore + priceConsistencyScore + recencyScore)
  );

  return {
    score: totalScore,
    level: totalScore >= 70 ? 'high' : totalScore >= 40 ? 'medium' : 'low',
    factors: {
      resultCount: Math.round(resultCountScore),
      priceConsistency: Math.round(priceConsistencyScore),
      recency: Math.round(recencyScore),
    },
  };
}
