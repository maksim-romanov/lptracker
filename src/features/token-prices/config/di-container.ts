import { container } from "tsyringe";

import { configureChainlinkDI } from "../../chainlink-feeds/config/di-container";
import { GetTokenPriceUseCase } from "../application/use-cases/get-token-price";
import { CircuitBreakerRepository } from "../data/decorators/circuit-breaker-repository";
import { ChainlinkPriceRepository } from "../data/repositories/chainlink-price";
import { CoinGeckoPriceRepository } from "../data/repositories/coingecko-price";
import { DeFiLlamaPriceRepository } from "../data/repositories/defillama-price";
import { MoralisPriceRepository } from "../data/repositories/moralis-price";
import type { PriceProviderRepository } from "../domain/repositories";
import { circuitBreakerConfigs } from "./circuit-breaker.config";
import { LoggerRepository } from "../data/decorators/logger-repository";

export function configureTokenPricesDI(): void {
  // Initialize Chainlink DI first
  configureChainlinkDI();

  // Register all providers under the same "PriceProvider" token for @injectAll
  // Order matters: DeFiLlama, Chainlink, CoinGecko, Moralis
  // Each provider is wrapped with CircuitBreaker decorator
  container.register<PriceProviderRepository>("PriceProvider", {
    useFactory: (c) => {
      c.register("InnerRepository", { useValue: c.resolve(DeFiLlamaPriceRepository) });
      c.register("InnerRepository", { useValue: c.resolve(LoggerRepository) });
      c.register("CircuitBreakerConfig", { useValue: circuitBreakerConfigs.DeFiLlama });
      return c.resolve(CircuitBreakerRepository);
    },
  });

  container.register<PriceProviderRepository>("PriceProvider", {
    useFactory: (c) => {
      c.register("InnerRepository", { useValue: c.resolve(ChainlinkPriceRepository) });
      c.register("InnerRepository", { useValue: c.resolve(LoggerRepository) });
      c.register("CircuitBreakerConfig", { useValue: circuitBreakerConfigs.Chainlink });
      return c.resolve(CircuitBreakerRepository);
    },
  });

  container.register<PriceProviderRepository>("PriceProvider", {
    useFactory: (c) => {
      c.register("InnerRepository", { useValue: c.resolve(CoinGeckoPriceRepository) });
      c.register("InnerRepository", { useValue: c.resolve(LoggerRepository) });
      c.register("CircuitBreakerConfig", { useValue: circuitBreakerConfigs.CoinGecko });
      return c.resolve(CircuitBreakerRepository);
    },
  });

  container.register<PriceProviderRepository>("PriceProvider", {
    useFactory: (c) => {
      c.register("InnerRepository", { useValue: c.resolve(MoralisPriceRepository) });
      c.register("InnerRepository", { useValue: c.resolve(LoggerRepository) });
      c.register("CircuitBreakerConfig", { useValue: circuitBreakerConfigs.Moralis });
      return c.resolve(CircuitBreakerRepository);
    },
  });

  // Register use case
  container.register<GetTokenPriceUseCase>("GetTokenPriceUseCase", {
    useClass: GetTokenPriceUseCase,
  });
}

export { container };
