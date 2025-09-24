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
    const startTime = Date.now();
    console.log(`[Moralis] Fetching metadata for ${tokenAddress} on chain ${chainId}`);

    if (!this.config.apiKey) {
      console.error(`[Moralis] API key not configured`);
      throw new Error("Moralis API key not configured");
    }

    if (!this.isChainSupported(chainId)) {
      console.error(`[Moralis] Chain ${chainId} not supported`);
      throw new Error(`Chain ID ${chainId} not supported by Moralis`);
    }

    const chainHex = toHex(chainId);

    try {
      console.log(`[Moralis] API request: /erc20/metadata with chain=${chainHex}, address=${tokenAddress}`);

      const data = await this.apiClient.get<MoralisMetadataResponse>(`/erc20/metadata`, {
        params: {
          chain: chainHex,
          addresses: [tokenAddress],
        },
      });

      const requestTime = Date.now() - startTime;

      // Moralis returns an array, get first item
      const tokenData = Array.isArray(data) ? data[0] : data;

      if (!tokenData || !tokenData.name || !tokenData.symbol) {
        console.warn(`[Moralis] No metadata found for ${tokenAddress} (${requestTime}ms)`);
        throw new Error(`Token metadata not found for ${tokenAddress} on chain ${chainId}`);
      }

      // Skip tokens marked as spam
      if (tokenData.possible_spam) {
        console.warn(`[Moralis] Token ${tokenAddress} marked as spam (${requestTime}ms)`);
        throw new Error(`Token marked as possible spam: ${tokenAddress}`);
      }

      const metadata = {
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

      console.log(
        `[Moralis] SUCCESS: ${metadata.symbol} (${metadata.name}) logoUrl=${metadata.logoUrl ? "available" : "none"} (${requestTime}ms)`,
      );
      return metadata;
    } catch (error: any) {
      const requestTime = Date.now() - startTime;

      if (error.status === 429) {
        console.error(`[Moralis] Rate limit exceeded (${requestTime}ms)`);
        throw new Error("Moralis rate limit exceeded");
      }
      if (error.status === 401) {
        console.error(`[Moralis] API key invalid (${requestTime}ms)`);
        throw new Error("Moralis API key invalid");
      }
      if (error.status === 404) {
        console.warn(`[Moralis] Token not found: ${tokenAddress} (${requestTime}ms)`);
        throw new Error(`Token not found: ${tokenAddress} on chain ${chainId}`);
      }

      console.error(
        `[Moralis] API error (status ${error.status}) for ${tokenAddress} (${requestTime}ms):`,
        error.message,
      );
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
