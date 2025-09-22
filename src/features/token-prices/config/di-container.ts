import { container } from "tsyringe";

import type { PriceRepository, PriceProviderRepository } from "../domain/repositories";
import { CoinGeckoPriceRepository } from "../data/repositories/coingecko-price";
import { FallbackPriceRepository } from "../data/repositories/fallback-price";
import { MoralisPriceRepository } from "../data/repositories/moralis-price";

export function configureDI(): void {
  // Register individual providers
  container.register<PriceProviderRepository>("CoinGeckoPriceRepository", {
    useClass: CoinGeckoPriceRepository,
  });

  container.register<PriceProviderRepository>("MoralisPriceRepository", {
    useClass: MoralisPriceRepository,
  });

  // Register the main fallback repository with provider chain
  container.register<PriceRepository>("PriceRepository", {
    useFactory: () => {
      const providers = [
        container.resolve(CoinGeckoPriceRepository),
        container.resolve(MoralisPriceRepository),
      ];
      return new FallbackPriceRepository(providers);
    },
  });
}

export { container };