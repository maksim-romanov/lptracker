import { injectable } from "tsyringe";
import type { Address } from "viem";

import type { MetadataRepository, MetadataProviderRepository } from "../../domain/repositories";
import type { TokenMetadata, MetadataProviderError } from "../../domain/types";

@injectable()
export class FallbackMetadataRepository implements MetadataRepository {
  private readonly errors: MetadataProviderError[] = [];

  constructor(private readonly providers: MetadataProviderRepository[]) {}

  async getTokenMetadata(tokenAddress: Address, chainId: number): Promise<TokenMetadata> {
    this.clearOldErrors();

    if (this.providers.length === 0) {
      throw new Error("No metadata providers configured");
    }

    for (const provider of this.providers) {
      const providerName = provider.getProviderName();

      try {
        const isAvailable = await provider.isAvailable();
        if (!isAvailable) {
          const error = new Error(`Provider ${providerName} is not available`);
          this.recordError(providerName, error);
          continue;
        }

        const metadata = await provider.getTokenMetadata(tokenAddress, chainId);
        return metadata;
      } catch (error) {
        const err = error instanceof Error ? error : new Error("Unknown error");
        this.recordError(providerName, err);
        continue;
      }
    }

    // If all providers failed
    const errorMessages = this.errors
      .filter((e) => this.isRecentError(e))
      .map((e) => `${e.provider}: ${e.error.message}`)
      .join("; ");

    throw new Error(`All metadata providers failed. Errors: ${errorMessages}`);
  }

  private recordError(provider: string, error: Error): void {
    this.errors.push({
      provider,
      error,
      timestamp: new Date(),
    });

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

  private isRecentError(error: MetadataProviderError): boolean {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return error.timestamp > fiveMinutesAgo;
  }

  getRecentErrors(): MetadataProviderError[] {
    return this.errors.filter((e) => this.isRecentError(e));
  }

  getProviderStatus(): { provider: string; available: boolean }[] {
    const status = this.providers.map((provider) => ({
      provider: provider.getProviderName(),
      available: !this.getRecentErrors().some((e) => e.provider === provider.getProviderName()),
    }));

    return status;
  }
}
