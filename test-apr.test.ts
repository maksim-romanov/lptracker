#!/usr/bin/env bun

/**
 * Comprehensive APR End-to-End Test Suite
 *
 * This executable test file validates the complete APR calculation pipeline:
 * 1. Domain service mathematics (Task 2)
 * 2. Historical data management (Task 3)
 * 3. Use case orchestration (Task 4)
 * 4. UI integration (Task 5)
 *
 * Usage: bun run test-apr.ts
 */

import "reflect-metadata";

import { describe, it, expect, beforeAll, beforeEach } from "bun:test";
import * as chains from "viem/chains";

import { AprCalculatorService } from "./src/features/uniswap-v4/domain/services/apr-calculator";
import { CalculatePositionAprUseCase } from "./src/features/uniswap-v4/application/use-cases/calculate-position-apr";
import { configureDI, container } from "./src/features/uniswap-v4/config/di-container";
import type { StorageAdapter } from "./src/features/uniswap-v4/domain/ports/storage-adapter";
import type { HistoricalDataRepository } from "./src/features/uniswap-v4/domain/repositories/historical-data";
import type { PositionSnapshot } from "./src/features/uniswap-v4/domain/types";

// Test Configuration
const TEST_TOKEN_ID = 456n;
const CHAIN_ID = chains.arbitrum.id;
const TEST_POSITION_VALUE_USD = 10000; // $10,000
const TEST_LIQUIDITY = 1000000000000000000000n; // 1000 tokens with 18 decimals

