import type { Address } from "viem";
import type { SupportedChainId } from "../../configs";
import type { PositionSnapshot } from "../types";

/**
 * Repository interface for managing historical position data
 */
export interface HistoricalDataRepository {
  /**
   * Store a position snapshot at a specific timestamp
   */
  storeSnapshot(
    tokenId: bigint,
    chainId: SupportedChainId,
    snapshot: PositionSnapshot
  ): Promise<void>;

  /**
   * Get the most recent snapshot for a position
   */
  getLatestSnapshot(
    tokenId: bigint,
    chainId: SupportedChainId
  ): Promise<PositionSnapshot | null>;

  /**
   * Get historical snapshot closest to a specific timestamp
   */
  getSnapshotNearTimestamp(
    tokenId: bigint,
    chainId: SupportedChainId,
    timestamp: number,
    tolerance?: number // tolerance in milliseconds, default 1 hour
  ): Promise<PositionSnapshot | null>;

  /**
   * Get all snapshots for a position within a time range
   */
  getSnapshotsInRange(
    tokenId: bigint,
    chainId: SupportedChainId,
    startTimestamp: number,
    endTimestamp: number
  ): Promise<PositionSnapshot[]>;

  /**
   * Get historical snapshot for APR calculation period
   */
  getHistoricalSnapshot(
    tokenId: bigint,
    chainId: SupportedChainId,
    period: "24h" | "7d" | "30d"
  ): Promise<PositionSnapshot | null>;

  /**
   * Clean up old snapshots beyond retention period
   */
  cleanupOldSnapshots(
    retentionDays: number
  ): Promise<{ deletedCount: number }>;

  /**
   * Get all positions that need snapshot updates
   */
  getPositionsNeedingUpdates(
    maxAgeMs: number
  ): Promise<Array<{ tokenId: bigint; chainId: SupportedChainId; lastUpdate: number }>>;
}

/**
 * Service interface for fetching historical blockchain data
 */
export interface BlockchainHistoryService {
  /**
   * Fetch position data at a specific block number
   */
  getPositionAtBlock(
    tokenId: bigint,
    chainId: SupportedChainId,
    blockNumber: number
  ): Promise<{
    feeGrowthInside0X128: bigint;
    feeGrowthInside1X128: bigint;
    blockNumber: number;
    timestamp: number;
  }>;

  /**
   * Find the closest block to a specific timestamp
   */
  getBlockNearTimestamp(
    chainId: SupportedChainId,
    timestamp: number
  ): Promise<{ blockNumber: number; timestamp: number }>;

  /**
   * Get multiple historical blocks for different timestamps
   */
  getBlocksForTimestamps(
    chainId: SupportedChainId,
    timestamps: number[]
  ): Promise<Array<{ blockNumber: number; timestamp: number }>>;
}