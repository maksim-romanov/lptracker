import { inject, injectable } from "tsyringe";
import type { Address } from "viem";

import type { RateLimiterMemory as TRateLimiterMemory, RateLimiterQueue as TRateLimiterQueue } from "rate-limiter-flexible";
import RateLimiterMemory from "rate-limiter-flexible/lib/RateLimiterMemory";
import RateLimiterQueue from "rate-limiter-flexible/lib/RateLimiterQueue";

import type { RateLimiterConfig } from "../../config/rate-limiter.config";
import type { PriceProviderRepository } from "../../domain/repositories";
import type { TokenPrice } from "../../domain/types";

/**
 * Decorator/Wrapper that adds Rate Limiting functionality to PriceProviderRepository
 * Follows Clean Architecture principles - isolates rate limiting logic from business logic
 * Uses TSyringe Dependency Injection for all dependencies
 *
 * Benefits:
 * - Prevents 429 (rate limit exceeded) errors by proactively limiting requests
 * - Smooths out traffic peaks with execEvenly option
 * - Automatic queueing of requests that exceed rate limits
 * - Reduces Circuit Breaker activations by preventing errors
 */
@injectable()
export class RateLimiterRepository implements PriceProviderRepository {
  private readonly limiter: TRateLimiterMemory;
  private readonly queue: TRateLimiterQueue;

  constructor(
    @inject("InnerRepository") private readonly innerRepository: PriceProviderRepository,
    @inject("RateLimiterConfig") private readonly config: RateLimiterConfig,
  ) {
    // Create rate limiter with memory backend (suitable for client-side Expo apps)
    this.limiter = new RateLimiterMemory({
      points: config.points,
      duration: config.duration,
      execEvenly: config.execEvenly,
      execEvenlyMinDelayMs: config.execEvenlyMinDelayMs,
    });

    // Wrap limiter in queue for automatic request queueing
    // Queue size default: 4294967295 (2^32 - 1), sufficient for client-side usage
    this.queue = new RateLimiterQueue(this.limiter);
  }

  get name(): string {
    return this.innerRepository.name;
  }

  async getTokenPrice(tokenAddress: Address, chainId: number): Promise<TokenPrice> {
    // Use provider name as rate limiter key to track per-provider limits
    const key = this.innerRepository.name;

    // removeTokens will:
    // 1. Check if tokens available
    // 2. If yes: consume token and proceed
    // 3. If no: queue request and wait until token available
    // 4. Throws Error if queue operations fail (not rate limit related)
    await this.queue.removeTokens(1, key);

    // After acquiring token, execute the actual API call
    return await this.innerRepository.getTokenPrice(tokenAddress, chainId);
  }

  // Monitoring methods for debugging/observability
  getStats() {
    // Note: RateLimiterMemory doesn't expose stats like CircuitBreaker
    // This is a placeholder for future enhancement
    return {
      points: this.config.points,
      duration: this.config.duration,
      execEvenly: this.config.execEvenly,
    };
  }

  async getRemainingTokens(key?: string): Promise<number> {
    const limiterKey = key || this.innerRepository.name;
    return await this.queue.getTokensRemaining(limiterKey);
  }
}
