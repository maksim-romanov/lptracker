import { container } from "tsyringe";

import { DefaultLoggerFactory, type LoggerConfig } from "../../../infrastructure/logging";
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
  const isDevelopment = process.env.NODE_ENV === "development";
  const devDebugProdInfo = isDevelopment ? "debug" : "info";
  const devDebugProdWarn = isDevelopment ? "debug" : "warn";

  const loggerConfig: LoggerConfig = {
    defaultLevel: "info",
    classLevels: {
      DeFiLlamaPrice: devDebugProdInfo,
      ChainlinkPrice: devDebugProdInfo,
      CoinGeckoPrice: devDebugProdWarn,
      MoralisPrice: devDebugProdWarn,
    },
  };

  const loggerFactory = new DefaultLoggerFactory(loggerConfig);

  // Register all providers under the same "PriceProvider" token for @injectAll
  // Order matters: DeFiLlama, Chainlink
  container.register<PriceProviderRepository>("PriceProvider", {
    useFactory: (c) => {
      c.register("Logger", { useValue: loggerFactory.createLogger("DeFiLlamaPrice") });
      return c.resolve(DeFiLlamaPriceRepository);
    },
  });
  container.register<PriceProviderRepository>("PriceProvider", {
    useFactory: (c) => {
      c.register("Logger", { useValue: loggerFactory.createLogger("ChainlinkPrice") });
      return c.resolve(ChainlinkPriceRepository);
    },
  });
  container.register<PriceProviderRepository>("PriceProvider", {
    useFactory: (c) => {
      c.register("Logger", { useValue: loggerFactory.createLogger("CoinGeckoPrice") });
      return c.resolve(CoinGeckoPriceRepository);
    },
  });
  container.register<PriceProviderRepository>("PriceProvider", {
    useFactory: (c) => {
      c.register("Logger", { useValue: loggerFactory.createLogger("MoralisPrice") });
      return c.resolve(MoralisPriceRepository);
    },
  });

  // Register use case
  container.register<GetTokenPriceUseCase>("GetTokenPriceUseCase", {
    useFactory: (c) => {
      c.register("Logger", { useValue: loggerFactory.createLogger("GetTokenPriceUseCase") });
      return c.resolve(GetTokenPriceUseCase);
    },
  });
}

export { container };
