import { container } from "tsyringe";

import { GetTokenMetadataUseCase } from "../application/use-cases/get-token-metadata";
import { CachedMetadataRepository } from "../data/repositories/cached-metadata";
import { CoinGeckoMetadataRepository } from "../data/repositories/coingecko-metadata";
import { FallbackMetadataRepository } from "../data/repositories/fallback-metadata";
import { MoralisMetadataRepository } from "../data/repositories/moralis-metadata";
import { TrustWalletMetadataRepository } from "../data/repositories/trustwallet-metadata";
import type { MetadataRepository, MetadataProviderRepository } from "../domain/repositories";

export function configureDI(): void {
  // Register individual providers
  container.register<MetadataProviderRepository>("TrustWalletMetadataRepository", {
    useClass: TrustWalletMetadataRepository,
  });

  container.register<MetadataProviderRepository>("CoinGeckoMetadataRepository", {
    useClass: CoinGeckoMetadataRepository,
  });

  container.register<MetadataProviderRepository>("MoralisMetadataRepository", {
    useClass: MoralisMetadataRepository,
  });

  // Register fallback repository
  container.register<MetadataRepository>("FallbackMetadataRepository", {
    useFactory: () => {
      const providers = [
        container.resolve(TrustWalletMetadataRepository),
        container.resolve(CoinGeckoMetadataRepository),
        container.resolve(MoralisMetadataRepository),
      ];
      return new FallbackMetadataRepository(providers);
    },
  });

  // Register cached repository as main metadata repository
  container.register<MetadataRepository>("MetadataRepository", {
    useFactory: () => {
      const fallbackRepo = container.resolve<MetadataRepository>("FallbackMetadataRepository");
      return new CachedMetadataRepository(fallbackRepo);
    },
  });

  // Register use case
  container.register<GetTokenMetadataUseCase>("GetTokenMetadataUseCase", {
    useClass: GetTokenMetadataUseCase,
  });
}

export { container };
