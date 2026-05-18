import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { getBaseUrl } from '@/lib/utils';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const siteUrl = getBaseUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'WorthFinder — Live Resale Value Estimator',
    template: '%s | WorthFinder',
  },
  description:
    'Find the live resale value of any product instantly. WorthFinder calculates real-time market prices from eBay sold listings and other sources.',
  keywords: [
    'resale value',
    'what is my item worth',
    'second hand price',
    'used price estimator',
    'eBay sold prices',
    'resell calculator',
  ],
  authors: [{ name: 'WorthFinder' }],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'WorthFinder',
    title: 'WorthFinder — Live Resale Value Estimator',
    description:
      'Find the live resale value of any product instantly based on real sold listings.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'WorthFinder — Live Resale Value Estimator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WorthFinder — Live Resale Value Estimator',
    description:
      'Find the live resale value of any product instantly based on real sold listings.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <meta name="google-adsense-account" content="ca-pub-5016673566357322" />
        
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-2T36DTQ63N"></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-2T36DTQ63N');
          `
        }} />
        
        {/* Google AdSense */}
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5016673566357322"
             crossOrigin="anonymous"></script>
        
        {/* Preconnect to key external hosts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://svcs.ebay.com" />
      </head>
      <body className="bg-white text-black min-h-screen flex flex-col" suppressHydrationWarning>
        {/* Site header */}
        <header className="border-b border-gray-100 bg-white sticky top-0 z-50">
          <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
            <a href="/" className="font-bold text-lg tracking-tight hover:opacity-80 transition-opacity">
              WorthFinder
            </a>
            <span className="text-xs text-gray-400 hidden sm:block">
              Live Resale Value Estimator
            </span>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1">
          {children}
        </div>

        {/* Site footer */}
        <footer className="border-t border-gray-100 mt-16">
          <div className="max-w-3xl mx-auto px-4 py-8 text-center text-xs text-gray-400 space-y-1">
            <p>
              Prices are estimates based on recent sold listings and may not
              reflect exact current market value. Data refreshed every 6 hours.
            </p>
            <p>
              © {new Date().getFullYear()} WorthFinder. Not affiliated with eBay
              Inc. or any marketplace.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
