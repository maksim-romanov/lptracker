import "reflect-metadata";

import { Address } from "viem";

import { GetTokenMetadataUseCase } from "./application/use-cases/get-token-metadata";
import { configureDI, container } from "./config/di-container";
import { CachedMetadataRepository } from "./data/repositories/cached-metadata";
import type { MetadataRepository } from "./domain/repositories";

// Test both zero address (native ETH) and USDC on Arbitrum
const nativeTokenAddress = "0x0000000000000000000000000000000000000000" as Address;
const usdcTokenAddress = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831" as Address;
const chainId = 42161;

console.log(`🔍 Token Metadata Fetcher - Trust Wallet Provider Test`);
console.log(`Testing zero address (native ETH): ${nativeTokenAddress}`);
console.log(`Testing USDC token: ${usdcTokenAddress}`);
console.log(`Chain: ${chainId}`);
console.log("");

configureDI();

const getTokenMetadataUseCase = container.resolve(GetTokenMetadataUseCase);

async function testNativeTokenMetadata() {
  console.log("🔄 Testing NATIVE TOKEN (zero address) - this previously caused errors...");
  console.log("");

  console.log("📡 Fetching native ETH metadata:");
  const start1 = Date.now();
  try {
    const metadata1 = await getTokenMetadataUseCase.execute({ tokenAddress: nativeTokenAddress, chainId });
    const time1 = Date.now() - start1;

    console.log("✅ NATIVE TOKEN Metadata Retrieved:");
    console.log(`Name: ${metadata1.name}`);
    console.log(`Symbol: ${metadata1.symbol}`);
    console.log(`Decimals: ${metadata1.decimals}`);
    console.log(`Logo URL: ${metadata1.logoUrl || "N/A"}`);
    console.log(`Description: ${metadata1.description ? metadata1.description.substring(0, 100) + "..." : "N/A"}`);
    console.log(`Website: ${metadata1.website || "N/A"}`);
    console.log(`Source: ${metadata1.source}`);
    console.log(`Response time: ${time1}ms`);
    console.log("");

    console.log("🎉 SUCCESS: Zero address no longer causes 'Token not found' errors!");
    console.log("");
  } catch (error) {
    console.error("❌ FAILED - Zero address still causing errors:", error instanceof Error ? error.message : error);
    console.log("");
  }
}

async function testRegularTokenMetadata() {
  console.log("🔄 Testing REGULAR TOKEN (USDC) - should work as before...");
  console.log("");

  console.log("📡 Fetching USDC metadata:");
  const start = Date.now();
  try {
    const metadata = await getTokenMetadataUseCase.execute({ tokenAddress: usdcTokenAddress, chainId });
    const time = Date.now() - start;

    console.log("✅ USDC Token Metadata Retrieved:");
    console.log(`Name: ${metadata.name}`);
    console.log(`Symbol: ${metadata.symbol}`);
    console.log(`Decimals: ${metadata.decimals}`);
    console.log(`Logo URL: ${metadata.logoUrl || "N/A"}`);
    console.log(`Description: ${metadata.description ? metadata.description.substring(0, 100) + "..." : "N/A"}`);
    console.log(`Source: ${metadata.source}`);
    console.log(`Response time: ${time}ms`);
    console.log("");
  } catch (error) {
    console.error("❌ Failed to get USDC metadata:", error instanceof Error ? error.message : error);
    console.log("");
  }
}

async function runTests() {
  await testNativeTokenMetadata();
  await testRegularTokenMetadata();

  console.log("🏁 Test completed! Trust Wallet provider should now handle both native and regular tokens.");
}

runTests();
