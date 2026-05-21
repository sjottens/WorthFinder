import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchProductData } from '@/lib/fetch-product-data';
import { recordSearch, getAllSearchHistory } from '@/lib/search-history';
import { slugToQuery, getBaseUrl, formatCurrency } from '@/lib/utils';

import Breadcrumbs from '@/components/Breadcrumbs';
import PriceEstimateCard from '@/components/PriceEstimateCard';
import ConfidenceScore from '@/components/ConfidenceScore';
import TrendIndicator from '@/components/TrendIndicator';
import PriceHistoryList from '@/components/PriceHistoryList';
import FAQSection from '@/components/FAQSection';
import RelatedProducts from '@/components/RelatedProducts';
import SearchBar from '@/components/SearchBar';

// Revalidate every 6 hours — ISR-style caching
export const revalidate = 21600;

// ---------------------------------------------------------------------------
// Params type
// ---------------------------------------------------------------------------
interface PageParams {
  params: Promise<{ slug: string }>;
}

// ---------------------------------------------------------------------------
// generateMetadata — dynamic SEO per product
// ---------------------------------------------------------------------------
export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { slug } = await params;
  const query = slugToQuery(slug);
  const baseUrl = getBaseUrl();
  const canonical = `${baseUrl}/worth/${slug}`;

  // Try to get live price for a richer meta description
  const data = await fetchProductData(slug, query);
  const priceString = data
    ? `Average resale price: ${formatCurrency(data.stats.median)}.`
    : '';

  const title = `${query} Resale Value (Live Price Guide ${new Date().getFullYear()})`;
  const description = `See the live resale value of ${query} based on recent sold listings and market data. ${priceString} Updated every 6 hours.`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      siteName: 'WorthFinder',
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.png'],
    },
  };
}

// ---------------------------------------------------------------------------
// JSON-LD helpers
// ---------------------------------------------------------------------------
function buildProductJsonLd(
  query: string,
  slug: string,
  data: NonNullable<Awaited<ReturnType<typeof fetchProductData>>>,
  baseUrl: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: query,
    description: `Live resale value data for ${query} based on recent sold listings.`,
    url: `${baseUrl}/worth/${slug}`,
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: String(data.stats.low),
      highPrice: String(data.stats.high),
      priceCurrency: 'USD',
      offerCount: String(data.stats.count),
    },
  };
}

function buildFaqJsonLd(
  query: string,
  data: NonNullable<Awaited<ReturnType<typeof fetchProductData>>>
) {
  const avgPrice = formatCurrency(data.stats.median);
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What is the resale value of ${query}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Based on recent sold listings, the average resale value of ${query} is approximately ${avgPrice}. Prices range from ${formatCurrency(data.stats.low)} to ${formatCurrency(data.stats.high)}.`,
        },
      },
      {
        '@type': 'Question',
        name: `Where can I sell my ${query}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `The most popular platforms to sell ${query} are eBay, Facebook Marketplace, and Craigslist.`,
        },
      },
      {
        '@type': 'Question',
        name: `How accurate is the ${query} resale estimate?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `WorthFinder pulls data from real sold listings and refreshes every 6 hours. The data confidence score on this page indicates estimate reliability.`,
        },
      },
    ],
  };
}

function buildBreadcrumbJsonLd(query: string, slug: string, baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: `${query} Resale Value`,
        item: `${baseUrl}/worth/${slug}`,
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------
export default async function WorthPage({ params }: PageParams) {
  const { slug } = await params;

  // Validate slug: only allow lowercase letters, numbers, hyphens
  if (!/^[a-z0-9-]+$/.test(slug)) {
    notFound();
  }

  const query = slugToQuery(slug);
  const baseUrl = getBaseUrl();

  // Fetch live pricing data
  const data = await fetchProductData(slug, query);

  // Record this search in history (fire-and-forget, no await to keep page fast)
  recordSearch(slug, query);

  const allHistory = getAllSearchHistory();

  // No data — still render a useful SEO page with a clear message
  const hasData = data !== null;

  return (
    <>
      {/* JSON-LD structured data */}
      {hasData && (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(buildProductJsonLd(query, slug, data, baseUrl)),
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(buildFaqJsonLd(query, data)),
            }}
          />
        </>
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildBreadcrumbJsonLd(query, slug, baseUrl)),
        }}
      />

      <main className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: `${query} Resale Value` },
          ]}
        />

        {/* Search bar — lets visitors quickly search another product */}
        <div className="mb-8 pb-6 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
            Search another product
          </h2>
          <SearchBar className="w-full" />
        </div>

        {/* Page heading */}
        <h1 className="text-3xl sm:text-4xl font-bold text-black tracking-tight mb-1">
          {query} Resale Value
        </h1>
        <p className="text-gray-500 mb-8">
          Live price estimate based on recent sold listings
        </p>

        {/* ------------------------------------------------------------------ */}
        {/* Data available */}
        {/* ------------------------------------------------------------------ */}
        {hasData ? (
          <div className="space-y-6">
            {/* Primary estimate card */}
            <PriceEstimateCard
              query={query}
              stats={data.stats}
              fetchedAt={data.fetchedAt}
              sources={data.sources}
            />

            {/* Confidence + Trend side by side */}
            <div className="grid sm:grid-cols-2 gap-4">
              <ConfidenceScore confidence={data.confidence} />
              <TrendIndicator trend={data.trend} />
            </div>

            {/* Sold listings table */}
            <PriceHistoryList listings={data.listings} />

            {/* FAQ — important for SEO */}
            <FAQSection query={query} stats={data.stats} slug={slug} />

            {/* Related products — internal linking for SEO */}
            <RelatedProducts currentSlug={slug} items={allHistory} />
          </div>
        ) : (
          /* ---------------------------------------------------------------- */
          /* No data state                                                      */
          /* ---------------------------------------------------------------- */
          <div className="space-y-8">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center">
              <p className="text-2xl mb-2" aria-hidden="true">⏳</p>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Live data temporarily unavailable
              </h2>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                We couldn&apos;t find recent sold listings for <strong>{query}</strong> right now.
                This can happen when no API keys are configured or the item is
                rare. Please try again shortly or search for a different product.
              </p>
            </div>

            <FAQSection query={query} stats={null} slug={slug} />

            <div className="pt-4 border-t border-gray-100">
              <h2 className="text-base font-semibold text-gray-700 mb-3">
                Try another search
              </h2>
              <SearchBar className="w-full" />
            </div>

            <RelatedProducts currentSlug={slug} items={allHistory} />
          </div>
        )}
      </main>
    </>
  );
}
