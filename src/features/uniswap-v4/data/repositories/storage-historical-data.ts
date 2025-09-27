import { inject, injectable } from "tsyringe";

import type { SupportedChainId } from "../../configs";
import type { StorageAdapter } from "../../domain/ports/storage-adapter";
import type { HistoricalDataRepository } from "../../domain/repositories/historical-data";
import type { PositionSnapshot } from "../../domain/types";

interface StoredSnapshot extends PositionSnapshot {
  id: string; // unique identifier for the snapshot
  tokenId: string; // stored as string since bigint isn't JSON serializable
  chainId: number;
}

@injectable()
export class StorageHistoricalDataRepository implements HistoricalDataRepository {
  private readonly STORAGE_KEY_PREFIX = "uniswap_v4_snapshots";
  private readonly INDEX_KEY_PREFIX = "uniswap_v4_index";

  constructor(@inject("StorageAdapter") private readonly storage: StorageAdapter) {}

  async storeSnapshot(tokenId: bigint, chainId: SupportedChainId, snapshot: PositionSnapshot): Promise<void> {
    try {
      const snapshotId = this.generateSnapshotId(tokenId, chainId, snapshot.timestamp);
      const positionKey = this.getPositionKey(tokenId, chainId);

      // Store the snapshot
      const storedSnapshot: StoredSnapshot = {
        ...snapshot,
        id: snapshotId,
        tokenId: tokenId.toString(),
        chainId,
        // Convert bigint values to strings for storage
        feeGrowthInside0X128: snapshot.feeGrowthInside0X128,
        feeGrowthInside1X128: snapshot.feeGrowthInside1X128,
      };

      this.storage.set(`${this.STORAGE_KEY_PREFIX}:${snapshotId}`, JSON.stringify(storedSnapshot, this.bigintReplacer));

      // Update the index for this position
      await this.updatePositionIndex(positionKey, snapshotId, snapshot.timestamp);

      console.log(`Stored snapshot for position ${tokenId} at ${new Date(snapshot.timestamp).toISOString()}`);
    } catch (error) {
      console.error("Failed to store snapshot:", error);
      throw new Error(`Failed to store snapshot: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getLatestSnapshot(tokenId: bigint, chainId: SupportedChainId): Promise<PositionSnapshot | null> {
    try {
      const positionKey = this.getPositionKey(tokenId, chainId);
      const index = this.getPositionIndex(positionKey);

      if (!index || index.length === 0) {
        return null;
      }

      // Get the most recent snapshot (index is sorted by timestamp desc)
      const latestEntry = index[0];
      return await this.getSnapshotById(latestEntry.snapshotId);
    } catch (error) {
      console.error("Failed to get latest snapshot:", error);
      return null;
    }
  }

  async getSnapshotNearTimestamp(
    tokenId: bigint,
    chainId: SupportedChainId,
    timestamp: number,
    tolerance: number = 60 * 60 * 1000, // 1 hour default
  ): Promise<PositionSnapshot | null> {
    try {
      const positionKey = this.getPositionKey(tokenId, chainId);
      const index = this.getPositionIndex(positionKey);

      if (!index || index.length === 0) {
        return null;
      }

      // Find the closest snapshot within tolerance
      let closestEntry: { snapshotId: string; timestamp: number } | null = null;
      let minDifference = Infinity;

      for (const entry of index) {
        const difference = Math.abs(entry.timestamp - timestamp);
        if (difference <= tolerance && difference < minDifference) {
          minDifference = difference;
          closestEntry = entry;
        }
      }

      if (!closestEntry) {
        return null;
      }

      return await this.getSnapshotById(closestEntry.snapshotId);
    } catch (error) {
      console.error("Failed to get snapshot near timestamp:", error);
      return null;
    }
  }

  async getSnapshotsInRange(
    tokenId: bigint,
    chainId: SupportedChainId,
    startTimestamp: number,
    endTimestamp: number,
  ): Promise<PositionSnapshot[]> {
    try {
      const positionKey = this.getPositionKey(tokenId, chainId);
      const index = this.getPositionIndex(positionKey);

      if (!index || index.length === 0) {
        return [];
      }

      // Filter snapshots within the time range
      const relevantEntries = index.filter(
        (entry) => entry.timestamp >= startTimestamp && entry.timestamp <= endTimestamp,
      );

      // Fetch all snapshots in parallel
      const snapshots = await Promise.all(relevantEntries.map((entry) => this.getSnapshotById(entry.snapshotId)));

      // Filter out any null results and sort by timestamp
      return snapshots
        .filter((snapshot): snapshot is PositionSnapshot => snapshot !== null)
        .sort((a, b) => a.timestamp - b.timestamp);
    } catch (error) {
      console.error("Failed to get snapshots in range:", error);
      return [];
    }
  }

  async getHistoricalSnapshot(
    tokenId: bigint,
    chainId: SupportedChainId,
    period: "24h" | "7d" | "30d",
  ): Promise<PositionSnapshot | null> {
    const now = Date.now();
    const periodMs = {
      "24h": 24 * 60 * 60 * 1000,
      "7d": 7 * 24 * 60 * 60 * 1000,
      "30d": 30 * 24 * 60 * 60 * 1000,
    };

    const targetTimestamp = now - periodMs[period];
    const tolerance = periodMs[period] * 0.1; // 10% tolerance

    return await this.getSnapshotNearTimestamp(tokenId, chainId, targetTimestamp, tolerance);
  }

  async cleanupOldSnapshots(retentionDays: number): Promise<{ deletedCount: number }> {
    try {
      const cutoffTimestamp = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
      let deletedCount = 0;

      // Get all snapshot keys
      const allKeys = this.storage.getAllKeys();
      const snapshotKeys = allKeys.filter((key) => key.startsWith(this.STORAGE_KEY_PREFIX));

      for (const key of snapshotKeys) {
        try {
          const snapshotData = this.storage.getString(key);
          if (snapshotData) {
            const snapshot = JSON.parse(snapshotData, this.bigintReviver) as StoredSnapshot;
            if (snapshot.timestamp < cutoffTimestamp) {
              this.storage.delete(key);
              deletedCount++;
            }
          }
        } catch (error) {
          // Delete corrupted entries
          this.storage.delete(key);
          deletedCount++;
        }
      }

      // Rebuild indexes after cleanup
      await this.rebuildIndexes();

      console.log(`Cleaned up ${deletedCount} old snapshots`);
      return { deletedCount };
    } catch (error) {
      console.error("Failed to cleanup old snapshots:", error);
      throw new Error(`Cleanup failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getPositionsNeedingUpdates(
    maxAgeMs: number,
  ): Promise<{ tokenId: bigint; chainId: SupportedChainId; lastUpdate: number }[]> {
    try {
      const result: { tokenId: bigint; chainId: SupportedChainId; lastUpdate: number }[] = [];
      const allKeys = this.storage.getAllKeys();
      const indexKeys = allKeys.filter((key) => key.startsWith(this.INDEX_KEY_PREFIX));

      for (const indexKey of indexKeys) {
        try {
          const indexData = this.storage.getString(indexKey);
          if (indexData) {
            const index = JSON.parse(indexData) as { snapshotId: string; timestamp: number }[];
            if (index.length > 0) {
              const lastUpdate = index[0].timestamp; // Most recent snapshot
              const now = Date.now();

              if (now - lastUpdate > maxAgeMs) {
                // Parse position info from key
                const keyParts = indexKey.replace(`${this.INDEX_KEY_PREFIX}:`, "").split(":");
                if (keyParts.length === 2) {
                  const tokenId = BigInt(keyParts[0]);
                  const chainId = parseInt(keyParts[1]) as SupportedChainId;
                  result.push({ tokenId, chainId, lastUpdate });
                }
              }
            }
          }
        } catch (error) {
          console.error(`Failed to parse index ${indexKey}:`, error);
        }
      }

      return result;
    } catch (error) {
      console.error("Failed to get positions needing updates:", error);
      return [];
    }
  }

  // Private helper methods

  private generateSnapshotId(tokenId: bigint, chainId: SupportedChainId, timestamp: number): string {
    return `${tokenId}_${chainId}_${timestamp}`;
  }

  private getPositionKey(tokenId: bigint, chainId: SupportedChainId): string {
    return `${tokenId}:${chainId}`;
  }

  private async updatePositionIndex(positionKey: string, snapshotId: string, timestamp: number): Promise<void> {
    const indexKey = `${this.INDEX_KEY_PREFIX}:${positionKey}`;

    // Get existing index
    let index = this.getPositionIndex(positionKey) || [];

    // Add new entry
    index.push({ snapshotId, timestamp });

    // Sort by timestamp descending (most recent first)
    index.sort((a, b) => b.timestamp - a.timestamp);

    // Limit to last 100 snapshots per position to prevent unlimited growth
    index = index.slice(0, 100);

    // Store updated index
    this.storage.set(indexKey, JSON.stringify(index));
  }

  private getPositionIndex(positionKey: string): { snapshotId: string; timestamp: number }[] | null {
    const indexKey = `${this.INDEX_KEY_PREFIX}:${positionKey}`;
    const indexData = this.storage.getString(indexKey);

    if (!indexData) {
      return null;
    }

    try {
      return JSON.parse(indexData);
    } catch (error) {
      console.error(`Failed to parse index for ${positionKey}:`, error);
      return null;
    }
  }

  private async getSnapshotById(snapshotId: string): Promise<PositionSnapshot | null> {
    const key = `${this.STORAGE_KEY_PREFIX}:${snapshotId}`;
    const snapshotData = this.storage.getString(key);

    if (!snapshotData) {
      return null;
    }

    try {
      const storedSnapshot = JSON.parse(snapshotData, this.bigintReviver) as StoredSnapshot;

      // Convert back to PositionSnapshot interface
      return {
        timestamp: storedSnapshot.timestamp,
        blockNumber: storedSnapshot.blockNumber,
        feeGrowthInside0X128: storedSnapshot.feeGrowthInside0X128,
        feeGrowthInside1X128: storedSnapshot.feeGrowthInside1X128,
        positionValueUsd: storedSnapshot.positionValueUsd,
      };
    } catch (error) {
      console.error(`Failed to parse snapshot ${snapshotId}:`, error);
      return null;
    }
  }

  private async rebuildIndexes(): Promise<void> {
    try {
      // Clear all existing indexes
      const allKeys = this.storage.getAllKeys();
      const indexKeys = allKeys.filter((key) => key.startsWith(this.INDEX_KEY_PREFIX));
      indexKeys.forEach((key) => this.storage.delete(key));

      // Rebuild from snapshots
      const snapshotKeys = allKeys.filter((key) => key.startsWith(this.STORAGE_KEY_PREFIX));
      const positionIndexes: Record<string, { snapshotId: string; timestamp: number }[]> = {};

      for (const key of snapshotKeys) {
        try {
          const snapshotData = this.storage.getString(key);
          if (snapshotData) {
            const snapshot = JSON.parse(snapshotData, this.bigintReviver) as StoredSnapshot;
            const positionKey = `${snapshot.tokenId}:${snapshot.chainId}`;

            if (!positionIndexes[positionKey]) {
              positionIndexes[positionKey] = [];
            }

            positionIndexes[positionKey].push({
              snapshotId: snapshot.id,
              timestamp: snapshot.timestamp,
            });
          }
        } catch (error) {
          console.error(`Failed to process snapshot ${key} during rebuild:`, error);
        }
      }

      // Sort and store indexes
      for (const [positionKey, index] of Object.entries(positionIndexes)) {
        index.sort((a, b) => b.timestamp - a.timestamp);
        const indexKey = `${this.INDEX_KEY_PREFIX}:${positionKey}`;
        this.storage.set(indexKey, JSON.stringify(index.slice(0, 100))); // Limit to 100 entries
      }

      console.log(`Rebuilt indexes for ${Object.keys(positionIndexes).length} positions`);
    } catch (error) {
      console.error("Failed to rebuild indexes:", error);
      throw error;
    }
  }

  // BigInt serialization helpers
  private bigintReplacer(key: string, value: any): any {
    if (typeof value === "bigint") {
      return { __type: "bigint", value: value.toString() };
    }
    return value;
  }

  private bigintReviver(key: string, value: any): any {
    if (value && typeof value === "object" && value.__type === "bigint") {
      return BigInt(value.value);
    }
    return value;
  }
}
