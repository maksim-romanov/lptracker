// Supported chain configurations for Chainlink feeds
export const CHAINLINK_SUPPORTED_CHAINS = {
  1: { name: "ethereum" },
  56: { name: "bsc" },
  137: { name: "polygon" },
  43114: { name: "avalanche" },
  42161: { name: "abitrum" }, // Note: API has typo "abitrum" instead of "arbitrum"
  10: { name: "optimism" },
} as const;

export type SupportedChainId = keyof typeof CHAINLINK_SUPPORTED_CHAINS;

export const CHAINLINK_SUPPORTED_CHAIN_IDS = Object.keys(CHAINLINK_SUPPORTED_CHAINS).map(Number);

// Token address to Chainlink feed name mapping per chain
export const CHAINLINK_TOKEN_FEED_MAPPING: Record<SupportedChainId, Record<string, string>> = {
  1: {
    // Ethereum mainnet tokens (examples - add more as needed)
    "0x0000000000000000000000000000000000000000": "ETH/USD", // ETH
    "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2": "ETH/USD", // WETH
    "0xa0b86a33e6411cb66cf0e2b6aad00a0f0b8b2b4f": "BTC/USD", // WBTC
    "0xa0b73e1ff0b80914ab6fe0444e65848c4c34450b": "USDC/USD", // USDC
  },
  56: {
    // BSC tokens (examples - add more as needed)
    "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c": "BNB/USD", // WBNB
    "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d": "USDC/USD", // USDC
  },
  137: {
    // Polygon tokens (examples - add more as needed)
    "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270": "MATIC/USD", // WMATIC
    "0x2791bca1f2de4661ed88a30c99a7a9449aa84174": "USDC/USD", // USDC
  },
  43114: {
    // Avalanche tokens (examples - add more as needed)
    "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7": "AVAX/USD", // WAVAX
    "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e": "USDC/USD", // USDC
  },
  42161: {
    // Arbitrum tokens
    "0x0000000000000000000000000000000000000000": "ETH/USD", // ETH
    "0x82af49447d8a07e3bd95bd0d56f35241523fbab1": "ETH/USD", // WETH
    "0xaf88d065e77c8cc2239327c5edb3a432268e5831": "USDC/USD", // USDC
    "0x62edc0692bd897d2295872a9ffcac5425011c661": "GMX/USD", // GMX
    "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f": "BTC/USD", // WBTC
  },
  10: {
    // Optimism tokens (examples - add more as needed)
    "0x4200000000000000000000000000000000000006": "ETH/USD", // WETH
    "0x7f5c764cbc14f9669b88837ca1490cca17c31607": "USDC/USD", // USDC
  },
} as const;

export const CHAINLINK_CONFIG = {
  api: {
    feedsUrl: "https://raw.githubusercontent.com/kukapay/chainlink-feeds-mcp/main/feeds.json",
    cacheTtl: 60 * 60 * 1000, // 1 hour in milliseconds
  },
  cache: {
    priceTtl: 30 * 1000, // 30 seconds
  },
  price: {
    maxStaleTime: 3600, // 1 hour in seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
  },
} as const;
