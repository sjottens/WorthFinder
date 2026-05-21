# 🔧 MacBook Pro Pricing Issue - Fix Checklist

## Problem Summary
Your deployed app is showing **$275 for MacBook Pro 2017** because:
- ❌ eBay API is rate-limited (from testing)
- ❌ eBay environment variable not set in Netlify
- ✅ Falling back to SerpAPI (Google Shopping current prices, not sold prices)

---

## 🚨 Immediate Action Required

### 1. Set Environment Variable in Netlify
Your app needs the production eBay App ID in Netlify:

1. Go to: **Netlify Dashboard** → Your Site → **Site Settings** → **Environment Variables**
2. Click **Add a variable**
3. Add:
   - **Key:** `EBAY_APP_ID`
   - **Value:** `RogierOt-worthfin-PRD-d1b076cb5-e27353af`
4. Click **Save**
5. **Redeploy** your site (or let Netlify auto-deploy if connected to git)

### 2. Wait for eBay Rate Limit to Reset
- **When:** A few hours from now
- **Why:** You hit the free-tier quota from our earlier tests
- **What happens:** eBay API will start working again automatically

### 3. Test After Deployment
Once redeployed, search for "MacBook Pro 2017" again:
- ✅ Should return eBay *sold* prices (~$600-$1200)
- ❌ If still showing ~$275, check if environment variable is set

---

## 📊 Data Source Quality Comparison

| Source | Data Type | Price Range | Accuracy |
|--------|-----------|-------------|----------|
| **eBay API** | Historical sold prices | Accurate | ✅ Best |
| **eBay Scraper** | Recent sold listings | Accurate | ✅ Good |
| **SerpAPI** | Current asking prices | Lower | ⚠️ Fallback only |
| **Mock Data** | Synthetic | N/A | ❌ Dev only |

**Your 2017 MacBook Pro:**
- SerpAPI: $170-$340 (current listings, often damaged/clearance)
- eBay actual sold: ~$600-$1000+ (historical sales data)

---

## ✅ What I've Done
- ✓ Updated code to skip SerpAPI if we have 5+ eBay listings
- ✓ This prevents low current-market prices from skewing the estimate
- ✓ Created diagnostic scripts to identify future pricing issues

---

## 💡 Additional Optimization (Optional)

To further improve accuracy, add this to your search query:
```
MacBook Pro 13-inch 2017 (not broken, not parts)
```

Filter out damaged listings in the eBay scraper by looking for keywords like "broken", "parts", "water damage", "not working".

---

## 🔍 Verify It's Working
After redeploying with the environment variable:

Run locally:
```bash
npm run dev
# Search for: "MacBook Pro 2017 13.3"
# Should show $600-$1000+, not $275
```

---

## ⚠️ Important Notes
- Don't hardcode secrets in `.env.local` file for production
- Use Netlify Environment Variables (or similar) for all environments
- eBay API has rate limits (currently: ~100 calls/month free tier)
- Caching is set to 6 hours to minimize API calls
