import type { Address } from "viem";

export interface TokenPrice {
  tokenAddress: Address;
  chainId: number;
  price: number;
  priceChange24h?: number;
  timestamp: Date;
  source: string;
}

export interface PriceProviderConfig {
  name: string;
  baseUrl: string;
  apiKey?: string;
  rateLimit?: {
    requestsPerMinute: number;
    requestsPerMonth?: number;
  };
}

export interface PriceProviderError {
  provider: string;
  error: Error;
  timestamp: Date;
}
