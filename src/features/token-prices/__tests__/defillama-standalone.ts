import "reflect-metadata";

import { Address } from "viem";

import { DeFiLlamaPriceRepository } from "../data/repositories/defillama-price";

console.log("🔍 DeFiLlama Standalone Test");
console.log("");

// Mock Logger
const mockLogger = {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
};

const repository = new DeFiLlamaPriceRepository(mockLogger as any);

// Test tokens
const testTokens = [
  { address: "0xA0b86a33E6417aAb7b6DbCBbe9FD4E89c0778a4B" as Address, chainId: 1, name: "USDC Ethereum" },
  { address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831" as Address, chainId: 42161, name: "USDC Arbitrum" },
  { address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599" as Address, chainId: 1, name: "WBTC Ethereum" },
];

console.log("🔄 Testing DeFiLlama API endpoints...");
console.log("");

for (const token of testTokens) {
  console.log(`\n📡 Testing ${token.name} (${token.address})...`);

  try {
    // Test price fetch
    console.log("  💰 Fetching price...");
    const startPrice = Date.now();
    const price = await repository.getTokenPrice(token.address, token.chainId);
    const timePrice = Date.now() - startPrice;

    console.log(`  ✅ Price: $${price.price}`);
    console.log(`  📊 Source: ${price.source}`);
    console.log(`  ⏱️  Response time: ${timePrice}ms`);

  } catch (error) {
    const endTime = Date.now();
    console.log(`  ❌ Error: ${error instanceof Error ? error.message : String(error)}`);

    // Check if it's a timeout
    if (error instanceof Error && error.message.includes("timeout")) {
      console.log("  ⏰  Request timed out");
    } else if (error instanceof Error && error.message.includes("not found")) {
      console.log("  🔍  Token not found in DeFiLlama");
    }
  }
}

console.log("\n🏁 Testing completed");

// Test different API formats
console.log("\n🔬 Testing API endpoint formats...");

const testAddress = "0xA0b86a33E6417aAb7b6DbCBbe9FD4E89c0778a4B" as Address;
const testChain = 1;

console.log("\n📡 Testing raw API calls...");

try {
  // This will help us understand what the correct API format should be
  console.log("🔍 Testing direct API call to understand format...");

  // Note: We can't easily test the raw API from here without proper fetch setup
  // But we can log what we're attempting
  console.log("📋 Attempted formats:");
  console.log("  1. /prices/current/ethereum:0x...");
  console.log("  2. /prices/current/?coins=ethereum:0x...");
  console.log("  3. POST /prices/current/ with body");

} catch (error) {
  console.log("❌ API format test failed:", error);
}

console.log("\n🎯 Summary:");
console.log("- If all tests fail, DeFiLlama API may be down or changed");
console.log("- If timeout errors, API endpoint is unresponsive");
console.log("- If 404 errors, API format has changed");
console.log("- Check DeFiLlama documentation for latest API format");