import { inject, injectable } from "tsyringe";
import type { Address } from "viem";

import type { Logger } from "infrastructure/logging";
import { GetChainlinkPriceUseCase } from "features/chainlink-feeds/application/use-cases/get-chainlink-price";
import type { PriceProviderRepository } from "../../domain/repositories";
import type { TokenPrice } from "../../domain/types";

@injectable()
export class ChainlinkPriceRepository implements PriceProviderRepository {
  readonly name = "Chainlink";

  constructor(
    @inject(GetChainlinkPriceUseCase) private readonly chainlinkUseCase: GetChainlinkPriceUseCase,
    @inject("Logger") private readonly logger: Logger,
  ) {}

  async getTokenPrice(tokenAddress: Address, chainId: number): Promise<TokenPrice> {
    try {
      this.logger.debug(`Getting price for token ${tokenAddress} on chain ${chainId} from Chainlink`);

      const chainlinkPrice = await this.chainlinkUseCase.execute({
        tokenAddress,
        chainId,
      });

      // Convert ChainlinkPrice to TokenPrice format
      const tokenPrice: TokenPrice = {
        tokenAddress: chainlinkPrice.tokenAddress,
        chainId: chainlinkPrice.chainId,
        price: chainlinkPrice.price,
        priceChange24h: undefined, // Chainlink doesn't provide 24h change
        timestamp: chainlinkPrice.updatedAt,
        source: "Chainlink",
      };

      this.logger.info(`Successfully got price from Chainlink: $${tokenPrice.price}`);
      return tokenPrice;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      this.logger.warn(`Chainlink price fetch failed: ${errorMessage}`);
      throw error;
    }
  }
}
