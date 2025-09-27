import { inject, injectable } from "tsyringe";

import type { SupportedChainId } from "../../configs";
import type { PositionRepository } from "../repositories";
import type { BlockchainHistoryService, HistoricalDataRepository } from "../repositories/historical-data";
import type { PositionSnapshot } from "../types";

export interface SnapshotSchedulerConfig {
  /** How often to check for positions needing updates (in minutes) */
  checkIntervalMinutes: number;
  /** Maximum age before a position snapshot is considered stale (in hours) */
  maxSnapshotAgeHours: number;
  /** How many days of snapshots to retain */
  retentionDays: number;
  /** Whether to enable automatic scheduling */
  enabled: boolean;
  /** Maximum number of positions to update per batch */
  maxBatchSize: number;
}

@injectable()
export class SnapshotSchedulerService {
  private schedulerTimer: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor(
    @inject("HistoricalDataRepository")
    private readonly historicalDataRepository: HistoricalDataRepository,
    @inject("PositionRepository")
    private readonly positionRepository: PositionRepository,
    @inject("BlockchainHistoryService")
    private readonly blockchainHistoryService: BlockchainHistoryService,
  ) {}

  /**
   * Start the automatic snapshot scheduler
   */
  start(config: SnapshotSchedulerConfig): void {
    if (!config.enabled) {
      console.log("Snapshot scheduler is disabled in configuration");
      return;
    }

    if (this.schedulerTimer) {
      console.warn("Snapshot scheduler is already running");
      return;
    }

    console.log(`Starting snapshot scheduler with ${config.checkIntervalMinutes} minute intervals`);

    this.schedulerTimer = setInterval(
      async () => {
        if (this.isRunning) {
          console.log("Previous snapshot update still running, skipping this interval");
          return;
        }

        try {
          await this.runScheduledUpdate(config);
        } catch (error) {
          console.error("Scheduled snapshot update failed:", error);
        }
      },
      config.checkIntervalMinutes * 60 * 1000,
    );

    // Run initial update
    setTimeout(() => this.runScheduledUpdate(config), 5000); // 5 second delay on startup
  }

  /**
   * Stop the automatic snapshot scheduler
   */
  stop(): void {
    if (this.schedulerTimer) {
      clearInterval(this.schedulerTimer);
      this.schedulerTimer = null;
      console.log("Snapshot scheduler stopped");
    }
  }

  /**
   * Manually trigger a snapshot update for all stale positions
   */
  async updateStaleSnapshots(config: SnapshotSchedulerConfig): Promise<{
    updated: number;
    failed: number;
    errors: string[];
  }> {
    return await this.runScheduledUpdate(config);
  }

  /**
   * Create a snapshot for a specific position
   */
  async createSnapshot(
    tokenId: bigint,
    chainId: SupportedChainId,
    positionValueUsd?: number,
  ): Promise<PositionSnapshot> {
    try {
      console.log(`Creating snapshot for position ${tokenId} on chain ${chainId}`);

      // Get current position data
      const fullPositionData = await this.positionRepository.getFullPositionData(tokenId, chainId);

      // Calculate position value if not provided
      let valueUsd = positionValueUsd;
      if (valueUsd === undefined) {
        // For now, we'll use a placeholder value
        // In production, this would integrate with the price calculator
        valueUsd = 0; // TODO: Integrate with position value calculator
        console.warn("Position value calculation not implemented, using 0");
      }

      const snapshot: PositionSnapshot = {
        timestamp: Date.now(),
        blockNumber: 0, // TODO: Get current block number
        feeGrowthInside0X128: fullPositionData.stored.feeGrowthInside0X128,
        feeGrowthInside1X128: fullPositionData.stored.feeGrowthInside1X128,
        positionValueUsd: valueUsd,
      };

      // Store the snapshot
      await this.historicalDataRepository.storeSnapshot(tokenId, chainId, snapshot);

      console.log(`Successfully created snapshot for position ${tokenId}`);
      return snapshot;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to create snapshot for position ${tokenId}: ${errorMessage}`);
    }
  }

  /**
   * Run cleanup of old snapshots
   */
  async cleanupOldSnapshots(retentionDays: number): Promise<{ deletedCount: number }> {
    try {
      console.log(`Starting cleanup of snapshots older than ${retentionDays} days`);
      const result = await this.historicalDataRepository.cleanupOldSnapshots(retentionDays);
      console.log(`Cleanup completed: ${result.deletedCount} snapshots deleted`);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Snapshot cleanup failed: ${errorMessage}`);
    }
  }

  /**
   * Get snapshot statistics
   */
  async getSnapshotStats(): Promise<{
    totalPositionsTracked: number;
    oldestSnapshot: number | null;
    newestSnapshot: number | null;
  }> {
    try {
      // This would require additional methods in the repository
      // For now, return placeholder data
      return {
        totalPositionsTracked: 0,
        oldestSnapshot: null,
        newestSnapshot: null,
      };
    } catch (error) {
      console.error("Failed to get snapshot stats:", error);
      return {
        totalPositionsTracked: 0,
        oldestSnapshot: null,
        newestSnapshot: null,
      };
    }
  }

  // Private methods

  private async runScheduledUpdate(config: SnapshotSchedulerConfig): Promise<{
    updated: number;
    failed: number;
    errors: string[];
  }> {
    if (this.isRunning) {
      return { updated: 0, failed: 0, errors: ["Update already in progress"] };
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      console.log("Starting scheduled snapshot update");

      const maxAgeMs = config.maxSnapshotAgeHours * 60 * 60 * 1000;
      const positionsNeedingUpdate = await this.historicalDataRepository.getPositionsNeedingUpdates(maxAgeMs);

      if (positionsNeedingUpdate.length === 0) {
        console.log("No positions need snapshot updates");
        return { updated: 0, failed: 0, errors: [] };
      }

      console.log(`Found ${positionsNeedingUpdate.length} positions needing updates`);

      // Process in batches to avoid overwhelming the system
      const batchSize = Math.min(config.maxBatchSize, positionsNeedingUpdate.length);
      const batch = positionsNeedingUpdate.slice(0, batchSize);

      let updated = 0;
      let failed = 0;
      const errors: string[] = [];

      // Process each position in the batch
      for (const position of batch) {
        try {
          await this.createSnapshot(position.tokenId, position.chainId);
          updated++;
        } catch (error) {
          failed++;
          const errorMessage = error instanceof Error ? error.message : String(error);
          errors.push(`Position ${position.tokenId}: ${errorMessage}`);
          console.error(`Failed to update snapshot for position ${position.tokenId}:`, error);
        }

        // Add small delay between position updates to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay
      }

      // Run cleanup periodically (every 10th run approximately)
      if (Math.random() < 0.1) {
        try {
          await this.cleanupOldSnapshots(config.retentionDays);
        } catch (error) {
          console.error("Cleanup during scheduled update failed:", error);
          errors.push(`Cleanup failed: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      const duration = Date.now() - startTime;
      console.log(
        `Scheduled update completed in ${duration}ms: ${updated} updated, ${failed} failed, ${positionsNeedingUpdate.length - batchSize} remaining`,
      );

      return { updated, failed, errors };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Scheduled update failed:", error);
      return { updated: 0, failed: 0, errors: [errorMessage] };
    } finally {
      this.isRunning = false;
    }
  }
}
