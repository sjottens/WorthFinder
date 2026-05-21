// Diagnostic: Test what pricing data we get for MacBook Pro 2017
const fs = require('fs');
const path = require('path');

// Load .env.local
const envPath = path.join(__dirname, '.env.local');
let EBAY_APP_ID = process.env.EBAY_APP_ID;
let SERPAPI_KEY = process.env.SERPAPI_KEY;

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const ebayMatch = envContent.match(/EBAY_APP_ID=(.+)/);
  const serpMatch = envContent.match(/SERPAPI_KEY=(.+)/);
  if (ebayMatch) EBAY_APP_ID = ebayMatch[1].trim();
  if (serpMatch) SERPAPI_KEY = serpMatch[1].trim();
}

const EBAY_API_BASE = 'https://svcs.ebay.com/services/search/FindingService/v1';
const SERPAPI_BASE = 'https://serpapi.com/search.json';

const query = 'MacBook Pro 2017 13.3 2.3GHz Core i7 1TB 16GB';

async function testDataSources() {
  console.log('🔍 Price Data Source Diagnostic\n');
  console.log(`Query: "${query}\n"`);
  console.log('═'.repeat(70));

  // Test 1: eBay API
  console.log('\n1️⃣  eBay Finding API');
  console.log('─'.repeat(70));
  if (!EBAY_APP_ID) {
    console.log('❌ EBAY_APP_ID not configured');
  } else {
    const params = new URLSearchParams({
      'OPERATION-NAME': 'findCompletedItems',
      'SERVICE-VERSION': '1.0.0',
      'SECURITY-APPNAME': EBAY_APP_ID,
      'RESPONSE-DATA-FORMAT': 'JSON',
      keywords: query,
      'itemFilter(0).name': 'SoldItemsOnly',
      'itemFilter(0).value': 'true',
      'paginationInput.entriesPerPage': '25',
    });

    try {
      const response = await fetch(
        `${EBAY_API_BASE}?${params.toString()}`,
        { headers: { Accept: 'application/json' } }
      );

      if (!response.ok) {
        console.log(`❌ HTTP ${response.status}`);
      } else {
        const data = await response.json();
        const result = data.findCompletedItemsResponse?.[0];
        
        if (result?.ack?.[0] === 'Success') {
          const items = result.searchResult?.[0]?.item ?? [];
          const soldItems = items.filter(
            (item) => item.sellingStatus?.[0]?.sellingState?.[0] === 'EndedWithSales'
          );

          if (soldItems.length === 0) {
            console.log('✅ Connected, but no listings found');
          } else {
            console.log(`✅ Found ${soldItems.length} sold listings:`);
            const prices = soldItems.slice(0, 5).map((item) => {
              const price = item.sellingStatus?.[0]?.currentPrice?.[0]?.__value__ ?? 'N/A';
              const title = item.title?.[0] ?? 'N/A';
              return { title: title.substring(0, 50), price: parseFloat(price) };
            });
            prices.forEach(({ title, price }) => {
              console.log(`   💰 $${price} — ${title}`);
            });
            const avgPrice = prices.reduce((sum, p) => sum + p.price, 0) / prices.length;
            console.log(`   📊 Average: $${Math.round(avgPrice)}`);
          }
        } else {
          const errorMsg = result?.errorMessage?.[0]?.error?.[0]?.message?.[0];
          console.log(`❌ API Error: ${errorMsg || 'unknown'}`);
        }
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }

  // Test 2: SerpAPI
  console.log('\n2️⃣  SerpAPI (Google Shopping)');
  console.log('─'.repeat(70));
  if (!SERPAPI_KEY) {
    console.log('❌ SERPAPI_KEY not configured');
  } else {
    const params = new URLSearchParams({
      engine: 'google_shopping',
      q: `used ${query}`,
      gl: 'us',
      hl: 'en',
      api_key: SERPAPI_KEY,
      num: '20',
    });

    try {
      const response = await fetch(
        `${SERPAPI_BASE}?${params.toString()}`,
        { headers: { Accept: 'application/json' } }
      );

      if (!response.ok) {
        console.log(`❌ HTTP ${response.status}`);
      } else {
        const data = await response.json();
        const results = data.shopping_results ?? [];
        
        if (results.length === 0) {
          console.log('ℹ️  No shopping results found');
        } else {
          console.log(`✅ Found ${results.length} listings (current market prices):`);
          results.slice(0, 5).forEach((r, i) => {
            if (r.extracted_price) {
              const title = r.title ? r.title.substring(0, 50) : 'N/A';
              console.log(`   💰 $${r.extracted_price} — ${title}`);
            }
          });
          const validPrices = results
            .filter((r) => r.extracted_price)
            .map((r) => r.extracted_price);
          if (validPrices.length > 0) {
            const avgPrice = validPrices.reduce((a, b) => a + b, 0) / validPrices.length;
            console.log(`   📊 Average: $${Math.round(avgPrice)}`);
            console.log(`   ⚠️  Note: These are CURRENT asking prices, not historical sold prices`);
          }
        }
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }

  console.log('\n' + '═'.repeat(70));
  console.log('\n📋 Summary:');
  console.log('   ✓ eBay API returns SOLD prices (historical, accurate)');
  console.log('   ✓ SerpAPI returns CURRENT market prices (may be lower)');
  console.log('   ⚠️  If eBay API is disabled, app falls back to SerpAPI/scraper');
  console.log('   ⚠️  Old MacBooks sell for much less than original asking price');
  console.log('\n💡 Recommendation:');
  console.log('   1. Verify EBAY_APP_ID is set in Netlify environment variables');
  console.log('   2. Prioritize eBay API data over SerpAPI in fetch-product-data.ts');
  console.log('   3. Add a disclaimer about used vs new prices');
}

testDataSources();
