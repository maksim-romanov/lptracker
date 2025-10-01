import { inject, injectable } from "tsyringe";
import type { Address } from "viem";
import { toHex } from "viem";

import { ApiClient } from "infrastructure/api/api-client";
import type { PriceProviderRepository } from "../../domain/repositories";
import { SUPPORTED_CHAIN_IDS, type TokenPrice } from "../../domain/types";

interface MoralisResponse {
  usdPrice: number;
  usdPriceFormatted: string;
  "24hrPercentChange": string;
  exchangeAddress: string;
  exchangeName: string;
}

@injectable()
export class MoralisPriceRepository implements PriceProviderRepository {
  readonly name = "Moralis";
  // Rate limits: 100 req/min, 40,000 req/month (Free tier)
  private readonly BASE_URL = "https://deep-index.moralis.io/api/v2.2";
  private readonly apiKey = process.env.EXPO_PUBLIC_MORALIS_API_KEY;
  private readonly apiClient: ApiClient;

  constructor() {
    this.apiClient = new ApiClient({
      baseURL: this.BASE_URL,
      headers: {
        Accept: "application/json",
        ...(this.apiKey && { "X-API-Key": this.apiKey }),
      },
      timeout: 15000,
    });
  }

  async getTokenPrice(tokenAddress: Address, chainId: number): Promise<TokenPrice> {
    if (!this.apiKey) {
      throw new Error("Moralis API key not configured");
    }

    if (!this.isChainSupported(chainId)) {
      throw new Error(`Chain ID ${chainId} not supported by Moralis`);
    }

    const chainHex = toHex(chainId);

    try {
      const data = await this.apiClient.get<MoralisResponse>(`/erc20/${tokenAddress}/price`, {
        params: {
          chain: chainHex,
        },
      });

      if (!data.usdPrice || typeof data.usdPrice !== "number") {
        throw new Error(`Price not found for token ${tokenAddress} on chain ${chainId}`);
      }

      const priceChange24h = data["24hrPercentChange"] ? parseFloat(data["24hrPercentChange"]) : undefined;

      return {
        tokenAddress,
        chainId,
        price: data.usdPrice,
        priceChange24h,
        timestamp: new Date(),
        source: "Moralis",
      };
    } catch (error: any) {
      if (error.status === 429) {
        throw new Error("Moralis rate limit exceeded");
      }
      if (error.status === 401) {
        throw new Error("Moralis API key invalid");
      }
      throw error;
    }
  }

  private isChainSupported(chainId: number): boolean {
    return SUPPORTED_CHAIN_IDS.includes(chainId as any);
  }
}
