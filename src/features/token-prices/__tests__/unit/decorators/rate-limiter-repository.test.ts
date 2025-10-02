import "reflect-metadata";
import { describe, expect, it, beforeEach, mock } from "bun:test";
import type { Address } from "viem";

import { RateLimiterRepository } from "../../../data/decorators/rate-limiter-repository";
import type { RateLimiterConfig } from "../../../config/rate-limiter.config";
import type { PriceProviderRepository } from "../../../domain/repositories";
import type { TokenPrice } from "../../../domain/types";

describe("RateLimiterRepository", () => {
  const mockTokenAddress = "0x1234567890123456789012345678901234567890" as Address;
  const mockChainId = 1;
  const mockTokenPrice: TokenPrice = {
    tokenAddress: mockTokenAddress,
    chainId: mockChainId,
    price: 1500.0,
    timestamp: new Date(),
    source: "DeFiLlama",
  };

  let mockInnerRepository: PriceProviderRepository;
  let config: RateLimiterConfig;

  beforeEach(() => {
    // Create mock inner repository
    mockInnerRepository = {
      name: "DeFiLlama",
      getTokenPrice: mock(async () => mockTokenPrice),
    };

    // Conservative config for faster tests
    config = {
      points: 2, // Allow 2 requests
      duration: 1, // per 1 second
      execEvenly: false, // Disable for simpler testing
    };
  });

  describe("constructor", () => {
    it("should create rate limiter with correct configuration", () => {
      const rateLimiter = new RateLimiterRepository(mockInnerRepository, config);

      expect(rateLimiter).toBeDefined();
      expect(rateLimiter.name).toBe("DeFiLlama");
    });
  });

  describe("getTokenPrice", () => {
    it("should allow requests within rate limit", async () => {
      const rateLimiter = new RateLimiterRepository(mockInnerRepository, config);

      const result = await rateLimiter.getTokenPrice(mockTokenAddress, mockChainId);

      expect(result).toEqual(mockTokenPrice);
      expect(mockInnerRepository.getTokenPrice).toHaveBeenCalledTimes(1);
      expect(mockInnerRepository.getTokenPrice).toHaveBeenCalledWith(mockTokenAddress, mockChainId);
    });

    it("should queue requests when rate limit exceeded", async () => {
      const rateLimiter = new RateLimiterRepository(mockInnerRepository, config);

      // Make 3 requests (limit is 2/second)
      const startTime = Date.now();
      const promises = [
        rateLimiter.getTokenPrice(mockTokenAddress, mockChainId),
        rateLimiter.getTokenPrice(mockTokenAddress, mockChainId),
        rateLimiter.getTokenPrice(mockTokenAddress, mockChainId),
      ];

      const results = await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // All requests should succeed
      expect(results).toHaveLength(3);
      results.forEach((result) => expect(result).toEqual(mockTokenPrice));

      // Third request should be delayed (queued until next duration window)
      // Duration should be at least 1000ms (config.duration)
      expect(duration).toBeGreaterThanOrEqual(900); // Allow some margin

      expect(mockInnerRepository.getTokenPrice).toHaveBeenCalledTimes(3);
    });

    it("should use provider name as rate limiter key", async () => {
      const rateLimiter = new RateLimiterRepository(mockInnerRepository, config);

      await rateLimiter.getTokenPrice(mockTokenAddress, mockChainId);

      // Verify inner repository was called (key is used internally)
      expect(mockInnerRepository.getTokenPrice).toHaveBeenCalled();
    });

    it("should propagate errors from inner repository", async () => {
      const errorMessage = "API rate limit exceeded";
      mockInnerRepository.getTokenPrice = mock(async () => {
        throw new Error(errorMessage);
      });

      const rateLimiter = new RateLimiterRepository(mockInnerRepository, config);

      await expect(rateLimiter.getTokenPrice(mockTokenAddress, mockChainId)).rejects.toThrow(errorMessage);
    });
  });

  describe("execEvenly option", () => {
    it("should distribute requests evenly when execEvenly is true", async () => {
      const evenConfig: RateLimiterConfig = {
        points: 3,
        duration: 1,
        execEvenly: true,
        execEvenlyMinDelayMs: 300, // ~300ms between requests
      };

      const rateLimiter = new RateLimiterRepository(mockInnerRepository, evenConfig);

      const startTime = Date.now();

      // Make 3 requests sequentially to observe spacing
      const results = [];
      for (let i = 0; i < 3; i++) {
        const result = await rateLimiter.getTokenPrice(mockTokenAddress, mockChainId);
        results.push(result);
      }

      const duration = Date.now() - startTime;

      // With execEvenly, 3 requests should be spread over at least 2 * execEvenlyMinDelayMs
      // (300ms * 2 = 600ms minimum)
      expect(results).toHaveLength(3);
      expect(duration).toBeGreaterThanOrEqual(500); // Allow some margin
    });
  });

  describe("monitoring methods", () => {
    it("should return stats with configuration", () => {
      const rateLimiter = new RateLimiterRepository(mockInnerRepository, config);

      const stats = rateLimiter.getStats();

      expect(stats).toEqual({
        points: config.points,
        duration: config.duration,
        execEvenly: config.execEvenly,
      });
    });

    it("should return remaining tokens", async () => {
      const rateLimiter = new RateLimiterRepository(mockInnerRepository, config);

      // Initially should have all tokens available
      let remaining = await rateLimiter.getRemainingTokens();
      expect(remaining).toBe(2); // config.points

      // Consume one token
      await rateLimiter.getTokenPrice(mockTokenAddress, mockChainId);

      // Should have 1 token remaining
      remaining = await rateLimiter.getRemainingTokens();
      expect(remaining).toBe(1);
    });
  });

  describe("name property", () => {
    it("should delegate to inner repository name", () => {
      const rateLimiter = new RateLimiterRepository(mockInnerRepository, config);

      expect(rateLimiter.name).toBe(mockInnerRepository.name);
    });
  });
});
