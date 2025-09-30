import type { Address } from "viem";
import { arbitrum, mainnet } from "viem/chains";

export interface TokenPrice {
  tokenAddress: Address;
  chainId: number;
  price: number;
  priceChange24h?: number;
  timestamp: Date;
  source: string;
}

// Supported chain IDs
export const SUPPORTED_CHAIN_IDS = [mainnet.id, arbitrum.id, 137, 10, 8453] as const;

export type SupportedChainId = (typeof SUPPORTED_CHAIN_IDS)[number];

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

// Circuit Breaker monitoring types
export interface CircuitBreakerStats {
  failures: number;
  successes: number;
  fires: number;
  timeouts: number;
  rejects: number;
  fallbacks: number;
  cacheHits: number;
  cacheMisses: number;
  coalesceCacheHits: number;
  coalesceCacheMisses: number;
  semaphoreRejections: number;
  percentiles: Record<string, number>;
  latencyTimes: number[];
  latencyMean: number;
}

export interface CircuitBreakerState {
  opened: boolean;
  halfOpen: boolean;
  closed: boolean;
  name: string;
  stats: CircuitBreakerStats;
}
