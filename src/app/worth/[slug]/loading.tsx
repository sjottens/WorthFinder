import LoadingSkeleton from '@/components/LoadingSkeleton';

/**
 * Shown by Next.js while the dynamic /worth/[slug] page is rendering.
 * Streaming loading state — appears instantly while SSR data is fetched.
 */
export default function WorthLoading() {
  return <LoadingSkeleton />;
}
