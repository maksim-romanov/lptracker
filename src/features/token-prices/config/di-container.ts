import { container } from "tsyringe";

import { GetTokenPriceUseCase } from "../application/use-cases/get-token-price";
import { CircuitBreakerRepository } from "../data/decorators/circuit-breaker-repository";
import { LoggerRepository } from "../data/decorators/logger-repository";
import { RateLimiterRepository } from "../data/decorators/rate-limiter-repository";
import { ChainlinkPriceRepository } from "../data/repositories/chainlink-price";
import { CoinGeckoPriceRepository } from "../data/repositories/coingecko-price";
import { DeFiLlamaPriceRepository } from "../data/repositories/defillama-price";
import { MoralisPriceRepository } from "../data/repositories/moralis-price";
import type { PriceProviderRepository } from "../domain/repositories";
import { circuitBreakerConfigs } from "./circuit-breaker.config";
import { rateLimiterConfigs } from "./rate-limiter.config";

export function configureTokenPricesDI(): void {
  // Register all providers under the same "PriceProvider" token for @injectAll
  // Order matters: DeFiLlama, Chainlink, CoinGecko, Moralis
  // Each provider is wrapped with Logger → RateLimiter → CircuitBreaker decorators
  container.register<PriceProviderRepository>("PriceProvider", {
    useFactory: (c) => {
      // Decorator chain: Repository → Logger → RateLimiter → CircuitBreaker
      const baseRepo = c.resolve(DeFiLlamaPriceRepository);

      c.register("InnerRepository", { useValue: baseRepo });
      const loggedRepo = c.resolve(LoggerRepository);

      c.register("InnerRepository", { useValue: loggedRepo });

      c.register("RateLimiterConfig", { useValue: rateLimiterConfigs.DeFiLlama });
      c.register("InnerRepository", { useValue: c.resolve(RateLimiterRepository) });

      c.register("CircuitBreakerConfig", { useValue: circuitBreakerConfigs.DeFiLlama });
      return c.resolve(CircuitBreakerRepository);
    },
  });

  container.register<PriceProviderRepository>("PriceProvider", {
    useFactory: (c) => {
      const baseRepo = c.resolve(ChainlinkPriceRepository);

      c.register("InnerRepository", { useValue: baseRepo });
      const loggedRepo = c.resolve(LoggerRepository);

      c.register("InnerRepository", { useValue: loggedRepo });

      c.register("RateLimiterConfig", { useValue: rateLimiterConfigs.Chainlink });
      c.register("InnerRepository", { useValue: c.resolve(RateLimiterRepository) });

      c.register("CircuitBreakerConfig", { useValue: circuitBreakerConfigs.Chainlink });
      return c.resolve(CircuitBreakerRepository);
    },
  });

  container.register<PriceProviderRepository>("PriceProvider", {
    useFactory: (c) => {
      const baseRepo = c.resolve(CoinGeckoPriceRepository);

      c.register("InnerRepository", { useValue: baseRepo });
      const loggedRepo = c.resolve(LoggerRepository);

      c.register("InnerRepository", { useValue: loggedRepo });

      c.register("RateLimiterConfig", { useValue: rateLimiterConfigs.CoinGecko });
      c.register("InnerRepository", { useValue: c.resolve(RateLimiterRepository) });

      c.register("CircuitBreakerConfig", { useValue: circuitBreakerConfigs.CoinGecko });
      return c.resolve(CircuitBreakerRepository);
    },
  });

  container.register<PriceProviderRepository>("PriceProvider", {
    useFactory: (c) => {
      const baseRepo = c.resolve(MoralisPriceRepository);

      c.register("InnerRepository", { useValue: baseRepo });
      const loggedRepo = c.resolve(LoggerRepository);

      c.register("InnerRepository", { useValue: loggedRepo });

      c.register("RateLimiterConfig", { useValue: rateLimiterConfigs.Moralis });
      c.register("InnerRepository", { useValue: c.resolve(RateLimiterRepository) });

      c.register("CircuitBreakerConfig", { useValue: circuitBreakerConfigs.Moralis });
      return c.resolve(CircuitBreakerRepository);
    },
  });

  container.register<GetTokenPriceUseCase>("GetTokenPriceUseCase", { useClass: GetTokenPriceUseCase });
}

export { container };
