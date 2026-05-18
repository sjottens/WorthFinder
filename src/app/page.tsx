import type { Metadata } from 'next';
import SearchBar from '@/components/SearchBar';
import Link from 'next/link';
import { getPopularSearches } from '@/lib/search-history';

export const metadata: Metadata = {
  title: 'WorthFinder — What Is Your Item Worth? (Live Price Guide)',
  description:
    'Instantly find the resale value of any product. WorthFinder shows live market prices from real sold listings on eBay and other platforms.',
  alternates: { canonical: '/' },
};

export default function HomePage() {
  const popularSearches = getPopularSearches(8);

  return (
    <main className="flex flex-col items-center justify-center px-4 py-20 animate-fade-in">
      {/* Hero */}
      <div className="text-center mb-10 max-w-xl">
        <h1 className="text-4xl sm:text-5xl font-bold text-black tracking-tight leading-tight mb-4">
          What is your item worth?
        </h1>
        <p className="text-lg text-gray-500">
          Get a live resale estimate based on real sold listings — no guessing,
          no static data.
        </p>
      </div>

      {/* Search bar */}
      <SearchBar
        showExamples
        className="w-full max-w-xl"
        placeholder="e.g. Herman Miller Aeron, Rolex Submariner…"
      />

      {/* Popular searches */}
      {popularSearches.length > 0 && (
        <section className="mt-16 w-full max-w-xl" aria-label="Popular searches">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4 text-center">
            Popular right now
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {popularSearches.map((item) => (
              <Link
                key={item.slug}
                href={`/worth/${item.slug}`}
                className="
                  block px-4 py-3 rounded-xl border border-gray-200
                  text-sm text-gray-700 font-medium text-center
                  hover:border-gray-400 hover:text-black hover:bg-gray-50
                  transition-all duration-100
                "
              >
                {item.query}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="mt-20 w-full max-w-xl" aria-label="How WorthFinder works">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-6 text-center">
          How it works
        </h2>
        <div className="grid sm:grid-cols-3 gap-6 text-center">
          {[
            { step: '1', title: 'Search any product', body: 'Type any item name into the search bar.' },
            { step: '2', title: 'We fetch live data', body: 'We pull real sold listings from eBay and other sources instantly.' },
            { step: '3', title: 'See the real value', body: 'View average, median, low, and high prices with a confidence score.' },
          ].map(({ step, title, body }) => (
            <div key={step} className="px-4">
              <div className="w-8 h-8 rounded-full bg-gray-100 text-sm font-bold text-gray-600 flex items-center justify-center mx-auto mb-3">
                {step}
              </div>
              <h3 className="text-sm font-semibold text-gray-800 mb-1">{title}</h3>
              <p className="text-sm text-gray-500">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
