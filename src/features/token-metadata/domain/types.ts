import type { Address } from "viem";

export interface TokenMetadata {
  address: Address;
  chainId: number;
  name: string;
  symbol: string;
  decimals: number;
  logoUrl?: string;
  description?: string;
  website?: string;
  timestamp: Date;
  source: string;
}

export interface MetadataProviderConfig {
  name: string;
  baseUrl: string;
  apiKey?: string;
  rateLimit?: {
    requestsPerMinute: number;
    requestsPerMonth?: number;
  };
}

export interface MetadataProviderError {
  provider: string;
  error: Error;
  timestamp: Date;
}

export interface MetadataCacheEntry {
  data: TokenMetadata;
  timestamp: Date;
  expiresAt: Date;
}

export interface MetadataCache {
  get(key: string): MetadataCacheEntry | undefined;
  set(key: string, data: TokenMetadata, ttlMs: number): void;
  has(key: string): boolean;
  delete(key: string): boolean;
  clear(): void;
  cleanup(): void;
  size(): number;
}
