import { arbitrum, mainnet } from "viem/chains";
import type { PriceProviderConfig } from "./domain/types";

export const PRICE_PROVIDER_CONFIGS: Record<string, PriceProviderConfig> = {
  defillama: {
    name: "DeFiLlama",
    baseUrl: "https://coins.llama.fi",
    rateLimit: {
      requestsPerMinute: 100, // Free tier: 100 requests per minute
      requestsPerMonth: 10000, // Free tier: 10,000 requests per month
    },
  },
  chainlink: {
    name: "Chainlink",
    baseUrl: "", // No external API - uses blockchain directly
    // No rate limits - reads directly from blockchain
  },
  coingecko: {
    name: "CoinGecko",
    baseUrl: "https://api.coingecko.com/api/v3",
    rateLimit: {
      requestsPerMinute: 10, // Free tier: 10-50 requests per minute
      requestsPerMonth: 10000,
    },
  },
  moralis: {
    name: "Moralis",
    baseUrl: "https://deep-index.moralis.io/api/v2.2",
    apiKey: process.env.MORALIS_API_KEY,
    rateLimit: {
      requestsPerMinute: 100,
      requestsPerMonth: 40000, // Free tier: 40,000 requests per month
    },
  },
};

// Supported chain IDs
export const SUPPORTED_CHAIN_IDS = [
  mainnet.id,
  arbitrum.id,
  137,
  10,
  8453
] as const;

export type SupportedChainId = (typeof SUPPORTED_CHAIN_IDS)[number];
