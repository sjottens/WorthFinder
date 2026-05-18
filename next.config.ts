import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ebayimg.com',
      },
      {
        protocol: 'https',
        hostname: 'thumbs.ebaystatic.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  // Ensure clean URLs and canonical handling
  trailingSlash: false,
};

export default nextConfig;
