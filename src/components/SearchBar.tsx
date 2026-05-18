'use client';

import { useRouter } from 'next/navigation';
import { useState, FormEvent } from 'react';
import { queryToSlug } from '@/lib/utils';

const EXAMPLE_SEARCHES = [
  'Herman Miller Aeron',
  'RH Logic 400',
  'Rolex Submariner',
  'MacBook Pro M3',
  'Dyson V15 Detect',
];

interface SearchBarProps {
  /** Placeholder text for the input */
  placeholder?: string;
  /** Show example search suggestions below the bar */
  showExamples?: boolean;
  /** Pre-fill the input value */
  defaultValue?: string;
  /** Extra Tailwind classes on the wrapper div */
  className?: string;
}

export default function SearchBar({
  placeholder = 'What is your item worth?',
  showExamples = false,
  defaultValue = '',
  className = '',
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);
  const [isLoading, setIsLoading] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setIsLoading(true);
    const slug = queryToSlug(trimmed);
    router.push(`/worth/${slug}`);
  }

  function handleExample(example: string) {
    setQuery(example);
    setIsLoading(true);
    router.push(`/worth/${queryToSlug(example)}`);
  }

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} role="search" aria-label="Product search">
        <div className="flex gap-2">
          <label htmlFor="search-input" className="sr-only">
            Search for a product
          </label>
          <input
            id="search-input"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            autoComplete="off"
            spellCheck={false}
            aria-label="Search for a product to find its resale value"
            className="
              flex-1 px-5 py-4 text-lg rounded-xl border border-gray-200
              shadow-sm outline-none
              focus:border-gray-400 focus:ring-2 focus:ring-gray-200
              placeholder:text-gray-400
              transition-all duration-150
            "
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            aria-label="Find resale value"
            className="
              px-6 py-4 bg-black text-white text-base font-semibold rounded-xl
              hover:bg-gray-800 active:bg-gray-900
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-150 whitespace-nowrap
            "
          >
            {isLoading ? 'Searching…' : 'Find Value'}
          </button>
        </div>
      </form>

      {showExamples && (
        <div className="mt-4 flex flex-wrap gap-2 justify-center" aria-label="Example searches">
          <span className="text-sm text-gray-400 mr-1 self-center">Try:</span>
          {EXAMPLE_SEARCHES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => handleExample(example)}
              className="
                text-sm px-3 py-1.5 rounded-full border border-gray-200
                text-gray-600 hover:border-gray-400 hover:text-black
                transition-colors duration-100
              "
            >
              {example}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
