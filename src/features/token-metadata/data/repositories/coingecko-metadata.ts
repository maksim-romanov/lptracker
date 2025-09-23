import { injectable } from "tsyringe";
import type { Address } from "viem";

import { ApiClient } from "../../../../infrastructure/api/api-client";
import { METADATA_PROVIDER_CONFIGS, SUPPORTED_CHAIN_IDS } from "../../configs";
import type { MetadataProviderRepository } from "../../domain/repositories";
import type { TokenMetadata } from "../../domain/types";

interface CoinGeckoTokenResponse {
  id: string;
  symbol: string;
  name: string;
  image: {
    thumb: string;
    small: string;
    large: string;
  };
  description: {
    en: string;
  };
  links: {
    homepage: string[];
  };
  detail_platforms: {
    [platform: string]: {
      decimal_place: number;
      contract_address: string;
    };
  };
}

@injectable()
export class CoinGeckoMetadataRepository implements MetadataProviderRepository {
  private readonly config = METADATA_PROVIDER_CONFIGS.coingecko;
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

  async getTokenMetadata(tokenAddress: Address, chainId: number): Promise<TokenMetadata> {
    if (!this.isChainSupported(chainId)) {
      throw new Error(`Chain ID ${chainId} not supported by CoinGecko`);
    }

    const platformId = this.getChainPlatformId(chainId);

    try {
      const data = await this.apiClient.get<CoinGeckoTokenResponse>(
        `/coins/${platformId}/contract/${tokenAddress.toLowerCase()}`,
      );

      if (!data.name || !data.symbol) {
        throw new Error(`Token metadata not found for ${tokenAddress} on chain ${chainId}`);
      }

      // Get decimals from detail_platforms
      const platformData = data.detail_platforms[platformId];
      const decimals = platformData?.decimal_place || 18;

      return {
        address: tokenAddress,
        chainId,
        name: data.name,
        symbol: data.symbol.toUpperCase(),
        decimals,
        logoUrl: data.image?.large || data.image?.small || data.image?.thumb,
        description: data.description?.en ? this.truncateDescription(data.description.en) : undefined,
        website: data.links?.homepage?.[0] || undefined,
        timestamp: new Date(),
        source: this.config.name,
      };
    } catch (error: any) {
      if (error.status === 429) {
        throw new Error("CoinGecko rate limit exceeded");
      }
      if (error.status === 404) {
        throw new Error(`Token not found: ${tokenAddress} on chain ${chainId}`);
      }
      throw error;
    }
  }

  async isAvailable(): Promise<boolean> {
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

  private truncateDescription(description: string): string {
    // Remove HTML tags and truncate to reasonable length
    const cleanText = description.replace(/<[^>]*>/g, "").trim();
    return cleanText.length > 200 ? cleanText.substring(0, 200) + "..." : cleanText;
  }
}
