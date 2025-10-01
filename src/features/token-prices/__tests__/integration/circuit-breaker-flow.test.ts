import "reflect-metadata";
import { beforeEach, describe, expect, it, mock } from "bun:test";
import { container } from "tsyringe";
import type { Address } from "viem";

import { CircuitBreakerRepository } from "../../data/decorators/circuit-breaker-repository";
import type { CircuitBreakerConfig } from "../../config/circuit-breaker.config";
import type { PriceProviderRepository } from "../../domain/repositories";
import type { TokenPrice } from "../../domain/types";

describe("CircuitBreaker Integration", () => {
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
        // Simulate long operation that will timeout
        await new Promise((resolve) => setTimeout(resolve, 10000));
      }

      return createMockTokenPrice(name);
    }),
  });

  describe("Circuit Breaker States", () => {
    it("should start in CLOSED state", () => {
      const mockProvider = createMockProvider("TestProvider");
      const config: CircuitBreakerConfig = {
        timeout: 5000,
        errorThresholdPercentage: 50,
        resetTimeout: 10000,
        volumeThreshold: 3,
      };

      container.register("InnerRepository", { useValue: mockProvider });
      container.register("CircuitBreakerConfig", { useValue: config });

      const circuitBreaker = container.resolve(CircuitBreakerRepository);
      const state = circuitBreaker.getState();

      expect(state.closed).toBe(true);
      expect(state.opened).toBe(false);
      expect(state.halfOpen).toBe(false);
      expect(state.name).toBe("TestProvider");
    });

    it("should transition to OPEN after error threshold exceeded", async () => {
      const mockProvider = createMockProvider("TestProvider", "error");
      const config: CircuitBreakerConfig = {
        timeout: 1000,
        errorThresholdPercentage: 50, // 50% errors
        resetTimeout: 10000,
        volumeThreshold: 3, // Need at least 3 requests
      };

      container.register("InnerRepository", { useValue: mockProvider });
      container.register("CircuitBreakerConfig", { useValue: config });

      const circuitBreaker = container.resolve(CircuitBreakerRepository);

      // Make 3 failing requests (100% error rate, exceeds 50% threshold)
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.getTokenPrice(mockTokenAddress, mockChainId);
        } catch (error) {
          // Expected to fail
        }
      }

      const state = circuitBreaker.getState();
      expect(state.opened).toBe(true);
      expect(state.closed).toBe(false);
      expect(state.stats.failures).toBe(3);
    });

    it("should stay CLOSED when errors below threshold", async () => {
      let callCount = 0;
      const mockProvider: PriceProviderRepository = {
        name: "TestProvider",
        getTokenPrice: mock(async () => {
          callCount++;
          // First 2 calls succeed, 3rd fails (33% error rate, below 50% threshold)
          if (callCount === 3) {
            throw new Error("Failed");
          }
          return createMockTokenPrice("TestProvider");
        }),
      };

      const config: CircuitBreakerConfig = {
        timeout: 1000,
        errorThresholdPercentage: 50,
        resetTimeout: 10000,
        volumeThreshold: 3,
      };

      container.register("InnerRepository", { useValue: mockProvider });
      container.register("CircuitBreakerConfig", { useValue: config });

      const circuitBreaker = container.resolve(CircuitBreakerRepository);

      // Make 3 requests: 2 success, 1 fail = 33% error rate
      await circuitBreaker.getTokenPrice(mockTokenAddress, mockChainId);
      await circuitBreaker.getTokenPrice(mockTokenAddress, mockChainId);
      try {
        await circuitBreaker.getTokenPrice(mockTokenAddress, mockChainId);
      } catch (error) {
        // Expected
      }

      const state = circuitBreaker.getState();
      expect(state.closed).toBe(true);
      expect(state.opened).toBe(false);
      expect(state.stats.failures).toBe(1);
      expect(state.stats.successes).toBe(2);
    });

    it("should require volumeThreshold before opening circuit", async () => {
      const mockProvider = createMockProvider("TestProvider", "error");
      const config: CircuitBreakerConfig = {
        timeout: 1000,
        errorThresholdPercentage: 50,
        resetTimeout: 10000,
        volumeThreshold: 5, // Need 5 requests
      };

      container.register("InnerRepository", { useValue: mockProvider });
      container.register("CircuitBreakerConfig", { useValue: config });

      const circuitBreaker = container.resolve(CircuitBreakerRepository);

      // Make only 3 failing requests (below volumeThreshold)
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.getTokenPrice(mockTokenAddress, mockChainId);
        } catch (error) {
          // Expected
        }
      }

      const state = circuitBreaker.getState();
      // Should stay CLOSED because volumeThreshold not reached
      expect(state.closed).toBe(true);
      expect(state.opened).toBe(false);
    });

    it("should transition OPEN -> HALF_OPEN after resetTimeout", async () => {
      const mockProvider = createMockProvider("TestProvider", "error");
      const config: CircuitBreakerConfig = {
        timeout: 500,
        errorThresholdPercentage: 50,
        resetTimeout: 100, // 100ms reset timeout
        volumeThreshold: 2,
      };

      container.register("InnerRepository", { useValue: mockProvider });
      container.register("CircuitBreakerConfig", { useValue: config });

      const circuitBreaker = container.resolve(CircuitBreakerRepository);

      // Open the circuit
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.getTokenPrice(mockTokenAddress, mockChainId);
        } catch (error) {
          // Expected
        }
      }

      expect(circuitBreaker.getState().opened).toBe(true);

      // Wait for resetTimeout
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Circuit should now be HALF_OPEN
      // Note: opossum transitions to HALF_OPEN on next request after resetTimeout
      try {
        await circuitBreaker.getTokenPrice(mockTokenAddress, mockChainId);
      } catch (error) {
        // Expected to fail
      }

      const state = circuitBreaker.getState();
      // After failed request in HALF_OPEN, goes back to OPEN
      expect(state.halfOpen || state.opened).toBe(true);
    });
  });

  describe("Timeout Handling", () => {
    it("should trigger circuit breaker on timeout", async () => {
      const mockProvider = createMockProvider("TestProvider", "timeout");
      const config: CircuitBreakerConfig = {
        timeout: 100, // 100ms timeout
        errorThresholdPercentage: 50,
        resetTimeout: 5000,
        volumeThreshold: 2,
      };

      container.register("InnerRepository", { useValue: mockProvider });
      container.register("CircuitBreakerConfig", { useValue: config });

      const circuitBreaker = container.resolve(CircuitBreakerRepository);

      // Make requests that will timeout
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.getTokenPrice(mockTokenAddress, mockChainId);
        } catch (error) {
          // Expected to timeout
        }
      }

      const state = circuitBreaker.getState();
      expect(state.stats.timeouts).toBeGreaterThan(0);
      expect(state.opened).toBe(true);
    });

    it("should use different timeouts for different providers", async () => {
      const fastProvider = createMockProvider("FastProvider", "success", 50);
      const slowProvider = createMockProvider("SlowProvider", "success", 200);

      const fastConfig: CircuitBreakerConfig = {
        timeout: 100, // Fast provider has strict timeout
        errorThresholdPercentage: 50,
        resetTimeout: 5000,
        volumeThreshold: 2,
      };

      const slowConfig: CircuitBreakerConfig = {
        timeout: 300, // Slow provider has lenient timeout
        errorThresholdPercentage: 50,
        resetTimeout: 5000,
        volumeThreshold: 2,
      };

      // Fast provider should succeed
      container.register("InnerRepository", { useValue: fastProvider });
      container.register("CircuitBreakerConfig", { useValue: fastConfig });
      const fastBreaker = container.resolve(CircuitBreakerRepository);

      const fastResult = await fastBreaker.getTokenPrice(mockTokenAddress, mockChainId);
      expect(fastResult.source).toBe("FastProvider");

      // Slow provider should also succeed with lenient timeout
      container.clearInstances();
      container.register("InnerRepository", { useValue: slowProvider });
      container.register("CircuitBreakerConfig", { useValue: slowConfig });
      const slowBreaker = container.resolve(CircuitBreakerRepository);

      const slowResult = await slowBreaker.getTokenPrice(mockTokenAddress, mockChainId);
      expect(slowResult.source).toBe("SlowProvider");
    });
  });

  describe("Fallback Behavior", () => {
    it("should execute fallback when circuit is OPEN", async () => {
      const mockProvider = createMockProvider("TestProvider", "error");
      const config: CircuitBreakerConfig = {
        timeout: 500,
        errorThresholdPercentage: 50,
        resetTimeout: 10000,
        volumeThreshold: 2,
      };

      container.register("InnerRepository", { useValue: mockProvider });
      container.register("CircuitBreakerConfig", { useValue: config });

      const circuitBreaker = container.resolve(CircuitBreakerRepository);

      // Open the circuit
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.getTokenPrice(mockTokenAddress, mockChainId);
        } catch (error) {
          // Expected
        }
      }

      // Now circuit is OPEN, fallback should be triggered
      try {
        await circuitBreaker.getTokenPrice(mockTokenAddress, mockChainId);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const errorMessage = (error as Error).message;
        expect(errorMessage).toContain("Circuit breaker OPEN");
        expect(errorMessage).toContain("TestProvider");
      }
    });
  });

  describe("Stats and Monitoring", () => {
    it("should track stats correctly", async () => {
      let callCount = 0;
      const mockProvider: PriceProviderRepository = {
        name: "TestProvider",
        getTokenPrice: mock(async () => {
          callCount++;
          if (callCount === 2) {
            throw new Error("Failed");
          }
          return createMockTokenPrice("TestProvider");
        }),
      };

      const config: CircuitBreakerConfig = {
        timeout: 1000,
        errorThresholdPercentage: 50,
        resetTimeout: 5000,
        volumeThreshold: 5,
      };

      container.register("InnerRepository", { useValue: mockProvider });
      container.register("CircuitBreakerConfig", { useValue: config });

      const circuitBreaker = container.resolve(CircuitBreakerRepository);

      // Make 3 requests: success, fail, success
      await circuitBreaker.getTokenPrice(mockTokenAddress, mockChainId);
      try {
        await circuitBreaker.getTokenPrice(mockTokenAddress, mockChainId);
      } catch (error) {
        // Expected
      }
      await circuitBreaker.getTokenPrice(mockTokenAddress, mockChainId);

      const stats = circuitBreaker.getStats();
      expect(stats.fires).toBe(3);
      expect(stats.successes).toBe(2);
      expect(stats.failures).toBe(1);
    });

    it("should return correct state information", () => {
      const mockProvider = createMockProvider("TestProvider");
      const config: CircuitBreakerConfig = {
        timeout: 1000,
        errorThresholdPercentage: 50,
        resetTimeout: 5000,
        volumeThreshold: 3,
      };

      container.register("InnerRepository", { useValue: mockProvider });
      container.register("CircuitBreakerConfig", { useValue: config });

      const circuitBreaker = container.resolve(CircuitBreakerRepository);
      const state = circuitBreaker.getState();

      expect(state.name).toBe("TestProvider");
      expect(typeof state.closed).toBe("boolean");
      expect(typeof state.opened).toBe("boolean");
      expect(typeof state.halfOpen).toBe("boolean");
      expect(state.stats).toBeDefined();
    });
  });
});
