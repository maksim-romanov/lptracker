import { injectable } from "tsyringe";
import type { Address } from "viem";

import type { FeedsMetadataRepository } from "../../domain/repositories";
import type { ChainlinkFeedsData, FeedLookupResult } from "../../domain/types";

@injectable()
export class HardcodedFeedsMetadataRepository implements FeedsMetadataRepository {
  // Hardcoded proven working feeds from uniswap-v4/test-price.ts
  private readonly hardcodedFeeds: ChainlinkFeedsData = {
    arbitrum: {
      baseUrl: "https://arb1.arbitrum.io/rpc", // Will be overridden by chain config
      feeds: [
        {
          name: "BTC/USD",
          proxyAddress: "0x6ce185860a4963106506C203335A2910413708e9",
          feedCategory: "low",
        },
        {
          name: "ETH/USD",
          proxyAddress: "0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612",
          feedCategory: "low",
        },
        {
          name: "USDC/USD",
          proxyAddress: "0x50834F3163758fcC1Df9973b6e91f0F0F0434aD3",
          feedCategory: "low",
        },
        {
          name: "GMX/USD",
          proxyAddress: "0xDB98056FecFff59D032aB628337A4887110df3dB",
          feedCategory: "medium",
        },
      ],
    },
  };

  // Chain ID to network mapping - focusing on Arbitrum first
  private readonly chainIdToNetwork: Record<number, string> = {
    42161: "arbitrum",
  };

  async getFeedsData(): Promise<ChainlinkFeedsData> {
    // Return hardcoded data - no network calls needed
    return this.hardcodedFeeds;
  }

  async findFeedByTokenAddress(tokenAddress: Address, chainId: number): Promise<FeedLookupResult | null> {
    const networkName = this.chainIdToNetwork[chainId];

    if (!networkName) {
      throw new Error(`Unsupported chain ID: ${chainId}`);
    }

    const networkData = this.hardcodedFeeds[networkName];
    if (!networkData) {
      return null;
    }

    // Token address to feed name mapping for Arbitrum (all lowercase for consistent lookup)
    const tokenMapping: Record<string, string> = {
      // Arbitrum token addresses to feed names
      "0x82af49447d8a07e3bd95bd0d56f35241523fbab1": "ETH/USD", // ARB_WETH
      "0xaf88d065e77c8cc2239327c5edb3a432268e5831": "USDC/USD", // ARB_USDC
      "0x62edc0692bd897d2295872a9ffcac5425011c661": "GMX/USD", // ARB_GMX
      // Add more mappings as needed
    };

    const targetFeedName = tokenMapping[tokenAddress.toLowerCase()];

    // If we have specific mapping, use it
    if (targetFeedName) {
      const feed = networkData.feeds.find((feed) => feed.name === targetFeedName);
      if (feed) {
        return {
          feed,
          networkName,
          rpcUrl: networkData.baseUrl, // Will be overridden by proper chain config
        };
      }
    }

    // No fallback - if we don't have a specific mapping for the token, return null
    // This ensures we only return accurate price data for supported tokens
    return null;
  }

  async refreshFeeds(): Promise<void> {
    // Nothing to refresh for hardcoded data
  }
}
