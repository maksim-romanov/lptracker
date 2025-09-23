import "reflect-metadata";

import { Address } from "viem";

import { GetTokenMetadataUseCase } from "./application/use-cases/get-token-metadata";
import { configureDI, container } from "./config/di-container";
import { CachedMetadataRepository } from "./data/repositories/cached-metadata";
import type { MetadataRepository } from "./domain/repositories";

// USDC on Arbitrum
const tokenAddress = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831" as Address;
const chainId = 42161;

console.log(`🔍 Token Metadata Fetcher`);
console.log(`Token: ${tokenAddress}`);
console.log(`Chain: ${chainId}`);
console.log("");

configureDI();

const getTokenMetadataUseCase = container.resolve(GetTokenMetadataUseCase);

async function testMetadataFetching() {
  console.log("🔄 Testing metadata fetching with caching...");
  console.log("");

  // First request - should hit API
  console.log("📡 First request (should hit API):");
  const start1 = Date.now();
  try {
    const metadata1 = await getTokenMetadataUseCase.execute({ tokenAddress, chainId });
    const time1 = Date.now() - start1;

    console.log("✅ Token Metadata Retrieved:");
    console.log(`Name: ${metadata1.name}`);
    console.log(`Symbol: ${metadata1.symbol}`);
    console.log(`Decimals: ${metadata1.decimals}`);
    console.log(`Logo URL: ${metadata1.logoUrl || "N/A"}`);
    console.log(`Description: ${metadata1.description ? metadata1.description.substring(0, 100) + "..." : "N/A"}`);
    console.log(`Website: ${metadata1.website || "N/A"}`);
    console.log(`Source: ${metadata1.source}`);
    console.log(`Timestamp: ${metadata1.timestamp.toISOString()}`);
    console.log(`Response time: ${time1}ms`);
    console.log("");

    // Second request - should hit cache
    console.log("⚡ Second request (should hit cache):");
    const start2 = Date.now();
    const metadata2 = await getTokenMetadataUseCase.execute({ tokenAddress, chainId });
    const time2 = Date.now() - start2;

    console.log("✅ Token Metadata Retrieved:");
    console.log(`Name: ${metadata2.name}`);
    console.log(`Symbol: ${metadata2.symbol}`);
    console.log(`Logo URL: ${metadata2.logoUrl || "N/A"}`);
    console.log(`Source: ${metadata2.source}`);
    console.log(`Timestamp: ${metadata2.timestamp.toISOString()}`);
    console.log(`Response time: ${time2}ms`);
    console.log("");

    // Compare results
    console.log("📊 Cache Performance:");
    console.log(`First request: ${time1}ms`);
    console.log(`Second request: ${time2}ms`);
    console.log(`Speed improvement: ${Math.round(((time1 - time2) / time1) * 100)}%`);
    console.log(`Same data: ${metadata1.name === metadata2.name ? "✅" : "❌"}`);
    console.log(`Cache hit: ${time2 < time1 / 2 ? "✅" : "❌"}`);
  } catch (error) {
    console.error("❌ Failed to get token metadata:", error instanceof Error ? error.message : error);
  }
}

testMetadataFetching();