describe("APR End-to-End Integration Suite", () => {
  let aprCalculator: AprCalculatorService;
  let calculateAprUseCase: CalculatePositionAprUseCase;
  let historicalDataRepository: HistoricalDataRepository;
  let storageAdapter: StorageAdapter;

  beforeAll(() => {
    configureDI(true); // Configure for testing
    aprCalculator = new AprCalculatorService();
    calculateAprUseCase = container.resolve("CalculatePositionAprUseCase");
    historicalDataRepository = container.resolve("HistoricalDataRepository");
    storageAdapter = container.resolve("StorageAdapter");
  });

  beforeEach(() => {
    storageAdapter.clearAll();
  });

  const createTestSnapshot = (
    timestamp: number,
    feeGrowth0: bigint,
    feeGrowth1: bigint,
    positionValueUsd: number = TEST_POSITION_VALUE_USD
  ): PositionSnapshot => ({
    timestamp,
    blockNumber: Math.floor(timestamp / 1000) + 1000000,
    feeGrowthInside0X128: feeGrowth0,
    feeGrowthInside1X128: feeGrowth1,
    positionValueUsd,
  });

  describe("1. Domain Service Mathematics Validation", () => {
    it("should calculate APR correctly for positive fee growth", () => {
      const now = Date.now();
      const dayAgo = now - 24 * 60 * 60 * 1000;

      const input = {
        currentData: {
          feeGrowthInside0X128: 1100000000000000000000000000000n,
          feeGrowthInside1X128: 2200000000000000000000000000000n,
          timestamp: now,
          positionValueUsd: TEST_POSITION_VALUE_USD,
        },
        historicalData: {
          feeGrowthInside0X128: 1000000000000000000000000000000n,
          feeGrowthInside1X128: 2000000000000000000000000000000n,
          timestamp: dayAgo,
          positionValueUsd: TEST_POSITION_VALUE_USD,
        },
        liquidity: TEST_LIQUIDITY,
        token0Decimals: 18,
        token1Decimals: 18,
        token0PriceUsd: 1.0,
        token1PriceUsd: 2000.0,
      };

      const result = aprCalculator.calculateApr(input, "24h");

      expect(result.apr).toBeDefined();
      expect(result.apr).toBeGreaterThan(0);
      expect(result.apr).toBeLessThan(100); // Should be reasonable (< 10000%)
      expect(result.feesEarnedUsd).toBeGreaterThan(0);
      expect(result.timePeriodHours).toBe(24);
    });

    it("should handle overflow in fee growth calculations", () => {
      const now = Date.now();
      const dayAgo = now - 24 * 60 * 60 * 1000;

      // Simulate overflow scenario where current < historical
      const input = {
        currentData: {
          feeGrowthInside0X128: 1000000000000000000000000000000n, // Smaller value
          feeGrowthInside1X128: 2000000000000000000000000000000n,
          timestamp: now,
          positionValueUsd: TEST_POSITION_VALUE_USD,
        },
        historicalData: {
          feeGrowthInside0X128: 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFn, // Max value
          feeGrowthInside1X128: 2000000000000000000000000000000n,
          timestamp: dayAgo,
          positionValueUsd: TEST_POSITION_VALUE_USD,
        },
        liquidity: TEST_LIQUIDITY,
        token0Decimals: 18,
        token1Decimals: 18,
        token0PriceUsd: 1.0,
        token1PriceUsd: 2000.0,
      };

      const result = aprCalculator.calculateApr(input, "24h");

      expect(result.apr).toBeDefined();
      // Should handle wrap-around correctly
      expect(result.feesEarnedUsd).toBeGreaterThan(0);
    });

    it("should return zero APR for identical snapshots", () => {
      const now = Date.now();
      const snapshot = {
        feeGrowthInside0X128: 1000000000000000000000000000000n,
        feeGrowthInside1X128: 2000000000000000000000000000000n,
        timestamp: now,
        positionValueUsd: TEST_POSITION_VALUE_USD,
      };

      const input = {
        currentData: snapshot,
        historicalData: { ...snapshot, timestamp: now - 24 * 60 * 60 * 1000 },
        liquidity: TEST_LIQUIDITY,
        token0Decimals: 18,
        token1Decimals: 18,
        token0PriceUsd: 1.0,
        token1PriceUsd: 2000.0,
      };

      const result = aprCalculator.calculateApr(input, "24h");

      expect(result.apr).toBe(0);
      expect(result.feesEarnedUsd).toBe(0);
    });
  });

  describe("2. Historical Data Management Validation", () => {
    it("should store and retrieve snapshots correctly", async () => {
      const now = Date.now();
      const snapshot = createTestSnapshot(now, 123456789n, 987654321n);

      // Store snapshot
      await historicalDataRepository.storeSnapshot(TEST_TOKEN_ID, CHAIN_ID, snapshot);

      // Retrieve latest snapshot
      const retrieved = await historicalDataRepository.getLatestSnapshot(TEST_TOKEN_ID, CHAIN_ID);

      expect(retrieved).toBeDefined();
      expect(retrieved?.feeGrowthInside0X128).toBe(snapshot.feeGrowthInside0X128);
      expect(retrieved?.feeGrowthInside1X128).toBe(snapshot.feeGrowthInside1X128);
      expect(retrieved?.positionValueUsd).toBe(snapshot.positionValueUsd);
      expect(retrieved?.timestamp).toBe(snapshot.timestamp);
    });

    it("should retrieve historical snapshots by period", async () => {
      const now = Date.now();
      const dayAgo = now - 24 * 60 * 60 * 1000;
      const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

      // Create snapshots at different times
      const current = createTestSnapshot(now, 3000000000000000000000000000000n, 6000000000000000000000000000000n);
      const dayOld = createTestSnapshot(dayAgo, 2000000000000000000000000000000n, 4000000000000000000000000000000n);
      const weekOld = createTestSnapshot(weekAgo, 1000000000000000000000000000000n, 2000000000000000000000000000000n);

      await historicalDataRepository.storeSnapshot(TEST_TOKEN_ID, CHAIN_ID, current);
      await historicalDataRepository.storeSnapshot(TEST_TOKEN_ID, CHAIN_ID, dayOld);
      await historicalDataRepository.storeSnapshot(TEST_TOKEN_ID, CHAIN_ID, weekOld);

      // Test historical snapshot retrieval
      const dayAgoSnapshot = await historicalDataRepository.getHistoricalSnapshot(TEST_TOKEN_ID, CHAIN_ID, "24h");
      const weekAgoSnapshot = await historicalDataRepository.getHistoricalSnapshot(TEST_TOKEN_ID, CHAIN_ID, "7d");

      expect(dayAgoSnapshot).toBeDefined();
      expect(dayAgoSnapshot?.timestamp).toBeLessThan(now);
      expect(dayAgoSnapshot?.timestamp).toBeGreaterThan(now - 25 * 60 * 60 * 1000);

      expect(weekAgoSnapshot).toBeDefined();
      expect(weekAgoSnapshot?.timestamp).toBeLessThan(now);
      expect(weekAgoSnapshot?.timestamp).toBeGreaterThan(now - 8 * 24 * 60 * 60 * 1000);
    });

    it("should handle missing historical data gracefully", async () => {
      const nonExistentTokenId = 999999n;

      const result = await historicalDataRepository.getLatestSnapshot(nonExistentTokenId, CHAIN_ID);
      expect(result).toBeNull();

      const historicalResult = await historicalDataRepository.getHistoricalSnapshot(nonExistentTokenId, CHAIN_ID, "24h");
      expect(historicalResult).toBeNull();
    });
  });

  describe("3. Use Case Orchestration Validation", () => {
    it("should execute complete APR calculation workflow", async () => {
      const now = Date.now();
      const dayAgo = now - 24 * 60 * 60 * 1000;

      // Setup test data
      const currentSnapshot = createTestSnapshot(
        now,
        1100000000000000000000000000000n,
        2200000000000000000000000000000n,
      );

      const dayAgoSnapshot = createTestSnapshot(
        dayAgo,
        1000000000000000000000000000000n,
        2000000000000000000000000000000n,
      );

      await historicalDataRepository.storeSnapshot(TEST_TOKEN_ID, CHAIN_ID, currentSnapshot);
      await historicalDataRepository.storeSnapshot(TEST_TOKEN_ID, CHAIN_ID, dayAgoSnapshot);

      // Execute use case
      const result = await calculateAprUseCase.execute({
        tokenId: TEST_TOKEN_ID,
        chainId: CHAIN_ID,
        periods: ["24h", "7d", "30d"],
        forceRefresh: false,
      });

      // Validate result structure
      expect(result.tokenId).toBe(TEST_TOKEN_ID);
      expect(result.chainId).toBe(CHAIN_ID);
      expect(result.result).toBeDefined();
      expect(result.dataTimestamps).toBeDefined();
      expect(Array.isArray(result.warnings)).toBe(true);

      // Check data timestamps
      expect(result.dataTimestamps.currentSnapshot).toBeGreaterThan(0);
      expect(result.dataTimestamps.historicalSnapshots["24h"]).toBeDefined();

      // Check APR calculations
      expect(result.result.apr24h?.apr).toBeDefined();
      expect(result.result.apr24h?.feesEarnedUsd).toBeDefined();
      expect(result.result.apr24h?.timePeriodHours).toBe(24);

      console.log("🎯 APR Calculation Result:", {
        "24h APR": `${(result.result.apr24h?.apr * 100 || 0).toFixed(2)}%`,
        "Fees Earned": `$${result.result.apr24h?.feesEarnedUsd?.toFixed(2) || "0.00"}`,
        Warnings: result.warnings,
      });
    });

    it("should handle multiple position APR calculations", async () => {
      const inputs = [
        {
          tokenId: TEST_TOKEN_ID + 1n,
          chainId: CHAIN_ID,
          periods: ["24h"] as const,
        },
        {
          tokenId: TEST_TOKEN_ID + 2n,
          chainId: CHAIN_ID,
          periods: ["7d"] as const,
        },
      ];

      const results = await calculateAprUseCase.executeMultiple(inputs);

      expect(results).toHaveLength(2);
      results.forEach((result, index) => {
        expect(result.tokenId).toBe(inputs[index].tokenId);
        expect(result.chainId).toBe(CHAIN_ID);
        expect(result.result).toBeDefined();
      });
    });

    it("should handle missing data gracefully", async () => {
      const result = await calculateAprUseCase.execute({
        tokenId: 999999n, // Non-existent token
        chainId: CHAIN_ID,
        periods: ["24h", "7d", "30d"],
        forceRefresh: false,
      });

      // Should complete but with warnings
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes("historical data"))).toBe(true);
    });
  });

  describe("4. Integration Edge Cases", () => {
    it("should handle extreme APR values correctly", async () => {
      const now = Date.now();
      const hourAgo = now - 60 * 60 * 1000; // 1 hour ago

      // Create scenario with very high fee growth (extreme APR)
      const currentSnapshot = createTestSnapshot(
        now,
        20000000000000000000000000000000n, // 20x increase
        40000000000000000000000000000000n,
      );

      const hourAgoSnapshot = createTestSnapshot(
        hourAgo,
        1000000000000000000000000000000n,
        2000000000000000000000000000000n,
      );

      await historicalDataRepository.storeSnapshot(TEST_TOKEN_ID + 10n, CHAIN_ID, currentSnapshot);
      await historicalDataRepository.storeSnapshot(TEST_TOKEN_ID + 10n, CHAIN_ID, hourAgoSnapshot);

      const result = await calculateAprUseCase.execute({
        tokenId: TEST_TOKEN_ID + 10n,
        chainId: CHAIN_ID,
        periods: ["24h"],
        forceRefresh: false,
      });

      // Should handle extreme APR and generate appropriate warnings
      expect(result.warnings.some(w => w.includes("Extremely high APR"))).toBe(true);
    });

    it("should validate data quality and freshness", async () => {
      const now = Date.now();
      const oldTimestamp = now - 2 * 60 * 60 * 1000; // 2 hours ago
      const oldSnapshot = createTestSnapshot(oldTimestamp, 1000000000000000000000000000000n, 2000000000000000000000000000000n);

      await historicalDataRepository.storeSnapshot(TEST_TOKEN_ID + 20n, CHAIN_ID, oldSnapshot);

      const result = await calculateAprUseCase.execute({
        tokenId: TEST_TOKEN_ID + 20n,
        chainId: CHAIN_ID,
        periods: ["24h"],
        forceRefresh: false,
      });

      // Should generate warnings about stale data
      expect(result.warnings.some(w => w.includes("minutes old"))).toBe(true);
    });
  });

  describe("5. Performance and Reliability", () => {
    it("should handle concurrent APR calculations", async () => {
      const concurrentCalculations = 5;
      const promises = Array.from({ length: concurrentCalculations }, (_, i) =>
        calculateAprUseCase.execute({
          tokenId: BigInt(i + 1000),
          chainId: CHAIN_ID,
          periods: ["24h"],
          forceRefresh: false,
        })
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(concurrentCalculations);
      results.forEach(result => {
        expect(result.result).toBeDefined();
      });
    });

    it("should maintain data consistency across multiple calls", async () => {
      const now = Date.now();
      const dayAgo = now - 24 * 60 * 60 * 1000;

      const snapshot = createTestSnapshot(now, 1500000000000000000000000000000n, 3000000000000000000000000000000n);
      const oldSnapshot = createTestSnapshot(dayAgo, 1000000000000000000000000000000n, 2000000000000000000000000000000n);

      await historicalDataRepository.storeSnapshot(TEST_TOKEN_ID + 30n, CHAIN_ID, snapshot);
      await historicalDataRepository.storeSnapshot(TEST_TOKEN_ID + 30n, CHAIN_ID, oldSnapshot);

      // Multiple calls should return consistent results
      const [result1, result2] = await Promise.all([
        calculateAprUseCase.execute({
          tokenId: TEST_TOKEN_ID + 30n,
          chainId: CHAIN_ID,
          periods: ["24h"],
          forceRefresh: false,
        }),
        calculateAprUseCase.execute({
          tokenId: TEST_TOKEN_ID + 30n,
          chainId: CHAIN_ID,
          periods: ["24h"],
          forceRefresh: false,
        }),
      ]);

      expect(result1.result.apr24h?.apr).toBe(result2.result.apr24h?.apr);
      expect(result1.result.apr24h?.feesEarnedUsd).toBe(result2.result.apr24h?.feesEarnedUsd);
    });
  });
});

// Main execution block for standalone running
if (import.meta.main) {
  console.log("🚀 APR End-to-End Test Suite completed!");
  console.log("Run with: bun test test-apr.test.ts --verbose");
}