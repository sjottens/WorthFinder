import { SoldListing } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

interface PriceHistoryListProps {
  listings: SoldListing[];
}

const SOURCE_LABELS: Record<SoldListing['source'], string> = {
  ebay: 'eBay',
  serpapi: 'Google Shopping',
};

export default function PriceHistoryList({ listings }: PriceHistoryListProps) {
  if (listings.length === 0) {
    return (
      <p className="text-sm text-gray-500 py-4">No recent sold listings available.</p>
    );
  }

  return (
    <section aria-label="Recent sold listings">
      <h2 className="text-xl font-semibold text-black mb-4">
        Recent Sold Listings
      </h2>
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <ul className="divide-y divide-gray-100">
          {listings.map((listing, index) => (
            <li key={`${listing.url}-${index}`} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
              {/* Price — prominent */}
              <span className="text-lg font-bold text-black w-24 shrink-0">
                {formatCurrency(listing.price, listing.currency)}
              </span>

              {/* Title */}
              <div className="flex-1 min-w-0">
                {listing.url ? (
                  <a
                    href={listing.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-800 hover:text-black hover:underline line-clamp-1"
                  >
                    {listing.title}
                  </a>
                ) : (
                  <span className="text-sm text-gray-800 line-clamp-1">
                    {listing.title}
                  </span>
                )}

                <div className="flex gap-3 mt-0.5">
                  {listing.condition && (
                    <span className="text-xs text-gray-400">{listing.condition}</span>
                  )}
                  <span className="text-xs text-gray-400">
                    {formatDate(listing.soldDate)}
                  </span>
                </div>
              </div>

              {/* Source badge */}
              <span className="shrink-0 text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 font-medium">
                {SOURCE_LABELS[listing.source] ?? listing.source}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
