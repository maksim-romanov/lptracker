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

try {
  const tokenPrice = await getTokenPriceUseCase.execute(tokenAddress, chainId);

  console.log("✅ Token Price Retrieved:");
  console.log(`Price: $${tokenPrice.price}`);
  if (tokenPrice.priceChange24h !== undefined) {
    const changeSymbol = tokenPrice.priceChange24h >= 0 ? "+" : "";
    console.log(`24h Change: ${changeSymbol}${tokenPrice.priceChange24h.toFixed(2)}%`);
  }
  console.log(`Source: ${tokenPrice.source}`);
  console.log(`Timestamp: ${tokenPrice.timestamp.toISOString()}`);
} catch (error) {
  console.error("❌ Failed to get token price:", error instanceof Error ? error.message : error);
}
