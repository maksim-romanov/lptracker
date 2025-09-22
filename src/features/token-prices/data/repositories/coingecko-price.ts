import { injectable } from "tsyringe";
import type { Address } from "viem";

import { ApiClient } from "../../../../infrastructure/api/api-client";
import { SUPPORTED_CHAIN_IDS, PRICE_PROVIDER_CONFIGS } from "../../configs";
import type { PriceProviderRepository } from "../../domain/repositories";
import type { TokenPrice } from "../../domain/types";

interface CoinGeckoResponse {
  [key: string]: {
    usd: number;
    usd_24h_change?: number;
  };
}

@injectable()
export class CoinGeckoPriceRepository implements PriceProviderRepository {
  private readonly config = PRICE_PROVIDER_CONFIGS.coingecko;
  private readonly apiClient: ApiClient;

  constructor() {
    this.apiClient = new ApiClient({
      baseURL: this.config.baseUrl,
      headers: {
        Accept: "application/json",
      },
      timeout: 10000,
    });
  }

  async getTokenPrice(tokenAddress: Address, chainId: number): Promise<TokenPrice> {
    if (!this.isChainSupported(chainId)) {
      throw new Error(`Chain ID ${chainId} not supported by CoinGecko`);
    }

    const platformId = this.getChainPlatformId(chainId);

    try {
      const data = await this.apiClient.get<CoinGeckoResponse>(`/simple/token_price/${platformId}`, {
        params: {
          contract_addresses: tokenAddress,
          vs_currencies: "usd",
          include_24hr_change: true,
        },
      });

      const tokenData = data[tokenAddress.toLowerCase()];

      if (!tokenData || typeof tokenData.usd !== "number") {
        throw new Error(`Price not found for token ${tokenAddress} on chain ${chainId}`);
      }

      return {
        tokenAddress,
        chainId,
        price: tokenData.usd,
        priceChange24h: tokenData.usd_24h_change,
        timestamp: new Date(),
        source: this.config.name,
      };
    } catch (error: any) {
      if (error.status === 429) {
        throw new Error("CoinGecko rate limit exceeded");
      }
      throw error;
    }
  }

  async isAvailable(): Promise<boolean> {
    // CoinGecko free API is generally available, let the main method handle errors
    return true;
  }

  getProviderName(): string {
    return this.config.name;
  }

  private isChainSupported(chainId: number): boolean {
    return SUPPORTED_CHAIN_IDS.includes(chainId as any);
  }

  private getChainPlatformId(chainId: number): string {
    const mapping: Record<number, string> = {
      1: "ethereum",
      42161: "arbitrum-one",
      137: "polygon-pos",
      10: "optimistic-ethereum",
      8453: "base",
    };
    return mapping[chainId];
  }
}
