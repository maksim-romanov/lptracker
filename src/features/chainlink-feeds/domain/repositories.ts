import type { Address } from "viem";

import type { ChainlinkFeedsData, ChainlinkPrice, FeedLookupResult } from "./types";

export interface FeedsMetadataRepository {
  getFeedsData(): Promise<ChainlinkFeedsData>;
  findFeedByTokenAddress(tokenAddress: Address, chainId: number): Promise<FeedLookupResult | null>;
  refreshFeeds(): Promise<void>;
}

export interface BlockchainPriceRepository {
  getLatestPrice(
    feedAddress: Address,
    chainId: number,
  ): Promise<{
    price: bigint;
    decimals: number;
    roundId: bigint;
    updatedAt: bigint;
  }>;
  isContractValid(feedAddress: Address, chainId: number): Promise<boolean>;
}
