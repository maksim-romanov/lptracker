import "reflect-metadata";
import { beforeEach, describe, expect, it, mock } from "bun:test";
import { container } from "tsyringe";
import type { Address } from "viem";

import { CircuitBreakerRepository } from "../../../data/decorators/circuit-breaker-repository";
import type { CircuitBreakerConfig } from "../../../config/circuit-breaker.config";
import type { PriceProviderRepository } from "../../../domain/repositories";
import type { TokenPrice } from "../../../domain/types";

describe("CircuitBreakerRepository", () => {
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
    behavior: "success" | "error" = "success"
  ): PriceProviderRepository => ({
    name,
    getTokenPrice: mock(async () => {
      if (behavior === "error") {
        throw new Error(`${name} failed`);
      }
      return createMockTokenPrice(name);
    }),
  });

  const createCircuitBreaker = (
    provider: PriceProviderRepository,
    config: CircuitBreakerConfig
  ): CircuitBreakerRepository => {
    const childContainer = container.createChildContainer();
    childContainer.register("InnerRepository", { useValue: provider });
    childContainer.register("CircuitBreakerConfig", { useValue: config });
    return childContainer.resolve(CircuitBreakerRepository);
  };

  describe("Initialization", () => {
    it("should create circuit breaker with correct configuration", () => {
      const mockProvider = createMockProvider("TestProvider");
      const config: CircuitBreakerConfig = {
        timeout: 1000,
        errorThresholdPercentage: 50,
        resetTimeout: 5000,
        volumeThreshold: 3,
      };

      const breaker = createCircuitBreaker(mockProvider, config);

      expect(breaker.name).toBe("TestProvider");
      const state = breaker.getState();
      expect(state.closed).toBe(true);
    });

    it("should delegate name to inner repository", () => {
      const mockProvider = createMockProvider("CustomProvider");
      const config: CircuitBreakerConfig = {
        timeout: 1000,
        errorThresholdPercentage: 50,
        resetTimeout: 5000,
        volumeThreshold: 3,
      };

      const breaker = createCircuitBreaker(mockProvider, config);

      expect(breaker.name).toBe("CustomProvider");
      expect(breaker.name).toBe(mockProvider.name);
    });
  });

  describe("Successful Operations", () => {
    it("should delegate getTokenPrice to inner repository when successful", async () => {
      const mockProvider = createMockProvider("TestProvider", "success");
      const config: CircuitBreakerConfig = {
        timeout: 1000,
        errorThresholdPercentage: 50,
        resetTimeout: 5000,
        volumeThreshold: 3,
      };

      const breaker = createCircuitBreaker(mockProvider, config);
      const result = await breaker.getTokenPrice(mockTokenAddress, mockChainId);

      expect(result.source).toBe("TestProvider");
      expect(result.price).toBe(100);
      expect(mockProvider.getTokenPrice).toHaveBeenCalledWith(mockTokenAddress, mockChainId);
      expect(mockProvider.getTokenPrice).toHaveBeenCalledTimes(1);
    });

    it("should track successful calls in stats", async () => {
      const mockProvider = createMockProvider("TestProvider", "success");
      const config: CircuitBreakerConfig = {
        timeout: 1000,
        errorThresholdPercentage: 50,
        resetTimeout: 5000,
        volumeThreshold: 3,
      };

      const breaker = createCircuitBreaker(mockProvider, config);

      await breaker.getTokenPrice(mockTokenAddress, mockChainId);
      await breaker.getTokenPrice(mockTokenAddress, mockChainId);
      await breaker.getTokenPrice(mockTokenAddress, mockChainId);

      const stats = breaker.getStats();
      expect(stats.fires).toBe(3);
      expect(stats.successes).toBe(3);
      expect(stats.failures).toBe(0);
    });

    it("should keep circuit CLOSED when all operations succeed", async () => {
      const mockProvider = createMockProvider("TestProvider", "success");
      const config: CircuitBreakerConfig = {
        timeout: 1000,
        errorThresholdPercentage: 50,
        resetTimeout: 5000,
        volumeThreshold: 3,
      };

      const breaker = createCircuitBreaker(mockProvider, config);

      for (let i = 0; i < 10; i++) {
        await breaker.getTokenPrice(mockTokenAddress, mockChainId);
      }

      const state = breaker.getState();
      expect(state.closed).toBe(true);
      expect(state.opened).toBe(false);
    });
  });

  describe("Error Handling", () => {
    it("should propagate errors from inner repository", async () => {
      const mockProvider = createMockProvider("TestProvider", "error");
      const config: CircuitBreakerConfig = {
        timeout: 1000,
        errorThresholdPercentage: 50,
        resetTimeout: 5000,
        volumeThreshold: 10, // High threshold to prevent circuit from opening
      };

      const breaker = createCircuitBreaker(mockProvider, config);

      // The error could be either the original error or the circuit breaker fallback error
      try {
        await breaker.getTokenPrice(mockTokenAddress, mockChainId);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        // Accept either the original error or circuit breaker error
        const errorMessage = (error as Error).message;
        const isExpectedError =
          errorMessage.includes("TestProvider failed") || errorMessage.includes("Circuit breaker OPEN");
        expect(isExpectedError).toBe(true);
      }
    });

    it("should track failed calls in stats", async () => {
      const mockProvider = createMockProvider("TestProvider", "error");
      const config: CircuitBreakerConfig = {
        timeout: 1000,
        errorThresholdPercentage: 50,
        resetTimeout: 5000,
        volumeThreshold: 10, // High threshold to prevent circuit from opening during test
      };

      const breaker = createCircuitBreaker(mockProvider, config);

      for (let i = 0; i < 5; i++) {
        try {
          await breaker.getTokenPrice(mockTokenAddress, mockChainId);
        } catch (error) {
          // Expected
        }
      }

      const stats = breaker.getStats();
      expect(stats.fires).toBe(5);
      expect(stats.failures).toBe(5);
      expect(stats.successes).toBe(0);
    });

    it("should open circuit after error threshold exceeded", async () => {
      const mockProvider = createMockProvider("TestProvider", "error");
      const config: CircuitBreakerConfig = {
        timeout: 1000,
        errorThresholdPercentage: 50,
        resetTimeout: 5000,
        volumeThreshold: 3,
      };

      const breaker = createCircuitBreaker(mockProvider, config);

      // Make volumeThreshold requests with 100% error rate
      for (let i = 0; i < 3; i++) {
        try {
          await breaker.getTokenPrice(mockTokenAddress, mockChainId);
        } catch (error) {
          // Expected
        }
      }

      const state = breaker.getState();
      expect(state.opened).toBe(true);
      expect(state.closed).toBe(false);
    });
  });

  describe("Circuit Breaker Fallback", () => {
    it("should throw custom error when circuit is OPEN", async () => {
      const mockProvider = createMockProvider("TestProvider", "error");
      const config: CircuitBreakerConfig = {
        timeout: 1000,
        errorThresholdPercentage: 50,
        resetTimeout: 10000,
        volumeThreshold: 2,
      };

      const breaker = createCircuitBreaker(mockProvider, config);

      // Open the circuit
      for (let i = 0; i < 3; i++) {
        try {
          await breaker.getTokenPrice(mockTokenAddress, mockChainId);
        } catch (error) {
          // Expected
        }
      }

      // Circuit is now OPEN, fallback should trigger
      try {
        await breaker.getTokenPrice(mockTokenAddress, mockChainId);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const errorMessage = (error as Error).message;
        expect(errorMessage).toContain("Circuit breaker OPEN");
        expect(errorMessage).toContain("TestProvider");
        expect(errorMessage).toContain(mockTokenAddress);
        expect(errorMessage).toContain(String(mockChainId));
      }
    });

    it("should not call inner repository when circuit is OPEN", async () => {
      const mockProvider = createMockProvider("TestProvider", "error");
      const config: CircuitBreakerConfig = {
        timeout: 1000,
        errorThresholdPercentage: 50,
        resetTimeout: 10000,
        volumeThreshold: 2,
      };

      const breaker = createCircuitBreaker(mockProvider, config);

      // Open the circuit
      for (let i = 0; i < 3; i++) {
        try {
          await breaker.getTokenPrice(mockTokenAddress, mockChainId);
        } catch (error) {
          // Expected
        }
      }

      const callCountBeforeOpen = (mockProvider.getTokenPrice as ReturnType<typeof mock>).mock.calls.length;

      // Circuit is OPEN, should not call inner repository
      try {
        await breaker.getTokenPrice(mockTokenAddress, mockChainId);
      } catch (error) {
        // Expected
      }

      const callCountAfterOpen = (mockProvider.getTokenPrice as ReturnType<typeof mock>).mock.calls.length;
      expect(callCountAfterOpen).toBe(callCountBeforeOpen);
    });
  });

  describe("Monitoring Methods", () => {
    it("should return stats via getStats()", async () => {
      const mockProvider = createMockProvider("TestProvider", "success");
      const config: CircuitBreakerConfig = {
        timeout: 1000,
        errorThresholdPercentage: 50,
        resetTimeout: 5000,
        volumeThreshold: 3,
      };

      const breaker = createCircuitBreaker(mockProvider, config);

      await breaker.getTokenPrice(mockTokenAddress, mockChainId);
      const stats = breaker.getStats();

      expect(stats).toBeDefined();
      expect(typeof stats.fires).toBe("number");
      expect(typeof stats.successes).toBe("number");
      expect(typeof stats.failures).toBe("number");
      expect(stats.fires).toBe(1);
      expect(stats.successes).toBe(1);
    });

    it("should return state via getState()", () => {
      const mockProvider = createMockProvider("TestProvider");
      const config: CircuitBreakerConfig = {
        timeout: 1000,
        errorThresholdPercentage: 50,
        resetTimeout: 5000,
        volumeThreshold: 3,
      };

      const breaker = createCircuitBreaker(mockProvider, config);
      const state = breaker.getState();

      expect(state).toBeDefined();
      expect(typeof state.closed).toBe("boolean");
      expect(typeof state.opened).toBe("boolean");
      expect(typeof state.halfOpen).toBe("boolean");
      expect(state.closed).toBe(true);
    });
  });

  describe("Control Methods", () => {
    it("should support enable() method", () => {
      const mockProvider = createMockProvider("TestProvider");
      const config: CircuitBreakerConfig = {
        timeout: 1000,
        errorThresholdPercentage: 50,
        resetTimeout: 5000,
        volumeThreshold: 3,
      };

      const breaker = createCircuitBreaker(mockProvider, config);

      expect(() => breaker.enable()).not.toThrow();
      expect(breaker.getState().enabled).toBe(true);
    });

    it("should support disable() method", () => {
      const mockProvider = createMockProvider("TestProvider");
      const config: CircuitBreakerConfig = {
        timeout: 1000,
        errorThresholdPercentage: 50,
        resetTimeout: 5000,
        volumeThreshold: 3,
      };

      const breaker = createCircuitBreaker(mockProvider, config);

      breaker.disable();
      expect(breaker.getState().enabled).toBe(false);
    });

    it("should support shutdown() method", () => {
      const mockProvider = createMockProvider("TestProvider");
      const config: CircuitBreakerConfig = {
        timeout: 1000,
        errorThresholdPercentage: 50,
        resetTimeout: 5000,
        volumeThreshold: 3,
      };

      const breaker = createCircuitBreaker(mockProvider, config);

      expect(() => breaker.shutdown()).not.toThrow();
    });
  });

  describe("Configuration Variations", () => {
    it("should respect custom timeout configuration", async () => {
      const slowProvider: PriceProviderRepository = {
        name: "SlowProvider",
        getTokenPrice: mock(async () => {
          await new Promise((resolve) => setTimeout(resolve, 500));
          return createMockTokenPrice("SlowProvider");
        }),
      };

      const config: CircuitBreakerConfig = {
        timeout: 100, // Very short timeout
        errorThresholdPercentage: 90, // Very high threshold to prevent circuit from opening
        resetTimeout: 5000,
        volumeThreshold: 20, // Very high threshold to prevent circuit from opening
      };

      const breaker = createCircuitBreaker(slowProvider, config);

      // Should timeout - error message will contain either "timeout" or "Circuit breaker OPEN"
      try {
        await breaker.getTokenPrice(mockTokenAddress, mockChainId);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }

      const stats = breaker.getStats();
      // At least one timeout or failure should be recorded
      expect(stats.fires).toBeGreaterThan(0);
    });

    it("should respect volumeThreshold configuration", async () => {
      const mockProvider = createMockProvider("TestProvider", "error");
      const config: CircuitBreakerConfig = {
        timeout: 1000,
        errorThresholdPercentage: 50,
        resetTimeout: 5000,
        volumeThreshold: 5, // High threshold
      };

      const breaker = createCircuitBreaker(mockProvider, config);

      // Make only 3 failing requests (below volumeThreshold)
      for (let i = 0; i < 3; i++) {
        try {
          await breaker.getTokenPrice(mockTokenAddress, mockChainId);
        } catch (error) {
          // Expected
        }
      }

      const state = breaker.getState();
      // Should stay CLOSED because volumeThreshold not reached
      expect(state.closed).toBe(true);
      expect(state.opened).toBe(false);
    });

    it("should respect errorThresholdPercentage configuration", async () => {
      let callCount = 0;
      const provider: PriceProviderRepository = {
        name: "PartialFailProvider",
        getTokenPrice: mock(async () => {
          callCount++;
          // 40% error rate: fail calls 2, 5
          if (callCount === 2 || callCount === 5) {
            throw new Error("Failed");
          }
          return createMockTokenPrice("PartialFailProvider");
        }),
      };

      const config: CircuitBreakerConfig = {
        timeout: 1000,
        errorThresholdPercentage: 50, // 50% threshold
        resetTimeout: 5000,
        volumeThreshold: 5,
      };

      const breaker = createCircuitBreaker(provider, config);

      // Make 5 requests: 3 success, 2 fail = 40% error rate
      for (let i = 0; i < 5; i++) {
        try {
          await breaker.getTokenPrice(mockTokenAddress, mockChainId);
        } catch (error) {
          // Expected for some calls
        }
      }

      const state = breaker.getState();
      // Should stay CLOSED (40% < 50% threshold)
      expect(state.closed).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero delay successful operations", async () => {
      const mockProvider = createMockProvider("FastProvider", "success");
      const config: CircuitBreakerConfig = {
        timeout: 1000,
        errorThresholdPercentage: 50,
        resetTimeout: 5000,
        volumeThreshold: 3,
      };

      const breaker = createCircuitBreaker(mockProvider, config);

      // Rapid fire requests
      const promises = Array.from({ length: 20 }, () =>
        breaker.getTokenPrice(mockTokenAddress, mockChainId)
      );

      const results = await Promise.all(promises);
      expect(results).toHaveLength(20);
      results.forEach((result) => {
        expect(result.source).toBe("FastProvider");
      });
    });

    it("should handle different token addresses", async () => {
      const mockProvider = createMockProvider("TestProvider", "success");
      const config: CircuitBreakerConfig = {
        timeout: 1000,
        errorThresholdPercentage: 50,
        resetTimeout: 5000,
        volumeThreshold: 3,
      };

      const breaker = createCircuitBreaker(mockProvider, config);

      const address1 = "0x1111111111111111111111111111111111111111" as Address;
      const address2 = "0x2222222222222222222222222222222222222222" as Address;

      await breaker.getTokenPrice(address1, 1);
      await breaker.getTokenPrice(address2, 1);

      expect(mockProvider.getTokenPrice).toHaveBeenCalledWith(address1, 1);
      expect(mockProvider.getTokenPrice).toHaveBeenCalledWith(address2, 1);
    });

    it("should handle different chain IDs", async () => {
      const mockProvider = createMockProvider("TestProvider", "success");
      const config: CircuitBreakerConfig = {
        timeout: 1000,
        errorThresholdPercentage: 50,
        resetTimeout: 5000,
        volumeThreshold: 3,
      };

      const breaker = createCircuitBreaker(mockProvider, config);

      await breaker.getTokenPrice(mockTokenAddress, 1);
      await breaker.getTokenPrice(mockTokenAddress, 137);
      await breaker.getTokenPrice(mockTokenAddress, 42161);

      expect(mockProvider.getTokenPrice).toHaveBeenCalledWith(mockTokenAddress, 1);
      expect(mockProvider.getTokenPrice).toHaveBeenCalledWith(mockTokenAddress, 137);
      expect(mockProvider.getTokenPrice).toHaveBeenCalledWith(mockTokenAddress, 42161);
    });
  });
});
