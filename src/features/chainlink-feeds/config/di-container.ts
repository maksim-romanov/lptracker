import { container } from "tsyringe";

import { DefaultLoggerFactory, type LoggerConfig, type LoggerFactory } from "../../../infrastructure/logging";
import { GetChainlinkPriceUseCase } from "../application/use-cases/get-chainlink-price";
import { MemoryFeedsCache } from "../data/cache/feeds-cache";
import { BlockchainPriceRepositoryImpl } from "../data/repositories/blockchain-price-repository";
import { RemoteFeedsMetadataRepository } from "../data/repositories/remote-feeds-metadata-repository";
import type { BlockchainPriceRepository, FeedsMetadataRepository } from "../domain/repositories";
import type { FeedsCache } from "../domain/types";

export function configureChainlinkDI(): void {
  // Configure logging for Chainlink
  const loggerConfig: LoggerConfig = {
    defaultLevel: "info",
    classLevels: {
      ChainlinkFeeds: process.env.NODE_ENV === "development" ? "debug" : "info",
      RemoteFeedsMetadata: process.env.NODE_ENV === "development" ? "debug" : "warn",
      BlockchainPrice: process.env.NODE_ENV === "development" ? "debug" : "warn",
      GetChainlinkPrice: process.env.NODE_ENV === "development" ? "debug" : "info",
      MemoryFeedsCache: "silent",
    },
  };

  // Register logger factory for Chainlink
  container.register<LoggerFactory>("ChainlinkLoggerFactory", {
    useFactory: () => new DefaultLoggerFactory(loggerConfig),
  });
  // Register cache
  container.register<FeedsCache>("ChainlinkFeedsCache", {
    useClass: MemoryFeedsCache,
  });

  // Register repositories - using remote implementation with caching
  container.register<FeedsMetadataRepository>("FeedsMetadataRepository", {
    useFactory: () => {
      const cache = container.resolve<FeedsCache>("ChainlinkFeedsCache");
      const loggerFactory = container.resolve<LoggerFactory>("ChainlinkLoggerFactory");
      return new RemoteFeedsMetadataRepository(cache, loggerFactory);
    },
  });

  container.register<BlockchainPriceRepository>("BlockchainPriceRepository", {
    useFactory: () => {
      const loggerFactory = container.resolve<LoggerFactory>("ChainlinkLoggerFactory");
      return new BlockchainPriceRepositoryImpl(loggerFactory);
    },
  });

  // Register use cases
  container.register<GetChainlinkPriceUseCase>(GetChainlinkPriceUseCase, {
    useFactory: () => {
      const feedsMetadataRepo = container.resolve<FeedsMetadataRepository>("FeedsMetadataRepository");
      const blockchainPriceRepo = container.resolve<BlockchainPriceRepository>("BlockchainPriceRepository");
      const loggerFactory = container.resolve<LoggerFactory>("ChainlinkLoggerFactory");
      return new GetChainlinkPriceUseCase(feedsMetadataRepo, blockchainPriceRepo, loggerFactory);
    },
  });
}

export { container };
