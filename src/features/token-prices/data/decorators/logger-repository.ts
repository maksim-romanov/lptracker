import { inject, injectable } from "tsyringe";
import type { Address } from "viem";

import { ILogger } from "domain/logger";

import type { PriceProviderRepository } from "../../domain/repositories";
import type { TokenPrice } from "../../domain/types";

@injectable()
export class LoggerRepository implements PriceProviderRepository {
  private readonly logger: ILogger;

  constructor(
    @inject("InnerRepository") private readonly innerRepository: PriceProviderRepository,
    @inject("Logger") private readonly baseLogger: ILogger,
  ) {
    this.logger = this.baseLogger.extend(`PriceProvider(${this.name})`);
  }

  get name(): string {
    return this.innerRepository.name;
  }

  async getTokenPrice(tokenAddress: Address, chainId: number): Promise<TokenPrice> {
    try {
    this.logger.debug(`Fetching price for token ${tokenAddress} on chain ${chainId}`);
    const price = await this.innerRepository.getTokenPrice(tokenAddress, chainId);
    this.logger.debug(`Fetched price for token ${tokenAddress} on chain ${chainId}: ${price.price}`);
    return price;
    } catch (error) {
      this.logger.error(`Error fetching price for token ${tokenAddress} on chain ${chainId}:`, error);
      throw error;
    }
  }
}
