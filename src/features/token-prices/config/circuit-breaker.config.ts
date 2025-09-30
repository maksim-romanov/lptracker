export interface CircuitBreakerConfig {
  timeout: number;
  errorThresholdPercentage: number;
  resetTimeout: number;
  volumeThreshold: number;
  rollingCountTimeout?: number;
  rollingCountBuckets?: number;
}

/**
 * Circuit Breaker configuration for each price provider
 * Optimized based on provider characteristics:
 * - DeFiLlama: Fast HTTP API, aggressive timeout
 * - Chainlink: On-chain reads, longer timeout
 * - CoinGecko: HTTP API with rate limits
 * - Moralis: HTTP API with rate limits
 */
export const circuitBreakerConfigs: Record<string, CircuitBreakerConfig> = {
  DeFiLlama: {
    timeout: 3000, // Fast provider, fail fast
    errorThresholdPercentage: 50, // Open after 50% errors
    resetTimeout: 10000, // Retry after 10s
    volumeThreshold: 5, // Need 5 requests to calculate error rate
  },
  Chainlink: {
    timeout: 8000, // On-chain is slower
    errorThresholdPercentage: 40, // More conservative for critical provider
    resetTimeout: 30000, // Longer recovery time
    volumeThreshold: 3, // Lower threshold for on-chain
  },
  CoinGecko: {
    timeout: 8000,
    errorThresholdPercentage: 50,
    resetTimeout: 20000, // Account for rate limit recovery
    volumeThreshold: 5,
  },
  Moralis: {
    timeout: 10000, // Most lenient
    errorThresholdPercentage: 50,
    resetTimeout: 15000,
    volumeThreshold: 5,
  },
};