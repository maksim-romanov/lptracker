import { container } from "tsyringe";

import { DefaultLoggerFactory, type LoggerConfig, type LoggerFactory } from "../../../infrastructure/logging";
import { configureChainlinkDI } from "../../chainlink-feeds/config/di-container";
import { GetTokenPriceUseCase } from "../application/use-cases/get-token-price";
import { ChainlinkPriceRepository } from "../data/repositories/chainlink-price";
import { CoinGeckoPriceRepository } from "../data/repositories/coingecko-price";
import { DeFiLlamaPriceRepository } from "../data/repositories/defillama-price";
import { MoralisPriceRepository } from "../data/repositories/moralis-price";
import type { PriceProviderRepository } from "../domain/repositories";

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
      CachedPrice: "silent",
    },
  };

  // Register logger factory for token-prices
  container.register<LoggerFactory>("LoggerFactory", { useFactory: () => new DefaultLoggerFactory(loggerConfig) });

  // Register all providers under the same "PriceProvider" token for @injectAll
  // Order matters: DeFiLlama, Chainlink
  container.register<PriceProviderRepository>("PriceProvider", { useClass: DeFiLlamaPriceRepository });
  container.register<PriceProviderRepository>("PriceProvider", { useClass: ChainlinkPriceRepository });
  container.register<PriceProviderRepository>("PriceProvider", { useClass: CoinGeckoPriceRepository });
  container.register<PriceProviderRepository>("PriceProvider", { useClass: MoralisPriceRepository });

  // Register use case
  container.register<GetTokenPriceUseCase>("GetTokenPriceUseCase", { useClass: GetTokenPriceUseCase });
}

export { container };
