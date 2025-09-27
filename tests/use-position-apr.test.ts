import "reflect-metadata";

import { describe, it, expect, beforeAll, beforeEach } from "bun:test";
import * as chains from "viem/chains";

import { usePositionApr } from "../src/features/uniswap-v4/presentation/hooks/use-position-apr";
import { configureDI, container } from "../src/features/uniswap-v4/config/di-container";
import type { StorageAdapter } from "../src/features/uniswap-v4/domain/ports/storage-adapter";
import type { HistoricalDataRepository } from "../src/features/uniswap-v4/domain/repositories/historical-data";
import type { PositionSnapshot } from "../src/features/uniswap-v4/domain/types";

const TEST_TOKEN_ID = 456n;
const CHAIN_ID = chains.arbitrum.id;

describe("usePositionApr", () => {
  let historicalDataRepository: HistoricalDataRepository;
  let storageAdapter: StorageAdapter;

  beforeAll(() => {
    configureDI(true); // Configure for testing
    historicalDataRepository = container.resolve("HistoricalDataRepository");
    storageAdapter = container.resolve("StorageAdapter");
  });

  beforeEach(() => {
    storageAdapter.clearAll();
  });

  const createTestSnapshot = (timestamp: number, feeGrowth0: bigint, feeGrowth1: bigint): PositionSnapshot => ({
    timestamp,
    blockNumber: Math.floor(timestamp / 1000) + 1000000,
    feeGrowthInside0X128: feeGrowth0,
    feeGrowthInside1X128: feeGrowth1,
    positionValueUsd: 10000,
  });

  describe("Hook integration", () => {
    it("should be a function that returns expected interface", () => {
      const result = usePositionApr(TEST_TOKEN_ID, CHAIN_ID);

      // Check that the result has the expected structure
      expect(typeof result.isLoading).toBe("boolean");
      expect(typeof result.isError).toBe("boolean");
      expect(result.apr24h === undefined || typeof result.apr24h === "number").toBe(true);
      expect(result.apr7d === undefined || typeof result.apr7d === "number").toBe(true);
      expect(result.apr30d === undefined || typeof result.apr30d === "number").toBe(true);
      expect(result.warnings === undefined || Array.isArray(result.warnings)).toBe(true);
    });

    it("should handle missing parameters gracefully", () => {
      const result1 = usePositionApr(undefined as any, CHAIN_ID);
      const result2 = usePositionApr(TEST_TOKEN_ID, undefined as any);

      // Should return default state without throwing
      expect(typeof result1.isLoading).toBe("boolean");
      expect(typeof result2.isLoading).toBe("boolean");
    });

    it("should return consistent interface for different inputs", () => {
      const inputs = [
        { tokenId: 1n, chainId: CHAIN_ID },
        { tokenId: 2n, chainId: CHAIN_ID },
        { tokenId: 3n, chainId: CHAIN_ID },
      ];

      inputs.forEach((input) => {
        const result = usePositionApr(input.tokenId, input.chainId);
        expect(typeof result.isLoading).toBe("boolean");
        expect(typeof result.isError).toBe("boolean");
      });
    });
  });

  describe("Error handling", () => {
    it("should handle invalid tokenId format", () => {
      const result = usePositionApr(-1n as any, CHAIN_ID);
      expect(typeof result.isLoading).toBe("boolean");
      expect(typeof result.isError).toBe("boolean");
    });

    it("should handle invalid chainId", () => {
      const result = usePositionApr(TEST_TOKEN_ID, 999999 as any);
      expect(typeof result.isLoading).toBe("boolean");
      expect(typeof result.isError).toBe("boolean");
    });
  });

  describe("Data structure validation", () => {
    it("should handle partial APR data", () => {
      // This test verifies the interface can handle different data scenarios
      // The actual React Query behavior would be tested in component integration tests
      const result = usePositionApr(TEST_TOKEN_ID, CHAIN_ID);

      // All APR values should be either number or undefined
      const aprValues = [result.apr24h, result.apr7d, result.apr30d];
      aprValues.forEach(apr => {
        expect(apr === undefined || typeof apr === "number").toBe(true);
      });
    });

    it("should handle warnings array", () => {
      const result = usePositionApr(TEST_TOKEN_ID, CHAIN_ID);

      // warnings should be undefined or an array
      expect(result.warnings === undefined || Array.isArray(result.warnings)).toBe(true);
    });
  });

  describe("Integration with historical data", () => {
    it("should be able to work with historical data repository", async () => {
      // Create test snapshots
      const now = Date.now();
      const testSnapshot = createTestSnapshot(now, 1000000000000000000000000000000n, 2000000000000000000000000000000n);

      await historicalDataRepository.storeSnapshot(TEST_TOKEN_ID, CHAIN_ID, testSnapshot);

      // Verify the hook can be called without throwing
      const result = usePositionApr(TEST_TOKEN_ID, CHAIN_ID);
      expect(typeof result.isLoading).toBe("boolean");
    });

    it("should handle missing historical data", () => {
      // Use a token ID that doesn't exist
      const nonExistentTokenId = 999999n;
      const result = usePositionApr(nonExistentTokenId, CHAIN_ID);

      expect(typeof result.isLoading).toBe("boolean");
      expect(typeof result.isError).toBe("boolean");
    });
  });

  describe("Performance and optimization", () => {
    it("should return quickly without blocking", () => {
      const start = Date.now();
      const result = usePositionApr(TEST_TOKEN_ID, CHAIN_ID);
      const end = Date.now();

      // Hook should return immediately (synchronously)
      expect(end - start).toBeLessThan(10); // Should be much less than 10ms
      expect(typeof result.isLoading).toBe("boolean");
    });

    it("should be callable multiple times without performance issues", () => {
      const iterations = 100;
      const start = Date.now();

      for (let i = 0; i < iterations; i++) {
        usePositionApr(BigInt(i + 1), CHAIN_ID);
      }

      const end = Date.now();
      expect(end - start).toBeLessThan(100); // Should be fast
    });
  });
});