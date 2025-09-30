import { container } from "tsyringe";

import { DefaultLoggerFactory, type LoggerConfig } from "../../../infrastructure/logging";
import { configureChainlinkDI } from "../../chainlink-feeds/config/di-container";
import { GetTokenPriceUseCase } from "../application/use-cases/get-token-price";
import { CircuitBreakerRepository } from "../data/decorators/circuit-breaker-repository";
import { ChainlinkPriceRepository } from "../data/repositories/chainlink-price";
import { CoinGeckoPriceRepository } from "../data/repositories/coingecko-price";
import { DeFiLlamaPriceRepository } from "../data/repositories/defillama-price";
import { MoralisPriceRepository } from "../data/repositories/moralis-price";
import type { PriceProviderRepository } from "../domain/repositories";
import { circuitBreakerConfigs } from "./circuit-breaker.config";

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
      // Circuit Breaker logging
      "CircuitBreaker-DeFiLlama": devDebugProdInfo,
      "CircuitBreaker-Chainlink": devDebugProdInfo,
      "CircuitBreaker-CoinGecko": devDebugProdWarn,
      "CircuitBreaker-Moralis": devDebugProdWarn,
    },
  };

  const loggerFactory = new DefaultLoggerFactory(loggerConfig);

  // Register all providers under the same "PriceProvider" token for @injectAll
  // Order matters: DeFiLlama, Chainlink, CoinGecko, Moralis
  // Each provider is wrapped with CircuitBreaker decorator
  container.register<PriceProviderRepository>("PriceProvider", {
    useFactory: (c) => {
      // Create base repository
      const repoLogger = loggerFactory.createLogger("DeFiLlamaPrice");
      c.register("Logger", { useValue: repoLogger });
      const baseRepo = c.resolve(DeFiLlamaPriceRepository);

      // Wrap with CircuitBreaker
      const cbLogger = loggerFactory.createLogger("CircuitBreaker-DeFiLlama");
      c.register("InnerRepository", { useValue: baseRepo });
      c.register("CircuitBreakerConfig", { useValue: circuitBreakerConfigs.DeFiLlama });
      c.register("Logger", { useValue: cbLogger });

      return c.resolve(CircuitBreakerRepository);
    },
  });
  container.register<PriceProviderRepository>("PriceProvider", {
    useFactory: (c) => {
      // Create base repository
      const repoLogger = loggerFactory.createLogger("ChainlinkPrice");
      c.register("Logger", { useValue: repoLogger });
      const baseRepo = c.resolve(ChainlinkPriceRepository);

      // Wrap with CircuitBreaker
      const cbLogger = loggerFactory.createLogger("CircuitBreaker-Chainlink");
      c.register("InnerRepository", { useValue: baseRepo });
      c.register("CircuitBreakerConfig", { useValue: circuitBreakerConfigs.Chainlink });
      c.register("Logger", { useValue: cbLogger });

      return c.resolve(CircuitBreakerRepository);
    },
  });
  container.register<PriceProviderRepository>("PriceProvider", {
    useFactory: (c) => {
      // Create base repository
      const repoLogger = loggerFactory.createLogger("CoinGeckoPrice");
      c.register("Logger", { useValue: repoLogger });
      const baseRepo = c.resolve(CoinGeckoPriceRepository);

      // Wrap with CircuitBreaker
      const cbLogger = loggerFactory.createLogger("CircuitBreaker-CoinGecko");
      c.register("InnerRepository", { useValue: baseRepo });
      c.register("CircuitBreakerConfig", { useValue: circuitBreakerConfigs.CoinGecko });
      c.register("Logger", { useValue: cbLogger });

      return c.resolve(CircuitBreakerRepository);
    },
  });
  container.register<PriceProviderRepository>("PriceProvider", {
    useFactory: (c) => {
      // Create base repository
      const repoLogger = loggerFactory.createLogger("MoralisPrice");
      c.register("Logger", { useValue: repoLogger });
      const baseRepo = c.resolve(MoralisPriceRepository);

      // Wrap with CircuitBreaker
      const cbLogger = loggerFactory.createLogger("CircuitBreaker-Moralis");
      c.register("InnerRepository", { useValue: baseRepo });
      c.register("CircuitBreakerConfig", { useValue: circuitBreakerConfigs.Moralis });
      c.register("Logger", { useValue: cbLogger });

      return c.resolve(CircuitBreakerRepository);
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
