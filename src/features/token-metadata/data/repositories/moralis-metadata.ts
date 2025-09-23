import { injectable } from "tsyringe";
import type { Address } from "viem";
import { toHex } from "viem";

import { ApiClient } from "../../../../infrastructure/api/api-client";
import { METADATA_PROVIDER_CONFIGS, SUPPORTED_CHAIN_IDS } from "../../configs";
import type { MetadataProviderRepository } from "../../domain/repositories";
import type { TokenMetadata } from "../../domain/types";

interface MoralisMetadataResponse {
  address: string;
  name: string;
  symbol: string;
  decimals: string;
  logo?: string;
  thumbnail?: string;
  possible_spam: boolean;
  verified_contract: boolean;
}

@injectable()
export class MoralisMetadataRepository implements MetadataProviderRepository {
  private readonly config = METADATA_PROVIDER_CONFIGS.moralis;
  private readonly apiClient: ApiClient;

  constructor() {
    this.apiClient = new ApiClient({
      baseURL: this.config.baseUrl,
      headers: {
        Accept: "application/json",
        ...(this.config.apiKey && { "X-API-Key": this.config.apiKey }),
      },
      timeout: 15000,
    });
  }

  async getTokenMetadata(tokenAddress: Address, chainId: number): Promise<TokenMetadata> {
    if (!this.config.apiKey) {
      throw new Error("Moralis API key not configured");
    }

    if (!this.isChainSupported(chainId)) {
      throw new Error(`Chain ID ${chainId} not supported by Moralis`);
    }

    const chainHex = toHex(chainId);

    try {
      const data = await this.apiClient.get<MoralisMetadataResponse>(`/erc20/metadata`, {
        params: {
          chain: chainHex,
          addresses: [tokenAddress],
        },
      });

      // Moralis returns an array, get first item
      const tokenData = Array.isArray(data) ? data[0] : data;

      if (!tokenData || !tokenData.name || !tokenData.symbol) {
        throw new Error(`Token metadata not found for ${tokenAddress} on chain ${chainId}`);
      }

      // Skip tokens marked as spam
      if (tokenData.possible_spam) {
        throw new Error(`Token marked as possible spam: ${tokenAddress}`);
      }

      return {
        address: tokenAddress,
        chainId,
        name: tokenData.name,
        symbol: tokenData.symbol.toUpperCase(),
        decimals: parseInt(tokenData.decimals, 10),
        logoUrl: tokenData.logo || tokenData.thumbnail,
        description: undefined, // Moralis doesn't provide description
        website: undefined, // Moralis doesn't provide website
        timestamp: new Date(),
        source: this.config.name,
      };
    } catch (error: any) {
      if (error.status === 429) {
        throw new Error("Moralis rate limit exceeded");
      }
      if (error.status === 401) {
        throw new Error("Moralis API key invalid");
      }
      if (error.status === 404) {
        throw new Error(`Token not found: ${tokenAddress} on chain ${chainId}`);
      }
      throw error;
    }
  }

  async isAvailable(): Promise<boolean> {
    return !!this.config.apiKey;
  }

  getProviderName(): string {
    return this.config.name;
  }

  private isChainSupported(chainId: number): boolean {
    return SUPPORTED_CHAIN_IDS.includes(chainId as any);
  }
}
