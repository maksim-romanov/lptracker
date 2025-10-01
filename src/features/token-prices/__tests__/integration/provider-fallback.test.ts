import "reflect-metadata";
import { beforeEach, describe, expect, it, mock } from "bun:test";
import { container } from "tsyringe";
import type { Address } from "viem";

import { GetTokenPriceUseCase } from "../../application/use-cases/get-token-price";
import { CircuitBreakerRepository } from "../../data/decorators/circuit-breaker-repository";
import type { CircuitBreakerConfig } from "../../config/circuit-breaker.config";
import type { PriceProviderRepository } from "../../domain/repositories";
import type { TokenPrice } from "../../domain/types";

describe("Provider Fallback Chain with CircuitBreaker", () => {
  const mockTokenAddress = "0xA0b86a33E6417aAb7b6DbCBbe9FD4E89c0778a4B" as Address;
  const mockChainId = 1;

  beforeEach(() => {
    container.clearInstances();
  });

  const createMockTokenPrice = (source: string): TokenPrice => ({
    tokenAddress: mockTokenAddress,
    chainId: mockChainId,
    price: 100,
    timestamp: new Date(),
    source,
  });

  const createMockProvider = (
    name: string,
    behavior: "success" | "error" | "timeout" = "success",
    delay = 0
  ): PriceProviderRepository => ({
    name,
    getTokenPrice: mock(async () => {
      if (delay > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      if (behavior === "error") {
        throw new Error(`${name} failed`);
      }

      if (behavior === "timeout") {
        // Simulate long operation
        await new Promise((resolve) => setTimeout(resolve, 10000));
      }

      return createMockTokenPrice(name);
    }),
  });

  const wrapWithCircuitBreaker = (
    provider: PriceProviderRepository,
    config: CircuitBreakerConfig
  ): CircuitBreakerRepository => {
    const childContainer = container.createChildContainer();
    childContainer.register("InnerRepository", { useValue: provider });
    childContainer.register("CircuitBreakerConfig", { useValue: config });
    return childContainer.resolve(CircuitBreakerRepository);
  };

  describe("Happy Path - First Provider Succeeds", () => {
    it("should return price from first provider and not call others", async () => {
      const provider1 = createMockProvider("DeFiLlama", "success");
      const provider2 = createMockProvider("Chainlink", "success");

      // Register providers in DI container
      container.register<PriceProviderRepository>("PriceProvider", { useValue: provider1 });
      container.register<PriceProviderRepository>("PriceProvider", { useValue: provider2 });
      container.register<GetTokenPriceUseCase>("GetTokenPriceUseCase", { useClass: GetTokenPriceUseCase });

      const useCase = container.resolve<GetTokenPriceUseCase>("GetTokenPriceUseCase");
      const result = await useCase.execute({ tokenAddress: mockTokenAddress, chainId: mockChainId });

      expect(result.source).toBe("DeFiLlama");
      expect(provider1.getTokenPrice).toHaveBeenCalledTimes(1);
      expect(provider2.getTokenPrice).not.toHaveBeenCalled();
    });
  });

  describe("Fallback Behavior with CircuitBreaker", () => {
    it("should fallback to second provider when first fails", async () => {
      const config: CircuitBreakerConfig = {
        timeout: 1000,
        errorThresholdPercentage: 50,
        resetTimeout: 5000,
        volumeThreshold: 3,
      };

      const provider1 = createMockProvider("DeFiLlama", "error");
      const provider2 = createMockProvider("Chainlink", "success");

      const breaker1 = wrapWithCircuitBreaker(provider1, config);
      const breaker2 = wrapWithCircuitBreaker(provider2, config);

      // Register wrapped providers in DI container
      container.register<PriceProviderRepository>("PriceProvider", { useValue: breaker1 });
      container.register<PriceProviderRepository>("PriceProvider", { useValue: breaker2 });
      container.register<GetTokenPriceUseCase>("GetTokenPriceUseCase", { useClass: GetTokenPriceUseCase });

      const useCase = container.resolve<GetTokenPriceUseCase>("GetTokenPriceUseCase");
      const result = await useCase.execute({ tokenAddress: mockTokenAddress, chainId: mockChainId });

      expect(result.source).toBe("Chainlink");
      expect(provider1.getTokenPrice).toHaveBeenCalledTimes(1);
      expect(provider2.getTokenPrice).toHaveBeenCalledTimes(1);
    });

    it("should fallback through all providers until one succeeds", async () => {
      const config: CircuitBreakerConfig = {
        timeout: 1000,
        errorThresholdPercentage: 50,
        resetTimeout: 5000,
        volumeThreshold: 3,
      };

      const provider1 = createMockProvider("DeFiLlama", "error");
      const provider2 = createMockProvider("Chainlink", "error");
      const provider3 = createMockProvider("CoinGecko", "success");

      const breaker1 = wrapWithCircuitBreaker(provider1, config);
      const breaker2 = wrapWithCircuitBreaker(provider2, config);
      const breaker3 = wrapWithCircuitBreaker(provider3, config);

      container.register<PriceProviderRepository>("PriceProvider", { useValue: breaker1 });
      container.register<PriceProviderRepository>("PriceProvider", { useValue: breaker2 });
      container.register<PriceProviderRepository>("PriceProvider", { useValue: breaker3 });
      container.register<GetTokenPriceUseCase>("GetTokenPriceUseCase", { useClass: GetTokenPriceUseCase });

      const useCase = container.resolve<GetTokenPriceUseCase>("GetTokenPriceUseCase");
      const result = await useCase.execute({ tokenAddress: mockTokenAddress, chainId: mockChainId });

      expect(result.source).toBe("CoinGecko");
    });
  });

  describe("CircuitBreaker Acceleration", () => {
    it("should fail fast when circuit is OPEN and immediately try next provider", async () => {
      const config: CircuitBreakerConfig = {
        timeout: 500,
        errorThresholdPercentage: 50,
        resetTimeout: 10000,
        volumeThreshold: 3,
      };

      const provider1 = createMockProvider("DeFiLlama", "error");
      const provider2 = createMockProvider("Chainlink", "success");

      const breaker1 = wrapWithCircuitBreaker(provider1, config);
      const breaker2 = wrapWithCircuitBreaker(provider2, config);

      // Open circuit by failing 3 times
      for (let i = 0; i < 3; i++) {
        try {
          await breaker1.getTokenPrice(mockTokenAddress, mockChainId);
        } catch (error) {
          // Expected
        }
      }

      // Verify circuit is OPEN
      const state = breaker1.getState();
      expect(state.opened).toBe(true);

      // Now make request through UseCase with DI
      container.register<PriceProviderRepository>("PriceProvider", { useValue: breaker1 });
      container.register<PriceProviderRepository>("PriceProvider", { useValue: breaker2 });
      container.register<GetTokenPriceUseCase>("GetTokenPriceUseCase", { useClass: GetTokenPriceUseCase });

      const useCase = container.resolve<GetTokenPriceUseCase>("GetTokenPriceUseCase");
      const start = Date.now();
      const result = await useCase.execute({ tokenAddress: mockTokenAddress, chainId: mockChainId });
      const duration = Date.now() - start;

      expect(result.source).toBe("Chainlink");
      // Should be fast because DeFiLlama circuit is OPEN (no timeout wait)
      expect(duration).toBeLessThan(100);
    });

    it("should handle multiple circuits OPEN simultaneously", async () => {
      const config: CircuitBreakerConfig = {
        timeout: 500,
        errorThresholdPercentage: 50,
        resetTimeout: 10000,
        volumeThreshold: 3,
      };

      const provider1 = createMockProvider("DeFiLlama", "error");
      const provider2 = createMockProvider("Chainlink", "error");
      const provider3 = createMockProvider("CoinGecko", "success");

      const breaker1 = wrapWithCircuitBreaker(provider1, config);
      const breaker2 = wrapWithCircuitBreaker(provider2, config);
      const breaker3 = wrapWithCircuitBreaker(provider3, config);

      // Open both circuits
      for (let i = 0; i < 3; i++) {
        try {
          await breaker1.getTokenPrice(mockTokenAddress, mockChainId);
        } catch (error) {
          // Expected
        }
        try {
          await breaker2.getTokenPrice(mockTokenAddress, mockChainId);
        } catch (error) {
          // Expected
        }
      }

      // Verify both circuits are OPEN
      expect(breaker1.getState().opened).toBe(true);
      expect(breaker2.getState().opened).toBe(true);

      // Make request - should skip both and go to CoinGecko instantly
      container.register<PriceProviderRepository>("PriceProvider", { useValue: breaker1 });
      container.register<PriceProviderRepository>("PriceProvider", { useValue: breaker2 });
      container.register<PriceProviderRepository>("PriceProvider", { useValue: breaker3 });
      container.register<GetTokenPriceUseCase>("GetTokenPriceUseCase", { useClass: GetTokenPriceUseCase });

      const useCase = container.resolve<GetTokenPriceUseCase>("GetTokenPriceUseCase");
      const start = Date.now();
      const result = await useCase.execute({ tokenAddress: mockTokenAddress, chainId: mockChainId });
      const duration = Date.now() - start;

      expect(result.source).toBe("CoinGecko");
      expect(duration).toBeLessThan(100); // Both circuits fail instantly
    });

    it("should fail instantly when all circuits are OPEN", async () => {
      const config: CircuitBreakerConfig = {
        timeout: 500,
        errorThresholdPercentage: 50,
        resetTimeout: 10000,
        volumeThreshold: 3,
      };

      const provider1 = createMockProvider("DeFiLlama", "error");
      const provider2 = createMockProvider("Chainlink", "error");
      const provider3 = createMockProvider("CoinGecko", "error");

      const breaker1 = wrapWithCircuitBreaker(provider1, config);
      const breaker2 = wrapWithCircuitBreaker(provider2, config);
      const breaker3 = wrapWithCircuitBreaker(provider3, config);

      // Open all circuits
      for (let i = 0; i < 3; i++) {
        try {
          await breaker1.getTokenPrice(mockTokenAddress, mockChainId);
        } catch (error) {
          // Expected
        }
        try {
          await breaker2.getTokenPrice(mockTokenAddress, mockChainId);
        } catch (error) {
          // Expected
        }
        try {
          await breaker3.getTokenPrice(mockTokenAddress, mockChainId);
        } catch (error) {
          // Expected
        }
      }

      // Verify all circuits are OPEN
      expect(breaker1.getState().opened).toBe(true);
      expect(breaker2.getState().opened).toBe(true);
      expect(breaker3.getState().opened).toBe(true);

      // Make request - should fail instantly
      container.register<PriceProviderRepository>("PriceProvider", { useValue: breaker1 });
      container.register<PriceProviderRepository>("PriceProvider", { useValue: breaker2 });
      container.register<PriceProviderRepository>("PriceProvider", { useValue: breaker3 });
      container.register<GetTokenPriceUseCase>("GetTokenPriceUseCase", { useClass: GetTokenPriceUseCase });

      const useCase = container.resolve<GetTokenPriceUseCase>("GetTokenPriceUseCase");
      const start = Date.now();

      try {
        await useCase.execute({ tokenAddress: mockTokenAddress, chainId: mockChainId });
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        const duration = Date.now() - start;

        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain("All price providers failed");
        // Should be instant, not seconds
        expect(duration).toBeLessThan(200);
      }
    });
  });

  describe("Timeout Handling in Chain", () => {
    it("should timeout slow provider and fallback to next", async () => {
      const config: CircuitBreakerConfig = {
        timeout: 100, // 100ms timeout
        errorThresholdPercentage: 50,
        resetTimeout: 5000,
        volumeThreshold: 3,
      };

      const provider1 = createMockProvider("DeFiLlama", "timeout"); // Will timeout
      const provider2 = createMockProvider("Chainlink", "success", 50); // Fast

      const breaker1 = wrapWithCircuitBreaker(provider1, config);
      const breaker2 = wrapWithCircuitBreaker(provider2, config);

      container.register<PriceProviderRepository>("PriceProvider", { useValue: breaker1 });
      container.register<PriceProviderRepository>("PriceProvider", { useValue: breaker2 });
      container.register<GetTokenPriceUseCase>("GetTokenPriceUseCase", { useClass: GetTokenPriceUseCase });

      const useCase = container.resolve<GetTokenPriceUseCase>("GetTokenPriceUseCase");
      const start = Date.now();
      const result = await useCase.execute({ tokenAddress: mockTokenAddress, chainId: mockChainId });
      const duration = Date.now() - start;

      expect(result.source).toBe("Chainlink");
      // Should timeout first provider (100ms) then get second (50ms) = ~150ms
      expect(duration).toBeGreaterThan(100);
      expect(duration).toBeLessThan(500);
    });
  });

  describe("Error Message Aggregation", () => {
    it("should include all provider errors in final error message", async () => {
      const config: CircuitBreakerConfig = {
        timeout: 1000,
        errorThresholdPercentage: 50,
        resetTimeout: 5000,
        volumeThreshold: 3,
      };

      const provider1 = createMockProvider("DeFiLlama", "error");
      const provider2 = createMockProvider("Chainlink", "error");
      const provider3 = createMockProvider("CoinGecko", "error");

      const breaker1 = wrapWithCircuitBreaker(provider1, config);
      const breaker2 = wrapWithCircuitBreaker(provider2, config);
      const breaker3 = wrapWithCircuitBreaker(provider3, config);

      container.register<PriceProviderRepository>("PriceProvider", { useValue: breaker1 });
      container.register<PriceProviderRepository>("PriceProvider", { useValue: breaker2 });
      container.register<PriceProviderRepository>("PriceProvider", { useValue: breaker3 });
      container.register<GetTokenPriceUseCase>("GetTokenPriceUseCase", { useClass: GetTokenPriceUseCase });

      const useCase = container.resolve<GetTokenPriceUseCase>("GetTokenPriceUseCase");

      try {
        await useCase.execute({ tokenAddress: mockTokenAddress, chainId: mockChainId });
        expect(true).toBe(false);
      } catch (error) {
        const errorMessage = (error as Error).message;

        expect(errorMessage).toContain("All price providers failed");
        expect(errorMessage).toContain("DeFiLlama");
        expect(errorMessage).toContain("Chainlink");
        expect(errorMessage).toContain("CoinGecko");
      }
    });
  });
});
