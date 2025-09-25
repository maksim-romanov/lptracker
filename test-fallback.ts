import "reflect-metadata";

import { Address } from "viem";

import { GetTokenPriceUseCase } from "./src/features/token-prices/application/use-cases/get-token-price";
import { configureDI, container } from "./src/features/token-prices/config/di-container";

// Test token that is not supported by Chainlink but should be available via CoinGecko/Moralis
// ARB token on Arbitrum
const tokenAddress = "0x912ce59144191c1204e64559fe8253a0e49e6548" as Address;
const chainId = 42161;

console.log(`🔍 Testing Fallback Mechanism`);
console.log(`Token: ${tokenAddress} (ARB - likely not in Chainlink)`);
console.log(`Chain: ${chainId}`);
console.log("");

configureDI();

const getTokenPriceUseCase = container.resolve(GetTokenPriceUseCase);

console.log("📡 Fetching price (should fallback from Chainlink to external APIs):");
const start = Date.now();

try {
  const tokenPrice = await getTokenPriceUseCase.execute({ tokenAddress, chainId });
  const time = Date.now() - start;

  console.log("✅ Token Price Retrieved:");
  console.log(`Price: $${tokenPrice.price}`);
  if (tokenPrice.priceChange24h !== undefined) {
    const changeSymbol = tokenPrice.priceChange24h >= 0 ? "+" : "";
    console.log(`24h Change: ${changeSymbol}${tokenPrice.priceChange24h.toFixed(2)}%`);
  }
  console.log(`Source: ${tokenPrice.source}`);
  console.log(`Timestamp: ${tokenPrice.timestamp.toISOString()}`);
  console.log(`Response time: ${time}ms`);

  if (tokenPrice.source === "Chainlink") {
    console.log("🟡 Unexpected: Price came from Chainlink (this token should not be supported)");
  } else {
    console.log("✅ Expected: Price came from external API fallback");
  }
} catch (error) {
  console.error("❌ Failed to fetch price:", error);
}
