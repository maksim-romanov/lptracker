import { inject, injectable } from "tsyringe";
import type { Address } from "viem";

import type { Logger, LoggerFactory } from "../../../../infrastructure/logging";
import { GetChainlinkPriceUseCase } from "../../../chainlink-feeds/application/use-cases/get-chainlink-price";
import type { PriceProviderRepository } from "../../domain/repositories";
import type { TokenPrice } from "../../domain/types";

@injectable()
export class ChainlinkPriceRepository implements PriceProviderRepository {
  private readonly logger: Logger;

  constructor(
    private readonly chainlinkUseCase: GetChainlinkPriceUseCase,
    @inject("LoggerFactory") loggerFactory: LoggerFactory,
  ) {
    this.logger = loggerFactory.createLogger("ChainlinkPrice");
  }

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

  async isAvailable(): Promise<boolean> {
    try {
      return await this.chainlinkUseCase.isChainlinkAvailable();
    } catch (error) {
      this.logger.warn("Chainlink availability check failed:", error);
      return false;
    }
  }

  getProviderName(): string {
    return "Chainlink";
  }
}