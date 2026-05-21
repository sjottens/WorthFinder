// Test script to verify eBay API integration
const fs = require('fs');
const path = require('path');

// Load .env.local
const envPath = path.join(__dirname, '.env.local');
let EBAY_APP_ID = process.argv[2] || process.env.EBAY_APP_ID;

if (!EBAY_APP_ID && fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/EBAY_APP_ID=(.+)/);
  if (match) {
    EBAY_APP_ID = match[1].trim();
  }
}

EBAY_APP_ID = EBAY_APP_ID || 'RogierOt-worthfin-SBX-b1addb012-32b09788';
const EBAY_API_BASE = 'https://svcs.ebay.com/services/search/FindingService/v1';

async function testEbayAPI() {
  console.log('🧪 Testing eBay API Integration...\n');
  console.log('📋 Configuration:');
  console.log(`   App ID: ${EBAY_APP_ID}`);
  console.log(`   API Base: ${EBAY_API_BASE}\n`);

  // Test with a common product
  const testProducts = [
    'iPhone 14',
    'PlayStation 5',
    'MacBook Pro',
  ];

  for (const product of testProducts) {
    console.log(`\n📦 Testing query: "${product}"`);
    console.log('═'.repeat(50));
    
    const params = new URLSearchParams({
      'OPERATION-NAME': 'findCompletedItems',
      'SERVICE-VERSION': '1.0.0',
      'SECURITY-APPNAME': EBAY_APP_ID,
      'RESPONSE-DATA-FORMAT': 'JSON',
      keywords: product,
      'itemFilter(0).name': 'SoldItemsOnly',
      'itemFilter(0).value': 'true',
      'itemFilter(1).name': 'ListingType',
      'itemFilter(1).value(0)': 'AuctionWithBIN',
      'itemFilter(1).value(1)': 'FixedPrice',
      'itemFilter(1).value(2)': 'Auction',
      'itemFilter(2).name': 'LocatedIn',
      'itemFilter(2).value': 'US',
      sortOrder: 'EndTimeSoonest',
      'paginationInput.entriesPerPage': '25',
    });

    try {
      console.log('⏳ Fetching from eBay...');
      const response = await fetch(
        `${EBAY_API_BASE}?${params.toString()}`,
        {
          headers: { Accept: 'application/json' },
        }
      );

      if (!response.ok) {
        console.error(`❌ HTTP ${response.status}`);
        continue;
      }

      const data = await response.json();
      const result = data.findCompletedItemsResponse?.[0];

      if (result?.ack?.[0] !== 'Success') {
        const msg = result?.errorMessage?.[0]?.error?.[0]?.message?.[0];
        console.error(`❌ API Error: ${msg || 'unknown'}`);
        continue;
      }

      const items = result.searchResult?.[0]?.item ?? [];
      const soldItems = items.filter(
        (item) => item.sellingStatus?.[0]?.sellingState?.[0] === 'EndedWithSales'
      );

      console.log(`✅ Success! Found ${soldItems.length} sold items`);

      if (soldItems.length > 0) {
        console.log('\n📊 Sample results:');
        soldItems.slice(0, 3).forEach((item, idx) => {
          const price = item.sellingStatus?.[0]?.currentPrice?.[0]?.__value__ ?? 'N/A';
          const title = item.title?.[0] ?? 'N/A';
          const condition = item.condition?.[0]?.conditionDisplayName?.[0] ?? 'N/A';
          console.log(`\n   ${idx + 1}. ${title.substring(0, 60)}...`);
          console.log(`      💰 Price: $${price}`);
          console.log(`      📦 Condition: ${condition}`);
        });
      }
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
    }
  }

  console.log('\n' + '═'.repeat(50));
  console.log('✅ Test complete!');
}

testEbayAPI();
