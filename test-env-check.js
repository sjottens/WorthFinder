// Simple test to show what app ID the production site is using
const fs = require('fs');
const path = require('path');

// In production (Netlify), process.env should have EBAY_APP_ID from environment variables
// In local dev, it comes from .env.local

console.log('🔍 Environment Variable Check\n');
console.log('LOCAL DEVELOPMENT:');
console.log(`  .env.local exists: ${fs.existsSync(path.join(__dirname, '.env.local'))}`);

if (fs.existsSync(path.join(__dirname, '.env.local'))) {
  const content = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8');
  const match = content.match(/EBAY_APP_ID=(.+)/);
  if (match) {
    const key = match[1].trim();
    const isProd = key.includes('-PRD-');
    const isSandbox = key.includes('-SBX-');
    console.log(`  EBAY_APP_ID: ${key.substring(0, 20)}...${key.substring(key.length - 10)}`);
    console.log(`  Type: ${isProd ? '✅ PRODUCTION' : isSandbox ? '⚠️ SANDBOX' : '❓ UNKNOWN'}`);
  }
}

console.log('\nPRODUCTION (Netlify):');
console.log(`  process.env.EBAY_APP_ID set: ${!!process.env.EBAY_APP_ID}`);
if (process.env.EBAY_APP_ID) {
  const key = process.env.EBAY_APP_ID;
  const isProd = key.includes('-PRD-');
  const isSandbox = key.includes('-SBX-');
  console.log(`  EBAY_APP_ID: ${key.substring(0, 20)}...${key.substring(key.length - 10)}`);
  console.log(`  Type: ${isProd ? '✅ PRODUCTION' : isSandbox ? '⚠️ SANDBOX' : '❓ UNKNOWN'}`);
}

console.log('\n📝 Note: In production, this test will show Netlify\'s environment variables.');
console.log('         If the production key is set, pricing should work normally.');
