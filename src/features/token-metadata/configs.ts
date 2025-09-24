import type { MetadataProviderConfig } from "./domain/types";

export const METADATA_PROVIDER_CONFIGS: Record<string, MetadataProviderConfig> = {
  trustwallet: {
    name: "Trust Wallet",
    baseUrl: "https://raw.githubusercontent.com/trustwallet/assets/master",
    // No rate limits for GitHub raw content
  },
  coingecko: {
    name: "CoinGecko",
    baseUrl: "https://api.coingecko.com/api/v3",
    rateLimit: {
      requestsPerMinute: 10,
      requestsPerMonth: 10000,
    },
  },
  moralis: {
    name: "Moralis",
    baseUrl: "https://deep-index.moralis.io/api/v2.2",
    apiKey: process.env.MORALIS_API_KEY,
    rateLimit: {
      requestsPerMinute: 100,
      requestsPerMonth: 40000,
    },
  },
};

// Reuse supported chain IDs from token-prices
export { SUPPORTED_CHAIN_IDS, type SupportedChainId } from "../token-prices/configs";
