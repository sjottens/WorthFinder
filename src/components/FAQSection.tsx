import { PriceStats } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface FAQSectionProps {
  query: string;
  stats: PriceStats | null;
  slug: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQSection({ query, stats, slug: _slug }: FAQSectionProps) {
  const avgPrice = stats ? formatCurrency(stats.median) : 'varies';
  const lowPrice = stats ? formatCurrency(stats.low) : 'N/A';
  const highPrice = stats ? formatCurrency(stats.high) : 'N/A';

  const faqs: FAQItem[] = [
    {
      question: `What is the resale value of ${query}?`,
      answer: `Based on recent sold listings, the average resale value of ${query} is approximately ${avgPrice}. Prices range from ${lowPrice} to ${highPrice} depending on condition, included accessories, and regional demand.`,
    },
    {
      question: `Where can I sell my ${query}?`,
      answer: `The most popular platforms to sell ${query} are eBay, Facebook Marketplace, Craigslist, and local classifieds. eBay typically offers the largest buyer pool, while Facebook Marketplace is best for local, cash sales with no shipping.`,
    },
    {
      question: `What factors affect the resale value of ${query}?`,
      answer: `Key factors include: physical condition (scratches, dents, wear), completeness (original box, manuals, accessories), age, and local supply and demand. Items in "like new" condition typically fetch 20–40% more than well-used items.`,
    },
    {
      question: `How accurate is the estimated resale value for ${query}?`,
      answer: `WorthFinder calculates estimates from real sold listings pulled directly from active marketplaces. Prices are refreshed every 6 hours. The confidence score shown on this page indicates how reliable the estimate is based on the number of listings and price consistency.`,
    },
    {
      question: `Is ${query} a good investment to resell?`,
      answer: `Check the trend indicator on this page. A rising trend means prices are increasing and resale potential is improving. A falling trend suggests the market is saturated or the item is depreciating. Always compare your purchase price to the median sold price before buying for resale.`,
    },
  ];

  return (
    <section aria-label="Frequently asked questions" className="mt-2">
      <h2 className="text-xl font-semibold text-black mb-5">
        Frequently Asked Questions
      </h2>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <details
            key={index}
            className="group rounded-xl border border-gray-200 overflow-hidden"
          >
            <summary className="flex justify-between items-center px-5 py-4 cursor-pointer list-none hover:bg-gray-50 transition-colors">
              <h3 className="text-sm font-semibold text-gray-800 pr-4">
                {faq.question}
              </h3>
              <span
                className="shrink-0 text-gray-400 group-open:rotate-180 transition-transform duration-200 text-lg leading-none"
                aria-hidden="true"
              >
                ↓
              </span>
            </summary>
            <div className="px-5 pb-4 pt-1 border-t border-gray-100">
              <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
