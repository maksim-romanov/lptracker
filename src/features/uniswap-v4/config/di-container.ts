import { container } from "tsyringe";

import { CalculatePositionAprUseCase } from "../application/use-cases/calculate-position-apr";
import { GetMultiChainPositionIdsUseCase } from "../application/use-cases/get-multi-chain-position-ids";
import { GetPositionCardUseCase } from "../application/use-cases/get-position-card";
import { GetPositionIdsUseCase } from "../application/use-cases/get-position-ids";
import { GetPositionSummaryUseCase } from "../application/use-cases/get-position-summary";
import { InMemoryStorageAdapter } from "../data/adapters/in-memory-storage-adapter";
import { StorageHistoricalDataRepository } from "../data/repositories/storage-historical-data";
import { SubgraphPositionRepository } from "../data/repositories/subgraph-position";
import { ViemPoolRepository } from "../data/repositories/viem-pool";
import { ViemPositionRepository } from "../data/repositories/viem-position";
import { ViemTokenRepository } from "../data/repositories/viem-token";
import { ViemBlockchainHistoryService } from "../data/services/viem-blockchain-history";
import type { StorageAdapter } from "../domain/ports/storage-adapter";
import type { PositionRepository, PoolRepository, TokenRepository } from "../domain/repositories";
import type { BlockchainHistoryService, HistoricalDataRepository } from "../domain/repositories/historical-data";
import { SnapshotSchedulerService } from "../domain/services/snapshot-scheduler";

export function configureDI(forTesting: boolean = false): void {
  container.register<PositionRepository>("PositionRepository", {
    useClass: SubgraphPositionRepository,
  });

  container.register<PositionRepository>("ViemPositionRepository", {
    useClass: ViemPositionRepository,
  });

  container.register<PoolRepository>("PoolRepository", {
    useClass: ViemPoolRepository,
  });

  container.register<TokenRepository>("TokenRepository", {
    useClass: ViemTokenRepository,
  });

  // Storage Adapters
  if (forTesting) {
    // For testing - use in-memory storage
    container.register<StorageAdapter>("StorageAdapter", {
      useValue: new InMemoryStorageAdapter({
        id: "uniswap-v4-historical-data-test",
      }),
    });
  } else {
    // For production - determine environment and use appropriate storage
    container.register<StorageAdapter>("StorageAdapter", {
      useFactory: () => {
        // Check environment and return appropriate storage
        try {
          // Try to detect React Native environment more reliably
          const isReactNative = typeof global !== "undefined" &&
                               global.HermesInternal !== undefined;

          if (isReactNative) {
            // This will only be reached in actual React Native runtime
            // Dynamic import to avoid module loading in test environment
            // For now, fallback to in-memory in non-RN environments
            console.log("React Native detected, but falling back to in-memory for safety");
          }

          // Use in-memory storage for now (can be enhanced later)
          return new InMemoryStorageAdapter({
            id: "uniswap-v4-historical-data-dev",
          });
        } catch (error) {
          console.warn("Storage adapter initialization failed, using in-memory:", error);
          return new InMemoryStorageAdapter({
            id: "uniswap-v4-historical-data-fallback",
          });
        }
      },
    });
  }

  // Historical Data
  container.register<HistoricalDataRepository>("HistoricalDataRepository", {
    useClass: StorageHistoricalDataRepository,
  });

  container.register<BlockchainHistoryService>("BlockchainHistoryService", {
    useClass: ViemBlockchainHistoryService,
  });

  // Services
  container.register("SnapshotSchedulerService", {
    useClass: SnapshotSchedulerService,
  });

  // Use Cases
  container.register("GetPositionIdsUseCase", {
    useClass: GetPositionIdsUseCase,
  });

  container.register("GetMultiChainPositionIdsUseCase", {
    useFactory: (c) => new GetMultiChainPositionIdsUseCase(c.resolve("GetPositionIdsUseCase")),
  });

  container.register("CalculatePositionAprUseCase", {
    useClass: CalculatePositionAprUseCase,
  });

  container.register("GetPositionCardUseCase", {
    useClass: GetPositionCardUseCase,
  });

  container.register("GetPositionSummaryUseCase", {
    useClass: GetPositionSummaryUseCase,
  });
}

export { container };
