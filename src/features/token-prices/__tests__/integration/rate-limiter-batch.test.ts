import "reflect-metadata";
import { describe, expect, it, beforeEach, afterEach, mock } from "bun:test";
import { container } from "tsyringe";
import type { Address } from "viem";

import { GetTokenPriceUseCase } from "../../application/use-cases/get-token-price";
import { CircuitBreakerRepository } from "../../data/decorators/circuit-breaker-repository";
import { LoggerRepository } from "../../data/decorators/logger-repository";
import { RateLimiterRepository } from "../../data/decorators/rate-limiter-repository";
import { DeFiLlamaPriceRepository } from "../../data/repositories/defillama-price";
import type { PriceProviderRepository } from "../../domain/repositories";
import type { TokenPrice } from "../../domain/types";
import type { ILogger } from "../../../../domain/logger/logger.interface";

describe("RateLimiter Integration - Batch Requests", () => {
  const mockTokenAddresses: Address[] = [
    "0x1111111111111111111111111111111111111111",
    "0x2222222222222222222222222222222222222222",
    "0x3333333333333333333333333333333333333333",
    "0x4444444444444444444444444444444444444444",
    "0x5555555555555555555555555555555555555555",
  ] as Address[];

  const mockChainId = 1;

  beforeEach(() => {
    container.clearInstances();

    // Mock logger
    const mockLogger: ILogger = {
      debug: mock(() => {}),
      info: mock(() => {}),
      warn: mock(() => {}),
      error: mock(() => {}),
      extend: mock(() => mockLogger),
    };
    container.register<ILogger>("Logger", { useValue: mockLogger });

    // Mock base repository with simulated API delays
    const mockBaseRepo: PriceProviderRepository = {
      name: "DeFiLlama",
      getTokenPrice: mock(async (address: Address, chainId: number) => {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 50));

        return {
          tokenAddress: address,
          chainId,
          price: 1500 + Math.random() * 100,
          timestamp: new Date(),
          source: "DeFiLlama",
        } as TokenPrice;
      }),
    };

    // Build decorator chain: Base → Logger → RateLimiter → CircuitBreaker
    container.register<PriceProviderRepository>("InnerRepository", { useValue: mockBaseRepo });
    const loggedRepo = container.resolve(LoggerRepository);

    container.register<PriceProviderRepository>("InnerRepository", { useValue: loggedRepo });
    container.register("RateLimiterConfig", {
      useValue: {
        points: 3, // Allow 3 requests
        duration: 1, // per 1 second
        execEvenly: true,
        execEvenlyMinDelayMs: 300, // ~300ms between requests
      },
    });
    const rateLimitedRepo = container.resolve(RateLimiterRepository);

    container.register<PriceProviderRepository>("InnerRepository", { useValue: rateLimitedRepo });
    container.register("CircuitBreakerConfig", {
      useValue: {
        timeout: 5000,
        errorThresholdPercentage: 50,
        resetTimeout: 10000,
        volumeThreshold: 3,
      },
    });
    const circuitBreakerRepo = container.resolve(CircuitBreakerRepository);

    container.register<PriceProviderRepository>("PriceProvider", { useValue: circuitBreakerRepo });

    // Register use case
    container.register<GetTokenPriceUseCase>("GetTokenPriceUseCase", { useClass: GetTokenPriceUseCase });
  });

  afterEach(() => {
    container.clearInstances();
  });

  it("should handle batch requests with rate limiting", async () => {
    const useCase = container.resolve<GetTokenPriceUseCase>("GetTokenPriceUseCase");

    const startTime = Date.now();

    // Make 5 batch requests (rate limit is 3/second with execEvenly)
    const promises = mockTokenAddresses.map((address) =>
      useCase.execute({ tokenAddress: address, chainId: mockChainId }),
    );

    const results = await Promise.all(promises);
    const endTime = Date.now();
    const duration = endTime - startTime;

    // All requests should succeed
    expect(results).toHaveLength(5);
    results.forEach((result, index) => {
      expect(result.tokenAddress).toBe(mockTokenAddresses[index]);
      expect(result.chainId).toBe(mockChainId);
      expect(result.price).toBeGreaterThan(0);
    });

    // With rate limiting:
    // - First 3 requests: immediate (or with execEvenly: ~300ms between each)
    // - Requests 4-5: queued until next second
    // Expected duration: ~1000ms (first 3 spread over ~900ms, then wait for next window)
    // Plus API delays: 5 * 50ms = 250ms
    // Total: ~1150-1500ms
    expect(duration).toBeGreaterThan(1000);
    expect(duration).toBeLessThan(2000);
  });

  it("should prevent rate limit errors and keep circuit breaker closed", async () => {
    const useCase = container.resolve<GetTokenPriceUseCase>("GetTokenPriceUseCase");

    // Make multiple batches of requests
    const batch1 = mockTokenAddresses.slice(0, 3).map((address) =>
      useCase.execute({
        tokenAddress: address,
        chainId: mockChainId,
      }),
    );

    await Promise.all(batch1);

    // Wait a bit before next batch
    await new Promise((resolve) => setTimeout(resolve, 200));

    const batch2 = mockTokenAddresses.slice(3, 5).map((address) =>
      useCase.execute({
        tokenAddress: address,
        chainId: mockChainId,
      }),
    );

    const results2 = await Promise.all(batch2);

    // All requests should succeed without triggering circuit breaker
    expect(results2).toHaveLength(2);
    results2.forEach((result) => {
      expect(result).toBeDefined();
      expect(result.price).toBeGreaterThan(0);
    });
  });

  it("should smooth out traffic with execEvenly", async () => {
    const useCase = container.resolve<GetTokenPriceUseCase>("GetTokenPriceUseCase");

    const timestamps: number[] = [];

    // Make 3 requests and track when they actually execute
    const promises = mockTokenAddresses.slice(0, 3).map(async (address) => {
      const result = await useCase.execute({
        tokenAddress: address,
        chainId: mockChainId,
      });
      timestamps.push(Date.now());
      return result;
    });

    await Promise.all(promises);

    expect(timestamps).toHaveLength(3);

    // Calculate delays between actual executions
    const delays = timestamps.slice(1).map((t, i) => t - timestamps[i]);

    // With execEvenly, requests should be spread out
    // At least one delay should be >= 250ms (allowing margin for execEvenlyMinDelayMs: 300ms)
    const hasProperSpacing = delays.some((delay) => delay >= 200);
    expect(hasProperSpacing).toBe(true);
  });

  it("should work correctly with circuit breaker when errors occur", async () => {
    // Create a new mock repository that fails once then succeeds
    // This simulates a temporary API issue that recovers
    let callCount = 0;
    const intermittentRepo: PriceProviderRepository = {
      name: "DeFiLlama",
      getTokenPrice: mock(async (address: Address, chainId: number) => {
        callCount++;
        if (callCount === 1) {
          // Only first call fails
          throw new Error("API temporarily unavailable");
        }
        // All subsequent calls succeed
        await new Promise((resolve) => setTimeout(resolve, 50));
        return {
          tokenAddress: address,
          chainId,
          price: 1500,
          timestamp: new Date(),
          source: "DeFiLlama",
        } as TokenPrice;
      }),
    };

    // Rebuild chain with intermittent repo
    container.clearInstances();
    const mockLogger: ILogger = {
      debug: mock(() => {}),
      info: mock(() => {}),
      warn: mock(() => {}),
      error: mock(() => {}),
      extend: mock(() => mockLogger),
    };
    container.register<ILogger>("Logger", { useValue: mockLogger });

    container.register<PriceProviderRepository>("InnerRepository", { useValue: intermittentRepo });
    const loggedRepo = container.resolve(LoggerRepository);

    container.register<PriceProviderRepository>("InnerRepository", { useValue: loggedRepo });
    container.register("RateLimiterConfig", {
      useValue: { points: 10, duration: 1, execEvenly: false },
    });
    const rateLimitedRepo = container.resolve(RateLimiterRepository);

    container.register<PriceProviderRepository>("InnerRepository", { useValue: rateLimitedRepo });
    container.register("CircuitBreakerConfig", {
      useValue: {
        timeout: 5000,
        errorThresholdPercentage: 70, // Very lenient - need many failures
        resetTimeout: 1000,
        volumeThreshold: 5, // Need at least 5 requests to judge
      },
    });
    const circuitBreakerRepo = container.resolve(CircuitBreakerRepository);

    container.register<PriceProviderRepository>("PriceProvider", { useValue: circuitBreakerRepo });
    container.register<GetTokenPriceUseCase>("GetTokenPriceUseCase", { useClass: GetTokenPriceUseCase });

    const useCase = container.resolve<GetTokenPriceUseCase>("GetTokenPriceUseCase");

    // First request should fail
    await expect(
      useCase.execute({
        tokenAddress: mockTokenAddresses[0],
        chainId: mockChainId,
      }),
    ).rejects.toThrow();

    // Subsequent requests should succeed (API recovered)
    const result1 = await useCase.execute({
      tokenAddress: mockTokenAddresses[1],
      chainId: mockChainId,
    });

    const result2 = await useCase.execute({
      tokenAddress: mockTokenAddresses[2],
      chainId: mockChainId,
    });

    expect(result1).toBeDefined();
    expect(result1.price).toBe(1500);
    expect(result2).toBeDefined();
    expect(result2.price).toBe(1500);

    // Verify that rate limiter allowed requests through without issues
    expect(callCount).toBeGreaterThanOrEqual(3);
  });
});
