import CircuitBreaker from "opossum";
import { inject, injectable } from "tsyringe";
import type { Address } from "viem";

import type { Logger } from "infrastructure/logging";

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
    @inject("Logger") private readonly logger: Logger,
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
      this.logger.warn(`Circuit breaker fallback triggered for ${this.name}`);
      throw error;
    });

    this.setupEventListeners();
  }

  get name(): string {
    return this.innerRepository.name;
  }

  async getTokenPrice(tokenAddress: Address, chainId: number): Promise<TokenPrice> {
    try {
      return await this.breaker.fire(tokenAddress, chainId);
    } catch (error) {
      const state = this.breaker.opened ? "OPEN" : this.breaker.halfOpen ? "HALF_OPEN" : "CLOSED";
      this.logger.error(
        `${this.name} failed (CB state: ${state}): ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      throw error;
    }
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

  private setupEventListeners(): void {
    this.breaker.on("open", () => {
      this.logger.warn(`⚠️ Circuit breaker OPENED for ${this.name}`);
    });

    this.breaker.on("halfOpen", () => {
      this.logger.info(`🔄 Circuit breaker HALF_OPEN for ${this.name} - attempting recovery`);
    });

    this.breaker.on("close", () => {
      this.logger.info(`✅ Circuit breaker CLOSED for ${this.name} - service recovered`);
    });

    this.breaker.on("success", (result) => {
      this.logger.debug(`✓ ${this.name} success: $${result.price}`);
    });

    this.breaker.on("failure", (error: Error) => {
      this.logger.debug(`✗ ${this.name} failure: ${error.message}`);
    });

    this.breaker.on("timeout", () => {
      this.logger.warn(`⏱️ ${this.name} timeout (${this.config.timeout}ms)`);
    });

    this.breaker.on("reject", () => {
      this.logger.warn(`🚫 ${this.name} rejected - circuit breaker is open`);
    });

    this.breaker.on("fallback", () => {
      this.logger.warn(`🔀 ${this.name} fallback executed`);
    });
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
