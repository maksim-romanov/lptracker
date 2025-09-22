import { injectable } from "tsyringe";
import type { Address } from "viem";
import { toHex } from "viem";

import { SUPPORTED_CHAIN_IDS, PRICE_PROVIDER_CONFIGS } from "../../configs";
import type { PriceProviderRepository } from "../../domain/repositories";
import type { TokenPrice } from "../../domain/types";

interface MoralisResponse {
  usdPrice: number;
  usdPriceFormatted: string;
  "24hrPercentChange": string;
  exchangeAddress: string;
  exchangeName: string;
}

@injectable()
export class MoralisPriceRepository implements PriceProviderRepository {
  private readonly config = PRICE_PROVIDER_CONFIGS.moralis;

  async getTokenPrice(tokenAddress: Address, chainId: number): Promise<TokenPrice> {
    if (!this.config.apiKey) {
      throw new Error("Moralis API key not configured");
    }

    if (!this.isChainSupported(chainId)) {
      throw new Error(`Chain ID ${chainId} not supported by Moralis`);
    }

    const chainHex = toHex(chainId);
    const url = `${this.config.baseUrl}/erc20/${tokenAddress}/price?chain=${chainHex}`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "X-API-Key": this.config.apiKey,
      },
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("Moralis rate limit exceeded");
      }
      if (response.status === 401) {
        throw new Error("Moralis API key invalid");
      }
      throw new Error(`Moralis API error: ${response.status} ${response.statusText}`);
    }

    const data: MoralisResponse = await response.json();

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
      source: this.config.name,
    };
  }

  async isAvailable(): Promise<boolean> {
    // Return false if no API key configured, otherwise let main method handle errors
    return !!this.config.apiKey;
  }

  getProviderName(): string {
    return this.config.name;
  }

  private isChainSupported(chainId: number): boolean {
    return SUPPORTED_CHAIN_IDS.includes(chainId as any);
  }
}
