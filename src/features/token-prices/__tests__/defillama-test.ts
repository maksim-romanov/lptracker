import "reflect-metadata";

import { Address } from "viem";

import { DeFiLlamaPriceRepository } from "../data/repositories/defillama-price";

// USDC on Arbitrum
const tokenAddress = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831" as Address;
const chainId = 42161;

console.log(`🔍 DeFiLlama API Test`);
console.log(`Token: ${tokenAddress}`);
console.log(`Chain: ${chainId}`);
console.log("");

const repository = new DeFiLlamaPriceRepository();

console.log("🔄 Testing DeFiLlama API...");
console.log("");

try {
  // Test isAvailable first
  console.log("📡 Checking availability...");
  const startAvailable = Date.now();
  const isAvailable = await repository.isAvailable();
  const timeAvailable = Date.now() - startAvailable;

  console.log(`Available: ${isAvailable}`);
  console.log(`Check time: ${timeAvailable}ms`);
  console.log("");

  // Test actual price fetch
  console.log("📡 Fetching price...");
  const startPrice = Date.now();

  const tokenPrice = await repository.getTokenPrice(tokenAddress, chainId);
  const timePrice = Date.now() - startPrice;

  console.log("✅ Token Price Retrieved:");
  console.log(`Price: $${tokenPrice.price}`);
  if (tokenPrice.priceChange24h !== undefined) {
    const changeSymbol = tokenPrice.priceChange24h >= 0 ? "+" : "";
    console.log(`24h Change: ${changeSymbol}${tokenPrice.priceChange24h.toFixed(2)}%`);
  }
  console.log(`Source: ${tokenPrice.source}`);
  console.log(`Timestamp: ${tokenPrice.timestamp.toISOString()}`);
  console.log(`Response time: ${timePrice}ms`);
  console.log("");

  console.log("📊 Performance Summary:");
  console.log(`Availability check: ${timeAvailable}ms`);
  console.log(`Price fetch: ${timePrice}ms`);
  console.log(`Provider: ${repository.getProviderName()}`);

} catch (error) {
  console.log("❌ Error occurred:");
  console.log(error instanceof Error ? error.message : String(error));
  console.log("");

  // Test with different tokens to see if it's a token-specific issue
  console.log("🔄 Testing with different tokens...");

  const testTokens = [
    { address: "0xA0b86a33E6417aAb7b6DbCBbe9FD4E89c0778a4B" as Address, chainId: 1, name: "USDC Ethereum" },
    { address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599" as Address, chainId: 1, name: "WBTC Ethereum" },
  ];

  for (const token of testTokens) {
    try {
      console.log(`\n📡 Testing ${token.name}...`);
      const start = Date.now();
      const price = await repository.getTokenPrice(token.address, token.chainId);
      const time = Date.now() - start;
      console.log(`✅ Success: $${price.price} (${time}ms)`);
    } catch (tokenError) {
      console.log(`❌ Failed: ${tokenError instanceof Error ? tokenError.message : String(tokenError)}`);
    }
  }
}

console.log("\n🏁 Test completed");