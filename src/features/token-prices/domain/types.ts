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

export interface CacheEntry {
  data: TokenPrice;
  timestamp: Date;
  expiresAt: Date;
}

export interface PriceCache {
  get(key: string): CacheEntry | undefined;
  set(key: string, data: TokenPrice, ttlMs: number): void;
  has(key: string): boolean;
  delete(key: string): boolean;
  clear(): void;
  cleanup(): void;
  size(): number;
}
