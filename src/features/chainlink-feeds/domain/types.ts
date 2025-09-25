import type { Address } from "viem";

export interface ChainlinkPrice {
  tokenAddress: Address;
  chainId: number;
  price: number;
  decimals: number;
  roundId: bigint;
  updatedAt: Date;
  feedAddress: Address;
  feedName: string;
  source: "chainlink";
}

export interface ChainlinkFeed {
  name: string;
  proxyAddress: Address;
  feedCategory: "low" | "medium" | "high" | "hidden" | "custom" | "deprecating";
}

export interface ChainlinkFeedsData {
  [networkName: string]: {
    baseUrl: string;
    feeds: ChainlinkFeed[];
  };
}

export interface FeedLookupResult {
  feed: ChainlinkFeed;
  networkName: string;
  rpcUrl: string;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: Date;
  expiresAt: Date;
}

export interface FeedsCache {
  get<T>(key: string): CacheEntry<T> | undefined;
  set<T>(key: string, data: T, ttlMs: number): void;
  has(key: string): boolean;
  delete(key: string): boolean;
  clear(): void;
  cleanup(): void;
  size(): number;
}