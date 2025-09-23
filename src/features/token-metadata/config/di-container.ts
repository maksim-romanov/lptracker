import { container } from "tsyringe";

import { CachedMetadataRepository } from "../data/repositories/cached-metadata";
import { CoinGeckoMetadataRepository } from "../data/repositories/coingecko-metadata";
import { FallbackMetadataRepository } from "../data/repositories/fallback-metadata";
import { MoralisMetadataRepository } from "../data/repositories/moralis-metadata";
import type { MetadataRepository, MetadataProviderRepository } from "../domain/repositories";

export function configureDI(): void {
  // Register individual providers
  container.register<MetadataProviderRepository>("CoinGeckoMetadataRepository", {
    useClass: CoinGeckoMetadataRepository,
  });

  container.register<MetadataProviderRepository>("MoralisMetadataRepository", {
    useClass: MoralisMetadataRepository,
  });

  // Register the main fallback repository with provider chain
  container.register<MetadataRepository>("MetadataRepository", {
    useFactory: () => {
      const providers = [container.resolve(CoinGeckoMetadataRepository), container.resolve(MoralisMetadataRepository)];
      const fallbackRepository = new FallbackMetadataRepository(providers);
      return new CachedMetadataRepository(fallbackRepository);
    },
  });
}

export { container };
