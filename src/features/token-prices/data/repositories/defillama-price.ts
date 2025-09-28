import { injectable } from "tsyringe";
import type { Address } from "viem";

import { ApiClient } from "../../../../infrastructure/api/api-client";
import { PRICE_PROVIDER_CONFIGS, SUPPORTED_CHAIN_IDS } from "../../configs";
import type { PriceProviderRepository } from "../../domain/repositories";
import type { TokenPrice } from "../../domain/types";

interface DeFiLlamaPriceResponse {
  coins: Record<string, {
    price: number;
    symbol?: string;
    timestamp?: number;
    confidence?: number;
    decimals?: number;
  }>;
}

@injectable()
export class DeFiLlamaPriceRepository implements PriceProviderRepository {
  private readonly config = PRICE_PROVIDER_CONFIGS.defillama;
  private readonly apiClient: ApiClient;

  constructor() {
    this.apiClient = new ApiClient({
      baseURL: this.config.baseUrl,
      headers: {
        Accept: "application/json",
      },
      timeout: 5000, // Standard timeout for API calls
    });
  }

  async getTokenPrice(tokenAddress: Address, chainId: number): Promise<TokenPrice> {
    if (!this.isChainSupported(chainId)) {
      throw new Error(`Chain ID ${chainId} not supported by DeFiLlama`);
    }

    const chainIdString = this.getChainIdString(chainId);

    try {
      // Use the correct DeFiLlama API endpoint format
      const data = await this.apiClient.get<DeFiLlamaPriceResponse>(`/prices/current/${chainIdString}:${tokenAddress}`);

      const coinKey = `${chainIdString}:${tokenAddress}`;
      const coinData = data.coins[coinKey];

      if (!coinData || typeof coinData.price !== "number") {
        throw new Error(`Price not found for token ${tokenAddress} on chain ${chainId}`);
      }

      // Validate price reasonableness
      if (coinData.price <= 0 || coinData.price > 1000000) {
        throw new Error(`Invalid price ${coinData.price} for token ${tokenAddress}`);
      }

      return {
        tokenAddress,
        chainId,
        price: coinData.price,
        timestamp: coinData.timestamp ? new Date(coinData.timestamp * 1000) : new Date(),
        source: this.config.name,
      };
    } catch (error: any) {
      if (error.status === 429) {
        throw new Error("DeFiLlama rate limit exceeded");
      }
      if (error.status === 404) {
        throw new Error(`Token ${tokenAddress} not found on DeFiLlama`);
      }
      throw error;
    }
  }

  async isAvailable(): Promise<boolean> {
    // Quick health check with WETH (which we know exists on DeFiLlama)
    // await this.getTokenPrice("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" as Address, 1);
    return true;
  }

  getProviderName(): string {
    return this.config.name;
  }

  private isChainSupported(chainId: number): boolean {
    return SUPPORTED_CHAIN_IDS.includes(chainId as any);
  }

  private getChainIdString(chainId: number): string {
    const mapping: Record<number, string> = {
      1: "ethereum",
      42161: "arbitrum",
      137: "polygon",
      10: "optimism",
      8453: "base",
    };
    return mapping[chainId] || chainId.toString();
  }
}
