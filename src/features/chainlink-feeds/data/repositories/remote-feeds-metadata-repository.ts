import { injectable, inject } from "tsyringe";
import type { Address } from "viem";

import { CHAINLINK_SUPPORTED_CHAINS, CHAINLINK_TOKEN_FEED_MAPPING, CHAINLINK_CONFIG } from "../../configs";
import type { FeedsMetadataRepository } from "../../domain/repositories";
import type { ChainlinkFeedsData, FeedLookupResult, FeedsCache } from "../../domain/types";

@injectable()
export class RemoteFeedsMetadataRepository implements FeedsMetadataRepository {
  constructor(@inject("ChainlinkFeedsCache") private cache: FeedsCache) {}

  async getFeedsData(): Promise<ChainlinkFeedsData> {
    const cacheKey = "chainlink-feeds-data";

    // Try to get from cache first
    const cached = this.cache.get<ChainlinkFeedsData>(cacheKey);
    if (cached) {
      return cached.data;
    }

    try {
      const response = await fetch(CHAINLINK_CONFIG.api.feedsUrl);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ChainlinkFeedsData = await response.json();

      // Cache the data
      this.cache.set(cacheKey, data, CHAINLINK_CONFIG.api.cacheTtl);

      return data;
    } catch (error) {
      throw new Error(
        `Failed to fetch Chainlink feeds data: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async findFeedByTokenAddress(tokenAddress: Address, chainId: number): Promise<FeedLookupResult | null> {
    // Get network name from supported chains config
    const chainConfig = CHAINLINK_SUPPORTED_CHAINS[chainId as keyof typeof CHAINLINK_SUPPORTED_CHAINS];
    if (!chainConfig) {
      throw new Error(`Unsupported chain ID: ${chainId}`);
    }

    const networkName = chainConfig.name;

    // Get token-feed mapping for this chain
    const tokenMapping = CHAINLINK_TOKEN_FEED_MAPPING[chainId as keyof typeof CHAINLINK_TOKEN_FEED_MAPPING];
    if (!tokenMapping) {
      return null;
    }

    const targetFeedName = tokenMapping[tokenAddress.toLowerCase()];
    if (!targetFeedName) {
      return null;
    }

    // Get feeds data (from cache or remote)
    const feedsData = await this.getFeedsData();
    const networkData = feedsData[networkName];

    if (!networkData) {
      return null;
    }

    // Find the specific feed
    const feed = networkData.feeds.find((feed) => feed.name === targetFeedName);
    if (!feed) {
      return null;
    }

    return {
      feed,
      networkName,
      rpcUrl: networkData.baseUrl,
    };
  }

  async refreshFeeds(): Promise<void> {
    // Clear cache to force refresh on next request
    const cacheKey = "chainlink-feeds-data";
    this.cache.delete(cacheKey);
  }
}
