export interface RateLimiterConfig {
  points: number;
  duration: number;
  execEvenly?: boolean;
  execEvenlyMinDelayMs?: number;
}

/**
 * Rate Limiter configuration for each price provider
 * Optimized based on provider API rate limits:
 * - DeFiLlama: 100 req/min (Free tier, no API key required)
 * - Chainlink: On-chain reads, limited by RPC provider
 * - CoinGecko: 10-50 req/min (Free tier, varies)
 * - Moralis: 100 req/min, 40,000 req/month (Free tier)
 *
 * Strategy: Use execEvenly to smooth out traffic peaks and avoid bursts
 */
export const rateLimiterConfigs: Record<string, RateLimiterConfig> = {
  DeFiLlama: {
    points: 100, // 100 requests
    duration: 60, // per 60 seconds
    execEvenly: true, // Smooth distribution: ~1 request every 600ms
    execEvenlyMinDelayMs: 600, // Minimum delay between requests
  },
  Chainlink: {
    points: 30, // Conservative limit for on-chain reads
    duration: 60, // per 60 seconds
    execEvenly: true, // Smooth distribution: ~1 request every 2s
    execEvenlyMinDelayMs: 2000, // On-chain is slower, bigger delays acceptable
  },
  CoinGecko: {
    points: 10, // Conservative (free tier varies 10-50)
    duration: 60, // per 60 seconds
    execEvenly: true, // Smooth distribution: ~1 request every 6s
    execEvenlyMinDelayMs: 6000, // Very conservative to avoid rate limits
  },
  Moralis: {
    points: 100, // 100 requests
    duration: 60, // per 60 seconds
    execEvenly: true, // Smooth distribution: ~1 request every 600ms
    execEvenlyMinDelayMs: 600, // Similar to DeFiLlama
  },
} as const;
