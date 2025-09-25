import { container } from "tsyringe";

import { GetChainlinkPriceUseCase } from "../application/use-cases/get-chainlink-price";
import { MemoryFeedsCache } from "../data/cache/feeds-cache";
import { BlockchainPriceRepositoryImpl } from "../data/repositories/blockchain-price-repository";
import { HardcodedFeedsMetadataRepository } from "../data/repositories/hardcoded-feeds-metadata-repository";
import type { BlockchainPriceRepository, FeedsMetadataRepository } from "../domain/repositories";
import type { FeedsCache } from "../domain/types";

export function configureChainlinkDI(): void {
  // Register cache
  container.register<FeedsCache>("ChainlinkFeedsCache", {
    useClass: MemoryFeedsCache,
  });

  // Register repositories - using hardcoded implementation for now
  container.register<FeedsMetadataRepository>("FeedsMetadataRepository", {
    useClass: HardcodedFeedsMetadataRepository,
  });

  container.register<BlockchainPriceRepository>("BlockchainPriceRepository", {
    useClass: BlockchainPriceRepositoryImpl,
  });

  // Register use cases
  container.register<GetChainlinkPriceUseCase>(GetChainlinkPriceUseCase, {
    useFactory: () => {
      const feedsMetadataRepo = container.resolve<FeedsMetadataRepository>("FeedsMetadataRepository");
      const blockchainPriceRepo = container.resolve<BlockchainPriceRepository>("BlockchainPriceRepository");
      return new GetChainlinkPriceUseCase(feedsMetadataRepo, blockchainPriceRepo);
    },
  });
}

export { container };
