import { injectable, inject } from "tsyringe";
import type { Address } from "viem";

import { LogErrors, ValidateParams } from "../../../../domain/decorators";
import { BaseUseCase } from "../../../../domain/use-cases/base-use-case";
import { GetTokenPriceDto } from "../../domain/dto/get-token-price.dto";
import type { PriceRepository } from "../../domain/repositories";
import type { TokenPrice } from "../../domain/types";

interface GetTokenPriceParams {
  tokenAddress: Address;
  chainId: number;
}

@injectable()
export class GetTokenPriceUseCase extends BaseUseCase<GetTokenPriceParams, TokenPrice> {
  constructor(@inject("PriceRepository") private priceRepository: PriceRepository) {
    super();
  }

  @LogErrors()
  @ValidateParams(GetTokenPriceDto)
  async execute(params: GetTokenPriceParams): Promise<TokenPrice> {
    return this.priceRepository.getTokenPrice(params.tokenAddress, params.chainId);
  }
}
