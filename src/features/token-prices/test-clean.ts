import "reflect-metadata";

import { Address } from "viem";

import { GetTokenPriceUseCase } from "./application/use-cases/get-token-price";
import { configureDI, container } from "./config/di-container";

// USDC on Arbitrum
const tokenAddress = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831" as Address;
const chainId = 42161;

console.log(`🔍 Token Price Fetcher`);
console.log(`Token: ${tokenAddress}`);
console.log(`Chain: ${chainId}`);
console.log("");

configureDI();

const getTokenPriceUseCase = container.resolve(GetTokenPriceUseCase);

console.log("🔄 Testing caching functionality...");
console.log("");

// First request - should hit API
console.log("📡 First request (should hit API):");
const start1 = Date.now();
try {
  const tokenPrice1 = await getTokenPriceUseCase.execute(tokenAddress, chainId);
  const time1 = Date.now() - start1;

  console.log("✅ Token Price Retrieved:");
  console.log(`Price: $${tokenPrice1.price}`);
  if (tokenPrice1.priceChange24h !== undefined) {
    const changeSymbol = tokenPrice1.priceChange24h >= 0 ? "+" : "";
    console.log(`24h Change: ${changeSymbol}${tokenPrice1.priceChange24h.toFixed(2)}%`);
  }
  console.log(`Source: ${tokenPrice1.source}`);
  console.log(`Timestamp: ${tokenPrice1.timestamp.toISOString()}`);
  console.log(`Response time: ${time1}ms`);
  console.log("");

  // Second request - should hit cache
  console.log("⚡ Second request (should hit cache):");
  const start2 = Date.now();
  const tokenPrice2 = await getTokenPriceUseCase.execute(tokenAddress, chainId);
  const time2 = Date.now() - start2;

  console.log("✅ Token Price Retrieved:");
  console.log(`Price: $${tokenPrice2.price}`);
  console.log(`Source: ${tokenPrice2.source}`);
  console.log(`Timestamp: ${tokenPrice2.timestamp.toISOString()}`);
  console.log(`Response time: ${time2}ms`);
  console.log("");

  // Compare results
  console.log("📊 Cache Performance:");
  console.log(`First request: ${time1}ms`);
  console.log(`Second request: ${time2}ms`);
  console.log(`Speed improvement: ${Math.round(((time1 - time2) / time1) * 100)}%`);
  console.log(`Same data: ${tokenPrice1.price === tokenPrice2.price ? "✅" : "❌"}`);
  console.log(`Cache hit: ${time2 < time1 / 2 ? "✅" : "❌"}`);
} catch (error) {
  console.error("❌ Failed to get token price:", error instanceof Error ? error.message : error);
}
