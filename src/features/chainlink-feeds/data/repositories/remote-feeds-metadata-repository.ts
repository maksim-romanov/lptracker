import { injectable, inject } from "tsyringe";
import type { Address } from "viem";

import type { Logger, LoggerFactory } from "../../../../infrastructure/logging";
import { CHAINLINK_SUPPORTED_CHAINS, CHAINLINK_TOKEN_FEED_MAPPING, CHAINLINK_CONFIG } from "../../configs";
import type { FeedsMetadataRepository } from "../../domain/repositories";
import type { ChainlinkFeedsData, FeedLookupResult, FeedsCache } from "../../domain/types";

@injectable()
export class RemoteFeedsMetadataRepository implements FeedsMetadataRepository {
  private readonly logger: Logger;

  constructor(
    @inject("ChainlinkFeedsCache") private cache: FeedsCache,
    @inject("ChainlinkLoggerFactory") loggerFactory: LoggerFactory,
  ) {
    this.logger = loggerFactory.createLogger("RemoteFeedsMetadata");
  }

  async getFeedsData(): Promise<ChainlinkFeedsData> {
    const cacheKey = "chainlink-feeds-data";

    // Try to get from cache first
    const cached = this.cache.get<ChainlinkFeedsData>(cacheKey);
    if (cached) {
      this.logger.info("Using cached feeds data");
      return cached.data;
    }

    try {
      this.logger.info("Fetching feeds data from remote API...");
      const response = await fetch(CHAINLINK_CONFIG.api.feedsUrl);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ChainlinkFeedsData = await response.json();

      // Cache the data
      this.cache.set(cacheKey, data, CHAINLINK_CONFIG.api.cacheTtl);
      this.logger.info("Feeds data fetched and cached successfully");

      return data;
    } catch (error) {
      this.logger.error("Failed to fetch feeds data:", error);
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
      this.logger.warn(`No token mapping configured for chain ${chainId}`);
      return null;
    }

    const targetFeedName = tokenMapping[tokenAddress.toLowerCase()];
    if (!targetFeedName) {
      this.logger.warn(`No feed mapping found for token ${tokenAddress} on chain ${chainId}`);
      return null;
    }

    // Get feeds data (from cache or remote)
    const feedsData = await this.getFeedsData();
    const networkData = feedsData[networkName];

    if (!networkData) {
      this.logger.warn(`No feed data available for network ${networkName}`);
      return null;
    }

    // Find the specific feed
    const feed = networkData.feeds.find((feed) => feed.name === targetFeedName);
    if (!feed) {
      this.logger.warn(`Feed ${targetFeedName} not found for network ${networkName}`);
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
    this.logger.info("Feeds cache cleared, will refresh on next request");
  }
}
