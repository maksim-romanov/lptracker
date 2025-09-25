import { container } from "tsyringe";

import { DefaultLoggerFactory, type LoggerConfig, type LoggerFactory } from "../../../infrastructure/logging";
import { GetChainlinkPriceUseCase } from "../../chainlink-feeds/application/use-cases/get-chainlink-price";
import { configureChainlinkDI } from "../../chainlink-feeds/config/di-container";
import { CachedPriceRepository } from "../data/repositories/cached-price";
import { ChainlinkPriceRepository } from "../data/repositories/chainlink-price";
import { CoinGeckoPriceRepository } from "../data/repositories/coingecko-price";
import { FallbackPriceRepository } from "../data/repositories/fallback-price";
import { MoralisPriceRepository } from "../data/repositories/moralis-price";
import type { PriceRepository, PriceProviderRepository } from "../domain/repositories";

export function configureDI(): void {
  // Initialize Chainlink DI first
  configureChainlinkDI();

  // Configure token-prices logging
  const loggerConfig: LoggerConfig = {
    defaultLevel: "info",
    classLevels: {
      ChainlinkPrice: process.env.NODE_ENV === "development" ? "debug" : "info",
      CoinGeckoPrice: process.env.NODE_ENV === "development" ? "debug" : "warn",
      MoralisPrice: process.env.NODE_ENV === "development" ? "debug" : "warn",
      FallbackPrice: process.env.NODE_ENV === "development" ? "debug" : "info",
      CachedPrice: "silent",
    },
  };

  // Register logger factory for token-prices
  container.register<LoggerFactory>("LoggerFactory", {
    useFactory: () => new DefaultLoggerFactory(loggerConfig),
  });

  // Register individual providers
  container.register<PriceProviderRepository>("ChainlinkPriceRepository", {
    useFactory: () => {
      const chainlinkUseCase = container.resolve(GetChainlinkPriceUseCase);
      const loggerFactory = container.resolve<LoggerFactory>("LoggerFactory");
      return new ChainlinkPriceRepository(chainlinkUseCase, loggerFactory);
    },
  });

  container.register<PriceProviderRepository>("CoinGeckoPriceRepository", {
    useClass: CoinGeckoPriceRepository,
  });

  container.register<PriceProviderRepository>("MoralisPriceRepository", {
    useClass: MoralisPriceRepository,
  });

  // Register the main fallback repository with provider chain
  // Chainlink first, then fallback to external APIs
  container.register<PriceRepository>("PriceRepository", {
    useFactory: () => {
      const providers = [
        container.resolve<PriceProviderRepository>("ChainlinkPriceRepository"),
        container.resolve(CoinGeckoPriceRepository),
        container.resolve(MoralisPriceRepository),
      ];
      const fallbackRepository = new FallbackPriceRepository(providers);
      return new CachedPriceRepository(fallbackRepository);
    },
  });
}

export { container };
