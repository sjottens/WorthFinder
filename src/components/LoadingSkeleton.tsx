export function PriceCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden animate-pulse">
      <div className="px-6 pt-6 pb-4 border-b border-gray-100">
        <div className="h-3 w-32 bg-gray-200 rounded mb-3" />
        <div className="h-12 w-48 bg-gray-200 rounded mb-2" />
        <div className="h-3 w-40 bg-gray-200 rounded" />
      </div>
      <div className="grid grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="px-5 py-4 border-r border-gray-100 last:border-r-0">
            <div className="h-3 w-16 bg-gray-200 rounded mb-2" />
            <div className="h-6 w-20 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
        <div className="h-3 w-64 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

export function ConfidenceSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 p-5 animate-pulse">
      <div className="flex justify-between mb-3">
        <div className="h-4 w-28 bg-gray-200 rounded" />
        <div className="h-4 w-24 bg-gray-200 rounded" />
      </div>
      <div className="h-2.5 bg-gray-200 rounded-full" />
      <div className="mt-4 grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-lg p-2">
            <div className="h-3 w-16 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-10 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ListingSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-5 py-4 border-b border-gray-100 last:border-b-0"
        >
          <div className="h-6 w-20 bg-gray-200 rounded shrink-0" />
          <div className="flex-1">
            <div className="h-4 w-3/4 bg-gray-200 rounded mb-1.5" />
            <div className="h-3 w-1/3 bg-gray-200 rounded" />
          </div>
          <div className="h-5 w-16 bg-gray-200 rounded-full shrink-0" />
        </div>
      ))}
    </div>
  );
}

/** Full-page loading skeleton for /worth/[slug] */
export default function LoadingSkeleton() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      {/* Breadcrumb skeleton */}
      <div className="flex gap-2 mb-6 animate-pulse">
        <div className="h-4 w-12 bg-gray-200 rounded" />
        <div className="h-4 w-4 bg-gray-200 rounded" />
        <div className="h-4 w-36 bg-gray-200 rounded" />
      </div>

      {/* H1 skeleton */}
      <div className="h-9 w-80 bg-gray-200 rounded mb-2 animate-pulse" />
      <div className="h-5 w-64 bg-gray-200 rounded mb-8 animate-pulse" />

      <PriceCardSkeleton />

      <div className="mt-6 grid sm:grid-cols-2 gap-4">
        <ConfidenceSkeleton />
        <ConfidenceSkeleton />
      </div>

      <div className="mt-8">
        <div className="h-6 w-40 bg-gray-200 rounded mb-4 animate-pulse" />
        <ListingSkeleton />
      </div>
    </main>
  );
}
