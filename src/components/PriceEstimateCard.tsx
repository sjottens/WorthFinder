import { PriceStats } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface PriceEstimateCardProps {
  query: string;
  stats: PriceStats;
  fetchedAt: string;
  sources: string[];
}

export default function PriceEstimateCard({
  query,
  stats,
  fetchedAt,
  sources,
}: PriceEstimateCardProps) {
  const updatedAt = new Date(fetchedAt).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-gray-100">
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
          Estimated Resale Value
        </p>
        <h2 className="mt-1 text-5xl font-bold text-black tracking-tight">
          {formatCurrency(stats.median)}
        </h2>
        <p className="mt-1 text-sm text-gray-400">
          Median sold price for {query}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-gray-100">
        <StatCell label="Average" value={formatCurrency(stats.average)} />
        <StatCell label="Median" value={formatCurrency(stats.median)} highlight />
        <StatCell label="Lowest" value={formatCurrency(stats.low)} />
        <StatCell label="Highest" value={formatCurrency(stats.high)} />
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-x-4 gap-y-1 items-center">
        <span className="text-xs text-gray-400">
          Based on {stats.count} sold listing{stats.count !== 1 ? 's' : ''}
        </span>
        <span className="text-xs text-gray-300 hidden sm:inline">·</span>
        <span className="text-xs text-gray-400">
          Sources: {sources.join(', ')}
        </span>
        <span className="text-xs text-gray-300 hidden sm:inline">·</span>
        <span className="text-xs text-gray-400">Updated {updatedAt}</span>
      </div>
    </div>
  );
}

function StatCell({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={`px-5 py-4 ${highlight ? 'bg-gray-50' : ''}`}>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </p>
      <p className={`mt-1 text-xl font-semibold ${highlight ? 'text-black' : 'text-gray-800'}`}>
        {value}
      </p>
    </div>
  );
}
