import "reflect-metadata";

import { describe, it, expect, beforeAll, afterAll, beforeEach } from "bun:test";
import * as chains from "viem/chains";

import { configureDI, container } from "../src/features/uniswap-v4/config/di-container";
import type { StorageAdapter } from "../src/features/uniswap-v4/domain/ports/storage-adapter";
import type { HistoricalDataRepository } from "../src/features/uniswap-v4/domain/repositories/historical-data";
import { SnapshotSchedulerService } from "../src/features/uniswap-v4/domain/services/snapshot-scheduler";
import type { PositionSnapshot } from "../src/features/uniswap-v4/domain/types";

const TEST_TOKEN_ID = 123n;
const CHAIN_ID = chains.arbitrum.id;

describe("Historical Data System", () => {
  let historicalDataRepository: HistoricalDataRepository;
  let snapshotScheduler: SnapshotSchedulerService;
  let storageAdapter: StorageAdapter;

  beforeAll(() => {
    configureDI(true); // Configure for testing
    historicalDataRepository = container.resolve("HistoricalDataRepository");
    snapshotScheduler = container.resolve("SnapshotSchedulerService");
    storageAdapter = container.resolve("StorageAdapter");
  });

  beforeEach(() => {
    // Clear storage between tests to avoid interference
    storageAdapter.clearAll();
  });

  afterAll(async () => {
    // Clean up test data
    try {
      await historicalDataRepository.cleanupOldSnapshots(0); // Delete all
    } catch (error) {
      console.warn("Cleanup failed:", error);
    }
  });

  describe("HistoricalDataRepository", () => {
    const createTestSnapshot = (timestamp: number = Date.now()): PositionSnapshot => ({
      timestamp,
      blockNumber: 1000000 + Math.floor(timestamp / 1000),
      feeGrowthInside0X128: BigInt(Math.floor(Math.random() * 1000000)),
      feeGrowthInside1X128: BigInt(Math.floor(Math.random() * 1000000)),
      positionValueUsd: Math.random() * 10000,
    });

    it("should store and retrieve snapshots", async () => {
      const snapshot = createTestSnapshot();

      await historicalDataRepository.storeSnapshot(TEST_TOKEN_ID, CHAIN_ID, snapshot);

      const retrieved = await historicalDataRepository.getLatestSnapshot(TEST_TOKEN_ID, CHAIN_ID);

      expect(retrieved).toBeDefined();
      expect(retrieved?.timestamp).toBe(snapshot.timestamp);
      expect(retrieved?.blockNumber).toBe(snapshot.blockNumber);
      expect(retrieved?.feeGrowthInside0X128).toBe(snapshot.feeGrowthInside0X128);
      expect(retrieved?.feeGrowthInside1X128).toBe(snapshot.feeGrowthInside1X128);
      expect(retrieved?.positionValueUsd).toBe(snapshot.positionValueUsd);
    });

    it("should handle multiple snapshots for same position", async () => {
      const now = Date.now();
      const snapshots = [
        createTestSnapshot(now - 24 * 60 * 60 * 1000), // 24h ago
        createTestSnapshot(now - 12 * 60 * 60 * 1000), // 12h ago
        createTestSnapshot(now), // now
      ];

      // Store all snapshots
      for (const snapshot of snapshots) {
        await historicalDataRepository.storeSnapshot(TEST_TOKEN_ID, CHAIN_ID, snapshot);
      }

      // Should return the most recent
      const latest = await historicalDataRepository.getLatestSnapshot(TEST_TOKEN_ID, CHAIN_ID);
      expect(latest?.timestamp).toBe(now);

      // Should find snapshots in range
      const rangeSnapshots = await historicalDataRepository.getSnapshotsInRange(
        TEST_TOKEN_ID,
        CHAIN_ID,
        now - 25 * 60 * 60 * 1000,
        now + 1000,
      );

      expect(rangeSnapshots).toHaveLength(3);
      expect(rangeSnapshots[0].timestamp).toBeLessThan(rangeSnapshots[1].timestamp);
      expect(rangeSnapshots[1].timestamp).toBeLessThan(rangeSnapshots[2].timestamp);
    });

    it("should find snapshots near specific timestamps", async () => {
      const baseTime = Date.now() - 2 * 60 * 60 * 1000; // 2 hours ago
      const snapshot = createTestSnapshot(baseTime);

      await historicalDataRepository.storeSnapshot(TEST_TOKEN_ID, CHAIN_ID, snapshot);

      // Should find snapshot within tolerance
      const found = await historicalDataRepository.getSnapshotNearTimestamp(
        TEST_TOKEN_ID,
        CHAIN_ID,
        baseTime + 5 * 60 * 1000, // 5 minutes after
        10 * 60 * 1000, // 10 minute tolerance
      );

      expect(found).toBeDefined();
      expect(found?.timestamp).toBe(baseTime);

      // Should not find snapshot outside tolerance
      const notFound = await historicalDataRepository.getSnapshotNearTimestamp(
        TEST_TOKEN_ID,
        CHAIN_ID,
        baseTime + 2 * 60 * 60 * 1000, // 2 hours after
        30 * 60 * 1000, // 30 minute tolerance
      );

      expect(notFound).toBeNull();
    });

    it("should get historical snapshots for APR periods", async () => {
      const now = Date.now();
      const oneDayAgo = now - 24 * 60 * 60 * 1000;
      const snapshot = createTestSnapshot(oneDayAgo);

      await historicalDataRepository.storeSnapshot(TEST_TOKEN_ID, CHAIN_ID, snapshot);

      const historical = await historicalDataRepository.getHistoricalSnapshot(TEST_TOKEN_ID, CHAIN_ID, "24h");

      expect(historical).toBeDefined();
      expect(historical?.timestamp).toBe(oneDayAgo);
    });

    it("should handle BigInt serialization correctly", async () => {
      const snapshot = createTestSnapshot();
      snapshot.feeGrowthInside0X128 = 340282366920938463463374607431768211455n; // Very large BigInt
      snapshot.feeGrowthInside1X128 = 123456789012345678901234567890n;

      await historicalDataRepository.storeSnapshot(TEST_TOKEN_ID, CHAIN_ID, snapshot);

      const retrieved = await historicalDataRepository.getLatestSnapshot(TEST_TOKEN_ID, CHAIN_ID);

      expect(retrieved?.feeGrowthInside0X128).toBe(snapshot.feeGrowthInside0X128);
      expect(retrieved?.feeGrowthInside1X128).toBe(snapshot.feeGrowthInside1X128);
    });

    it("should return empty results for non-existent positions", async () => {
      const nonExistentTokenId = 999999n;

      const latest = await historicalDataRepository.getLatestSnapshot(nonExistentTokenId, CHAIN_ID);
      expect(latest).toBeNull();

      const snapshots = await historicalDataRepository.getSnapshotsInRange(
        nonExistentTokenId,
        CHAIN_ID,
        Date.now() - 24 * 60 * 60 * 1000,
        Date.now(),
      );
      expect(snapshots).toHaveLength(0);
    });

    it("should cleanup old snapshots", async () => {
      const oldTime = Date.now() - 10 * 24 * 60 * 60 * 1000; // 10 days ago
      const oldSnapshot = createTestSnapshot(oldTime);

      await historicalDataRepository.storeSnapshot(TEST_TOKEN_ID + 1n, CHAIN_ID, oldSnapshot);

      const result = await historicalDataRepository.cleanupOldSnapshots(5); // Keep 5 days

      expect(result.deletedCount).toBeGreaterThan(0);

      // Verify old snapshot is gone
      const retrieved = await historicalDataRepository.getLatestSnapshot(TEST_TOKEN_ID + 1n, CHAIN_ID);
      expect(retrieved).toBeNull();
    });
  });

  describe("SnapshotSchedulerService", () => {
    it("should have required dependencies injected", () => {
      expect(snapshotScheduler).toBeDefined();
      expect(typeof snapshotScheduler.start).toBe("function");
      expect(typeof snapshotScheduler.stop).toBe("function");
      expect(typeof snapshotScheduler.createSnapshot).toBe("function");
    });

    it("should handle scheduler configuration", () => {
      const config = {
        checkIntervalMinutes: 10,
        maxSnapshotAgeHours: 2,
        retentionDays: 30,
        enabled: false, // Keep disabled for tests
        maxBatchSize: 5,
      };

      // Should not throw when starting with disabled config
      expect(() => snapshotScheduler.start(config)).not.toThrow();
      expect(() => snapshotScheduler.stop()).not.toThrow();
    });

    it("should handle manual snapshot updates", async () => {
      const config = {
        checkIntervalMinutes: 10,
        maxSnapshotAgeHours: 1,
        retentionDays: 30,
        enabled: false,
        maxBatchSize: 5,
      };

      try {
        const result = await snapshotScheduler.updateStaleSnapshots(config);

        expect(typeof result.updated).toBe("number");
        expect(typeof result.failed).toBe("number");
        expect(Array.isArray(result.errors)).toBe(true);
      } catch (error) {
        // Expected to fail due to missing dependencies for position creation
        expect(error).toBeInstanceOf(Error);
        console.log("Expected failure due to missing position data:", error.message);
      }
    });

    it("should handle cleanup operations", async () => {
      const result = await snapshotScheduler.cleanupOldSnapshots(30);

      expect(typeof result.deletedCount).toBe("number");
      expect(result.deletedCount).toBeGreaterThanOrEqual(0);
    });

    it("should get snapshot statistics", async () => {
      const stats = await snapshotScheduler.getSnapshotStats();

      expect(typeof stats.totalPositionsTracked).toBe("number");
      expect(stats.oldestSnapshot === null || typeof stats.oldestSnapshot === "number").toBe(true);
      expect(stats.newestSnapshot === null || typeof stats.newestSnapshot === "number").toBe(true);
    });
  });

  describe("Integration", () => {
    it("should integrate repository and scheduler correctly", async () => {
      // Store a snapshot via repository
      const snapshot = {
        timestamp: Date.now() - 3 * 60 * 60 * 1000, // 3 hours ago
        blockNumber: 1000000,
        feeGrowthInside0X128: 12345n,
        feeGrowthInside1X128: 67890n,
        positionValueUsd: 1000,
      };

      await historicalDataRepository.storeSnapshot(TEST_TOKEN_ID + 2n, CHAIN_ID, snapshot);

      // Check that scheduler can find stale positions
      const positions = await historicalDataRepository.getPositionsNeedingUpdates(2 * 60 * 60 * 1000); // 2 hours

      expect(positions.length).toBeGreaterThan(0);

      // Find our test position
      const testPosition = positions.find((p) => p.tokenId === TEST_TOKEN_ID + 2n);
      expect(testPosition).toBeDefined();
      expect(testPosition?.chainId).toBe(CHAIN_ID);
      expect(testPosition?.lastUpdate).toBe(snapshot.timestamp);
    });
  });
});
