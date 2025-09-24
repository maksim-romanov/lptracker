import { container } from "tsyringe";

import { DefaultLoggerFactory, type LoggerConfig, type LoggerFactory } from "../../../infrastructure/logging";
import { GetTokenMetadataUseCase } from "../application/use-cases/get-token-metadata";
import { CachedMetadataRepository } from "../data/repositories/cached-metadata";
import { CoinGeckoMetadataRepository } from "../data/repositories/coingecko-metadata";
import { FallbackMetadataRepository } from "../data/repositories/fallback-metadata";
import { MoralisMetadataRepository } from "../data/repositories/moralis-metadata";
import { TrustWalletMetadataRepository } from "../data/repositories/trustwallet-metadata";
import type { MetadataRepository, MetadataProviderRepository } from "../domain/repositories";

export function configureDI(): void {
  // Configure logging
  const loggerConfig: LoggerConfig = {
    defaultLevel: "info",
    classLevels: {
      // Can be configured via environment or config
      TrustWallet: "silent",
      CoinGecko: process.env.NODE_ENV === "development" ? "debug" : "warn",
      Moralis: process.env.NODE_ENV === "development" ? "debug" : "warn",
      TokenMetadata: "silent", // For fallback repository
      GetTokenMetadata: "silent", // For use case
      useTokenMetadata: "silent", // For React hook
    },
  };

  // Register logger factory
  container.register<LoggerFactory>("LoggerFactory", {
    useFactory: () => new DefaultLoggerFactory(loggerConfig),
  });

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
      const loggerFactory = container.resolve<LoggerFactory>("LoggerFactory");
      return new FallbackMetadataRepository(providers, loggerFactory);
    },
  });

  // Register cached repository as main metadata repository
  container.register<MetadataRepository>("MetadataRepository", {
    useFactory: () => {
      const fallbackRepo = container.resolve<MetadataRepository>("FallbackMetadataRepository");
      const loggerFactory = container.resolve<LoggerFactory>("LoggerFactory");
      return new CachedMetadataRepository(fallbackRepo, loggerFactory);
    },
  });

  // Register use case
  container.register<GetTokenMetadataUseCase>("GetTokenMetadataUseCase", {
    useClass: GetTokenMetadataUseCase,
  });
}

export { container };
