import { inject, injectAll, injectable } from "tsyringe";
import type { Address } from "viem";

import type { PriceRepository, PriceProviderRepository } from "../../domain/repositories";
import type { TokenPrice, PriceProviderError } from "../../domain/types";

@injectable()
export class FallbackPriceRepository implements PriceRepository {
  private readonly errors: PriceProviderError[] = [];

  constructor(
    @injectAll("PriceProvider")
    private readonly providers: PriceProviderRepository[]
  ) {
    // Providers are automatically ordered by DI registration order
    // No additional sorting needed - order is determined by DI configuration
  }

  async getTokenPrice(tokenAddress: Address, chainId: number): Promise<TokenPrice> {
    this.clearOldErrors();

    if (this.providers.length === 0) {
      throw new Error("No price providers configured");
    }

    for (const provider of this.providers) {
      try {
        // Check if provider is available before making the request
        const isAvailable = await provider.isAvailable();
        if (!isAvailable) {
          const error = new Error(`Provider ${provider.getProviderName()} is not available`);
          this.recordError(provider.getProviderName(), error);
          continue;
        }

        // Attempt to get price from provider
        const price = await provider.getTokenPrice(tokenAddress, chainId);
        return price;
      } catch (error) {
        const err = error instanceof Error ? error : new Error("Unknown error");
        this.recordError(provider.getProviderName(), err);

        // For other errors, still try the next provider
        continue;
      }
    }

    // If we get here, all providers failed
    const errorMessages = this.errors
      .filter((e) => this.isRecentError(e))
      .map((e) => `${e.provider}: ${e.error.message}`)
      .join("; ");

    throw new Error(`All price providers failed. Errors: ${errorMessages}`);
  }

  private recordError(provider: string, error: Error): void {
    this.errors.push({
      provider,
      error,
      timestamp: new Date(),
    });

    // Keep only the last 50 errors to prevent memory issues
    if (this.errors.length > 50) {
      this.errors.splice(0, this.errors.length - 50);
    }
  }

  private clearOldErrors(): void {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentErrors = this.errors.filter((e) => e.timestamp > oneHourAgo);
    this.errors.length = 0;
    this.errors.push(...recentErrors);
  }

  private isRecentError(error: PriceProviderError): boolean {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return error.timestamp > fiveMinutesAgo;
  }

  getRecentErrors(): PriceProviderError[] {
    return this.errors.filter((e) => this.isRecentError(e));
  }

  getProviderStatus(): { provider: string; available: boolean }[] {
    return this.providers.map((provider) => ({
      provider: provider.getProviderName(),
      available: !this.getRecentErrors().some((e) => e.provider === provider.getProviderName()),
    }));
  }
}
