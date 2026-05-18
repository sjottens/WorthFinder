import Link from 'next/link';
import { SearchHistoryItem } from '@/types';

interface RelatedProductsProps {
  currentSlug: string;
  items: SearchHistoryItem[];
}

export default function RelatedProducts({
  currentSlug,
  items,
}: RelatedProductsProps) {
  const related = items
    .filter((item) => item.slug !== currentSlug)
    .slice(0, 8);

  if (related.length === 0) return null;

  return (
    <section aria-label="Related product resale values">
      <h2 className="text-xl font-semibold text-black mb-4">
        Related Products
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {related.map((item) => (
          <Link
            key={item.slug}
            href={`/worth/${item.slug}`}
            className="
              block px-4 py-3 rounded-xl border border-gray-200
              text-sm font-medium text-gray-700
              hover:border-gray-400 hover:text-black hover:bg-gray-50
              transition-all duration-100 text-center
            "
          >
            {item.query}
          </Link>
        ))}
      </div>
    </section>
  );
}
