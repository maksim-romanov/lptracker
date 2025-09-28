import { container } from "tsyringe";

import { DefaultLoggerFactory, type LoggerConfig, type LoggerFactory } from "../../../infrastructure/logging";
import { GetChainlinkPriceUseCase } from "../../chainlink-feeds/application/use-cases/get-chainlink-price";
import { configureChainlinkDI } from "../../chainlink-feeds/config/di-container";
import { GetTokenPriceUseCase } from "../application/use-cases/get-token-price";
import { CachedPriceRepository } from "../data/repositories/cached-price";
import { ChainlinkPriceRepository } from "../data/repositories/chainlink-price";
import { CoinGeckoPriceRepository } from "../data/repositories/coingecko-price";
import { DeFiLlamaPriceRepository } from "../data/repositories/defillama-price";
import { FallbackPriceRepository } from "../data/repositories/fallback-price";
import { MoralisPriceRepository } from "../data/repositories/moralis-price";
import type { PriceRepository, PriceProviderRepository } from "../domain/repositories";

export function configureTokenPricesDI(): void {
  // Initialize Chainlink DI first
  configureChainlinkDI();

  // Configure token-prices logging
  const loggerConfig: LoggerConfig = {
    defaultLevel: "info",
    classLevels: {
      DeFiLlamaPrice: process.env.NODE_ENV === "development" ? "debug" : "info",
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

  // Register all providers under the same "PriceProvider" token for @injectAll
  // Order matters: DeFiLlama first for speed, then Chainlink for security
  container.register<PriceProviderRepository>("PriceProvider", {
    useClass: DeFiLlamaPriceRepository,
  });

  container.register<PriceProviderRepository>("PriceProvider", {
    useFactory: () => {
      const chainlinkUseCase = container.resolve(GetChainlinkPriceUseCase);
      const loggerFactory = container.resolve<LoggerFactory>("LoggerFactory");
      return new ChainlinkPriceRepository(chainlinkUseCase, loggerFactory);
    },
  });

  container.register<PriceProviderRepository>("PriceProvider", {
    useClass: CoinGeckoPriceRepository,
  });

  container.register<PriceProviderRepository>("PriceProvider", {
    useClass: MoralisPriceRepository,
  });

  // Register the main fallback repository with automatic provider injection
  container.register<PriceRepository>("PriceRepository", {
    useFactory: () => {
      const fallbackRepository = container.resolve(FallbackPriceRepository);
      return new CachedPriceRepository(fallbackRepository);
    },
  });

  // Register use case
  container.register<GetTokenPriceUseCase>("GetTokenPriceUseCase", {
    useFactory: () => {
      const priceRepository = container.resolve<PriceRepository>("PriceRepository");
      return new GetTokenPriceUseCase(priceRepository);
    },
  });
}

export { container };
