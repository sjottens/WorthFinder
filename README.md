# WorthFinder

**Live Resale Value Estimator** — Find what any second-hand product is worth right now.

WorthFinder is a production-ready, SEO-first Next.js 15 application. It pulls real sold listings from eBay and Google Shopping, calculates price statistics on the fly, and renders fully SSR'd product pages optimised for Google rankings.

---

## Features

- **Live pricing** from eBay Finding API + SerpAPI (Google Shopping fallback)
- **Dynamic product pages** at `/worth/[slug]` — e.g. `/worth/herman-miller-aeron`
- **Price statistics**: average, median, low, high (outliers removed via IQR)
- **Confidence score** (0–100) based on result count, price consistency, and recency
- **Price trend indicator** (rising / stable / falling)
- **6-hour ISR caching** — fast responses, fresh data
- **Full SEO suite** per page: title, meta description, canonical, OG, Twitter card, JSON-LD (Product + FAQPage + BreadcrumbList), XML sitemap, robots.txt
- **Programmatic SEO** — every search auto-creates a page and is added to the sitemap
- **Loading skeletons** for instant perceived performance
- **Minimal JS** — server components by default, client-only where interaction is needed
- **Netlify-ready** deployment

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v3 |
| Primary data | eBay Finding API |
| Fallback data | SerpAPI (Google Shopping) |
| Caching | Next.js ISR (`revalidate: 21600`) |
| Deployment | Netlify + `@netlify/plugin-nextjs` |

---

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/yourname/worthfinder.git
cd worthfinder
npm install
```

### 2. Configure environment variables (optional)

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API keys (or leave empty to use mock data):

```env
# Optional — eBay app ID (pending review? Skip for now)
EBAY_APP_ID=your_ebay_app_id

# Optional — SerpAPI key (recommended if eBay not ready)
SERPAPI_KEY=your_serpapi_key

# Your production domain
NEXT_PUBLIC_SITE_URL=https://worthfinder.com
```

**No keys needed right now** — the app works with realistic mock data until your eBay approval comes through.

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Getting API Keys

### ⚡ Free Options (Recommended)

**Option 1: eBay + Mock Data (Completely Free)**
- No APIs needed for testing
- Use mock data until your eBay App ID arrives
- When eBay is approved: live data instantly (no code changes)

**Option 2: Gratis Alternatives (Production)**

| Service | Tier | Requests/Month | Cost | Notes |
|---|---|---|---|---|
| **eBay Finding API** | Free | 5,000/day | $0 | Official eBay API (pending review) |
| **Google Shopping Feed** | Free | 100/day | $0 | Via Google's free data exports |
| **Kaggle API** | Free | Unlimited | $0 | Historical marketplace data |
| **Web Scraping** (cheerio) | Free | Unlimited* | $0 | Direct HTML parsing (⚠️ slow, check ToS) |
| **SerpAPI** | Trial | 100 | $0 | Free trial, then paid |

*Direct scraping: be respectful of robots.txt and rate limits

### ⚠️ Security Note

**NEVER commit real API keys to git!** The `.env.example` now has placeholder values only.

### Quick Start: Use Only eBay + Mock Data

No additional setup needed. The app works perfectly with:
1. eBay API (when approved) — best option
2. Mock data (always available) — realistic development data

### eBay Finding API (free, recommended)

1. Go to [developer.ebay.com](https://developer.ebay.com)
2. Create an account and register a new application
3. Copy your **App ID (Client ID)** — this is `EBAY_APP_ID`
4. The Finding API has a generous free tier (5,000 calls/day)
5. **Note**: New app IDs are pending review (can take 1–2 weeks)

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout, global SEO, header/footer
│   ├── page.tsx                # Homepage — search bar + popular items
│   ├── sitemap.ts              # Auto-generated XML sitemap
│   ├── robots.ts               # robots.txt
│   └── worth/[slug]/
│       ├── page.tsx            # SSR product page with full SEO
│       └── loading.tsx         # Streaming loading skeleton
├── components/
│   ├── SearchBar.tsx           # Client search input with router navigation
│   ├── PriceEstimateCard.tsx   # Primary price display (median + range)
│   ├── PriceHistoryList.tsx    # Table of individual sold listings
│   ├── ConfidenceScore.tsx     # 0–100 data quality score
│   ├── TrendIndicator.tsx      # Rising / Stable / Falling badge
│   ├── FAQSection.tsx          # Accordion FAQ — SEO rich content
│   ├── RelatedProducts.tsx     # Internal links to related pages
│   ├── Breadcrumbs.tsx         # Accessibility + SEO breadcrumb trail
│   └── LoadingSkeleton.tsx     # Skeleton screens for all sections
├── lib/
│   ├── ebay.ts                 # eBay Finding API integration
│   ├── serpapi.ts              # SerpAPI Google Shopping integration
│   ├── fetch-product-data.ts   # Orchestrates sources, deduplicates
│   ├── pricing.ts              # Stats, trend, confidence calculations
│   ├── search-history.ts       # Persist & serve popular searches
│   ├── rate-limit.ts           # In-memory sliding window rate limiter
│   └── utils.ts                # Slug, currency, date helpers
└── types/
    └── index.ts                # Shared TypeScript interfaces
```

