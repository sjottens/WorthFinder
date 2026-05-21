// Detailed diagnostic test for eBay API
const fs = require('fs');
const path = require('path');

// Load .env.local
const envPath = path.join(__dirname, '.env.local');
let EBAY_APP_ID = process.env.EBAY_APP_ID;

if (!EBAY_APP_ID && fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/EBAY_APP_ID=(.+)/);
  if (match) {
    EBAY_APP_ID = match[1].trim();
  }
}

EBAY_APP_ID = EBAY_APP_ID || 'RogierOt-worthfin-SBX-b1addb012-32b09788';
const EBAY_API_BASE = 'https://svcs.ebay.com/services/search/FindingService/v1';

async function diagnosticTest() {
  console.log('🔍 eBay API Diagnostic Test\n');

  // Try with minimal parameters first
  const minimalParams = new URLSearchParams({
    'OPERATION-NAME': 'findCompletedItems',
    'SERVICE-VERSION': '1.0.0',
    'SECURITY-APPNAME': EBAY_APP_ID,
    'RESPONSE-DATA-FORMAT': 'JSON',
    keywords: 'iPhone',
    'paginationInput.entriesPerPage': '1',
  });

  console.log('Test 1: Minimal parameters');
  console.log('─'.repeat(50));

  try {
    const response = await fetch(
      `${EBAY_API_BASE}?${minimalParams.toString()}`,
      {
        headers: { Accept: 'application/json' },
      }
    );

    console.log(`Status: ${response.status} ${response.statusText}`);
    
    const contentType = response.headers.get('content-type');
    console.log(`Content-Type: ${contentType}`);

    const text = await response.text();
    console.log(`Response length: ${text.length} bytes`);
    
    // Try to parse as JSON
    try {
      const json = JSON.parse(text);
      console.log('Response (JSON):', JSON.stringify(json, null, 2).substring(0, 500));
    } catch (e) {
      console.log('Response (raw text):', text.substring(0, 500));
    }
  } catch (error) {
    console.error('Network Error:', error.message);
  }

  console.log('\n\nTest 2: With item filters');
  console.log('─'.repeat(50));

  const withFilters = new URLSearchParams({
    'OPERATION-NAME': 'findCompletedItems',
    'SERVICE-VERSION': '1.0.0',
    'SECURITY-APPNAME': EBAY_APP_ID,
    'RESPONSE-DATA-FORMAT': 'JSON',
    keywords: 'iPhone',
    'itemFilter(0).name': 'SoldItemsOnly',
    'itemFilter(0).value': 'true',
    sortOrder: 'EndTimeSoonest',
    'paginationInput.entriesPerPage': '1',
  });

  try {
    const response = await fetch(
      `${EBAY_API_BASE}?${withFilters.toString()}`,
      {
        headers: { Accept: 'application/json' },
      }
    );

    console.log(`Status: ${response.status} ${response.statusText}`);
    
    const text = await response.text();
    try {
      const json = JSON.parse(text);
      console.log('Response (JSON):', JSON.stringify(json, null, 2).substring(0, 500));
    } catch (e) {
      console.log('Response (raw):', text.substring(0, 500));
    }
  } catch (error) {
    console.error('Network Error:', error.message);
  }

  console.log('\n\nTest 3: Check App ID validity');
  console.log('─'.repeat(50));
  console.log(`App ID: ${EBAY_APP_ID}`);
  console.log(`Length: ${EBAY_APP_ID.length}`);
  console.log(`Format looks valid: ${EBAY_APP_ID.includes('-')}`);
}

diagnosticTest();
