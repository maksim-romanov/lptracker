// Supported chain configurations for Chainlink feeds - focus on Arbitrum first
export const CHAINLINK_SUPPORTED_CHAINS = {
  42161: {
    name: "arbitrum",
    // RPC is handled by viem chain configuration
  },
  // Other chains can be added later as needed
  // 1: { name: "ethereum" },
  // 56: { name: "bsc" },
  // 137: { name: "polygon" },
  // 43114: { name: "avalanche" },
  // 10: { name: "optimism" },
} as const;

export type SupportedChainId = keyof typeof CHAINLINK_SUPPORTED_CHAINS;

export const CHAINLINK_CONFIG = {
  // Using hardcoded feeds for now - no external URL needed
  cache: {
    priceTtl: 30 * 1000, // 30 seconds
  },
  price: {
    maxStaleTime: 3600, // 1 hour in seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
  },
  // Arbitrum token addresses for testing
  arbitrumTokens: {
    WETH: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
    USDC: "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
    GMX: "0x62edc0692BD897D2295872a9FFCac5425011c661",
  },
} as const;
