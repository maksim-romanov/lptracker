import CircuitBreaker from "opossum";
import { inject, injectable } from "tsyringe";
import type { Address } from "viem";

import type { CircuitBreakerConfig } from "../../config/circuit-breaker.config";
import type { PriceProviderRepository } from "../../domain/repositories";
import type { TokenPrice } from "../../domain/types";

/**
 * Decorator/Wrapper that adds Circuit Breaker functionality to PriceProviderRepository
 * Follows Clean Architecture principles - isolates resilience logic from business logic
 * Uses TSyringe Dependency Injection for all dependencies
 */
@injectable()
export class CircuitBreakerRepository implements PriceProviderRepository {
  private readonly breaker: CircuitBreaker<[Address, number], TokenPrice>;

  constructor(
    @inject("InnerRepository") private readonly innerRepository: PriceProviderRepository,
    @inject("CircuitBreakerConfig") private readonly config: CircuitBreakerConfig,
  ) {
    // Create circuit breaker wrapping the repository method
    this.breaker = new CircuitBreaker<[Address, number], TokenPrice>(
      (tokenAddress: Address, chainId: number) => this.innerRepository.getTokenPrice(tokenAddress, chainId),
      {
        timeout: config.timeout,
        errorThresholdPercentage: config.errorThresholdPercentage,
        resetTimeout: config.resetTimeout,
        volumeThreshold: config.volumeThreshold,
        rollingCountTimeout: config.rollingCountTimeout,
        rollingCountBuckets: config.rollingCountBuckets,
        name: this.innerRepository.name,
      },
    );

    // Fallback: immediately throw error to allow fallback to next provider
    this.breaker.fallback((tokenAddress: Address, chainId: number) => {
      const error = new Error(`Circuit breaker OPEN for ${this.name}: token ${tokenAddress} on chain ${chainId}`);
      throw error;
    });
  }

  get name(): string {
    return this.innerRepository.name;
  }

  async getTokenPrice(tokenAddress: Address, chainId: number): Promise<TokenPrice> {
    return await this.breaker.fire(tokenAddress, chainId);
  }

  // Monitoring methods
  getStats() {
    return this.breaker.stats;
  }

  getState() {
    return {
      opened: this.breaker.opened,
      halfOpen: this.breaker.halfOpen,
      closed: this.breaker.closed,
      name: this.name,
      stats: this.breaker.stats,
    };
  }

  // Control methods for testing/management
  shutdown(): void {
    this.breaker.shutdown();
  }

  enable(): void {
    this.breaker.enable();
  }

  disable(): void {
    this.breaker.disable();
  }
}
