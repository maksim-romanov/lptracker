import { injectable, inject } from "tsyringe";
import type { Address } from "viem";

import { BaseUseCase } from "../../../../domain/use-cases/base-use-case";
import { GetTokenPriceDto } from "../../domain/dto/get-token-price.dto";
import type { PriceRepository } from "../../domain/repositories";
import type { TokenPrice } from "../../domain/types";

@injectable()
export class GetTokenPriceUseCase extends BaseUseCase {
  constructor(@inject("PriceRepository") private priceRepository: PriceRepository) {
    super();
  }

  async execute(tokenAddress: Address, chainId: number): Promise<TokenPrice> {
    return super.execute(async () => {
      await this.validateDto(GetTokenPriceDto, { tokenAddress, chainId });

      return this.priceRepository.getTokenPrice(tokenAddress, chainId);
    });
  }
}