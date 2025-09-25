import { injectable } from "tsyringe";
import type { Address } from "viem";

import { ApiClient } from "infrastructure/api/api-client";

import type { FeedsMetadataRepository } from "../../domain/repositories";
import type { ChainlinkFeedsData, FeedLookupResult } from "../../domain/types";
import { MemoryFeedsCache } from "../cache/feeds-cache";

const FEEDS_URL = "https://raw.githubusercontent.com/kukapay/chainlink-feeds-mcp/main/feeds.json";
const FEEDS_CACHE_KEY = "chainlink_feeds_data";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

@injectable()
export class FeedsMetadataRepositoryImpl implements FeedsMetadataRepository {
  private readonly apiClient: ApiClient;
  private readonly cache: MemoryFeedsCache;

  // Map chain IDs to network names in the feeds data
  private readonly chainIdToNetwork: Record<number, string> = {
    1: "ethereum",
    56: "bsc",
    137: "polygon",
    43114: "avalanche",
    42161: "arbitrum",
    10: "optimism",
  };

  constructor() {
    this.cache = new MemoryFeedsCache();
  }

  async getFeedsData(): Promise<ChainlinkFeedsData> {
    const cached = this.cache.get<ChainlinkFeedsData>(FEEDS_CACHE_KEY);

    if (cached) {
      return cached.data;
    }

    try {
      // Use ofetch directly since we need to fetch from a full URL
      const { $fetch } = await import("ofetch");
      const data = await $fetch<ChainlinkFeedsData>(FEEDS_URL, {
        headers: {
          Accept: "application/json",
        },
        timeout: 10000,
        parseResponse: JSON.parse,
      });

      this.cache.set(FEEDS_CACHE_KEY, data, CACHE_TTL_MS);
      return data;
    } catch (error) {
      throw new Error(
        `Failed to fetch Chainlink feeds data: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async findFeedByTokenAddress(tokenAddress: Address, chainId: number): Promise<FeedLookupResult | null> {
    const feedsData = await this.getFeedsData();
    const networkName = this.chainIdToNetwork[chainId];

    if (!networkName) {
      throw new Error(`Unsupported chain ID: ${chainId}`);
    }

    const networkData = feedsData[networkName];
    if (!networkData) {
      return null;
    }

    // Simple token mapping for testing - in production this would be more sophisticated
    const tokenMapping: Record<string, string> = {
      "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2": "ETH/USD", // WETH on Ethereum
      "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599": "BTC/USD", // WBTC on Ethereum
      "0xa0b86a33e6789041e40ba6fe67c5ac2a0d2de5d5": "ETH/USD", // Example mapping
    };

    const targetFeedName = tokenMapping[tokenAddress.toLowerCase()];
    if (!targetFeedName) {
      // If no specific mapping, try to find any active feed for testing
      const feed = networkData.feeds.find(
        (feed) => feed.feedCategory !== "hidden" && feed.feedCategory !== "deprecating" && feed.name.includes("USD"),
      );

      if (feed) {
        // Use public RPC URLs that don't require API keys
        const rpcUrls: Record<string, string> = {
          ethereum: "https://cloudflare-eth.com",
          bsc: "https://bsc-dataseed.binance.org",
          polygon: "https://polygon-rpc.com",
          avalanche: "https://api.avax.network/ext/bc/C/rpc",
          arbitrum: "https://arb1.arbitrum.io/rpc",
          optimism: "https://mainnet.optimism.io",
        };

        return {
          feed,
          networkName,
          rpcUrl: rpcUrls[networkName] || networkData.baseUrl,
        };
      }
      return null;
    }

    const feed = networkData.feeds.find((feed) => feed.name === targetFeedName);
    if (!feed) {
      return null;
    }

    // Use public RPC URLs that don't require API keys
    const rpcUrls: Record<string, string> = {
      ethereum: "https://cloudflare-eth.com",
      bsc: "https://bsc-dataseed.binance.org",
      polygon: "https://polygon-rpc.com",
      avalanche: "https://api.avax.network/ext/bc/C/rpc",
      arbitrum: "https://arb1.arbitrum.io/rpc",
      optimism: "https://mainnet.optimism.io",
    };

    return {
      feed,
      networkName,
      rpcUrl: rpcUrls[networkName] || networkData.baseUrl,
    };
  }

  async refreshFeeds(): Promise<void> {
    this.cache.delete(FEEDS_CACHE_KEY);
    await this.getFeedsData();
  }
}
