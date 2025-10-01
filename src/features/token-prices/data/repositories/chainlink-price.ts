import { inject, injectable } from "tsyringe";
import type { Address } from "viem";

import { GetChainlinkPriceUseCase } from "features/chainlink-feeds/application/use-cases/get-chainlink-price";
import type { PriceProviderRepository } from "../../domain/repositories";
import type { TokenPrice } from "../../domain/types";

@injectable()
export class ChainlinkPriceRepository implements PriceProviderRepository {
  readonly name = "Chainlink";

  constructor(@inject(GetChainlinkPriceUseCase) private readonly chainlinkUseCase: GetChainlinkPriceUseCase) {}

  async getTokenPrice(tokenAddress: Address, chainId: number): Promise<TokenPrice> {
    try {
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

      return tokenPrice;
    } catch (error) {
      throw error;
    }
  }
}
