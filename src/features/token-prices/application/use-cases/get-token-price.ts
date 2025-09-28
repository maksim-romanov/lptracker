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
  private readonly recentErrors: Map<string, { error: Error; timestamp: Date }> = new Map();

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

    this.cleanupOldErrors();

    const errors: string[] = [];

    // Try providers in order (DeFiLlama first for speed, then Chainlink for security)
    for (const provider of this.providers) {
      try {
        // Check if provider is available before making the request
        const isAvailable = await provider.isAvailable();
        if (!isAvailable) {
          const errorMsg = `Provider ${provider.getProviderName()} is not available`;
          errors.push(errorMsg);
          this.recordError(provider.getProviderName(), new Error(errorMsg));
          continue;
        }

        // Attempt to get price from provider
        const price = await provider.getTokenPrice(tokenAddress, chainId);
        return price;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        errors.push(`${provider.getProviderName()}: ${errorMessage}`);
        this.recordError(provider.getProviderName(), error instanceof Error ? error : new Error(errorMessage));
      }
    }

    throw new Error(`All price providers failed. Errors: ${errors.join("; ")}`);
  }

  private recordError(provider: string, error: Error): void {
    this.recentErrors.set(provider, {
      error,
      timestamp: new Date(),
    });
  }

  private cleanupOldErrors(): void {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    for (const [provider, error] of this.recentErrors.entries()) {
      if (error.timestamp <= fiveMinutesAgo) {
        this.recentErrors.delete(provider);
      }
    }
  }

  getRecentErrors(): { provider: string; error: Error; timestamp: Date }[] {
    return Array.from(this.recentErrors.entries()).map(([provider, data]) => ({
      provider,
      ...data,
    }));
  }

  getProviderStatus(): { provider: string; available: boolean }[] {
    this.cleanupOldErrors();
    return this.providers.map((provider) => ({
      provider: provider.getProviderName(),
      available: !this.recentErrors.has(provider.getProviderName()),
    }));
  }
}
