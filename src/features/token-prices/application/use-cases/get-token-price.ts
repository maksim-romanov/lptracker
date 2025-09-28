import { injectable, injectAll } from "tsyringe";
import type { Address } from "viem";

import { LogErrors, ValidateParams } from "../../../../domain/decorators";
import { BaseUseCase } from "../../../../domain/use-cases/base-use-case";
import { GetTokenPriceDto } from "../../domain/dto/get-token-price.dto";
import type { PriceProviderRepository } from "../../domain/repositories";
import type { TokenPrice } from "../../domain/types";

interface GetTokenPriceParams {
  tokenAddress: Address;
  chainId: number;
}

@injectable()
export class GetTokenPriceUseCase implements BaseUseCase<GetTokenPriceParams, TokenPrice> {
  constructor(
    @injectAll("PriceProvider")
    private readonly providers: PriceProviderRepository[]
  ) {}

  @LogErrors()
  @ValidateParams(GetTokenPriceDto)
  async execute(params: GetTokenPriceParams): Promise<TokenPrice> {
    const { tokenAddress, chainId } = params;

    if (this.providers.length === 0) {
      throw new Error("No price providers configured");
    }

    const errors: string[] = [];

    // Try providers in order (DeFiLlama first for speed, then Chainlink for security)
    for (const provider of this.providers) {
      try {
        // Check if provider is available before making the request
        const isAvailable = await provider.isAvailable();
        if (!isAvailable) {
          const errorMsg = `Provider ${provider.getProviderName()} is not available`;
          errors.push(errorMsg);
          continue;
        }

        // Attempt to get price from provider
        const price = await provider.getTokenPrice(tokenAddress, chainId);
        return price;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        errors.push(`${provider.getProviderName()}: ${errorMessage}`);
      }
    }

    throw new Error(`All price providers failed. Errors: ${errors.join("; ")}`);
  }

}