---

## Deployment — Netlify

### One-click deploy

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)

### Manual steps

1. Push your repo to GitHub
2. Create a new Netlify site from the repo
3. Add environment variables in **Site Settings → Environment Variables**:
   - `EBAY_APP_ID`
   - `SERPAPI_KEY`
   - `NEXT_PUBLIC_SITE_URL` (your Netlify domain)
4. Netlify auto-detects `netlify.toml` and uses `@netlify/plugin-nextjs`

### Production database (recommended upgrade)

The default search history uses a local JSON file (works in dev; resets on Netlify cold starts). For persistent popular searches and sitemap growth:

- **Netlify Blobs** — zero-config key-value store (add to `search-history.ts`)
- **Turso** (SQLite-on-the-edge) — lightweight, free tier
- **PlanetScale** — MySQL compatible serverless DB

---

## SEO Architecture

Every `/worth/[slug]` page includes:

| Signal | Implementation |
|---|---|
| `<title>` | `{Product} Resale Value (Live Price Guide {Year})` |
| `<meta description>` | Dynamic, includes current median price |
| Canonical URL | `<link rel="canonical">` per page |
| Open Graph | Full `og:title`, `og:description`, `og:image` |
| Twitter Card | `summary_large_image` |
| JSON-LD — Product | `AggregateOffer` with live low/high price |
| JSON-LD — FAQPage | 3 product-specific Q&A pairs |
| JSON-LD — BreadcrumbList | Home → Product page |
| Sitemap | Auto-updated as new searches are made |
| robots.txt | Allows all crawlers |
| Heading structure | `H1` (product name), `H2` (sections), `H3` (FAQ) |
| Internal links | RelatedProducts grid links to 8 related pages |
| Semantic HTML | `<main>`, `<nav>`, `<section>`, `<article>`, `<footer>` |

---

## Performance

Target: **Lighthouse 95+**

| Technique | Where |
|---|---|
| SSR by default | All product pages |
| ISR (6h revalidate) | Avoids redundant API calls |
| `next/font` with `display: swap` | No CLS from font loading |
| No unnecessary client JS | Server components for all static UI |
| Loading skeletons | Streaming `loading.tsx` |
| `next/image` ready | `remotePatterns` configured for eBay CDN |
| Minimal bundle | Only SearchBar is a Client Component |

---

## Development Notes

### Testing without API keys

1. `npm run dev` (mock data will auto-activate)
2. Search for any product — see realistic estimates
3. Add real API keys later; live data will replace mocks automatically

### Mock data feature (`src/lib/mock-data.ts`)

- Generates 15 realistic listings per query
- Prices ±25% variance around a knowledge base (Herman Miller Aeron → $450 base)
- Dates randomized over the past 30 days
- Conditions: Like New / Excellent / Good / Fair
- Marked as `source: 'serpapi'` for UI clarity

### Rate Limiting

Outbound API calls are protected by an in-memory sliding-window limiter (`src/lib/rate-limit.ts`). For multi-instance production deployments, replace with a Redis-backed limiter (e.g. [Upstash](https://upstash.com/)).

---

## License

MIT
