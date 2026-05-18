import { MetadataRoute } from 'next';
import { getAllSlugs } from '@/lib/search-history';
import { getBaseUrl } from '@/lib/utils';

export const revalidate = 86400; // Rebuild sitemap once per day

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl();
  const slugs = getAllSlugs();

  const productPages: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${baseUrl}/worth/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    ...productPages,
  ];
}
